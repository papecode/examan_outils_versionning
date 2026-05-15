"""
Point d'entrée — Service Livres (FastAPI).
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.config import engine, Base
from app.routes.books import router as books_router


# ── Lifespan : création des tables au démarrage ────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


# ── Application ────────────────────────────────────────────────────────────
app = FastAPI(
    title="Service Livres — Bibliothèque DIT",
    description="""
## Service de gestion du catalogue de livres

Gère le **catalogue complet** des livres de la bibliothèque DIT.

### Fonctionnalités
- Gestion complète du CRUD (POST/GET/PUT/DELETE)
- Recherche multi-critères (titre, auteur, ISBN)
- Validation stricte des données
- Persistance PostgreSQL avec rollback transactionnel
- Schéma aligné avec le contrat API frontend
    """,
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ───────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ─────────────────────────────────────────────────────────────────
app.include_router(books_router)


# ── Healthcheck ────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"], summary="Vérification de l'état du service")
async def health():
    return {"status": "ok", "service": "livres", "version": "1.0.0"}


@app.get("/", tags=["Health"], include_in_schema=False)
async def root():
    return {"message": "Service Livres — DIT. Docs : /docs"}
