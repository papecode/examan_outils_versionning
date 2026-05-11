import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { AuthPage } from "@/pages/AuthPage";
import { CatalogPage } from "@/pages/CatalogPage";
import { LoansPage } from "@/pages/LoansPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { RecommendationsPage } from "@/pages/RecommendationsPage";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/connexion" replace />;
  }
  return children;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/connexion" element={<AuthPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/catalogue" replace />} />
        <Route path="catalogue" element={<CatalogPage />} />
        <Route path="emprunts" element={<LoansPage />} />
        <Route path="recommandations" element={<RecommendationsPage />} />
        <Route path="profil" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/catalogue" replace />} />
    </Routes>
  );
}
