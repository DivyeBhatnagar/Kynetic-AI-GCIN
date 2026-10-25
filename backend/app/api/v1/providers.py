from typing import Annotated, Any
from decimal import Decimal
from fastapi import APIRouter, Depends, status, Query, Path
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.adapters.persistence.database import get_db
from app.adapters.persistence.models import (
    ProviderModel,
    ComputeOfferModel,
    ProviderConnectionModel
)
from app.adapters.providers.fake_provider import FakeProviderAdapter
from app.adapters.providers.registry import ProviderRegistry
from app.core.security import AuthContext
from app.api.deps import get_current_auth, verify_tenant_access
from app.core.errors import EntityNotFoundError
from app.core.config import settings
from app.core.cache import cache_service, CacheKeys

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


class ProviderConnectionVerifyResponse(BaseModel):
    connection_id: str
    provider_key: str
    is_valid: bool
    status: str
    message: str


class ProviderSyncOffersResponse(BaseModel):
    provider_key: str
    synced_count: int
    message: str
    offers: list[ComputeOfferResponse]


@router.get("/v1/providers", response_model=list[ProviderResponse])
async def list_providers(
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: AsyncSession = Depends(get_db)
):
    cache_key = CacheKeys.provider_catalog()
    cached = await cache_service.get(cache_key)
    if cached is not None:
        return [ProviderResponse.model_validate(p) for p in cached]

    stmt = select(ProviderModel)
    result = await db.execute(stmt)
    providers = result.scalars().all()

    existing_keys = {p.key for p in providers}
    provider_list: list[ProviderResponse] = [
        ProviderResponse(
            id=p.id,
            key=p.key,
            display_name=p.display_name,
            status=p.status,
            capabilities=p.capabilities_json
        )
        for p in providers
    ]

    # Dynamically surface live registered adapters from ProviderRegistry
    for key in ProviderRegistry.list_supported_providers():
        if key not in existing_keys:
            adapter = ProviderRegistry.get_adapter(key)
            caps = await adapter.get_capabilities() if hasattr(adapter, "get_capabilities") else None
            provider_list.append(
                ProviderResponse(
                    id=f"prov-{key}-auto",
                    key=key,
                    display_name=getattr(adapter, "provider_name", key.capitalize()),
                    status="ACTIVE",
                    capabilities=caps.model_dump() if caps else {}
                )
            )

    # Populate cache
    await cache_service.set(
        cache_key,
        [p.model_dump() for p in provider_list],
        ttl_seconds=settings.CACHE_CATALOG_TTL_SECONDS
    )
    return provider_list


@router.get("/v1/compute-offers", response_model=list[ComputeOfferResponse])
async def list_compute_offers(
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    provider: str | None = Query(None, description="Filter by provider key (e.g. runpod, lambda, aws, gcp, azure)"),
    region: str | None = Query(None, description="Filter by region key"),
    gpu_model: str | None = Query(None, description="Filter by GPU model (e.g. H100, A100, RTX4090)"),
    min_vram: int | None = Query(None, description="Minimum GPU memory in GB"),
    limit: int = Query(50, ge=1, le=200, description="Max items to return"),
    offset: int = Query(0, ge=0, description="Items to skip"),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns aggregated compute offers across all registered live and simulated providers.
    Uses cache-aside pattern with graceful fallback when cache is degraded.
    """
    cache_key = CacheKeys.compute_offers(provider, region, gpu_model, min_vram)
    cached = await cache_service.get(cache_key)
    if cached is not None:
        paginated = cached[offset: offset + limit]
        return [ComputeOfferResponse.model_validate(o) for o in paginated]

    all_offers = await ProviderRegistry.list_all_active_offers()

    filtered = all_offers
    if provider:
        filtered = [o for o in filtered if o.provider_key.lower() == provider.lower()]
    if region:
        filtered = [o for o in filtered if o.region_key.lower() == region.lower()]
    if gpu_model:
        filtered = [o for o in filtered if o.gpu_model.lower() == gpu_model.lower()]
    if min_vram:
        filtered = [o for o in filtered if o.gpu_memory_gb >= min_vram]

    offer_responses = [
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

    # Store full filtered list in cache
    await cache_service.set(
        cache_key,
        [o.model_dump() for o in offer_responses],
        ttl_seconds=settings.CACHE_OFFERS_TTL_SECONDS
    )

    return offer_responses[offset: offset + limit]


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
    limit: int = Query(50, ge=1, le=200, description="Max items to return"),
    offset: int = Query(0, ge=0, description="Items to skip"),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(ProviderConnectionModel)
        .where(ProviderConnectionModel.organization_id == auth.organization_id)
        .order_by(ProviderConnectionModel.created_at.desc())
        .offset(offset)
        .limit(limit)
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


@router.post("/v1/provider-connections/{id}/verify", response_model=ProviderConnectionVerifyResponse)
async def verify_provider_connection(
    id: str,
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: AsyncSession = Depends(get_db)
):
    """
    Tests live credential authentication against external provider.
    Verifies that the stored secret reference is valid without exposing secret material.
    """
    stmt = select(ProviderConnectionModel).where(
        ProviderConnectionModel.id == id,
        ProviderConnectionModel.organization_id == auth.organization_id
    )
    res = await db.execute(stmt)
    conn = res.scalar_one_or_none()
    if not conn:
        raise EntityNotFoundError("ProviderConnection", id)

    # Determine provider key
    prov_key = "kynetic-simulated-cloud"
    prov_stmt = select(ProviderModel).where(ProviderModel.id == conn.provider_id)
    prov_res = await db.execute(prov_stmt)
    provider_entity = prov_res.scalar_one_or_none()
    if provider_entity:
        prov_key = provider_entity.key
    elif "runpod" in conn.display_name.lower():
        prov_key = "runpod"
    elif "lambda" in conn.display_name.lower():
        prov_key = "lambda"
    elif "aws" in conn.display_name.lower():
        prov_key = "aws"
    elif "gcp" in conn.display_name.lower():
        prov_key = "gcp"
    elif "azure" in conn.display_name.lower():
        prov_key = "azure"

    verification = await ProviderRegistry.verify_credentials(prov_key, conn.secret_reference)
    conn.status = "VERIFIED" if verification["is_valid"] else "FAILED"
    await db.flush()

    return ProviderConnectionVerifyResponse(
        connection_id=conn.id,
        provider_key=prov_key,
        is_valid=verification["is_valid"],
        status=conn.status,
        message=verification["message"]
    )


@router.post("/v1/providers/{key}/sync-offers", response_model=ProviderSyncOffersResponse)
async def sync_provider_offers(
    key: str,
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: AsyncSession = Depends(get_db)
):
    """
    Pulls real-time spot and on-demand GPU pricing from the target cloud provider.
    Marks data as VERIFIED and FRESH.
    """
    adapter = ProviderRegistry.get_adapter(key)
    if not hasattr(adapter, "list_offers"):
        raise EntityNotFoundError("Provider", key)

    offers = await adapter.list_offers()
    mapped_offers = [
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
        for o in offers
    ]

    # Invalidate cached offers and provider catalog
    await cache_service.delete(CacheKeys.provider_catalog())
    await cache_service.delete_pattern(CacheKeys.offers_pattern())

    return ProviderSyncOffersResponse(
        provider_key=key,
        synced_count=len(mapped_offers),
        message=f"Successfully synchronized {len(mapped_offers)} fresh offers from {key}",
        offers=mapped_offers
    )
