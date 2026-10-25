import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Annotated, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.adapters.persistence.database import get_db
from app.adapters.persistence.models import (
    RunModel,
    RunStateEventModel,
    CheckpointModel,
    CheckpointVerificationLogModel,
    ComputeOfferModel,
    AuditEventModel,
)
from app.core.security import AuthContext
from app.api.deps import get_current_auth
from app.domain.checkpoints.schemas import (
    CheckpointCreateRequest,
    CheckpointResponse,
    CheckpointVerificationReport,
    TransferEstimationRequest,
    TransferEstimationResponse,
    ResumptionRequest,
    ResumptionResponse,
)
from app.domain.checkpoints.verifier import CheckpointVerifier, compute_required_vram_gb
from app.domain.checkpoints.transfer_estimator import TransferEstimator
from app.adapters.providers.fake_provider import FakeProviderAdapter


router = APIRouter(prefix="/v1", tags=["Checkpoints & Resumption"])
fake_adapter = FakeProviderAdapter()


@router.post("/runs/{run_id}/checkpoints", response_model=CheckpointResponse, status_code=status.HTTP_201_CREATED)
async def register_checkpoint(
    run_id: str,
    payload: CheckpointCreateRequest,
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: AsyncSession = Depends(get_db)
):
    """
    Registers a training checkpoint saved by a workload run, recording its cryptographic
    SHA-256 digest, storage URI, and framework metadata.
    """
    run_stmt = select(RunModel).where(RunModel.id == run_id)
    res = await db.execute(run_stmt)
    run = res.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Run not found")
    if run.organization_id != auth.organization_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this run")

    checkpoint = CheckpointModel(
        run_id=run.id,
        project_id=run.project_id,
        step_number=payload.step_number,
        epoch=payload.epoch,
        format=payload.format,
        storage_uri=payload.storage_uri,
        size_bytes=payload.size_bytes,
        sha256_digest=payload.sha256_digest,
        framework_metadata_json=payload.framework_metadata,
        is_verified=False,
        verification_status="PENDING"
    )
    db.add(checkpoint)
    await db.flush()

    # Automatically perform verification step on registration
    report = CheckpointVerifier.verify(
        checkpoint_id=checkpoint.id,
        storage_uri=checkpoint.storage_uri,
        format_type=checkpoint.format,
        size_bytes=checkpoint.size_bytes,
        sha256_digest=checkpoint.sha256_digest,
        framework_metadata=checkpoint.framework_metadata_json
    )

    checkpoint.is_verified = report.is_verified
    checkpoint.verification_status = report.overall_status
    if report.is_verified:
        checkpoint.verified_at = report.verified_at

    for step in report.steps:
        log_entry = CheckpointVerificationLogModel(
            checkpoint_id=checkpoint.id,
            verification_step=step.step_name,
            status=step.status,
            details_json=step.details
        )
        db.add(log_entry)

    # Audit event
    audit = AuditEventModel(
        organization_id=auth.organization_id,
        actor_id=auth.user_id,
        action="checkpoint.register",
        resource_type="checkpoint",
        resource_id=checkpoint.id,
        result="SUCCESS",
        request_id=f"req-{uuid.uuid4().hex[:12]}",
        safe_metadata_json={
            "run_id": run.id,
            "step_number": checkpoint.step_number,
            "size_bytes": checkpoint.size_bytes,
            "verification_status": checkpoint.verification_status
        }
    )
    db.add(audit)
    await db.commit()
    await db.refresh(checkpoint)

    return CheckpointResponse(
        id=checkpoint.id,
        run_id=checkpoint.run_id,
        project_id=checkpoint.project_id,
        step_number=checkpoint.step_number,
        epoch=checkpoint.epoch,
        format=checkpoint.format,
        storage_uri=checkpoint.storage_uri,
        size_bytes=checkpoint.size_bytes,
        sha256_digest=checkpoint.sha256_digest,
        framework_metadata=checkpoint.framework_metadata_json,
        is_verified=checkpoint.is_verified,
        verification_status=checkpoint.verification_status,
        verified_at=checkpoint.verified_at,
        created_at=checkpoint.created_at
    )


@router.get("/runs/{run_id}/checkpoints", response_model=list[CheckpointResponse])
async def list_run_checkpoints(
    run_id: str,
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: AsyncSession = Depends(get_db)
):
    """
    Lists all checkpoints saved by a run, ordered by step number descending.
    """
    run_stmt = select(RunModel).where(RunModel.id == run_id)
    res = await db.execute(run_stmt)
    run = res.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Run not found")
    if run.organization_id != auth.organization_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    stmt = select(CheckpointModel).where(CheckpointModel.run_id == run_id).order_by(CheckpointModel.step_number.desc())
    res = await db.execute(stmt)
    checkpoints = res.scalars().all()

    return [
        CheckpointResponse(
            id=cp.id,
            run_id=cp.run_id,
            project_id=cp.project_id,
            step_number=cp.step_number,
            epoch=cp.epoch,
            format=cp.format,
            storage_uri=cp.storage_uri,
            size_bytes=cp.size_bytes,
            sha256_digest=cp.sha256_digest,
            framework_metadata=cp.framework_metadata_json,
            is_verified=cp.is_verified,
            verification_status=cp.verification_status,
            verified_at=cp.verified_at,
            created_at=cp.created_at
        )
        for cp in checkpoints
    ]


