from decimal import Decimal
from app.domain.workloads.manifest import WorkloadManifest, ImageSpec, ResourceRequirements, ConstraintSpec
from app.domain.planning.candidate_evaluator import CandidateEvaluator


def test_candidate_evaluator_rejects_incompatible_gpu_and_ranks():
    manifest = WorkloadManifest(
        name="gpu-heavy-job",
        image=ImageSpec(uri="test/image:latest"),
        command=["python", "run.py"],
        resources=ResourceRequirements(
            gpu_count=1,
            gpu_memory_gb_min=80,
            preferred_models=["H100"]
        ),
        constraints=ConstraintSpec(
            allowed_regions=["us-east"],
            max_total_cost=Decimal("10.0000")
        )
    )

    candidates = [
        # Candidate 1: Perfect match (H100, 80GB VRAM, us-east, $3.20/hr)
        {
            "id": "c1",
            "provider_key": "provider-a",
            "region_key": "us-east",
            "gpu_model": "H100",
            "gpu_count": 1,
            "gpu_memory_gb": 80,
            "cpu_cores": 16,
            "ram_gb": 128,
            "storage_gb": 500,
            "price_per_hour": "3.2000",
            "currency": "USD",
            "freshness_status": "FRESH"
        },
        # Candidate 2: Incompatible VRAM (48GB < 80GB)
        {
            "id": "c2",
            "provider_key": "provider-b",
            "region_key": "us-east",
            "gpu_model": "L40S",
            "gpu_count": 1,
            "gpu_memory_gb": 48,
            "cpu_cores": 8,
            "ram_gb": 64,
            "storage_gb": 200,
            "price_per_hour": "1.2500",
            "currency": "USD",
            "freshness_status": "FRESH"
        },
        # Candidate 3: Disallowed region (eu-west not in ['us-east'])
        {
            "id": "c3",
            "provider_key": "provider-a",
            "region_key": "eu-west",
            "gpu_model": "H100",
            "gpu_count": 1,
            "gpu_memory_gb": 80,
            "cpu_cores": 16,
            "ram_gb": 128,
            "storage_gb": 500,
            "price_per_hour": "3.5000",
            "currency": "USD",
            "freshness_status": "FRESH"
        },
        # Candidate 4: Exceeds budget ceiling ($12.80 > $10.00)
        {
            "id": "c4",
            "provider_key": "provider-a",
            "region_key": "us-east",
            "gpu_model": "H100",
            "gpu_count": 4,
            "gpu_memory_gb": 80,
            "cpu_cores": 64,
            "ram_gb": 512,
            "storage_gb": 2000,
            "price_per_hour": "12.8000",
            "currency": "USD",
            "freshness_status": "FRESH"
        }
    ]

    results = CandidateEvaluator.evaluate_candidates(
        manifest=manifest,
        candidates_raw=candidates,
        estimated_runtime_seconds=3600
    )

    by_id = {r.offer_id: r for r in results}

    assert by_id["c1"].is_eligible is True
    assert by_id["c1"].rank == 1

    assert by_id["c2"].is_eligible is False
    assert any("HARDWARE_VRAM_UNMET" in reason for reason in by_id["c2"].rejection_reasons)

    assert by_id["c3"].is_eligible is False
    assert any("REGION_DISALLOWED" in reason for reason in by_id["c3"].rejection_reasons)

    assert by_id["c4"].is_eligible is False
    assert any("BUDGET_CEILING_EXCEEDED" in reason for reason in by_id["c4"].rejection_reasons)
