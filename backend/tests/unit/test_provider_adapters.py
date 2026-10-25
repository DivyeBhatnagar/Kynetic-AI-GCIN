import pytest
from decimal import Decimal
from app.adapters.providers.registry import ProviderRegistry
from app.adapters.providers.runpod_adapter import RunPodAdapter
from app.adapters.providers.lambda_adapter import LambdaAdapter
from app.adapters.providers.aws_adapter import AWSAdapter
from app.adapters.providers.gcp_adapter import GCPAdapter
from app.adapters.providers.azure_adapter import AzureAdapter
from app.ports.provider_adapter import LaunchRequest


@pytest.mark.asyncio
async def test_runpod_adapter_contract_and_idempotency():
    adapter = RunPodAdapter(api_key="mock-runpod-key")
    caps = await adapter.get_capabilities()
    assert caps.supports_spot is True
    assert "NVIDIA" in caps.supported_accelerator_families

    regions = await adapter.list_regions()
    assert len(regions) >= 4
    assert any(r.region_key == "US-TX" for r in regions)

    offers = await adapter.list_offers()
    assert len(offers) >= 4
    h100_offer = next(o for o in offers if o.gpu_model == "H100")
    assert h100_offer.price_per_hour == Decimal("2.9900")
    assert h100_offer.gpu_memory_gb == 80

    # Credential verification
    is_valid = await adapter.validate_credentials()
    assert is_valid is True

    # Resource launch with idempotency
    req = LaunchRequest(
        run_id="run-runpod-001",
        compute_offer_id=h100_offer.id,
        image_uri="pytorch/pytorch:2.2.0-cuda12.1-cudnn8-runtime",
        command=["python", "-m", "torch.distributed.run", "train.py"]
    )
    res1 = await adapter.create_resource(req, idempotency_key="runpod-idemp-key-1")
    res2 = await adapter.create_resource(req, idempotency_key="runpod-idemp-key-1")
    assert res1.provider_resource_id == res2.provider_resource_id
    assert res1.status == "RUNNING"

    # Inspect usage and logs
    usage = await adapter.get_usage(res1.provider_resource_id)
    assert len(usage) >= 2
    logs = await adapter.get_logs(res1.provider_resource_id, tail=10)
    assert len(logs) >= 3

    # Terminate resource
    term_res = await adapter.terminate_resource(res1.provider_resource_id, idempotency_key="term-1")
    assert term_res.success is True
    assert term_res.action == "TERMINATE"


@pytest.mark.asyncio
async def test_lambda_adapter_contract():
    adapter = LambdaAdapter(api_key="mock-lambda-key")
    caps = await adapter.get_capabilities()
    assert caps.supports_spot is False  # Lambda is primarily on-demand

    offers = await adapter.list_offers()
    gh200 = next(o for o in offers if o.gpu_model == "GH200")
    assert gh200.price_per_hour == Decimal("3.8900")
    assert gh200.gpu_memory_gb == 96

    # Launch & Stop
    req = LaunchRequest(
        run_id="run-lambda-001",
        compute_offer_id=gh200.id,
        image_uri="lambda/cuda12:latest",
        command=["python", "train.py"]
    )
    res = await adapter.create_resource(req, idempotency_key="lambda-idemp-1")
    assert res.status == "RUNNING"
    stop_res = await adapter.stop_resource(res.provider_resource_id)
    assert stop_res.success is True


@pytest.mark.asyncio
async def test_aws_adapter_contract():
    adapter = AWSAdapter(access_key_id="mock-key", secret_access_key="mock-sec")
    caps = await adapter.get_capabilities()
    assert caps.supports_spot is True

    offers = await adapter.list_offers()
    p5 = next(o for o in offers if "p5" in o.external_offer_key)
    assert p5.gpu_model == "H100"
    assert p5.gpu_count == 8

    req = LaunchRequest(
        run_id="run-aws-001",
        compute_offer_id=p5.id,
        image_uri="763104351884.dkr.ecr.us-east-1.amazonaws.com/pytorch-training:2.1",
        command=["python", "entrypoint.py"]
    )
    res = await adapter.create_resource(req, idempotency_key="aws-idemp-1")
    assert res.provider_resource_id.startswith("i-")


@pytest.mark.asyncio
async def test_gcp_adapter_contract():
    adapter = GCPAdapter(service_account_json="mock-sa", project_id="test-proj")
    offers = await adapter.list_offers()
    a3 = next(o for o in offers if "a3" in o.external_offer_key)
    assert a3.gpu_count == 8
    assert a3.gpu_model == "H100"

    req = LaunchRequest(
        run_id="run-gcp-001",
        compute_offer_id=a3.id,
        image_uri="gcr.io/deeplearning-platform-release/pytorch-gpu:latest",
        command=["python", "main.py"]
    )
    res = await adapter.create_resource(req, idempotency_key="gcp-idemp-1")
    assert res.provider_resource_id.startswith("gcp-vm-")


@pytest.mark.asyncio
async def test_azure_adapter_contract():
    adapter = AzureAdapter(tenant_id="mock-t", client_id="mock-c", client_secret="mock-s")
    offers = await adapter.list_offers()
    nd96 = next(o for o in offers if "ND96isr" in o.external_offer_key)
    assert nd96.gpu_count == 8
    assert nd96.gpu_memory_gb == 640

    req = LaunchRequest(
        run_id="run-az-001",
        compute_offer_id=nd96.id,
        image_uri="mcr.microsoft.com/azureml/curated/acpt-pytorch-2.2-cuda12.1",
        command=["python", "train_fsdp.py"]
    )
    res = await adapter.create_resource(req, idempotency_key="az-idemp-1")
    assert res.provider_resource_id.startswith("az-vm-")


@pytest.mark.asyncio
async def test_provider_registry_dynamic_resolution_and_offer_aggregation():
    # Verify all expected providers are registered
    supported = ProviderRegistry.list_supported_providers()
    assert "runpod" in supported
    assert "lambda" in supported
    assert "aws" in supported
    assert "gcp" in supported
    assert "azure" in supported
    assert "kynetic-simulated-cloud" in supported

    # Verify adapter resolution
    runpod_adapter = ProviderRegistry.get_adapter("runpod", "test-api-key")
    assert isinstance(runpod_adapter, RunPodAdapter)

    aws_adapter = ProviderRegistry.get_adapter("aws", {"access_key_id": "k", "secret_access_key": "s"})
    assert isinstance(aws_adapter, AWSAdapter)

    # Unknown provider falls back gracefully
    unknown = ProviderRegistry.get_adapter("unknown-custom-cloud")
    assert unknown.provider_key == "kynetic-simulated-cloud"

    # Verify aggregation of active offers across all providers
    all_offers = await ProviderRegistry.list_all_active_offers()
    assert len(all_offers) >= 15
    provider_keys_found = {o.provider_key for o in all_offers}
    assert "runpod" in provider_keys_found
    assert "lambda" in provider_keys_found
    assert "aws" in provider_keys_found
    assert "gcp" in provider_keys_found
    assert "azure" in provider_keys_found

    # Verify credential verification helper
    v_res = await ProviderRegistry.verify_credentials("runpod", "mock-key")
    assert v_res["is_valid"] is True
