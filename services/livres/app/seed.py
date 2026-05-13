from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Book


def seed_books(db: Session) -> None:
    if db.scalar(select(Book.id).limit(1)) is not None:
        return

    seeds = [
        ("Introduction a Python", "Guido Van Rossum", "Informatique", "978-1-111"),
        ("Algorithmique avancee", "Thomas Cormen", "Informatique", "978-1-112"),
        ("Bases de donnees relationnelles", "Codd Edgar", "Informatique", "978-1-113"),
        ("Reseaux informatiques", "Andrew Tanenbaum", "Informatique", "978-1-114"),
        ("Machine Learning", "Ian Goodfellow", "Data Science", "978-1-115"),
        ("Statistiques appliquees", "Pierre Simon", "Data Science", "978-1-116"),
        ("Histoire de l Afrique", "Cheikh Anta Diop", "Histoire", "978-1-117"),
        ("Philosophie moderne", "Immanuel Kant", "Philosophie", "978-1-118"),
        ("Litterature francaise", "Victor Hugo", "Litterature", "978-1-119"),
        ("Economie numerique", "Thomas Piketty", "Economie", "978-1-120"),
        ("Droit public", "Dominique Rousseau", "Droit", "978-1-121"),
        ("Gestion de projet", "Jean Dupont", "Management", "978-1-122"),
        ("Cybersecurite", "Bruce Schneier", "Informatique", "978-1-123"),
        ("Cloud computing", "Werner Vogels", "Informatique", "978-1-124"),
    ]
    for titre, auteur, categorie, isbn in seeds:
        db.add(Book(titre=titre, auteur=auteur, categorie=categorie, isbn=isbn))
    db.commit()
