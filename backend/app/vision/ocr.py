"""Optical character recognition via Tesseract (free, open source, offline).

Requires the `tesseract-ocr` system binary to be installed (apt install
tesseract-ocr / brew install tesseract) — pytesseract is just a wrapper.
"""
from __future__ import annotations

import pytesseract
from PIL import Image

from app.core.config import settings


def extract_text(image_path: str) -> str:
    image = Image.open(image_path)
    return pytesseract.image_to_string(image, lang=settings.OCR_LANGUAGE)
