from datetime import datetime
from decimal import Decimal
from typing import Any, Literal
from pydantic import BaseModel, Field, ConfigDict


class CheckpointCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    step_number: int = Field(..., ge=0, description="Training step number (e.g., 10000)")
    epoch: int | None = Field(None, ge=0, description="Training epoch number")
    format: Literal["safetensors", "pytorch", "deepspeed"] = Field(
        "safetensors",
        description="Format of the saved checkpoint"
    )
    storage_uri: str = Field(..., min_length=5, max_length=512, description="URI where checkpoint is stored (s3://, gcs://, file://)")
    size_bytes: int = Field(..., gt=0, description="Total size in bytes of the checkpoint file(s)")
    sha256_digest: str = Field(..., min_length=64, max_length=64, description="Hexadecimal SHA-256 cryptographic digest")
    framework_metadata: dict[str, Any] = Field(
        default_factory=dict,
        description="Metadata including param_count_billions, dtype, optimizer, zero_stage"
    )


class CheckpointResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    run_id: str
    project_id: str
    step_number: int
    epoch: int | None
    format: str
    storage_uri: str
    size_bytes: int
    sha256_digest: str
    framework_metadata: dict[str, Any]
    is_verified: bool
    verification_status: str
    verified_at: datetime | None
    created_at: datetime


class CheckpointVerificationStep(BaseModel):
    step_name: str
    status: Literal["PASSED", "FAILED"]
    details: dict[str, Any] = Field(default_factory=dict)


class CheckpointVerificationReport(BaseModel):
    checkpoint_id: str
    overall_status: Literal["VERIFIED", "CORRUPTED", "FAILED"]
    is_verified: bool
    verified_at: datetime
    steps: list[CheckpointVerificationStep]
    estimated_vram_requirement_gb: Decimal


class TransferEstimationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    source_provider_code: str = Field(..., description="Provider hosting the checkpoint (e.g. AWS, RUNPOD)")
    target_provider_code: str = Field(..., description="Destination compute provider (e.g. LAMBDA, CRUSOE)")
    network_bandwidth_gbps: Decimal = Field(
        Decimal("10.0"),
        gt=Decimal("0.0"),
        le=Decimal("400.0"),
        description="Available inter-datacenter or egress bandwidth in Gbps"
    )


class TransferEstimationResponse(BaseModel):
    checkpoint_id: str
    checkpoint_size_gb: Decimal
    source_provider: str
    target_provider: str
    egress_rate_per_gb: Decimal
    estimated_egress_cost_usd: Decimal
    network_transfer_seconds: int
    container_spinup_seconds: int
    pcie_weight_load_seconds: int
    total_migration_downtime_seconds: int


class ResumptionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    target_compute_offer_id: str = Field(..., description="ID of compute offer to resume training on")
    idempotency_key: str = Field(..., min_length=8, max_length=128, description="Unique idempotency key for resumption")
    reason: str = Field("Manual resumption from validated checkpoint", description="Audit reason for resuming")


class ResumptionResponse(BaseModel):
    new_run_id: str
    resumed_from_run_id: str
    resumed_from_checkpoint_id: str
    step_number: int
    target_compute_offer_id: str
    status: str
    allocated_gpu_count: int
    gpu_model: str
    estimated_total_vram_gb: int
    created_at: datetime
