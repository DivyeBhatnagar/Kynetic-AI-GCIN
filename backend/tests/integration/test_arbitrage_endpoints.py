import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_arbitrage_lifecycle_end_to_end(client: AsyncClient):
    auth_headers = {
        "X-Org-ID": "org-arbitrage-test",
        "X-User-Role": "OWNER"
    }

    # 1. Setup Project & Workload
    proj_resp = await client.post(
        "/v1/projects",
        json={"name": "Arbitrage Project", "slug": "arb-proj"},
        headers=auth_headers
    )
    assert proj_resp.status_code == 201
    project_id = proj_resp.json()["id"]

    manifest_payload = {
        "schema_version": "1.0",
        "name": "long-running-training-arb",
        "workload_type": "batch_inference",
        "image": {
            "uri": "ghcr.io/kynetic/train:latest",
            "digest": "sha256:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f13a612023912"
        },
        "command": ["python", "train.py", "--steps", "100000"],
        "resources": {
            "gpu_count": 1,
            "gpu_memory_gb_min": 24,
            "cpu_cores_min": 8,
            "ram_gb_min": 32,
            "storage_gb_min": 50
        },
        "constraints": {
            "allowed_regions": ["eu-west"],
            "max_total_cost": "500.0000",
            "currency": "USD"
        },
        "tolerations": {
            "allow_spot": True,
            "max_restarts": 3
        }
    }

    workload_resp = await client.post(
        "/v1/workloads",
        json={"project_id": project_id, "manifest": manifest_payload},
        headers=auth_headers
    )
    assert workload_resp.status_code == 201
    workload_id = workload_resp.json()["id"]

    # 2. Plan and Launch original run
    plan_resp = await client.post(f"/v1/workloads/{workload_id}/plans", headers=auth_headers)
    assert plan_resp.status_code == 201
    plan_id = plan_resp.json()["id"]

    launch_resp = await client.post(
        f"/v1/plans/{plan_id}/launch",
        headers={**auth_headers, "Idempotency-Key": "launch-key-arb-001"}
    )
    assert launch_resp.status_code == 201
    run_id = launch_resp.json()["id"]

    # 3. Register a verified checkpoint
    cp_resp = await client.post(
        f"/v1/runs/{run_id}/checkpoints",
        json={
            "step_number": 20000,
            "format": "safetensors",
            "storage_uri": "s3://kynetic-weights/step-20000.safetensors",
            "size_bytes": 12000000000,
            "sha256_digest": "c" * 64,
            "framework_metadata": {
                "param_count_billions": 7.0,
                "dtype": "bfloat16",
                "optimizer": "adamw",
                "zero_stage": 2
            }
        },
        headers=auth_headers
    )
    assert cp_resp.status_code == 201
    checkpoint_id = cp_resp.json()["id"]

    # 4. Scan for Arbitrage Opportunities
    scan_payload = {
        "min_savings_percent": "0.00",
        "min_savings_usd": "0.00",
        "max_downtime_seconds": 900,
        "preemption_risk_tolerance": "0.500",
        "min_run_duration_seconds": 0
    }

    scan_resp = await client.post(
        f"/v1/runs/{run_id}/arbitrage/scan",
        json=scan_payload,
        headers=auth_headers
    )
    assert scan_resp.status_code == 200
    opportunities = scan_resp.json()
    assert len(opportunities) >= 1

    # Find the top eligible opportunity
    top_opp = next(o for o in opportunities if o["is_eligible"])
    opportunity_id = top_opp["id"]
    assert top_opp["run_id"] == run_id
    assert float(top_opp["current_hourly_cost"]) > 0
    assert float(top_opp["target_hourly_cost"]) > 0

    # 5. List Opportunities for this Run
    list_resp = await client.get(
        f"/v1/runs/{run_id}/arbitrage/opportunities",
        headers=auth_headers
    )
    assert list_resp.status_code == 200
    assert any(o["id"] == opportunity_id for o in list_resp.json())

    # 6. Approve Opportunity
    approve_resp = await client.post(
        f"/v1/arbitrage/opportunities/{opportunity_id}/approve",
        json={"decision": "APPROVE", "reason": "Significant cost reduction verified"},
        headers=auth_headers
    )
    assert approve_resp.status_code == 200, f"Approve error: {approve_resp.text}, Opp: {top_opp}"
    assert approve_resp.json()["status"] == "APPROVED"

    # 7. Execute Migration
    exec_resp = await client.post(
        f"/v1/arbitrage/opportunities/{opportunity_id}/execute",
        json={"idempotency_key": "migrate-key-arb-100"},
        headers=auth_headers
    )
    assert exec_resp.status_code == 201
    exec_data = exec_resp.json()
    resumed_run_id = exec_data["resumed_run_id"]
    assert exec_data["status"] == "EXECUTED"
    assert exec_data["original_run_id"] == run_id

    # 8. Test Idempotent Execution
    repeat_exec = await client.post(
        f"/v1/arbitrage/opportunities/{opportunity_id}/execute",
        json={"idempotency_key": "migrate-key-arb-100"},
        headers=auth_headers
    )
    assert repeat_exec.status_code == 200
    assert repeat_exec.json()["resumed_run_id"] == resumed_run_id

    # 9. Verify Original Run is CANCELED and Resumed Run is PROVISIONING
    orig_run_resp = await client.get(f"/v1/runs/{run_id}", headers=auth_headers)
    assert orig_run_resp.status_code == 200
    assert orig_run_resp.json()["status"] == "CANCELED"

    resumed_run_resp = await client.get(f"/v1/runs/{resumed_run_id}", headers=auth_headers)
    assert resumed_run_resp.status_code == 200
    assert resumed_run_resp.json()["status"] == "PROVISIONING"
    assert any(e["reason_code"] == "ARBITRAGE_MIGRATION" for e in resumed_run_resp.json()["state_events"])
