"""Permission and confirmation gating for destructive/sensitive actions.

Any action name listed in ``settings.confirmation_required_actions`` (or
globally, when automation is disabled) must go through the two-step
confirm flow implemented here before it is allowed to execute.
"""
import secrets
import time
from dataclasses import dataclass, field
from typing import Any, Optional

from app.core.config import settings

# Actions that mutate OS/browser/email state and are always gated,
# regardless of the REQUIRE_CONFIRMATION_FOR env list.
ALWAYS_GATED_ACTIONS = {
    "delete_file",
    "send_email",
    "execute_terminal_command",
    "browser_login",
    "close_application",
}

PENDING_TTL_SECONDS = 300


@dataclass
class PendingConfirmation:
    token: str
    action: str
    payload: dict[str, Any]
    requested_by: str
    created_at: float = field(default_factory=time.time)

    @property
    def expired(self) -> bool:
        return (time.time() - self.created_at) > PENDING_TTL_SECONDS


class PermissionManager:
    """In-memory registry of pending confirmations, keyed by token.

    Backed by a dict rather than the database because confirmations are
    short-lived (5 minute TTL) and scoped to a single running process.
    """

    def __init__(self) -> None:
        self._pending: dict[str, PendingConfirmation] = {}

    def action_requires_confirmation(self, action: str) -> bool:
        if action in ALWAYS_GATED_ACTIONS:
            return True
        return action in settings.confirmation_required_actions

    def automation_allowed(self) -> bool:
        return settings.AUTOMATION_ENABLED

    def create_pending(self, action: str, payload: dict[str, Any], requested_by: str) -> PendingConfirmation:
        self._gc()
        token = secrets.token_urlsafe(24)
        pending = PendingConfirmation(token=token, action=action, payload=payload, requested_by=requested_by)
        self._pending[token] = pending
        return pending

    def pop_pending(self, token: str, requested_by: str) -> Optional[PendingConfirmation]:
        self._gc()
        pending = self._pending.get(token)
        if pending is None:
            return None
        if pending.requested_by != requested_by:
            return None
        del self._pending[token]
        if pending.expired:
            return None
        return pending

    def _gc(self) -> None:
        expired = [k for k, v in self._pending.items() if v.expired]
        for k in expired:
            del self._pending[k]


permission_manager = PermissionManager()
