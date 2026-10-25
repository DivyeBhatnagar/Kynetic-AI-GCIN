import hashlib
import json
import re
from datetime import datetime
from decimal import Decimal
from typing import Any
from pydantic import BaseModel, Field, field_validator, model_validator
from app.domain.common import Currency, Money
from app.core.errors import ManifestValidationError


# Patterns to detect dangerous or inline secret leakages
SUSPICIOUS_KEY_PATTERNS = re.compile(r"(api[_-]?key|secret|password|auth[_-]?token|private[_-]?key)", re.IGNORECASE)


class ImageSpec(BaseModel):
    uri: str = Field(..., description="OCI container image URI")
    digest: str | None = Field(None, description="Immutable image digest (sha256:...)")

    @field_validator("uri")
    @classmethod
    def validate_uri(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Container image URI cannot be empty.")
        return v


class ResourceRequirements(BaseModel):
    gpu_count: int = Field(default=0, ge=0, description="Required number of GPUs")
    gpu_memory_gb_min: int | None = Field(default=None, ge=1, description="Minimum GPU VRAM per card in GB")
    preferred_models: list[str] = Field(default_factory=list, description="Preferred GPU models (e.g. ['H100', 'A100'])")
    cpu_cores_min: int = Field(default=1, ge=1, description="Minimum CPU cores")
    ram_gb_min: int = Field(default=2, ge=1, description="Minimum RAM in GB")
    storage_gb_min: int = Field(default=10, ge=1, description="Minimum attached storage in GB")

    @model_validator(mode="after")
    def check_gpu_requirements(self) -> "ResourceRequirements":
        if self.gpu_count > 0 and self.gpu_memory_gb_min is None:
            raise ValueError("When gpu_count > 0, gpu_memory_gb_min must be specified.")
        return self


class ConstraintSpec(BaseModel):
    allowed_regions: list[str] = Field(default_factory=list, description="Region allowlist (e.g. ['us-east', 'eu-west'])")
    allowed_provider_ids: list[str] = Field(default_factory=list, description="Provider ID allowlist")
    denied_provider_ids: list[str] = Field(default_factory=list, description="Provider ID denylist")
    max_total_cost: Money | None = Field(default=None, description="Maximum total cost ceiling")
    currency: Currency = Field(default=Currency.USD, description="Currency for budget and cost evaluation")
    deadline_at: datetime | None = Field(default=None, description="Workload completion deadline")
    data_residency: str | None = Field(default=None, description="Data residency requirement (e.g. 'EU', 'US')")


class ExecutionSpec(BaseModel):
    timeout_seconds: int = Field(default=86400, ge=60, le=604800, description="Max execution duration in seconds")
    retry_limit: int = Field(default=0, ge=0, le=5, description="Max retry attempts on failure")
    interruptible: bool = Field(default=False, description="Tolerates interruptible/spot instances")
    checkpoint_mode: str | None = Field(default=None, description="Checkpoint adapter mode (e.g. 'framework_supported')")
    checkpoint_interval_seconds: int | None = Field(default=None, ge=60, description="Checkpoint cadence")


class DataReference(BaseModel):
    kind: str = Field(default="object_uri", description="Type of data reference")
    uri: str = Field(..., description="URI to object storage")
    access_reference: str | None = Field(None, description="Secret manager reference for access credentials")


class WorkloadManifest(BaseModel):
    schema_version: str = Field(default="1.0", description="Manifest schema version")
    name: str = Field(..., min_length=1, max_length=100, description="Workload name")
    workload_type: str = Field(default="batch_inference", description="Workload type (ml_training, batch_inference, etc.)")
    image: ImageSpec
    command: list[str] = Field(..., min_length=1, description="Command and arguments to execute")
    working_directory: str = Field(default="/workspace")
    resources: ResourceRequirements
    constraints: ConstraintSpec = Field(default_factory=ConstraintSpec)
    execution: ExecutionSpec = Field(default_factory=ExecutionSpec)
    inputs: list[DataReference] = Field(default_factory=list)
    outputs: list[DataReference] = Field(default_factory=list)
    environment: dict[str, str] = Field(default_factory=dict, description="Environment variables (no secrets allowed)")
    secret_references: list[str] = Field(default_factory=list, description="Opaque references to external secrets")
    metadata: dict[str, Any] = Field(default_factory=dict)

    @model_validator(mode="after")
    def validate_no_inline_secrets(self) -> "WorkloadManifest":
        """Enforces TRD/Architecture rule: no raw secrets allowed in manifests."""
        for key, value in self.environment.items():
            if SUSPICIOUS_KEY_PATTERNS.search(key):
                raise ValueError(
                    f"Suspicious secret variable '{key}' detected in environment. "
                    "Secrets must be specified in 'secret_references' as opaque secret manager identifiers."
                )
        return self

    def compute_digest(self) -> str:
        """Calculates reproducible SHA-256 digest of canonical manifest JSON."""
        manifest_dict = self.model_dump(mode="json")
        canonical_json = json.dumps(manifest_dict, sort_keys=True, separators=(",", ":"))
        return f"sha256:{hashlib.sha256(canonical_json.encode('utf-8')).hexdigest()}"

    def derive_fingerprint(self) -> dict[str, Any]:
        """Derives a privacy-conscious hardware and workload execution fingerprint."""
        return {
            "workload_type": self.workload_type,
            "gpu_count": self.resources.gpu_count,
            "gpu_memory_gb_min": self.resources.gpu_memory_gb_min,
            "cpu_cores_min": self.resources.cpu_cores_min,
            "ram_gb_min": self.resources.ram_gb_min,
            "storage_gb_min": self.resources.storage_gb_min,
            "interruptible": self.execution.interruptible,
            "has_checkpoints": bool(self.execution.checkpoint_mode),
        }
