from decimal import Decimal
from app.domain.arbitrage.economics import ArbitrageEconomicsEngine


def test_arbitrage_economics_positive_net_savings():
    # Job running on AWS H100 at $3.80/hr, with 10 hours remaining (36,000s)
    # Target is Lambda H100 at $2.49/hr
    # 20 GB checkpoint, 120 seconds downtime
    breakdown = ArbitrageEconomicsEngine.calculate(
        current_hourly_cost=Decimal("3.8000"),
        target_hourly_cost=Decimal("2.4900"),
        remaining_runtime_seconds=36000,
        checkpoint_size_bytes=20 * (1024**3),
        source_provider="AWS",
        target_provider="LAMBDA",
        migration_downtime_seconds=120
    )

    # Gross savings: (3.80 - 2.49) * 10 = $13.10
    assert breakdown.projected_gross_savings == Decimal("13.1000")
    # AWS egress: 20 GB * 0.09 = $1.80
    assert breakdown.migration_egress_cost == Decimal("1.8000")
    # Downtime cost: (120/3600) * 2.49 = 0.0333 * 2.49 = $0.0830
    assert breakdown.migration_downtime_cost > Decimal("0.0800")
    # Net savings must be positive
    assert breakdown.net_savings > Decimal("11.0000")
    assert breakdown.net_savings_percentage > Decimal("25.00")


def test_arbitrage_economics_negative_net_savings_rejected():
    # Only 15 minutes remaining (900 seconds)
    # Price difference is small ($0.10/hr)
    # Egress fee is large (100 GB = $9.00)
    breakdown = ArbitrageEconomicsEngine.calculate(
        current_hourly_cost=Decimal("3.0000"),
        target_hourly_cost=Decimal("2.9000"),
        remaining_runtime_seconds=900,
        checkpoint_size_bytes=100 * (1024**3),
        source_provider="AWS",
        target_provider="LAMBDA",
        migration_downtime_seconds=180
    )

    # Gross savings: 0.10 * 0.25h = $0.0250
    # Egress fee: 100 * 0.09 = $9.00
    # Net savings must be negative (migration costs far exceed savings)
    assert breakdown.net_savings < Decimal("0.0000")
    assert breakdown.net_savings_percentage < Decimal("0.00")
