from decimal import Decimal
from app.domain.workloads.manifest import WorkloadManifest, ImageSpec, ResourceRequirements, ConstraintSpec
from app.domain.common import Currency
from app.domain.digital_twin.predictor import DigitalTwinPredictor


def create_sample_manifest(workload_type: str = "batch_inference") -> WorkloadManifest:
    return WorkloadManifest(
        name="test-batch-workload",
        workload_type=workload_type,
        image=ImageSpec(uri="test/infer:latest"),
        command=["python", "infer.py"],
        resources=ResourceRequirements(
            gpu_count=1,
            gpu_memory_gb_min=80,
            preferred_models=["H100"]
        ),
        constraints=ConstraintSpec(max_total_cost=Decimal("50.0000")),
        execution={"timeout_seconds": 3600}
    )


def test_predictor_exact_benchmark_match():
    manifest = create_sample_manifest()
    benchmarks = [
        {
            "workload_type": "batch_inference",
            "hardware_model": "H100",
            "hardware_gpu_count": 1,
            "sample_count": 5,
            "measurements": {
                "duration_seconds": 1200,
                "variance_ratio": "0.05",
                "throughput_samples_per_second": "150.0"
            }
        }
    ]

    pred = DigitalTwinPredictor.predict(
        manifest=manifest,
        hardware_model="H100",
        hardware_gpu_count=1,
        hardware_vram_gb=80,
        price_per_hour=Decimal("3.2000"),
        currency=Currency.USD,
        benchmarks=benchmarks
    )

    assert pred.predicted_runtime_seconds == 1200
    assert pred.is_out_of_distribution is False
    assert pred.confidence_score >= Decimal("0.850")
    assert pred.runtime_interval["low"] < 1200
    assert pred.runtime_interval["high"] > 1200
    assert any("Derived directly from" in a for a in pred.assumptions)


def test_predictor_cross_hardware_scaling():
    manifest = create_sample_manifest()
    # Benchmark exists only for A100 (relative compute index 0.45)
    # We want prediction on H100 (relative compute index 1.00)
    benchmarks = [
        {
            "workload_type": "batch_inference",
            "hardware_model": "A100",
            "hardware_gpu_count": 1,
            "sample_count": 2,
            "measurements": {
                "duration_seconds": 2400,
                "variance_ratio": "0.10"
            }
        }
    ]

    pred = DigitalTwinPredictor.predict(
        manifest=manifest,
        hardware_model="H100",
        hardware_gpu_count=1,
        hardware_vram_gb=80,
        price_per_hour=Decimal("3.2000"),
        currency=Currency.USD,
        benchmarks=benchmarks
    )

    # Faster on H100 than A100 (speedup ~ 1.0 / 0.45 = 2.22x)
    assert pred.predicted_runtime_seconds < 2400
    assert pred.is_out_of_distribution is False
    assert pred.confidence_score == Decimal("0.720")
    assert any("Scaled from empirical benchmark" in a for a in pred.assumptions)


def test_predictor_out_of_distribution_warning():
    manifest = create_sample_manifest(workload_type="unseen_genetic_algorithm")
    # Empty benchmark registry
    pred = DigitalTwinPredictor.predict(
        manifest=manifest,
        hardware_model="H100",
        hardware_gpu_count=1,
        hardware_vram_gb=80,
        price_per_hour=Decimal("3.2000"),
        currency=Currency.USD,
        benchmarks=[]
    )

    assert pred.is_out_of_distribution is True
    assert pred.confidence_score == Decimal("0.350")
    assert any("OUT_OF_DISTRIBUTION" in w for w in pred.warnings)
