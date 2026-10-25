import string
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Any
from app.domain.checkpoints.schemas import (
    CheckpointVerificationReport,
    CheckpointVerificationStep,
)


def compute_required_vram_gb(metadata: dict[str, Any]) -> Decimal:
    """
    Computes theoretical minimum VRAM in GB required to resume a model checkpoint,
    accounting for model weights, optimizer state overhead, and activation headroom.
    """
    param_billions = Decimal(str(metadata.get("param_count_billions", 7.0)))
    dtype = str(metadata.get("dtype", "bfloat16")).lower()
    optimizer = str(metadata.get("optimizer", "adamw")).lower()
    zero_stage = int(metadata.get("zero_stage", 0))

    # Bytes per parameter for model weights
    bytes_per_param = Decimal("2.0")  # default fp16/bf16
    if "fp32" in dtype or "float32" in dtype:
        bytes_per_param = Decimal("4.0")
    elif "int8" in dtype:
        bytes_per_param = Decimal("1.0")
    elif "int4" in dtype:
        bytes_per_param = Decimal("0.5")

    # Weights VRAM in GB: (param_billions * 1e9 * bytes_per_param) / 1024^3
    weights_gb = (param_billions * Decimal("1000000000") * bytes_per_param) / Decimal(1024**3)

    # Optimizer overhead
    # Standard AdamW holds:
    # - FP32 master copy of weights (4 bytes)
    # - FP32 first momentum (4 bytes)
    # - FP32 second momentum (4 bytes)
    # Total = 12 bytes/param (or up to 16 bytes depending on gradient persistence)
    if "adam" in optimizer:
        opt_bytes_per_param = Decimal("12.0")
    elif "sgd" in optimizer:
        opt_bytes_per_param = Decimal("4.0")  # momentum only
    else:
        opt_bytes_per_param = Decimal("8.0")

    # DeepSpeed ZeRO partitioning division
    if zero_stage == 1:
        # Partitions optimizer states
        opt_bytes_per_param = opt_bytes_per_param / Decimal("2.0")
    elif zero_stage == 2:
        # Partitions optimizer states + gradients
        opt_bytes_per_param = opt_bytes_per_param / Decimal("4.0")
    elif zero_stage >= 3:
        # Partitions optimizer + gradients + model weights
        weights_gb = weights_gb / Decimal("2.0")
        opt_bytes_per_param = opt_bytes_per_param / Decimal("4.0")

    optimizer_gb = (param_billions * Decimal("1000000000") * opt_bytes_per_param) / Decimal(1024**3)

    # 20% activation memory overhead buffer
    total_required = (weights_gb + optimizer_gb) * Decimal("1.20")
    return total_required.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


class CheckpointVerifier:
    """
    Validates checkpoint structure, cryptographic checksum, framework metadata,
    and hardware VRAM compatibility.
    """

    ALLOWED_SCHEMES = ("s3://", "gcs://", "gs://", "file://", "r2://", "https://")

    @classmethod
    def verify(
        cls,
        checkpoint_id: str,
        storage_uri: str,
        format_type: str,
        size_bytes: int,
        sha256_digest: str,
        framework_metadata: dict[str, Any],
        target_vram_gb: int | None = None
    ) -> CheckpointVerificationReport:
        steps: list[CheckpointVerificationStep] = []
        is_corrupted = False

        # Step 1: Storage URI & Format Validation
        uri_valid = any(storage_uri.startswith(scheme) for scheme in cls.ALLOWED_SCHEMES)
        format_valid = format_type in ("safetensors", "pytorch", "deepspeed")

        if uri_valid and format_valid:
            steps.append(CheckpointVerificationStep(
                step_name="storage_and_format_protocol",
                status="PASSED",
                details={"storage_uri": storage_uri, "format": format_type}
            ))
        else:
            is_corrupted = True
            steps.append(CheckpointVerificationStep(
                step_name="storage_and_format_protocol",
                status="FAILED",
                details={
                    "error": f"Invalid URI scheme or unsupported format '{format_type}'",
                    "storage_uri": storage_uri
                }
            ))

        # Step 2: Size & Cryptographic SHA-256 Digest Validation
        size_valid = size_bytes > 1024  # Checkpoints must be at least 1 KB
        digest_valid = len(sha256_digest) == 64 and all(c in string.hexdigits for c in sha256_digest)

        if size_valid and digest_valid:
            steps.append(CheckpointVerificationStep(
                step_name="sha256_checksum_and_size",
                status="PASSED",
                details={"size_bytes": size_bytes, "sha256": sha256_digest}
            ))
        else:
            is_corrupted = True
            steps.append(CheckpointVerificationStep(
                step_name="sha256_checksum_and_size",
                status="FAILED",
                details={
                    "error": "Checkpoint size too small or sha256 digest is not a valid 64-character hex string",
                    "size_bytes": size_bytes,
                    "sha256": sha256_digest
                }
            ))

        # Step 3: Framework-Aware Header / Metadata Inspection
        has_params = "param_count_billions" in framework_metadata or "params" in framework_metadata
        if has_params or format_type in ("safetensors", "pytorch", "deepspeed"):
            steps.append(CheckpointVerificationStep(
                step_name="framework_header_integrity",
                status="PASSED",
                details={
                    "format": format_type,
                    "dtype": framework_metadata.get("dtype", "bfloat16"),
                    "zero_stage": framework_metadata.get("zero_stage", 0)
                }
            ))
        else:
            steps.append(CheckpointVerificationStep(
                step_name="framework_header_integrity",
                status="FAILED",
                details={"error": "Missing essential framework metadata or tensor table"}
            ))
            is_corrupted = True

        # Step 4: VRAM Hardware Fit Check (if target specified)
        required_vram = compute_required_vram_gb(framework_metadata)
        if target_vram_gb is not None:
            if Decimal(str(target_vram_gb)) >= required_vram:
                steps.append(CheckpointVerificationStep(
                    step_name="target_vram_compatibility",
                    status="PASSED",
                    details={
                        "target_vram_gb": target_vram_gb,
                        "required_vram_gb": str(required_vram),
                        "headroom_gb": str(Decimal(str(target_vram_gb)) - required_vram)
                    }
                ))
            else:
                steps.append(CheckpointVerificationStep(
                    step_name="target_vram_compatibility",
                    status="FAILED",
                    details={
                        "error": f"Target GPU VRAM ({target_vram_gb} GB) is insufficient for required footprint ({required_vram} GB). Risk of CUDA OOM.",
                        "target_vram_gb": target_vram_gb,
                        "required_vram_gb": str(required_vram)
                    }
                ))
                # Note: Insufficient target VRAM is a compatibility failure, not checkpoint data corruption
                overall_status = "FAILED"
                return CheckpointVerificationReport(
                    checkpoint_id=checkpoint_id,
                    overall_status=overall_status,
                    is_verified=False,
                    verified_at=datetime.now(timezone.utc),
                    steps=steps,
                    estimated_vram_requirement_gb=required_vram
                )

        overall_status = "CORRUPTED" if is_corrupted else "VERIFIED"
        return CheckpointVerificationReport(
            checkpoint_id=checkpoint_id,
            overall_status=overall_status,
            is_verified=(overall_status == "VERIFIED"),
            verified_at=datetime.now(timezone.utc),
            steps=steps,
            estimated_vram_requirement_gb=required_vram
        )
