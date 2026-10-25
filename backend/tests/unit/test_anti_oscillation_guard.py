from decimal import Decimal
from app.domain.arbitrage.safeguards import AntiOscillationGuard


def test_guard_blocks_premature_migration():
    # Only 5 minutes (300s) elapsed, minimum is 1800s (30m)
    eligible, rejections = AntiOscillationGuard.evaluate(
        run_elapsed_seconds=300,
        previous_migrations_count=0,
        preemption_risk_score=Decimal("0.100")
    )
    assert eligible is False
    assert any("minimum duration" in r for r in rejections)


def test_guard_allows_mature_migration():
    # 45 minutes elapsed, 0 previous migrations
    eligible, rejections = AntiOscillationGuard.evaluate(
        run_elapsed_seconds=2700,
        previous_migrations_count=0,
        preemption_risk_score=Decimal("0.050")
    )
    assert eligible is True
    assert len(rejections) == 0


def test_guard_blocks_during_cooldown_window():
    # Job has run for 2 hours, but migrated 10 minutes (600s) ago (cooldown is 3600s)
    eligible, rejections = AntiOscillationGuard.evaluate(
        run_elapsed_seconds=7200,
        previous_migrations_count=1,
        seconds_since_last_migration=600,
        preemption_risk_score=Decimal("0.050")
    )
    assert eligible is False
    assert any("cooldown active" in r for r in rejections)


def test_guard_blocks_when_max_migrations_exceeded():
    # Job has already migrated 2 times (default max is 2)
    eligible, rejections = AntiOscillationGuard.evaluate(
        run_elapsed_seconds=10000,
        previous_migrations_count=2,
        seconds_since_last_migration=4000,
        preemption_risk_score=Decimal("0.050")
    )
    assert eligible is False
    assert any("maximum permitted migrations" in r for r in rejections)


def test_guard_emergency_override_on_high_preemption_risk():
    # Only 2 minutes into run, but spot eviction is imminent (risk 0.85 >= 0.70)
    eligible, rejections = AntiOscillationGuard.evaluate(
        run_elapsed_seconds=120,
        previous_migrations_count=0,
        preemption_risk_score=Decimal("0.850")
    )
    # Emergency override must bypass minimum duration to save the workload
    assert eligible is True
    assert len(rejections) == 0
