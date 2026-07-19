"""Agent tools for creating/listing/completing tasks."""
from datetime import datetime

from sqlalchemy import select

from app.ai.base import ToolDefinition
from app.ai.tools import ToolContext, tool_registry
from app.models.task import Task


async def _create_task(args: dict, ctx: ToolContext) -> dict:
    due = args.get("due_date")
    task = Task(
        user_id=ctx.user.id,
        title=args["title"],
        description=args.get("description", ""),
        priority=args.get("priority", "medium"),
        due_date=datetime.fromisoformat(due) if due else None,
    )
    ctx.db.add(task)
    await ctx.db.commit()
    await ctx.db.refresh(task)
    return {"task_id": task.id, "title": task.title, "status": task.status}


async def _list_tasks(args: dict, ctx: ToolContext) -> dict:
    query = select(Task).where(Task.user_id == ctx.user.id)
    status = args.get("status")
    if status:
        query = query.where(Task.status == status)
    result = await ctx.db.execute(query.order_by(Task.created_at.desc()).limit(int(args.get("limit", 10))))
    tasks = result.scalars().all()
    return {"tasks": [{"id": t.id, "title": t.title, "status": t.status, "priority": t.priority} for t in tasks]}


async def _complete_task(args: dict, ctx: ToolContext) -> dict:
    result = await ctx.db.execute(select(Task).where(Task.id == args["task_id"], Task.user_id == ctx.user.id))
    task = result.scalar_one_or_none()
    if task is None:
        return {"error": "task not found"}
    task.status = "done"
    task.completed = True
    await ctx.db.commit()
    return {"task_id": task.id, "status": task.status}


tool_registry.register(
    ToolDefinition(
        name="create_task",
        description="Create a to-do task for the user.",
        parameters={
            "type": "object",
            "properties": {
                "title": {"type": "string"},
                "description": {"type": "string"},
                "priority": {"type": "string", "enum": ["low", "medium", "high", "urgent"], "default": "medium"},
                "due_date": {"type": "string", "description": "ISO-8601 datetime, optional"},
            },
            "required": ["title"],
        },
    ),
    _create_task,
)

tool_registry.register(
    ToolDefinition(
        name="list_tasks",
        description="List the user's tasks, optionally filtered by status.",
        parameters={
            "type": "object",
            "properties": {
                "status": {"type": "string", "enum": ["todo", "in_progress", "done", "cancelled"]},
                "limit": {"type": "integer", "default": 10},
            },
        },
    ),
    _list_tasks,
)

tool_registry.register(
    ToolDefinition(
        name="complete_task",
        description="Mark a task as completed.",
        parameters={"type": "object", "properties": {"task_id": {"type": "string"}}, "required": ["task_id"]},
    ),
    _complete_task,
)
