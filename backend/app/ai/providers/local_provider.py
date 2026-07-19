"""Default AI provider: any free, self-hosted OpenAI-compatible endpoint.

Works out of the box with Ollama (https://ollama.com) — no API key, no
per-token cost. Also compatible with LM Studio, vLLM, and llama.cpp's
built-in server, since they all speak the same OpenAI chat-completions
wire format.
"""
from __future__ import annotations

from typing import AsyncIterator, Optional

from openai import AsyncOpenAI

from app.ai.base import AIMessage, AIProvider, CompletionResult, ToolCall, ToolDefinition
from app.ai.react import build_tool_instructions, parse_react_output
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
        {
            "type": "function",
            "function": {"name": t.name, "description": t.description, "parameters": t.parameters},
        }
        for t in tools
    ]


class LocalProvider(AIProvider):
    def __init__(self) -> None:
        self.client = AsyncOpenAI(base_url=settings.LOCAL_LLM_BASE_URL, api_key="local-no-key-required")
        self.model = settings.LOCAL_LLM_MODEL
        self.supports_native_tool_calls = settings.LOCAL_LLM_SUPPORTS_TOOL_CALLS

    async def complete(self, messages: list[AIMessage], tools: Optional[list[ToolDefinition]] = None) -> CompletionResult:
        if tools and self.supports_native_tool_calls:
            return await self._complete_native(messages, tools)
        if tools:
            return await self._complete_react(messages, tools)
        return await self._complete_plain(messages)

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
            logger.error(f"Local LLM streaming failed ({settings.LOCAL_LLM_BASE_URL}): {exc}")
            yield (
                "I can't reach the local model right now. Make sure Ollama (or another "
                "OpenAI-compatible server) is running at "
                f"{settings.LOCAL_LLM_BASE_URL} with model '{self.model}' pulled."
            )

    async def _complete_plain(self, messages: list[AIMessage]) -> CompletionResult:
        try:
            response = await self.client.chat.completions.create(model=self.model, messages=_to_openai_messages(messages))
            content = response.choices[0].message.content or ""
            return CompletionResult(content=content)
        except Exception as exc:  # noqa: BLE001
            logger.error(f"Local LLM request failed: {exc}")
            return CompletionResult(
                content=(
                    "I can't reach the local model right now. Make sure Ollama (or another "
                    "OpenAI-compatible server) is running at "
                    f"{settings.LOCAL_LLM_BASE_URL} with model '{self.model}' pulled."
                ),
                finish_reason="error",
            )

    async def _complete_native(self, messages: list[AIMessage], tools: list[ToolDefinition]) -> CompletionResult:
        try:
            response = await self.client.chat.completions.create(
                model=self.model, messages=_to_openai_messages(messages), tools=_to_openai_tools(tools)
            )
            choice = response.choices[0]
            calls = []
            for tc in choice.message.tool_calls or []:
                import json

                try:
                    args = json.loads(tc.function.arguments)
                except json.JSONDecodeError:
                    args = {}
                calls.append(ToolCall(id=tc.id, name=tc.function.name, arguments=args))
            return CompletionResult(content=choice.message.content or "", tool_calls=calls, finish_reason=choice.finish_reason or "stop")
        except Exception as exc:  # noqa: BLE001
            logger.warning(f"Native tool calling failed on local model, falling back to text protocol: {exc}")
            return await self._complete_react(messages, tools)

    async def _complete_react(self, messages: list[AIMessage], tools: list[ToolDefinition]) -> CompletionResult:
        augmented = list(messages)
        instructions = build_tool_instructions(tools)
        if augmented and augmented[0].role == "system":
            augmented[0] = AIMessage(role="system", content=augmented[0].content + "\n\n" + instructions)
        else:
            augmented.insert(0, AIMessage(role="system", content=instructions))

        try:
            response = await self.client.chat.completions.create(model=self.model, messages=_to_openai_messages(augmented))
            raw = response.choices[0].message.content or ""
        except Exception as exc:  # noqa: BLE001
            logger.error(f"Local LLM request failed: {exc}")
            return CompletionResult(
                content=(
                    "I can't reach the local model right now. Make sure Ollama (or another "
                    "OpenAI-compatible server) is running at "
                    f"{settings.LOCAL_LLM_BASE_URL} with model '{self.model}' pulled."
                ),
                finish_reason="error",
            )

        content, call = parse_react_output(raw)
        return CompletionResult(content=content, tool_calls=[call] if call else [])
