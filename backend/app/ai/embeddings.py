"""Ollama embedding client for local RAG."""

from __future__ import annotations

import os

import httpx

from app.ai.inference import InferenceError, OLLAMA_HOST

OLLAMA_EMBED_MODEL = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")
EMBED_TIMEOUT = float(os.getenv("OLLAMA_EMBED_TIMEOUT_SECONDS", "120"))


async def embed_text(text: str) -> list[float]:
    """Return a single embedding vector from Ollama."""
    vectors = await embed_texts([text])
    return vectors[0]


async def embed_texts(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []

    url = f"{OLLAMA_HOST}/api/embeddings"
    vectors: list[list[float]] = []

    async with httpx.AsyncClient(timeout=EMBED_TIMEOUT) as client:
        for text in texts:
            payload = {"model": OLLAMA_EMBED_MODEL, "prompt": text}
            try:
                res = await client.post(url, json=payload)
            except httpx.ConnectError as e:
                raise InferenceError(
                    f"Cannot reach Ollama at {OLLAMA_HOST}. Run `ollama serve` and "
                    f"`ollama pull {OLLAMA_EMBED_MODEL}`."
                ) from e

            if res.status_code != 200:
                raise InferenceError(
                    f"Ollama embeddings returned {res.status_code}: {res.text[:300]}"
                )

            data = res.json()
            embedding = data.get("embedding")
            if not embedding:
                raise InferenceError("Ollama returned an empty embedding vector.")
            vectors.append(embedding)

    return vectors
