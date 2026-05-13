import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { listBooks, searchBooks } from "@/api/books";
import { BookAdminPanel } from "@/components/books/BookAdminPanel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { buildLoginUrl } from "@/lib/navigation";
import { isStaff } from "@/lib/roles";
import { cn } from "@/lib/utils";
import type { Book } from "@/types/book";

export function CatalogPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);

  const booksQuery = useQuery({
    queryKey: ["books", query],
    queryFn: () => (query.trim() ? searchBooks(query.trim()) : listBooks()),
  });

  const selectedBook = useMemo(
    () => booksQuery.data?.find((book) => book.id === selectedBookId) ?? null,
    [booksQuery.data, selectedBookId],
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
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Catalogue</p>
          <h1 className="font-heading text-4xl font-semibold">Parcourir les ouvrages</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Consultation publique du catalogue. L&apos;emprunt et les recommandations personnalisees
            necessitent une connexion.
          </p>
        </div>
        {isStaff(user) ? (
          <BookAdminPanel selectedBook={selectedBook} onClearSelection={() => setSelectedBookId(null)} />
        ) : null}
      </div>

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Rechercher par titre, auteur ou ISBN"
        className="mb-6 max-w-xl"
      />

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

      {booksQuery.data && booksQuery.data.length === 0 ? (
        <Alert>
          <AlertTitle>Aucun resultat</AlertTitle>
          <AlertDescription>Aucun livre ne correspond a votre recherche.</AlertDescription>
        </Alert>
      ) : null}

      {booksQuery.data && booksQuery.data.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {booksQuery.data.map((book) => (
            <Card
              key={book.id}
              className={selectedBookId === book.id ? "border-primary shadow-md" : ""}
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
    </div>
  );
}
