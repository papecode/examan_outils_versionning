import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { listBooks, searchBooks } from "@/api/books";
import { BookAdminPanel, BookCardAdminMenu, type BookAdminDialogState } from "@/components/books/BookAdminPanel";
import { CatalogFilters } from "@/components/books/CatalogFilters";
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
import { paginateArray } from "@/lib/pagination";
import { DEFAULT_PAGE_SIZE } from "@/types/pagination";
import { cn } from "@/lib/utils";
import type { Book } from "@/types/book";

interface CatalogPageProps {
  variant?: "public" | "staff-admin";
}

export function CatalogPage({ variant = "public" }: CatalogPageProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("categorie") ?? "all");
  const [author, setAuthor] = useState(searchParams.get("auteur") ?? "all");
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [bookDialog, setBookDialog] = useState<BookAdminDialogState>(null);
  const initialPage = Number(searchParams.get("page") ?? "1");
  const { page, pageSize, setPage } = usePagination({
    initialPage: Number.isFinite(initialPage) ? initialPage : 1,
    pageSize: DEFAULT_PAGE_SIZE,
    resetKey: `${query}-${category}-${author}`,
  });

  const booksQuery = useQuery({
    queryKey: ["books", query],
    queryFn: () =>
      query.trim()
        ? searchBooks(query.trim(), { page: 1, pageSize: 500 })
        : listBooks({ page: 1, pageSize: 500 }),
  });

  const filteredBooks = useMemo(() => {
    const items = booksQuery.data?.items ?? [];
    return items.filter((book) => {
      const categoryMatch = category === "all" || book.categorie === category;
      const authorMatch = author === "all" || book.auteur === author;
      return categoryMatch && authorMatch;
    });
  }, [booksQuery.data?.items, category, author]);

  const paginated = useMemo(
    () => paginateArray(filteredBooks, page, pageSize),
    [filteredBooks, page, pageSize],
  );

  const categories = useMemo(
    () =>
      Array.from(
        new Set((booksQuery.data?.items ?? []).map((book) => book.categorie).filter(Boolean)),
      ).sort(),
    [booksQuery.data?.items],
  );

  const authors = useMemo(
    () =>
      Array.from(new Set((booksQuery.data?.items ?? []).map((book) => book.auteur).filter(Boolean))).sort(),
    [booksQuery.data?.items],
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set("q", query.trim());
    }
    if (category !== "all") {
      params.set("categorie", category);
    }
    if (author !== "all") {
      params.set("auteur", author);
    }
    if (page > 1) {
      params.set("page", String(page));
    }
    setSearchParams(params, { replace: true });
  }, [query, category, author, page, setSearchParams]);


  function clearBookSelection() {
    setSelectedBookId(null);
  }

  function handleBorrow(book: Book) {
    if (!user) {
      navigate(buildLoginUrl("/espace/emprunts", book.id));
      return;
    }
    navigate(`/espace/emprunts?bookId=${book.id}`);
  }

  const isStaffAdminView = variant === "staff-admin";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <PageHeader
        eyebrow={isStaffAdminView ? "Personnel" : "Catalogue"}
        title={isStaffAdminView ? "Catalogue admin" : "Parcourir les ouvrages"}
        description={
          isStaffAdminView
            ? "Gestion des ouvrages : ajout, modification et suppression dans le catalogue."
            : "Consultation publique du catalogue. L'emprunt et les recommandations personnalisees necessitent une connexion."
        }
        actions={
          isStaffAdminView ? (
            <BookAdminPanel
              dialog={bookDialog}
              onDialogChange={setBookDialog}
              onComplete={clearBookSelection}
            />
          ) : null
        }
      />

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Rechercher par titre, auteur ou ISBN"
        className="mb-6 max-w-xl"
      />

      <CatalogFilters
        categories={categories}
        authors={authors}
        category={category}
        author={author}
        onCategoryChange={setCategory}
        onAuthorChange={setAuthor}
      />

      <ListSurface
        footer={
          <PaginationControls
            page={paginated.page}
            pageSize={paginated.pageSize}
            total={paginated.total}
            onPageChange={setPage}
          />
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

        {!booksQuery.isLoading && paginated.items.length === 0 ? (
          <Alert>
            <AlertTitle>Aucun resultat</AlertTitle>
            <AlertDescription>Aucun livre ne correspond a votre recherche.</AlertDescription>
          </Alert>
        ) : null}

        {paginated.items.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginated.items.map((book) => (
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
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">#{book.id}</Badge>
                      {isStaffAdminView ? (
                        <BookCardAdminMenu
                          book={book}
                          onEdit={() => setBookDialog({ mode: "edit", book })}
                          onDelete={() => setBookDialog({ mode: "delete", book })}
                        />
                      ) : null}
                    </div>
                  </div>
                  <CardDescription>{book.auteur}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <p className="text-sm text-muted-foreground">{book.categorie || "Sans categorie"}</p>
                  {book.isbn ? <p className="text-sm text-muted-foreground">ISBN {book.isbn}</p> : null}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleBorrow(book);
                      }}
                    >
                      Emprunter
                    </Button>
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
