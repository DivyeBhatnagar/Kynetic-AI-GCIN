"""
Kynetic AI — Development Database Seeder
Populates kynetic_dev.db with default tenant, project, real compute providers,
verified compute offers, sample workloads, active/completed execution runs,
and benchmark observations.
"""
import asyncio
import uuid
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select

from app.adapters.persistence.models import (
    OrganizationModel,
    UserModel,
    MembershipModel,
    ProjectModel,
    ProjectPolicyModel,
    ProviderModel,
    RegionModel,
    ComputeOfferModel,
    PriceObservationModel,
    WorkloadModel,
    WorkloadRevisionModel,
    PlanModel,
    PlanCandidateModel,
    RunModel,
    RunStateEventModel,
    CostLedgerEntryModel,
    UsageObservationModel,
    BenchmarkRunModel,
    ArbitrageOpportunityModel,
    CheckpointModel
)

DATABASE_URL = "sqlite+aiosqlite:///./kynetic_dev.db"


async def seed():
    engine = create_async_engine(DATABASE_URL, echo=False)
    session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    async with session_factory() as session:
        # Check if already seeded
        org_check = await session.execute(select(OrganizationModel).where(OrganizationModel.id == "default-org"))
        if org_check.scalar_one_or_none():
            print("Database already seeded with default-org.")
            return

        now = datetime.now(timezone.utc)

        # 1. Default Tenant & User
        org = OrganizationModel(
            id="default-org",
            name="Kynetic Intelligence Labs",
            slug="kynetic-labs",
            status="ACTIVE",
            default_currency="USD",
            created_at=now,
            updated_at=now
        )
        session.add(org)

        user = UserModel(
            id="default-user",
            email="admin@kynetic.ai",
            display_name="Kynetic Admin",
            status="ACTIVE",
            created_at=now,
            updated_at=now
        )
        session.add(user)

        membership = MembershipModel(
            id="mem-default",
            organization_id=org.id,
            user_id=user.id,
            role="OWNER",
            status="ACTIVE",
            created_at=now
        )
        session.add(membership)

        project = ProjectModel(
            id="default-project",
            organization_id=org.id,
            name="Autonomous Compute Routing",
            slug="compute-routing",
            description="Core multi-provider compute scheduling and arbitrage pipeline",
            status="ACTIVE",
            created_at=now,
            updated_at=now
        )
        session.add(project)

        policy = ProjectPolicyModel(
            id="pol-default",
            organization_id=org.id,
            project_id=project.id,
            max_job_cost=Decimal("500.0000"),
            require_approval_above=Decimal("250.0000"),
            allowed_providers=["runpod", "lambda", "aws", "gcp", "azure", "kynetic-simulated-cloud"],
            allowed_regions=["us-east", "us-west", "eu-west"],
            auto_action_mode="RECOMMEND_ONLY",
            cooldown_seconds=300,
            created_at=now,
            updated_at=now
        )
        session.add(policy)

        # 2. Providers Catalog
        providers_data = [
            ("kynetic-simulated-cloud", "Kynetic Simulated GPU Cloud", "ACTIVE", {"supports_spot": True, "supports_checkpoints": True}),
            ("runpod", "RunPod GPU Cloud", "ACTIVE", {"supports_spot": True, "supports_checkpoints": True, "api_version": "graphql-v1"}),
            ("lambda", "Lambda Labs GPU Cloud", "ACTIVE", {"supports_spot": False, "supports_checkpoints": True, "api_version": "rest-v1"}),
            ("aws", "Amazon Web Services (EC2)", "ACTIVE", {"supports_spot": True, "supports_checkpoints": True, "driver": "boto3"}),
            ("gcp", "Google Cloud Platform (Compute Engine)", "ACTIVE", {"supports_spot": True, "supports_checkpoints": True, "driver": "google-api"}),
            ("azure", "Microsoft Azure (NDv4/NDv5)", "ACTIVE", {"supports_spot": True, "supports_checkpoints": True, "driver": "azure-mgmt"})
        ]

        provider_models = {}
        for key, name, status_val, caps in providers_data:
            prov = ProviderModel(
                id=f"prov-{key}",
                key=key,
                display_name=name,
                status=status_val,
                adapter_version="1.0.0",
                capabilities_json=caps,
                created_at=now
            )
            session.add(prov)
            provider_models[key] = prov

        # 3. Regions
        regions_data = [
            ("kynetic-simulated-cloud", "us-east", "US East (N. Virginia)", "US"),
            ("kynetic-simulated-cloud", "us-west", "US West (Oregon)", "US"),
            ("kynetic-simulated-cloud", "eu-west", "EU West (Frankfurt)", "DE"),
            ("runpod", "runpod-us", "RunPod US Secure Cloud", "US"),
            ("runpod", "runpod-eu", "RunPod EU Cloud", "IS"),
            ("lambda", "lambda-us-east", "Lambda US East", "US"),
            ("lambda", "lambda-us-west", "Lambda US West", "US"),
            ("aws", "us-east-1", "AWS US East (N. Virginia)", "US"),
            ("aws", "eu-central-1", "AWS Europe (Frankfurt)", "DE"),
            ("gcp", "us-central1", "GCP US Central (Iowa)", "US"),
            ("azure", "eastus", "Azure East US", "US"),
        ]

        region_models = {}
        for prov_key, reg_key, reg_name, country in regions_data:
            prov = provider_models[prov_key]
            reg = RegionModel(
                id=f"reg-{prov_key}-{reg_key}",
                provider_id=prov.id,
                region_key=reg_key,
                display_name=reg_name,
                country_code=country,
                status="ACTIVE"
            )
            session.add(reg)
            region_models[f"{prov_key}:{reg_key}"] = reg

        # 4. Compute Offers & Price Observations
        offers_data = [
            # Simulated offers
            ("kynetic-simulated-cloud", "us-east", "h100.80gb.sxm5", "H100", 1, 80, 16, 128, 500, Decimal("3.2000"), "SIMULATED"),
            ("kynetic-simulated-cloud", "us-east", "a100.80gb.pcie", "A100", 1, 80, 12, 96, 400, Decimal("1.8500"), "SIMULATED"),
            ("kynetic-simulated-cloud", "us-west", "l40s.48gb", "L40S", 1, 48, 16, 64, 300, Decimal("1.1000"), "SIMULATED"),
            ("kynetic-simulated-cloud", "eu-west", "h100.80gb.sxm5.eu", "H100", 1, 80, 16, 128, 500, Decimal("3.4500"), "SIMULATED"),
            
            # RunPod offers
            ("runpod", "runpod-us", "runpod.1x.h100.sxm", "H100", 1, 80, 16, 125, 500, Decimal("2.8900"), "VERIFIED_LIVE"),
            ("runpod", "runpod-us", "runpod.8x.h100.sxm", "H100", 8, 80, 128, 1000, 2000, Decimal("23.1200"), "VERIFIED_LIVE"),
            ("runpod", "runpod-eu", "runpod.1x.l40s", "L40S", 1, 48, 16, 64, 300, Decimal("0.9900"), "VERIFIED_LIVE"),
            ("runpod", "runpod-us", "runpod.1x.a100.80gb", "A100", 1, 80, 16, 125, 500, Decimal("1.7900"), "VERIFIED_LIVE"),

            # Lambda Labs offers
            ("lambda", "lambda-us-east", "lambda.1x.gh200", "GH200", 1, 96, 72, 480, 1000, Decimal("2.1000"), "VERIFIED_LIVE"),
            ("lambda", "lambda-us-east", "lambda.8x.h100.sxm5", "H100", 8, 80, 112, 1024, 2048, Decimal("24.7200"), "VERIFIED_LIVE"),
            ("lambda", "lambda-us-west", "lambda.1x.a100.80gb", "A100", 1, 80, 16, 128, 512, Decimal("1.8900"), "VERIFIED_LIVE"),

            # AWS EC2 offers
            ("aws", "us-east-1", "p5.48xlarge.8xh100", "H100", 8, 80, 192, 2048, 3840, Decimal("32.7700"), "VERIFIED_LIVE"),
            ("aws", "us-east-1", "g6e.xlarge.1xl40s", "L40S", 1, 48, 4, 32, 250, Decimal("1.7800"), "VERIFIED_LIVE"),
            ("aws", "eu-central-1", "p4de.24xlarge.8xa100", "A100", 8, 80, 96, 1152, 2000, Decimal("28.9500"), "VERIFIED_LIVE"),

            # GCP offers
            ("gcp", "us-central1", "a3-highgpu-8g.8xh100", "H100", 8, 80, 208, 1872, 3000, Decimal("31.2000"), "VERIFIED_LIVE"),
            ("gcp", "us-central1", "g2-standard-48.4xl4", "L4", 4, 24, 48, 192, 1000, Decimal("4.2200"), "VERIFIED_LIVE"),

            # Azure offers
            ("azure", "eastus", "Standard_ND96isr_H100_v5", "H100", 8, 80, 96, 1900, 3200, Decimal("33.5000"), "VERIFIED_LIVE"),
        ]

        offer_models = {}
        for prov_key, reg_key, ext_key, gpu_m, gpu_c, gpu_vram, cpu, ram, storage, price, src_type in offers_data:
            prov = provider_models[prov_key]
            reg = region_models[f"{prov_key}:{reg_key}"]
            offer_id = f"offer-{prov_key}-{ext_key}"
            offer = ComputeOfferModel(
                id=offer_id,
                provider_id=prov.id,
                region_id=reg.id,
                external_offer_key=ext_key,
                gpu_model=gpu_m,
                gpu_count=gpu_c,
                gpu_memory_gb=gpu_vram,
                cpu_cores=cpu,
                ram_gb=ram,
                storage_gb=storage,
                capabilities_json={"interconnect": "NVLink 4" if "h100" in ext_key.lower() else "PCIe Gen4", "spot_available": True},
                availability_status="AVAILABLE",
                source_type=src_type,
                created_at=now
            )
            session.add(offer)
            offer_models[offer_id] = offer

            # Add price observation
            price_obs = PriceObservationModel(
                id=f"price-{offer_id}",
                compute_offer_id=offer.id,
                price_type="ON_DEMAND",
                amount=price,
                currency="USD",
                billing_unit="HOUR",
                source_reference="market_ingestion",
                freshness_status="FRESH",
                observed_at=now
            )
            session.add(price_obs)

        # 5. Sample Workload & Revision
        sample_manifest = {
            "schema_version": "1.0",
            "name": "Llama 3 70B LoRA Alignment",
            "workload_type": "ml_training",
            "image": {"uri": "registry.kynetic.ai/meta/llama3-70b:latest", "digest": "sha256:8f99a0e1c2d3e4f5"},
            "command": ["torchrun", "--nproc_per_node=8", "finetune.py", "--batch_size=4", "--lora_r=64"],
            "working_directory": "/workspace",
            "resources": {
                "gpu_count": 8,
                "gpu_memory_gb_min": 80,
                "preferred_models": ["H100", "A100"],
                "cpu_cores_min": 64,
                "ram_gb_min": 512,
                "storage_gb_min": 1000
            },
            "constraints": {
                "allowed_regions": ["us-east", "us-east-1", "runpod-us"],
                "currency": "USD"
            },
            "execution": {
                "timeout_seconds": 86400,
                "retry_limit": 2,
                "interruptible": True,
                "checkpoint_mode": "framework_supported",
                "checkpoint_interval_seconds": 1800
            },
            "environment": {"NCCL_DEBUG": "INFO", "WANDB_PROJECT": "llama3-70b-kynetic"}
        }

        workload = WorkloadModel(
            id="workload-llama3-70b",
            organization_id=org.id,
            project_id=project.id,
            name="Llama 3 70B LoRA Alignment",
            workload_type="ml_training",
            current_revision_id="rev-llama3-70b-1",
            status="ACTIVE",
            created_by=user.id,
            created_at=now - timedelta(days=2),
            updated_at=now
        )
        session.add(workload)

        workload_rev = WorkloadRevisionModel(
            id="rev-llama3-70b-1",
            workload_id=workload.id,
            revision_number=1,
            schema_version="1.0",
            manifest_json=sample_manifest,
            manifest_digest="sha256:70b48a1c92bdf27a08ec9f24da731cb489e21098ef7301c238b19aa1f86d9a24",
            fingerprint_json={
                "gpu_count": 8,
                "gpu_memory_gb_min": 80,
                "preferred_models": ["H100", "A100"],
                "cpu_cores_min": 64,
                "ram_gb_min": 512,
                "storage_gb_min": 1000,
                "workload_type": "ml_training"
            },
            created_by=user.id,
            created_at=now - timedelta(days=2)
        )
        session.add(workload_rev)

        # 6. Sample Dry-Run Plan
        selected_offer = offer_models["offer-runpod-runpod.8x.h100.sxm"]
        plan = PlanModel(
            id="plan-llama3-70b",
            organization_id=org.id,
            project_id=project.id,
            workload_revision_id=workload_rev.id,
            version=1,
            status="APPROVED",
            selected_candidate_id="cand-runpod-8xh100",
            estimated_total_cost=Decimal("184.9600"),
            currency="USD",
            assumptions_json=[
                "Runtime modeled at 8.0 hours based on 70B parameter transformer empirical benchmark (42 FLOP/B)",
                "Spot preemption discount included with 99.2% availability SLA",
                "NVLink 4 all-to-all communication assumed across 8x H100 SXM5 GPUs"
            ],
            warnings_json=[],
            expires_at=now + timedelta(days=7),
            created_by=user.id,
            created_at=now - timedelta(hours=5)
        )
        session.add(plan)

        # Plan Candidates
        cand1 = PlanCandidateModel(
            id="cand-runpod-8xh100",
            plan_id=plan.id,
            compute_offer_id=selected_offer.id,
            eligibility_status=True,
            rejection_reasons_json=[],
            rank=1,
            estimated_cost=Decimal("184.9600"),
            estimated_duration_seconds=28800,
            breakdown_json={"compute": "184.96", "storage": "0.00", "egress": "0.00"},
            explanation="Optimal Memory Roofline (42 FLOP/B) · NVLink 4 prevents all-to-all communication barrier. Lowest cost per parameter token."
        )
        session.add(cand1)

        aws_offer = offer_models["offer-aws-p5.48xlarge.8xh100"]
        cand2 = PlanCandidateModel(
            id="cand-aws-8xh100",
            plan_id=plan.id,
            compute_offer_id=aws_offer.id,
            eligibility_status=True,
            rejection_reasons_json=[],
            rank=2,
            estimated_cost=Decimal("262.1600"),
            estimated_duration_seconds=28800,
            breakdown_json={"compute": "262.16", "storage": "0.00", "egress": "0.00"},
            explanation="AWS EC2 p5.48xlarge offers ultra-low network latency but has 41.7% higher hourly rate than RunPod."
        )
        session.add(cand2)

        # 7. Sample Live Active Run
        run = RunModel(
            id="run_8f99a0e1",
            organization_id=org.id,
            project_id=project.id,
            workload_revision_id=workload_rev.id,
            plan_id=plan.id,
            compute_offer_id=selected_offer.id,
            status="RUNNING",
            idempotency_key="idemp-llama3-70b-run-1",
            provider_resource_id="pod-runpod-8f99a0e1",
            started_at=now - timedelta(hours=4, minutes=18, seconds=22),
            created_by=user.id,
            created_at=now - timedelta(hours=4, minutes=20)
        )
        session.add(run)

        # Run State Events
        session.add(RunStateEventModel(
            id=str(uuid.uuid4()),
            run_id=run.id,
            from_state="DRAFT",
            to_state="VALIDATED",
            reason_code="MANIFEST_VERIFIED",
            actor_id=user.id,
            correlation_id="corr-1",
            metadata_json={},
            created_at=now - timedelta(hours=4, minutes=20)
        ))
        session.add(RunStateEventModel(
            id=str(uuid.uuid4()),
            run_id=run.id,
            from_state="VALIDATED",
            to_state="PROVISIONING",
            reason_code="RESOURCE_ALLOCATED",
            actor_id=user.id,
            correlation_id="corr-2",
            metadata_json={"provider": "runpod", "offer": selected_offer.external_offer_key},
            created_at=now - timedelta(hours=4, minutes=19)
        ))
        session.add(RunStateEventModel(
            id=str(uuid.uuid4()),
            run_id=run.id,
            from_state="PROVISIONING",
            to_state="RUNNING",
            reason_code="CONTAINER_HEALTHY",
            actor_id=user.id,
            correlation_id="corr-3",
            metadata_json={"ip": "192.168.10.4", "gpus_active": 8},
            created_at=now - timedelta(hours=4, minutes=18, seconds=22)
        ))

        # Ledger Entries
        session.add(CostLedgerEntryModel(
            id=str(uuid.uuid4()),
            organization_id=org.id,
            project_id=project.id,
            run_id=run.id,
            entry_type="ESTIMATE",
            amount=Decimal("184.9600"),
            currency="USD",
            effective_at=now - timedelta(hours=4, minutes=19)
        ))
        session.add(CostLedgerEntryModel(
            id=str(uuid.uuid4()),
            organization_id=org.id,
            project_id=project.id,
            run_id=run.id,
            entry_type="ACCRUED_USAGE",
            amount=Decimal("89.4000"),
            currency="USD",
            effective_at=now
        ))

        # Checkpoints for Run
        session.add(CheckpointModel(
            id="chk-step-1200",
            run_id=run.id,
            project_id=project.id,
            step_number=1200,
            storage_uri="s3://kynetic-checkpoints/run_8f99a0e1/step_1200.safetensors",
            sha256_digest="sha256:d131dd02c5e6eec4693d9a0698aff95c2fcab5b57e469cee5cf18667d5dc6666",
            size_bytes=142000000000,
            format="safetensors",
            is_verified=True,
            verification_status="PASSED",
            created_at=now - timedelta(minutes=45)
        ))

        # Empirical Benchmark Run
        session.add(BenchmarkRunModel(
            id=str(uuid.uuid4()),
            benchmark_suite_version="v1.0.0",
            workload_type="ml_training",
            hardware_model="H100",
            hardware_gpu_count=8,
            hardware_vram_gb=80,
            workload_fingerprint_json={"parameter_count": 70000000000, "sequence_length": 8192},
            measurements_json={"duration_seconds": 28800, "cost_usd": 184.96, "vram_peak_gb": 74.5},
            provenance_json={"cluster": "runpod-secure", "operator": "kynetic-dt"},
            validity_status="VALID",
            sample_count=5,
            created_at=now - timedelta(days=1)
        ))

        # Commit all seeded items
        await session.commit()
        print("Successfully seeded development database with default tenant, providers, offers, and runs!")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
