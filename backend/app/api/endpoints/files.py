from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser
from app.automation import files as file_ops
from app.core.permissions import permission_manager
from app.schemas.file import FileActionRequest, FileEntry, FileSearchRequest

router = APIRouter(prefix="/files", tags=["files"])


@router.get("/list", response_model=list[FileEntry])
async def list_directory(_: CurrentUser, path: str) -> list[dict]:
    try:
        return file_ops.list_directory(path)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/search", response_model=list[FileEntry])
async def search(payload: FileSearchRequest, _: CurrentUser) -> list[dict]:
    return file_ops.search_files(payload.root, payload.query, payload.max_results)


@router.post("/move", response_model=dict)
async def move(payload: FileActionRequest, _: CurrentUser) -> dict:
    if not payload.destination:
        raise HTTPException(status_code=422, detail="destination is required")
    new_path = file_ops.move_path(payload.path, payload.destination)
    return {"path": new_path}


@router.post("/copy", response_model=dict)
async def copy(payload: FileActionRequest, _: CurrentUser) -> dict:
    if not payload.destination:
        raise HTTPException(status_code=422, detail="destination is required")
    new_path = file_ops.copy_path(payload.path, payload.destination)
    return {"path": new_path}


@router.post("/folder", response_model=dict)
async def make_folder(payload: FileActionRequest, _: CurrentUser) -> dict:
    return {"path": file_ops.create_folder(payload.path)}


@router.post("/delete/request", response_model=dict)
async def request_delete(payload: FileActionRequest, current_user: CurrentUser) -> dict:
    """Deleting a file always requires confirmation. This creates the pending
    confirmation; call /files/delete/confirm with the returned token to
    actually delete."""
    pending = permission_manager.create_pending("delete_file", {"path": payload.path}, requested_by=current_user.id)
    return {"token": pending.token, "action": "delete_file", "path": payload.path}


@router.post("/delete/confirm", response_model=dict)
async def confirm_delete(token: str, current_user: CurrentUser) -> dict:
    pending = permission_manager.pop_pending(token, requested_by=current_user.id)
    if pending is None:
        raise HTTPException(status_code=410, detail="Confirmation expired or invalid")
    file_ops.delete_path(pending.payload["path"])
    return {"deleted": pending.payload["path"]}
