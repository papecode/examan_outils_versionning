import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { isStaff } from "@/lib/roles";

export function StaffRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (!isStaff(user)) {
    return <Navigate to="/espace/emprunts" replace />;
  }

  return children;
}
