from pydantic import BaseModel, ConfigDict, Field


class BookRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    titre: str
    auteur: str
    categorie: str
    isbn: str | None = None


class BookCreate(BaseModel):
    titre: str = Field(min_length=1, max_length=255)
    auteur: str = Field(min_length=1, max_length=255)
    categorie: str = Field(default="", max_length=255)
    isbn: str | None = Field(default=None, max_length=50)


class PaginatedBooks(BaseModel):
    items: list[BookRead]
    total: int
    page: int
    pageSize: int
