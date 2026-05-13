import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { listBooks, searchBooks } from "@/api/books";
import { BookAdminPanel } from "@/components/books/BookAdminPanel";
import { ListSurface } from "@/components/layout/ListSurface";
import { PageHeader } from "@/components/layout/PageHeader";
import { PaginationControls } from "@/components/layout/PaginationControls";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { usePagination } from "@/hooks/usePagination";
import { buildLoginUrl } from "@/lib/navigation";
import { isStaff } from "@/lib/roles";
import { cn } from "@/lib/utils";
import type { Book } from "@/types/book";

export function CatalogPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const initialPage = Number(searchParams.get("page") ?? "1");
  const { page, pageSize, setPage } = usePagination({
    initialPage: Number.isFinite(initialPage) ? initialPage : 1,
    resetKey: query,
  });

  const booksQuery = useQuery({
    queryKey: ["books", query, page, pageSize],
    queryFn: () =>
      query.trim()
        ? searchBooks(query.trim(), { page, pageSize })
        : listBooks({ page, pageSize }),
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set("q", query.trim());
    }
    if (page > 1) {
      params.set("page", String(page));
    }
    setSearchParams(params, { replace: true });
  }, [query, page, setSearchParams]);

  const books = booksQuery.data?.items ?? [];
  const selectedBook = useMemo(
    () => books.find((book) => book.id === selectedBookId) ?? null,
    [books, selectedBookId],
  );

  function handleBorrow(book: Book) {
    if (!user) {
      navigate(buildLoginUrl("/espace/emprunts", book.id));
      return;
    }
    navigate(`/espace/emprunts?bookId=${book.id}`);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <PageHeader
        eyebrow="Catalogue"
        title="Parcourir les ouvrages"
        description="Consultation publique du catalogue. L'emprunt et les recommandations personnalisees necessitent une connexion."
        actions={
          isStaff(user) ? (
            <BookAdminPanel selectedBook={selectedBook} onClearSelection={() => setSelectedBookId(null)} />
          ) : null
        }
      />

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Rechercher par titre, auteur ou ISBN"
        className="mb-6 max-w-xl"
      />

      <ListSurface
        footer={
          booksQuery.data ? (
            <PaginationControls
              page={booksQuery.data.page}
              pageSize={booksQuery.data.pageSize}
              total={booksQuery.data.total}
              onPageChange={setPage}
            />
          ) : null
        }
      >
        {booksQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-44 rounded-xl" />
            ))}
          </div>
        ) : null}

        {booksQuery.isError ? (
          <Alert variant="destructive">
            <AlertTitle>Catalogue indisponible</AlertTitle>
            <AlertDescription>Impossible de charger les livres pour le moment.</AlertDescription>
          </Alert>
        ) : null}

        {booksQuery.data && books.length === 0 ? (
          <Alert>
            <AlertTitle>Aucun resultat</AlertTitle>
            <AlertDescription>Aucun livre ne correspond a votre recherche.</AlertDescription>
          </Alert>
        ) : null}

        {books.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <Card
                key={book.id}
                className={cn(
                  "border-border/80 bg-card/95",
                  selectedBookId === book.id ? "border-primary shadow-sm" : "",
                )}
                onClick={() => setSelectedBookId(book.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-xl">{book.titre}</CardTitle>
                    <Badge variant="secondary">#{book.id}</Badge>
                  </div>
                  <CardDescription>{book.auteur}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <p className="text-sm text-muted-foreground">{book.categorie || "Sans categorie"}</p>
                  {book.isbn ? <p className="text-sm text-muted-foreground">ISBN {book.isbn}</p> : null}
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => handleBorrow(book)}>Emprunter</Button>
                    {!user ? (
                      <Link
                        to={buildLoginUrl("/espace/emprunts", book.id)}
                        className={cn(buttonVariants({ variant: "outline" }))}
                      >
                        Connexion
                      </Link>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </ListSurface>
    </div>
  );
}
