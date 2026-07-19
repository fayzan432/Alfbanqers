"""Registers email actions the agent can call. Sending is always gated —
see ALWAYS_GATED_ACTIONS in app.core.permissions.
"""
from app.ai.base import ToolDefinition
from app.ai.tools import ToolContext, tool_registry
from app.services import email_service


async def _resolve_account(args: dict, ctx: ToolContext):
    return await email_service.get_account(ctx.db, ctx.user, args.get("account_id"))


async def _read_inbox(args: dict, ctx: ToolContext) -> dict:
    account = await _resolve_account(args, ctx)
    if account is None:
        return {"error": "No linked email account. Ask the user to link one in Settings first."}
    password = email_service.decrypt_account_password(account)
    messages = await email_service.read_inbox(account, password, limit=int(args.get("limit", 20)))
    return {"messages": messages}


async def _search_emails(args: dict, ctx: ToolContext) -> dict:
    account = await _resolve_account(args, ctx)
    if account is None:
        return {"error": "No linked email account. Ask the user to link one in Settings first."}
    password = email_service.decrypt_account_password(account)
    messages = await email_service.search_inbox(account, password, args["query"], limit=int(args.get("limit", 20)))
    return {"messages": messages}


async def _summarize_inbox(args: dict, ctx: ToolContext) -> dict:
    account = await _resolve_account(args, ctx)
    if account is None:
        return {"error": "No linked email account. Ask the user to link one in Settings first."}
    password = email_service.decrypt_account_password(account)
    summary = await email_service.summarize_inbox(account, password, limit=int(args.get("limit", 10)))
    return {"summary": summary}


async def _draft_email(args: dict, ctx: ToolContext) -> dict:
    """Composes a draft without sending it — a safe, non-destructive step
    the agent should use before ever calling send_email."""
    return {"to": args["to"], "subject": args["subject"], "body": args["body"], "status": "draft"}


async def _send_email(args: dict, ctx: ToolContext) -> dict:
    account = await _resolve_account(args, ctx)
    if account is None:
        return {"error": "No linked email account."}
    password = email_service.decrypt_account_password(account)
    return await email_service.send_email(account, password, args["to"], args["subject"], args["body"])


tool_registry.register(
    ToolDefinition(
        "read_inbox", "Read the most recent emails from the user's linked inbox.",
        {"type": "object", "properties": {"account_id": {"type": "string"}, "limit": {"type": "integer", "default": 20}}},
    ),
    _read_inbox,
)

tool_registry.register(
    ToolDefinition(
        "search_emails", "Search the user's inbox by subject or sender.",
        {"type": "object", "properties": {"query": {"type": "string"}, "account_id": {"type": "string"}, "limit": {"type": "integer", "default": 20}}, "required": ["query"]},
    ),
    _search_emails,
)

tool_registry.register(
    ToolDefinition(
        "summarize_inbox", "Summarize the user's recent inbox into a short briefing.",
        {"type": "object", "properties": {"account_id": {"type": "string"}, "limit": {"type": "integer", "default": 10}}},
    ),
    _summarize_inbox,
)

tool_registry.register(
    ToolDefinition(
        "draft_email", "Compose an email draft (does not send it) to show the user before sending.",
        {"type": "object", "properties": {"to": {"type": "string"}, "subject": {"type": "string"}, "body": {"type": "string"}}, "required": ["to", "subject", "body"]},
    ),
    _draft_email,
)

tool_registry.register(
    ToolDefinition(
        "send_email", "Send an email on the user's behalf. Destructive — always requires confirmation.",
        {
            "type": "object",
            "properties": {
                "account_id": {"type": "string"},
                "to": {"type": "string"},
                "subject": {"type": "string"},
                "body": {"type": "string"},
            },
            "required": ["to", "subject", "body"],
        },
    ),
    _send_email,
    destructive=True,
)
