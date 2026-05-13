from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.auth import hash_password
from app.config import get_settings
from app.db import get_db
from app.deps import require_staff
from app.models import User
from app.pagination import normalize_page, normalize_page_size
from app.schemas import PaginatedUsers, UserCreate, UserRead

router = APIRouter(prefix="/users", tags=["users"])
settings = get_settings()


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_staff),
) -> UserRead:
    if payload.email:
        existing = db.scalar(select(User).where(User.email == payload.email))
        if existing is not None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email deja utilise")
    password = payload.password or settings.default_password
    user = User(
        nom=payload.nom.strip(),
        email=payload.email,
        password_hash=hash_password(password),
        type_utilisateur=payload.type_utilisateur,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserRead.model_validate(user)


@router.get("", response_model=PaginatedUsers)
def list_users(
    page: int = Query(1, ge=1),
    pageSize: int = Query(6, ge=1, le=200),
    db: Session = Depends(get_db),
) -> PaginatedUsers:
    safe_page = normalize_page(page)
    safe_page_size = normalize_page_size(pageSize)
    total = db.scalar(select(func.count()).select_from(User)) or 0
    items = db.scalars(
        select(User)
        .order_by(User.id)
        .offset((safe_page - 1) * safe_page_size)
        .limit(safe_page_size)
    ).all()
    return PaginatedUsers(
        items=[UserRead.model_validate(item) for item in items],
        total=total,
        page=safe_page,
        pageSize=safe_page_size,
    )


@router.get("/{user_id}", response_model=UserRead)
def get_user(user_id: int, db: Session = Depends(get_db)) -> UserRead:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable")
    return UserRead.model_validate(user)
