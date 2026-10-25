import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Annotated, Any
from fastapi import APIRouter, Depends, HTTPException, Header, Query, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.adapters.persistence.database import get_db
from app.adapters.persistence.models import (
    RunModel,
    RunStateEventModel,
    CheckpointModel,
    ComputeOfferModel,
    ArbitrageOpportunityModel,
    AuditEventModel,
    WorkloadModel,
    WorkloadRevisionModel,
)
from app.core.security import AuthContext
from app.api.deps import get_current_auth
from app.adapters.providers.registry import ProviderRegistry
from app.domain.checkpoints.transfer_estimator import TransferEstimator
from app.domain.arbitrage.schemas import (
    ArbitrageScanRequest,
    ArbitrageOpportunityResponse,
    ArbitrageApprovalRequest,
    ArbitrageExecutionRequest,
    ArbitrageExecutionResponse,
)
from app.domain.arbitrage.economics import ArbitrageEconomicsEngine
from app.domain.arbitrage.safeguards import AntiOscillationGuard


router = APIRouter(prefix="/v1", tags=["Predictive Compute Arbitrage"])


@router.post("/runs/{run_id}/arbitrage/scan", response_model=list[ArbitrageOpportunityResponse])
async def scan_arbitrage_opportunities(
    run_id: str,
    payload: ArbitrageScanRequest,
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: AsyncSession = Depends(get_db)
):
    """
    Scans real-time compute market for in-flight compute arbitrage opportunities.
    Computes net savings accounting for egress and migration downtime overhead.
    Applies anti-oscillation guards to prevent thrashing.
    """
    # 1. Fetch Run and verify tenant ownership
    run_stmt = select(RunModel).where(RunModel.id == run_id)
    res = await db.execute(run_stmt)
    run = res.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Run not found")
    if run.organization_id != auth.organization_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # 2. Fetch Workload and Revision to understand runtime requirements
    rev_stmt = select(WorkloadRevisionModel).where(WorkloadRevisionModel.id == run.workload_revision_id)
    rev_res = await db.execute(rev_stmt)
    revision = rev_res.scalar_one_or_none()
    timeout_seconds = 7200
    if revision and "execution" in revision.manifest_json:
        timeout_seconds = revision.manifest_json["execution"].get("timeout_seconds", 7200)

    # Calculate run elapsed and remaining runtime
    now = datetime.now(timezone.utc)
    started_at = run.started_at or run.created_at
    if started_at.tzinfo is None:
        started_at = started_at.replace(tzinfo=timezone.utc)
    elapsed_seconds = max(1, int((now - started_at).total_seconds()))
    remaining_seconds = max(600, timeout_seconds - elapsed_seconds)

    # 3. Fetch latest verified checkpoint (if any)
    cp_stmt = (
        select(CheckpointModel)
        .where(CheckpointModel.run_id == run.id, CheckpointModel.is_verified == True)
        .order_by(CheckpointModel.step_number.desc())
    )
    cp_res = await db.execute(cp_stmt)
    latest_checkpoint = cp_res.scalars().first()

    checkpoint_size = latest_checkpoint.size_bytes if latest_checkpoint else 16_000_000_000
    checkpoint_id = latest_checkpoint.id if latest_checkpoint else None

    # 4. Count previous migrations for anti-oscillation check
    mig_count_stmt = select(RunModel).where(
        RunModel.resumed_from_run_id == run.id
    )
    mig_count_res = await db.execute(mig_count_stmt)
    previous_migrations_count = len(mig_count_res.scalars().all())

    # 5. Fetch current compute offer
    current_offer = None
    curr_stmt = select(ComputeOfferModel).where(ComputeOfferModel.id == run.compute_offer_id)
    curr_res = await db.execute(curr_stmt)
    current_offer = curr_res.scalar_one_or_none()

    current_price = Decimal("3.5000")
    source_provider = "AWS"
    if current_offer:
        current_price = current_offer.price_per_hour
        source_provider = current_offer.provider_id
        all_offers = await ProviderRegistry.list_all_active_offers()
    else:
        all_offers = await ProviderRegistry.list_all_active_offers()
        curr_sim = next((o for o in all_offers if o.id == run.compute_offer_id), None)
        if curr_sim:
            current_price = curr_sim.price_per_hour
            source_provider = curr_sim.provider_key

    # 6. Fetch candidate alternative offers across all registered providers & DB catalog
    candidates: list[dict[str, Any]] = [
        {
            "id": o.id,
            "provider": o.provider_key,
            "price": o.price_per_hour,
            "gpu_model": o.gpu_model,
            "vram_gb": o.gpu_memory_gb * o.gpu_count,
            "is_spot": True if ("spot" in o.id.lower() or "rtx" in o.id.lower()) else False,
            "preemption_risk": Decimal("0.150") if ("spot" in o.id.lower() or "rtx" in o.id.lower()) else Decimal("0.020")
        }
        for o in all_offers
        if o.id != run.compute_offer_id
    ]

    opportunities: list[ArbitrageOpportunityResponse] = []

    for candidate in candidates:
        target_price = candidate["price"]
        target_provider = candidate["provider"]
        target_risk = candidate["preemption_risk"]

        # Transfer estimation
        transfer_est = TransferEstimator.estimate(
            checkpoint_id=checkpoint_id or "virtual-cp",
            size_bytes=checkpoint_size,
            source_provider=source_provider,
            target_provider=target_provider,
            bandwidth_gbps=Decimal("10.0")
        )

        # Economic calculation
        econ = ArbitrageEconomicsEngine.calculate(
            current_hourly_cost=current_price,
            target_hourly_cost=target_price,
            remaining_runtime_seconds=remaining_seconds,
            checkpoint_size_bytes=checkpoint_size,
            source_provider=source_provider,
            target_provider=target_provider,
            migration_downtime_seconds=transfer_est.total_migration_downtime_seconds
        )

        # Safeguards check
        guard_eligible, guard_rejections = AntiOscillationGuard.evaluate(
            run_elapsed_seconds=elapsed_seconds,
            previous_migrations_count=previous_migrations_count,
            preemption_risk_score=target_risk,
            min_run_duration_seconds=payload.min_run_duration_seconds
        )

        rejections = list(guard_rejections)

        # Business threshold checks
        if econ.net_savings < payload.min_savings_usd:
            rejections.append(f"Net savings (${econ.net_savings}) below required minimum threshold (${payload.min_savings_usd})")
        if econ.net_savings_percentage < payload.min_savings_percent:
            rejections.append(f"Net savings percentage ({econ.net_savings_percentage}%) below required threshold ({payload.min_savings_percent}%)")
        if transfer_est.total_migration_downtime_seconds > payload.max_downtime_seconds:
            rejections.append(f"Migration downtime ({transfer_est.total_migration_downtime_seconds}s) exceeds max limit ({payload.max_downtime_seconds}s)")
        if target_risk > payload.preemption_risk_tolerance:
            rejections.append(f"Target spot preemption risk ({target_risk}) exceeds risk tolerance ({payload.preemption_risk_tolerance})")

        is_eligible = len(rejections) == 0
        opp_status = "PENDING_APPROVAL" if is_eligible else "EVALUATED"

        opp = ArbitrageOpportunityModel(
            organization_id=auth.organization_id,
            project_id=run.project_id,
            run_id=run.id,
            current_compute_offer_id=run.compute_offer_id,
            target_compute_offer_id=candidate["id"],
            checkpoint_id=checkpoint_id,
            current_hourly_cost=current_price,
            target_hourly_cost=target_price,
            remaining_runtime_seconds=remaining_seconds,
            projected_gross_savings=econ.projected_gross_savings,
            migration_egress_cost=econ.migration_egress_cost,
            migration_downtime_cost=econ.migration_downtime_cost,
            net_savings=econ.net_savings,
            net_savings_percentage=econ.net_savings_percentage,
            preemption_risk_score=target_risk,
            is_eligible=is_eligible,
            rejection_reasons_json=rejections,
            status=opp_status,
            expires_at=now + timedelta(minutes=15)
        )
        db.add(opp)
        await db.flush()

        opportunities.append(
            ArbitrageOpportunityResponse(
                id=opp.id,
                run_id=opp.run_id,
                project_id=opp.project_id,
                current_compute_offer_id=opp.current_compute_offer_id,
                target_compute_offer_id=opp.target_compute_offer_id,
                checkpoint_id=opp.checkpoint_id,
                current_hourly_cost=opp.current_hourly_cost,
                target_hourly_cost=opp.target_hourly_cost,
                remaining_runtime_seconds=opp.remaining_runtime_seconds,
                projected_gross_savings=opp.projected_gross_savings,
                migration_egress_cost=opp.migration_egress_cost,
                migration_downtime_cost=opp.migration_downtime_cost,
                net_savings=opp.net_savings,
                net_savings_percentage=opp.net_savings_percentage,
                preemption_risk_score=opp.preemption_risk_score,
                is_eligible=opp.is_eligible,
                rejection_reasons=opp.rejection_reasons_json,
                status=opp.status,
                execution_run_id=opp.execution_run_id,
                created_at=opp.created_at,
                expires_at=opp.expires_at
            )
        )

    await db.commit()
    # Sort opportunities: eligible first, then highest net savings descending
    opportunities.sort(key=lambda o: (o.is_eligible, o.net_savings), reverse=True)
    return opportunities


