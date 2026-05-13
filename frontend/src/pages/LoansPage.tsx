import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { listBooks } from "@/api/books";
import { createLoan, getUserLoans, returnLoan } from "@/api/loans";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  const [searchParams] = useSearchParams();
  const [bookId, setBookId] = useState(searchParams.get("bookId") ?? "");

  useEffect(() => {
    const fromQuery = searchParams.get("bookId");
    if (fromQuery) {
      setBookId(fromQuery);
    }
  }, [searchParams]);

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
      toast.success("Emprunt enregistre.");
      setBookId("");
      await queryClient.invalidateQueries({ queryKey: ["loans", user?.id] });
      await queryClient.invalidateQueries({ queryKey: ["recommendations", user?.id] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const returnMutation = useMutation({
    mutationFn: (bookIdToReturn: number) => returnLoan(user!.id, bookIdToReturn),
    onSuccess: async () => {
      toast.success("Retour enregistre.");
      await queryClient.invalidateQueries({ queryKey: ["loans", user?.id] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function handleBorrow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!bookId) {
      toast.error("Selectionnez un livre.");
      return;
    }
    borrowMutation.mutate();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Espace personnel</p>
        <h1 className="font-heading text-4xl font-semibold">Emprunts</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Emprunter un livre</CardTitle>
          <CardDescription>Selectionnez un ouvrage du catalogue pour lancer l&apos;emprunt.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4 md:flex-row md:items-end" onSubmit={handleBorrow}>
            <div className="flex w-full flex-col gap-2 md:max-w-md">
              <Select value={bookId} onValueChange={(value) => setBookId(value ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un livre" />
                </SelectTrigger>
                <SelectContent>
                  {booksQuery.data?.map((book) => (
                    <SelectItem key={book.id} value={String(book.id)}>
                      #{book.id} - {book.titre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={borrowMutation.isPending}>
              Emprunter
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historique des emprunts</CardTitle>
        </CardHeader>
        <CardContent>
          {loansQuery.isLoading ? <Skeleton className="h-32 w-full" /> : null}
          {loansQuery.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Historique indisponible</AlertTitle>
              <AlertDescription>Le service emprunts n&apos;est pas joignable pour le moment.</AlertDescription>
            </Alert>
          ) : null}
          {loansQuery.data && loansQuery.data.length === 0 ? (
            <Alert>
              <AlertDescription>Aucun emprunt enregistre.</AlertDescription>
            </Alert>
          ) : null}
          {loansQuery.data && loansQuery.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Livre</TableHead>
                  <TableHead>Emprunt</TableHead>
                  <TableHead>Retour</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loansQuery.data.map((loan, index) => (
                  <TableRow key={`${loan.book_id}-${loan.date_emprunt ?? index}`}>
                    <TableCell>#{loan.book_id}</TableCell>
                    <TableCell>{formatDate(loan.date_emprunt)}</TableCell>
                    <TableCell>{formatDate(loan.date_retour)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{loanStatus(loan)}</Badge>
                    </TableCell>
                    <TableCell>
                      {loan.statut !== "retourne" && !loan.date_retour ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => returnMutation.mutate(loan.book_id)}
                        >
                          Retourner
                        </Button>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
