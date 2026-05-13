from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select, text
from sqlalchemy.orm import Session

from app.auth import hash_password
from app.config import get_settings
from app.db import get_db
from app.deps import require_staff
from app.models import User
from app.pagination import normalize_page, normalize_page_size
from app.schemas import PaginatedUsers, UserCreate, UserRead, UserUpdate

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
    q: str | None = Query(default=None, max_length=255),
    db: Session = Depends(get_db),
) -> PaginatedUsers:
    safe_page = normalize_page(page)
    safe_page_size = normalize_page_size(pageSize)
    query = select(User)
    if q and q.strip():
        term = q.strip()
        filters = [
            User.nom.ilike(f"%{term}%"),
            User.email.ilike(f"%{term}%"),
        ]
        if term.isdigit():
            filters.append(User.id == int(term))
        query = query.where(or_(*filters))
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    items = db.scalars(
        query.order_by(User.id).offset((safe_page - 1) * safe_page_size).limit(safe_page_size)
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


def _apply_user_update(user: User, payload: UserUpdate) -> None:
    data = payload.model_dump(exclude_unset=True)
    if "nom" in data and data["nom"] is not None:
        user.nom = data["nom"].strip()
    if "email" in data:
        user.email = data["email"]
    if "type_utilisateur" in data and data["type_utilisateur"] is not None:
        user.type_utilisateur = data["type_utilisateur"]
    if data.get("password"):
        user.password_hash = hash_password(data["password"])


@router.put("/{user_id}", response_model=UserRead)
@router.patch("/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_staff),
) -> UserRead:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable")
    if not payload.model_dump(exclude_unset=True):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Aucune modification fournie")
    if payload.email is not None:
        existing = db.scalar(select(User).where(User.email == payload.email, User.id != user_id))
        if existing is not None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email deja utilise")
    _apply_user_update(user, payload)
    db.commit()
    db.refresh(user)
    return UserRead.model_validate(user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    staff: User = Depends(require_staff),
) -> None:
    if user_id == staff.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Impossible de supprimer votre propre compte",
        )
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable")
    if user.type_utilisateur == "Personnel":
        personnel_count = db.scalar(
            select(func.count()).select_from(User).where(User.type_utilisateur == "Personnel")
        ) or 0
        if personnel_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Impossible de supprimer le dernier compte personnel",
            )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="La suppression des comptes personnel est interdite",
        )
    loan_count = db.execute(
        text("SELECT COUNT(*) FROM loans WHERE user_id = :user_id"),
        {"user_id": user_id},
    ).scalar_one()
    if loan_count and int(loan_count) > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Impossible de supprimer un compte avec des emprunts enregistres",
        )
    db.delete(user)
    db.commit()
