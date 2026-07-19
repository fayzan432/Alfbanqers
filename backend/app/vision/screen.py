"""Screen capture and screen understanding (OCR + region description)."""
from __future__ import annotations

import time
from pathlib import Path

SCREENSHOT_DIR = Path("./data/screenshots")


def capture_screen(monitor_index: int = 1) -> str:
    import mss

    SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
    filename = SCREENSHOT_DIR / f"screen_{int(time.time())}.png"
    with mss.mss() as sct:
        monitor = sct.monitors[monitor_index] if monitor_index < len(sct.monitors) else sct.monitors[0]
        sct.shot(mon=monitor_index if monitor_index < len(sct.monitors) else 0, output=str(filename))
    return str(filename)


def read_screen_text() -> dict:
    """Captures the screen and runs OCR on it, returning both the image path
    and the extracted text."""
    from app.vision.ocr import extract_text

    path = capture_screen()
    text = extract_text(path)
    return {"screenshot": path, "text": text}
