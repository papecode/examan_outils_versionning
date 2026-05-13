import { useState, type FormEvent } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ApiError } from "@/api/http";
import { checkUser, createUser } from "@/api/users";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { getSafeRedirect } from "@/lib/navigation";

const roles = ["\u00c9tudiant", "Professeur", "Personnel"] as const;

export function AuthPage() {
  const { user, login } = useAuth();
  const [searchParams] = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [role, setRole] = useState<(typeof roles)[number]>("\u00c9tudiant");
  const [registerMode, setRegisterMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const next = getSafeRedirect(searchParams.get("next"));
  const bookId = searchParams.get("bookId");
  const redirectTarget =
    bookId && next.startsWith("/espace/emprunts") ? `${next}?bookId=${bookId}` : next;

  if (user) {
    return <Navigate to={redirectTarget} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!registerMode) {
        const existing = await checkUser(identifier.trim());
        login(existing);
        toast.success("Connexion reussie.");
        return;
      }

      const created = await createUser({
        nom: identifier.trim(),
        type_utilisateur: role,
      });
      login(created);
      toast.success("Compte cree avec succes.");
    } catch (err) {
      if (err instanceof ApiError && err.status === 404 && !registerMode) {
        setRegisterMode(true);
        setError("Utilisateur introuvable. Choisissez un profil pour creer le compte.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Connexion impossible. Verifiez que le service utilisateurs est demarre.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl justify-center px-4 py-16 md:px-6">
      <Card className="w-full max-w-lg border-primary/20 bg-card/90">
        <CardHeader>
          <CardTitle className="font-heading text-3xl">Connexion</CardTitle>
          <CardDescription>
            {registerMode
              ? "Nouvel utilisateur : confirmez le profil puis validez."
              : "Entrez votre nom ou votre identifiant numerique pour acceder a l'espace emprunt."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="identifier">Nom ou ID</Label>
              <Input
                id="identifier"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="Ex. 1 ou Marie Diop"
                required
              />
            </div>

            {registerMode ? (
              <div className="flex flex-col gap-2">
                <Label>Profil</Label>
                <Select value={role} onValueChange={(value) => setRole(value as (typeof roles)[number])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un profil" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <Button type="submit" disabled={loading}>
              {loading ? "Verification..." : registerMode ? "Creer le compte" : "Acceder a l'espace"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
