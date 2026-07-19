"""JARVIS backend entrypoint: FastAPI app, startup wiring, router mounting."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.ai.tools import ensure_tools_loaded
from app.api.router import api_router
from app.core.config import settings
from app.core.logging import logger
from app.db.session import AsyncSessionLocal, init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting JARVIS backend (environment={settings.ENVIRONMENT}, ai_provider={settings.AI_PROVIDER})")
    await init_db()
    ensure_tools_loaded()

    from app.plugins.loader import load_all_plugins

    async with AsyncSessionLocal() as db:
        manifests = await load_all_plugins(db)
    logger.info(f"Discovered {len(manifests)} plugin(s)")

    yield
    logger.info("Shutting down JARVIS backend")


app = FastAPI(title="JARVIS", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "ai_provider": settings.AI_PROVIDER}
