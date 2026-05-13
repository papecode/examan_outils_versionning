from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import create_access_token, verify_password
from app.config import get_settings
from app.db import get_db
from app.models import User
from app.schemas import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    LoginResponse,
    UserRead,
)

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    identifier = payload.identifier.strip()
    query = select(User)
    if identifier.isdigit():
        query = query.where(User.id == int(identifier))
    else:
        query = query.where(User.email == identifier)
    user = db.scalar(query)
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Identifiants invalides")
    token = create_access_token(user.id, user.type_utilisateur)
    return LoginResponse(user=UserRead.model_validate(user), token=token)


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(_: ForgotPasswordRequest) -> ForgotPasswordResponse:
    return ForgotPasswordResponse(
        message="Si un compte existe pour cet email, un lien de reinitialisation sera envoye."
    )
