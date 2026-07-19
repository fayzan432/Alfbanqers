"""Agent tools for creating and searching notes."""
from sqlalchemy import or_, select

from app.ai.base import ToolDefinition
from app.ai.tools import ToolContext, tool_registry
from app.models.note import Note


async def _create_note(args: dict, ctx: ToolContext) -> dict:
    note = Note(
        user_id=ctx.user.id,
        title=args.get("title", "Untitled"),
        content_markdown=args.get("content", ""),
        folder=args.get("folder", ""),
        tags=args.get("tags", []),
    )
    ctx.db.add(note)
    await ctx.db.commit()
    await ctx.db.refresh(note)
    return {"note_id": note.id, "title": note.title}


async def _search_notes(args: dict, ctx: ToolContext) -> dict:
    like = f"%{args['query']}%"
    query = select(Note).where(
        Note.user_id == ctx.user.id, or_(Note.title.ilike(like), Note.content_markdown.ilike(like))
    )
    result = await ctx.db.execute(query.limit(int(args.get("limit", 10))))
    notes = result.scalars().all()
    return {"notes": [{"id": n.id, "title": n.title, "folder": n.folder} for n in notes]}


tool_registry.register(
    ToolDefinition(
        name="create_note",
        description="Create a new markdown note for the user.",
        parameters={
            "type": "object",
            "properties": {
                "title": {"type": "string"},
                "content": {"type": "string"},
                "folder": {"type": "string"},
                "tags": {"type": "array", "items": {"type": "string"}},
            },
            "required": ["title", "content"],
        },
    ),
    _create_note,
)

tool_registry.register(
    ToolDefinition(
        name="search_notes",
        description="Search the user's notes by title or content.",
        parameters={
            "type": "object",
            "properties": {"query": {"type": "string"}, "limit": {"type": "integer", "default": 10}},
            "required": ["query"],
        },
    ),
    _search_notes,
)
