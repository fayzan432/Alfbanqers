from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession
from app.schemas.user import UserRead, UserSettingsUpdate

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=UserRead)
async def get_settings(current_user: CurrentUser) -> CurrentUser:
    return current_user


@router.patch("", response_model=UserRead)
async def update_settings(payload: UserSettingsUpdate, current_user: CurrentUser, db: DbSession) -> CurrentUser:
    merged = dict(current_user.settings or {})
    for key, value in payload.model_dump(exclude_unset=True).items():
        merged[key] = value
    current_user.settings = merged
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user
