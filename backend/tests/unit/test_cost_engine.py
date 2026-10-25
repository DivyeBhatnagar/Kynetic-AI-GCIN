from decimal import Decimal
from app.domain.common import Currency
from app.domain.planning.cost_engine import CostEngine


def test_cost_engine_compute_hourly_rounding():
    # 5400 seconds = 1.5 hours -> rounded up to 2 hours for hourly billing
    result = CostEngine.estimate_candidate_cost(
        price_per_hour=Decimal("3.5000"),
        currency=Currency.USD,
        estimated_duration_seconds=5400,
        billing_unit="HOUR"
    )

    assert result.total_estimated_cost == Decimal("7.0000")
    assert result.is_complete is True
    assert len(result.components) == 1
    assert result.components[0].name == "compute"


def test_cost_engine_includes_storage_and_egress():
    result = CostEngine.estimate_candidate_cost(
        price_per_hour=Decimal("2.0000"),
        currency=Currency.USD,
        estimated_duration_seconds=3600,
        storage_gb=100,
        storage_price_per_gb_month=Decimal("0.1000"),
        data_transfer_gb=50,
        egress_price_per_gb=Decimal("0.0500"),
        billing_unit="HOUR"
    )

    # Compute: 2.0000
    # Storage: (100 * 0.10) * (1 / 730) = 10 / 730 = 0.0137
    # Egress: 50 * 0.0500 = 2.5000
    # Total ~ 4.5137
    assert result.total_estimated_cost > Decimal("4.5000")
    assert len(result.components) == 3
    assert result.is_complete is True


def test_cost_engine_flags_unknown_charges():
    # Storage requested but no price provided -> must NOT be treated as zero silently
    result = CostEngine.estimate_candidate_cost(
        price_per_hour=Decimal("1.5000"),
        currency=Currency.USD,
        estimated_duration_seconds=3600,
        storage_gb=200,
        storage_price_per_gb_month=None
    )

    assert result.is_complete is False
    assert len(result.unknown_charges) == 1
    assert "attached_storage" in result.unknown_charges[0]
