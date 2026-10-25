from decimal import Decimal
from app.domain.checkpoints.verifier import CheckpointVerifier, compute_required_vram_gb


def test_vram_requirement_calculation_zero_stages():
    # 7B model in bfloat16 (14 GB base weights) + AdamW (84 GB optimizer) with no ZeRO
    vram_no_zero = compute_required_vram_gb({
        "param_count_billions": 7.0,
        "dtype": "bfloat16",
        "optimizer": "adamw",
        "zero_stage": 0
    })
    # ZeRO Stage 2 partitions optimizer states + gradients
    vram_zero_2 = compute_required_vram_gb({
        "param_count_billions": 7.0,
        "dtype": "bfloat16",
        "optimizer": "adamw",
        "zero_stage": 2
    })
    # ZeRO Stage 3 partitions weights + optimizer + gradients
    vram_zero_3 = compute_required_vram_gb({
        "param_count_billions": 7.0,
        "dtype": "bfloat16",
        "optimizer": "adamw",
        "zero_stage": 3
    })

    assert vram_no_zero > vram_zero_2 > vram_zero_3
    # ZeRO-3 for 7B should comfortably fit under 40 GB VRAM
    assert vram_zero_3 < Decimal("40.0")


def test_checkpoint_verifier_valid_safetensors():
    report = CheckpointVerifier.verify(
        checkpoint_id="cp-12345",
        storage_uri="s3://kynetic-weights-us-east/llama3-8b/step-5000.safetensors",
        format_type="safetensors",
        size_bytes=16_000_000_000,
        sha256_digest="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        framework_metadata={"param_count_billions": 8.0, "dtype": "bfloat16", "zero_stage": 2}
    )

    assert report.is_verified is True
    assert report.overall_status == "VERIFIED"
    assert len(report.steps) >= 3
    assert all(step.status == "PASSED" for step in report.steps)


def test_checkpoint_verifier_invalid_sha256_corrupted():
    report = CheckpointVerifier.verify(
        checkpoint_id="cp-bad-hash",
        storage_uri="s3://kynetic-weights/step-1000.pt",
        format_type="pytorch",
        size_bytes=10_000_000,
        sha256_digest="invalid_short_hash_not_64_hex",
        framework_metadata={}
    )

    assert report.is_verified is False
    assert report.overall_status == "CORRUPTED"
    failed_steps = [s for s in report.steps if s.status == "FAILED"]
    assert len(failed_steps) > 0
    assert any("sha256" in s.step_name for s in failed_steps)


def test_checkpoint_verifier_target_vram_compatibility():
    # 70B parameter model requires significant VRAM
    metadata_70b = {
        "param_count_billions": 70.0,
        "dtype": "bfloat16",
        "optimizer": "adamw",
        "zero_stage": 0
    }

    # Should FAIL on single 24GB L40S
    fail_report = CheckpointVerifier.verify(
        checkpoint_id="cp-70b",
        storage_uri="s3://kynetic-weights/70b/step-200.safetensors",
        format_type="safetensors",
        size_bytes=140_000_000_000,
        sha256_digest="a" * 64,
        framework_metadata=metadata_70b,
        target_vram_gb=24
    )
    assert fail_report.is_verified is False
    assert fail_report.overall_status == "FAILED"

    # Should PASS on 8x H100 (640 GB total VRAM) with ZeRO-3 sharding
    pass_report = CheckpointVerifier.verify(
        checkpoint_id="cp-70b-zero3",
        storage_uri="s3://kynetic-weights/70b/step-200.safetensors",
        format_type="safetensors",
        size_bytes=140_000_000_000,
        sha256_digest="a" * 64,
        framework_metadata={**metadata_70b, "zero_stage": 3},
        target_vram_gb=640
    )
    assert pass_report.is_verified is True
    assert pass_report.overall_status == "VERIFIED"
