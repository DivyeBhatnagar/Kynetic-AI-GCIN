from typing import Any
from fastapi import Request, status
from fastapi.responses import JSONResponse


class KyneticError(Exception):
    """Base exception for all Kynetic AI domain and operational errors."""
    def __init__(
        self,
        message: str,
        code: str = "INTERNAL_ERROR",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: dict[str, Any] | None = None
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}


class EntityNotFoundError(KyneticError):
    def __init__(self, entity_name: str, entity_id: str, details: dict[str, Any] | None = None):
        super().__init__(
            message=f"{entity_name} with ID '{entity_id}' not found.",
            code="NOT_FOUND",
            status_code=status.HTTP_404_NOT_FOUND,
            details=details or {"entity": entity_name, "id": entity_id}
        )


class AuthorizationError(KyneticError):
    def __init__(self, message: str = "Permission denied for this resource.", details: dict[str, Any] | None = None):
        super().__init__(
            message=message,
            code="PERMISSION_DENIED",
            status_code=status.HTTP_403_FORBIDDEN,
            details=details
        )


class AuthenticationRequiredError(KyneticError):
    def __init__(self, message: str = "Authentication required.", details: dict[str, Any] | None = None):
        super().__init__(
            message=message,
            code="AUTHENTICATION_REQUIRED",
            status_code=status.HTTP_401_UNAUTHORIZED,
            details=details
        )


class TenantMismatchError(KyneticError):
    def __init__(self, message: str = "Cross-tenant access prohibited.", details: dict[str, Any] | None = None):
        super().__init__(
            message=message,
            code="TENANT_MISMATCH",
            status_code=status.HTTP_403_FORBIDDEN,
            details=details
        )


class ManifestValidationError(KyneticError):
    def __init__(self, message: str, details: dict[str, Any] | None = None):
        super().__init__(
            message=message,
            code="MANIFEST_VALIDATION_ERROR",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=details
        )


class ConstraintUnsatisfiableError(KyneticError):
    def __init__(self, message: str = "No candidate satisfies all hard constraints.", details: dict[str, Any] | None = None):
        super().__init__(
            message=message,
            code="CONSTRAINT_UNSATISFIABLE",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=details
        )


class BudgetLimitExceededError(KyneticError):
    def __init__(self, message: str = "Operation exceeds project budget or maximum cost limit.", details: dict[str, Any] | None = None):
        super().__init__(
            message=message,
            code="BUDGET_LIMIT_EXCEEDED",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=details
        )


class InvalidStateTransitionError(KyneticError):
    def __init__(self, from_state: str, to_state: str, message: str | None = None):
        msg = message or f"Cannot transition run from '{from_state}' to '{to_state}'."
        super().__init__(
            message=msg,
            code="INVALID_STATE_TRANSITION",
            status_code=status.HTTP_409_CONFLICT,
            details={"from_state": from_state, "to_state": to_state}
        )


class IdempotencyConflictError(KyneticError):
    def __init__(self, idempotency_key: str, message: str = "Duplicate request with identical idempotency key in progress or completed."):
        super().__init__(
            message=message,
            code="IDEMPOTENCY_CONFLICT",
            status_code=status.HTTP_409_CONFLICT,
            details={"idempotency_key": idempotency_key}
        )


class ExecutionDisabledError(KyneticError):
    def __init__(self, message: str = "Billable live provider execution is disabled in this environment."):
        super().__init__(
            message=message,
            code="EXECUTION_DISABLED",
            status_code=status.HTTP_403_FORBIDDEN,
            details={"safety_guard": "ENABLE_BILLABLE_EXECUTION=false"}
        )


class ProviderOperationError(KyneticError):
    def __init__(self, provider: str, operation: str, error_code: str, message: str, details: dict[str, Any] | None = None):
        sanitized_details = {"provider": provider, "operation": operation, "error_code": error_code}
        if details:
            sanitized_details.update(details)
        super().__init__(
            message=f"Provider '{provider}' failed during '{operation}': {message}",
            code=f"PROVIDER_{error_code}",
            status_code=status.HTTP_502_BAD_GATEWAY,
            details=sanitized_details
        )


def kynetic_error_handler(request: Request, exc: KyneticError) -> JSONResponse:
    request_id = getattr(request.state, "request_id", "unknown-request-id")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "request_id": request_id,
                "details": exc.details
            }
        }
    )
