from datetime import datetime

from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.models.calendar import CalendarEvent
from app.schemas.calendar import CalendarEventCreate, CalendarEventRead, CalendarEventUpdate

router = APIRouter(prefix="/calendar", tags=["calendar"])


@router.get("", response_model=list[CalendarEventRead])
async def list_events(
    current_user: CurrentUser, db: DbSession, start: datetime | None = None, end: datetime | None = None
) -> list[CalendarEvent]:
    query = select(CalendarEvent).where(CalendarEvent.user_id == current_user.id)
    if start:
        query = query.where(CalendarEvent.end_time >= start)
    if end:
        query = query.where(CalendarEvent.start_time <= end)
    query = query.order_by(CalendarEvent.start_time.asc())
    result = await db.execute(query)
    return list(result.scalars().all())


@router.post("", response_model=CalendarEventRead, status_code=201)
async def create_event(payload: CalendarEventCreate, current_user: CurrentUser, db: DbSession) -> CalendarEvent:
    event = CalendarEvent(user_id=current_user.id, **payload.model_dump())
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event


@router.patch("/{event_id}", response_model=CalendarEventRead)
async def update_event(event_id: str, payload: CalendarEventUpdate, current_user: CurrentUser, db: DbSession) -> CalendarEvent:
    result = await db.execute(select(CalendarEvent).where(CalendarEvent.id == event_id, CalendarEvent.user_id == current_user.id))
    event = result.scalar_one_or_none()
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(event, key, value)
    await db.commit()
    await db.refresh(event)
    return event


@router.delete("/{event_id}", status_code=204)
async def delete_event(event_id: str, current_user: CurrentUser, db: DbSession) -> None:
    result = await db.execute(select(CalendarEvent).where(CalendarEvent.id == event_id, CalendarEvent.user_id == current_user.id))
    event = result.scalar_one_or_none()
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    await db.delete(event)
    await db.commit()
