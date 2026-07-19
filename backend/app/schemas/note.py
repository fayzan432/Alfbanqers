from datetime import datetime

from pydantic import BaseModel, ConfigDict


class NoteCreate(BaseModel):
    title: str = "Untitled"
    content_markdown: str = ""
    folder: str = ""
    tags: list[str] = []
    pinned: bool = False


class NoteUpdate(BaseModel):
    title: str | None = None
    content_markdown: str | None = None
    folder: str | None = None
    tags: list[str] | None = None
    pinned: bool | None = None


class NoteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    content_markdown: str
    folder: str
    tags: list[str]
    ai_summary: str
    pinned: bool
    created_at: datetime
    updated_at: datetime
