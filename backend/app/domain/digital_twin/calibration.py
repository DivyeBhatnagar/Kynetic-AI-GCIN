from decimal import Decimal, ROUND_HALF_UP
from pydantic import BaseModel, Field


class CalibrationEvaluation(BaseModel):
    actual_runtime_seconds: int
    predicted_runtime_seconds: int
    runtime_error_percent: Decimal
    actual_cost: Decimal
    predicted_cost: Decimal
    cost_error_percent: Decimal
    within_confidence_interval: bool


class CalibrationTracker:
    """
    Evaluates prediction accuracy against real execution telemetry.
    Tracks model error metrics and whether observed performance falls within confidence intervals.
    """

    @classmethod
    def evaluate(
        cls,
        actual_runtime_seconds: int,
        predicted_runtime_seconds: int,
        runtime_interval: dict[str, int],
        actual_cost: Decimal,
        predicted_cost: Decimal
    ) -> CalibrationEvaluation:
        # Runtime error %: abs(actual - predicted) / actual * 100
        if actual_runtime_seconds > 0:
            runtime_diff = abs(actual_runtime_seconds - predicted_runtime_seconds)
            runtime_err = (Decimal(str(runtime_diff)) / Decimal(str(actual_runtime_seconds)) * Decimal("100.0")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        else:
            runtime_err = Decimal("0.00")

        # Cost error %
        if actual_cost > Decimal("0.0000"):
            cost_diff = abs(actual_cost - predicted_cost)
            cost_err = (cost_diff / actual_cost * Decimal("100.0")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        else:
            cost_err = Decimal("0.00")

        low_bound = runtime_interval.get("low", 0)
        high_bound = runtime_interval.get("high", predicted_runtime_seconds * 2)

        within_interval = low_bound <= actual_runtime_seconds <= high_bound

        return CalibrationEvaluation(
            actual_runtime_seconds=actual_runtime_seconds,
            predicted_runtime_seconds=predicted_runtime_seconds,
            runtime_error_percent=runtime_err,
            actual_cost=actual_cost,
            predicted_cost=predicted_cost,
            cost_error_percent=cost_err,
            within_confidence_interval=within_interval
        )
