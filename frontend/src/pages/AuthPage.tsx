import { useState, type FormEvent } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { login } from "@/api/auth";
import { ApiError } from "@/api/http";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { getSafeRedirect } from "@/lib/navigation";

export function AuthPage() {
  const { user, login: saveSession } = useAuth();
  const [searchParams] = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const next = getSafeRedirect(searchParams.get("next"), user);
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
      const session = await login({
        identifier: identifier.trim(),
        password,
      });
      saveSession(session);
      toast.success("Connexion reussie.");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError(
          "Identifiants incorrects ou compte inexistant. Contactez le personnel de la bibliotheque.",
        );
      } else if (err instanceof ApiError && (err.status === 404 || err.status === 503)) {
        setError(
          "Le service d'authentification n'est pas disponible. Reessayez plus tard ou contactez le personnel de la bibliotheque.",
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Connexion impossible pour le moment.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      mode="signIn"
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Mot de passe oublie ?{" "}
          <Link to="/mot-de-passe-oublie" className="text-primary underline-offset-4 hover:underline">
            Reinitialiser par email
          </Link>
        </p>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="identifier">Email ou identifiant</Label>
          <Input
            id="identifier"
            name="identifier"
            autoComplete="username"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="Ex. marie.diop@dit.sn ou 42"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </Button>
      </form>
    </AuthLayout>
  );
}
