from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class CalendarEvent(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "calendar_events"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    location: Mapped[str] = mapped_column(String(255), default="")
    start_time: Mapped[datetime] = mapped_column(DateTime)
    end_time: Mapped[datetime] = mapped_column(DateTime)
    event_type: Mapped[str] = mapped_column(String(20), default="meeting")  # meeting | reminder | task | custom
    # RFC5545-lite recurrence: none | daily | weekly | monthly | yearly
    recurrence: Mapped[str] = mapped_column(String(20), default="none")
    recurrence_end: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    reminder_minutes_before: Mapped[int] = mapped_column(default=10)

    user: Mapped["User"] = relationship(back_populates="events")
