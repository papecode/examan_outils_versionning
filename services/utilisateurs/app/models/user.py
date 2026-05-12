"""
Modèle SQLAlchemy — table `utilisateurs`.
Contraintes SQL : unicité email, enum type_utilisateur.
"""
from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import (
    BigInteger, String, Boolean, Integer,
    DateTime, Enum, UniqueConstraint, CheckConstraint, func
)
from sqlalchemy.orm import Mapped, mapped_column
from app.db.config import Base


class TypeUtilisateur(str, PyEnum):
    etudiant   = "etudiant"
    professeur = "professeur"
    personnel  = "personnel"


class Utilisateur(Base):
    __tablename__ = "utilisateurs"

    # ── Contraintes au niveau de la table ─────────────────────────
    __table_args__ = (
        UniqueConstraint("email",            name="uq_utilisateurs_email"),
        UniqueConstraint("numero_etudiant",  name="uq_utilisateurs_numero"),
        CheckConstraint("length(email) >= 5",  name="ck_email_longueur"),
        CheckConstraint("length(nom) >= 2",    name="ck_nom_longueur"),
        CheckConstraint("length(prenom) >= 2", name="ck_prenom_longueur"),
        CheckConstraint("max_emprunts > 0",    name="ck_max_emprunts_positif"),
    )

    # ── Colonnes ───────────────────────────────────────────────────
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    nom:    Mapped[str] = mapped_column(String(100), nullable=False)
    prenom: Mapped[str] = mapped_column(String(100), nullable=False)
    email:  Mapped[str] = mapped_column(String(255), nullable=False)

    telephone:       Mapped[str | None] = mapped_column(String(20),  nullable=True)
    numero_etudiant: Mapped[str | None] = mapped_column(String(50),  nullable=True)

    type_utilisateur: Mapped[TypeUtilisateur] = mapped_column(
        Enum(TypeUtilisateur, name="type_utilisateur_enum"),
        nullable=False,
        default=TypeUtilisateur.etudiant,
    )

    actif:        Mapped[bool] = mapped_column(Boolean, default=True,  nullable=False)
    max_emprunts: Mapped[int]  = mapped_column(Integer, default=3,     nullable=False)

    date_inscription:  Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    date_modification: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # ── Propriété calculée ─────────────────────────────────────────
    @property
    def nom_complet(self) -> str:
        return f"{self.prenom} {self.nom}"

    def _set_max_emprunts(self):
        """Règle métier : nb max d'emprunts selon le type."""
        limits = {
            TypeUtilisateur.professeur: 5,
            TypeUtilisateur.personnel:  4,
            TypeUtilisateur.etudiant:   3,
        }
        self.max_emprunts = limits.get(self.type_utilisateur, 3)

    def __repr__(self) -> str:
        return f"<Utilisateur id={self.id} email={self.email} type={self.type_utilisateur}>"
