from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nom: str
    email: str | None = None
    type_utilisateur: str


class UserCreate(BaseModel):
    nom: str = Field(min_length=1, max_length=255)
    email: EmailStr | None = None
    type_utilisateur: Literal["Etudiant", "Professeur", "Personnel"]
    password: str | None = Field(default=None, min_length=6, max_length=128)


class UserUpdate(BaseModel):
    nom: str | None = Field(default=None, min_length=1, max_length=255)
    email: EmailStr | None = None
    type_utilisateur: Literal["Etudiant", "Professeur", "Personnel"] | None = None
    password: str | None = Field(default=None, min_length=6, max_length=128)


class LoginRequest(BaseModel):
    identifier: str = Field(min_length=1)
    password: str = Field(min_length=1)


class LoginResponse(BaseModel):
    user: UserRead
    token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    message: str


class PaginatedUsers(BaseModel):
    items: list[UserRead]
    total: int
    page: int
    pageSize: int
