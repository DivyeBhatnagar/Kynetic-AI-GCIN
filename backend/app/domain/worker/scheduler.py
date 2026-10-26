import asyncio
import logging
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from typing import Any

from sqlalchemy import select

from app.adapters.persistence.database import async_session_factory
from app.adapters.persistence.models import (
    ArbitrageOpportunityModel,
    CheckpointModel,
    CostLedgerEntryModel,
    RunModel,
    utc_now,
)
from app.adapters.providers.registry import ProviderRegistry
from app.core.cache import cache_service
from app.core.config import settings
from app.domain.arbitrage.economics import ArbitrageEconomicsEngine
from app.domain.arbitrage.safeguards import AntiOscillationGuard

logger = logging.getLogger("kynetic.worker")


def _to_utc(dt: datetime | None) -> datetime:
    """Ensures datetime is offset-aware UTC, even if SQLite returned a naive datetime."""
    if dt is None:
        return datetime.now(timezone.utc)
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


class BackgroundWorkerService:
    """
    Asynchronous background worker and scheduler for Kynetic AI.
    Executes non-blocking background tasks:
      1. Periodic provider compute offer synchronization and price tracking.
      2. In-flight run compute arbitrage and spot preemption scanning.
      3. Active workload runtime cost accrual.
    """

    def __init__(self):
        self._running: bool = False
        self._stop_event = asyncio.Event()
        self._worker_task: asyncio.Task | None = None
        self._last_offer_sync: datetime = datetime.min.replace(tzinfo=timezone.utc)
        self._last_arbitrage_scan: datetime = datetime.min.replace(tzinfo=timezone.utc)
        self._last_cost_accrual: datetime = datetime.min.replace(tzinfo=timezone.utc)

    # --- Job 1: Provider Compute Offer Sync ---

    async def sync_provider_offers(self) -> dict[str, Any]:
        """Fetches and synchronizes live compute offers from registered cloud providers."""
        logger.info("Executing background job: sync_provider_offers")
        try:
            offers = await ProviderRegistry.list_all_active_offers()
            # Invalidate cached offers
            await cache_service.delete_pattern("kynetic:v1:offers:*")
            logger.info(f"Offer sync complete. Synced {len(offers)} offers from all registered providers.")
            return {
                "status": "SUCCESS",
                "synced_offers": len(offers),
                "providers_checked": len(ProviderRegistry.list_supported_providers()),
            }
        except Exception as e:
            logger.error(f"Error during provider offer sync: {e}", exc_info=True)
            return {"status": "ERROR", "error": str(e), "synced_offers": 0}

    # --- Job 2: In-Flight Arbitrage & Preemption Scanner ---

    async def scan_in_flight_arbitrage(self) -> dict[str, Any]:
        """Scans active running workloads to detect lower-cost or spot migration opportunities."""
        logger.info("Executing background job: scan_in_flight_arbitrage")
        opportunities_recorded = 0
        now = datetime.now(timezone.utc)

        async with async_session_factory() as session:
            try:
                # Find all currently RUNNING workloads
                stmt = select(RunModel).where(RunModel.status == "RUNNING")
                runs = (await session.scalars(stmt)).all()

                if not runs:
                    return {"status": "SUCCESS", "runs_scanned": 0, "opportunities_found": 0}

                all_offers = await ProviderRegistry.list_all_active_offers()

                for run in runs:
                    if not run.compute_offer_id:
                        continue

                    # Current offer resolution
                    cur_offer = next((o for o in all_offers if o.id == run.compute_offer_id), None)
                    if not cur_offer:
                        continue

                    cur_price = getattr(cur_offer.price_per_hour, "amount", Decimal("3.50"))

                    # Target candidate offers: same GPU model, sufficient memory, lower price
                    target_candidates = [
                        o for o in all_offers
                        if o.id != cur_offer.id
                        and o.gpu_model == cur_offer.gpu_model
                        and o.gpu_memory_gb >= cur_offer.gpu_memory_gb
                        and getattr(o.price_per_hour, "amount", Decimal("999")) < cur_price
                    ]

                    # Find latest verified checkpoint
                    chk_stmt = select(CheckpointModel).where(
                        CheckpointModel.run_id == run.id,
                        CheckpointModel.is_verified == True,
                    ).order_by(CheckpointModel.step_number.desc()).limit(1)
                    latest_chk = await session.scalar(chk_stmt)

                    checkpoint_size_gb = Decimal(str(latest_chk.size_bytes / (1024**3))) if latest_chk else Decimal("0.0")
                    remaining_runtime = 3600
                    run_started = _to_utc(run.started_at)
                    current_runtime_secs = max(120, int((now - run_started).total_seconds()))

                    for target in target_candidates:
                        target_price = getattr(target.price_per_hour, "amount", Decimal("1.00"))
                        is_target_spot = "spot" in target.id.lower() or "rtx" in target.id.lower()

                        economics = ArbitrageEconomicsEngine.calculate(
                            current_hourly_cost=cur_price,
                            target_hourly_cost=target_price,
                            remaining_runtime_seconds=remaining_runtime,
                            checkpoint_size_gb=checkpoint_size_gb,
                            source_region=cur_offer.region_key,
                            target_region=target.region_key,
                            source_provider=cur_offer.provider_key,
                            target_provider=target.provider_key,
                            preemption_risk_score=Decimal("0.150") if is_target_spot else Decimal("0.020"),
                        )

                        # Evaluate anti-oscillation safeguards
                        guard_decision = AntiOscillationGuard.evaluate(
                            run_id=run.id,
                            net_savings=economics.net_savings,
                            net_savings_percentage=economics.net_savings_percentage,
                            last_migration_at=run_started,
                            current_runtime_seconds=current_runtime_secs,
                            total_migrations_count=0,
                            is_target_spot=is_target_spot,
                            is_emergency_preemption=False,
                        )

                        if guard_decision.is_eligible and economics.net_savings > Decimal("0.50"):
                            opp = ArbitrageOpportunityModel(
                                organization_id=run.organization_id,
                                project_id=run.project_id,
                                run_id=run.id,
                                current_compute_offer_id=cur_offer.id,
                                target_compute_offer_id=target.id,
                                checkpoint_id=latest_chk.id if latest_chk else None,
                                current_hourly_cost=cur_price,
                                target_hourly_cost=target_price,
                                remaining_runtime_seconds=remaining_runtime,
                                projected_gross_savings=economics.projected_gross_savings,
                                migration_egress_cost=economics.migration_egress_cost,
                                migration_downtime_cost=economics.migration_downtime_cost,
                                net_savings=economics.net_savings,
                                net_savings_percentage=economics.net_savings_percentage,
                                preemption_risk_score=economics.preemption_risk_score,
                                is_eligible=True,
                                rejection_reasons_json=[],
                                status="EVALUATED",
                                expires_at=now + timedelta(minutes=15),
                                created_at=now,
                            )
                            session.add(opp)
                            opportunities_recorded += 1
                            break

                await session.commit()
                logger.info(f"Arbitrage scan complete. Found {opportunities_recorded} viable opportunities across {len(runs)} runs.")
                return {"status": "SUCCESS", "runs_scanned": len(runs), "opportunities_found": opportunities_recorded}
            except Exception as e:
                await session.rollback()
                logger.error(f"Error during arbitrage scan: {e}", exc_info=True)
                return {"status": "ERROR", "error": str(e), "opportunities_found": 0}

    # --- Job 3: Runtime Cost Accrual ---

    async def accrue_workload_costs(self) -> dict[str, Any]:
        """Accrues usage-based costs for in-progress and running compute runs."""
        logger.info("Executing background job: accrue_workload_costs")
        updated_runs = 0
        now = datetime.now(timezone.utc)

        async with async_session_factory() as session:
            try:
                stmt = select(RunModel).where(RunModel.status.in_(["RUNNING", "PENDING"]))
                runs = (await session.scalars(stmt)).all()

                if not runs:
                    return {"status": "SUCCESS", "runs_updated": 0}

                all_offers = await ProviderRegistry.list_all_active_offers()

                for run in runs:
                    if not run.started_at or not run.compute_offer_id:
                        continue

                    offer = next((o for o in all_offers if o.id == run.compute_offer_id), None)
                    hourly_price = getattr(offer.price_per_hour, "amount", Decimal("2.50")) if offer else Decimal("2.50")

                    run_started = _to_utc(run.started_at)
                    elapsed_seconds = max(1, int((now - run_started).total_seconds()))
                    elapsed_hours = Decimal(str(elapsed_seconds)) / Decimal("3600")
                    accrued = (elapsed_hours * hourly_price).quantize(Decimal("0.0001"))

                    ledger_check = select(CostLedgerEntryModel).where(CostLedgerEntryModel.run_id == run.id).limit(1)
                    existing_entry = await session.scalar(ledger_check)

                    if not existing_entry:
                        entry = CostLedgerEntryModel(
                            organization_id=run.organization_id,
                            project_id=run.project_id,
                            run_id=run.id,
                            amount_usd=accrued,
                            entry_type="EXECUTION_ACCRUAL",
                            effective_at=now,
                        )
                        session.add(entry)
                    else:
                        existing_entry.amount_usd = accrued
                        existing_entry.effective_at = now

                    updated_runs += 1

                await session.commit()
                logger.info(f"Cost accrual complete. Updated {updated_runs} runs.")
                return {"status": "SUCCESS", "runs_updated": updated_runs}
            except Exception as e:
                await session.rollback()
                logger.error(f"Error during cost accrual: {e}", exc_info=True)
                return {"status": "ERROR", "error": str(e), "runs_updated": 0}

    # --- Scheduler Loop & Lifecycle Management ---

    async def trigger_job(self, job_name: str) -> dict[str, Any]:
        """Manually triggers a specific job or all jobs for on-demand execution."""
        clean_name = job_name.lower().strip()
        if clean_name in ["sync_offers", "sync_provider_offers", "sync"]:
            res = await self.sync_provider_offers()
            self._last_offer_sync = datetime.now(timezone.utc)
            return res
        elif clean_name in ["scan_arbitrage", "arbitrage"]:
            res = await self.scan_in_flight_arbitrage()
            self._last_arbitrage_scan = datetime.now(timezone.utc)
            return res
        elif clean_name in ["accrue_costs", "accrue", "costs"]:
            res = await self.accrue_workload_costs()
            self._last_cost_accrual = datetime.now(timezone.utc)
            return res
        elif clean_name in ["all"]:
            sync_res = await self.sync_provider_offers()
            arb_res = await self.scan_in_flight_arbitrage()
            cost_res = await self.accrue_workload_costs()
            return {"sync": sync_res, "arbitrage": arb_res, "costs": cost_res}
        else:
            return {"status": "ERROR", "message": f"Unknown job name '{job_name}'"}

    async def run_loop(self):
        """Asynchronous execution loop ticking according to configured intervals."""
        self._running = True
        logger.info(f"Background worker started. Poll interval: {settings.WORKER_POLL_INTERVAL_SECONDS}s")

        while not self._stop_event.is_set():
            now = datetime.now(timezone.utc)
            try:
                # 1. Offer Sync Schedule
                if (now - self._last_offer_sync).total_seconds() >= settings.WORKER_OFFER_SYNC_INTERVAL_SECONDS:
                    await self.sync_provider_offers()
                    self._last_offer_sync = now

                # 2. Arbitrage Scanner Schedule
                if (now - self._last_arbitrage_scan).total_seconds() >= settings.WORKER_ARBITRAGE_SCAN_INTERVAL_SECONDS:
                    await self.scan_in_flight_arbitrage()
                    self._last_arbitrage_scan = now

                # 3. Cost Accrual Schedule
                if (now - self._last_cost_accrual).total_seconds() >= settings.WORKER_COST_ACCRUAL_INTERVAL_SECONDS:
                    await self.accrue_workload_costs()
                    self._last_cost_accrual = now

            except Exception as loop_err:
                logger.error(f"Error in background worker loop: {loop_err}", exc_info=True)

            try:
                # Wait until next poll or stop signal
                await asyncio.wait_for(
                    self._stop_event.wait(),
                    timeout=float(settings.WORKER_POLL_INTERVAL_SECONDS),
                )
            except asyncio.TimeoutError:
                pass

        self._running = False
        logger.info("Background worker loop stopped cleanly.")

    def start(self):
        """Starts the background worker task if enabled."""
        if not settings.WORKER_ENABLED:
            logger.info("Background worker is disabled by configuration (WORKER_ENABLED=False).")
            return
        if self._worker_task is None or self._worker_task.done():
            self._stop_event.clear()
            self._worker_task = asyncio.create_task(self.run_loop())
            logger.info("Background worker task created.")

    async def stop(self):
        """Gracefully halts the background worker task."""
        if self._worker_task and not self._worker_task.done():
            logger.info("Stopping background worker...")
            self._stop_event.set()
            try:
                await asyncio.wait_for(self._worker_task, timeout=5.0)
            except (asyncio.TimeoutError, asyncio.CancelledError):
                self._worker_task.cancel()
            self._worker_task = None
            self._running = False
            logger.info("Background worker stopped.")


# Global singleton instance
background_worker = BackgroundWorkerService()
