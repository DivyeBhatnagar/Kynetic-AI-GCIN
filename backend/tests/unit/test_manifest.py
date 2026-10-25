import pytest
from decimal import Decimal
from pydantic import ValidationError
from app.domain.workloads.manifest import WorkloadManifest, ImageSpec, ResourceRequirements, ConstraintSpec


def test_valid_manifest_creation_and_digest():
    manifest = WorkloadManifest(
        name="batch-inference-job",
        image=ImageSpec(uri="ghcr.io/kynetic/inference:1.0.0"),
        command=["python", "infer.py", "--batch-size", "64"],
        resources=ResourceRequirements(
            gpu_count=1,
            gpu_memory_gb_min=80,
            preferred_models=["H100"],
            cpu_cores_min=8,
            ram_gb_min=32,
            storage_gb_min=100
        ),
        constraints=ConstraintSpec(
            allowed_regions=["us-east"],
            max_total_cost=Decimal("50.0000")
        )
    )

    digest = manifest.compute_digest()
    assert digest.startswith("sha256:")
    assert len(digest) == 71

    fingerprint = manifest.derive_fingerprint()
    assert fingerprint["gpu_count"] == 1
    assert fingerprint["gpu_memory_gb_min"] == 80
    assert fingerprint["workload_type"] == "batch_inference"


def test_manifest_rejects_inline_secrets():
    """Security check: Environment variables with secret keywords must be rejected."""
    with pytest.raises(ValidationError) as exc:
        WorkloadManifest(
            name="unsafe-workload",
            image=ImageSpec(uri="ubuntu:latest"),
            command=["echo", "test"],
            resources=ResourceRequirements(gpu_count=0),
            environment={"OPENAI_API_KEY": "sk-1234567890"}
        )
    assert "Suspicious secret variable" in str(exc.value)


def test_manifest_gpu_requires_vram():
    """Semantic check: When gpu_count > 0, minimum VRAM must be specified."""
    with pytest.raises(ValidationError) as exc:
        WorkloadManifest(
            name="invalid-gpu-spec",
            image=ImageSpec(uri="ubuntu:latest"),
            command=["echo", "test"],
            resources=ResourceRequirements(gpu_count=2, gpu_memory_gb_min=None)
        )
    assert "gpu_memory_gb_min must be specified" in str(exc.value)
