import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listBooks } from "@/api/books";
import { createLoan, getUserLoans, returnLoan } from "@/api/loans";
import { LoadingState } from "@/components/LoadingState";
import { StatusMessage } from "@/components/StatusMessage";
import { useAuth } from "@/hooks/useAuth";
import type { Loan } from "@/types/loan";

function formatDate(value?: string): string {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleDateString("fr-FR");
}

function loanStatus(loan: Loan): string {
  if (loan.statut === "en_retard") {
    return "En retard";
  }
  if (loan.statut === "retourne" || loan.date_retour) {
    return "Retourne";
  }
  return "Actif";
}

export function LoansPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [bookId, setBookId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const booksQuery = useQuery({
    queryKey: ["books"],
    queryFn: listBooks,
  });

  const loansQuery = useQuery({
    queryKey: ["loans", user?.id],
    queryFn: () => getUserLoans(user!.id),
    enabled: Boolean(user),
  });

  const borrowMutation = useMutation({
    mutationFn: () =>
      createLoan({
        user_id: user!.id,
        book_id: Number(bookId),
      }),
    onSuccess: async () => {
      setMessage("Emprunt enregistre.");
      setError(null);
      setBookId("");
      await queryClient.invalidateQueries({ queryKey: ["loans", user?.id] });
      await queryClient.invalidateQueries({ queryKey: ["recommendations", user?.id] });
    },
    onError: (err: Error) => {
      setError(err.message);
      setMessage(null);
    },
  });

  const returnMutation = useMutation({
    mutationFn: (bookIdToReturn: number) => returnLoan(user!.id, bookIdToReturn),
    onSuccess: async () => {
      setMessage("Retour enregistre.");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["loans", user?.id] });
    },
    onError: (err: Error) => setError(err.message),
  });

  function handleBorrow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!bookId) {
      setError("Selectionnez un livre.");
      return;
    }
    borrowMutation.mutate();
  }

  return (
    <div className="page-grid">
      <section className="card">
        <h2>Emprunter un livre</h2>
        <form className="stack" onSubmit={handleBorrow}>
          <label className="field">
            <span>Livre</span>
            <select value={bookId} onChange={(event) => setBookId(event.target.value)} required>
              <option value="">Choisir un livre</option>
              {booksQuery.data?.map((book) => (
                <option key={book.id} value={book.id}>
                  #{book.id} - {book.titre}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="button button-primary" disabled={borrowMutation.isPending}>
            Emprunter
          </button>
        </form>
        {message ? <StatusMessage tone="success" message={message} /> : null}
        {error ? <StatusMessage tone="error" message={error} /> : null}
      </section>

      <section className="card">
        <h2>Historique des emprunts</h2>
        {loansQuery.isLoading ? <LoadingState /> : null}
        {loansQuery.isError ? (
          <StatusMessage tone="error" message="Historique indisponible pour le moment." />
        ) : null}

        {loansQuery.data && loansQuery.data.length === 0 ? (
          <StatusMessage tone="info" message="Aucun emprunt enregistre." />
        ) : null}

        {loansQuery.data && loansQuery.data.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Livre</th>
                  <th>Emprunt</th>
                  <th>Retour</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loansQuery.data.map((loan, index) => (
                  <tr key={`${loan.book_id}-${loan.date_emprunt ?? index}`}>
                    <td>#{loan.book_id}</td>
                    <td>{formatDate(loan.date_emprunt)}</td>
                    <td>{formatDate(loan.date_retour)}</td>
                    <td>{loanStatus(loan)}</td>
                    <td>
                      {loan.statut !== "retourne" && !loan.date_retour ? (
                        <button
                          type="button"
                          className="button button-secondary"
                          onClick={() => returnMutation.mutate(loan.book_id)}
                        >
                          Retourner
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
