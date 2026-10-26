import json
import pytest
from datetime import datetime, timezone

AUTH_HEADERS = {
    "X-User-ID": "usr-worker-test",
    "X-Organization-ID": "org-worker-test",
    "X-User-Role": "ADMIN"
}


async def _create_test_run(client, auth_headers=AUTH_HEADERS) -> str:
    """Helper to provision a project, workload, plan, and launched run in test DB."""
    # 1. Project
    proj_resp = await client.post(
        "/v1/projects",
        json={"name": "Worker Streaming Project", "slug": f"ws-proj-{datetime.now().timestamp()}"},
        headers=auth_headers
    )
    assert proj_resp.status_code == 201
    project_id = proj_resp.json()["id"]

    # 2. Workload
    manifest_payload = {
        "schema_version": "1.0",
        "name": "llama3-streaming-eval",
        "workload_type": "batch_inference",
        "image": {
            "uri": "ghcr.io/kynetic/llama3:latest",
            "digest": "sha256:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f13a612023912"
        },
        "command": ["python", "eval.py"],
        "resources": {
            "gpu_count": 1,
            "gpu_memory_gb_min": 24,
            "cpu_cores_min": 8,
            "ram_gb_min": 32,
            "storage_gb_min": 50
        },
        "constraints": {
            "allowed_regions": ["us-east", "us-west"],
            "max_total_cost": "250.0000",
            "currency": "USD"
        },
        "tolerations": {
            "allow_spot": True,
            "max_restarts": 3
        }
    }
    wl_resp = await client.post(
        "/v1/workloads",
        json={"project_id": project_id, "manifest": manifest_payload},
        headers=auth_headers
    )
    assert wl_resp.status_code == 201
    workload_id = wl_resp.json()["id"]

    # 3. Plan
    plan_resp = await client.post(f"/v1/workloads/{workload_id}/plans", headers=auth_headers)
    assert plan_resp.status_code == 201
    plan_id = plan_resp.json()["id"]

    # 4. Launch Run
    launch_headers = {**auth_headers, "Idempotency-Key": f"idem-stream-{datetime.now().timestamp()}"}
    launch_resp = await client.post(
        f"/v1/plans/{plan_id}/launch",
        headers=launch_headers
    )
    assert launch_resp.status_code == 201
    return launch_resp.json()["id"]


@pytest.mark.asyncio
async def test_worker_trigger_endpoint(client):
    """Verifies on-demand background worker execution via API."""
    response = await client.post(
        "/v1/worker/trigger-job",
        json={"job_name": "all"},
        headers=AUTH_HEADERS,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["job_name"] == "all"
    assert "result" in data
    assert data["result"]["sync"]["status"] == "SUCCESS"
    assert data["result"]["arbitrage"]["status"] == "SUCCESS"
    assert data["result"]["costs"]["status"] == "SUCCESS"


@pytest.mark.asyncio
async def test_sse_run_telemetry_stream(client):
    """Verifies Server-Sent Events (SSE) telemetry stream on active run."""
    run_id = await _create_test_run(client)

    # Open SSE stream and read initial chunks
    async with client.stream("GET", f"/v1/runs/{run_id}/stream?limit=2&interval_seconds=0.01", headers=AUTH_HEADERS) as stream_res:
        assert stream_res.status_code == 200
        assert "text/event-stream" in stream_res.headers.get("content-type", "")

        events_received = []
        async for line in stream_res.aiter_lines():
            if line.startswith("data:"):
                payload_str = line[5:].strip()
                parsed = json.loads(payload_str)
                events_received.append(parsed)
                if len(events_received) >= 2:
                    break

        assert len(events_received) >= 2
        # First event is handshake
        assert events_received[0]["run_id"] == run_id
        # Second event is telemetry payload
        assert "sm_utilization_pct" in events_received[1]
        assert "vram_used_gb" in events_received[1]
        assert "power_draw_watts" in events_received[1]


@pytest.mark.asyncio
async def test_sse_stream_unauthorized_tenant(client):
    """Guards against cross-tenant unauthorized telemetry streaming."""
    run_id = await _create_test_run(client)

    attacker_headers = {
        "X-User-ID": "usr-attacker",
        "X-Organization-ID": "org-attacker-tenant",
        "X-User-Role": "ADMIN"
    }

    resp = await client.get(f"/v1/runs/{run_id}/stream", headers=attacker_headers)
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_websocket_dashboard_mesh_channel():
    """Verifies global Mission Control dashboard mesh WebSocket broadcast."""
    from starlette.testclient import TestClient
    from app.main import app

    with TestClient(app) as test_client:
        with test_client.websocket_connect("/v1/ws/dashboard") as ws:
            init_msg = ws.receive_json()
            assert init_msg["event"] == "connected"
            assert init_msg["channel"] == "dashboard_mesh"

            mesh_update = ws.receive_json()
            assert mesh_update["event"] == "mesh_update"
            assert "active_runs" in mesh_update
            assert "total_offers" in mesh_update
