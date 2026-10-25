import httpx
from typing import Any
from decimal import Decimal
from app.core.logging import redact_secrets


class ProviderApiError(Exception):
    """Base exception for external cloud provider API communication errors."""
    def __init__(self, provider_key: str, status_code: int, message: str, details: Any = None):
        sanitized_details = redact_secrets(str(details)) if details else None
        super().__init__(f"[{provider_key}] API Error (HTTP {status_code}): {message}")
        self.provider_key = provider_key
        self.status_code = status_code
        self.message = message
        self.details = sanitized_details


class ProviderAuthError(ProviderApiError):
    """Raised when external provider rejects credentials or lacks permissions."""
    pass


class ProviderQuotaError(ProviderApiError):
    """Raised when provider quota or GPU capacity limit is exceeded."""
    pass


class ProviderResourceNotFoundError(ProviderApiError):
    """Raised when external resource cannot be found."""
    pass


class BaseHttpProviderClient:
    """
    Resilient async HTTP client helper for cloud provider integrations.
    Automatically scrubs sensitive authorization headers from error messages.
    """
    def __init__(self, base_url: str, timeout_seconds: float = 30.0, default_headers: dict[str, str] | None = None):
        self.base_url = base_url.rstrip("/")
        self.timeout_seconds = timeout_seconds
        self.default_headers = default_headers or {}

    def _get_client(self) -> httpx.AsyncClient:
        return httpx.AsyncClient(
            base_url=self.base_url,
            timeout=self.timeout_seconds,
            headers=self.default_headers
        )

    async def execute_request(
        self,
        provider_key: str,
        method: str,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        json_data: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None
    ) -> dict[str, Any]:
        req_headers = {**self.default_headers, **(headers or {})}
        
        async with self._get_client() as client:
            try:
                response = await client.request(
                    method=method.upper(),
                    url=path,
                    params=params,
                    json=json_data,
                    headers=req_headers
                )
            except httpx.RequestError as exc:
                raise ProviderApiError(
                    provider_key=provider_key,
                    status_code=503,
                    message=f"Network transport error contacting {provider_key}: {str(exc)}"
                )

            if response.status_code == 401 or response.status_code == 403:
                raise ProviderAuthError(
                    provider_key=provider_key,
                    status_code=response.status_code,
                    message="Provider credentials invalid or unauthorized",
                    details=response.text[:200]
                )
            elif response.status_code == 404:
                raise ProviderResourceNotFoundError(
                    provider_key=provider_key,
                    status_code=404,
                    message="Requested resource not found on provider",
                    details=response.text[:200]
                )
            elif response.status_code == 429:
                raise ProviderQuotaError(
                    provider_key=provider_key,
                    status_code=429,
                    message="Rate limit or capacity quota exceeded on provider",
                    details=response.text[:200]
                )
            elif response.status_code >= 400:
                raise ProviderApiError(
                    provider_key=provider_key,
                    status_code=response.status_code,
                    message=f"Provider returned error HTTP {response.status_code}",
                    details=response.text[:300]
                )

            try:
                return response.json()
            except Exception:
                return {"raw_text": response.text}


from datetime import datetime, timezone, timedelta
from app.ports.provider_adapter import ProviderResource, ProviderActionResult, UsageObservationInfo


class BaseInMemoryProviderAdapter:
    """Shared in-memory resource state & idempotency tracker for cloud adapters."""
    provider_key: str = "base"
    provider_name: str = "Base Cloud"

    def __init__(self):
        self._in_memory_resources: dict[str, ProviderResource] = {}
        self._idempotency_table: dict[str, str] = {}

    def _get_existing(self, idempotency_key: str) -> ProviderResource | None:
        if idempotency_key in self._idempotency_table:
            return self._in_memory_resources[self._idempotency_table[idempotency_key]]
        return None

    def _save_resource(self, idempotency_key: str, resource: ProviderResource) -> None:
        self._in_memory_resources[resource.provider_resource_id] = resource
        self._idempotency_table[idempotency_key] = resource.provider_resource_id

    async def get_resource(self, provider_resource_id: str) -> ProviderResource:
        if provider_resource_id in self._in_memory_resources:
            return self._in_memory_resources[provider_resource_id]
        now = datetime.now(timezone.utc)
        return ProviderResource(
            provider_resource_id=provider_resource_id,
            status="RUNNING",
            region_key="default",
            created_at=now - timedelta(minutes=15),
            metadata={"provider": self.provider_key}
        )

    async def stop_resource(self, provider_resource_id: str) -> ProviderActionResult:
        if provider_resource_id in self._in_memory_resources:
            res = self._in_memory_resources[provider_resource_id]
            self._in_memory_resources[provider_resource_id] = res.model_copy(update={"status": "STOPPED"})
        return ProviderActionResult(
            success=True,
            action="STOP",
            message=f"{self.provider_name} resource {provider_resource_id} paused",
            provider_resource_id=provider_resource_id
        )

    async def terminate_resource(self, provider_resource_id: str, idempotency_key: str) -> ProviderActionResult:
        if provider_resource_id in self._in_memory_resources:
            res = self._in_memory_resources[provider_resource_id]
            self._in_memory_resources[provider_resource_id] = res.model_copy(update={"status": "TERMINATED"})
        return ProviderActionResult(
            success=True,
            action="TERMINATE",
            message=f"{self.provider_name} resource {provider_resource_id} terminated",
            provider_resource_id=provider_resource_id
        )

    async def get_usage(self, provider_resource_id: str) -> list[UsageObservationInfo]:
        now = datetime.now(timezone.utc)
        return [
            UsageObservationInfo(
                metric_name="run_duration_seconds",
                value=Decimal("3600.00"),
                unit="SECONDS",
                period_start=now - timedelta(hours=1),
                period_end=now
            ),
            UsageObservationInfo(
                metric_name="gpu_utilization_avg",
                value=Decimal("95.00"),
                unit="PERCENT",
                period_start=now - timedelta(hours=1),
                period_end=now
            )
        ]
