"""
Routes FastAPI — Service Utilisateurs.

POST   /users                      Créer un utilisateur
GET    /users/check/{identifier}   Vérifier existence par email, ID ou n° étudiant
GET    /users                      Lister les utilisateurs
GET    /users/{user_id}            Profil d'un utilisateur
PATCH  /users/{user_id}            Modifier un utilisateur
DELETE /users/{user_id}            Désactiver un utilisateur
GET    /users/stats                Statistiques
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.config import get_db
from app.models.user import Utilisateur, TypeUtilisateur
from app.schemas.user import (
    UtilisateurCreate, UtilisateurUpdate,
    UtilisateurResponse, UtilisateurListResponse,
    CheckResponse, MessageResponse,
)

router = APIRouter(prefix="/users", tags=["Utilisateurs"])


# ══════════════════════════════════════════════════════════════════
# STORY 1 — POST /users  (Création)
# ══════════════════════════════════════════════════════════════════

@router.post(
    "",
    response_model=UtilisateurResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un utilisateur",
    responses={
        409: {"description": "Email ou numéro étudiant déjà utilisé"},
        422: {"description": "Données invalides"},
    },
)
async def creer_utilisateur(
    payload: UtilisateurCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Crée un nouvel utilisateur (Étudiant, Professeur ou Personnel).

    - Email **unique** obligatoire
    - Numéro étudiant **unique** et obligatoire pour les étudiants
    - `max_emprunts` calculé automatiquement selon le type
    """
    # ── Vérification unicité email (message explicite) ─────────────
    existing_email = await db.scalar(
        select(Utilisateur).where(Utilisateur.email == payload.email)
    )
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "detail": f"L'email '{payload.email}' est déjà utilisé.",
                "code":   "EMAIL_ALREADY_EXISTS",
                "field":  "email",
            },
        )

    # ── Vérification unicité numéro étudiant ──────────────────────
    if payload.numero_etudiant:
        existing_num = await db.scalar(
            select(Utilisateur).where(
                Utilisateur.numero_etudiant == payload.numero_etudiant
            )
        )
        if existing_num:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "detail": f"Le numéro étudiant '{payload.numero_etudiant}' est déjà utilisé.",
                    "code":   "NUMERO_ALREADY_EXISTS",
                    "field":  "numero_etudiant",
                },
            )

    # ── Création avec calcul automatique de max_emprunts ──────────
    user = Utilisateur(**payload.model_dump())
    user._set_max_emprunts()

    db.add(user)

    try:
        await db.flush()   # exécute le INSERT sans commit (rollback possible)
        await db.refresh(user)
    except IntegrityError as e:
        # Filet de sécurité : contrainte SQL non anticipée
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "detail": "Violation de contrainte d'unicité.",
                "code":   "INTEGRITY_ERROR",
                "raw":    str(e.orig),
            },
        )

    return UtilisateurResponse.from_orm_with_computed(user)


# ══════════════════════════════════════════════════════════════════
# STORY 1 — GET /users/check/{identifier}  (Connexion / Vérification)
# ══════════════════════════════════════════════════════════════════

