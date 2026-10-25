from decimal import Decimal
from app.domain.checkpoints.transfer_estimator import TransferEstimator


def test_transfer_estimation_cross_cloud():
    # 100 GB checkpoint from AWS to Lambda at 10 Gbps
    size_bytes = 100 * (1024**3)
    est = TransferEstimator.estimate(
        checkpoint_id="cp-test-100gb",
        size_bytes=size_bytes,
        source_provider="AWS",
        target_provider="LAMBDA",
        bandwidth_gbps=Decimal("10.0")
    )

    # AWS egress is $0.09/GB -> 100 * 0.09 = $9.00
    assert est.estimated_egress_cost_usd == Decimal("9.0000")
    assert est.checkpoint_size_gb == Decimal("100.0000")
    # Network transfer time for 100GB at 10 Gbps with 0.85 TCP efficiency is approx 95-100s
    assert 80 <= est.network_transfer_seconds <= 120
    assert est.container_spinup_seconds == 45
    assert est.total_migration_downtime_seconds > est.network_transfer_seconds


def test_transfer_estimation_intra_cloud():
    # 50 GB intra-Lambda transfer
    size_bytes = 50 * (1024**3)
    est = TransferEstimator.estimate(
        checkpoint_id="cp-intra",
        size_bytes=size_bytes,
        source_provider="LAMBDA",
        target_provider="LAMBDA",
        bandwidth_gbps=Decimal("25.0")
    )

    # Intra-cloud egress must be 0
    assert est.estimated_egress_cost_usd == Decimal("0.0000")
    assert est.egress_rate_per_gb == Decimal("0.0000")
