import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUserRole, type UserRole } from "@/hooks/useUserRole";

interface RequireRoleProps {
  roles: UserRole[];
  children: ReactNode;
}

export function RequireRole({ roles, children }: RequireRoleProps) {
  const { role, loading } = useUserRole();
  const location = useLocation();

  if (loading) {
    return <div>Memeriksa akses...</div>;
  }

  if (!role || !roles.includes(role)) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
