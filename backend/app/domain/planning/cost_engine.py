import math
from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from app.domain.common import Money, Currency


class CostComponent(BaseModel):
    name: str
    amount: Money
    currency: Currency
    status: str = Field(..., description="ESTIMATED, MEASURED, PROVIDER_QUOTED, or UNKNOWN")
    calculation_basis: str
    assumptions: list[str] = Field(default_factory=list)


class CostEstimateResult(BaseModel):
    total_estimated_cost: Money
    currency: Currency
    compute_duration_seconds: int
    components: list[CostComponent]
    unknown_charges: list[str]
    assumptions: list[str]
    is_complete: bool
    calculated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CostEngine:
    """
    Transparent cost estimation engine executing exact Decimal arithmetic.
    Follows TRD Section 9: Never silently treat unknown charges as zero without flagging.
    """

    @classmethod
    def estimate_candidate_cost(
        cls,
        price_per_hour: Decimal,
        currency: Currency,
        estimated_duration_seconds: int,
        storage_gb: int = 0,
        storage_price_per_gb_month: Decimal | None = None,
        data_transfer_gb: int = 0,
        egress_price_per_gb: Decimal | None = None,
        billing_unit: str = "HOUR",
        minimum_billing_seconds: int = 60,
    ) -> CostEstimateResult:
        components: list[CostComponent] = []
        unknown_charges: list[str] = []
        assumptions: list[str] = []

        # 1. Compute duration and billing unit rounding
        effective_duration = max(estimated_duration_seconds, minimum_billing_seconds)
        hours = Decimal(str(math.ceil(effective_duration / 3600.0) if billing_unit.upper() == "HOUR" else effective_duration / 3600.0))
        compute_amount = (hours * price_per_hour).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)

        components.append(
            CostComponent(
                name="compute",
                amount=compute_amount,
                currency=currency,
                status="PROVIDER_QUOTED",
                calculation_basis=f"{hours:.2f} billing hours @ {price_per_hour} {currency}/hr",
                assumptions=[f"Billed by {billing_unit.lower()}", f"Min billing interval: {minimum_billing_seconds}s"]
            )
        )
        total_cost = compute_amount

        # 2. Attached Storage Cost
        if storage_gb > 0:
            if storage_price_per_gb_month is not None:
                # Cost for runtime duration: (storage_gb * price_per_gb_month) * (hours / 730)
                storage_hours = Decimal(str(effective_duration / 3600.0))
                storage_amount = ((Decimal(storage_gb) * storage_price_per_gb_month) * (storage_hours / Decimal(730))).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)
                components.append(
                    CostComponent(
                        name="attached_storage",
                        amount=storage_amount,
                        currency=currency,
                        status="ESTIMATED",
                        calculation_basis=f"{storage_gb} GB attached storage for {storage_hours:.2f} hours",
                        assumptions=["Assumes standard SSD storage rate"]
                    )
                )
                total_cost += storage_amount
            else:
                unknown_charges.append("attached_storage: provider rate per GB-month not specified; excluded from total")
                assumptions.append("Attached ephemeral storage assumed free or included in compute rate")

        # 3. Data Transfer / Egress Cost
        if data_transfer_gb > 0:
            if egress_price_per_gb is not None:
                transfer_amount = (Decimal(data_transfer_gb) * egress_price_per_gb).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)
                components.append(
                    CostComponent(
                        name="data_egress",
                        amount=transfer_amount,
                        currency=currency,
                        status="ESTIMATED",
                        calculation_basis=f"{data_transfer_gb} GB egress @ {egress_price_per_gb} {currency}/GB",
                        assumptions=["Standard Internet egress pricing"]
                    )
                )
                total_cost += transfer_amount
            else:
                unknown_charges.append("data_egress: provider egress rate unknown; excluded from total")
        else:
            assumptions.append("Zero external egress assumed beyond container base traffic")

        is_complete = len(unknown_charges) == 0

        return CostEstimateResult(
            total_estimated_cost=total_cost,
            currency=currency,
            compute_duration_seconds=estimated_duration_seconds,
            components=components,
            unknown_charges=unknown_charges,
            assumptions=assumptions,
            is_complete=is_complete
        )
