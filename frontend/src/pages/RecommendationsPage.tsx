import { useQuery } from "@tanstack/react-query";
import { getRecommendations } from "@/api/recommendations";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

export function RecommendationsPage() {
  const { user } = useAuth();

  const recommendationsQuery = useQuery({
    queryKey: ["recommendations", user?.id],
    queryFn: () => getRecommendations(user!.id),
    enabled: Boolean(user),
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Espace personnel</p>
        <h1 className="font-heading text-4xl font-semibold">Recommandations</h1>
        <p className="mt-2 text-muted-foreground">
          Suggestions personnalisees basees sur l&apos;historique d&apos;emprunts et le modele ML.
        </p>
      </div>

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

      {recommendationsQuery.data && recommendationsQuery.data.length === 0 ? (
        <Alert>
          <AlertDescription>Aucune recommandation pour le moment.</AlertDescription>
        </Alert>
      ) : null}

      {recommendationsQuery.data && recommendationsQuery.data.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {recommendationsQuery.data.map((book) => (
            <Card key={book.id}>
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
      ) : null}
    </div>
  );
}
