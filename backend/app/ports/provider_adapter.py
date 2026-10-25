from typing import Protocol, Any
from datetime import datetime, timezone
from decimal import Decimal
from pydantic import BaseModel, Field
from app.domain.common import Currency, Money, SourceType


class ProviderCapabilities(BaseModel):
    supports_spot: bool = False
    supports_custom_images: bool = True
    supports_attached_volumes: bool = True
    supports_checkpoints: bool = False
    supported_accelerator_families: list[str] = Field(default_factory=lambda: ["NVIDIA"])


class RegionInfo(BaseModel):
    region_key: str
    display_name: str
    country_code: str
    status: str = "ACTIVE"


class ComputeOfferInfo(BaseModel):
    id: str
    provider_key: str
    region_key: str
    external_offer_key: str
    gpu_model: str
    gpu_count: int
    gpu_memory_gb: int
    cpu_cores: int
    ram_gb: int
    storage_gb: int
    price_per_hour: Money
    currency: Currency = Currency.USD
    billing_unit: str = "HOUR"
    availability_status: str = "AVAILABLE"
    source_type: SourceType = SourceType.SIMULATED
    observed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    freshness_status: str = "FRESH"


class LaunchRequest(BaseModel):
    run_id: str
    compute_offer_id: str
    image_uri: str
    command: list[str]
    environment: dict[str, str] = Field(default_factory=dict)
    secret_references: list[str] = Field(default_factory=list)


class LaunchValidation(BaseModel):
    is_valid: bool
    errors: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class ProviderResource(BaseModel):
    provider_resource_id: str
    status: str
    region_key: str
    created_at: datetime
    metadata: dict[str, Any] = Field(default_factory=dict)


class ProviderActionResult(BaseModel):
    success: bool
    action: str
    message: str
    provider_resource_id: str


class UsageObservationInfo(BaseModel):
    metric_name: str
    value: Decimal
    unit: str
    period_start: datetime
    period_end: datetime


class ProviderAdapter(Protocol):
    """
    Standard interface for all compute provider integrations.
    Follows TRD Section 10 and Architecture Section 8.
    """
    provider_key: str

    async def get_capabilities(self) -> ProviderCapabilities: ...
    async def list_regions(self) -> list[RegionInfo]: ...
    async def list_offers(self) -> list[ComputeOfferInfo]: ...
    async def validate_launch(self, request: LaunchRequest) -> LaunchValidation: ...
    async def create_resource(self, request: LaunchRequest, idempotency_key: str) -> ProviderResource: ...
    async def get_resource(self, provider_resource_id: str) -> ProviderResource: ...
    async def stop_resource(self, provider_resource_id: str) -> ProviderActionResult: ...
    async def terminate_resource(self, provider_resource_id: str, idempotency_key: str) -> ProviderActionResult: ...
    async def get_usage(self, provider_resource_id: str) -> list[UsageObservationInfo]: ...
    async def get_logs(self, provider_resource_id: str, tail: int = 100) -> list[str]: ...
