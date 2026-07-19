from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.models.plugin import PluginRecord
from app.plugins import loader
from app.schemas.plugin import PluginRead

router = APIRouter(prefix="/plugins", tags=["plugins"])


@router.get("", response_model=list[PluginRead])
async def list_plugins(_: CurrentUser, db: DbSession) -> list[dict]:
    result = await db.execute(select(PluginRecord))
    records = result.scalars().all()
    return [
        {
            "slug": r.slug,
            "name": r.name,
            "description": r.description,
            "version": r.version,
            "permissions": r.permissions,
            "entry_point": r.entry_point,
            "enabled": r.enabled,
        }
        for r in records
    ]


@router.patch("/{slug}/enabled", response_model=PluginRead)
async def set_plugin_enabled(slug: str, enabled: bool, current_user: CurrentUser, db: DbSession) -> dict:
    result = await db.execute(select(PluginRecord).where(PluginRecord.slug == slug))
    record = result.scalar_one_or_none()
    if record is None:
        raise HTTPException(status_code=404, detail="Plugin not found")

    record.enabled = enabled
    if enabled:
        try:
            loader.load_plugin(slug)
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(status_code=422, detail=f"Failed to load plugin: {exc}") from exc
    else:
        loader.unload_plugin(slug)

    await db.commit()
    await db.refresh(record)
    return {
        "slug": record.slug,
        "name": record.name,
        "description": record.description,
        "version": record.version,
        "permissions": record.permissions,
        "entry_point": record.entry_point,
        "enabled": record.enabled,
    }
