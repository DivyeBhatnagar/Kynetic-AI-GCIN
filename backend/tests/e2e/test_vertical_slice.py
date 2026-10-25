import pytest
from decimal import Decimal
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_full_vertical_slice_end_to_end(client: AsyncClient):
    auth_headers = {
        "X-Org-ID": "org-prod-001",
        "X-User-Role": "OWNER",
        "X-Request-ID": "req-e2e-test-12345"
    }

    # 1. Health & Readiness check
    health_resp = await client.get("/health/live")
    assert health_resp.status_code == 200
    assert health_resp.json()["status"] == "alive"

    ready_resp = await client.get("/health/ready")
    assert ready_resp.status_code == 200
    assert ready_resp.json()["status"] == "ready"

    # 2. Create Project
    proj_resp = await client.post(
        "/v1/projects",
        json={
            "name": "Speech Synthesis Production",
            "slug": "speech-synth-prod",
            "max_job_cost": "100.0000",
            "allowed_regions": ["us-east", "us-west"]
        },
        headers=auth_headers
    )
    assert proj_resp.status_code == 201
    project_data = proj_resp.json()
    project_id = project_data["id"]
    assert project_data["slug"] == "speech-synth-prod"

    # 3. Validate Workload Manifest
    manifest_payload = {
        "schema_version": "1.0",
        "name": "fastspeech-inference-batch",
        "workload_type": "batch_inference",
        "image": {
            "uri": "ghcr.io/kynetic/fastspeech:2.1.0",
            "digest": "sha256:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f13a612023912"
        },
        "command": ["python", "synthesize.py", "--input", "prompts.txt"],
        "resources": {
            "gpu_count": 1,
            "gpu_memory_gb_min": 48,
            "cpu_cores_min": 8,
            "ram_gb_min": 32,
            "storage_gb_min": 100
        },
        "constraints": {
            "allowed_regions": ["us-east", "us-west"],
            "max_total_cost": "50.0000",
            "currency": "USD"
        },
        "execution": {
            "timeout_seconds": 7200,
            "retry_limit": 1
        }
    }

    val_resp = await client.post(
        "/v1/workloads/validate-manifest",
        json=manifest_payload,
        headers=auth_headers
    )
    assert val_resp.status_code == 200
    val_data = val_resp.json()
    assert val_data["valid"] is True
    assert val_data["manifest_digest"].startswith("sha256:")

    # 4. Create Workload & Immutable Revision
    workload_resp = await client.post(
        "/v1/workloads",
        json={"project_id": project_id, "manifest": manifest_payload},
        headers=auth_headers
    )
    assert workload_resp.status_code == 201
    workload_data = workload_resp.json()
    workload_id = workload_data["id"]
    assert workload_data["name"] == "fastspeech-inference-batch"
    assert workload_data["current_revision"]["revision_number"] == 1

    # 5. Generate Dry-Run Plan
    plan_resp = await client.post(
        f"/v1/workloads/{workload_id}/plans",
        headers=auth_headers
    )
    assert plan_resp.status_code == 201
    plan_data = plan_resp.json()
    plan_id = plan_data["id"]
    assert plan_data["status"] in ["READY", "AWAITING_APPROVAL"]
    assert Decimal(str(plan_data["estimated_total_cost"])) > Decimal("0")
    assert plan_data["selected_candidate"] is not None
    assert plan_data["selected_candidate"]["rank"] == 1

    # 6. Launch Run from Plan with Idempotency Key
    idempotency_key = "idemp-vertical-slice-run-001"
    launch_headers = {**auth_headers, "Idempotency-Key": idempotency_key}

    launch_resp = await client.post(
        f"/v1/plans/{plan_id}/launch",
        headers=launch_headers
    )
    assert launch_resp.status_code == 201
    run_data = launch_resp.json()
    run_id = run_data["id"]
    assert run_data["status"] == "RUNNING"
    assert run_data["provider_resource_id"] is not None
    assert len(run_data["state_events"]) >= 2

    # 7. Test Idempotent Duplicate Launch (Same Idempotency-Key returns existing run)
    dup_launch_resp = await client.post(
        f"/v1/plans/{plan_id}/launch",
        headers=launch_headers
    )
    assert dup_launch_resp.status_code == 200
    assert dup_launch_resp.json()["id"] == run_id

    # 8. Check Run Logs
    logs_resp = await client.get(
        f"/v1/runs/{run_id}/logs",
        headers=auth_headers
    )
    assert logs_resp.status_code == 200
    logs_data = logs_resp.json()
    assert len(logs_data["lines"]) >= 3

    # 9. Cost Ledger Verification & Usage Reconciliation
    cost_resp = await client.get(
        f"/v1/runs/{run_id}/cost",
        headers=auth_headers
    )
    assert cost_resp.status_code == 200
    cost_data = cost_resp.json()
    assert Decimal(str(cost_data["estimated_cost"])) > Decimal("0")
    assert Decimal(str(cost_data["accrued_cost"])) == Decimal("0")

    # Reconcile actual usage
    reconcile_resp = await client.post(
        f"/v1/runs/{run_id}/reconcile?actual_amount=4.8500",
        headers=auth_headers
    )
    assert reconcile_resp.status_code == 200
    reconciled_cost_data = reconcile_resp.json()
    assert Decimal(str(reconciled_cost_data["accrued_cost"])) == Decimal("4.8500")
    # Original estimate is preserved!
    assert Decimal(str(reconciled_cost_data["estimated_cost"])) == Decimal(str(cost_data["estimated_cost"]))

    # 10. Cancel Run Gracefully
    cancel_resp = await client.post(
        f"/v1/runs/{run_id}/cancel",
        headers=auth_headers
    )
    assert cancel_resp.status_code == 200
    cancelled_data = cancel_resp.json()
    assert cancelled_data["status"] == "CANCELED"
