"""Optional bring-your-own-key provider. Only used if AI_PROVIDER=anthropic
and ANTHROPIC_API_KEY is set — never required for JARVIS to function.
"""
from __future__ import annotations

from typing import AsyncIterator, Optional

from anthropic import AsyncAnthropic

from app.ai.base import AIMessage, AIProvider, CompletionResult, ToolCall, ToolDefinition
from app.core.config import settings
from app.core.logging import logger


def _split_system(messages: list[AIMessage]) -> tuple[str, list[AIMessage]]:
    system_parts = [m.content for m in messages if m.role == "system"]
    rest = [m for m in messages if m.role != "system"]
    return "\n\n".join(system_parts), rest


def _to_anthropic_messages(messages: list[AIMessage]) -> list[dict]:
    out = []
    for m in messages:
        if m.role == "tool":
            out.append(
                {
                    "role": "user",
                    "content": [
                        {"type": "tool_result", "tool_use_id": m.tool_call_id, "content": m.content}
                    ],
                }
            )
        else:
            out.append({"role": m.role, "content": m.content})
    return out


def _to_anthropic_tools(tools: list[ToolDefinition]) -> list[dict]:
    return [{"name": t.name, "description": t.description, "input_schema": t.parameters} for t in tools]


class AnthropicProvider(AIProvider):
    def __init__(self) -> None:
        self.client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = settings.ANTHROPIC_MODEL

    async def complete(self, messages: list[AIMessage], tools: Optional[list[ToolDefinition]] = None) -> CompletionResult:
        system, rest = _split_system(messages)
        try:
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=2048,
                system=system,
                messages=_to_anthropic_messages(rest),
                tools=_to_anthropic_tools(tools) if tools else [],
            )
            content = ""
            calls: list[ToolCall] = []
            for block in response.content:
                if block.type == "text":
                    content += block.text
                elif block.type == "tool_use":
                    calls.append(ToolCall(id=block.id, name=block.name, arguments=block.input))
            return CompletionResult(content=content, tool_calls=calls, finish_reason=response.stop_reason or "stop")
        except Exception as exc:  # noqa: BLE001
            logger.error(f"Anthropic request failed: {exc}")
            return CompletionResult(content=f"Anthropic request failed: {exc}", finish_reason="error")

    async def stream(self, messages: list[AIMessage], tools: Optional[list[ToolDefinition]] = None) -> AsyncIterator[str]:
        system, rest = _split_system(messages)
        try:
            async with self.client.messages.stream(
                model=self.model, max_tokens=2048, system=system, messages=_to_anthropic_messages(rest)
            ) as stream:
                async for text in stream.text_stream:
                    yield text
        except Exception as exc:  # noqa: BLE001
            logger.error(f"Anthropic streaming failed: {exc}")
            yield f"Anthropic request failed: {exc}"
