"""Object/face-region detection using OpenCV's built-in Haar cascades.

These cascades ship with opencv-contrib-python — no model download, no
API key, fully offline. This gives real face/eye/body detection out of the
box; a heavier DNN detector (YOLO, MobileNet-SSD) can be dropped in later
by adding a new function here without touching callers.
"""
from __future__ import annotations

import cv2

_CASCADES = {
    "face": cv2.data.haarcascades + "haarcascade_frontalface_default.xml",
    "eye": cv2.data.haarcascades + "haarcascade_eye.xml",
    "body": cv2.data.haarcascades + "haarcascade_fullbody.xml",
    "smile": cv2.data.haarcascades + "haarcascade_smile.xml",
}

_loaded_cascades: dict[str, cv2.CascadeClassifier] = {}


def _get_cascade(kind: str) -> cv2.CascadeClassifier:
    if kind not in _loaded_cascades:
        path = _CASCADES.get(kind)
        if path is None:
            raise ValueError(f"Unknown detector kind: {kind}")
        _loaded_cascades[kind] = cv2.CascadeClassifier(path)
    return _loaded_cascades[kind]


def detect_objects(image_path: str, kind: str = "face") -> list[dict]:
    cascade = _get_cascade(kind)
    image = cv2.imread(image_path)
    if image is None:
        raise FileNotFoundError(f"Could not read image: {image_path}")
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    detections = cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    return [{"x": int(x), "y": int(y), "width": int(w), "height": int(h)} for (x, y, w, h) in detections]
