from typing import Annotated, Any
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.adapters.persistence.database import get_db
from app.adapters.persistence.models import (
    WorkloadModel,
    WorkloadRevisionModel,
    ProjectPolicyModel,
    PlanModel,
    PlanCandidateModel
)
from app.adapters.providers.registry import ProviderRegistry
from app.domain.workloads.manifest import WorkloadManifest
from app.domain.planning.candidate_evaluator import CandidateEvaluator, CandidateEvaluation
from app.core.security import AuthContext, Role
from app.api.deps import get_current_auth, verify_tenant_access
from app.core.errors import EntityNotFoundError, ConstraintUnsatisfiableError, AuthorizationError

router = APIRouter(tags=["Planning & Dry-Runs"])


class PlanCandidateResponse(BaseModel):
    id: str | None = None
    offer_id: str
    provider_key: str
    provider_name: str
    region_key: str
    gpu_model: str
    gpu_count: int
    gpu_memory_gb: int
    is_eligible: bool
    rejection_reasons: list[str]
    rank: int | None
    estimated_cost: Decimal | None
    currency: str
    explanation: str


class PlanResponse(BaseModel):
    id: str
    organization_id: str
    project_id: str
    workload_id: str
    version: int
    status: str
    selected_candidate: PlanCandidateResponse | None
    candidates: list[PlanCandidateResponse]
    estimated_total_cost: Decimal
    currency: str
    assumptions: list[str]
    warnings: list[str]
    expires_at: datetime
    created_at: datetime


@router.post("/v1/workloads/{workload_id}/plans", response_model=PlanResponse, status_code=status.HTTP_201_CREATED)
async def create_execution_plan(
    workload_id: str,
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: AsyncSession = Depends(get_db)
):
    """
    Generates a versioned, side-effect-free dry-run plan.
    Evaluates hard constraints, calculates transparent Decimal cost estimates, and explains trade-offs.
    Strictly DOES NOT provision compute or incur provider charges.
    """
    # 1. Load Workload and Latest Revision
    stmt = select(WorkloadModel).where(WorkloadModel.id == workload_id)
    result = await db.execute(stmt)
    workload = result.scalar_one_or_none()
    if not workload:
        raise EntityNotFoundError("Workload", workload_id)
    verify_tenant_access(workload.organization_id, auth)

    rev_stmt = select(WorkloadRevisionModel).where(WorkloadRevisionModel.id == workload.current_revision_id)
    rev_res = await db.execute(rev_stmt)
    revision = rev_res.scalar_one_or_none()
    if not revision:
        raise EntityNotFoundError("WorkloadRevision", workload.current_revision_id or "latest")

    manifest = WorkloadManifest.model_validate(revision.manifest_json)

    # 2. Load Project Policy
    policy_stmt = select(ProjectPolicyModel).where(ProjectPolicyModel.project_id == workload.project_id)
    policy_res = await db.execute(policy_stmt)
    policy = policy_res.scalar_one_or_none()

    allowed_providers = policy.allowed_providers if policy else None
    allowed_regions = policy.allowed_regions if policy else None
    max_job_cost = policy.max_job_cost if policy else None

    # 3. Fetch candidate offers across all live and simulated providers
    offers = await ProviderRegistry.list_all_active_offers()
    candidates_raw = [
        {
            "id": o.id,
            "provider_key": o.provider_key,
            "provider_name": o.provider_key.capitalize(),
            "region_key": o.region_key,
            "gpu_model": o.gpu_model,
            "gpu_count": o.gpu_count,
            "gpu_memory_gb": o.gpu_memory_gb,
            "cpu_cores": o.cpu_cores,
            "ram_gb": o.ram_gb,
            "storage_gb": o.storage_gb,
            "price_per_hour": o.price_per_hour,
            "currency": o.currency.value,
            "freshness_status": o.freshness_status
        }
        for o in offers
    ]

    # 4. Evaluate candidates against hard constraints and score eligible ones
    evaluations: list[CandidateEvaluation] = CandidateEvaluator.evaluate_candidates(
        manifest=manifest,
        candidates_raw=candidates_raw,
        estimated_runtime_seconds=manifest.execution.timeout_seconds // 4,  # baseline heuristic
        allowed_providers_policy=allowed_providers,
        allowed_regions_policy=allowed_regions,
        max_job_cost_policy=max_job_cost
    )

    eligible = [e for e in evaluations if e.is_eligible and e.cost_estimate is not None]
    if not eligible:
        rejections = {e.offer_id: e.rejection_reasons for e in evaluations}
        raise ConstraintUnsatisfiableError(
            message="No candidate satisfies all hard constraints (region, GPU count/VRAM, provider policy, budget).",
            details={"candidates_evaluated": len(evaluations), "rejections": rejections}
        )

    best_candidate = min(eligible, key=lambda x: x.rank if x.rank is not None else 9999)
    total_cost = best_candidate.cost_estimate.total_estimated_cost

    # Determine status based on approval thresholds
    plan_status = "READY"
    if policy and policy.require_approval_above and total_cost >= policy.require_approval_above:
        plan_status = "AWAITING_APPROVAL"

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(hours=2)  # 2-hour plan freshness window

    assumptions = best_candidate.cost_estimate.assumptions
    unknown_charges = best_candidate.cost_estimate.unknown_charges
    warnings: list[str] = []
    if unknown_charges:
        warnings.extend(unknown_charges)
    if not best_candidate.cost_estimate.is_complete:
        warnings.append("Certain secondary fees (e.g. egress or storage) are unquoted and excluded from total.")

    # 5. Persist Plan & Candidates
    plan = PlanModel(
        organization_id=auth.organization_id,
        project_id=workload.project_id,
        workload_revision_id=revision.id,
        version=1,
        status=plan_status,
        selected_candidate_id=best_candidate.offer_id,
        estimated_total_cost=total_cost,
        currency=best_candidate.currency.value,
        assumptions_json=assumptions,
        warnings_json=warnings,
        expires_at=expires_at,
        created_by=auth.user_id
    )
    db.add(plan)
    await db.flush()

    candidate_responses: list[PlanCandidateResponse] = []
    for ev in evaluations:
        cost_val = ev.cost_estimate.total_estimated_cost if ev.cost_estimate else None
        db_candidate = PlanCandidateModel(
            plan_id=plan.id,
            compute_offer_id=ev.offer_id,
            eligibility_status=ev.is_eligible,
            rejection_reasons_json=ev.rejection_reasons,
            rank=ev.rank,
            estimated_cost=cost_val or Decimal("0.0000"),
            estimated_duration_seconds=ev.cost_estimate.compute_duration_seconds if ev.cost_estimate else 0,
            breakdown_json=ev.cost_estimate.model_dump(mode="json") if ev.cost_estimate else {},
            explanation=ev.explanation
        )
        db.add(db_candidate)
        await db.flush()

        candidate_responses.append(
            PlanCandidateResponse(
                id=db_candidate.id,
                offer_id=ev.offer_id,
                provider_key=ev.provider_key,
                provider_name=ev.provider_name,
                region_key=ev.region_key,
                gpu_model=ev.gpu_model,
                gpu_count=ev.gpu_count,
                gpu_memory_gb=ev.gpu_memory_gb,
                is_eligible=ev.is_eligible,
                rejection_reasons=ev.rejection_reasons,
                rank=ev.rank,
                estimated_cost=cost_val,
                currency=ev.currency.value,
                explanation=ev.explanation
            )
        )

    selected_resp = next((c for c in candidate_responses if c.offer_id == best_candidate.offer_id), None)

    return PlanResponse(
        id=plan.id,
        organization_id=plan.organization_id,
        project_id=plan.project_id,
        workload_id=workload.id,
        version=plan.version,
        status=plan.status,
        selected_candidate=selected_resp,
        candidates=candidate_responses,
        estimated_total_cost=plan.estimated_total_cost,
        currency=plan.currency,
        assumptions=assumptions,
        warnings=warnings,
        expires_at=plan.expires_at,
        created_at=plan.created_at
    )


