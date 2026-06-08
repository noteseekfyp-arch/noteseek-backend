from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

import httpx
from pydantic import ValidationError

from app.ai import service
from app.ai.inference import InferenceError, OLLAMA_HOST, OLLAMA_MODEL
from app.ai.schemas import GenerateRequest, GenerateResponse, GenerationType
from app.core.dependencies import require_role
from app.db.session import get_async_session
from app.models.user import User

router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/status")
async def ai_status(
    user: User = Depends(require_role("student", "teacher", "admin")),
):
    del user
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.get(f"{OLLAMA_HOST}/api/tags")
        if res.status_code != 200:
            return {"ok": False, "host": OLLAMA_HOST, "model": OLLAMA_MODEL}
        names = [m.get("name", "") for m in res.json().get("models") or []]
        has_model = any(OLLAMA_MODEL.split(":")[0] in n for n in names)
        return {"ok": True, "host": OLLAMA_HOST, "model": OLLAMA_MODEL, "model_available": has_model, "models": names}
    except Exception as e:
        return {"ok": False, "host": OLLAMA_HOST, "model": OLLAMA_MODEL, "detail": str(e)}


@router.post("/generate", response_model=GenerateResponse)
async def generate_content(
    data: GenerateRequest,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(require_role("student", "teacher", "admin")),
):
    try:
        note = await service.generate_and_save(session, user, data)
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e)) from e
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    except InferenceError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e)) from e

    return GenerateResponse(
        id=note.id,
        title=note.title,
        type=GenerationType(note.kind or data.type.value),
        content=note.content,
    )
