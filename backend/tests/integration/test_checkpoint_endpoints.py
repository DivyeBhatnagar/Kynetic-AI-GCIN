import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_checkpoint_lifecycle_and_resumption_end_to_end(client: AsyncClient):
    auth_headers = {
        "X-Org-ID": "org-checkpoint-test",
        "X-User-Role": "OWNER"
    }

    # 1. Setup Project & Workload
    proj_resp = await client.post(
        "/v1/projects",
        json={"name": "Checkpoint Project", "slug": "cp-proj"},
        headers=auth_headers
    )
    assert proj_resp.status_code == 201
    project_id = proj_resp.json()["id"]

    manifest_payload = {
        "schema_version": "1.0",
        "name": "fine-tune-llama3-checkpointed",
        "workload_type": "batch_inference",
        "image": {
            "uri": "ghcr.io/kynetic/llama3:latest",
            "digest": "sha256:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f13a612023912"
        },
        "command": ["python", "train.py", "--epochs", "10"],
        "resources": {
            "gpu_count": 1,
            "gpu_memory_gb_min": 48,
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
        headers={**auth_headers, "Idempotency-Key": "launch-key-cp-001"}
    )
    assert launch_resp.status_code == 201
    run_id = launch_resp.json()["id"]

    # 3. Register Checkpoint during training
    cp_payload = {
        "step_number": 5000,
        "epoch": 2,
        "format": "safetensors",
        "storage_uri": "s3://kynetic-model-weights/llama3/step-5000.safetensors",
        "size_bytes": 16000000000,
        "sha256_digest": "a" * 64,
        "framework_metadata": {
            "param_count_billions": 8.0,
            "dtype": "bfloat16",
            "optimizer": "adamw",
            "zero_stage": 2
        }
    }

    cp_resp = await client.post(
        f"/v1/runs/{run_id}/checkpoints",
        json=cp_payload,
        headers=auth_headers
    )
    assert cp_resp.status_code == 201
    cp_data = cp_resp.json()
    checkpoint_id = cp_data["id"]
    assert cp_data["step_number"] == 5000
    assert cp_data["is_verified"] is True
    assert cp_data["verification_status"] == "VERIFIED"

    # 4. List Checkpoints for Run
    list_resp = await client.get(
        f"/v1/runs/{run_id}/checkpoints",
        headers=auth_headers
    )
    assert list_resp.status_code == 200
    checkpoints = list_resp.json()
    assert len(checkpoints) == 1
    assert checkpoints[0]["id"] == checkpoint_id

    # 5. Retrieve Checkpoint Detail
    detail_resp = await client.get(
        f"/v1/checkpoints/{checkpoint_id}",
        headers=auth_headers
    )
    assert detail_resp.status_code == 200
    assert detail_resp.json()["sha256_digest"] == "a" * 64

    # 6. Deep Verify Checkpoint
    verify_resp = await client.post(
        f"/v1/checkpoints/{checkpoint_id}/verify",
        headers=auth_headers
    )
    assert verify_resp.status_code == 200
    verify_report = verify_resp.json()
    assert verify_report["overall_status"] == "VERIFIED"
    assert verify_report["is_verified"] is True
    assert float(verify_report["estimated_vram_requirement_gb"]) > 0

    # 7. Estimate Cross-Cloud Migration Transfer
    transfer_payload = {
        "source_provider_code": "AWS",
        "target_provider_code": "LAMBDA",
        "network_bandwidth_gbps": "10.0"
    }
    est_resp = await client.post(
        f"/v1/checkpoints/{checkpoint_id}/estimate-transfer",
        json=transfer_payload,
        headers=auth_headers
    )
    assert est_resp.status_code == 200
    est_data = est_resp.json()
    assert float(est_data["estimated_egress_cost_usd"]) > 0
    assert est_data["source_provider"] == "AWS"
    assert est_data["target_provider"] == "LAMBDA"

    # 8. Get Compute Offers to find a target H100
    offers_resp = await client.get("/v1/compute-offers", headers=auth_headers)
    offers = offers_resp.json()
    h100_offer = next(o for o in offers if o["gpu_model"] == "H100")

    # 9. Resume Run from Checkpoint
    resume_payload = {
        "target_compute_offer_id": h100_offer["id"],
        "idempotency_key": "resumption-key-999",
        "reason": "Resuming training on cost-effective H100 node"
    }

    resume_resp = await client.post(
        f"/v1/checkpoints/{checkpoint_id}/resume",
        json=resume_payload,
        headers=auth_headers
    )
    assert resume_resp.status_code == 201, f"Response: {resume_resp.text}"
    resume_data = resume_resp.json()
    resumed_run_id = resume_data["new_run_id"]
    assert resume_data["resumed_from_run_id"] == run_id
    assert resume_data["resumed_from_checkpoint_id"] == checkpoint_id
    assert resume_data["step_number"] == 5000
    assert resume_data["status"] == "PROVISIONING"

    # 10. Verify Resumption Idempotency
    resume_repeat = await client.post(
        f"/v1/checkpoints/{checkpoint_id}/resume",
        json=resume_payload,
        headers=auth_headers
    )
    assert resume_repeat.status_code == 201
    assert resume_repeat.json()["new_run_id"] == resumed_run_id

    # 11. Inspect Resumed Run via Runs API
    resumed_run_resp = await client.get(f"/v1/runs/{resumed_run_id}", headers=auth_headers)
    assert resumed_run_resp.status_code == 200
    resumed_run_detail = resumed_run_resp.json()
    assert resumed_run_detail["id"] == resumed_run_id
    assert len(resumed_run_detail["state_events"]) >= 1
    assert resumed_run_detail["state_events"][0]["reason_code"] == "RESUMPTION_FROM_CHECKPOINT"

    # 12. Security: Cross-Tenant Isolation check
    wrong_org_headers = {
        "X-Org-ID": "org-attacker-tenant",
        "X-User-Role": "OWNER"
    }
    cross_org_resp = await client.get(
        f"/v1/checkpoints/{checkpoint_id}",
        headers=wrong_org_headers
    )
    assert cross_org_resp.status_code == 403

    # 13. OOM Protection: Rejection on under-provisioned target GPU
    l40s_offer = next(o for o in offers if o["gpu_model"] == "L40S")
    # Register a massive 70B model checkpoint with zero_stage=0 (requires ~1000 GB VRAM)
    huge_cp_resp = await client.post(
        f"/v1/runs/{run_id}/checkpoints",
        json={
            "step_number": 9000,
            "format": "safetensors",
            "storage_uri": "s3://kynetic-weights/llama3-70b/step-9000.safetensors",
            "size_bytes": 140000000000,
            "sha256_digest": "b" * 64,
            "framework_metadata": {
                "param_count_billions": 70.0,
                "dtype": "bfloat16",
                "optimizer": "adamw",
                "zero_stage": 0
            }
        },
        headers=auth_headers
    )
    assert huge_cp_resp.status_code == 201
    huge_checkpoint_id = huge_cp_resp.json()["id"]

    oom_resume_resp = await client.post(
        f"/v1/checkpoints/{huge_checkpoint_id}/resume",
        json={
            "target_compute_offer_id": l40s_offer["id"],
            "idempotency_key": "resumption-oom-key-001",
            "reason": "Test OOM guard"
        },
        headers=auth_headers
    )
    # Must reject with 400 Bad Request to prevent runtime CUDA Out of Memory crash
    assert oom_resume_resp.status_code == 400
    assert "insufficient VRAM" in oom_resume_resp.json()["detail"]

