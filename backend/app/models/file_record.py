from sqlalchemy import BigInteger, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class FileRecord(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Indexed metadata for files JARVIS has read/written/organized.

    The filesystem remains the source of truth for content; this table
    exists so the Files dashboard panel and search can list/query without
    doing a live directory walk on every request.
    """

    __tablename__ = "file_records"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    path: Mapped[str] = mapped_column(String(1024), index=True)
    name: Mapped[str] = mapped_column(String(255))
    extension: Mapped[str] = mapped_column(String(20), default="")
    size_bytes: Mapped[int] = mapped_column(BigInteger, default=0)
    category: Mapped[str] = mapped_column(String(50), default="other")  # document|image|video|audio|archive|code|other
