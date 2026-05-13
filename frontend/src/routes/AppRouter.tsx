import type { ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useAuth } from "@/hooks/useAuth";
import { AuthPage } from "@/pages/AuthPage";
import { CatalogPage } from "@/pages/CatalogPage";
import { LandingPage } from "@/pages/LandingPage";
import { LoansPage } from "@/pages/LoansPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { RecommendationsPage } from "@/pages/RecommendationsPage";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/connexion?next=${next}`} replace />;
  }

  return children;
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="catalogue" element={<CatalogPage />} />
        <Route path="connexion" element={<AuthPage />} />
      </Route>

      <Route
        path="/espace"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="emprunts" element={<LoansPage />} />
        <Route path="recommandations" element={<RecommendationsPage />} />
        <Route path="profil" element={<ProfilePage />} />
      </Route>

      <Route path="/emprunts" element={<Navigate to="/espace/emprunts" replace />} />
      <Route path="/recommandations" element={<Navigate to="/espace/recommandations" replace />} />
      <Route path="/profil" element={<Navigate to="/espace/profil" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
