from typing import Annotated
from decimal import Decimal
from fastapi import APIRouter, Depends, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.adapters.persistence.database import get_db
from app.adapters.persistence.models import (
    ProviderModel,
    ComputeOfferModel,
    PriceObservationModel,
    RegionModel,
    ProviderConnectionModel
)
from app.adapters.providers.fake_provider import FakeProviderAdapter
from app.core.security import AuthContext
from app.api.deps import get_current_auth, verify_tenant_access
from app.core.errors import EntityNotFoundError

router = APIRouter(tags=["Providers & Offers"])

fake_adapter = FakeProviderAdapter()


class ProviderResponse(BaseModel):
    id: str
    key: str
    display_name: str
    status: str
    capabilities: dict


class ComputeOfferResponse(BaseModel):
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
    price_per_hour: Decimal
    currency: str
    source_type: str
    freshness_status: str


class ProviderConnectionCreate(BaseModel):
    provider_id: str
    display_name: str
    secret_reference: str = Field(..., description="Opaque reference to external secret store; NEVER raw credentials")


class ProviderConnectionResponse(BaseModel):
    id: str
    organization_id: str
    provider_id: str
    display_name: str
    status: str
    secret_reference_masked: str


@router.get("/v1/providers", response_model=list[ProviderResponse])
async def list_providers(
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: AsyncSession = Depends(get_db)
):
    stmt = select(ProviderModel)
    result = await db.execute(stmt)
    providers = result.scalars().all()

    if not providers:
        # Fallback to in-memory fake provider description for initial bootstrap
        caps = await fake_adapter.get_capabilities()
        return [
            ProviderResponse(
                id="prov-simulated-001",
                key=fake_adapter.provider_key,
                display_name=fake_adapter.provider_name,
                status="ACTIVE",
                capabilities=caps.model_dump()
            )
        ]

    return [
        ProviderResponse(
            id=p.id,
            key=p.key,
            display_name=p.display_name,
            status=p.status,
            capabilities=p.capabilities_json
        )
        for p in providers
    ]


@router.get("/v1/compute-offers", response_model=list[ComputeOfferResponse])
async def list_compute_offers(
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    region: str | None = Query(None),
    gpu_model: str | None = Query(None),
    min_vram: int | None = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns normalized compute offers with pricing and freshness.
    Clearly distinguishes simulated data from verified live provider data.
    """
    # Fetch from FakeProviderAdapter which serves as our deterministic source
    offers = await fake_adapter.list_offers()

    filtered = offers
    if region:
        filtered = [o for o in filtered if o.region_key == region]
    if gpu_model:
        filtered = [o for o in filtered if o.gpu_model.lower() == gpu_model.lower()]
    if min_vram:
        filtered = [o for o in filtered if o.gpu_memory_gb >= min_vram]

    return [
        ComputeOfferResponse(
            id=o.id,
            provider_key=o.provider_key,
            region_key=o.region_key,
            external_offer_key=o.external_offer_key,
            gpu_model=o.gpu_model,
            gpu_count=o.gpu_count,
            gpu_memory_gb=o.gpu_memory_gb,
            cpu_cores=o.cpu_cores,
            ram_gb=o.ram_gb,
            storage_gb=o.storage_gb,
            price_per_hour=o.price_per_hour,
            currency=o.currency.value,
            source_type=o.source_type.value,
            freshness_status=o.freshness_status
        )
        for o in filtered
    ]


@router.post("/v1/provider-connections", response_model=ProviderConnectionResponse, status_code=status.HTTP_201_CREATED)
async def connect_provider(
    payload: ProviderConnectionCreate,
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: AsyncSession = Depends(get_db)
):
    conn = ProviderConnectionModel(
        organization_id=auth.organization_id,
        provider_id=payload.provider_id,
        display_name=payload.display_name,
        secret_reference=payload.secret_reference,
        status="ACTIVE"
    )
    db.add(conn)
    await db.flush()

    # Mask secret reference in response for defense-in-depth
    masked = payload.secret_reference[:4] + "***" if len(payload.secret_reference) > 4 else "***"
    return ProviderConnectionResponse(
        id=conn.id,
        organization_id=conn.organization_id,
        provider_id=conn.provider_id,
        display_name=conn.display_name,
        status=conn.status,
        secret_reference_masked=masked
    )


@router.get("/v1/provider-connections", response_model=list[ProviderConnectionResponse])
async def list_provider_connections(
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(ProviderConnectionModel)
        .where(ProviderConnectionModel.organization_id == auth.organization_id)
        .order_by(ProviderConnectionModel.created_at.desc())
    )
    result = await db.execute(stmt)
    conns = result.scalars().all()
    return [
        ProviderConnectionResponse(
            id=c.id,
            organization_id=c.organization_id,
            provider_id=c.provider_id,
            display_name=c.display_name,
            status=c.status,
            secret_reference_masked=c.secret_reference[:4] + "***" if len(c.secret_reference) > 4 else "***"
        )
        for c in conns
    ]
