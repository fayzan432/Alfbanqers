"""Real filesystem operations: read, write, move, copy, compress, extract,
search, categorize, and folder generation. Every function operates on the
actual OS filesystem the backend process runs in.
"""
from __future__ import annotations

import os
import shutil
import zipfile
from pathlib import Path

CATEGORY_BY_EXTENSION = {
    ".pdf": "document", ".doc": "document", ".docx": "document", ".txt": "document", ".md": "document",
    ".jpg": "image", ".jpeg": "image", ".png": "image", ".gif": "image", ".webp": "image", ".svg": "image",
    ".mp4": "video", ".mov": "video", ".avi": "video", ".mkv": "video",
    ".mp3": "audio", ".wav": "audio", ".flac": "audio", ".m4a": "audio",
    ".zip": "archive", ".tar": "archive", ".gz": "archive", ".rar": "archive", ".7z": "archive",
    ".py": "code", ".js": "code", ".ts": "code", ".tsx": "code", ".jsx": "code", ".go": "code", ".rs": "code",
    ".java": "code", ".c": "code", ".cpp": "code", ".json": "code", ".yaml": "code", ".yml": "code",
}


def categorize(path: str) -> str:
    return CATEGORY_BY_EXTENSION.get(Path(path).suffix.lower(), "other")


def list_directory(path: str) -> list[dict]:
    root = Path(path).expanduser().resolve()
    if not root.exists() or not root.is_dir():
        raise FileNotFoundError(f"Not a directory: {root}")
    entries = []
    for item in sorted(root.iterdir(), key=lambda p: (p.is_file(), p.name.lower())):
        stat = item.stat()
        entries.append(
            {
                "name": item.name,
                "path": str(item),
                "is_dir": item.is_dir(),
                "size_bytes": stat.st_size if item.is_file() else 0,
                "extension": item.suffix.lower(),
                "category": "folder" if item.is_dir() else categorize(str(item)),
                "modified_at": stat.st_mtime,
            }
        )
    return entries


def read_text_file(path: str, max_bytes: int = 200_000) -> str:
    p = Path(path).expanduser().resolve()
    if not p.is_file():
        raise FileNotFoundError(f"Not a file: {p}")
    with p.open("r", encoding="utf-8", errors="replace") as f:
        return f.read(max_bytes)


def write_text_file(path: str, content: str) -> str:
    p = Path(path).expanduser().resolve()
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding="utf-8")
    return str(p)


def move_path(source: str, destination: str) -> str:
    src, dst = Path(source).expanduser().resolve(), Path(destination).expanduser().resolve()
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(src), str(dst))
    return str(dst)


def copy_path(source: str, destination: str) -> str:
    src, dst = Path(source).expanduser().resolve(), Path(destination).expanduser().resolve()
    dst.parent.mkdir(parents=True, exist_ok=True)
    if src.is_dir():
        shutil.copytree(src, dst, dirs_exist_ok=True)
    else:
        shutil.copy2(src, dst)
    return str(dst)


def rename_path(source: str, new_name: str) -> str:
    src = Path(source).expanduser().resolve()
    dst = src.parent / new_name
    src.rename(dst)
    return str(dst)


def delete_path(path: str) -> None:
    """Actually deletes. Callers must gate this behind explicit confirmation."""
    p = Path(path).expanduser().resolve()
    if p.is_dir():
        shutil.rmtree(p)
    elif p.exists():
        p.unlink()
    else:
        raise FileNotFoundError(f"Path does not exist: {p}")


def compress_paths(paths: list[str], archive_path: str) -> str:
    archive = Path(archive_path).expanduser().resolve()
    archive.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as zf:
        for raw in paths:
            p = Path(raw).expanduser().resolve()
            if p.is_dir():
                for file in p.rglob("*"):
                    if file.is_file():
                        zf.write(file, arcname=str(file.relative_to(p.parent)))
            else:
                zf.write(p, arcname=p.name)
    return str(archive)


def extract_archive(archive_path: str, destination: str) -> str:
    archive = Path(archive_path).expanduser().resolve()
    dest = Path(destination).expanduser().resolve()
    dest.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(archive, "r") as zf:
        zf.extractall(dest)
    return str(dest)


def search_files(root: str, query: str, max_results: int = 100) -> list[dict]:
    base = Path(root).expanduser().resolve()
    query_lower = query.lower()
    results: list[dict] = []
    for dirpath, dirnames, filenames in os.walk(base):
        for name in filenames + dirnames:
            if query_lower in name.lower():
                full = Path(dirpath) / name
                try:
                    stat = full.stat()
                except OSError:
                    continue
                results.append(
                    {
                        "name": name,
                        "path": str(full),
                        "is_dir": full.is_dir(),
                        "size_bytes": stat.st_size if full.is_file() else 0,
                        "extension": full.suffix.lower(),
                        "category": "folder" if full.is_dir() else categorize(str(full)),
                        "modified_at": stat.st_mtime,
                    }
                )
                if len(results) >= max_results:
                    return results
    return results


def create_folder(path: str) -> str:
    p = Path(path).expanduser().resolve()
    p.mkdir(parents=True, exist_ok=True)
    return str(p)
