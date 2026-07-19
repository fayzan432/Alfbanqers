"""Central registry mapping tool names the LLM can call to real handlers.

Each domain module (memory, tasks, calendar, notes, files, automation,
vision, system) registers its own tools here at import time via
``tool_registry.register(...)``. The agent loop only depends on this
registry, never on the domain modules directly, which keeps the reasoning
loop decoupled from what actions happen to be available.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Awaitable, Callable

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.base import ToolDefinition
from app.models.user import User


@dataclass
class ToolContext:
    db: AsyncSession
    user: User


ToolHandler = Callable[[dict[str, Any], ToolContext], Awaitable[Any]]


@dataclass
class RegisteredTool:
    definition: ToolDefinition
    handler: ToolHandler
    destructive: bool = False


class ToolRegistry:
    def __init__(self) -> None:
        self._tools: dict[str, RegisteredTool] = {}

    def register(self, definition: ToolDefinition, handler: ToolHandler, destructive: bool = False) -> None:
        self._tools[definition.name] = RegisteredTool(definition=definition, handler=handler, destructive=destructive)

    def unregister(self, name: str) -> None:
        self._tools.pop(name, None)

    def unregister_prefix_owned_by(self, names: list[str]) -> None:
        for name in names:
            self.unregister(name)

    def get(self, name: str) -> RegisteredTool | None:
        return self._tools.get(name)

    def definitions(self) -> list[ToolDefinition]:
        return [t.definition for t in self._tools.values()]

    def is_destructive(self, name: str) -> bool:
        tool = self._tools.get(name)
        return bool(tool and tool.destructive)


tool_registry = ToolRegistry()


def ensure_tools_loaded() -> None:
    """Import every domain module so its tools register themselves.

    Imports are local to avoid circular-import issues (domain modules
    import ``tool_registry`` from this file).
    """
    from app.memory import tools as _memory_tools  # noqa: F401
    from app.services import task_tools as _task_tools  # noqa: F401
    from app.services import calendar_tools as _calendar_tools  # noqa: F401
    from app.services import note_tools as _note_tools  # noqa: F401
    from app.automation import tools as _automation_tools  # noqa: F401
    from app.vision import tools as _vision_tools  # noqa: F401
    from app.services import system_tools as _system_tools  # noqa: F401
    from app.services import email_tools as _email_tools  # noqa: F401
