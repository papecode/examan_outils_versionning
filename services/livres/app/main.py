from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.db import SessionLocal, bootstrap_schema
from app.routers import books, health
from app.seed import seed_books

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    bootstrap_schema()
    with SessionLocal() as db:
        seed_books(db)
    yield


app = FastAPI(title="Service livres", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health.router)
app.include_router(books.router)
