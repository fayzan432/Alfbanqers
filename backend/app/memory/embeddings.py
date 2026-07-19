"""Text embedding backend for the memory vector store.

Defaults to a local sentence-transformers model (free, runs on CPU, no
network calls after the first download) so semantic memory works with zero
API cost. If EMBEDDING_PROVIDER=openai and OPENAI_API_KEY is set, OpenAI's
embeddings endpoint is used instead — entirely optional.
"""
from __future__ import annotations

from functools import lru_cache

from app.core.config import settings
from app.core.logging import logger


class LocalEmbedder:
    def __init__(self, model_name: str) -> None:
        from sentence_transformers import SentenceTransformer

        logger.info(f"Loading local embedding model '{model_name}' (first run downloads it once)...")
        self._model = SentenceTransformer(model_name)

    def embed(self, texts: list[str]) -> list[list[float]]:
        vectors = self._model.encode(texts, normalize_embeddings=True)
        return [v.tolist() for v in vectors]


class OpenAIEmbedder:
    def __init__(self, model_name: str) -> None:
        from openai import OpenAI

        self._client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self._model = model_name

    def embed(self, texts: list[str]) -> list[list[float]]:
        response = self._client.embeddings.create(model=self._model, input=texts)
        return [item.embedding for item in response.data]


@lru_cache
def get_embedder():
    if settings.EMBEDDING_PROVIDER == "openai" and settings.OPENAI_API_KEY:
        return OpenAIEmbedder(settings.OPENAI_EMBEDDING_MODEL)
    return LocalEmbedder(settings.LOCAL_EMBEDDING_MODEL)
