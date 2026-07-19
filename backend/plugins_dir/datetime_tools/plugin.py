"""Example JARVIS plugin — copy this directory to build your own skill.

A plugin is just a folder with a manifest.json and a plugin.py exposing a
`Plugin` class that registers one or more tools on the shared registry.
Nothing in the core application needs to change to add new capabilities.
"""
from __future__ import annotations

import ast
import operator
from datetime import datetime, timezone

from app.ai.base import ToolDefinition
from app.ai.tools import ToolContext, ToolRegistry
from app.plugins.base import BasePlugin
from app.schemas.plugin import PluginManifest

_SAFE_OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.USub: operator.neg,
    ast.Mod: operator.mod,
}


def _safe_eval(node: ast.AST) -> float:
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return node.value
    if isinstance(node, ast.BinOp) and type(node.op) in _SAFE_OPERATORS:
        return _SAFE_OPERATORS[type(node.op)](_safe_eval(node.left), _safe_eval(node.right))
    if isinstance(node, ast.UnaryOp) and type(node.op) in _SAFE_OPERATORS:
        return _SAFE_OPERATORS[type(node.op)](_safe_eval(node.operand))
    raise ValueError("Unsupported expression")


async def _get_current_datetime(args: dict, ctx: ToolContext) -> dict:
    now = datetime.now(timezone.utc)
    return {"iso": now.isoformat(), "human": now.strftime("%A, %B %d %Y %H:%M UTC")}


async def _calculate(args: dict, ctx: ToolContext) -> dict:
    expression = args["expression"]
    try:
        tree = ast.parse(expression, mode="eval").body
        return {"expression": expression, "result": _safe_eval(tree)}
    except Exception as exc:  # noqa: BLE001
        return {"error": f"Could not evaluate expression: {exc}"}


class Plugin(BasePlugin):
    manifest = PluginManifest(
        slug="datetime_tools",
        name="Date, Time & Calculator Tools",
        description="Current date/time lookups and a safe arithmetic calculator.",
        version="1.0.0",
        permissions=[],
        entry_point="plugin.py",
    )

    def register_tools(self, registry: ToolRegistry) -> None:
        registry.register(
            ToolDefinition(
                name="get_current_datetime",
                description="Get the current date and time (UTC).",
                parameters={"type": "object", "properties": {}},
            ),
            _get_current_datetime,
        )
        registry.register(
            ToolDefinition(
                name="calculate",
                description="Evaluate a basic arithmetic expression (+, -, *, /, %, **).",
                parameters={"type": "object", "properties": {"expression": {"type": "string"}}, "required": ["expression"]},
            ),
            _calculate,
        )
