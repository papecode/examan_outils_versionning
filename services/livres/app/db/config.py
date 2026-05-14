"""
Configuration de la base de données PostgreSQL (SQLAlchemy async).
"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://admin:admin123@db:5432/db_livres"
    APP_ENV: str = "development"

    class Config:
        env_file = ".env"


settings = Settings()

# ── Moteur async ───────────────────────────────────────────────────────────
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=(settings.APP_ENV == "development"),  # logs SQL en dev uniquement
    pool_pre_ping=True,   # vérifie la connexion avant chaque requête
    pool_size=10,
    max_overflow=20,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


class Base(DeclarativeBase):
    pass


# ── Dépendance FastAPI ─────────────────────────────────────────────────────
async def get_db() -> AsyncSession:
    """Injectée dans chaque route pour obtenir une session DB."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()   # rollback transactionnel automatique
            raise
        finally:
            await session.close()