@router.get(
    "/check/{identifier}",
    response_model=CheckResponse,
    summary="Vérifier existence par email, ID ou numéro étudiant",
    responses={
        200: {"description": "Résultat de la recherche (trouvé ou non)"},
    },
)
async def check_utilisateur(
    identifier: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Recherche un utilisateur par :
    - **ID numérique** (ex: `42`)
    - **Email** (ex: `amadou@dit.sn`)
    - **Numéro étudiant** (ex: `DIT-2024-001`)

    Retourne toujours 200 — `trouve: false` si absent.
    """
    user = None

    # Tenter ID numérique
    if identifier.isdigit():
        user = await db.get(Utilisateur, int(identifier))

    # Tenter email
    if user is None and "@" in identifier:
        user = await db.scalar(
            select(Utilisateur).where(Utilisateur.email == identifier.lower().strip())
        )

    # Tenter numéro étudiant
    if user is None:
        user = await db.scalar(
            select(Utilisateur).where(Utilisateur.numero_etudiant == identifier.strip())
        )

    if user is None:
        return CheckResponse(
            trouve=False,
            utilisateur=None,
            message=f"Aucun utilisateur trouvé pour l'identifiant '{identifier}'.",
        )

    if not user.actif:
        return CheckResponse(
            trouve=True,
            utilisateur=UtilisateurResponse.from_orm_with_computed(user),
            message="Compte trouvé mais désactivé. Contactez l'administration.",
        )

    return CheckResponse(
        trouve=True,
        utilisateur=UtilisateurResponse.from_orm_with_computed(user),
        message="Utilisateur trouvé et actif.",
    )


# ══════════════════════════════════════════════════════════════════
# STORY 2 — GET /users  (Liste)
# ══════════════════════════════════════════════════════════════════

@router.get(
    "",
    response_model=UtilisateurListResponse,
    summary="Lister les utilisateurs",
)
async def lister_utilisateurs(
    type_utilisateur: Optional[TypeUtilisateur] = Query(None, description="Filtrer par type"),
    actif:            Optional[bool]            = Query(None, description="Filtrer par statut actif/inactif"),
    search:           Optional[str]             = Query(None, description="Recherche nom, prénom ou email"),
    page:             int                       = Query(1,    ge=1,  description="Numéro de page"),
    limit:            int                       = Query(20,   ge=1, le=100, description="Résultats par page"),
    db: AsyncSession = Depends(get_db),
):
    """
    Retourne la liste paginée des utilisateurs avec filtres optionnels.
    La réponse est conforme au contrat : `{ total, utilisateurs[] }`.
    """
    query = select(Utilisateur)

    # ── Filtres ───────────────────────────────────────────────────
    if type_utilisateur is not None:
        query = query.where(Utilisateur.type_utilisateur == type_utilisateur)
    if actif is not None:
        query = query.where(Utilisateur.actif == actif)
    if search:
        pattern = f"%{search.strip()}%"
        query = query.where(
            or_(
                Utilisateur.nom.ilike(pattern),
                Utilisateur.prenom.ilike(pattern),
                Utilisateur.email.ilike(pattern),
            )
        )

    # ── Total ─────────────────────────────────────────────────────
    total = await db.scalar(select(func.count()).select_from(query.subquery()))

    # ── Pagination ────────────────────────────────────────────────
    offset = (page - 1) * limit
    result = await db.execute(
        query.order_by(Utilisateur.nom, Utilisateur.prenom)
             .offset(offset)
             .limit(limit)
    )
    users = result.scalars().all()

    return UtilisateurListResponse(
        total=total or 0,
        utilisateurs=[UtilisateurResponse.from_orm_with_computed(u) for u in users],
    )


# ══════════════════════════════════════════════════════════════════
# STORY 2 — GET /users/{user_id}  (Profil)
# ══════════════════════════════════════════════════════════════════

@router.get(
    "/{user_id}",
    response_model=UtilisateurResponse,
    summary="Profil d'un utilisateur",
    responses={
        404: {"description": "Utilisateur introuvable"},
    },
)
async def get_utilisateur(
    user_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Retourne le profil complet d'un utilisateur par son ID.
    Retourne **404** avec message explicite si absent.
    """
    user = await db.get(Utilisateur, user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "detail": f"Utilisateur avec l'ID {user_id} introuvable.",
                "code":   "USER_NOT_FOUND",
            },
        )

    return UtilisateurResponse.from_orm_with_computed(user)


# ══════════════════════════════════════════════════════════════════
# STORY 3 — PATCH /users/{user_id}  (Modification partielle)
# ══════════════════════════════════════════════════════════════════

@router.patch(
    "/{user_id}",
    response_model=UtilisateurResponse,
    summary="Modifier un utilisateur",
    responses={
        404: {"description": "Utilisateur introuvable"},
    },
)
async def modifier_utilisateur(
    user_id: int,
    payload: UtilisateurUpdate,
    db: AsyncSession = Depends(get_db),
):
    user = await db.get(Utilisateur, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"detail": f"Utilisateur {user_id} introuvable.", "code": "USER_NOT_FOUND"},
        )

    # Appliquer uniquement les champs fournis
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(user, field, value)

    # Recalculer max_emprunts si le type a changé
    if "type_utilisateur" in updates:
        user._set_max_emprunts()

    try:
        await db.flush()
        await db.refresh(user)
    except IntegrityError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"detail": "Violation de contrainte.", "raw": str(e.orig)},
        )

    return UtilisateurResponse.from_orm_with_computed(user)


# ══════════════════════════════════════════════════════════════════
# STORY 3 — DELETE /users/{user_id}  (Désactivation douce)
# ══════════════════════════════════════════════════════════════════

@router.delete(
    "/{user_id}",
    response_model=MessageResponse,
    summary="Désactiver un utilisateur (soft delete)",
    responses={
        404: {"description": "Utilisateur introuvable"},
    },
)
async def desactiver_utilisateur(
    user_id: int,
    db: AsyncSession = Depends(get_db),
):
    user = await db.get(Utilisateur, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"detail": f"Utilisateur {user_id} introuvable.", "code": "USER_NOT_FOUND"},
        )

    user.actif = False
    await db.flush()
    return MessageResponse(message=f"Compte de {user.nom_complet} désactivé avec succès.")


# ══════════════════════════════════════════════════════════════════
# BONUS — GET /users/stats  (Statistiques)
# ══════════════════════════════════════════════════════════════════

@router.get(
    "/stats/summary",
    summary="Statistiques sur les utilisateurs",
)
async def stats_utilisateurs(db: AsyncSession = Depends(get_db)):
    total   = await db.scalar(select(func.count(Utilisateur.id)))
    actifs  = await db.scalar(select(func.count(Utilisateur.id)).where(Utilisateur.actif == True))

    counts = {}
    for t in TypeUtilisateur:
        n = await db.scalar(
            select(func.count(Utilisateur.id))
            .where(Utilisateur.type_utilisateur == t, Utilisateur.actif == True)
        )
        counts[t.value] = n or 0

    return {
        "total":            total or 0,
        "actifs":           actifs or 0,
        "inactifs":         (total or 0) - (actifs or 0),
        "par_type":         counts,
    }
