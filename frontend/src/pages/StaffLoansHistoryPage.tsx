import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { listBooks } from "@/api/books";
import { getLoanHistory } from "@/api/loans";
import { ListSurface } from "@/components/layout/ListSurface";
import { PageHeader } from "@/components/layout/PageHeader";
import { PaginationControls } from "@/components/layout/PaginationControls";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { formatLoanDate, getLoanStatusLabel } from "@/lib/loans";
import { paginateArray } from "@/lib/pagination";
import type { Book } from "@/types/book";

export function StaffLoansHistoryPage() {
  const { page, pageSize, setPage } = usePagination();

  const historyQuery = useQuery({
    queryKey: ["loans", "history"],
    queryFn: getLoanHistory,
  });

  const booksQuery = useQuery({
    queryKey: ["books", "staff-history"],
    queryFn: () => listBooks({ page: 1, pageSize: 500 }),
  });

  const bookMap = useMemo(() => {
    const map = new Map<number, Book>();
    for (const book of booksQuery.data?.items ?? []) {
      map.set(book.id, book);
    }
    return map;
  }, [booksQuery.data?.items]);

  const paginated = useMemo(() => {
    if (!historyQuery.data) {
      return null;
    }
    return paginateArray(historyQuery.data, page, pageSize);
  }, [historyQuery.data, page, pageSize]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Personnel"
        title="Historique global des emprunts"
        description="Consultation de tous les emprunts enregistres par la bibliotheque."
      />
      <ListSurface
        footer={
          paginated ? (
            <PaginationControls
              page={paginated.page}
              pageSize={paginated.pageSize}
              total={paginated.total}
              onPageChange={setPage}
            />
          ) : null
        }
      >
        {historyQuery.isLoading ? <Skeleton className="h-32 w-full" /> : null}
        {historyQuery.isError ? (
          <Alert variant="destructive">
            <AlertTitle>Historique indisponible</AlertTitle>
            <AlertDescription>Le service emprunts n&apos;est pas joignable pour le moment.</AlertDescription>
          </Alert>
        ) : null}
        {paginated && paginated.items.length === 0 ? (
          <Alert>
            <AlertDescription>Aucun emprunt enregistre.</AlertDescription>
          </Alert>
        ) : null}
        {paginated && paginated.items.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Livre</TableHead>
                <TableHead>Emprunt</TableHead>
                <TableHead>Retour</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.items.map((loan, index) => (
                <TableRow key={`${loan.user_id}-${loan.book_id}-${loan.date_emprunt ?? index}`}>
                  <TableCell>#{loan.user_id}</TableCell>
                  <TableCell>
                    {bookMap.get(loan.book_id)?.titre ?? `#${loan.book_id}`}
                  </TableCell>
                  <TableCell>{formatLoanDate(loan.date_emprunt)}</TableCell>
                  <TableCell>{formatLoanDate(loan.date_retour)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{getLoanStatusLabel(loan)}</Badge>
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