@router.get("/checkpoints/{checkpoint_id}", response_model=CheckpointResponse)
async def get_checkpoint_detail(
    checkpoint_id: str,
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves full metadata and verification status for a specific checkpoint.
    """
    stmt = (
        select(CheckpointModel, RunModel.organization_id)
        .join(RunModel, CheckpointModel.run_id == RunModel.id)
        .where(CheckpointModel.id == checkpoint_id)
    )
    res = await db.execute(stmt)
    row = res.first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Checkpoint not found")

    cp, org_id = row
    if org_id != auth.organization_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return CheckpointResponse(
        id=cp.id,
        run_id=cp.run_id,
        project_id=cp.project_id,
        step_number=cp.step_number,
        epoch=cp.epoch,
        format=cp.format,
        storage_uri=cp.storage_uri,
        size_bytes=cp.size_bytes,
        sha256_digest=cp.sha256_digest,
        framework_metadata=cp.framework_metadata_json,
        is_verified=cp.is_verified,
        verification_status=cp.verification_status,
        verified_at=cp.verified_at,
        created_at=cp.created_at
    )


@router.post("/checkpoints/{checkpoint_id}/verify", response_model=CheckpointVerificationReport)
async def verify_checkpoint(
    checkpoint_id: str,
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    target_compute_offer_id: str | None = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Performs deep cryptographic and hardware VRAM verification for a checkpoint,
    auditing verification logs and certifying readiness for cluster migration.
    """
    stmt = (
        select(CheckpointModel, RunModel.organization_id)
        .join(RunModel, CheckpointModel.run_id == RunModel.id)
        .where(CheckpointModel.id == checkpoint_id)
    )
    res = await db.execute(stmt)
    row = res.first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Checkpoint not found")
    cp, org_id = row
    if org_id != auth.organization_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    target_vram_gb = None
    if target_compute_offer_id:
        offer_stmt = select(ComputeOfferModel).where(ComputeOfferModel.id == target_compute_offer_id)
        offer_res = await db.execute(offer_stmt)
        offer = offer_res.scalar_one_or_none()
        if offer:
            target_vram_gb = offer.gpu_memory_gb * offer.gpu_count
        else:
            sim_offers = await fake_adapter.list_offers()
            sim_match = next((o for o in sim_offers if o.id == target_compute_offer_id), None)
            if sim_match:
                target_vram_gb = sim_match.gpu_memory_gb * sim_match.gpu_count

    report = CheckpointVerifier.verify(
        checkpoint_id=cp.id,
        storage_uri=cp.storage_uri,
        format_type=cp.format,
        size_bytes=cp.size_bytes,
        sha256_digest=cp.sha256_digest,
        framework_metadata=cp.framework_metadata_json,
        target_vram_gb=target_vram_gb
    )

    cp.is_verified = report.is_verified
    cp.verification_status = report.overall_status
    if report.is_verified:
        cp.verified_at = report.verified_at

    for step in report.steps:
        log_entry = CheckpointVerificationLogModel(
            checkpoint_id=cp.id,
            verification_step=step.step_name,
            status=step.status,
            details_json=step.details
        )
        db.add(log_entry)

    audit = AuditEventModel(
        organization_id=auth.organization_id,
        actor_id=auth.user_id,
        action="checkpoint.verify",
        resource_type="checkpoint",
        resource_id=cp.id,
        result="SUCCESS",
        request_id=f"req-{uuid.uuid4().hex[:12]}",
        safe_metadata_json={
            "overall_status": report.overall_status,
            "target_compute_offer_id": target_compute_offer_id
        }
    )
    db.add(audit)
    await db.commit()
    return report


@router.post("/checkpoints/{checkpoint_id}/estimate-transfer", response_model=TransferEstimationResponse)
async def estimate_checkpoint_transfer(
    checkpoint_id: str,
    payload: TransferEstimationRequest,
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: AsyncSession = Depends(get_db)
):
    """
    Estimates network transfer latency, egress charges, and migration downtime
    when moving a checkpoint between cloud providers.
    """
    stmt = (
        select(CheckpointModel, RunModel.organization_id)
        .join(RunModel, CheckpointModel.run_id == RunModel.id)
        .where(CheckpointModel.id == checkpoint_id)
    )
    res = await db.execute(stmt)
    row = res.first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Checkpoint not found")
    cp, org_id = row
    if org_id != auth.organization_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return TransferEstimator.estimate(
        checkpoint_id=cp.id,
        size_bytes=cp.size_bytes,
        source_provider=payload.source_provider_code,
        target_provider=payload.target_provider_code,
        bandwidth_gbps=payload.network_bandwidth_gbps
    )


@router.post("/checkpoints/{checkpoint_id}/resume", response_model=ResumptionResponse, status_code=status.HTTP_201_CREATED)
async def resume_from_checkpoint(
    checkpoint_id: str,
    payload: ResumptionRequest,
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: AsyncSession = Depends(get_db)
):
    """
    Resumes training execution from a validated checkpoint on a specified target compute offer,
    enforcing cryptographic integrity, VRAM compatibility, and lineage tracking.
    """
    stmt = (
        select(CheckpointModel, RunModel)
        .join(RunModel, CheckpointModel.run_id == RunModel.id)
        .where(CheckpointModel.id == checkpoint_id)
    )
    res = await db.execute(stmt)
    row = res.first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Checkpoint not found")
    cp, original_run = row
    if original_run.organization_id != auth.organization_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to original run")

    if not cp.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot resume from unverified checkpoint. Status: {cp.verification_status}"
        )

    # Check target compute offer (database first, simulated provider fallback)
    offer_stmt = select(ComputeOfferModel).where(ComputeOfferModel.id == payload.target_compute_offer_id)
    offer_res = await db.execute(offer_stmt)
    offer = offer_res.scalar_one_or_none()

    if offer:
        offer_id = offer.id
        gpu_model = offer.gpu_model
        gpu_count = offer.gpu_count
        total_target_vram = offer.gpu_memory_gb * offer.gpu_count
        if not offer.is_available:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Target compute offer is not currently available")
    else:
        sim_offers = await fake_adapter.list_offers()
        sim_match = next((o for o in sim_offers if o.id == payload.target_compute_offer_id), None)
        if not sim_match:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target compute offer not found")
        offer_id = sim_match.id
        gpu_model = sim_match.gpu_model
        gpu_count = sim_match.gpu_count
        total_target_vram = sim_match.gpu_memory_gb * sim_match.gpu_count

    # Check VRAM compatibility
    required_vram = compute_required_vram_gb(cp.framework_metadata_json)
    if Decimal(str(total_target_vram)) < required_vram:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Target compute offer has insufficient VRAM ({total_target_vram} GB) for model footprint ({required_vram} GB). Resumption aborted to prevent CUDA OOM."
        )

    # Check idempotency
    existing_resumed_stmt = select(RunModel).where(
        RunModel.organization_id == auth.organization_id,
        RunModel.idempotency_key == payload.idempotency_key
    )
    existing_res = await db.execute(existing_resumed_stmt)
    existing_run = existing_res.scalar_one_or_none()
    if existing_run:
        return ResumptionResponse(
            new_run_id=existing_run.id,
            resumed_from_run_id=original_run.id,
            resumed_from_checkpoint_id=cp.id,
            step_number=cp.step_number,
            target_compute_offer_id=existing_run.compute_offer_id,
            status=existing_run.status,
            allocated_gpu_count=gpu_count,
            gpu_model=gpu_model,
            estimated_total_vram_gb=total_target_vram,
            created_at=existing_run.created_at
        )

    # Create new Resumed Run
    now = datetime.now(timezone.utc)
    new_run = RunModel(
        organization_id=auth.organization_id,
        project_id=original_run.project_id,
        workload_revision_id=original_run.workload_revision_id,
        plan_id=original_run.plan_id,
        compute_offer_id=offer_id,
        status="PROVISIONING",
        idempotency_key=payload.idempotency_key,
        provider_resource_id=f"prov-resumed-{cp.id[:8]}",
        resumed_from_checkpoint_id=cp.id,
        resumed_from_run_id=original_run.id,
        created_by=auth.user_id,
        created_at=now,
        updated_at=now
    )
    db.add(new_run)
    await db.flush()

    # Append state event
    event = RunStateEventModel(
        run_id=new_run.id,
        from_state="NONE",
        to_state="PROVISIONING",
        reason_code="RESUMPTION_FROM_CHECKPOINT",
        actor_id=auth.user_id,
        correlation_id=f"resumed-{payload.idempotency_key[:16]}",
        metadata_json={
            "resumed_from_checkpoint_id": cp.id,
            "resumed_from_run_id": original_run.id,
            "step_number": cp.step_number,
            "reason": payload.reason
        }
    )
    db.add(event)

    audit = AuditEventModel(
        organization_id=auth.organization_id,
        actor_id=auth.user_id,
        action="run.resume_from_checkpoint",
        resource_type="run",
        resource_id=new_run.id,
        result="SUCCESS",
        request_id=f"req-{uuid.uuid4().hex[:12]}",
        safe_metadata_json={
            "original_run_id": original_run.id,
            "checkpoint_id": cp.id,
            "step_number": cp.step_number,
            "target_offer_id": offer_id
        }
    )
    db.add(audit)
    await db.commit()
    await db.refresh(new_run)

    return ResumptionResponse(
        new_run_id=new_run.id,
        resumed_from_run_id=original_run.id,
        resumed_from_checkpoint_id=cp.id,
        step_number=cp.step_number,
        target_compute_offer_id=offer_id,
        status=new_run.status,
        allocated_gpu_count=gpu_count,
        gpu_model=gpu_model,
        estimated_total_vram_gb=total_target_vram,
        created_at=new_run.created_at
    )
