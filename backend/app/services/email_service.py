"""Email integration: read/search via IMAP, draft/send via SMTP.

Credentials are supplied by the user (an app password, typically) and
stored encrypted at rest (see app.services.crypto). Sending always goes
through the confirmation flow — see email_tools.py and
core.permissions.ALWAYS_GATED_ACTIONS.
"""
from __future__ import annotations

import asyncio
import email
import imaplib
from email.header import decode_header
from email.mime.text import MIMEText
from email.utils import parsedate_to_datetime

import aiosmtplib
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.email_account import EmailAccount
from app.models.user import User
from app.services.crypto import decrypt_secret, encrypt_secret


async def link_account(
    db: AsyncSession, user: User, email_address: str, app_password: str, imap_host: str, imap_port: int, smtp_host: str, smtp_port: int
) -> EmailAccount:
    account = EmailAccount(
        user_id=user.id,
        email_address=email_address,
        imap_host=imap_host,
        imap_port=imap_port,
        smtp_host=smtp_host,
        smtp_port=smtp_port,
        encrypted_credential=encrypt_secret(app_password),
    )
    db.add(account)
    await db.flush()
    return account


async def get_account(db: AsyncSession, user: User, account_id: str | None = None) -> EmailAccount | None:
    query = select(EmailAccount).where(EmailAccount.user_id == user.id)
    if account_id:
        query = query.where(EmailAccount.id == account_id)
    result = await db.execute(query.order_by(EmailAccount.created_at.desc()))
    return result.scalars().first()


def _decode(value: str | None) -> str:
    if not value:
        return ""
    parts = decode_header(value)
    return "".join(p.decode(enc or "utf-8", errors="replace") if isinstance(p, bytes) else p for p, enc in parts)


def _read_inbox_sync(account: EmailAccount, password: str, limit: int, folder: str = "INBOX") -> list[dict]:
    conn = imaplib.IMAP4_SSL(account.imap_host, account.imap_port)
    try:
        conn.login(account.email_address, password)
        conn.select(folder)
        status, data = conn.search(None, "ALL")
        if status != "OK":
            return []
        ids = data[0].split()[-limit:]
        messages = []
        for msg_id in reversed(ids):
            status, msg_data = conn.fetch(msg_id, "(RFC822)")
            if status != "OK" or not msg_data or msg_data[0] is None:
                continue
            msg = email.message_from_bytes(msg_data[0][1])
            date_str = msg.get("Date")
            try:
                sent_at = parsedate_to_datetime(date_str).isoformat() if date_str else None
            except (TypeError, ValueError):
                sent_at = None
            messages.append(
                {
                    "id": msg_id.decode(),
                    "from": _decode(msg.get("From")),
                    "subject": _decode(msg.get("Subject")),
                    "date": sent_at,
                    "snippet": _extract_snippet(msg),
                }
            )
        return messages
    finally:
        conn.logout()


def _extract_snippet(msg: email.message.Message, max_chars: int = 300) -> str:
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/plain":
                try:
                    return part.get_payload(decode=True).decode(errors="replace")[:max_chars]
                except Exception:  # noqa: BLE001
                    continue
        return ""
    try:
        return msg.get_payload(decode=True).decode(errors="replace")[:max_chars]
    except Exception:  # noqa: BLE001
        return ""


async def read_inbox(account: EmailAccount, password: str, limit: int = 20) -> list[dict]:
    return await asyncio.to_thread(_read_inbox_sync, account, password, limit)


def _search_sync(account: EmailAccount, password: str, query: str, limit: int) -> list[dict]:
    conn = imaplib.IMAP4_SSL(account.imap_host, account.imap_port)
    try:
        conn.login(account.email_address, password)
        conn.select("INBOX")
        status, data = conn.search(None, f'(OR SUBJECT "{query}" FROM "{query}")')
        if status != "OK":
            return []
        ids = data[0].split()[-limit:]
        results = []
        for msg_id in reversed(ids):
            status, msg_data = conn.fetch(msg_id, "(RFC822)")
            if status != "OK" or not msg_data or msg_data[0] is None:
                continue
            msg = email.message_from_bytes(msg_data[0][1])
            results.append({"id": msg_id.decode(), "from": _decode(msg.get("From")), "subject": _decode(msg.get("Subject"))})
        return results
    finally:
        conn.logout()


async def search_inbox(account: EmailAccount, password: str, query: str, limit: int = 20) -> list[dict]:
    return await asyncio.to_thread(_search_sync, account, password, query, limit)


async def send_email(account: EmailAccount, password: str, to: str, subject: str, body: str) -> dict:
    """Actually sends. Always gated behind explicit confirmation — never
    call directly from a tool handler without going through that flow."""
    message = MIMEText(body)
    message["From"] = account.email_address
    message["To"] = to
    message["Subject"] = subject

    await aiosmtplib.send(
        message,
        hostname=account.smtp_host,
        port=account.smtp_port,
        username=account.email_address,
        password=password,
        start_tls=True,
    )
    return {"to": to, "subject": subject, "sent": True}


def decrypt_account_password(account: EmailAccount) -> str:
    return decrypt_secret(account.encrypted_credential)


async def summarize_inbox(account: EmailAccount, password: str, limit: int = 10) -> str:
    messages = await read_inbox(account, password, limit=limit)
    if not messages:
        return "No messages found."

    from app.ai.base import AIMessage
    from app.ai.factory import get_ai_provider

    provider = get_ai_provider()
    listing = "\n".join(f"- From: {m['from']} | Subject: {m['subject']}" for m in messages)
    prompt = f"Summarize the following inbox into a short briefing, grouping by topic/sender where useful:\n\n{listing}"
    completion = await provider.complete([AIMessage(role="user", content=prompt)])
    return completion.content.strip()
