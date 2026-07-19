"""Optional bring-your-own-key provider. Only used if AI_PROVIDER=openai
and OPENAI_API_KEY is set — never required for JARVIS to function.
"""
from __future__ import annotations

import json
from typing import AsyncIterator, Optional

from openai import AsyncOpenAI

from app.ai.base import AIMessage, AIProvider, CompletionResult, ToolCall, ToolDefinition
from app.core.config import settings
from app.core.logging import logger


def _to_openai_messages(messages: list[AIMessage]) -> list[dict]:
    out = []
    for m in messages:
        entry: dict = {"role": m.role, "content": m.content}
        if m.name:
            entry["name"] = m.name
        if m.tool_call_id:
            entry["tool_call_id"] = m.tool_call_id
        out.append(entry)
    return out


def _to_openai_tools(tools: list[ToolDefinition]) -> list[dict]:
    return [
        {"type": "function", "function": {"name": t.name, "description": t.description, "parameters": t.parameters}}
        for t in tools
    ]


class OpenAIProvider(AIProvider):
    def __init__(self) -> None:
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL

    async def complete(self, messages: list[AIMessage], tools: Optional[list[ToolDefinition]] = None) -> CompletionResult:
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=_to_openai_messages(messages),
                tools=_to_openai_tools(tools) if tools else None,
            )
            choice = response.choices[0]
            calls = []
            for tc in choice.message.tool_calls or []:
                try:
                    args = json.loads(tc.function.arguments)
                except json.JSONDecodeError:
                    args = {}
                calls.append(ToolCall(id=tc.id, name=tc.function.name, arguments=args))
            return CompletionResult(content=choice.message.content or "", tool_calls=calls, finish_reason=choice.finish_reason or "stop")
        except Exception as exc:  # noqa: BLE001
            logger.error(f"OpenAI request failed: {exc}")
            return CompletionResult(content=f"OpenAI request failed: {exc}", finish_reason="error")

    async def stream(self, messages: list[AIMessage], tools: Optional[list[ToolDefinition]] = None) -> AsyncIterator[str]:
        try:
            response = await self.client.chat.completions.create(
                model=self.model, messages=_to_openai_messages(messages), stream=True
            )
            async for chunk in response:
                delta = chunk.choices[0].delta.content if chunk.choices else None
                if delta:
                    yield delta
        except Exception as exc:  # noqa: BLE001
            logger.error(f"OpenAI streaming failed: {exc}")
            yield f"OpenAI request failed: {exc}"
