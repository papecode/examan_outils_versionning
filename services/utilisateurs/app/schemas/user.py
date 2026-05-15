"""
Schémas Pydantic — contrat d'API pour le service Utilisateurs.
Validation stricte des entrées et sérialisation des sorties.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator, model_validator
from app.models.user import TypeUtilisateur


# ══════════════════════════════════════════════════════════════════
# ENTRÉES (request body)
# ══════════════════════════════════════════════════════════════════

class UtilisateurCreate(BaseModel):
    nom:             str
    prenom:          str
    email:           EmailStr
    telephone:       Optional[str] = None
    numero_etudiant: Optional[str] = None
    type_utilisateur: TypeUtilisateur = TypeUtilisateur.etudiant

    # ── Validations champ par champ ────────────────────────────────
    @field_validator("nom", "prenom")
    @classmethod
    def valider_nom(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Doit contenir au moins 2 caractères.")
        if not all(c.isalpha() or c in " -'" for c in v):
            raise ValueError("Ne doit contenir que des lettres, espaces, tirets ou apostrophes.")
        return v.title()

    @field_validator("email")
    @classmethod
    def normaliser_email(cls, v: str) -> str:
        return v.lower().strip()

    @field_validator("telephone")
    @classmethod
    def valider_telephone(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        digits = "".join(c for c in v if c.isdigit())
        if len(digits) < 8:
            raise ValueError("Le numéro de téléphone doit contenir au moins 8 chiffres.")
        return v.strip()

    @field_validator("numero_etudiant")
    @classmethod
    def valider_numero(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v.strip()) < 3:
            raise ValueError("Le numéro étudiant doit contenir au moins 3 caractères.")
        return v.strip() if v else None

    # ── Validation croisée ─────────────────────────────────────────
    @model_validator(mode="after")
    def numero_requis_pour_etudiant(self) -> "UtilisateurCreate":
        if self.type_utilisateur == TypeUtilisateur.etudiant and not self.numero_etudiant:
            raise ValueError("Le numéro étudiant est obligatoire pour un étudiant.")
        return self


class UtilisateurUpdate(BaseModel):
    nom:              Optional[str]              = None
    prenom:           Optional[str]              = None
    telephone:        Optional[str]              = None
    type_utilisateur: Optional[TypeUtilisateur]  = None
    actif:            Optional[bool]             = None

    @field_validator("nom", "prenom")
    @classmethod
    def valider_nom(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if len(v) < 2:
                raise ValueError("Doit contenir au moins 2 caractères.")
        return v


# ══════════════════════════════════════════════════════════════════
# SORTIES (response body)
# ══════════════════════════════════════════════════════════════════

class UtilisateurResponse(BaseModel):
    id:               int
    nom:              str
    prenom:           str
    nom_complet:      str
    email:            str
    telephone:        Optional[str]
    numero_etudiant:  Optional[str]
    type_utilisateur: TypeUtilisateur
    actif:            bool
    max_emprunts:     int
    date_inscription: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_with_computed(cls, user) -> "UtilisateurResponse":
        return cls(
            id=user.id,
            nom=user.nom,
            prenom=user.prenom,
            nom_complet=user.nom_complet,
            email=user.email,
            telephone=user.telephone,
            numero_etudiant=user.numero_etudiant,
            type_utilisateur=user.type_utilisateur,
            actif=user.actif,
            max_emprunts=user.max_emprunts,
            date_inscription=user.date_inscription,
        )


class UtilisateurListResponse(BaseModel):
    total:        int
    utilisateurs: list[UtilisateurResponse]


class CheckResponse(BaseModel):
    """Réponse pour GET /users/check/{identifier}"""
    trouve:           bool
    utilisateur:      Optional[UtilisateurResponse] = None
    message:          str


class MessageResponse(BaseModel):
    message: str


class ErrorResponse(BaseModel):
    detail:  str
    code:    Optional[str] = None
    field:   Optional[str] = None
