from pydantic import BaseModel, EmailStr


class EmailAccountLink(BaseModel):
    email_address: EmailStr
    app_password: str
    imap_host: str
    imap_port: int = 993
    smtp_host: str
    smtp_port: int = 587


class EmailAccountRead(BaseModel):
    id: str
    email_address: str
    imap_host: str
    smtp_host: str


class SendEmailRequest(BaseModel):
    account_id: str
    to: EmailStr
    subject: str
    body: str


class ConfirmSendRequest(BaseModel):
    token: str
    approve: bool
