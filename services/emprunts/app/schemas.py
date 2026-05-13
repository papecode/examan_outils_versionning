from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class LoanRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    book_id: int
    date_emprunt: datetime | None = None
    date_retour: datetime | None = None
    statut: str | None = None


class LoanCreate(BaseModel):
    user_id: int = Field(ge=1)
    book_id: int = Field(ge=1)


class LoanReturn(BaseModel):
    user_id: int = Field(ge=1)
    book_id: int = Field(ge=1)


class LoanCreateResponse(BaseModel):
    status: str
    loan: LoanRead


class PaginatedLoans(BaseModel):
    items: list[LoanRead]
    total: int
    page: int
    pageSize: int
