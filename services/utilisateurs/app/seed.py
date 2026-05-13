from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import hash_password
from app.config import get_settings
from app.models import User

settings = get_settings()


def seed_users(db: Session) -> None:
    if db.scalar(select(User.id).limit(1)) is not None:
        return

    seeds = [
        ("Admin DIT", "admin@dit.local", "Personnel"),
        ("Etudiant Demo", "etudiant@dit.local", "Etudiant"),
        ("Professeur Demo", "professeur@dit.local", "Professeur"),
    ]
    password_hash = hash_password(settings.default_password)
    for nom, email, role in seeds:
        db.add(
            User(
                nom=nom,
                email=email,
                password_hash=password_hash,
                type_utilisateur=role,
            )
        )
    db.commit()
