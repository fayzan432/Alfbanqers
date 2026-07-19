"""Chroma-backed vector store for JARVIS's memory.

A single persistent Chroma collection holds every user's memories; each
vector is tagged with a ``user_id`` metadata field and every query filters
on it, so this stays correct in a multi-user deployment without needing a
collection-per-user.
"""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any

from app.core.config import settings
from app.memory.embeddings import get_embedder

COLLECTION_NAME = "jarvis_memory"


@lru_cache
def get_chroma_collection():
    import chromadb

    persist_dir = Path(settings.CHROMA_PERSIST_DIR)
    persist_dir.mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(path=str(persist_dir))
    return client.get_or_create_collection(name=COLLECTION_NAME, metadata={"hnsw:space": "cosine"})


def upsert_memory(vector_id: str, content: str, metadata: dict[str, Any]) -> None:
    collection = get_chroma_collection()
    embedding = get_embedder().embed([content])[0]
    collection.upsert(ids=[vector_id], embeddings=[embedding], documents=[content], metadatas=[metadata])


def delete_memory(vector_id: str) -> None:
    collection = get_chroma_collection()
    collection.delete(ids=[vector_id])


def query_memories(query: str, user_id: str, top_k: int = 5, kind: str | None = None) -> list[dict[str, Any]]:
    collection = get_chroma_collection()
    embedding = get_embedder().embed([query])[0]

    where: dict[str, Any] = {"user_id": user_id}
    if kind:
        where = {"$and": [{"user_id": user_id}, {"kind": kind}]}

    if collection.count() == 0:
        return []

    result = collection.query(query_embeddings=[embedding], n_results=min(top_k, collection.count()), where=where)

    hits: list[dict[str, Any]] = []
    ids = result.get("ids", [[]])[0]
    documents = result.get("documents", [[]])[0]
    metadatas = result.get("metadatas", [[]])[0]
    distances = result.get("distances", [[]])[0]
    for i, doc_id in enumerate(ids):
        hits.append(
            {
                "id": doc_id,
                "content": documents[i],
                "metadata": metadatas[i],
                "distance": distances[i],
            }
        )
    return hits
