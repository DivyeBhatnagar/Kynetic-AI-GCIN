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
