"""
Point d'entrée — Service Utilisateurs (FastAPI).
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.config import engine, Base
from app.routes.users import router as users_router


# ── Lifespan : création des tables au démarrage ────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


# ── Application ────────────────────────────────────────────────────────────
app = FastAPI(
    title="Service Utilisateurs — Bibliothèque DIT",
    description="""
## Service de gestion des utilisateurs

Gère les **étudiants**, **professeurs** et **personnels** de la bibliothèque DIT.

### Fonctionnalités
- Création avec validation stricte
- Vérification par email, ID ou numéro étudiant
- Liste paginée avec filtres
- Profil complet par ID
- Persistance PostgreSQL avec rollback transactionnel
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
app.include_router(users_router)


# ── Healthcheck ────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"], summary="Vérification de l'état du service")
async def health():
    return {"status": "ok", "service": "utilisateurs", "version": "1.0.0"}


@app.get("/", tags=["Health"], include_in_schema=False)
async def root():
    return {"message": "Service Utilisateurs — DIT. Docs : /docs"}
