from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.db import SessionLocal, bootstrap_schema
from app.routers import auth, health, users
from app.seed import seed_users

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    bootstrap_schema()
    with SessionLocal() as db:
        seed_users(db)
    yield


app = FastAPI(title="Service utilisateurs", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(users.router)
