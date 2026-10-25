from typing import Any
from datetime import datetime, timezone
from decimal import Decimal
from pydantic import BaseModel, Field


class BenchmarkMeasurement(BaseModel):
    duration_seconds: int = Field(..., ge=1, description="Observed runtime in seconds")
    throughput_samples_per_second: Decimal = Field(..., ge=Decimal("0.0"), description="Processing throughput")
    gpu_memory_peak_gb: Decimal = Field(..., ge=Decimal("0.0"), description="Peak VRAM allocated")
    gpu_utilization_mean_percent: Decimal = Field(..., ge=Decimal("0.0"), le=Decimal("100.0"))
    variance_ratio: Decimal = Field(default=Decimal("0.05"), description="Measurement variance across repetitions")


class BenchmarkRunCreate(BaseModel):
    benchmark_suite_version: str = Field(default="kynetic-bench-1.0")
    workload_type: str = Field(..., description="e.g. batch_inference, ml_training, rendering")
    hardware_model: str = Field(..., description="e.g. H100, A100, L40S")
    hardware_gpu_count: int = Field(default=1, ge=1)
    hardware_vram_gb: int = Field(..., ge=1)
    workload_fingerprint: dict[str, Any] = Field(default_factory=dict)
    measurements: BenchmarkMeasurement
    provenance: dict[str, Any] = Field(default_factory=dict, description="Metadata regarding benchmark execution environment")
    sample_count: int = Field(default=3, ge=1)


class BenchmarkRunResponse(BaseModel):
    id: str
    benchmark_suite_version: str
    workload_type: str
    hardware_model: str
    hardware_gpu_count: int
    hardware_vram_gb: int
    measurements: dict[str, Any]
    provenance: dict[str, Any]
    validity_status: str
    sample_count: int
    created_at: datetime
