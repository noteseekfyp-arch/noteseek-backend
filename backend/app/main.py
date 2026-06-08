from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.api import api_router

load_dotenv()

app = FastAPI(title="NoteSeek API")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|\[::1\])(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# All versioned REST routes (auth, users, notes, courses, …) live under /api.
# Keep /health at the root for simple load-balancer probes.
app.include_router(api_router, prefix="/api")

@app.get("/health")
def health():
    return {"status": "ok"}