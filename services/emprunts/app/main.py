from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.db import bootstrap_schema
from app.routers import health, loans

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    bootstrap_schema()
    yield


app = FastAPI(title="Service emprunts", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health.router)
app.include_router(loans.router)
