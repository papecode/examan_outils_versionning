from pydantic import BaseModel


class BookRead(BaseModel):
    id: int
    titre: str
    auteur: str
    categorie: str
    isbn: str | None = None