@router.get("/runs/{run_id}/arbitrage/opportunities", response_model=list[ArbitrageOpportunityResponse])
async def list_run_arbitrage_opportunities(
    run_id: str,
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: AsyncSession = Depends(get_db)
):
    """
    Lists evaluated arbitrage opportunities for a specific run.
    """
    run_stmt = select(RunModel).where(RunModel.id == run_id)
    res = await db.execute(run_stmt)
    run = res.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Run not found")
    if run.organization_id != auth.organization_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    stmt = (
        select(ArbitrageOpportunityModel)
        .where(ArbitrageOpportunityModel.run_id == run_id)
        .order_by(ArbitrageOpportunityModel.created_at.desc())
    )
    res = await db.execute(stmt)
    opps = res.scalars().all()

    return [
        ArbitrageOpportunityResponse(
            id=o.id,
            run_id=o.run_id,
            project_id=o.project_id,
            current_compute_offer_id=o.current_compute_offer_id,
            target_compute_offer_id=o.target_compute_offer_id,
            checkpoint_id=o.checkpoint_id,
            current_hourly_cost=o.current_hourly_cost,
            target_hourly_cost=o.target_hourly_cost,
            remaining_runtime_seconds=o.remaining_runtime_seconds,
            projected_gross_savings=o.projected_gross_savings,
            migration_egress_cost=o.migration_egress_cost,
            migration_downtime_cost=o.migration_downtime_cost,
            net_savings=o.net_savings,
            net_savings_percentage=o.net_savings_percentage,
            preemption_risk_score=o.preemption_risk_score,
            is_eligible=o.is_eligible,
            rejection_reasons=o.rejection_reasons_json,
            status=o.status,
            execution_run_id=o.execution_run_id,
            created_at=o.created_at,
            expires_at=o.expires_at
        )
        for o in opps
    ]


