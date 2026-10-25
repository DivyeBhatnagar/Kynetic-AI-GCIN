"""
Locust Load Testing Suite for Kynetic AI Control Plane.

Simulates concurrent user behaviors:
- Continuous health probing
- Read-heavy provider catalog browsing
- Filtered compute offer queries
- Paginated workload and run lookups

Usage:
  locust -f tests/load/locustfile.py --host=http://localhost:8000
"""

from locust import HttpUser, task, between


class KyneticPlatformUser(HttpUser):
    wait_time = between(0.5, 2.0)

    def on_start(self):
        self.headers = {
            "X-Org-ID": "org-locust-load-test",
            "X-User-Role": "DEVELOPER",
            "Content-Type": "application/json"
        }

    @task(5)
    def probe_health_liveness(self):
        self.client.get("/health/live", name="/health/live")

    @task(3)
    def probe_health_readiness(self):
        self.client.get("/health/ready", name="/health/ready")

    @task(4)
    def browse_providers_catalog(self):
        self.client.get("/v1/providers", headers=self.headers, name="/v1/providers [cached]")

    @task(6)
    def filter_compute_offers(self):
        self.client.get("/v1/compute-offers?gpu_model=H100&min_vram=80&limit=20", headers=self.headers, name="/v1/compute-offers [cached]")

    @task(2)
    def list_workloads_paginated(self):
        self.client.get("/v1/workloads?limit=10&offset=0", headers=self.headers, name="/v1/workloads [indexed-db]")

    @task(2)
    def list_runs_paginated(self):
        self.client.get("/v1/runs?limit=10&offset=0", headers=self.headers, name="/v1/runs [indexed-db]")
