import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRecommendations } from "@/api/recommendations";
import { ListSurface } from "@/components/layout/ListSurface";
import { PageHeader } from "@/components/layout/PageHeader";
import { PaginationControls } from "@/components/layout/PaginationControls";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { usePagination } from "@/hooks/usePagination";
import { paginateArray } from "@/lib/pagination";

export function RecommendationsPage() {
  const { user } = useAuth();
  const { page, pageSize, setPage } = usePagination();

  const recommendationsQuery = useQuery({
    queryKey: ["recommendations", user?.id],
    queryFn: () => getRecommendations(user!.id),
    enabled: Boolean(user),
  });

  const paginated = useMemo(() => {
    if (!recommendationsQuery.data) {
      return null;
    }
    return paginateArray(recommendationsQuery.data, page, pageSize);
  }, [recommendationsQuery.data, page, pageSize]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Espace personnel"
        title="Recommandations"
        description="Suggestions personnalisees basees sur l'historique d'emprunts et le modele ML."
      />

      {recommendationsQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
        </div>
      ) : null}

      {recommendationsQuery.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Service indisponible</AlertTitle>
          <AlertDescription>
            Les recommandations sont indisponibles ou le modele ML n&apos;est pas charge.
          </AlertDescription>
        </Alert>
      ) : null}

      {paginated && paginated.items.length === 0 ? (
        <Alert>
          <AlertDescription>Aucune recommandation pour le moment.</AlertDescription>
        </Alert>
      ) : null}

      {paginated && paginated.items.length > 0 ? (
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
          <div className="grid gap-4 md:grid-cols-2">
            {paginated.items.map((book) => (
              <Card key={book.id} className="border-border/80">
                <CardHeader>
                  <CardTitle>{book.titre}</CardTitle>
                  <CardDescription>{book.auteur}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{book.categorie || "Sans categorie"}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ListSurface>
      ) : null}
    </div>
  );
}
