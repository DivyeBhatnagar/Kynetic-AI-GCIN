import math
from decimal import Decimal, ROUND_HALF_UP
from typing import Any
from pydantic import BaseModel, Field
from app.domain.common import Money, Currency
from app.domain.workloads.manifest import WorkloadManifest
from app.domain.planning.cost_engine import CostEngine


# Empirical compute scaling index (relative FLOPS / bandwidth for ML workloads, normalized to H100=1.0)
HARDWARE_PERFORMANCE_INDEX: dict[str, float] = {
    "H100": 1.00,
    "A100": 0.45,
    "L40S": 0.55,
    "V100": 0.22,
    "T4": 0.08,
}


class IntervalBounds(BaseModel):
    low: Decimal
    base: Decimal
    high: Decimal


class PredictionResult(BaseModel):
    model_name: str = "kynetic-dt-v1"
    model_version: str = "1.0.0"
    workload_type: str
    hardware_model: str
    gpu_count: int
    predicted_runtime_seconds: int
    runtime_interval: dict[str, int]  # {"low": int, "base": int, "high": int}
    predicted_cost: Money
    cost_interval: dict[str, Money]   # {"low": Money, "base": Money, "high": Money}
    confidence_score: Decimal        # 0.000 to 1.000
    sample_count: int
    is_out_of_distribution: bool
    assumptions: list[str]
    warnings: list[str]


class DigitalTwinPredictor:
    """
    Workload Performance Digital Twin Predictor (Phase 2).
    Follows TRD Section 10 and Architecture Section 11:
    - Never fabricates certainty when empirical data is sparse.
    - Quantifies uncertainty into calibrated low/base/high prediction intervals.
    - Flags out-of-distribution extrapolation clearly.
    """

    @classmethod
    def predict(
        cls,
        manifest: WorkloadManifest,
        hardware_model: str,
        hardware_gpu_count: int,
        hardware_vram_gb: int,
        price_per_hour: Decimal,
        currency: Currency,
        benchmarks: list[dict[str, Any]] | None = None
    ) -> PredictionResult:
        benchmarks = benchmarks or []
        assumptions: list[str] = []
        warnings: list[str] = []
        model_name = "kynetic-dt-v1"
        model_version = "1.0.0"

        # Tier 1: Hardware Floor Validation
        req_vram = manifest.resources.gpu_memory_gb_min or 0
        if hardware_vram_gb < req_vram:
            warnings.append(f"Target VRAM ({hardware_vram_gb} GB) is below manifest requirement ({req_vram} GB). High risk of Out-Of-Memory (OOM).")

        # Tier 2: Search for Exact Benchmark Match in Registry
        exact_matches = [
            b for b in benchmarks
            if b.get("workload_type") == manifest.workload_type
            and b.get("hardware_model", "").upper() == hardware_model.upper()
            and int(b.get("hardware_gpu_count", 1)) == hardware_gpu_count
        ]

        if exact_matches:
            # Empirical match from Benchmark Registry
            best_match = exact_matches[0]
            meas = best_match.get("measurements", {})
            base_duration = int(meas.get("duration_seconds", manifest.execution.timeout_seconds // 2))
            sample_count = int(best_match.get("sample_count", 3))
            variance_ratio = float(meas.get("variance_ratio", 0.08))

            # Calibrated interval (e.g. +/- 10% to 15%)
            low_duration = max(60, int(base_duration * (1.0 - variance_ratio * 1.5)))
            high_duration = int(base_duration * (1.0 + variance_ratio * 1.5))
            confidence = Decimal("0.900") if sample_count >= 3 else Decimal("0.820")
            is_ood = False

            assumptions.append(f"Derived directly from {sample_count} empirical benchmark runs on {hardware_gpu_count}x {hardware_model}.")

        else:
            # Tier 3: Cross-Hardware Scaling / Interpolation
            # Check if any benchmark exists for this workload type on another known hardware
            type_matches = [b for b in benchmarks if b.get("workload_type") == manifest.workload_type]
            target_idx = HARDWARE_PERFORMANCE_INDEX.get(hardware_model.upper(), 0.50)

            if type_matches:
                source_bench = type_matches[0]
                source_hw = source_bench.get("hardware_model", "H100").upper()
                source_idx = HARDWARE_PERFORMANCE_INDEX.get(source_hw, 1.0)
                source_duration = int(source_bench.get("measurements", {}).get("duration_seconds", 3600))

                # Scaled duration inversely proportional to relative performance
                speedup_factor = target_idx / source_idx
                base_duration = max(60, int(source_duration / max(speedup_factor, 0.05)))
                sample_count = int(source_bench.get("sample_count", 1))

                # Moderate uncertainty interval (+/- 25%)
                low_duration = max(60, int(base_duration * 0.75))
                high_duration = int(base_duration * 1.30)
                confidence = Decimal("0.720")
                is_ood = False

                assumptions.append(f"Scaled from empirical benchmark on {source_hw} using relative compute index ({source_idx:.2f} -> {target_idx:.2f}).")
                warnings.append("Prediction derived via cross-hardware scaling; variance is wider than an exact hardware benchmark.")

            else:
                # Tier 4: Out-Of-Distribution (Zero Empirical Samples)
                # Fallback to heuristic estimate from manifest execution timeout
                base_duration = max(180, manifest.execution.timeout_seconds // 3)
                sample_count = 0
                is_ood = True
                confidence = Decimal("0.350")

                # Wide interval for unmeasured workload (+/- 55%)
                low_duration = max(60, int(base_duration * 0.50))
                high_duration = int(base_duration * 1.65)

                assumptions.append("No benchmark data found for this workload family. Estimate generated via conservative baseline heuristics.")
                warnings.append(
                    "OUT_OF_DISTRIBUTION: Unmeasured workload/hardware pair. "
                    "Prediction carries low confidence (0.350). High-impact automated actions must be gated by human approval."
                )

        # Cost calculations across the interval
        low_cost_res = CostEngine.estimate_candidate_cost(
            price_per_hour=price_per_hour,
            currency=currency,
            estimated_duration_seconds=low_duration,
            storage_gb=manifest.resources.storage_gb_min
        )
        base_cost_res = CostEngine.estimate_candidate_cost(
            price_per_hour=price_per_hour,
            currency=currency,
            estimated_duration_seconds=base_duration,
            storage_gb=manifest.resources.storage_gb_min
        )
        high_cost_res = CostEngine.estimate_candidate_cost(
            price_per_hour=price_per_hour,
            currency=currency,
            estimated_duration_seconds=high_duration,
            storage_gb=manifest.resources.storage_gb_min
        )

        return PredictionResult(
            model_name=model_name,
            model_version=model_version,
            workload_type=manifest.workload_type,
            hardware_model=hardware_model,
            gpu_count=hardware_gpu_count,
            predicted_runtime_seconds=base_duration,
            runtime_interval={
                "low": low_duration,
                "base": base_duration,
                "high": high_duration
            },
            predicted_cost=base_cost_res.total_estimated_cost,
            cost_interval={
                "low": low_cost_res.total_estimated_cost,
                "base": base_cost_res.total_estimated_cost,
                "high": high_cost_res.total_estimated_cost
            },
            confidence_score=confidence,
            sample_count=sample_count,
            is_out_of_distribution=is_ood,
            assumptions=assumptions,
            warnings=warnings
        )
