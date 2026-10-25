import hashlib
import hmac
import secrets
from enum import Enum
from datetime import datetime, timedelta, timezone
from typing import Any
from pydantic import BaseModel
from app.core.config import settings


class Role(str, Enum):
    OWNER = "OWNER"
    ADMIN = "ADMIN"
    DEVELOPER = "DEVELOPER"
    VIEWER = "VIEWER"


class AuthContext(BaseModel):
    user_id: str
    email: str
    organization_id: str
    role: Role


def generate_api_token(user_id: str, organization_id: str) -> str:
    """Generates an opaque API token with embedded signature."""
    nonce = secrets.token_hex(16)
    payload = f"{user_id}:{organization_id}:{nonce}"
    sig = hmac.new(settings.AUTH_SECRET_KEY.encode(), payload.encode(), hashlib.sha256).hexdigest()[:16]
    return f"kyn_{payload}_{sig}"


def verify_api_token(token: str) -> tuple[str, str] | None:
    """Verifies token signature and returns (user_id, organization_id) or None."""
    if not token.startswith("kyn_"):
        return None
    parts = token[4:].rsplit("_", 1)
    if len(parts) != 2:
        return None
    payload, sig = parts
    expected_sig = hmac.new(settings.AUTH_SECRET_KEY.encode(), payload.encode(), hashlib.sha256).hexdigest()[:16]
    if not hmac.compare_digest(sig, expected_sig):
        return None
    payload_parts = payload.split(":")
    if len(payload_parts) != 3:
        return None
    return payload_parts[0], payload_parts[1]
