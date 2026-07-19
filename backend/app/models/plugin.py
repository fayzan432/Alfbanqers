from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class PluginRecord(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "plugin_records"

    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    version: Mapped[str] = mapped_column(String(20), default="0.1.0")
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    permissions: Mapped[list] = mapped_column(default=list)
    entry_point: Mapped[str] = mapped_column(String(255))
