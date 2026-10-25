from decimal import Decimal


class AntiOscillationGuard:
    """
    Prevents flapping, runaway migration cycles, and premature migrations.
    Enforces minimum run duration, cooldown windows, and migration counts,
    while permitting emergency overrides during imminent spot preemption.
    """

    DEFAULT_MIN_DURATION_SECONDS = 1800  # 30 minutes
    DEFAULT_COOLDOWN_SECONDS = 3600      # 60 minutes
    DEFAULT_MAX_MIGRATIONS = 2

    @classmethod
    def evaluate(
        cls,
        run_elapsed_seconds: int,
        previous_migrations_count: int,
        seconds_since_last_migration: int | None = None,
        preemption_risk_score: Decimal = Decimal("0.000"),
        min_run_duration_seconds: int | None = None,
        cooldown_seconds: int | None = None,
        max_migrations: int | None = None
    ) -> tuple[bool, list[str]]:
        min_dur = cls.DEFAULT_MIN_DURATION_SECONDS if min_run_duration_seconds is None else min_run_duration_seconds
        cooldown = cls.DEFAULT_COOLDOWN_SECONDS if cooldown_seconds is None else cooldown_seconds
        max_mig = cls.DEFAULT_MAX_MIGRATIONS if max_migrations is None else max_migrations

        rejections: list[str] = []

        # Emergency override: Imminent spot preemption (risk >= 0.70) bypasses duration guards
        is_emergency = preemption_risk_score >= Decimal("0.700")

        if not is_emergency:
            if run_elapsed_seconds < min_dur:
                rejections.append(
                    f"Run elapsed time ({run_elapsed_seconds}s) has not reached minimum duration threshold ({min_dur}s) for migration."
                )

        if previous_migrations_count >= max_mig:
            rejections.append(
                f"Run has reached maximum permitted migrations ({previous_migrations_count}/{max_mig}). Further switching blocked."
            )

        if seconds_since_last_migration is not None:
            if seconds_since_last_migration < cooldown:
                remaining_cd = cooldown - seconds_since_last_migration
                rejections.append(
                    f"Anti-oscillation cooldown active ({remaining_cd}s remaining of {cooldown}s window). Switching blocked to prevent churn."
                )

        return (len(rejections) == 0, rejections)
