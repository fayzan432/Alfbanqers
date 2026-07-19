from pydantic import BaseModel


class FileEntry(BaseModel):
    name: str
    path: str
    is_dir: bool
    size_bytes: int
    extension: str = ""
    category: str = "other"
    modified_at: float


class FileActionRequest(BaseModel):
    path: str
    destination: str | None = None


class FileSearchRequest(BaseModel):
    root: str
    query: str
    max_results: int = 100
