from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.core.permissions import permission_manager
from app.models.email_account import EmailAccount
from app.schemas.email import ConfirmSendRequest, EmailAccountLink, EmailAccountRead, SendEmailRequest
from app.services import email_service

router = APIRouter(prefix="/email", tags=["email"])


@router.post("/accounts", response_model=EmailAccountRead, status_code=201)
async def link_account(payload: EmailAccountLink, current_user: CurrentUser, db: DbSession) -> EmailAccount:
    account = await email_service.link_account(
        db, current_user, payload.email_address, payload.app_password, payload.imap_host, payload.imap_port, payload.smtp_host, payload.smtp_port
    )
    await db.commit()
    await db.refresh(account)
    return account


@router.get("/accounts", response_model=list[EmailAccountRead])
async def list_accounts(current_user: CurrentUser, db: DbSession) -> list[EmailAccount]:
    result = await db.execute(select(EmailAccount).where(EmailAccount.user_id == current_user.id))
    return list(result.scalars().all())


@router.get("/inbox")
async def get_inbox(current_user: CurrentUser, db: DbSession, account_id: str | None = None, limit: int = 20) -> dict:
    account = await email_service.get_account(db, current_user, account_id)
    if account is None:
        raise HTTPException(status_code=404, detail="No linked email account")
    password = email_service.decrypt_account_password(account)
    messages = await email_service.read_inbox(account, password, limit=limit)
    return {"messages": messages}


@router.get("/search")
async def search_inbox(current_user: CurrentUser, db: DbSession, query: str, account_id: str | None = None, limit: int = 20) -> dict:
    account = await email_service.get_account(db, current_user, account_id)
    if account is None:
        raise HTTPException(status_code=404, detail="No linked email account")
    password = email_service.decrypt_account_password(account)
    messages = await email_service.search_inbox(account, password, query, limit=limit)
    return {"messages": messages}


@router.get("/summary")
async def inbox_summary(current_user: CurrentUser, db: DbSession, account_id: str | None = None) -> dict:
    account = await email_service.get_account(db, current_user, account_id)
    if account is None:
        raise HTTPException(status_code=404, detail="No linked email account")
    password = email_service.decrypt_account_password(account)
    summary = await email_service.summarize_inbox(account, password)
    return {"summary": summary}


@router.post("/send/request")
async def request_send(payload: SendEmailRequest, current_user: CurrentUser) -> dict:
    """Sending always requires confirmation. Returns a token; call
    /email/send/confirm with it to actually send."""
    pending = permission_manager.create_pending(
        "send_email",
        {"account_id": payload.account_id, "to": payload.to, "subject": payload.subject, "body": payload.body},
        requested_by=current_user.id,
    )
    return {"token": pending.token, "action": "send_email", "to": payload.to, "subject": payload.subject}


@router.post("/send/confirm")
async def confirm_send(payload: ConfirmSendRequest, current_user: CurrentUser, db: DbSession) -> dict:
    pending = permission_manager.pop_pending(payload.token, requested_by=current_user.id)
    if pending is None:
        raise HTTPException(status_code=410, detail="Confirmation expired or invalid")
    if not payload.approve:
        return {"sent": False, "cancelled": True}

    account = await email_service.get_account(db, current_user, pending.payload["account_id"])
    if account is None:
        raise HTTPException(status_code=404, detail="Email account not found")
    password = email_service.decrypt_account_password(account)
    result = await email_service.send_email(account, password, pending.payload["to"], pending.payload["subject"], pending.payload["body"])
    return result
