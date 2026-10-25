from decimal import Decimal
from app.domain.digital_twin.calibration import CalibrationTracker


def test_calibration_tracker_within_interval():
    eval_res = CalibrationTracker.evaluate(
        actual_runtime_seconds=1150,
        predicted_runtime_seconds=1200,
        runtime_interval={"low": 1000, "base": 1200, "high": 1400},
        actual_cost=Decimal("3.1000"),
        predicted_cost=Decimal("3.2000")
    )

    assert eval_res.within_confidence_interval is True
    # Error: abs(1150 - 1200) / 1150 * 100 = 50 / 1150 * 100 = 4.35%
    assert eval_res.runtime_error_percent == Decimal("4.35")
    assert eval_res.cost_error_percent < Decimal("5.00")


def test_calibration_tracker_outside_interval():
    eval_res = CalibrationTracker.evaluate(
        actual_runtime_seconds=1850,
        predicted_runtime_seconds=1200,
        runtime_interval={"low": 1000, "base": 1200, "high": 1400},
        actual_cost=Decimal("6.4000"),
        predicted_cost=Decimal("3.2000")
    )

    assert eval_res.within_confidence_interval is False
    assert eval_res.runtime_error_percent > Decimal("30.00")
