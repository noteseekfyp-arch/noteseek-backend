"""Self-hosted LLM inference via Ollama HTTP API (no third-party cloud AI)."""

from __future__ import annotations

import json
import os
import re
from typing import Any

import httpx

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://127.0.0.1:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:4b")
OLLAMA_TIMEOUT = float(os.getenv("OLLAMA_TIMEOUT_SECONDS", "900"))


class InferenceError(Exception):
    pass


async def _chat(system: str, user: str, *, json_mode: bool) -> str:
    url = f"{OLLAMA_HOST}/api/chat"
    payload: dict[str, Any] = {
        "model": OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "stream": False,
        "options": {
            "temperature": 0.2,
            "num_predict": 4096,
        },
    }
    if json_mode:
        payload["format"] = "json"

    async with httpx.AsyncClient(timeout=OLLAMA_TIMEOUT) as client:
        res = await client.post(url, json=payload)

    if res.status_code != 200:
        raise InferenceError(f"Ollama returned {res.status_code}: {res.text[:500]}")

    data = res.json()
    message = data.get("message") or {}
    content = message.get("content")
    if not content:
        raise InferenceError("Ollama returned an empty response.")
    return content


async def complete(system: str, user: str) -> str:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            ping = await client.get(f"{OLLAMA_HOST}/api/tags")
        if ping.status_code != 200:
            raise InferenceError(f"Ollama is not reachable at {OLLAMA_HOST}.")
    except httpx.ConnectError as e:
        raise InferenceError(
            f"Cannot reach Ollama at {OLLAMA_HOST}. Run `ollama serve` and ensure "
            f"model `{OLLAMA_MODEL}` is pulled (`ollama pull {OLLAMA_MODEL}`)."
        ) from e

    try:
        return await _chat(system, user, json_mode=True)
    except InferenceError:
        return await _chat(system, user, json_mode=False)


def parse_json_response(raw: str) -> dict[str, Any]:
    text = raw.strip()
    fence = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if fence:
        text = fence.group(1).strip()

    if not text.startswith("{"):
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end > start:
            text = text[start : end + 1]

    try:
        parsed = json.loads(text)
    except json.JSONDecodeError as e:
        raise InferenceError(
            "Model output was not valid JSON. Try a shorter PDF or add focus instructions."
        ) from e
    if not isinstance(parsed, dict):
        raise InferenceError("Model JSON must be an object.")
    return parsed
