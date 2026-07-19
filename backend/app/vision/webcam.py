"""Webcam capture via OpenCV. Requires a physical/virtual camera device
accessible to the backend process."""
from __future__ import annotations

import time
from pathlib import Path

import cv2

WEBCAM_DIR = Path("./data/webcam")


class WebcamUnavailableError(RuntimeError):
    pass


def capture_frame(device_index: int = 0) -> str:
    cap = cv2.VideoCapture(device_index)
    if not cap.isOpened():
        raise WebcamUnavailableError(f"Could not open webcam device {device_index}")
    try:
        ok, frame = cap.read()
        if not ok:
            raise WebcamUnavailableError("Failed to read a frame from the webcam")
        WEBCAM_DIR.mkdir(parents=True, exist_ok=True)
        filename = WEBCAM_DIR / f"webcam_{int(time.time())}.jpg"
        cv2.imwrite(str(filename), frame)
        return str(filename)
    finally:
        cap.release()
