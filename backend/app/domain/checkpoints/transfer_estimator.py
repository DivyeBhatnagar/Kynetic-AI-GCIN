import math
from decimal import Decimal, ROUND_HALF_UP
from app.domain.checkpoints.schemas import TransferEstimationResponse


PROVIDER_EGRESS_RATES: dict[str, Decimal] = {
    "AWS": Decimal("0.0900"),
    "GCP": Decimal("0.0850"),
    "AZURE": Decimal("0.0870"),
    "RUNPOD": Decimal("0.0100"),
    "LAMBDA": Decimal("0.0100"),
    "CRUSOE": Decimal("0.0000"),
    "CLOUDFLARE_R2": Decimal("0.0000"),
}


class TransferEstimator:
    """
    Estimates migration transfer latency, cloud egress charges,
    and total downtime for cross-cloud or cross-cluster checkpoint resumption.
    """

    @classmethod
    def estimate(
        cls,
        checkpoint_id: str,
        size_bytes: int,
        source_provider: str,
        target_provider: str,
        bandwidth_gbps: Decimal = Decimal("10.0")
    ) -> TransferEstimationResponse:
        source_code = source_provider.strip().upper()
        target_code = target_provider.strip().upper()

        size_gb = (Decimal(str(size_bytes)) / Decimal(1024**3)).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)

        # Intra-provider transfers incur $0.00 egress
        if source_code == target_code:
            egress_rate = Decimal("0.0000")
        else:
            egress_rate = PROVIDER_EGRESS_RATES.get(source_code, Decimal("0.0500"))

        egress_cost = (size_gb * egress_rate).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)

        # Transfer time calculation
        # size in bits: size_bytes * 8
        # effective bandwidth in bps: bandwidth_gbps * 1e9 * 0.85 (TCP protocol/flow control factor)
        size_bits = Decimal(str(size_bytes)) * Decimal("8")
        effective_bps = bandwidth_gbps * Decimal("1000000000") * Decimal("0.85")
        transfer_seconds = math.ceil(float(size_bits / effective_bps))

        # Standard container spinup + environment provisioning: 45 seconds
        spinup_seconds = 45

        # Weights loading over PCIe Gen4 (effective ~28 GB/s)
        pcie_seconds = max(1, math.ceil(float(size_gb / Decimal("28.0"))))

        total_downtime = transfer_seconds + spinup_seconds + pcie_seconds

        return TransferEstimationResponse(
            checkpoint_id=checkpoint_id,
            checkpoint_size_gb=size_gb,
            source_provider=source_code,
            target_provider=target_code,
            egress_rate_per_gb=egress_rate,
            estimated_egress_cost_usd=egress_cost,
            network_transfer_seconds=transfer_seconds,
            container_spinup_seconds=spinup_seconds,
            pcie_weight_load_seconds=pcie_seconds,
            total_migration_downtime_seconds=total_downtime
        )
