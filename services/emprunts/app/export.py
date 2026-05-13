import csv
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import Loan
from app.services import refresh_loan_statuses

settings = get_settings()


def export_loans_csv(db: Session) -> Path:
    refresh_loan_statuses(db)
    loans = db.scalars(select(Loan).order_by(Loan.id)).all()
    export_path = Path(settings.loans_export_path)
    export_path.parent.mkdir(parents=True, exist_ok=True)
    with export_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["user_id", "book_id", "date_emprunt", "date_retour", "statut"])
        for loan in loans:
            writer.writerow(
                [
                    loan.user_id,
                    loan.book_id,
                    loan.date_emprunt.isoformat() if loan.date_emprunt else "",
                    loan.date_retour.isoformat() if loan.date_retour else "",
                    loan.statut,
                ]
            )
    return export_path
