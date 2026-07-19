from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy import select

from app.ai.agent import get_agent
from app.api.deps import CurrentUser, DbSession
from app.models.conversation import Conversation
from app.schemas.conversation import ChatRequest, ChatResponse, ConversationDetail, ConversationRead, MessageRead

router = APIRouter(prefix="/chat", tags=["chat"])


class ConfirmRequest(BaseModel):
    token: str
    approve: bool


@router.get("/conversations", response_model=list[ConversationRead])
async def list_conversations(current_user: CurrentUser, db: DbSession) -> list[Conversation]:
    result = await db.execute(
        select(Conversation).where(Conversation.user_id == current_user.id).order_by(Conversation.updated_at.desc())
    )
    return list(result.scalars().all())


@router.get("/conversations/{conversation_id}", response_model=ConversationDetail)
async def get_conversation(conversation_id: str, current_user: CurrentUser, db: DbSession) -> Conversation:
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id, Conversation.user_id == current_user.id)
    )
    conversation = result.scalar_one_or_none()
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    await db.refresh(conversation, attribute_names=["messages"])
    return conversation


@router.post("/send", response_model=ChatResponse)
async def send_message(payload: ChatRequest, current_user: CurrentUser, db: DbSession) -> ChatResponse:
    agent = get_agent()
    result = await agent.handle_message(db, current_user, payload.conversation_id, payload.message)
    return ChatResponse(
        conversation_id=result.conversation.id,
        message=MessageRead.model_validate(result.message),
        action_taken=result.action_taken,
        pending_confirmation_token=result.pending_confirmation_token,
    )


@router.post("/confirm")
async def confirm_action(payload: ConfirmRequest, current_user: CurrentUser, db: DbSession) -> dict:
    agent = get_agent()
    outcome = await agent.confirm_pending_action(db, current_user, payload.token, payload.approve)
    await db.commit()
    return {"result": outcome}