@router.post("/arbitrage/opportunities/{opportunity_id}/approve", response_model=ArbitrageOpportunityResponse)
async def approve_arbitrage_opportunity(
    opportunity_id: str,
    payload: ArbitrageApprovalRequest,
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: AsyncSession = Depends(get_db)
):
    """
    Approve or reject a pending compute arbitrage opportunity.
    """
    stmt = select(ArbitrageOpportunityModel).where(ArbitrageOpportunityModel.id == opportunity_id)
    res = await db.execute(stmt)
    opp = res.scalar_one_or_none()
    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")
    if opp.organization_id != auth.organization_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    if payload.decision == "APPROVE":
        if not opp.is_eligible:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot approve ineligible arbitrage opportunity")
        opp.status = "APPROVED"
    else:
        opp.status = "REJECTED"

    audit = AuditEventModel(
        organization_id=auth.organization_id,
        actor_id=auth.user_id,
        action=f"arbitrage.{payload.decision.lower()}",
        resource_type="arbitrage_opportunity",
        resource_id=opp.id,
        result="SUCCESS",
        request_id=f"req-{uuid.uuid4().hex[:12]}",
        safe_metadata_json={
            "decision": payload.decision,
            "reason": payload.reason,
            "net_savings": str(opp.net_savings)
        }
    )
    db.add(audit)
    await db.commit()
    await db.refresh(opp)

    return ArbitrageOpportunityResponse(
        id=opp.id,
        run_id=opp.run_id,
        project_id=opp.project_id,
        current_compute_offer_id=opp.current_compute_offer_id,
        target_compute_offer_id=opp.target_compute_offer_id,
        checkpoint_id=opp.checkpoint_id,
        current_hourly_cost=opp.current_hourly_cost,
        target_hourly_cost=opp.target_hourly_cost,
        remaining_runtime_seconds=opp.remaining_runtime_seconds,
        projected_gross_savings=opp.projected_gross_savings,
        migration_egress_cost=opp.migration_egress_cost,
        migration_downtime_cost=opp.migration_downtime_cost,
        net_savings=opp.net_savings,
        net_savings_percentage=opp.net_savings_percentage,
        preemption_risk_score=opp.preemption_risk_score,
        is_eligible=opp.is_eligible,
        rejection_reasons=opp.rejection_reasons_json,
        status=opp.status,
        execution_run_id=opp.execution_run_id,
        created_at=opp.created_at,
        expires_at=opp.expires_at
    )


