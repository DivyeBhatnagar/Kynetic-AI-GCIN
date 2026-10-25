from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_ENV: Literal["development", "staging", "production", "test"] = "development"
    APP_NAME: str = "Kynetic AI Engine"
    API_V1_PREFIX: str = "/v1"
    DEBUG: bool = False

    # Database & Connection Pooling
    DATABASE_URL: str = "sqlite+aiosqlite:///./kynetic_dev.db"
    DATABASE_SYNC_URL: str = "sqlite:///./kynetic_dev.db"
    DB_ECHO: bool = False
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 1800

    # Redis Caching (optional; application runs seamlessly if not configured)
    REDIS_URL: str | None = None
    REDIS_ENABLED: bool = False
    REDIS_CONNECT_TIMEOUT: float = 2.0
    REDIS_SOCKET_TIMEOUT: float = 2.0
    REDIS_MAX_CONNECTIONS: int = 20
    CACHE_DEFAULT_TTL_SECONDS: int = 300
    CACHE_CATALOG_TTL_SECONDS: int = 600
    CACHE_OFFERS_TTL_SECONDS: int = 180
    CACHE_PRICING_TTL_SECONDS: int = 120
    CACHE_ESTIMATES_TTL_SECONDS: int = 300

    # Rate Limiting & Concurrency Safeguards
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS_PER_MINUTE: int = 120
    RATE_LIMIT_BURST: int = 30

    # Security & Tenancy
    AUTH_SECRET_KEY: str = Field(default="kynetic_dev_secret_change_in_production_32chars")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Execution safeguards (default disabled for safety)
    ENABLE_BILLABLE_EXECUTION: bool = False
    DEFAULT_PROVIDER_MODE: Literal["simulated", "live"] = "simulated"

    # Multi-instance instance identifier
    INSTANCE_ID: str = Field(default="inst-default")

    # Logging
    LOG_LEVEL: str = "INFO"


settings = Settings()
