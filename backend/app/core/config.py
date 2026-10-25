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

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./kynetic_dev.db"
    DATABASE_SYNC_URL: str = "sqlite:///./kynetic_dev.db"
    DB_ECHO: bool = False

    # Security & Tenancy
    AUTH_SECRET_KEY: str = Field(default="kynetic_dev_secret_change_in_production_32chars")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Execution safeguards (default disabled for safety)
    ENABLE_BILLABLE_EXECUTION: bool = False
    DEFAULT_PROVIDER_MODE: Literal["simulated", "live"] = "simulated"

    # Logging
    LOG_LEVEL: str = "INFO"


settings = Settings()
