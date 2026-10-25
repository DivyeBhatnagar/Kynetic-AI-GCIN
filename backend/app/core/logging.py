import logging
import json
import re
from datetime import datetime, timezone
from typing import Any


SECRET_PATTERNS = [
    re.compile(r"(Bearer\s+)[a-zA-Z0-9_\-\.]+", re.IGNORECASE),
    re.compile(r"('?(?:api_key|secret|token|password|auth_token)'?\s*[:=]\s*'?)[\w\-\.]+", re.IGNORECASE),
]


def redact_secrets(text: str) -> str:
    """Redacts potential secrets, credentials and tokens from text strings."""
    redacted = text
    for pattern in SECRET_PATTERNS:
        redacted = pattern.sub(r"\1[REDACTED]", redacted)
    return redacted


class JSONFormatter(logging.Formatter):
    """Formats logs as structured JSON with correlation ID and secret redaction."""
    def format(self, record: logging.LogRecord) -> str:
        log_entry: dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": redact_secrets(record.getMessage()),
        }

        # Add correlation/request ID if present
        request_id = getattr(record, "request_id", None)
        if request_id:
            log_entry["request_id"] = request_id

        org_id = getattr(record, "organization_id", None)
        if org_id:
            log_entry["organization_id"] = org_id

        if record.exc_info:
            log_entry["exception"] = redact_secrets(self.formatException(record.exc_info))

        return json.dumps(log_entry)


def setup_logging(log_level: str = "INFO") -> None:
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Remove existing handlers to avoid duplicates
    for handler in list(root_logger.handlers):
        root_logger.removeHandler(handler)

    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter())
    root_logger.addHandler(handler)
