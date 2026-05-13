import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listBooks } from "@/api/books";
import { getLoanHistory } from "@/api/loans";
import { listUsers } from "@/api/users";
import { ListSurface } from "@/components/layout/ListSurface";
import { PageHeader } from "@/components/layout/PageHeader";
import { PaginationControls } from "@/components/layout/PaginationControls";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePagination } from "@/hooks/usePagination";
import { formatLoanDate, formatLoanDueDate, getLoanStatusLabel, isLoanOverdue } from "@/lib/loans";
import type { Book } from "@/types/book";
import type { User } from "@/types/user";

export function StaffLoansHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { page, pageSize, setPage } = usePagination({ resetKey: debouncedSearch });

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const historyQuery = useQuery({
    queryKey: ["loans", "history", page, pageSize, debouncedSearch],
    queryFn: () =>
      getLoanHistory({
        page,
        pageSize,
        q: debouncedSearch.trim() || undefined,
      }),
  });

  const usersQuery = useQuery({
    queryKey: ["users", "staff-history"],
    queryFn: () => listUsers({ page: 1, pageSize: 500 }),
  });

  const booksQuery = useQuery({
    queryKey: ["books", "staff-history"],
    queryFn: () => listBooks({ page: 1, pageSize: 500 }),
  });

  const userMap = useMemo(() => {
    const map = new Map<number, User>();
    for (const user of usersQuery.data?.items ?? []) {
      map.set(user.id, user);
    }
    return map;
  }, [usersQuery.data?.items]);

  const bookMap = useMemo(() => {
    const map = new Map<number, Book>();
    for (const book of booksQuery.data?.items ?? []) {
      map.set(book.id, book);
    }
    return map;
  }, [booksQuery.data?.items]);

  const history = historyQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Personnel"
        title="Historique global des emprunts"
        description="Consultation de tous les emprunts enregistres par la bibliotheque."
      />
      <Input
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Rechercher par utilisateur, livre ou statut"
        className="max-w-xl"
      />
      <ListSurface
        footer={
          <PaginationControls
            page={history?.page ?? page}
            pageSize={history?.pageSize ?? pageSize}
            total={history?.total ?? 0}
            onPageChange={setPage}
          />
        }
      >
        {historyQuery.isLoading ? <Skeleton className="h-32 w-full" /> : null}
        {historyQuery.isError ? (
          <Alert variant="destructive">
            <AlertTitle>Historique indisponible</AlertTitle>
            <AlertDescription>Le service emprunts n&apos;est pas joignable pour le moment.</AlertDescription>
          </Alert>
        ) : null}
        {!historyQuery.isLoading && (history?.items.length ?? 0) === 0 ? (
          <Alert>
            <AlertDescription>
              {debouncedSearch.trim()
                ? "Aucun emprunt ne correspond a votre recherche."
                : "Aucun emprunt enregistre."}
            </AlertDescription>
          </Alert>
        ) : null}
        {(history?.items.length ?? 0) > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Livre</TableHead>
                <TableHead>Emprunt</TableHead>
                <TableHead>Echeance</TableHead>
                <TableHead>Rendu le</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history?.items.map((loan, index) => (
                <TableRow key={`${loan.user_id}-${loan.book_id}-${loan.date_emprunt ?? index}`}>
                  <TableCell>{userMap.get(loan.user_id)?.nom ?? `#${loan.user_id}`}</TableCell>
                  <TableCell>
                    {bookMap.get(loan.book_id)?.titre ?? `#${loan.book_id}`}
                  </TableCell>
                  <TableCell>{formatLoanDate(loan.date_emprunt)}</TableCell>
                  <TableCell>{formatLoanDueDate(loan)}</TableCell>
                  <TableCell>{formatLoanDate(loan.date_retour)}</TableCell>
                  <TableCell>
                    <Badge variant={isLoanOverdue(loan) ? "destructive" : "secondary"}>
                      {getLoanStatusLabel(loan)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </ListSurface>
    </div>
  );
}
