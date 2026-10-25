from typing import Annotated, Any
from decimal import Decimal
from datetime import datetime
from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.adapters.persistence.database import get_db
from app.adapters.persistence.models import (
    WorkloadModel,
    WorkloadRevisionModel,
    BenchmarkRunModel,
    PredictionModel,
    PredictionOutcomeModel,
    RunModel
)
from app.adapters.providers.fake_provider import FakeProviderAdapter
from app.domain.digital_twin.predictor import DigitalTwinPredictor, PredictionResult
from app.domain.digital_twin.calibration import CalibrationTracker, CalibrationEvaluation
from app.domain.workloads.manifest import WorkloadManifest
from app.domain.common import Currency
from app.core.security import AuthContext
from app.api.deps import get_current_auth, verify_tenant_access
from app.core.errors import EntityNotFoundError

router = APIRouter(tags=["Digital Twin Predictions"])

fake_adapter = FakeProviderAdapter()


class PredictRequest(BaseModel):
    compute_offer_id: str
    price_per_hour: Decimal | None = None
    currency: str = "USD"


class PredictionResponse(BaseModel):
    id: str
    workload_revision_id: str
    compute_offer_id: str
    model_name: str
    model_version: str
    predicted_runtime_seconds: int
    runtime_interval: dict[str, int]
    predicted_cost: Decimal
    cost_interval: dict[str, Decimal]
    confidence_score: Decimal
    sample_count: int
    is_out_of_distribution: bool
    assumptions: list[str]
    warnings: list[str]
    created_at: datetime


class RecordOutcomeRequest(BaseModel):
    run_id: str
    actual_runtime_seconds: int = Field(..., ge=1)
    actual_cost: Decimal = Field(..., ge=Decimal("0.0"))
    actual_throughput: Decimal | None = None


class OutcomeResponse(BaseModel):
    id: str
    prediction_id: str
    run_id: str
    actual_runtime_seconds: int
    predicted_runtime_seconds: int
    runtime_error_percent: Decimal
    actual_cost: Decimal
    predicted_cost: Decimal
    cost_error_percent: Decimal
    within_confidence_interval: bool
    measured_at: datetime


