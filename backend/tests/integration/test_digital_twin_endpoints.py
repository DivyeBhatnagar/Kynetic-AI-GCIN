import pytest
from decimal import Decimal
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_digital_twin_lifecycle_end_to_end(client: AsyncClient):
    auth_headers = {
        "X-Org-ID": "org-dt-test",
        "X-User-Role": "OWNER"
    }

    # 1. Register an empirical benchmark in the Benchmark Registry
    bench_payload = {
        "benchmark_suite_version": "kynetic-bench-2.0",
        "workload_type": "batch_inference",
        "hardware_model": "H100",
        "hardware_gpu_count": 1,
        "hardware_vram_gb": 80,
        "workload_fingerprint": {"batch_size": 32, "sequence_length": 512},
        "measurements": {
            "duration_seconds": 1500,
            "throughput_samples_per_second": "210.5",
            "gpu_memory_peak_gb": "58.2",
            "gpu_utilization_mean_percent": "94.5",
            "variance_ratio": "0.06"
        },
        "provenance": {"environment": "test-cluster", "driver": "550.54.14"},
        "sample_count": 5
    }

    bench_resp = await client.post(
        "/v1/benchmarks",
        json=bench_payload,
        headers=auth_headers
    )
    assert bench_resp.status_code == 201
    bench_data = bench_resp.json()
    assert bench_data["hardware_model"] == "H100"
    assert bench_data["sample_count"] == 5

    # 2. Query Benchmark Registry
    list_bench_resp = await client.get(
        "/v1/benchmarks?workload_type=batch_inference",
        headers=auth_headers
    )
    assert list_bench_resp.status_code == 200
    assert len(list_bench_resp.json()) >= 1

    # 3. Create Project and Workload
    proj_resp = await client.post(
        "/v1/projects",
        json={"name": "DT Project", "slug": "dt-proj"},
        headers=auth_headers
    )
    assert proj_resp.status_code == 201
    project_id = proj_resp.json()["id"]

    workload_resp = await client.post(
        "/v1/workloads",
        json={
            "project_id": project_id,
            "manifest": {
                "name": "dt-inference-run",
                "workload_type": "batch_inference",
                "image": {"uri": "test/dt:1.0"},
                "command": ["python", "run.py"],
                "resources": {
                    "gpu_count": 1,
                    "gpu_memory_gb_min": 80
                }
            }
        },
        headers=auth_headers
    )
    assert workload_resp.status_code == 201
    workload_id = workload_resp.json()["id"]

    # 4. Request Digital Twin Performance & Cost Prediction
    pred_resp = await client.post(
        f"/v1/workloads/{workload_id}/predict",
        json={
            "compute_offer_id": "offer-sim-h100-us-east",
            "price_per_hour": "3.2000",
            "currency": "USD"
        },
        headers=auth_headers
    )
    assert pred_resp.status_code == 201
    pred_data = pred_resp.json()
    prediction_id = pred_data["id"]

    assert pred_data["predicted_runtime_seconds"] == 1500
    assert pred_data["runtime_interval"]["low"] < 1500
    assert pred_data["runtime_interval"]["high"] > 1500
    assert Decimal(str(pred_data["confidence_score"])) >= Decimal("0.850")
    assert pred_data["is_out_of_distribution"] is False

    # 5. Query Prediction History for Workload
    history_resp = await client.get(
        f"/v1/workloads/{workload_id}/prediction-history",
        headers=auth_headers
    )
    assert history_resp.status_code == 200
    assert len(history_resp.json()) >= 1
    assert history_resp.json()[0]["id"] == prediction_id

    # 6. Generate Plan & Launch Run
    plan_resp = await client.post(
        f"/v1/workloads/{workload_id}/plans",
        headers=auth_headers
    )
    plan_id = plan_resp.json()["id"]

    launch_resp = await client.post(
        f"/v1/plans/{plan_id}/launch",
        headers={**auth_headers, "Idempotency-Key": "idemp-dt-run-001"}
    )
    assert launch_resp.status_code == 201
    run_id = launch_resp.json()["id"]

    # 7. Record Actual Run Outcome Against Prediction
    outcome_resp = await client.post(
        f"/v1/predictions/{prediction_id}/outcome",
        json={
            "run_id": run_id,
            "actual_runtime_seconds": 1540,
            "actual_cost": "3.2000",
            "actual_throughput": "205.0"
        },
        headers=auth_headers
    )
    assert outcome_resp.status_code == 201
    outcome_data = outcome_resp.json()
    assert outcome_data["prediction_id"] == prediction_id
    assert outcome_data["within_confidence_interval"] is True
    # Error: abs(1540 - 1500) / 1540 * 100 = 40 / 1540 * 100 = 2.60%
    assert Decimal(str(outcome_data["runtime_error_percent"])) < Decimal("5.00")
