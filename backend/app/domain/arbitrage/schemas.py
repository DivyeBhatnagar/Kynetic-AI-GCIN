from datetime import datetime
from decimal import Decimal
from typing import Any, Literal
from pydantic import BaseModel, Field, ConfigDict


class ArbitrageScanRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    min_savings_percent: Decimal = Field(
        Decimal("15.00"),
        ge=Decimal("0.00"),
        le=Decimal("90.00"),
        description="Minimum net savings percentage required to recommend a migration"
    )
    min_savings_usd: Decimal = Field(
        Decimal("10.0000"),
        ge=Decimal("0.0000"),
        description="Minimum absolute USD net savings required"
    )
    max_downtime_seconds: int = Field(
        600,
        ge=60,
        le=3600,
        description="Maximum tolerated migration downtime in seconds"
    )
    preemption_risk_tolerance: Decimal = Field(
        Decimal("0.300"),
        ge=Decimal("0.000"),
        le=Decimal("1.000"),
        description="Maximum tolerated spot preemption risk for target offer"
    )
    min_run_duration_seconds: int = Field(
        300,
        ge=0,
        le=86400,
        description="Minimum elapsed seconds a run must be executing before considering migration"
    )


class ArbitrageOpportunityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    run_id: str
    project_id: str
    current_compute_offer_id: str
    target_compute_offer_id: str
    checkpoint_id: str | None
    current_hourly_cost: Decimal
    target_hourly_cost: Decimal
    remaining_runtime_seconds: int
    projected_gross_savings: Decimal
    migration_egress_cost: Decimal
    migration_downtime_cost: Decimal
    net_savings: Decimal
    net_savings_percentage: Decimal
    preemption_risk_score: Decimal
    is_eligible: bool
    rejection_reasons: list[str] = Field(default_factory=list)
    status: str
    execution_run_id: str | None
    created_at: datetime
    expires_at: datetime


class ArbitrageApprovalRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    decision: Literal["APPROVE", "REJECT"] = Field(..., description="Decision to approve or reject migration")
    reason: str = Field(..., min_length=3, max_length=255, description="Audit justification for approval/rejection")


class ArbitrageExecutionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    idempotency_key: str = Field(..., min_length=8, max_length=128, description="Unique idempotency key for migration launch")


class ArbitrageExecutionResponse(BaseModel):
    opportunity_id: str
    original_run_id: str
    resumed_run_id: str
    status: str
    net_savings: Decimal
    target_compute_offer_id: str
    executed_at: datetime