@router.post("/v1/workloads/{workload_id}/predict", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
async def predict_workload_performance(
    workload_id: str,
    payload: PredictRequest,
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: AsyncSession = Depends(get_db)
):
    """
    Computes Workload Performance Digital Twin prediction (Phase 2).
    Generates predicted runtime, throughput, transparent cost, and calibrated confidence intervals.
    """
    # 1. Load Workload & Latest Revision
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

    # 2. Resolve Compute Offer Details
    offers = await fake_adapter.list_offers()
    matched_offer = next((o for o in offers if o.id == payload.compute_offer_id), None)

    hardware_model = matched_offer.gpu_model if matched_offer else "H100"
    hardware_gpu_count = matched_offer.gpu_count if matched_offer else 1
    hardware_vram_gb = matched_offer.gpu_memory_gb if matched_offer else 80
    price_per_hour = payload.price_per_hour or (matched_offer.price_per_hour if matched_offer else Decimal("3.2000"))
    currency = Currency(payload.currency)

    # 3. Query Benchmark Registry for matching evidence
    bench_stmt = select(BenchmarkRunModel).where(BenchmarkRunModel.validity_status == "VALID")
    bench_res = await db.execute(bench_stmt)
    benchmarks_raw = bench_res.scalars().all()
    benchmarks_data = [
        {
            "workload_type": b.workload_type,
            "hardware_model": b.hardware_model,
            "hardware_gpu_count": b.hardware_gpu_count,
            "hardware_vram_gb": b.hardware_vram_gb,
            "measurements": b.measurements_json,
            "sample_count": b.sample_count
        }
        for b in benchmarks_raw
    ]

    # 4. Execute Multi-Tiered Digital Twin Predictor
    pred_res: PredictionResult = DigitalTwinPredictor.predict(
        manifest=manifest,
        hardware_model=hardware_model,
        hardware_gpu_count=hardware_gpu_count,
        hardware_vram_gb=hardware_vram_gb,
        price_per_hour=price_per_hour,
        currency=currency,
        benchmarks=benchmarks_data
    )

    # 5. Persist Prediction Model record
    prediction = PredictionModel(
        organization_id=auth.organization_id,
        workload_revision_id=revision.id,
        compute_offer_id=payload.compute_offer_id,
        model_name=pred_res.model_name,
        model_version=pred_res.model_version,
        predicted_runtime_seconds=pred_res.predicted_runtime_seconds,
        runtime_interval_json=pred_res.runtime_interval,
        predicted_cost=pred_res.predicted_cost,
        cost_interval_json={k: str(v) for k, v in pred_res.cost_interval.items()},
        confidence_score=pred_res.confidence_score,
        sample_count=pred_res.sample_count,
        is_out_of_distribution=pred_res.is_out_of_distribution,
        assumptions_json=pred_res.assumptions
    )
    db.add(prediction)
    await db.flush()

    return PredictionResponse(
        id=prediction.id,
        workload_revision_id=prediction.workload_revision_id,
        compute_offer_id=prediction.compute_offer_id,
        model_name=prediction.model_name,
        model_version=prediction.model_version,
        predicted_runtime_seconds=pred_res.predicted_runtime_seconds,
        runtime_interval=pred_res.runtime_interval,
        predicted_cost=pred_res.predicted_cost,
        cost_interval=pred_res.cost_interval,
        confidence_score=pred_res.confidence_score,
        sample_count=pred_res.sample_count,
        is_out_of_distribution=pred_res.is_out_of_distribution,
        assumptions=pred_res.assumptions,
        warnings=pred_res.warnings,
        created_at=prediction.created_at
    )


@router.get("/v1/workloads/{workload_id}/prediction-history", response_model=list[PredictionResponse])
async def list_prediction_history(
    workload_id: str,
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: AsyncSession = Depends(get_db)
):
    stmt = select(WorkloadModel).where(WorkloadModel.id == workload_id)
    result = await db.execute(stmt)
    workload = result.scalar_one_or_none()
    if not workload:
        raise EntityNotFoundError("Workload", workload_id)
    verify_tenant_access(workload.organization_id, auth)

    pred_stmt = (
        select(PredictionModel)
        .where(PredictionModel.organization_id == auth.organization_id)
        .order_by(PredictionModel.created_at.desc())
    )
    pred_res = await db.execute(pred_stmt)
    predictions = pred_res.scalars().all()

    return [
        PredictionResponse(
            id=p.id,
            workload_revision_id=p.workload_revision_id,
            compute_offer_id=p.compute_offer_id,
            model_name=p.model_name,
            model_version=p.model_version,
            predicted_runtime_seconds=p.predicted_runtime_seconds,
            runtime_interval=p.runtime_interval_json,
            predicted_cost=p.predicted_cost,
            cost_interval={k: Decimal(str(v)) for k, v in p.cost_interval_json.items()},
            confidence_score=p.confidence_score,
            sample_count=p.sample_count,
            is_out_of_distribution=p.is_out_of_distribution,
            assumptions=p.assumptions_json,
            warnings=["HISTORICAL_RECORD"],
            created_at=p.created_at
        )
        for p in predictions
    ]


@router.post("/v1/predictions/{prediction_id}/outcome", response_model=OutcomeResponse, status_code=status.HTTP_201_CREATED)
async def record_prediction_outcome(
    prediction_id: str,
    payload: RecordOutcomeRequest,
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: AsyncSession = Depends(get_db)
):
    """
    Records actual execution metrics against a prediction for model accuracy and drift evaluation.
    """
    pred_stmt = select(PredictionModel).where(PredictionModel.id == prediction_id)
    pred_res = await db.execute(pred_stmt)
    prediction = pred_res.scalar_one_or_none()
    if not prediction:
        raise EntityNotFoundError("Prediction", prediction_id)
    verify_tenant_access(prediction.organization_id, auth)

    # Evaluate accuracy and interval coverage
    calib: CalibrationEvaluation = CalibrationTracker.evaluate(
        actual_runtime_seconds=payload.actual_runtime_seconds,
        predicted_runtime_seconds=prediction.predicted_runtime_seconds,
        runtime_interval=prediction.runtime_interval_json,
        actual_cost=payload.actual_cost,
        predicted_cost=prediction.predicted_cost
    )

    outcome = PredictionOutcomeModel(
        prediction_id=prediction.id,
        run_id=payload.run_id,
        actual_runtime_seconds=payload.actual_runtime_seconds,
        actual_cost=payload.actual_cost,
        actual_throughput=payload.actual_throughput,
        runtime_error_percent=calib.runtime_error_percent,
        cost_error_percent=calib.cost_error_percent,
        within_confidence_interval=calib.within_confidence_interval
    )
    db.add(outcome)
    await db.flush()

    return OutcomeResponse(
        id=outcome.id,
        prediction_id=outcome.prediction_id,
        run_id=outcome.run_id,
        actual_runtime_seconds=outcome.actual_runtime_seconds,
        predicted_runtime_seconds=prediction.predicted_runtime_seconds,
        runtime_error_percent=outcome.runtime_error_percent,
        actual_cost=outcome.actual_cost,
        predicted_cost=prediction.predicted_cost,
        cost_error_percent=outcome.cost_error_percent,
        within_confidence_interval=outcome.within_confidence_interval,
        measured_at=outcome.measured_at
    )
