import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listBooks } from "@/api/books";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function FeaturedBooks() {
  const booksQuery = useQuery({
    queryKey: ["books", "featured"],
    queryFn: () => listBooks({ page: 1, pageSize: 6 }),
  });

  if (booksQuery.isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  }

  if (booksQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Catalogue indisponible</AlertTitle>
        <AlertDescription>
          Le service livres n&apos;est pas joignable pour le moment. Reessayez plus tard.
        </AlertDescription>
      </Alert>
    );
  }

  const books = booksQuery.data?.items ?? [];

  if (books.length === 0) {
    return (
      <Alert>
        <AlertTitle>Aucun livre publie</AlertTitle>
        <AlertDescription>Le catalogue sera affiche ici des que des ouvrages seront disponibles.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {books.map((book) => (
        <Card key={book.id} className="border-border/80 bg-card/95">
          <CardHeader>
            <CardTitle className="text-xl">{book.titre}</CardTitle>
            <CardDescription>{book.auteur}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">{book.categorie || "Sans categorie"}</span>
            <Link to="/catalogue" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
              Voir
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
