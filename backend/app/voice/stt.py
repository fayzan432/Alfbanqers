"""Speech-to-text via faster-whisper — free, runs fully offline/local on
CPU or GPU, no API key. Model weights download once on first use from
Hugging Face's public mirror, then are cached locally.
"""
from __future__ import annotations

from functools import lru_cache

from app.core.config import settings
from app.core.logging import logger


@lru_cache
def get_whisper_model():
    from faster_whisper import WhisperModel

    logger.info(f"Loading faster-whisper model '{settings.WHISPER_MODEL_SIZE}' on {settings.WHISPER_DEVICE}...")
    compute_type = "int8" if settings.WHISPER_DEVICE == "cpu" else "float16"
    return WhisperModel(settings.WHISPER_MODEL_SIZE, device=settings.WHISPER_DEVICE, compute_type=compute_type)


def transcribe_file(path: str, language: str | None = "en") -> dict:
    model = get_whisper_model()
    segments, info = model.transcribe(path, language=language, vad_filter=True)
    text = " ".join(segment.text.strip() for segment in segments)
    return {"text": text.strip(), "language": info.language, "duration": info.duration}
