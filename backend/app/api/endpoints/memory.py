from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, DbSession
from app.memory.service import add_memory, delete_memory_record, list_memories, search_relevant_memories
from app.schemas.memory import MemoryCreate, MemoryRead, MemorySearchRequest

router = APIRouter(prefix="/memory", tags=["memory"])


@router.get("", response_model=list[MemoryRead])
async def get_memories(current_user: CurrentUser, db: DbSession, kind: str | None = None) -> list:
    return await list_memories(db, current_user, kind=kind)


@router.post("", response_model=MemoryRead, status_code=201)
async def create_memory(payload: MemoryCreate, current_user: CurrentUser, db: DbSession):
    record = await add_memory(
        db, current_user, payload.content, kind=payload.kind, source=payload.source, importance=payload.importance
    )
    await db.commit()
    await db.refresh(record)
    return record


@router.post("/search")
async def search_memory(payload: MemorySearchRequest, current_user: CurrentUser, db: DbSession) -> dict:
    results = await search_relevant_memories(db, current_user, payload.query, top_k=payload.top_k, kind=payload.kind)
    return {"results": results}


@router.delete("/{memory_id}", status_code=204)
async def delete_memory(memory_id: str, current_user: CurrentUser, db: DbSession) -> None:
    deleted = await delete_memory_record(db, current_user, memory_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Memory not found")
    await db.commit()
