from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from app.config import get_settings

settings = get_settings()
engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def bootstrap_schema() -> None:
    schema_path = Path("/app/db/init.sql")
    if not schema_path.exists():
        for parent in Path(__file__).resolve().parents:
            candidate = parent / "db" / "init.sql"
            if candidate.exists():
                schema_path = candidate
                break
        else:
            return
    sql = schema_path.read_text(encoding="utf-8")
    with engine.begin() as connection:
        for statement in sql.split(";"):
            chunk = statement.strip()
            if chunk:
                connection.execute(text(chunk))
