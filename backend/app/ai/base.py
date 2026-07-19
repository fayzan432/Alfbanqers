"""Provider-agnostic types for the AI reasoning layer.

Every concrete provider (local/OpenAI/Anthropic) speaks this vocabulary so
the agent loop in app.ai.agent never has to know which backend is running.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, AsyncIterator, Optional


@dataclass
class ToolCall:
    id: str
    name: str
    arguments: dict[str, Any]


@dataclass
class AIMessage:
    role: str  # system | user | assistant | tool
    content: str
    tool_call_id: Optional[str] = None
    name: Optional[str] = None
    tool_calls: list[ToolCall] = field(default_factory=list)


@dataclass
class ToolDefinition:
    name: str
    description: str
    parameters: dict[str, Any]  # JSON schema for the arguments object


@dataclass
class CompletionResult:
    content: str
    tool_calls: list[ToolCall] = field(default_factory=list)
    finish_reason: str = "stop"


class AIProvider(ABC):
    """Common interface implemented by every chat-completion backend."""

    supports_native_tool_calls: bool = True

    @abstractmethod
    async def complete(
        self,
        messages: list[AIMessage],
        tools: Optional[list[ToolDefinition]] = None,
    ) -> CompletionResult:
        ...

    @abstractmethod
    async def stream(
        self,
        messages: list[AIMessage],
        tools: Optional[list[ToolDefinition]] = None,
    ) -> AsyncIterator[str]:
        ...
