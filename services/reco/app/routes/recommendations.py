from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
import logging
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.recommender import Recommender
from app.services.books_client import BooksServiceClient
from app.config import Config

router = APIRouter()
logger = logging.getLogger(__name__)

_recommender = None

def get_recommender():
    global _recommender
    if _recommender is None:
        _recommender = Recommender(Config.MODEL_PATH)
    return _recommender

def get_books_client():
    return BooksServiceClient()

@router.get("/recommendations/{user_id}", response_model=Dict[str, Any])
async def get_recommendations(
    user_id: int,
    top_n: int = 5,
    recommender: Recommender = Depends(get_recommender),
    books_client: BooksServiceClient = Depends(get_books_client)
):
    if not recommender.model:
        raise HTTPException(
            status_code=404,
            detail="Modele absent. Veuillez entraîner le modèle avec POST /api/v1/train"
        )
    
    try:
        recommended_book_ids = recommender.get_recommendations(user_id, top_n)
        books_details = await books_client.get_books_batch(recommended_book_ids)
        
        if not books_details and recommended_book_ids:
            logger.warning("Service livres indisponible")
            return {
                "user_id": user_id,
                "recommendations": [
                    {"book_id": book_id, "details_available": False}
                    for book_id in recommended_book_ids
                ],
                "note": "Details des livres non disponibles"
            }
        
        return {
            "user_id": user_id,
            "recommendations": books_details,
            "count": len(books_details)
        }
        
    except Exception as e:
        logger.error(f"Erreur: {e}")
        raise HTTPException(status_code=500, detail=str(e))
