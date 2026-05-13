CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    type_utilisateur VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    auteur VARCHAR(255) NOT NULL,
    categorie VARCHAR(255) NOT NULL DEFAULT '',
    isbn VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS loans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    book_id INTEGER NOT NULL REFERENCES books(id),
    date_emprunt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_retour TIMESTAMPTZ,
    statut VARCHAR(20) NOT NULL DEFAULT 'actif'
);

CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_book_id ON loans(book_id);
CREATE INDEX IF NOT EXISTS idx_books_categorie ON books(categorie);
CREATE INDEX IF NOT EXISTS idx_books_auteur ON books(auteur);
