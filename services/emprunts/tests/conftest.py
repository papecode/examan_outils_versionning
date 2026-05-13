from datetime import UTC, datetime, timedelta

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import Base, get_db
from app.models import Loan
from app.routers import loans as loans_router


@pytest.fixture()
def client() -> TestClient:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    with engine.begin() as connection:
        connection.execute(
            text(
                "CREATE TABLE users (id INTEGER PRIMARY KEY, nom TEXT, email TEXT)"
            )
        )
        connection.execute(text("CREATE TABLE books (id INTEGER PRIMARY KEY, titre TEXT)"))
        connection.execute(
            text("INSERT INTO users (id, nom, email) VALUES (1, 'Alice', 'alice@dit.local')")
        )
        connection.execute(text("INSERT INTO books (id, titre) VALUES (1, 'Livre A')"))

    session_factory = sessionmaker(bind=engine)
    with session_factory() as session:
        session.add(
            Loan(
                user_id=1,
                book_id=1,
                date_emprunt=datetime.now(UTC) - timedelta(days=2),
                statut="actif",
            )
        )
        session.add(
            Loan(
                user_id=1,
                book_id=1,
                date_emprunt=datetime.now(UTC) - timedelta(days=10),
                statut="en_retard",
            )
        )
        session.commit()

    app = FastAPI()
    app.include_router(loans_router.router)

    def override_get_db():
        db = session_factory()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