@router.get("/v1/plans/{plan_id}", response_model=PlanResponse)
async def get_execution_plan(
    plan_id: str,
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: AsyncSession = Depends(get_db)
):
    stmt = select(PlanModel).where(PlanModel.id == plan_id)
    result = await db.execute(stmt)
    plan = result.scalar_one_or_none()
    if not plan:
        raise EntityNotFoundError("Plan", plan_id)
    verify_tenant_access(plan.organization_id, auth)

    cand_stmt = select(PlanCandidateModel).where(PlanCandidateModel.plan_id == plan.id).order_by(PlanCandidateModel.rank.asc())
    cand_res = await db.execute(cand_stmt)
    candidates = cand_res.scalars().all()

    # Get workload parent id from revision
    rev_stmt = select(WorkloadRevisionModel).where(WorkloadRevisionModel.id == plan.workload_revision_id)
    rev_res = await db.execute(rev_stmt)
    rev = rev_res.scalar_one_or_none()
    workload_id = rev.workload_id if rev else "unknown"

    c_responses = [
        PlanCandidateResponse(
            id=c.id,
            offer_id=c.compute_offer_id,
            provider_key="kynetic-simulated-cloud",
            provider_name="Kynetic Simulated GPU Cloud",
            region_key="us-east",
            gpu_model="H100",
            gpu_count=1,
            gpu_memory_gb=80,
            is_eligible=c.eligibility_status,
            rejection_reasons=c.rejection_reasons_json,
            rank=c.rank,
            estimated_cost=c.estimated_cost,
            currency=plan.currency,
            explanation=c.explanation
        )
        for c in candidates
    ]
    selected_resp = next((c for c in c_responses if c.offer_id == plan.selected_candidate_id), None)

    return PlanResponse(
        id=plan.id,
        organization_id=plan.organization_id,
        project_id=plan.project_id,
        workload_id=workload_id,
        version=plan.version,
        status=plan.status,
        selected_candidate=selected_resp,
        candidates=c_responses,
        estimated_total_cost=plan.estimated_total_cost,
        currency=plan.currency,
        assumptions=plan.assumptions_json,
        warnings=plan.warnings_json,
        expires_at=plan.expires_at,
        created_at=plan.created_at
    )


@router.post("/v1/plans/{plan_id}/approve", response_model=PlanResponse)
async def approve_plan(
    plan_id: str,
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: AsyncSession = Depends(get_db)
):
    if auth.role not in [Role.OWNER, Role.ADMIN]:
        raise AuthorizationError("Only Organization OWNER or ADMIN can approve billable execution plans.")

    stmt = select(PlanModel).where(PlanModel.id == plan_id)
    result = await db.execute(stmt)
    plan = result.scalar_one_or_none()
    if not plan:
        raise EntityNotFoundError("Plan", plan_id)
    verify_tenant_access(plan.organization_id, auth)

    plan.status = "APPROVED"
    await db.flush()

    return await get_execution_plan(plan_id=plan_id, auth=auth, db=db)
