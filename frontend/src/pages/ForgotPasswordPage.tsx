import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { requestPasswordReset } from "@/api/auth";
import { ApiError } from "@/api/http";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const confirmationMessage =
  "Si un compte est associe a cette adresse, vous recevrez un email avec les instructions de reinitialisation.";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await requestPasswordReset({ email: email.trim() });
      setSubmitted(true);
      toast.success("Demande enregistree.");
    } catch (err) {
      if (err instanceof ApiError && (err.status === 404 || err.status === 503)) {
        setSubmitted(true);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Impossible d'envoyer la demande pour le moment.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Mot de passe oublie"
      description="Saisissez l'email institutionnel associe a votre compte. La reponse reste volontairement generique."
      footer={
        <p className="text-sm text-muted-foreground">
          <Link to="/connexion" className="text-primary underline-offset-4 hover:underline">
            Retour a la connexion
          </Link>
        </p>
      }
    >
      {submitted ? (
        <Alert>
          <AlertDescription>{confirmationMessage}</AlertDescription>
        </Alert>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email institutionnel</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="prenom.nom@dit.sn"
              required
            />
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Button type="submit" disabled={loading}>
            {loading ? "Envoi..." : "Envoyer les instructions"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
