from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class EmailAccount(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Stores IMAP/SMTP connection details for a linked mailbox.

    The password/app-token is encrypted at rest using Fernet (see
    app.services.crypto) — never stored or logged in plaintext.
    """

    __tablename__ = "email_accounts"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    email_address: Mapped[str] = mapped_column(String(255))
    imap_host: Mapped[str] = mapped_column(String(255))
    imap_port: Mapped[int] = mapped_column(Integer, default=993)
    smtp_host: Mapped[str] = mapped_column(String(255))
    smtp_port: Mapped[int] = mapped_column(Integer, default=587)
    encrypted_credential: Mapped[str] = mapped_column(String(1024))
