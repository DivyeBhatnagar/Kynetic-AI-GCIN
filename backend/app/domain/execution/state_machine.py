from enum import Enum
from app.core.errors import InvalidStateTransitionError


class RunState(str, Enum):
    DRAFT = "DRAFT"
    VALIDATED = "VALIDATED"
    PLANNED = "PLANNED"
    AWAITING_APPROVAL = "AWAITING_APPROVAL"
    APPROVED = "APPROVED"
    PROVISIONING = "PROVISIONING"
    RUNNING = "RUNNING"
    CANCEL_REQUESTED = "CANCEL_REQUESTED"
    CANCELED = "CANCELED"
    SUCCEEDED = "SUCCEEDED"
    FAILED = "FAILED"
    RECONCILING = "RECONCILING"
    FINALIZED = "FINALIZED"


TERMINAL_OUTCOMES = {RunState.SUCCEEDED, RunState.FAILED, RunState.CANCELED}


# Explicit table of permitted state transitions
VALID_TRANSITIONS: dict[RunState, set[RunState]] = {
    RunState.DRAFT: {RunState.VALIDATED, RunState.FAILED},
    RunState.VALIDATED: {RunState.PLANNED, RunState.FAILED},
    RunState.PLANNED: {RunState.AWAITING_APPROVAL, RunState.APPROVED, RunState.FAILED},
    RunState.AWAITING_APPROVAL: {RunState.APPROVED, RunState.FAILED, RunState.CANCELED},
    RunState.APPROVED: {RunState.PROVISIONING, RunState.CANCEL_REQUESTED, RunState.FAILED},
    RunState.PROVISIONING: {RunState.RUNNING, RunState.CANCEL_REQUESTED, RunState.FAILED},
    RunState.RUNNING: {RunState.SUCCEEDED, RunState.FAILED, RunState.CANCEL_REQUESTED},
    RunState.CANCEL_REQUESTED: {RunState.CANCELED, RunState.FAILED},
    RunState.SUCCEEDED: {RunState.RECONCILING},
    RunState.FAILED: {RunState.RECONCILING},
    RunState.CANCELED: {RunState.RECONCILING},
    RunState.RECONCILING: {RunState.FINALIZED},
    RunState.FINALIZED: set(),  # Terminal state
}


class RunStateMachine:
    """
    Enforces atomic, validated state transitions for workload runs.
    Reconciles TRD Section 13 and Architecture Section 14.
    """

    @classmethod
    def validate_transition(cls, from_state: RunState, to_state: RunState) -> None:
        allowed = VALID_TRANSITIONS.get(from_state, set())
        if to_state not in allowed:
            raise InvalidStateTransitionError(
                from_state=from_state.value,
                to_state=to_state.value,
                message=f"Illegal transition: '{from_state.value}' cannot transition to '{to_state.value}'. "
                        f"Allowed next states: {[s.value for s in allowed]}."
            )

    @classmethod
    def is_terminal(cls, state: RunState) -> bool:
        return state in TERMINAL_OUTCOMES or state == RunState.FINALIZED
