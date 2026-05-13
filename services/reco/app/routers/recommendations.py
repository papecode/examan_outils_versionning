from fastapi import APIRouter, HTTPException, status

from app.schemas import BookRead
from app.services import fetch_books_by_ids, load_model, recommend_book_ids

router = APIRouter(tags=["recommendations"])


@router.get("/recommendations/{user_id}", response_model=list[BookRead])
async def get_recommendations(user_id: int) -> list[BookRead]:
    model = load_model()
    if model is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Modele de recommandation indisponible",
        )
    book_ids = recommend_book_ids(model, user_id)
    if not book_ids:
        return []
    return await fetch_books_by_ids(book_ids)


@router.post("/train")
def train_model() -> None:
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Pipeline ML non configure. Utiliser le pipeline DVC hors service reco.",
    )
