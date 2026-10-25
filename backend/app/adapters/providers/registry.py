from typing import Any
from app.ports.provider_adapter import ProviderAdapter, ComputeOfferInfo
from app.adapters.providers.fake_provider import FakeProviderAdapter
from app.adapters.providers.runpod_adapter import RunPodAdapter
from app.adapters.providers.lambda_adapter import LambdaAdapter
from app.adapters.providers.aws_adapter import AWSAdapter
from app.adapters.providers.gcp_adapter import GCPAdapter
from app.adapters.providers.azure_adapter import AzureAdapter


class ProviderRegistry:
    """
    Central dynamic registry for compute provider integrations.
    Instantiates and resolves provider adapters dynamically based on
    tenant provider keys and encrypted credentials.
    """
    _registered_factories: dict[str, Any] = {
        "kynetic-simulated-cloud": FakeProviderAdapter,
        "runpod": RunPodAdapter,
        "lambda": LambdaAdapter,
        "aws": AWSAdapter,
        "gcp": GCPAdapter,
        "azure": AzureAdapter,
    }

    @classmethod
    def get_adapter(cls, provider_key: str, credentials: dict[str, Any] | str | None = None) -> Any:
        clean_key = provider_key.lower().strip()
        factory = cls._registered_factories.get(clean_key)
        if not factory:
            # Fallback to simulated provider for unknown or custom provider keys
            return FakeProviderAdapter()

        if clean_key == "runpod":
            api_key = credentials if isinstance(credentials, str) else (credentials or {}).get("api_key")
            return RunPodAdapter(api_key=api_key)
        elif clean_key == "lambda":
            api_key = credentials if isinstance(credentials, str) else (credentials or {}).get("api_key")
            return LambdaAdapter(api_key=api_key)
        elif clean_key == "aws":
            cred_dict = credentials if isinstance(credentials, dict) else {}
            return AWSAdapter(
                access_key_id=cred_dict.get("access_key_id") or "mock-aws-key",
                secret_access_key=cred_dict.get("secret_access_key") or "mock-aws-secret",
                default_region=cred_dict.get("region", "us-east-1")
            )
        elif clean_key == "gcp":
            cred_dict = credentials if isinstance(credentials, dict) else {}
            return GCPAdapter(
                service_account_json=cred_dict.get("service_account_json") or "mock-sa-json",
                project_id=cred_dict.get("project_id", "kynetic-gcp-prod")
            )
        elif clean_key == "azure":
            cred_dict = credentials if isinstance(credentials, dict) else {}
            return AzureAdapter(
                tenant_id=cred_dict.get("tenant_id"),
                client_id=cred_dict.get("client_id"),
                client_secret=cred_dict.get("client_secret")
            )
        else:
            return FakeProviderAdapter()

    @classmethod
    def list_supported_providers(cls) -> list[str]:
        return list(cls._registered_factories.keys())

    @classmethod
    async def list_all_active_offers(cls) -> list[ComputeOfferInfo]:
        """Aggregates all offers across all registered providers."""
        all_offers: list[ComputeOfferInfo] = []
        for key in cls._registered_factories:
            adapter = cls.get_adapter(key)
            if hasattr(adapter, "list_offers"):
                try:
                    offers = await adapter.list_offers()
                    all_offers.extend(offers)
                except Exception:
                    continue
        return all_offers

    @classmethod
    async def verify_credentials(cls, provider_key: str, credentials: dict[str, Any] | str | None) -> dict[str, Any]:
        """Tests live credential authentication against external provider."""
        adapter = cls.get_adapter(provider_key, credentials)
        if hasattr(adapter, "validate_credentials"):
            try:
                is_valid = await adapter.validate_credentials()
                return {
                    "is_valid": is_valid,
                    "provider_key": provider_key,
                    "message": "Credentials verified successfully with external provider API" if is_valid else "Provider rejected credentials"
                }
            except Exception as exc:
                return {
                    "is_valid": False,
                    "provider_key": provider_key,
                    "message": f"Credential verification failed: {str(exc)}"
                }
        return {
            "is_valid": True,
            "provider_key": provider_key,
            "message": "Provider does not require external authentication"
        }
