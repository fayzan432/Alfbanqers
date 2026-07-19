"""REST + WebSocket voice interface.

The WebSocket protocol (JSON messages, base64-encoded audio payloads) is:

Client -> Server
  {"type": "wake_check", "audio_base64": "...", "format": "wav"}
  {"type": "utterance", "conversation_id": "...", "audio_base64": "...", "format": "wav"}
  {"type": "text", "conversation_id": "...", "text": "..."}

Server -> Client
  {"type": "wake_result", "detected": bool, "transcript": "..."}
  {"type": "transcript", "text": "..."}
  {"type": "assistant_message", "conversation_id": "...", "text": "...", "action_taken": ..., "pending_confirmation_token": ...}
  {"type": "tts_audio", "audio_base64": "...", "mime": "audio/mpeg"}
  {"type": "error", "message": "..."}
"""
from __future__ import annotations

import base64
import tempfile
from pathlib import Path

from fastapi import APIRouter, UploadFile, WebSocket, WebSocketDisconnect, File
from fastapi.responses import FileResponse

from app.ai.agent import get_agent
from app.api.deps import CurrentUser, DbSession
from app.core.logging import logger
from app.core.security import decode_access_token
from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.voice import stt, tts, wake_word

router = APIRouter(prefix="/voice", tags=["voice"])


def _decode_audio_to_tempfile(audio_base64: str, fmt: str = "wav") -> str:
    audio_bytes = base64.b64decode(audio_base64)
    tmp = tempfile.NamedTemporaryFile(suffix=f".{fmt}", delete=False)
    tmp.write(audio_bytes)
    tmp.close()
    return tmp.name


@router.post("/transcribe")
async def transcribe(_: CurrentUser, file: UploadFile = File(...)) -> dict:
    suffix = Path(file.filename or "audio.wav").suffix or ".wav"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name
    return stt.transcribe_file(tmp_path)


@router.post("/synthesize")
async def synthesize(_: CurrentUser, text: str, voice: str | None = None) -> FileResponse:
    path = await tts.synthesize_speech(text, voice)
    media_type = "audio/mpeg" if path.endswith(".mp3") else "audio/wav"
    return FileResponse(path, media_type=media_type)


async def _authenticate_ws(websocket: WebSocket) -> User | None:
    token = websocket.query_params.get("token")
    payload = decode_access_token(token) if token else None
    if payload is None:
        return None
    user_id = payload.get("sub")

    async with AsyncSessionLocal() as db:
        from sqlalchemy import select

        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()


@router.websocket("/ws")
async def voice_ws(websocket: WebSocket) -> None:
    user = await _authenticate_ws(websocket)
    if user is None:
        await websocket.close(code=4401)
        return

    await websocket.accept()
    agent = get_agent()

    try:
        while True:
            message = await websocket.receive_json()
            msg_type = message.get("type")

            if msg_type == "wake_check":
                audio_path = _decode_audio_to_tempfile(message["audio_base64"], message.get("format", "wav"))
                try:
                    result = stt.transcribe_file(audio_path)
                    detected = wake_word.contains_wake_word(result["text"])
                    await websocket.send_json({"type": "wake_result", "detected": detected, "transcript": result["text"]})
                finally:
                    Path(audio_path).unlink(missing_ok=True)

            elif msg_type == "utterance":
                audio_path = _decode_audio_to_tempfile(message["audio_base64"], message.get("format", "wav"))
                try:
                    result = stt.transcribe_file(audio_path)
                    text = wake_word.strip_wake_word(result["text"]) or result["text"]
                    await websocket.send_json({"type": "transcript", "text": text})

                    async with AsyncSessionLocal() as db:
                        from sqlalchemy import select

                        db_user = (await db.execute(select(User).where(User.id == user.id))).scalar_one()
                        turn = await agent.handle_message(db, db_user, message.get("conversation_id"), text)

                    await websocket.send_json(
                        {
                            "type": "assistant_message",
                            "conversation_id": turn.conversation.id,
                            "text": turn.message.content,
                            "action_taken": turn.action_taken,
                            "pending_confirmation_token": turn.pending_confirmation_token,
                        }
                    )

                    audio_response_path = await tts.synthesize_speech(turn.message.content, db_user.settings.get("voice"))
                    audio_bytes = Path(audio_response_path).read_bytes()
                    mime = "audio/mpeg" if audio_response_path.endswith(".mp3") else "audio/wav"
                    await websocket.send_json(
                        {"type": "tts_audio", "audio_base64": base64.b64encode(audio_bytes).decode(), "mime": mime}
                    )
                finally:
                    Path(audio_path).unlink(missing_ok=True)

            elif msg_type == "text":
                async with AsyncSessionLocal() as db:
                    from sqlalchemy import select

                    db_user = (await db.execute(select(User).where(User.id == user.id))).scalar_one()
                    turn = await agent.handle_message(db, db_user, message.get("conversation_id"), message["text"])

                await websocket.send_json(
                    {
                        "type": "assistant_message",
                        "conversation_id": turn.conversation.id,
                        "text": turn.message.content,
                        "action_taken": turn.action_taken,
                        "pending_confirmation_token": turn.pending_confirmation_token,
                    }
                )
                audio_response_path = await tts.synthesize_speech(turn.message.content, db_user.settings.get("voice"))
                audio_bytes = Path(audio_response_path).read_bytes()
                mime = "audio/mpeg" if audio_response_path.endswith(".mp3") else "audio/wav"
                await websocket.send_json(
                    {"type": "tts_audio", "audio_base64": base64.b64encode(audio_bytes).decode(), "mime": mime}
                )

            else:
                await websocket.send_json({"type": "error", "message": f"Unknown message type: {msg_type}"})

    except WebSocketDisconnect:
        pass
    except Exception as exc:  # noqa: BLE001
        logger.error(f"voice websocket error: {exc}")
        try:
            await websocket.send_json({"type": "error", "message": str(exc)})
        except Exception:  # noqa: BLE001
            pass
