import pytest
from app.core.rate_limit import SlidingWindowRateLimiter


@pytest.mark.asyncio
async def test_sliding_window_allows_under_limit():
    limiter = SlidingWindowRateLimiter(limit_per_minute=5, burst=2)
    client_key = "192.168.1.100"

    for _ in range(7):
        allowed, retry_after = await limiter.is_allowed(client_key)
        assert allowed is True
        assert retry_after == 0


@pytest.mark.asyncio
async def test_sliding_window_blocks_over_limit():
    limiter = SlidingWindowRateLimiter(limit_per_minute=3, burst=1)
    client_key = "10.0.0.5"

    # 4 requests allowed (3 + 1 burst)
    for _ in range(4):
        allowed, retry_after = await limiter.is_allowed(client_key)
        assert allowed is True

    # 5th request must be blocked
    allowed, retry_after = await limiter.is_allowed(client_key)
    assert allowed is False
    assert retry_after > 0


@pytest.mark.asyncio
async def test_sliding_window_resets():
    limiter = SlidingWindowRateLimiter(limit_per_minute=2, burst=0)
    client_key = "10.0.0.6"

    await limiter.is_allowed(client_key)
    await limiter.is_allowed(client_key)
    allowed, _ = await limiter.is_allowed(client_key)
    assert allowed is False

    await limiter.reset()
    allowed_again, _ = await limiter.is_allowed(client_key)
    assert allowed_again is True
