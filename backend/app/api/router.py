from fastapi import APIRouter

from app.api.endpoints import auth, calendar, chat, email, files, memory, notes, plugins, settings, system, tasks, vision, voice

api_router = APIRouter(prefix="/api")
api_router.include_router(auth.router)
api_router.include_router(chat.router)
api_router.include_router(memory.router)
api_router.include_router(tasks.router)
api_router.include_router(calendar.router)
api_router.include_router(notes.router)
api_router.include_router(files.router)
api_router.include_router(system.router)
api_router.include_router(vision.router)
api_router.include_router(voice.router)
api_router.include_router(plugins.router)
api_router.include_router(email.router)
api_router.include_router(settings.router)
