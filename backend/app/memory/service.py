"""High-level memory operations used by both the REST API and the agent's tools."""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import logger
from app.db.base import new_uuid
from app.memory.store import delete_memory as vector_delete
from app.memory.store import query_memories, upsert_memory
from app.models.memory import MemoryRecord
from app.models.user import User


async def add_memory(
    db: AsyncSession, user: User, content: str, kind: str = "long_term", source: str = "conversation", importance: int = 1
) -> MemoryRecord:
    vector_id = new_uuid()
    record = MemoryRecord(user_id=user.id, kind=kind, content=content, source=source, importance=importance, vector_id=vector_id)
    db.add(record)
    await db.flush()

    try:
        upsert_memory(vector_id, content, {"user_id": user.id, "kind": kind, "record_id": record.id})
    except Exception as exc:  # noqa: BLE001
        logger.error(f"Failed to write memory embedding, keeping relational row only: {exc}")

    return record


async def list_memories(db: AsyncSession, user: User, kind: str | None = None) -> list[MemoryRecord]:
    query = select(MemoryRecord).where(MemoryRecord.user_id == user.id)
    if kind:
        query = query.where(MemoryRecord.kind == kind)
    query = query.order_by(MemoryRecord.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


async def delete_memory_record(db: AsyncSession, user: User, memory_id: str) -> bool:
    result = await db.execute(select(MemoryRecord).where(MemoryRecord.id == memory_id, MemoryRecord.user_id == user.id))
    record = result.scalar_one_or_none()
    if record is None:
        return False

    try:
        vector_delete(record.vector_id)
    except Exception as exc:  # noqa: BLE001
        logger.warning(f"Failed to delete memory embedding: {exc}")

    await db.delete(record)
    return True


async def search_relevant_memories(db: AsyncSession, user: User, query: str, top_k: int = 5, kind: str | None = None) -> list[str]:
    if not query.strip():
        return []
    try:
        hits = query_memories(query, user_id=user.id, top_k=top_k, kind=kind)
    except Exception as exc:  # noqa: BLE001
        logger.warning(f"Semantic memory search unavailable, skipping: {exc}")
        return []
    return [h["content"] for h in hits]
