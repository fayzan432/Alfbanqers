from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CalendarEventCreate(BaseModel):
    title: str
    description: str = ""
    location: str = ""
    start_time: datetime
    end_time: datetime
    event_type: str = "meeting"
    recurrence: str = "none"
    recurrence_end: datetime | None = None
    reminder_minutes_before: int = 10


class CalendarEventUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    location: str | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    event_type: str | None = None
    recurrence: str | None = None
    recurrence_end: datetime | None = None
    reminder_minutes_before: int | None = None


class CalendarEventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: str
    location: str
    start_time: datetime
    end_time: datetime
    event_type: str
    recurrence: str
    recurrence_end: datetime | None
    reminder_minutes_before: int
