"""The JARVIS reasoning loop: wake word -> ASR (upstream) -> reasoning ->
action selection -> execute action -> response. This module implements the
"reasoning -> action selection -> execute action" middle of that pipeline
for both voice and text input, since both converge on the same chat flow.
"""
from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.base import AIMessage
from app.ai.factory import get_ai_provider
from app.ai.personality import build_system_prompt
from app.ai.tools import ToolContext, ensure_tools_loaded, tool_registry
from app.core.logging import logger
from app.core.permissions import permission_manager
from app.models.conversation import Conversation, Message
from app.models.user import User

MAX_TOOL_ITERATIONS = 5
HISTORY_MESSAGE_LIMIT = 20


@dataclass
class AgentTurnResult:
    conversation: Conversation
    message: Message
    action_taken: Optional[str] = None
    pending_confirmation_token: Optional[str] = None


async def _get_or_create_conversation(db: AsyncSession, user: User, conversation_id: Optional[str]) -> Conversation:
    if conversation_id:
        result = await db.execute(
            select(Conversation).where(Conversation.id == conversation_id, Conversation.user_id == user.id)
        )
        conversation = result.scalar_one_or_none()
        if conversation is not None:
            return conversation

    conversation = Conversation(user_id=user.id, title="New Conversation")
    db.add(conversation)
    await db.flush()
    return conversation


async def _load_history(db: AsyncSession, conversation: Conversation) -> list[AIMessage]:
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation.id)
        .order_by(Message.created_at.desc())
        .limit(HISTORY_MESSAGE_LIMIT)
    )
    rows = list(reversed(result.scalars().all()))
    return [AIMessage(role=m.role, content=m.content) for m in rows if m.role in ("user", "assistant")]


async def _save_message(
    db: AsyncSession,
    conversation: Conversation,
    role: str,
    content: str,
    tool_name: str = "",
    tool_payload: Optional[dict] = None,
) -> Message:
    message = Message(
        conversation_id=conversation.id,
        role=role,
        content=content,
        tool_name=tool_name,
        tool_payload=tool_payload or {},
    )
    db.add(message)
    await db.flush()
    return message


class JarvisAgent:
    def __init__(self) -> None:
        ensure_tools_loaded()
        self.provider = get_ai_provider()

    async def handle_message(
        self, db: AsyncSession, user: User, conversation_id: Optional[str], user_text: str
    ) -> AgentTurnResult:
        conversation = await _get_or_create_conversation(db, user, conversation_id)
        if conversation.title == "New Conversation" and len(user_text) > 0:
            conversation.title = user_text[:60]

        await _save_message(db, conversation, "user", user_text)

        from app.memory.service import search_relevant_memories

        memory_hits = await search_relevant_memories(db, user, user_text, top_k=5)
        memory_context = "\n".join(f"- {m}" for m in memory_hits) if memory_hits else ""

        system_prompt = build_system_prompt(user.full_name, memory_context)
        history = await _load_history(db, conversation)
        messages: list[AIMessage] = [AIMessage(role="system", content=system_prompt), *history]

        ctx = ToolContext(db=db, user=user)
        action_taken: Optional[str] = None

        for _ in range(MAX_TOOL_ITERATIONS):
            result = await self.provider.complete(messages, tools=tool_registry.definitions())

            if not result.tool_calls:
                assistant_message = await _save_message(db, conversation, "assistant", result.content)
                await db.commit()
                await db.refresh(assistant_message)
                await db.refresh(conversation)
                return AgentTurnResult(conversation=conversation, message=assistant_message, action_taken=action_taken)

            call = result.tool_calls[0]
            registered = tool_registry.get(call.name)

            if registered is None:
                messages.append(AIMessage(role="assistant", content=result.content))
                messages.append(
                    AIMessage(role="tool", tool_call_id=call.id, name=call.name, content=f"Unknown tool: {call.name}")
                )
                continue

            requires_confirmation = registered.destructive or permission_manager.action_requires_confirmation(call.name)
            if requires_confirmation:
                pending = permission_manager.create_pending(call.name, call.arguments, requested_by=user.id)
                confirmation_text = result.content or self._describe_pending_action(call.name, call.arguments)
                assistant_message = await _save_message(
                    db,
                    conversation,
                    "assistant",
                    confirmation_text,
                    tool_name="confirmation_request",
                    tool_payload={"token": pending.token, "action": call.name, "arguments": call.arguments},
                )
                await db.commit()
                await db.refresh(assistant_message)
                await db.refresh(conversation)
                return AgentTurnResult(
                    conversation=conversation,
                    message=assistant_message,
                    action_taken=None,
                    pending_confirmation_token=pending.token,
                )

            action_taken = call.name
            try:
                tool_result = await registered.handler(call.arguments, ctx)
            except Exception as exc:  # noqa: BLE001
                logger.error(f"Tool '{call.name}' raised: {exc}")
                tool_result = {"error": str(exc)}

            messages.append(AIMessage(role="assistant", content=result.content, tool_calls=[call]))
            messages.append(
                AIMessage(role="tool", tool_call_id=call.id, name=call.name, content=json.dumps(tool_result, default=str))
            )

        fallback_message = await _save_message(
            db, conversation, "assistant", "I've hit my reasoning step limit for this turn. Could you rephrase or split that up?"
        )
        await db.commit()
        await db.refresh(fallback_message)
        return AgentTurnResult(conversation=conversation, message=fallback_message, action_taken=action_taken)

    async def confirm_pending_action(self, db: AsyncSession, user: User, token: str, approve: bool) -> str:
        pending = permission_manager.pop_pending(token, requested_by=user.id)
        if pending is None:
            return "That confirmation has expired or was already handled. Please ask me again."

        if not approve:
            return "Understood — cancelled."

        registered = tool_registry.get(pending.action)
        if registered is None:
            return f"I can't find the '{pending.action}' action anymore."

        ctx = ToolContext(db=db, user=user)
        try:
            result = await registered.handler(pending.payload, ctx)
        except Exception as exc:  # noqa: BLE001
            logger.error(f"Confirmed tool '{pending.action}' raised: {exc}")
            return f"That action failed: {exc}"

        return f"Done. {json.dumps(result, default=str)}"

    @staticmethod
    def _describe_pending_action(action: str, arguments: dict) -> str:
        readable = action.replace("_", " ")
        details = ", ".join(f"{k}={v}" for k, v in arguments.items())
        return f"I'm ready to {readable} ({details}). Should I proceed?"


_agent_singleton: Optional[JarvisAgent] = None


def get_agent() -> JarvisAgent:
    global _agent_singleton
    if _agent_singleton is None:
        _agent_singleton = JarvisAgent()
    return _agent_singleton
