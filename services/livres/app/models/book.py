"""
Modèle SQLAlchemy — table `livres`.
Champs : titre, auteur, categorie, isbn (optionnel).
Contraintes SQL : unicité ISBN.
"""
from datetime import datetime
from sqlalchemy import (
    BigInteger, String, DateTime, UniqueConstraint, 
    CheckConstraint, func
)
from sqlalchemy.orm import Mapped, mapped_column
from app.db.config import Base


class Livre(Base):
    __tablename__ = "livres"

    # ── Contraintes au niveau de la table ─────────────────────────
    __table_args__ = (
        UniqueConstraint("isbn", name="uq_livres_isbn"),
        CheckConstraint("length(titre) >= 1", name="ck_titre_longueur"),
        CheckConstraint("length(auteur) >= 1", name="ck_auteur_longueur"),
        CheckConstraint("length(categorie) >= 1", name="ck_categorie_longueur"),
    )

    # ── Colonnes ───────────────────────────────────────────────────
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    titre:      Mapped[str] = mapped_column(String(255), nullable=False)
    auteur:     Mapped[str] = mapped_column(String(255), nullable=False)
    categorie:  Mapped[str] = mapped_column(String(100), nullable=False)
    isbn:       Mapped[str | None] = mapped_column(String(20), nullable=True)

    date_creation:     Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    date_modification: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<Livre id={self.id} titre={self.titre} auteur={self.auteur}>"
