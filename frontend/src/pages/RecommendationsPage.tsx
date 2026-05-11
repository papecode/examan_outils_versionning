import { useQuery } from "@tanstack/react-query";
import { getRecommendations } from "@/api/recommendations";
import { LoadingState } from "@/components/LoadingState";
import { StatusMessage } from "@/components/StatusMessage";
import { useAuth } from "@/hooks/useAuth";

export function RecommendationsPage() {
  const { user } = useAuth();

  const recommendationsQuery = useQuery({
    queryKey: ["recommendations", user?.id],
    queryFn: () => getRecommendations(user!.id),
    enabled: Boolean(user),
  });

  return (
    <section className="card">
      <h2>Recommandations personnalisees</h2>
      <p className="muted">Suggestions basees sur l'historique d'emprunts et le modele ML.</p>

      {recommendationsQuery.isLoading ? <LoadingState label="Calcul des recommandations..." /> : null}

      {recommendationsQuery.isError ? (
        <StatusMessage
          tone="error"
          message="Service de recommandations indisponible ou modele non charge."
        />
      ) : null}

      {recommendationsQuery.data && recommendationsQuery.data.length === 0 ? (
        <StatusMessage tone="info" message="Aucune recommandation pour le moment." />
      ) : null}

      {recommendationsQuery.data && recommendationsQuery.data.length > 0 ? (
        <ul className="reco-list">
          {recommendationsQuery.data.map((book) => (
            <li key={book.id}>
              <strong>{book.titre}</strong>
              <span>{book.auteur}</span>
              <span>{book.categorie}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
