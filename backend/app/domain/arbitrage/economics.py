from decimal import Decimal, ROUND_HALF_UP
from pydantic import BaseModel
from app.domain.checkpoints.transfer_estimator import PROVIDER_EGRESS_RATES


class EconomicBreakdown(BaseModel):
    current_hourly_cost: Decimal
    target_hourly_cost: Decimal
    remaining_runtime_seconds: int
    current_remaining_cost: Decimal
    target_remaining_cost: Decimal
    projected_gross_savings: Decimal
    migration_egress_cost: Decimal
    migration_downtime_cost: Decimal
    total_migration_overhead: Decimal
    net_savings: Decimal
    net_savings_percentage: Decimal


class ArbitrageEconomicsEngine:
    """
    Evaluates in-flight migration economics with strict Decimal precision.
    A migration is only economically sound if Net Savings > 0 and exceeds risk thresholds.
    """

    @classmethod
    def calculate(
        cls,
        current_hourly_cost: Decimal,
        target_hourly_cost: Decimal,
        remaining_runtime_seconds: int,
        checkpoint_size_bytes: int,
        source_provider: str,
        target_provider: str,
        migration_downtime_seconds: int
    ) -> EconomicBreakdown:
        remaining_hours = Decimal(str(remaining_runtime_seconds)) / Decimal("3600.0")

        current_remaining = (current_hourly_cost * remaining_hours).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)
        target_remaining = (target_hourly_cost * remaining_hours).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)
        gross_savings = current_remaining - target_remaining

        # Egress calculation
        source_code = source_provider.strip().upper()
        target_code = target_provider.strip().upper()
        size_gb = Decimal(str(checkpoint_size_bytes)) / Decimal(1024**3)

        if source_code == target_code:
            egress_rate = Decimal("0.0000")
        else:
            egress_rate = PROVIDER_EGRESS_RATES.get(source_code, Decimal("0.0500"))

        egress_cost = (size_gb * egress_rate).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)

        # Downtime compute opportunity cost on target instance
        downtime_hours = Decimal(str(migration_downtime_seconds)) / Decimal("3600.0")
        downtime_cost = (downtime_hours * target_hourly_cost).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)

        total_overhead = egress_cost + downtime_cost
        net_savings = gross_savings - total_overhead

        if current_remaining > Decimal("0.0000"):
            savings_pct = ((net_savings / current_remaining) * Decimal("100.0")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        else:
            savings_pct = Decimal("0.00")

        return EconomicBreakdown(
            current_hourly_cost=current_hourly_cost,
            target_hourly_cost=target_hourly_cost,
            remaining_runtime_seconds=remaining_runtime_seconds,
            current_remaining_cost=current_remaining,
            target_remaining_cost=target_remaining,
            projected_gross_savings=gross_savings,
            migration_egress_cost=egress_cost,
            migration_downtime_cost=downtime_cost,
            total_migration_overhead=total_overhead,
            net_savings=net_savings,
            net_savings_percentage=savings_pct
        )
