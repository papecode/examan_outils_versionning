from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import Loan

settings = get_settings()


def refresh_loan_statuses(db: Session) -> None:
    now = datetime.now(UTC)
    threshold = now - timedelta(days=settings.loan_duration_days)
    loans = db.scalars(
        select(Loan).where(Loan.date_retour.is_(None), Loan.statut != "retourne")
    ).all()
    changed = False
    for loan in loans:
        loan_date = loan.date_emprunt
        if loan_date.tzinfo is None:
            loan_date = loan_date.replace(tzinfo=UTC)
        if loan_date <= threshold and loan.statut != "en_retard":
            loan.statut = "en_retard"
            changed = True
    if changed:
        db.commit()


def to_loan_read(loan: Loan) -> dict:
    date_echeance = None
    if loan.date_emprunt is not None:
        loan_date = loan.date_emprunt
        if loan_date.tzinfo is None:
            loan_date = loan_date.replace(tzinfo=UTC)
        date_echeance = loan_date + timedelta(days=settings.loan_duration_days)

    return {
        "user_id": loan.user_id,
        "book_id": loan.book_id,
        "date_emprunt": loan.date_emprunt,
        "date_echeance": date_echeance,
        "date_retour": loan.date_retour,
        "statut": loan.statut,
    }
