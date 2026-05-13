import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getBookFacets, listBooks, searchBooks } from "@/api/books";
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

  const selectedCategory = category === "all" ? undefined : category;
  const selectedAuthor = author === "all" ? undefined : author;

  const facetsQuery = useQuery({
    queryKey: ["books", "facets"],
    queryFn: getBookFacets,
  });

  const booksQuery = useQuery({
    queryKey: ["books", "catalog", page, pageSize, query, selectedCategory, selectedAuthor],
    queryFn: () => {
      const params = {
        page,
        pageSize,
        categorie: selectedCategory,
        auteur: selectedAuthor,
      };
      return query.trim()
        ? searchBooks(query.trim(), params)
        : listBooks(params);
    },
  });

  const books = booksQuery.data;
  const categories = facetsQuery.data?.categories ?? [];
  const authors = facetsQuery.data?.authors ?? [];

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
    <div className="mx-auto min-w-0 max-w-6xl px-4 py-8 md:px-6 md:py-10">
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
            page={books?.page ?? page}
            pageSize={books?.pageSize ?? pageSize}
            total={books?.total ?? 0}
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

        {!booksQuery.isLoading && (books?.items.length ?? 0) === 0 ? (
          <Alert>
            <AlertTitle>Aucun resultat</AlertTitle>
            <AlertDescription>Aucun livre ne correspond a votre recherche.</AlertDescription>
          </Alert>
        ) : null}

        {(books?.items.length ?? 0) > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {books?.items.map((book) => (
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
                    <CardTitle className="text-lg break-words sm:text-xl">{book.titre}</CardTitle>
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
