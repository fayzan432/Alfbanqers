from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class MemoryRecord(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Relational mirror of a memory whose embedding lives in the vector store.

    The vector store (Chroma) is the source of truth for semantic search;
    this table lets us list/filter/delete memories relationally and keep
    metadata (kind, importance, source) queryable without round-tripping
    through the vector DB.
    """

    __tablename__ = "memory_records"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    kind: Mapped[str] = mapped_column(String(30))  # short_term | long_term | semantic | fact | preference | project
    content: Mapped[str] = mapped_column(Text)
    source: Mapped[str] = mapped_column(String(50), default="conversation")
    importance: Mapped[int] = mapped_column(default=1)  # 1 (low) - 5 (critical)
    vector_id: Mapped[str] = mapped_column(String(64), index=True)
