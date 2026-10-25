from typing import Annotated
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.adapters.persistence.database import get_db
from app.adapters.persistence.models import BenchmarkRunModel
from app.domain.digital_twin.benchmark_registry import BenchmarkRunCreate, BenchmarkRunResponse
from app.core.security import AuthContext
from app.api.deps import get_current_auth

router = APIRouter(prefix="/v1/benchmarks", tags=["Benchmark Registry (Digital Twin)"])


@router.post("", response_model=BenchmarkRunResponse, status_code=status.HTTP_201_CREATED)
async def register_benchmark_run(
    payload: BenchmarkRunCreate,
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: AsyncSession = Depends(get_db)
):
    """
    Registers an empirical benchmark observation into the Digital Twin Benchmark Registry.
    Used to ground runtime and cost predictions in observed measurements.
    """
    bench = BenchmarkRunModel(
        benchmark_suite_version=payload.benchmark_suite_version,
        workload_type=payload.workload_type,
        hardware_model=payload.hardware_model,
        hardware_gpu_count=payload.hardware_gpu_count,
        hardware_vram_gb=payload.hardware_vram_gb,
        workload_fingerprint_json=payload.workload_fingerprint,
        measurements_json=payload.measurements.model_dump(mode="json"),
        provenance_json=payload.provenance,
        sample_count=payload.sample_count,
        validity_status="VALID"
    )
    db.add(bench)
    await db.flush()

    return BenchmarkRunResponse(
        id=bench.id,
        benchmark_suite_version=bench.benchmark_suite_version,
        workload_type=bench.workload_type,
        hardware_model=bench.hardware_model,
        hardware_gpu_count=bench.hardware_gpu_count,
        hardware_vram_gb=bench.hardware_vram_gb,
        measurements=bench.measurements_json,
        provenance=bench.provenance_json,
        validity_status=bench.validity_status,
        sample_count=bench.sample_count,
        created_at=bench.created_at
    )


@router.get("", response_model=list[BenchmarkRunResponse])
async def list_benchmarks(
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    workload_type: str | None = Query(None),
    hardware_model: str | None = Query(None),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(BenchmarkRunModel).order_by(BenchmarkRunModel.created_at.desc())
    if workload_type:
        stmt = stmt.where(BenchmarkRunModel.workload_type == workload_type)
    if hardware_model:
        stmt = stmt.where(BenchmarkRunModel.hardware_model == hardware_model)

    result = await db.execute(stmt)
    benchmarks = result.scalars().all()

    return [
        BenchmarkRunResponse(
            id=b.id,
            benchmark_suite_version=b.benchmark_suite_version,
            workload_type=b.workload_type,
            hardware_model=b.hardware_model,
            hardware_gpu_count=b.hardware_gpu_count,
            hardware_vram_gb=b.hardware_vram_gb,
            measurements=b.measurements_json,
            provenance=b.provenance_json,
            validity_status=b.validity_status,
            sample_count=b.sample_count,
            created_at=b.created_at
        )
        for b in benchmarks
    ]
