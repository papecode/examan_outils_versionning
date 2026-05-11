import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Bibliotheque DIT</p>
          <h1>Bonjour, {user?.nom}</h1>
          <p className="muted">ID utilisateur : {user?.id}</p>
        </div>
        <button type="button" className="button button-danger" onClick={logout}>
          Deconnexion
        </button>
      </header>

      <nav className="app-nav">
        <NavLink to="/catalogue">Catalogue</NavLink>
        <NavLink to="/emprunts">Emprunts</NavLink>
        <NavLink to="/recommandations">Recommandations</NavLink>
        <NavLink to="/profil">Profil</NavLink>
      </nav>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
