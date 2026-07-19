from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser
from app.vision import detection, face, ocr, screen, webcam

router = APIRouter(prefix="/vision", tags=["vision"])


@router.post("/webcam/capture")
async def capture_webcam(_: CurrentUser, device_index: int = 0) -> dict:
    try:
        return {"path": webcam.capture_frame(device_index)}
    except webcam.WebcamUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/screen/capture")
async def capture_screen(_: CurrentUser) -> dict:
    return {"path": screen.capture_screen()}


@router.post("/screen/read")
async def read_screen(_: CurrentUser) -> dict:
    return screen.read_screen_text()


@router.post("/ocr")
async def ocr_image(_: CurrentUser, image_path: str) -> dict:
    return {"text": ocr.extract_text(image_path)}


@router.post("/detect")
async def detect(_: CurrentUser, image_path: str, kind: str = "face") -> dict:
    return {"detections": detection.detect_objects(image_path, kind)}


@router.post("/faces/enroll")
async def enroll_face(_: CurrentUser, person_name: str, image_paths: list[str]) -> dict:
    try:
        return face.enroll_face(person_name, image_paths)
    except face.ConsentRequiredError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc


@router.post("/faces/recognize")
async def recognize_faces(_: CurrentUser, image_path: str) -> dict:
    try:
        return {"faces": face.recognize_faces(image_path)}
    except face.ConsentRequiredError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
