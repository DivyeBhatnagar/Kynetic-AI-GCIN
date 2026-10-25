import pytest
from app.domain.execution.state_machine import RunStateMachine, RunState
from app.core.errors import InvalidStateTransitionError


def test_legal_state_transitions():
    RunStateMachine.validate_transition(RunState.DRAFT, RunState.VALIDATED)
    RunStateMachine.validate_transition(RunState.VALIDATED, RunState.PLANNED)
    RunStateMachine.validate_transition(RunState.PLANNED, RunState.APPROVED)
    RunStateMachine.validate_transition(RunState.APPROVED, RunState.PROVISIONING)
    RunStateMachine.validate_transition(RunState.PROVISIONING, RunState.RUNNING)
    RunStateMachine.validate_transition(RunState.RUNNING, RunState.SUCCEEDED)
    RunStateMachine.validate_transition(RunState.SUCCEEDED, RunState.RECONCILING)
    RunStateMachine.validate_transition(RunState.RECONCILING, RunState.FINALIZED)


def test_illegal_state_transition_raises():
    with pytest.raises(InvalidStateTransitionError):
        # Cannot jump from DRAFT directly to RUNNING
        RunStateMachine.validate_transition(RunState.DRAFT, RunState.RUNNING)

    with pytest.raises(InvalidStateTransitionError):
        # Cannot transition out of terminal FINALIZED state
        RunStateMachine.validate_transition(RunState.FINALIZED, RunState.RUNNING)


def test_terminal_state_detection():
    assert RunStateMachine.is_terminal(RunState.SUCCEEDED) is True
    assert RunStateMachine.is_terminal(RunState.FAILED) is True
    assert RunStateMachine.is_terminal(RunState.CANCELED) is True
    assert RunStateMachine.is_terminal(RunState.FINALIZED) is True
    assert RunStateMachine.is_terminal(RunState.RUNNING) is False
