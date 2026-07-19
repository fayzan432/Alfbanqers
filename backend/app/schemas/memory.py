from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MemoryCreate(BaseModel):
    kind: str = "long_term"
    content: str
    source: str = "manual"
    importance: int = 1


class MemoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    kind: str
    content: str
    source: str
    importance: int
    created_at: datetime


class MemorySearchRequest(BaseModel):
    query: str
    top_k: int = 5
    kind: str | None = None
