"""Registers a get_system_stats tool so the agent can answer questions like
'how much RAM am I using?' directly.
"""
from app.ai.base import ToolDefinition
from app.ai.tools import ToolContext, tool_registry
from app.services.system_monitor import get_system_stats


async def _get_system_stats(args: dict, ctx: ToolContext) -> dict:
    return get_system_stats()


tool_registry.register(
    ToolDefinition(
        name="get_system_stats",
        description="Get current CPU, RAM, disk, network, GPU usage, and top running processes.",
        parameters={"type": "object", "properties": {}},
    ),
    _get_system_stats,
)
