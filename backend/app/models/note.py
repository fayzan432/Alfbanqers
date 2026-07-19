from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Note(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "notes"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255), default="Untitled")
    content_markdown: Mapped[str] = mapped_column(Text, default="")
    folder: Mapped[str] = mapped_column(String(255), default="")
    tags: Mapped[list] = mapped_column(default=list)
    ai_summary: Mapped[str] = mapped_column(Text, default="")
    pinned: Mapped[bool] = mapped_column(default=False)

    user: Mapped["User"] = relationship(back_populates="notes")
