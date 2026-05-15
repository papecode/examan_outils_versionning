"""
Schémas Pydantic — contrat d'API pour le service Livres.
Validation stricte des entrées et sérialisation des sorties.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator


# ══════════════════════════════════════════════════════════════════
# ENTRÉES (request body)
# ══════════════════════════════════════════════════════════════════

class LivreCreate(BaseModel):
    titre:      str
    auteur:     str
    categorie:  str
    isbn:       Optional[str] = None

    # ── Validations champ par champ ────────────────────────────────
    @field_validator("titre", "auteur", "categorie")
    @classmethod
    def valider_champs_texte(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 1:
            raise ValueError("Le champ ne doit pas être vide.")
        if len(v) > 255:
            raise ValueError("Le champ ne doit pas dépasser 255 caractères.")
        return v

    @field_validator("isbn")
    @classmethod
    def valider_isbn(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        # Formate simple : accepte alphanumériques et tirets
        if not all(c.isalnum() or c == "-" for c in v):
            raise ValueError("ISBN invalide : doit contenir uniquement des chiffres, lettres et tirets.")
        if len(v) > 20:
            raise ValueError("ISBN invalide : ne doit pas dépasser 20 caractères.")
        return v


class LivreUpdate(BaseModel):
    titre:     Optional[str] = None
    auteur:    Optional[str] = None
    categorie: Optional[str] = None
    isbn:      Optional[str] = None

    @field_validator("titre", "auteur", "categorie")
    @classmethod
    def valider_champs_texte(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if len(v) < 1:
                raise ValueError("Le champ ne doit pas être vide.")
            if len(v) > 255:
                raise ValueError("Le champ ne doit pas dépasser 255 caractères.")
        return v

    @field_validator("isbn")
    @classmethod
    def valider_isbn(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if not all(c.isalnum() or c == "-" for c in v):
                raise ValueError("ISBN invalide.")
            if len(v) > 20:
                raise ValueError("ISBN invalide.")
        return v


# ══════════════════════════════════════════════════════════════════
# SORTIES (response body)
# ══════════════════════════════════════════════════════════════════

class LivreResponse(BaseModel):
    id:                 int
    titre:              str
    auteur:             str
    categorie:          str
    isbn:               Optional[str]
    date_creation:      datetime
    date_modification:  datetime

    model_config = {"from_attributes": True}


class LivreListResponse(BaseModel):
    count:   int
    limit:   int
    offset:  int
    livres:  list[LivreResponse]


class SearchResponse(BaseModel):
    count:   int
    results: list[LivreResponse]


class MessageResponse(BaseModel):
    message: str
