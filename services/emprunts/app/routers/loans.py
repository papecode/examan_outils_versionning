from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select, text
from sqlalchemy.orm import Session

from app.db import get_db
from app.export import export_loans_csv
from app.models import Loan
from app.schemas import LoanCreate, LoanCreateResponse, LoanRead, LoanReturn, LoanStats, PaginatedLoans
from app.services import refresh_loan_statuses, to_loan_read

router = APIRouter(prefix="/loans", tags=["loans"])


def apply_history_search(query, db: Session, q: str | None):
    if not q or not q.strip():
        return query

    term = q.strip()
    pattern = f"%{term}%"
    filters = [Loan.statut.ilike(pattern)]
    if term.isdigit():
        numeric_term = int(term)
        filters.extend([Loan.user_id == numeric_term, Loan.book_id == numeric_term])

    user_ids = [
        row[0]
        for row in db.execute(
            text("SELECT id FROM users WHERE nom ILIKE :pattern OR email ILIKE :pattern"),
            {"pattern": pattern},
        )
    ]
    if user_ids:
        filters.append(Loan.user_id.in_(user_ids))

    book_ids = [
        row[0]
        for row in db.execute(
            text("SELECT id FROM books WHERE titre ILIKE :pattern"),
            {"pattern": pattern},
        )
    ]
    if book_ids:
        filters.append(Loan.book_id.in_(book_ids))

    return query.where(or_(*filters))


def ensure_user_exists(db: Session, user_id: int) -> None:
    row = db.execute(text("SELECT id FROM users WHERE id = :user_id"), {"user_id": user_id}).first()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable")


def ensure_book_exists(db: Session, book_id: int) -> None:
    row = db.execute(text("SELECT id FROM books WHERE id = :book_id"), {"book_id": book_id}).first()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Livre introuvable")


@router.post("", response_model=LoanCreateResponse, status_code=status.HTTP_201_CREATED)
def create_loan(payload: LoanCreate, db: Session = Depends(get_db)) -> LoanCreateResponse:
    ensure_user_exists(db, payload.user_id)
    ensure_book_exists(db, payload.book_id)
    active = db.scalar(
        select(Loan).where(
            Loan.user_id == payload.user_id,
            Loan.book_id == payload.book_id,
            Loan.date_retour.is_(None),
            Loan.statut != "retourne",
        )
    )
    if active is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Emprunt actif deja existant")
    loan = Loan(
        user_id=payload.user_id,
        book_id=payload.book_id,
        date_emprunt=datetime.now(UTC),
        statut="actif",
    )
    db.add(loan)
    db.commit()
    db.refresh(loan)
    return LoanCreateResponse(status="created", loan=LoanRead.model_validate(to_loan_read(loan)))


@router.get("/user/{user_id}", response_model=PaginatedLoans)
def get_user_loans(
    user_id: int,
    page: int = Query(1, ge=1),
    pageSize: int = Query(6, ge=1, le=200),
    db: Session = Depends(get_db),
) -> PaginatedLoans:
    ensure_user_exists(db, user_id)
    refresh_loan_statuses(db)
    query = select(Loan).where(Loan.user_id == user_id)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    items = db.scalars(
        query.order_by(Loan.date_emprunt.desc()).offset((page - 1) * pageSize).limit(pageSize)
    ).all()
    return PaginatedLoans(
        items=[LoanRead.model_validate(to_loan_read(item)) for item in items],
        total=total,
        page=page,
        pageSize=pageSize,
    )


@router.get("/stats", response_model=LoanStats)
def get_loan_stats(db: Session = Depends(get_db)) -> LoanStats:
    refresh_loan_statuses(db)
    total = db.scalar(select(func.count()).select_from(Loan)) or 0
    active = (
        db.scalar(
            select(func.count()).select_from(Loan).where(
                Loan.date_retour.is_(None),
                Loan.statut != "retourne",
            )
        )
        or 0
    )
    overdue = db.scalar(select(func.count()).select_from(Loan).where(Loan.statut == "en_retard")) or 0
    return LoanStats(total=total, active=active, overdue=overdue)


@router.get("/history", response_model=PaginatedLoans)
def get_loan_history(
    page: int = Query(1, ge=1),
    pageSize: int = Query(6, ge=1, le=200),
    q: str | None = Query(default=None, max_length=255),
    db: Session = Depends(get_db),
) -> PaginatedLoans:
    refresh_loan_statuses(db)
    query = select(Loan)
    query = apply_history_search(query, db, q)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    items = db.scalars(
        query.order_by(Loan.date_emprunt.desc()).offset((page - 1) * pageSize).limit(pageSize)
    ).all()
    return PaginatedLoans(
        items=[LoanRead.model_validate(to_loan_read(item)) for item in items],
        total=total,
        page=page,
        pageSize=pageSize,
    )


@router.post("/return", response_model=LoanRead)
def return_loan(payload: LoanReturn, db: Session = Depends(get_db)) -> LoanRead:
    loan = db.scalar(
        select(Loan).where(
            Loan.user_id == payload.user_id,
            Loan.book_id == payload.book_id,
            Loan.date_retour.is_(None),
            Loan.statut != "retourne",
        )
    )
    if loan is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emprunt actif introuvable")
    loan.date_retour = datetime.now(UTC)
    loan.statut = "retourne"
    db.commit()
    db.refresh(loan)
    return LoanRead.model_validate(to_loan_read(loan))


@router.get("/export")
def export_loans(db: Session = Depends(get_db)) -> dict[str, str]:
    path = export_loans_csv(db)
    return {"path": str(path), "status": "exported"}