@router.post("/arbitrage/opportunities/{opportunity_id}/execute", response_model=ArbitrageExecutionResponse, status_code=status.HTTP_201_CREATED)
async def execute_arbitrage_migration(
    opportunity_id: str,
    payload: ArbitrageExecutionRequest,
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """
    Executes an approved compute arbitrage migration, spawning a new resumed run
    on the target provider and gracefully canceling the original run.
    """
    stmt = select(ArbitrageOpportunityModel, RunModel).join(RunModel, ArbitrageOpportunityModel.run_id == RunModel.id).where(ArbitrageOpportunityModel.id == opportunity_id)
    res = await db.execute(stmt)
    row = res.first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")
    opp, original_run = row
    if opp.organization_id != auth.organization_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Idempotency check
    if opp.status == "EXECUTED" and opp.execution_run_id:
        response.status_code = status.HTTP_200_OK
        return ArbitrageExecutionResponse(
            opportunity_id=opp.id,
            original_run_id=original_run.id,
            resumed_run_id=opp.execution_run_id,
            status="EXECUTED",
            net_savings=opp.net_savings,
            target_compute_offer_id=opp.target_compute_offer_id,
            executed_at=opp.created_at
        )

    if opp.status not in ("APPROVED", "PENDING_APPROVAL"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot execute opportunity in status '{opp.status}'")

    # Resolve target compute offer
    offer_stmt = select(ComputeOfferModel).where(ComputeOfferModel.id == opp.target_compute_offer_id)
    offer_res = await db.execute(offer_stmt)
    target_offer = offer_res.scalar_one_or_none()
    target_offer_id = opp.target_compute_offer_id
    if target_offer:
        target_offer_id = target_offer.id

    now = datetime.now(timezone.utc)

    # Create new resumed run
    new_resumed_run = RunModel(
        organization_id=auth.organization_id,
        project_id=original_run.project_id,
        workload_revision_id=original_run.workload_revision_id,
        plan_id=original_run.plan_id,
        compute_offer_id=target_offer_id,
        status="PROVISIONING",
        idempotency_key=payload.idempotency_key,
        provider_resource_id=f"prov-migrated-{opp.id[:8]}",
        resumed_from_checkpoint_id=opp.checkpoint_id,
        resumed_from_run_id=original_run.id,
        created_by=auth.user_id,
        created_at=now,
        updated_at=now
    )
    db.add(new_resumed_run)
    await db.flush()

    # Append run state event for resumed run
    event = RunStateEventModel(
        run_id=new_resumed_run.id,
        from_state="NONE",
        to_state="PROVISIONING",
        reason_code="ARBITRAGE_MIGRATION",
        actor_id=auth.user_id,
        correlation_id=f"arbitrage-{payload.idempotency_key[:16]}",
        metadata_json={
            "opportunity_id": opp.id,
            "original_run_id": original_run.id,
            "projected_net_savings": str(opp.net_savings),
            "target_offer_id": target_offer_id
        }
    )
    db.add(event)

    # Gracefully transition original run to CANCELED/MIGRATED
    original_run.status = "CANCELED"
    original_run.ended_at = now
    term_event = RunStateEventModel(
        run_id=original_run.id,
        from_state="RUNNING",
        to_state="CANCELED",
        reason_code="ARBITRAGE_MIGRATED",
        actor_id=auth.user_id,
        correlation_id=f"arbitrage-{payload.idempotency_key[:16]}",
        metadata_json={
            "migrated_to_run_id": new_resumed_run.id,
            "opportunity_id": opp.id
        }
    )
    db.add(term_event)

    # Update opportunity
    opp.status = "EXECUTED"
    opp.execution_run_id = new_resumed_run.id

    audit = AuditEventModel(
        organization_id=auth.organization_id,
        actor_id=auth.user_id,
        action="arbitrage.execute",
        resource_type="arbitrage_opportunity",
        resource_id=opp.id,
        result="SUCCESS",
        request_id=f"req-{uuid.uuid4().hex[:12]}",
        safe_metadata_json={
            "original_run_id": original_run.id,
            "resumed_run_id": new_resumed_run.id,
            "net_savings": str(opp.net_savings)
        }
    )
    db.add(audit)
    await db.commit()

    return ArbitrageExecutionResponse(
        opportunity_id=opp.id,
        original_run_id=original_run.id,
        resumed_run_id=new_resumed_run.id,
        status="EXECUTED",
        net_savings=opp.net_savings,
        target_compute_offer_id=target_offer_id,
        executed_at=now
    )
