from typing import Annotated
from decimal import Decimal
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.adapters.persistence.database import get_db
from app.adapters.persistence.models import CostLedgerEntryModel, RunModel
from app.core.security import AuthContext
from app.api.deps import get_current_auth, verify_tenant_access
from app.core.errors import EntityNotFoundError

router = APIRouter(tags=["Usage & Cost Ledger"])


class CostEntryResponse(BaseModel):
    id: str
    entry_type: str
    amount: Decimal
    currency: str
    effective_at: datetime


class RunCostSummaryResponse(BaseModel):
    run_id: str
    estimated_cost: Decimal
    accrued_cost: Decimal
    reconciled_cost: Decimal | None
    currency: str
    ledger_entries: list[CostEntryResponse]


@router.get("/v1/runs/{run_id}/cost", response_model=RunCostSummaryResponse)
async def get_run_cost_summary(
    run_id: str,
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: AsyncSession = Depends(get_db)
):
    """
    Returns transparent cost accounting for a run.
    Strictly differentiates estimated plan costs from accrued and reconciled charges.
    """
    run_stmt = select(RunModel).where(RunModel.id == run_id)
    run_res = await db.execute(run_stmt)
    run = run_res.scalar_one_or_none()
    if not run:
        raise EntityNotFoundError("Run", run_id)
    verify_tenant_access(run.organization_id, auth)

    stmt = (
        select(CostLedgerEntryModel)
        .where(CostLedgerEntryModel.run_id == run_id)
        .order_by(CostLedgerEntryModel.effective_at.asc())
    )
    result = await db.execute(stmt)
    entries = result.scalars().all()

    estimated_cost = Decimal("0.0000")
    accrued_cost = Decimal("0.0000")
    reconciled_cost: Decimal | None = None
    currency = "USD"

    for e in entries:
        currency = e.currency
        if e.entry_type == "ESTIMATE":
            estimated_cost = e.amount
        elif e.entry_type == "ACCRUED_USAGE":
            accrued_cost += e.amount
        elif e.entry_type == "RECONCILED_INVOICE":
            reconciled_cost = e.amount

    return RunCostSummaryResponse(
        run_id=run_id,
        estimated_cost=estimated_cost,
        accrued_cost=accrued_cost,
        reconciled_cost=reconciled_cost,
        currency=currency,
        ledger_entries=[
            CostEntryResponse(
                id=e.id,
                entry_type=e.entry_type,
                amount=e.amount,
                currency=e.currency,
                effective_at=e.effective_at
            )
            for e in entries
        ]
    )


@router.post("/v1/runs/{run_id}/reconcile", response_model=RunCostSummaryResponse)
async def reconcile_run_usage(
    run_id: str,
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    actual_amount: Decimal,
    db: AsyncSession = Depends(get_db)
):
    """
    Appends an accrued or reconciled usage entry into the immutable cost ledger.
    Never overwrites original estimate entries.
    """
    run_stmt = select(RunModel).where(RunModel.id == run_id)
    run_res = await db.execute(run_stmt)
    run = run_res.scalar_one_or_none()
    if not run:
        raise EntityNotFoundError("Run", run_id)
    verify_tenant_access(run.organization_id, auth)

    entry = CostLedgerEntryModel(
        organization_id=auth.organization_id,
        project_id=run.project_id,
        run_id=run.id,
        entry_type="ACCRUED_USAGE",
        amount=actual_amount,
        currency="USD",
        effective_at=datetime.now(timezone.utc)
    )
    db.add(entry)
    await db.flush()

    return await get_run_cost_summary(run_id=run_id, auth=auth, db=db)
