"""Registers memory actions the agent can call during reasoning."""
from app.ai.base import ToolDefinition
from app.ai.tools import ToolContext, tool_registry
from app.memory.service import add_memory, search_relevant_memories


async def _remember(args: dict, ctx: ToolContext) -> dict:
    content = args.get("content", "").strip()
    kind = args.get("kind", "long_term")
    importance = int(args.get("importance", 1))
    if not content:
        return {"error": "content is required"}
    record = await add_memory(ctx.db, ctx.user, content, kind=kind, importance=importance, source="agent")
    await ctx.db.commit()
    return {"stored": True, "memory_id": record.id}


async def _search_memory(args: dict, ctx: ToolContext) -> dict:
    query = args.get("query", "").strip()
    top_k = int(args.get("top_k", 5))
    if not query:
        return {"error": "query is required"}
    hits = await search_relevant_memories(ctx.db, ctx.user, query, top_k=top_k)
    return {"results": hits}


tool_registry.register(
    ToolDefinition(
        name="remember",
        description="Save an important fact, preference, or project detail about the user to long-term memory.",
        parameters={
            "type": "object",
            "properties": {
                "content": {"type": "string", "description": "The fact to remember, written in plain language."},
                "kind": {
                    "type": "string",
                    "enum": ["short_term", "long_term", "semantic", "fact", "preference", "project"],
                    "default": "long_term",
                },
                "importance": {"type": "integer", "minimum": 1, "maximum": 5, "default": 1},
            },
            "required": ["content"],
        },
    ),
    _remember,
)

tool_registry.register(
    ToolDefinition(
        name="search_memory",
        description="Semantically search the user's memory for relevant facts, preferences, or past context.",
        parameters={
            "type": "object",
            "properties": {
                "query": {"type": "string"},
                "top_k": {"type": "integer", "default": 5},
            },
            "required": ["query"],
        },
    ),
    _search_memory,
)
