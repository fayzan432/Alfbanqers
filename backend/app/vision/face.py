"""Face recognition using OpenCV's LBPH recognizer — free, offline, no
external model download. Gated behind explicit user consent
(FACE_RECOGNITION_CONSENT) since it processes biometric data.
"""
from __future__ import annotations

import json
from pathlib import Path

import cv2
import numpy as np

from app.core.config import settings
from app.vision.detection import _get_cascade

FACES_DIR = Path("./data/faces")
MODEL_PATH = FACES_DIR / "lbph_model.yml"
LABELS_PATH = FACES_DIR / "labels.json"


class ConsentRequiredError(PermissionError):
    pass


def _require_consent() -> None:
    if not settings.FACE_RECOGNITION_CONSENT:
        raise ConsentRequiredError(
            "Face recognition requires explicit consent. Enable 'Face recognition consent' in Settings first."
        )


def _load_labels() -> dict[str, int]:
    if LABELS_PATH.exists():
        return json.loads(LABELS_PATH.read_text())
    return {}


def _save_labels(labels: dict[str, int]) -> None:
    FACES_DIR.mkdir(parents=True, exist_ok=True)
    LABELS_PATH.write_text(json.dumps(labels))


def _face_crop(image_path: str) -> np.ndarray | None:
    image = cv2.imread(image_path)
    if image is None:
        return None
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    cascade = _get_cascade("face")
    faces = cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    if len(faces) == 0:
        return None
    x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
    return cv2.resize(gray[y : y + h, x : x + w], (200, 200))


def enroll_face(person_name: str, image_paths: list[str]) -> dict:
    _require_consent()
    person_dir = FACES_DIR / person_name
    person_dir.mkdir(parents=True, exist_ok=True)

    saved = 0
    for i, path in enumerate(image_paths):
        crop = _face_crop(path)
        if crop is None:
            continue
        cv2.imwrite(str(person_dir / f"sample_{i}.jpg"), crop)
        saved += 1

    if saved == 0:
        return {"enrolled": False, "reason": "No detectable face found in the provided images."}

    train_recognizer()
    return {"enrolled": True, "person": person_name, "samples_saved": saved}


def train_recognizer() -> dict:
    _require_consent()
    labels: dict[str, int] = {}
    images: list[np.ndarray] = []
    label_ids: list[int] = []

    for idx, person_dir in enumerate(sorted(p for p in FACES_DIR.iterdir() if p.is_dir())):
        labels[person_dir.name] = idx
        for sample in person_dir.glob("*.jpg"):
            img = cv2.imread(str(sample), cv2.IMREAD_GRAYSCALE)
            if img is not None:
                images.append(img)
                label_ids.append(idx)

    if not images:
        return {"trained": False, "reason": "No enrolled faces yet."}

    recognizer = cv2.face.LBPHFaceRecognizer_create()
    recognizer.train(images, np.array(label_ids))
    FACES_DIR.mkdir(parents=True, exist_ok=True)
    recognizer.write(str(MODEL_PATH))
    _save_labels(labels)
    return {"trained": True, "people": list(labels.keys())}


def recognize_faces(image_path: str, confidence_threshold: float = 80.0) -> list[dict]:
    _require_consent()
    if not MODEL_PATH.exists():
        return []

    labels = _load_labels()
    id_to_name = {v: k for k, v in labels.items()}

    recognizer = cv2.face.LBPHFaceRecognizer_create()
    recognizer.read(str(MODEL_PATH))

    image = cv2.imread(image_path)
    if image is None:
        raise FileNotFoundError(f"Could not read image: {image_path}")
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    cascade = _get_cascade("face")
    faces = cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

    results = []
    for (x, y, w, h) in faces:
        crop = cv2.resize(gray[y : y + h, x : x + w], (200, 200))
        label_id, distance = recognizer.predict(crop)
        # LBPH: lower distance = more confident. Convert to a 0-100 confidence score.
        confidence = max(0.0, 100.0 - distance)
        name = id_to_name.get(label_id, "unknown") if confidence >= (100 - confidence_threshold) else "unknown"
        results.append({"person": name, "confidence": round(confidence, 1), "box": {"x": int(x), "y": int(y), "width": int(w), "height": int(h)}})
    return results
