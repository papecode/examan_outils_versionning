import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { ApiError } from "@/api/http";
import { checkUser, createUser } from "@/api/users";
import { StatusMessage } from "@/components/StatusMessage";
import { useAuth } from "@/hooks/useAuth";

const roles = ["\u00c9tudiant", "Professeur", "Personnel"] as const;

export function AuthPage() {
  const { user, login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [role, setRole] = useState<(typeof roles)[number]>("\u00c9tudiant");
  const [registerMode, setRegisterMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/catalogue" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!registerMode) {
        const existing = await checkUser(identifier.trim());
        login(existing);
        return;
      }

      const created = await createUser({
        nom: identifier.trim(),
        type_utilisateur: role,
      });
      login(created);
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
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Acces bibliotheque</p>
        <h1>Connexion</h1>
        <p className="muted">
          {registerMode
            ? "Nouvel utilisateur : confirmez le profil puis validez."
            : "Entrez votre nom ou votre identifiant numerique."}
        </p>

        <label className="field">
          <span>Nom ou ID</span>
          <input
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="Ex. 1 ou Marie Diop"
            required
          />
        </label>

        {registerMode ? (
          <label className="field">
            <span>Profil</span>
            <select value={role} onChange={(event) => setRole(event.target.value as (typeof roles)[number])}>
              {roles.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {error ? <StatusMessage tone="error" message={error} /> : null}

        <button type="submit" className="button button-primary" disabled={loading}>
          {loading ? "Verification..." : registerMode ? "Creer le compte" : "Acceder a l'espace"}
        </button>
      </form>
    </div>
  );
}
