import asyncio

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.api.deps import CurrentUser
from app.core.logging import logger
from app.schemas.settings import SystemStats
from app.services.system_monitor import get_system_stats

router = APIRouter(prefix="/system", tags=["system"])


@router.get("/stats", response_model=SystemStats)
async def stats(_: CurrentUser) -> dict:
    return get_system_stats()


@router.websocket("/ws")
async def system_stats_ws(websocket: WebSocket) -> None:
    """Streams live system stats every second. Auth token passed as a query
    param since browsers can't set headers on native WebSocket connections."""
    from app.core.security import decode_access_token

    token = websocket.query_params.get("token")
    payload = decode_access_token(token) if token else None
    if payload is None:
        await websocket.close(code=4401)
        return

    await websocket.accept()
    try:
        while True:
            await websocket.send_json(get_system_stats())
            await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        pass
    except Exception as exc:  # noqa: BLE001
        logger.error(f"system stats websocket error: {exc}")
