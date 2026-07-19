from fastapi import APIRouter, HTTPException
from sqlalchemy import or_, select

from app.api.deps import CurrentUser, DbSession
from app.models.note import Note
from app.schemas.note import NoteCreate, NoteRead, NoteUpdate

router = APIRouter(prefix="/notes", tags=["notes"])


@router.get("", response_model=list[NoteRead])
async def list_notes(current_user: CurrentUser, db: DbSession, q: str | None = None, folder: str | None = None) -> list[Note]:
    query = select(Note).where(Note.user_id == current_user.id)
    if folder:
        query = query.where(Note.folder == folder)
    if q:
        like = f"%{q}%"
        query = query.where(or_(Note.title.ilike(like), Note.content_markdown.ilike(like)))
    query = query.order_by(Note.pinned.desc(), Note.updated_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


@router.post("", response_model=NoteRead, status_code=201)
async def create_note(payload: NoteCreate, current_user: CurrentUser, db: DbSession) -> Note:
    note = Note(user_id=current_user.id, **payload.model_dump())
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note


@router.patch("/{note_id}", response_model=NoteRead)
async def update_note(note_id: str, payload: NoteUpdate, current_user: CurrentUser, db: DbSession) -> Note:
    result = await db.execute(select(Note).where(Note.id == note_id, Note.user_id == current_user.id))
    note = result.scalar_one_or_none()
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(note, key, value)
    await db.commit()
    await db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=204)
async def delete_note(note_id: str, current_user: CurrentUser, db: DbSession) -> None:
    result = await db.execute(select(Note).where(Note.id == note_id, Note.user_id == current_user.id))
    note = result.scalar_one_or_none()
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    await db.delete(note)
    await db.commit()


@router.post("/{note_id}/summarize", response_model=NoteRead)
async def summarize_note(note_id: str, current_user: CurrentUser, db: DbSession) -> Note:
    result = await db.execute(select(Note).where(Note.id == note_id, Note.user_id == current_user.id))
    note = result.scalar_one_or_none()
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")

    from app.ai.base import AIMessage
    from app.ai.factory import get_ai_provider

    provider = get_ai_provider()
    prompt = (
        "Summarize the following note in 2-3 concise sentences, preserving key facts:\n\n"
        f"{note.content_markdown}"
    )
    completion = await provider.complete([AIMessage(role="user", content=prompt)])
    note.ai_summary = completion.content.strip()
    await db.commit()
    await db.refresh(note)
    return note
