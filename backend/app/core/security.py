import base64
import hashlib
import hmac
import json
import secrets
import time
from datetime import datetime, timedelta, timezone
from enum import Enum
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


# --- Cryptographic Password Hashing (PBKDF2-HMAC-SHA256) ---

def hash_password(plain_password: str) -> str:
    """Hashes a password using PBKDF2-HMAC-SHA256 with 100,000 iterations and a random 16-byte salt."""
    salt = secrets.token_bytes(16)
    iterations = 100_000
    derived = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, iterations)
    return f"pbkdf2_sha256${iterations}${salt.hex()}${derived.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain text password against a stored PBKDF2-HMAC-SHA256 hash using constant-time comparison."""
    if not hashed_password or not hashed_password.startswith("pbkdf2_sha256$"):
        return False
    try:
        parts = hashed_password.split("$")
        if len(parts) != 4:
            return False
        _, iter_str, salt_hex, stored_hash = parts
        iterations = int(iter_str)
        salt = bytes.fromhex(salt_hex)
        derived = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, iterations)
        return hmac.compare_digest(derived.hex(), stored_hash)
    except Exception:
        return False


# --- RFC 7519 Base64URL JWT Implementation (Zero external dependency) ---

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(s: str) -> bytes:
    padding = "=" * ((4 - len(s) % 4) % 4)
    return base64.urlsafe_b64decode((s + padding).encode("ascii"))


def create_jwt_token(payload: dict[str, Any], secret_key: str | None = None) -> str:
    """Encodes a payload into an RFC 7519 HS256 JWT string."""
    key = (secret_key or settings.AUTH_SECRET_KEY).encode("utf-8")
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    signature = hmac.new(key, signing_input, hashlib.sha256).digest()
    sig_b64 = _b64url_encode(signature)
    return f"{header_b64}.{payload_b64}.{sig_b64}"


def decode_jwt_token(token: str, secret_key: str | None = None) -> dict[str, Any] | None:
    """Decodes and cryptographically validates an RFC 7519 HS256 JWT token."""
    key = (secret_key or settings.AUTH_SECRET_KEY).encode("utf-8")
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
        expected_sig = hmac.new(key, signing_input, hashlib.sha256).digest()
        provided_sig = _b64url_decode(sig_b64)
        if not hmac.compare_digest(expected_sig, provided_sig):
            return None
        payload_bytes = _b64url_decode(payload_b64)
        payload = json.loads(payload_bytes.decode("utf-8"))
        # Expiry check
        if "exp" in payload and int(payload["exp"]) < int(time.time()):
            return None
        return payload
    except Exception:
        return None


def create_access_token(
    user_id: str,
    email: str,
    organization_id: str,
    role: Role,
    expires_delta: timedelta | None = None,
) -> str:
    """Creates a signed HS256 access JWT valid for the configured expiration duration."""
    now = int(time.time())
    delta_seconds = int(expires_delta.total_seconds()) if expires_delta else settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    payload = {
        "sub": user_id,
        "email": email,
        "org_id": organization_id,
        "role": role.value if isinstance(role, Role) else str(role),
        "type": "access",
        "iat": now,
        "exp": now + delta_seconds,
    }
    return create_jwt_token(payload)


def create_refresh_token(
    user_id: str,
    expires_delta: timedelta | None = None,
) -> str:
    """Creates a signed HS256 refresh JWT valid for 30 days by default."""
    now = int(time.time())
    delta_seconds = int(expires_delta.total_seconds()) if expires_delta else settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400
    payload = {
        "sub": user_id,
        "type": "refresh",
        "iat": now,
        "exp": now + delta_seconds,
    }
    return create_jwt_token(payload)


# --- Developer API Key Cryptography ---

def generate_api_key(name: str = "default") -> tuple[str, str, str]:
    """
    Generates a cryptographically strong headless API key.
    Returns:
        (raw_key, prefix, hashed_key)
        - raw_key: Returned ONCE to the developer (e.g. kyn_live_4a8b...)
        - prefix: Stored for display/filtering in console (e.g. kyn_live_4a8b7c)
        - hashed_key: SHA-256 digest stored securely in database
    """
    random_part = secrets.token_hex(24)
    raw_key = f"kyn_live_{random_part}"
    prefix = raw_key[:16]
    hashed_key = hash_api_key(raw_key)
    return raw_key, prefix, hashed_key


def hash_api_key(raw_key: str) -> str:
    """Generates the SHA-256 hex digest for an API key to securely look up in DB."""
    return hashlib.sha256(raw_key.strip().encode("utf-8")).hexdigest()


# --- Legacy Token Helpers (Kept for backward compatibility) ---

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
