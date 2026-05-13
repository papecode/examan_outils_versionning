import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import Base, get_db
from app.models import Book
from app.routers import books as books_router


@pytest.fixture()
def client() -> TestClient:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    session_factory = sessionmaker(bind=engine)

    with session_factory() as session:
        session.add_all(
            [
                Book(titre="Les Miserables", auteur="Hugo", categorie="Roman"),
                Book(titre="Germinal", auteur="Zola", categorie="Roman"),
                Book(titre="Le Petit Prince", auteur="Saint-Exupery", categorie="Jeunesse"),
            ]
        )
        session.commit()

    app = FastAPI()
    app.include_router(books_router.router)

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
