import { useQuery } from "@tanstack/react-query";
import { getUserById } from "@/api/users";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Espace personnel</p>
        <h1 className="font-heading text-4xl font-semibold">Profil</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations utilisateur</CardTitle>
        </CardHeader>
        <CardContent>
          {profileQuery.isLoading ? <Skeleton className="h-24 w-full" /> : null}
          {profileQuery.isError ? (
            <Alert>
              <AlertDescription>Profil indisponible. Affichage de la session locale.</AlertDescription>
            </Alert>
          ) : null}
          {profile ? (
            <dl className="grid gap-4 md:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">Identifiant</dt>
                <dd className="text-lg font-medium">{profile.id}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Nom</dt>
                <dd className="text-lg font-medium">{profile.nom}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Email</dt>
                <dd className="text-lg font-medium">{profile.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Profil</dt>
                <dd className="text-lg font-medium">{profile.type_utilisateur}</dd>
              </div>
            </dl>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
