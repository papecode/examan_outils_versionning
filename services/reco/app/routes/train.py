from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, Any
import logging
from app.config import Config

router = APIRouter()
logger = logging.getLogger(__name__)

training_status = {
    "is_training": False,
    "last_training": None,
    "error": None
}

@router.post("/train", response_model=Dict[str, Any])
async def trigger_training(background_tasks: BackgroundTasks):
    if training_status["is_training"]:
        raise HTTPException(409, detail="Entraînement déjà en cours")
    
    return {
        "message": "Fonctionnalité non implémentée - Documentation disponible",
        "documentation": "/api/v1/train/documentation",
        "note": "Le ré-entraînement complet sera disponible avec DVC pipeline"
    }

@router.get("/train/documentation")
async def training_documentation():
    return {
        "description": "Le ré-entraînement utilisera DVC (Data Version Control)",
        "pipeline_steps": [
            "1. preprocess.py - Nettoie les données d'emprunts",
            "2. train.py - Entraîne le modèle SVD/KNN",
            "3. evaluate.py - Calcule les métriques RMSE/MAE"
        ],
        "command": "dvc repro",
        "data_source": "Export depuis PostgreSQL vers loans.csv",
        "output_model": Config.MODEL_PATH
    }
