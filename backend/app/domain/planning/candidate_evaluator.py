from decimal import Decimal
from typing import Any
from pydantic import BaseModel, Field
from app.domain.common import Money, Currency
from app.domain.workloads.manifest import WorkloadManifest
from app.domain.planning.cost_engine import CostEngine, CostEstimateResult


class CandidateEvaluation(BaseModel):
    offer_id: str
    provider_key: str
    provider_name: str
    region_key: str
    gpu_model: str
    gpu_count: int
    gpu_memory_gb: int
    cpu_cores: int
    ram_gb: int
    storage_gb: int
    price_per_hour: Money
    currency: Currency
    freshness_status: str

    # Evaluation results
    is_eligible: bool
    rejection_reasons: list[str] = Field(default_factory=list)
    cost_estimate: CostEstimateResult | None = None
    rank: int | None = None
    score: float | None = None
    explanation: str = ""


class CandidateEvaluator:
    """
    Two-stage Candidate Evaluator implementing TRD Section 9.1:
    Stage A: Enforce Hard Constraints (hard constraints are NEVER compromised for lower cost).
    Stage B: Rank eligible candidates transparently.
    """

    @classmethod
    def evaluate_candidates(
        cls,
        manifest: WorkloadManifest,
        candidates_raw: list[dict[str, Any]],
        estimated_runtime_seconds: int = 3600,
        allowed_providers_policy: list[str] | None = None,
        allowed_regions_policy: list[str] | None = None,
        max_job_cost_policy: Decimal | None = None,
    ) -> list[CandidateEvaluation]:
        evaluations: list[CandidateEvaluation] = []

        # Effective allowlists (combination of project policy and workload manifest constraints)
        effective_allowed_providers = set(manifest.constraints.allowed_provider_ids)
        if allowed_providers_policy:
            effective_allowed_providers = effective_allowed_providers.intersection(set(allowed_providers_policy)) if effective_allowed_providers else set(allowed_providers_policy)

        effective_allowed_regions = set(manifest.constraints.allowed_regions)
        if allowed_regions_policy:
            effective_allowed_regions = effective_allowed_regions.intersection(set(allowed_regions_policy)) if effective_allowed_regions else set(allowed_regions_policy)

        effective_max_cost = manifest.constraints.max_total_cost
        if max_job_cost_policy is not None:
            effective_max_cost = min(effective_max_cost, max_job_cost_policy) if effective_max_cost else max_job_cost_policy

        for c in candidates_raw:
            rejection_reasons: list[str] = []
            offer_id = str(c["id"])
            provider_key = str(c["provider_key"])
            provider_name = str(c.get("provider_name", provider_key))
            region_key = str(c["region_key"])
            gpu_model = str(c.get("gpu_model", ""))
            gpu_count = int(c.get("gpu_count", 0))
            gpu_memory_gb = int(c.get("gpu_memory_gb", 0))
            cpu_cores = int(c.get("cpu_cores", 1))
            ram_gb = int(c.get("ram_gb", 1))
            storage_gb = int(c.get("storage_gb", 0))
            price_per_hour = Decimal(str(c.get("price_per_hour", "0.0000")))
            currency = Currency(c.get("currency", "USD"))
            freshness_status = str(c.get("freshness_status", "FRESH"))

            # --- STAGE A: HARD CONSTRAINT EVALUATION ---
            # 1. Freshness check
            if freshness_status == "STALE":
                rejection_reasons.append("PRICING_DATA_STALE: Price observation has expired and requires refresh.")

            # 2. Provider allowlist / denylist
            if effective_allowed_providers and provider_key not in effective_allowed_providers:
                rejection_reasons.append(f"PROVIDER_DISALLOWED: Provider '{provider_key}' is not in allowed providers {list(effective_allowed_providers)}.")
            if manifest.constraints.denied_provider_ids and provider_key in manifest.constraints.denied_provider_ids:
                rejection_reasons.append(f"PROVIDER_DENIED: Provider '{provider_key}' is explicitly denied by workload constraints.")

            # 3. Region allowlist
            if effective_allowed_regions and region_key not in effective_allowed_regions:
                rejection_reasons.append(f"REGION_DISALLOWED: Region '{region_key}' is not in allowed regions {list(effective_allowed_regions)}.")

            # 4. Hardware constraints
            req = manifest.resources
            if req.gpu_count > 0:
                if gpu_count < req.gpu_count:
                    rejection_reasons.append(f"HARDWARE_GPU_COUNT_UNMET: Requires {req.gpu_count} GPUs; offer has {gpu_count}.")
                if req.gpu_memory_gb_min and gpu_memory_gb < req.gpu_memory_gb_min:
                    rejection_reasons.append(f"HARDWARE_VRAM_UNMET: Requires min {req.gpu_memory_gb_min} GB VRAM; offer has {gpu_memory_gb} GB.")
                if req.preferred_models and gpu_model not in req.preferred_models:
                    rejection_reasons.append(f"GPU_MODEL_MISMATCH: Model '{gpu_model}' not in preferred models {req.preferred_models}.")

            if cpu_cores < req.cpu_cores_min:
                rejection_reasons.append(f"HARDWARE_CPU_CORES_UNMET: Requires min {req.cpu_cores_min} CPU cores; offer has {cpu_cores}.")
            if ram_gb < req.ram_gb_min:
                rejection_reasons.append(f"HARDWARE_RAM_UNMET: Requires min {req.ram_gb_min} GB RAM; offer has {ram_gb} GB.")
            if storage_gb < req.storage_gb_min:
                rejection_reasons.append(f"HARDWARE_STORAGE_UNMET: Requires min {req.storage_gb_min} GB storage; offer has {storage_gb} GB.")

            # Calculate transparent cost estimate
            cost_estimate = CostEngine.estimate_candidate_cost(
                price_per_hour=price_per_hour,
                currency=currency,
                estimated_duration_seconds=estimated_runtime_seconds,
                storage_gb=req.storage_gb_min
            )

            # 5. Budget ceiling check
            if effective_max_cost is not None and cost_estimate.total_estimated_cost > effective_max_cost:
                rejection_reasons.append(
                    f"BUDGET_CEILING_EXCEEDED: Estimated cost {cost_estimate.total_estimated_cost} {currency} exceeds max budget ceiling {effective_max_cost} {currency}."
                )

            is_eligible = len(rejection_reasons) == 0

            explanation = (
                f"Meets all {len(manifest.resources.model_dump())} requirements."
                if is_eligible
                else f"Rejected due to {len(rejection_reasons)} unmet hard constraint(s)."
            )

            evaluations.append(
                CandidateEvaluation(
                    offer_id=offer_id,
                    provider_key=provider_key,
                    provider_name=provider_name,
                    region_key=region_key,
                    gpu_model=gpu_model,
                    gpu_count=gpu_count,
                    gpu_memory_gb=gpu_memory_gb,
                    cpu_cores=cpu_cores,
                    ram_gb=ram_gb,
                    storage_gb=storage_gb,
                    price_per_hour=price_per_hour,
                    currency=currency,
                    freshness_status=freshness_status,
                    is_eligible=is_eligible,
                    rejection_reasons=rejection_reasons,
                    cost_estimate=cost_estimate,
                    explanation=explanation
                )
            )

        # --- STAGE B: RANKING ELIGIBLE CANDIDATES ---
        eligible = [e for e in evaluations if e.is_eligible and e.cost_estimate is not None]
        # Primary sort: estimated total cost ascending
        eligible.sort(key=lambda x: x.cost_estimate.total_estimated_cost)

        for rank_idx, candidate in enumerate(eligible, start=1):
            candidate.rank = rank_idx
            candidate.score = float(candidate.cost_estimate.total_estimated_cost)
            candidate.explanation = (
                f"Rank #{rank_idx}: Lowest total cost {candidate.cost_estimate.total_estimated_cost} {candidate.currency} "
                f"for {candidate.gpu_count}x {candidate.gpu_model} in {candidate.region_key}."
            )

        return evaluations
