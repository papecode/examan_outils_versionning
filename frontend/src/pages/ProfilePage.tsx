import { useQuery } from "@tanstack/react-query";
import { getUserById } from "@/api/users";
import { LoadingState } from "@/components/LoadingState";
import { StatusMessage } from "@/components/StatusMessage";
import { useAuth } from "@/hooks/useAuth";

export function ProfilePage() {
  const { user } = useAuth();

  const profileQuery = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => getUserById(user!.id),
    enabled: Boolean(user),
  });

  const profile = profileQuery.data ?? user;

  return (
    <section className="card">
      <h2>Profil utilisateur</h2>

      {profileQuery.isLoading ? <LoadingState /> : null}
      {profileQuery.isError ? (
        <StatusMessage tone="error" message="Profil indisponible. Affichage de la session locale." />
      ) : null}

      {profile ? (
        <dl className="profile-grid">
          <div>
            <dt>Identifiant</dt>
            <dd>{profile.id}</dd>
          </div>
          <div>
            <dt>Nom</dt>
            <dd>{profile.nom}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{profile.email}</dd>
          </div>
          <div>
            <dt>Profil</dt>
            <dd>{profile.type_utilisateur}</dd>
          </div>
        </dl>
      ) : null}
    </section>
  );
}
