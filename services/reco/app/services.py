import pickle
from pathlib import Path

import httpx

from app.config import get_settings
from app.schemas import BookRead

settings = get_settings()


def load_model():
    path = Path(settings.model_path)
    if not path.exists():
        return None
    try:
        with path.open("rb") as handle:
            return pickle.load(handle)
    except (OSError, pickle.UnpicklingError, ModuleNotFoundError, AttributeError):
        return None


async def fetch_books_by_ids(book_ids: list[int]) -> list[BookRead]:
    books: list[BookRead] = []
    async with httpx.AsyncClient(base_url=settings.books_service_url, timeout=10.0) as client:
        response = await client.get("/books", params={"page": 1, "pageSize": 500})
        response.raise_for_status()
        payload = response.json()
        items = payload.get("items", payload)
        catalog = {item["id"]: item for item in items}
        for book_id in book_ids:
            item = catalog.get(int(book_id))
            if item is not None:
                books.append(BookRead.model_validate(item))
    return books


def recommend_book_ids(model, user_id: int) -> list[int]:
    if isinstance(model, dict):
        if user_id in model:
            return [int(item) for item in model[user_id]]
        user_key = str(user_id)
        if user_key in model:
            return [int(item) for item in model[user_key]]
        return [int(item) for item in model.get("default", [])]
    if hasattr(model, "predict"):
        prediction = model.predict([user_id])
        if isinstance(prediction, list):
            return [int(item) for item in prediction]
        return [int(prediction)]
    return []
