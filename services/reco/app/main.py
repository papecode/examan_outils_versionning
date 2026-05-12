from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import Config
from app.routes import recommendations, train
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Service Recommandation",
    description="Système de recommandation de livres",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    import os
    model_exists = os.path.exists(Config.MODEL_PATH)
    return {
        "status": "healthy",
        "model_loaded": model_exists,
        "model_path": Config.MODEL_PATH
    }

app.include_router(recommendations.router, prefix="/api/v1", tags=["recommendations"])
app.include_router(train.router, prefix="/api/v1", tags=["train"])

@app.on_event("startup")
async def startup_event():
    logger.info(f"Service Recommandation démarré")
    logger.info(f"MODEL_PATH: {Config.MODEL_PATH}")
    logger.info(f"BOOKS_SERVICE_URL: {Config.BOOKS_SERVICE_URL}")
