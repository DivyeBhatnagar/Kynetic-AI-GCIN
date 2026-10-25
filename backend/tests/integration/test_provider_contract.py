import pytest
from app.adapters.providers.fake_provider import FakeProviderAdapter
from app.ports.provider_adapter import LaunchRequest


@pytest.mark.asyncio
async def test_fake_provider_contract_and_idempotency():
    adapter = FakeProviderAdapter()

    # Capabilities and regions
    caps = await adapter.get_capabilities()
    assert caps.supports_custom_images is True

    regions = await adapter.list_regions()
    assert len(regions) >= 3

    offers = await adapter.list_offers()
    assert len(offers) >= 4
    # All simulated offers must be labelled explicitly
    assert all(o.source_type.value == "SIMULATED" for o in offers)

    # Launch validation
    req = LaunchRequest(
        run_id="run-123",
        compute_offer_id=offers[0].id,
        image_uri="pytorch/pytorch:2.2.0-cuda12.1-cudnn8-runtime",
        command=["python", "train.py"]
    )
    val = await adapter.validate_launch(req)
    assert val.is_valid is True

    # Resource creation with Idempotency Key
    idempotency_key = "idemp-test-unique-key-001"
    resource1 = await adapter.create_resource(req, idempotency_key=idempotency_key)
    assert resource1.provider_resource_id.startswith("sim-inst-")
    assert resource1.status == "RUNNING"

    # Repeated create with identical idempotency key must return same instance
    resource2 = await adapter.create_resource(req, idempotency_key=idempotency_key)
    assert resource2.provider_resource_id == resource1.provider_resource_id

    # Stop and terminate lifecycle
    stop_res = await adapter.stop_resource(resource1.provider_resource_id)
    assert stop_res.success is True

    term_res = await adapter.terminate_resource(resource1.provider_resource_id, idempotency_key="term-key")
    assert term_res.success is True
