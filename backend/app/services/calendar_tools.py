"""Agent tools for scheduling meetings, reminders, and recurring events."""
from datetime import datetime

from sqlalchemy import select

from app.ai.base import ToolDefinition
from app.ai.tools import ToolContext, tool_registry
from app.models.calendar import CalendarEvent


async def _create_event(args: dict, ctx: ToolContext) -> dict:
    event = CalendarEvent(
        user_id=ctx.user.id,
        title=args["title"],
        description=args.get("description", ""),
        location=args.get("location", ""),
        start_time=datetime.fromisoformat(args["start_time"]),
        end_time=datetime.fromisoformat(args["end_time"]),
        event_type=args.get("event_type", "meeting"),
        recurrence=args.get("recurrence", "none"),
        reminder_minutes_before=int(args.get("reminder_minutes_before", 10)),
    )
    ctx.db.add(event)
    await ctx.db.commit()
    await ctx.db.refresh(event)
    return {"event_id": event.id, "title": event.title, "start_time": event.start_time.isoformat()}


async def _list_events(args: dict, ctx: ToolContext) -> dict:
    query = select(CalendarEvent).where(CalendarEvent.user_id == ctx.user.id)
    if args.get("after"):
        query = query.where(CalendarEvent.start_time >= datetime.fromisoformat(args["after"]))
    if args.get("before"):
        query = query.where(CalendarEvent.start_time <= datetime.fromisoformat(args["before"]))
    result = await ctx.db.execute(query.order_by(CalendarEvent.start_time.asc()).limit(int(args.get("limit", 10))))
    events = result.scalars().all()
    return {
        "events": [
            {"id": e.id, "title": e.title, "start_time": e.start_time.isoformat(), "end_time": e.end_time.isoformat()}
            for e in events
        ]
    }


tool_registry.register(
    ToolDefinition(
        name="create_calendar_event",
        description="Schedule a meeting, reminder, or recurring event on the user's calendar.",
        parameters={
            "type": "object",
            "properties": {
                "title": {"type": "string"},
                "description": {"type": "string"},
                "location": {"type": "string"},
                "start_time": {"type": "string", "description": "ISO-8601 datetime"},
                "end_time": {"type": "string", "description": "ISO-8601 datetime"},
                "event_type": {"type": "string", "enum": ["meeting", "reminder", "task", "custom"], "default": "meeting"},
                "recurrence": {"type": "string", "enum": ["none", "daily", "weekly", "monthly", "yearly"], "default": "none"},
                "reminder_minutes_before": {"type": "integer", "default": 10},
            },
            "required": ["title", "start_time", "end_time"],
        },
    ),
    _create_event,
)

tool_registry.register(
    ToolDefinition(
        name="list_calendar_events",
        description="List the user's upcoming or past calendar events.",
        parameters={
            "type": "object",
            "properties": {
                "after": {"type": "string", "description": "ISO-8601 datetime lower bound, optional"},
                "before": {"type": "string", "description": "ISO-8601 datetime upper bound, optional"},
                "limit": {"type": "integer", "default": 10},
            },
        },
    ),
    _list_events,
)
