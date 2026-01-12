from fastapi import APIRouter

from app.api.v1 import callback, sessions

api_v1_router = APIRouter()

api_v1_router.include_router(sessions.router)
api_v1_router.include_router(callback.router)
