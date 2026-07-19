"""Text-to-speech. Both supported engines are free with no API key:

- edge-tts: high-quality neural voices via Microsoft Edge's free public
  read-aloud service (network call, no auth, no cost).
- pyttsx3: fully offline, uses the OS's built-in TTS engine (SAPI5 on
  Windows, NSSpeechSynthesizer on macOS, espeak on Linux).
"""
from __future__ import annotations

import asyncio
import time
from pathlib import Path

from app.core.config import settings

TTS_CACHE_DIR = Path("./data/tts_cache")


async def synthesize_speech(text: str, voice: str | None = None) -> str:
    """Returns the path to a generated audio file for the given text."""
    TTS_CACHE_DIR.mkdir(parents=True, exist_ok=True)
    voice = voice or settings.TTS_VOICE

    if settings.TTS_ENGINE == "pyttsx3":
        return await asyncio.to_thread(_synthesize_pyttsx3, text)
    return await _synthesize_edge_tts(text, voice)


async def _synthesize_edge_tts(text: str, voice: str) -> str:
    import edge_tts

    output_path = TTS_CACHE_DIR / f"tts_{int(time.time() * 1000)}.mp3"
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(str(output_path))
    return str(output_path)


def _synthesize_pyttsx3(text: str) -> str:
    import pyttsx3

    output_path = TTS_CACHE_DIR / f"tts_{int(time.time() * 1000)}.wav"
    engine = pyttsx3.init()
    engine.save_to_file(text, str(output_path))
    engine.runAndWait()
    return str(output_path)
