"""
Routes FastAPI — Service Livres.

POST   /books              Créer un livre
GET    /books              Lister les livres
GET    /books/{id}         Récupérer un livre
PUT    /books/{id}         Modifier un livre
DELETE /books/{id}         Supprimer un livre
GET    /search             Rechercher par titre/auteur/isbn
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.config import get_db
from app.models.book import Livre
from app.schemas.book import (
    LivreCreate, LivreUpdate, LivreResponse, 
    LivreListResponse, SearchResponse, MessageResponse,
)

router = APIRouter(prefix="/books", tags=["Livres"])


# ══════════════════════════════════════════════════════════════════
# STORY 2 — CRUD /books
# ══════════════════════════════════════════════════════════════════

@router.post(
    "",
    response_model=LivreResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un livre",
    responses={
        409: {"description": "ISBN déjà utilisé"},
        422: {"description": "Données invalides"},
    },
)
async def creer_livre(
    payload: LivreCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Crée un nouveau livre.

    - **titre** : obligatoire
    - **auteur** : obligatoire
    - **categorie** : obligatoire
    - **isbn** : optionnel mais unique s'il est fourni
    """
    # ── Vérification unicité ISBN ─────────────────────────────────
    if payload.isbn:
        existing_isbn = await db.scalar(
            select(Livre).where(Livre.isbn == payload.isbn)
        )
        if existing_isbn:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "detail": f"L'ISBN '{payload.isbn}' est déjà utilisé.",
                    "code": "ISBN_ALREADY_EXISTS",
                    "field": "isbn",
                },
            )

    # ── Création ─────────────────────────────────────────────────
    livre = Livre(**payload.model_dump())
    db.add(livre)

    try:
        await db.flush()
        await db.refresh(livre)
    except IntegrityError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "detail": "Violation de contrainte d'unicité.",
                "code": "INTEGRITY_ERROR",
            },
        )

    return livre


@router.get(
    "",
    response_model=LivreListResponse,
    summary="Lister tous les livres",
)
async def lister_livres(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """
    Retourne la liste paginée des livres.

    - **limit** : nombre d'éléments par page (défaut 10, max 100)
    - **offset** : décalage depuis le début (défaut 0)
    """
    total = await db.scalar(select(func.count(Livre.id)))
    
    livres = await db.scalars(
        select(Livre)
        .order_by(Livre.id)
        .limit(limit)
        .offset(offset)
    )

    return LivreListResponse(
        count=total,
        limit=limit,
        offset=offset,
        livres=list(livres),
    )


@router.get(
    "/{livre_id}",
    response_model=LivreResponse,
    summary="Récupérer un livre",
    responses={404: {"description": "Livre non trouvé"}},
)
async def obtenir_livre(
    livre_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Récupère les détails d'un livre par son ID."""
    livre = await db.get(Livre, livre_id)
    
    if not livre:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "detail": f"Livre avec l'ID {livre_id} non trouvé.",
                "code": "LIVRE_NOT_FOUND",
            },
        )
    
    return livre


@router.put(
    "/{livre_id}",
    response_model=LivreResponse,
    summary="Modifier un livre",
    responses={
        404: {"description": "Livre non trouvé"},
        409: {"description": "ISBN déjà utilisé"},
    },
)
async def modifier_livre(
    livre_id: int,
    payload: LivreUpdate,
    db: AsyncSession = Depends(get_db),
):
    """
    Modifie un livre existant.

    Tous les champs sont optionnels. Seuls les champs fournis seront mis à jour.
    """
    livre = await db.get(Livre, livre_id)
    
    if not livre:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "detail": f"Livre avec l'ID {livre_id} non trouvé.",
                "code": "LIVRE_NOT_FOUND",
            },
        )

    # ── Vérification unicité ISBN si modification ─────────────────
    if payload.isbn and payload.isbn != livre.isbn:
        existing_isbn = await db.scalar(
            select(Livre).where(Livre.isbn == payload.isbn)
        )
        if existing_isbn:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "detail": f"L'ISBN '{payload.isbn}' est déjà utilisé.",
                    "code": "ISBN_ALREADY_EXISTS",
                    "field": "isbn",
                },
            )

    # ── Mise à jour ──────────────────────────────────────────────
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(livre, key, value)

    try:
        await db.flush()
        await db.refresh(livre)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "detail": "Violation de contrainte d'unicité.",
                "code": "INTEGRITY_ERROR",
            },
        )

    return livre


@router.delete(
    "/{livre_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Supprimer un livre",
    responses={404: {"description": "Livre non trouvé"}},
)
async def supprimer_livre(
    livre_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Supprime un livre de la base de données."""
    livre = await db.get(Livre, livre_id)
    
    if not livre:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "detail": f"Livre avec l'ID {livre_id} non trouvé.",
                "code": "LIVRE_NOT_FOUND",
            },
        )

    await db.delete(livre)
    
    return MessageResponse(message=f"Livre {livre_id} supprimé avec succès.")


# ══════════════════════════════════════════════════════════════════
# STORY 3 — GET /search?q=
# ══════════════════════════════════════════════════════════════════

@router.get(
    "/search",
    response_model=SearchResponse,
    summary="Rechercher des livres",
    responses={
        400: {"description": "Paramètre q vide ou manquant"},
    },
)
async def rechercher_livres(
    q: str = Query(..., min_length=1, max_length=255, description="Terme de recherche"),
    db: AsyncSession = Depends(get_db),
):
    """
    Recherche des livres par titre, auteur ou ISBN.

    - **q** : terme de recherche (obligatoire, min 1 caractère)

    La recherche est insensible à la casse et utilise la recherche textuelle partielle.

    ### Cas gérés
    - Recherche vide : error 400
    - Aucun résultat : retourne une liste vide
    - Erreur de base : error 500
    """
    if not q or not q.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "detail": "Le paramètre 'q' ne peut pas être vide.",
                "code": "EMPTY_SEARCH_QUERY",
            },
        )

    search_term = f"%{q.strip()}%"

    try:
        livres = await db.scalars(
            select(Livre).where(
                or_(
                    Livre.titre.ilike(search_term),
                    Livre.auteur.ilike(search_term),
                    Livre.isbn.ilike(search_term) if Livre.isbn else False,
                )
            )
        )

        results = list(livres)

        return SearchResponse(
            count=len(results),
            results=results,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "detail": "Erreur lors de la recherche.",
                "code": "SEARCH_ERROR",
            },
        )
