"""Wake-word detection built on top of STT rather than a dedicated
keyword-spotting model — the frontend continuously streams short (~1.5s)
rolling audio chunks while idle; each chunk is transcribed and checked for
the configured wake word. This keeps the whole pipeline free/local (no
Porcupine license key, no extra model download) at the cost of a little
extra CPU load compared to a purpose-built KWS model.
"""
from __future__ import annotations

import re

from app.core.config import settings


def normalize(text: str) -> str:
    return re.sub(r"[^a-z0-9\s]", "", text.lower()).strip()


def contains_wake_word(transcript: str, wake_word: str | None = None) -> bool:
    target = normalize(wake_word or settings.WAKE_WORD)
    return target in normalize(transcript)


def strip_wake_word(transcript: str, wake_word: str | None = None) -> str:
    """Removes the wake word from the start of a transcript, so 'jarvis
    what's the weather' becomes "what's the weather"."""
    target = normalize(wake_word or settings.WAKE_WORD)
    normalized = normalize(transcript)
    if normalized.startswith(target):
        remainder = normalized[len(target) :].strip()
        # Fall back to normalized text; good enough for command routing,
        # exact casing isn't required since this is just intent text.
        return remainder
    return transcript.strip()
