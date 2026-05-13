import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { listBooks } from "@/api/books";
import { createLoan, getUserLoans, returnLoan } from "@/api/loans";
import { ListSurface } from "@/components/layout/ListSurface";
import { PageHeader } from "@/components/layout/PageHeader";
import { PaginationControls } from "@/components/layout/PaginationControls";
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
import { usePagination } from "@/hooks/usePagination";
import { formatLoanDate, getLoanStatusLabel, isLoanOverdue } from "@/lib/loans";
import { paginateArray } from "@/lib/pagination";
import { invalidateLoanQueries } from "@/lib/queryKeys";
import type { Book } from "@/types/book";
import type { Loan } from "@/types/loan";

type LoanFilter = "all" | "active" | "overdue";

function matchesFilter(loan: Loan, filter: LoanFilter): boolean {
  if (filter === "all") {
    return true;
  }
  if (filter === "overdue") {
    return isLoanOverdue(loan);
  }
  return loan.statut !== "retourne" && !loan.date_retour;
}

export function LoansPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [bookId, setBookId] = useState(searchParams.get("bookId") ?? "");
  const [loanFilter, setLoanFilter] = useState<LoanFilter>("all");
  const { page, pageSize, setPage } = usePagination({ resetKey: loanFilter });

  useEffect(() => {
    const fromQuery = searchParams.get("bookId");
    if (fromQuery) {
      setBookId(fromQuery);
    }
  }, [searchParams]);

  const booksQuery = useQuery({
    queryKey: ["books", "loan-picker"],
    queryFn: () => listBooks({ page: 1, pageSize: 200 }),
  });

  const loansQuery = useQuery({
    queryKey: ["loans", user?.id],
    queryFn: () => getUserLoans(user!.id, { page: 1, pageSize: 200 }),
    enabled: Boolean(user),
  });

  const bookMap = useMemo(() => {
    const map = new Map<number, Book>();
    for (const book of booksQuery.data?.items ?? []) {
      map.set(book.id, book);
    }
    return map;
  }, [booksQuery.data?.items]);

  const filteredLoans = useMemo(() => {
    const loans = loansQuery.data?.items ?? [];
    return loans.filter((loan) => matchesFilter(loan, loanFilter));
  }, [loansQuery.data?.items, loanFilter]);

  const paginatedLoans = useMemo(
    () => paginateArray(filteredLoans, page, pageSize),
    [filteredLoans, page, pageSize],
  );

  const borrowMutation = useMutation({
    mutationFn: () =>
      createLoan({
        user_id: user!.id,
        book_id: Number(bookId),
      }),
    onSuccess: async () => {
      toast.success("Emprunt enregistre.");
      setBookId("");
      await invalidateLoanQueries(queryClient, user?.id);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const returnMutation = useMutation({
    mutationFn: (bookIdToReturn: number) => returnLoan(user!.id, bookIdToReturn),
    onSuccess: async () => {
      toast.success("Retour enregistre.");
      await invalidateLoanQueries(queryClient, user?.id);
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

  const bookOptions = booksQuery.data?.items ?? [];

  function getBookTitle(loan: Loan): string {
    return bookMap.get(loan.book_id)?.titre ?? `#${loan.book_id}`;
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader
        eyebrow="Espace personnel"
        title="Emprunts"
        description="Empruntez un ouvrage et consultez votre historique."
      />

      <Card className="border-border/80">
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
                  {bookOptions.map((book) => (
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

      <Card className="border-border/80">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle>Historique des emprunts</CardTitle>
          <Select value={loanFilter} onValueChange={(value) => setLoanFilter((value ?? "all") as LoanFilter)}>
            <SelectTrigger className="w-full md:w-56">
              <SelectValue placeholder="Filtrer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les emprunts</SelectItem>
              <SelectItem value="active">Emprunts actifs</SelectItem>
              <SelectItem value="overdue">En retard</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <ListSurface
            footer={
              loansQuery.data ? (
                <PaginationControls
                  page={paginatedLoans.page}
                  pageSize={paginatedLoans.pageSize}
                  total={paginatedLoans.total}
                  onPageChange={setPage}
                />
              ) : null
            }
          >
            {loansQuery.isLoading ? <Skeleton className="h-32 w-full" /> : null}
            {loansQuery.isError ? (
              <Alert variant="destructive">
                <AlertTitle>Historique indisponible</AlertTitle>
                <AlertDescription>Le service emprunts n&apos;est pas joignable pour le moment.</AlertDescription>
              </Alert>
            ) : null}
            {loansQuery.data && paginatedLoans.items.length === 0 ? (
              <Alert>
                <AlertDescription>Aucun emprunt ne correspond au filtre selectionne.</AlertDescription>
              </Alert>
            ) : null}
            {paginatedLoans.items.length > 0 ? (
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
                  {paginatedLoans.items.map((loan, index) => (
                    <TableRow key={`${loan.book_id}-${loan.date_emprunt ?? index}`}>
                      <TableCell className="max-w-[12rem] whitespace-normal sm:max-w-none">{getBookTitle(loan)}</TableCell>
                      <TableCell>{formatLoanDate(loan.date_emprunt)}</TableCell>
                      <TableCell>{formatLoanDate(loan.date_retour)}</TableCell>
                      <TableCell>
                        <Badge variant={isLoanOverdue(loan) ? "destructive" : "secondary"}>
                          {getLoanStatusLabel(loan)}
                        </Badge>
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
          </ListSurface>
        </CardContent>
      </Card>
    </div>
  );
}
