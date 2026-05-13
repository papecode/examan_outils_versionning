import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getDefaultDashboardPath } from "@/lib/roles";

export function RoleHomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={getDefaultDashboardPath(user)} replace />;
}
