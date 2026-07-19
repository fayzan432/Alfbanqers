"""Text-based tool-calling protocol for local models without native function calling.

Many small/older local models served through Ollama or llama.cpp don't
support OpenAI-style ``tools``/``tool_calls``. For those we fall back to a
classic ReAct-style prompt: the model is told which tools exist and asked to
respond with a single ``ACTION`` / ``ACTION_INPUT`` block when it wants to
call one, or plain text otherwise. This module builds that prompt fragment
and parses the model's response back into a structured tool call.
"""
from __future__ import annotations

import json
import re
import uuid
from typing import Optional

from app.ai.base import ToolCall, ToolDefinition

_ACTION_RE = re.compile(r"ACTION:\s*(?P<name>[a-zA-Z0-9_]+)\s*\nACTION_INPUT:\s*(?P<input>\{.*\})", re.DOTALL)


def build_tool_instructions(tools: list[ToolDefinition]) -> str:
    lines = [
        "You have access to the following tools. To use one, respond with "
        "*exactly* this format and nothing else:\n"
        "ACTION: <tool_name>\nACTION_INPUT: <a single JSON object of arguments>\n\n"
        "If you don't need a tool, just answer normally in plain text.\n\nAvailable tools:",
    ]
    for tool in tools:
        lines.append(f"- {tool.name}: {tool.description}\n  arguments schema: {json.dumps(tool.parameters)}")
    return "\n".join(lines)


def parse_react_output(text: str) -> tuple[str, Optional[ToolCall]]:
    match = _ACTION_RE.search(text)
    if not match:
        return text.strip(), None

    name = match.group("name").strip()
    raw_input = match.group("input").strip()
    try:
        arguments = json.loads(raw_input)
    except json.JSONDecodeError:
        arguments = {}

    call = ToolCall(id=f"react-{uuid.uuid4().hex[:8]}", name=name, arguments=arguments)
    leading_text = text[: match.start()].strip()
    return leading_text, call
