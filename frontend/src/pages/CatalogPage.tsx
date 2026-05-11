import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBook, deleteBook, listBooks, searchBooks, updateBook } from "@/api/books";
import { LoadingState } from "@/components/LoadingState";
import { StatusMessage } from "@/components/StatusMessage";
import type { Book } from "@/types/book";

const emptyForm = {
  titre: "",
  auteur: "",
  categorie: "",
  isbn: "",
};

export function CatalogPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const booksQuery = useQuery({
    queryKey: ["books", query],
    queryFn: () => (query.trim() ? searchBooks(query.trim()) : listBooks()),
  });

  const selectedBook = useMemo(
    () => booksQuery.data?.find((book) => book.id === selectedBookId) ?? null,
    [booksQuery.data, selectedBookId],
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        titre: form.titre.trim(),
        auteur: form.auteur.trim(),
        categorie: form.categorie.trim(),
        ...(form.isbn.trim() ? { isbn: form.isbn.trim() } : {}),
      };

      if (selectedBook) {
        return updateBook(selectedBook.id, payload);
      }
      return createBook(payload);
    },
    onSuccess: async () => {
      setMessage(selectedBook ? "Livre mis a jour." : "Livre ajoute au catalogue.");
      setError(null);
      setForm(emptyForm);
      setSelectedBookId(null);
      await queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (err: Error) => {
      setError(err.message);
      setMessage(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (bookId: number) => deleteBook(bookId),
    onSuccess: async () => {
      setMessage("Livre supprime.");
      setError(null);
      setSelectedBookId(null);
      setForm(emptyForm);
      await queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (err: Error) => setError(err.message),
  });

  function handleSelect(book: Book) {
    setSelectedBookId(book.id);
    setForm({
      titre: book.titre,
      auteur: book.auteur,
      categorie: book.categorie,
      isbn: book.isbn ?? "",
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveMutation.mutate();
  }

  return (
    <div className="page-grid">
      <section className="card">
        <h2>Catalogue</h2>
        <label className="field">
          <span>Recherche titre, auteur ou ISBN</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher dans le catalogue"
          />
        </label>

        {booksQuery.isLoading ? <LoadingState /> : null}
        {booksQuery.isError ? (
          <StatusMessage tone="error" message="Impossible de charger le catalogue." />
        ) : null}

        {booksQuery.data && booksQuery.data.length === 0 ? (
          <StatusMessage tone="info" message="Aucun livre ne correspond a la recherche." />
        ) : null}

        {booksQuery.data && booksQuery.data.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Titre</th>
                  <th>Auteur</th>
                  <th>Categorie</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {booksQuery.data.map((book) => (
                  <tr key={book.id}>
                    <td>{book.id}</td>
                    <td>{book.titre}</td>
                    <td>{book.auteur}</td>
                    <td>{book.categorie}</td>
                    <td className="table-actions">
                      <button type="button" className="button button-secondary" onClick={() => handleSelect(book)}>
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="button button-danger"
                        onClick={() => {
                          if (window.confirm("Supprimer ce livre ?")) {
                            deleteMutation.mutate(book.id);
                          }
                        }}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className="card">
        <h2>{selectedBook ? "Modifier un livre" : "Ajouter un livre"}</h2>
        <form className="stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>Titre</span>
            <input
              value={form.titre}
              onChange={(event) => setForm((current) => ({ ...current, titre: event.target.value }))}
              required
            />
          </label>
          <label className="field">
            <span>Auteur</span>
            <input
              value={form.auteur}
              onChange={(event) => setForm((current) => ({ ...current, auteur: event.target.value }))}
              required
            />
          </label>
          <label className="field">
            <span>Categorie</span>
            <input
              value={form.categorie}
              onChange={(event) => setForm((current) => ({ ...current, categorie: event.target.value }))}
            />
          </label>
          <label className="field">
            <span>ISBN</span>
            <input
              value={form.isbn}
              onChange={(event) => setForm((current) => ({ ...current, isbn: event.target.value }))}
            />
          </label>

          {message ? <StatusMessage tone="success" message={message} /> : null}
          {error ? <StatusMessage tone="error" message={error} /> : null}

          <div className="button-row">
            <button type="submit" className="button button-primary" disabled={saveMutation.isPending}>
              {selectedBook ? "Enregistrer" : "Ajouter"}
            </button>
            {selectedBook ? (
              <button
                type="button"
                className="button button-secondary"
                onClick={() => {
                  setSelectedBookId(null);
                  setForm(emptyForm);
                }}
              >
                Annuler
              </button>
            ) : null}
          </div>
        </form>
      </section>
    </div>
  );
}
