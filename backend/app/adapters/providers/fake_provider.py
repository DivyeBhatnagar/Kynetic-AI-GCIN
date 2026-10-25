import uuid
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from app.ports.provider_adapter import (
    ProviderAdapter,
    ProviderCapabilities,
    RegionInfo,
    ComputeOfferInfo,
    LaunchRequest,
    LaunchValidation,
    ProviderResource,
    ProviderActionResult,
    UsageObservationInfo
)
from app.domain.common import Currency, SourceType


class FakeProviderAdapter:
    """
    Deterministic simulated provider adapter for testing and local development.
    All data is clearly labelled with source_type=SIMULATED.
    """
    provider_key: str = "kynetic-simulated-cloud"
    provider_name: str = "Kynetic Simulated GPU Cloud"

    def __init__(self):
        # Simulated in-memory provisioned resources
        self._resources: dict[str, ProviderResource] = {}
        # Idempotency mapping: idempotency_key -> provider_resource_id
        self._idempotent_creates: dict[str, str] = {}

    async def get_capabilities(self) -> ProviderCapabilities:
        return ProviderCapabilities(
            supports_spot=True,
            supports_custom_images=True,
            supports_attached_volumes=True,
            supports_checkpoints=True,
            supported_accelerator_families=["NVIDIA"]
        )

    async def list_regions(self) -> list[RegionInfo]:
        return [
            RegionInfo(region_key="us-east", display_name="US East (N. Virginia)", country_code="US"),
            RegionInfo(region_key="us-west", display_name="US West (Oregon)", country_code="US"),
            RegionInfo(region_key="eu-west", display_name="EU West (Frankfurt)", country_code="DE"),
        ]

    async def list_offers(self) -> list[ComputeOfferInfo]:
        now = datetime.now(timezone.utc)
        return [
            ComputeOfferInfo(
                id="offer-sim-h100-us-east",
                provider_key=self.provider_key,
                region_key="us-east",
                external_offer_key="h100.80gb.sxm5",
                gpu_model="H100",
                gpu_count=1,
                gpu_memory_gb=80,
                cpu_cores=16,
                ram_gb=128,
                storage_gb=500,
                price_per_hour=Decimal("3.2000"),
                currency=Currency.USD,
                source_type=SourceType.SIMULATED,
                observed_at=now,
                freshness_status="FRESH"
            ),
            ComputeOfferInfo(
                id="offer-sim-a100-us-east",
                provider_key=self.provider_key,
                region_key="us-east",
                external_offer_key="a100.80gb.pcie",
                gpu_model="A100",
                gpu_count=1,
                gpu_memory_gb=80,
                cpu_cores=12,
                ram_gb=96,
                storage_gb=300,
                price_per_hour=Decimal("1.9000"),
                currency=Currency.USD,
                source_type=SourceType.SIMULATED,
                observed_at=now,
                freshness_status="FRESH"
            ),
            ComputeOfferInfo(
                id="offer-sim-l40s-us-west",
                provider_key=self.provider_key,
                region_key="us-west",
                external_offer_key="l40s.48gb",
                gpu_model="L40S",
                gpu_count=1,
                gpu_memory_gb=48,
                cpu_cores=8,
                ram_gb=64,
                storage_gb=200,
                price_per_hour=Decimal("1.2500"),
                currency=Currency.USD,
                source_type=SourceType.SIMULATED,
                observed_at=now,
                freshness_status="FRESH"
            ),
            ComputeOfferInfo(
                id="offer-sim-h100-eu-west",
                provider_key=self.provider_key,
                region_key="eu-west",
                external_offer_key="h100.80gb.eu",
                gpu_model="H100",
                gpu_count=1,
                gpu_memory_gb=80,
                cpu_cores=16,
                ram_gb=128,
                storage_gb=500,
                price_per_hour=Decimal("3.5000"),
                currency=Currency.USD,
                source_type=SourceType.SIMULATED,
                observed_at=now,
                freshness_status="FRESH"
            ),
            ComputeOfferInfo(
                id="offer-sim-4xh100-us-east",
                provider_key=self.provider_key,
                region_key="us-east",
                external_offer_key="4xh100.80gb.sxm5",
                gpu_model="H100",
                gpu_count=4,
                gpu_memory_gb=80,
                cpu_cores=64,
                ram_gb=512,
                storage_gb=2000,
                price_per_hour=Decimal("12.8000"),
                currency=Currency.USD,
                source_type=SourceType.SIMULATED,
                observed_at=now,
                freshness_status="FRESH"
            ),
        ]

    async def validate_launch(self, request: LaunchRequest) -> LaunchValidation:
        errors: list[str] = []
        if not request.image_uri:
            errors.append("image_uri is required")
        if not request.command:
            errors.append("command cannot be empty")
        return LaunchValidation(is_valid=len(errors) == 0, errors=errors)

    async def create_resource(self, request: LaunchRequest, idempotency_key: str) -> ProviderResource:
        # Check idempotency first: prevent duplicate billing on retry
        if idempotency_key in self._idempotent_creates:
            existing_id = self._idempotent_creates[idempotency_key]
            return self._resources[existing_id]

        resource_id = f"sim-inst-{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc)
        resource = ProviderResource(
            provider_resource_id=resource_id,
            status="RUNNING",
            region_key="us-east",
            created_at=now,
            metadata={
                "run_id": request.run_id,
                "offer_id": request.compute_offer_id,
                "image_uri": request.image_uri,
                "idempotency_key": idempotency_key,
                "simulated": True
            }
        )
        self._resources[resource_id] = resource
        self._idempotent_creates[idempotency_key] = resource_id
        return resource

    async def get_resource(self, provider_resource_id: str) -> ProviderResource:
        if provider_resource_id not in self._resources:
            raise KeyError(f"Provider resource {provider_resource_id} not found")
        return self._resources[provider_resource_id]

    async def stop_resource(self, provider_resource_id: str) -> ProviderActionResult:
        if provider_resource_id in self._resources:
            self._resources[provider_resource_id].status = "STOPPED"
            return ProviderActionResult(
                success=True,
                action="STOP",
                message="Resource stopped successfully.",
                provider_resource_id=provider_resource_id
            )
        return ProviderActionResult(
            success=False,
            action="STOP",
            message=f"Resource {provider_resource_id} not found.",
            provider_resource_id=provider_resource_id
        )

    async def terminate_resource(self, provider_resource_id: str, idempotency_key: str) -> ProviderActionResult:
        if provider_resource_id in self._resources:
            self._resources[provider_resource_id].status = "TERMINATED"
            return ProviderActionResult(
                success=True,
                action="TERMINATE",
                message="Resource terminated and released.",
                provider_resource_id=provider_resource_id
            )
        return ProviderActionResult(
            success=True,  # Idempotent: already terminated/gone
            action="TERMINATE",
            message="Resource already absent or terminated.",
            provider_resource_id=provider_resource_id
        )

    async def get_usage(self, provider_resource_id: str) -> list[UsageObservationInfo]:
        now = datetime.now(timezone.utc)
        return [
            UsageObservationInfo(
                metric_name="gpu_utilization_percent",
                value=Decimal("87.5"),
                unit="percent",
                period_start=now - timedelta(minutes=15),
                period_end=now
            ),
            UsageObservationInfo(
                metric_name="gpu_memory_used_gb",
                value=Decimal("72.4"),
                unit="GB",
                period_start=now - timedelta(minutes=15),
                period_end=now
            )
        ]

    async def get_logs(self, provider_resource_id: str, tail: int = 100) -> list[str]:
        return [
            f"[Kynetic Simulated Host] Initializing environment for {provider_resource_id}...",
            "[Kynetic Simulated Host] Pulling container image...",
            "[Kynetic Simulated Host] GPU CUDA runtime initialized (Driver 550.54.14, CUDA 12.4).",
            "[User Process] Epoch 1/10 complete - loss: 0.421, throughput: 142 samples/sec",
            "[User Process] Epoch 2/10 complete - loss: 0.312, throughput: 144 samples/sec",
        ]
