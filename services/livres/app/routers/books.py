from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import require_staff
from app.models import Book
from app.schemas import BookCreate, BookFacets, BookRead, PaginatedBooks

router = APIRouter(tags=["books"])


def normalize_page(page: int) -> int:
    return page if page >= 1 else 1


def normalize_page_size(page_size: int) -> int:
    return page_size if page_size >= 1 else 6


def paginate_books(
    db: Session,
    page: int,
    page_size: int,
    categorie: str | None,
    auteur: str | None,
    search: str | None = None,
) -> PaginatedBooks:
    conditions = []
    if categorie:
        conditions.append(Book.categorie == categorie)
    if auteur:
        conditions.append(Book.auteur == auteur)
    if search:
        pattern = f"%{search.strip()}%"
        conditions.append(
            or_(
                Book.titre.ilike(pattern),
                Book.auteur.ilike(pattern),
                Book.isbn.ilike(pattern),
            )
        )
    query = select(Book)
    count_query = select(func.count()).select_from(Book)
    if conditions:
        query = query.where(and_(*conditions))
        count_query = count_query.where(and_(*conditions))
    total = db.scalar(count_query) or 0
    items = db.scalars(
        query.order_by(Book.id).offset((page - 1) * page_size).limit(page_size)
    ).all()
    return PaginatedBooks(
        items=[BookRead.model_validate(item) for item in items],
        total=total,
        page=page,
        pageSize=page_size,
    )


@router.get("/books/facets", response_model=BookFacets)
def get_book_facets(db: Session = Depends(get_db)) -> BookFacets:
    categories = db.scalars(
        select(Book.categorie)
        .where(Book.categorie != "")
        .distinct()
        .order_by(Book.categorie)
    ).all()
    authors = db.scalars(select(Book.auteur).distinct().order_by(Book.auteur)).all()
    return BookFacets(categories=list(categories), authors=list(authors))


@router.get("/books", response_model=PaginatedBooks)
def list_books(
    page: int = Query(1, ge=1),
    pageSize: int = Query(6, ge=1, le=500),
    categorie: str | None = None,
    auteur: str | None = None,
    db: Session = Depends(get_db),
) -> PaginatedBooks:
    return paginate_books(
        db,
        normalize_page(page),
        normalize_page_size(pageSize),
        categorie,
        auteur,
    )


@router.get("/search", response_model=PaginatedBooks)
def search_books(
    q: str = Query(min_length=1),
    page: int = Query(1, ge=1),
    pageSize: int = Query(6, ge=1, le=500),
    categorie: str | None = None,
    auteur: str | None = None,
    db: Session = Depends(get_db),
) -> PaginatedBooks:
    return paginate_books(
        db,
        normalize_page(page),
        normalize_page_size(pageSize),
        categorie,
        auteur,
        q,
    )


@router.post("/books", response_model=BookRead, status_code=status.HTTP_201_CREATED)
def create_book(
    payload: BookCreate,
    db: Session = Depends(get_db),
    _: dict[str, str] = Depends(require_staff),
) -> BookRead:
    book = Book(
        titre=payload.titre.strip(),
        auteur=payload.auteur.strip(),
        categorie=payload.categorie.strip(),
        isbn=payload.isbn,
    )
    db.add(book)
    db.commit()
    db.refresh(book)
    return BookRead.model_validate(book)


@router.put("/books/{book_id}", response_model=BookRead)
def update_book(
    book_id: int,
    payload: BookCreate,
    db: Session = Depends(get_db),
    _: dict[str, str] = Depends(require_staff),
) -> BookRead:
    book = db.get(Book, book_id)
    if book is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Livre introuvable")
    book.titre = payload.titre.strip()
    book.auteur = payload.auteur.strip()
    book.categorie = payload.categorie.strip()
    book.isbn = payload.isbn
    db.commit()
    db.refresh(book)
    return BookRead.model_validate(book)


@router.delete("/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(
    book_id: int,
    db: Session = Depends(get_db),
    _: dict[str, str] = Depends(require_staff),
) -> None:
    book = db.get(Book, book_id)
    if book is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Livre introuvable")
    db.delete(book)
    db.commit()
