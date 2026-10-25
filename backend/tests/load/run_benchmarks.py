"""
Kynetic AI — Reproducible Async Performance & Scalability Benchmark Runner.

Executes concurrent synthetic workloads against FastAPI endpoints via ASGITransport:
- Health check baseline (lightweight probe)
- Provider Catalog (Cold Cache vs Warm Cache)
- Compute Offers Query (Cold Cache vs Warm Cache)
- Database-backed Workload listing

Calculates:
- Requests Per Second (RPS)
- p50, p95, p99 latency in milliseconds
- Error rate
- Cache hit ratio
"""

import asyncio
import os
import sys
import time
import statistics

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings
from app.core.cache import cache_service


AUTH_HEADERS = {
    "X-Org-ID": "org-perf-benchmark",
    "X-User-Role": "OWNER"
}


async def run_scenario(
    name: str,
    method: str,
    url: str,
    concurrency: int = 20,
    total_requests: int = 200,
    headers: dict | None = None
) -> dict:
    transport = ASGITransport(app=app)
    latencies: list[float] = []
    errors = 0
    sem = asyncio.Semaphore(concurrency)

    async with AsyncClient(transport=transport, base_url="http://benchmark.internal") as client:
        async def single_request():
            nonlocal errors
            async with sem:
                t0 = time.perf_counter()
                try:
                    if method == "GET":
                        res = await client.get(url, headers=headers or AUTH_HEADERS)
                    else:
                        res = await client.post(url, headers=headers or AUTH_HEADERS)
                    dt_ms = (time.perf_counter() - t0) * 1000
                    if res.status_code < 400:
                        latencies.append(dt_ms)
                    else:
                        errors += 1
                        if errors <= 2:
                            print(f"[DEBUG] {name} error: {res.status_code} {res.text}")
                except Exception as exc:
                    errors += 1
                    if errors <= 2:
                        print(f"[DEBUG] {name} exception: {exc}")

        overall_start = time.perf_counter()
        tasks = [asyncio.create_task(single_request()) for _ in range(total_requests)]
        await asyncio.gather(*tasks)
        total_duration = time.perf_counter() - overall_start

    successful = len(latencies)
    rps = successful / total_duration if total_duration > 0 else 0.0

    latencies.sort()
    p50 = statistics.median(latencies) if latencies else 0.0
    p95 = latencies[int(len(latencies) * 0.95)] if latencies else 0.0
    p99 = latencies[int(len(latencies) * 0.99)] if latencies else 0.0

    return {
        "scenario": name,
        "total_requests": total_requests,
        "successful": successful,
        "errors": errors,
        "duration_sec": round(total_duration, 3),
        "rps": round(rps, 1),
        "p50_ms": round(p50, 2),
        "p95_ms": round(p95, 2),
        "p99_ms": round(p99, 2),
    }


async def main():
    print("=" * 70)
    print("KYNETIC AI BACKEND BENCHMARK & PERFORMANCE MEASUREMENT SUITE")
    print("=" * 70)

    # Disable rate limiting for performance load testing
    original_rate_limit = settings.RATE_LIMIT_ENABLED
    settings.RATE_LIMIT_ENABLED = False

    try:
        # 1. Health Probe Baseline
        res_health = await run_scenario("Health Liveness Probe", "GET", "/health/live", concurrency=20, total_requests=200)

        # 2. Provider Catalog (Cold Cache)
        await cache_service.clear_local_cache()
        cache_service.reset_metrics()
        res_cat_cold = await run_scenario("Provider Catalog (Cold Cache)", "GET", "/v1/providers", concurrency=1, total_requests=1)

        # 3. Provider Catalog (Warm Cache)
        res_cat_warm = await run_scenario("Provider Catalog (Warm Cache)", "GET", "/v1/providers", concurrency=20, total_requests=200)
        metrics_cat = cache_service.get_metrics()

        # 4. Compute Offers (Cold Cache)
        await cache_service.clear_local_cache()
        cache_service.reset_metrics()
        res_offers_cold = await run_scenario("Compute Offers (Cold Cache)", "GET", "/v1/compute-offers", concurrency=1, total_requests=1)

        # 5. Compute Offers (Warm Cache)
        res_offers_warm = await run_scenario("Compute Offers (Warm Cache)", "GET", "/v1/compute-offers", concurrency=20, total_requests=200)
        metrics_offers = cache_service.get_metrics()

        # 6. Database Workload List
        res_wl = await run_scenario("Workload Listing (Indexed DB)", "GET", "/v1/workloads?limit=20", concurrency=10, total_requests=100)

        print("\nBENCHMARK RESULTS TABLE:")
        print(f"{'Scenario':<34} | {'Reqs':<5} | {'RPS':<8} | {'p50(ms)':<8} | {'p95(ms)':<8} | {'p99(ms)':<8} | {'Errors':<6}")
        print("-" * 88)
        for r in [res_health, res_cat_cold, res_cat_warm, res_offers_cold, res_offers_warm, res_wl]:
            print(f"{r['scenario']:<34} | {r['total_requests']:<5} | {r['rps']:<8} | {r['p50_ms']:<8} | {r['p95_ms']:<8} | {r['p99_ms']:<8} | {r['errors']:<6}")

        print("\nCACHE EFFICIENCY SUMMARY:")
        print(f"Catalog Cache Hit Ratio: {metrics_cat['hit_ratio_percent']}% (Hits: {metrics_cat['hits']}, Misses: {metrics_cat['misses']})")
        print(f"Offers Cache Hit Ratio:  {metrics_offers['hit_ratio_percent']}% (Hits: {metrics_offers['hits']}, Misses: {metrics_offers['misses']})")
        print("=" * 70)
    finally:
        settings.RATE_LIMIT_ENABLED = original_rate_limit


if __name__ == "__main__":
    asyncio.run(main())
