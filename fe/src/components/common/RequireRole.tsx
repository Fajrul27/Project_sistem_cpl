import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUserRole, type UserRole } from "@/hooks/useUserRole";
import { usePermission } from "@/contexts/PermissionContext";

interface RequireRoleProps {
  roles: UserRole[];
  resource?: string;
  action?: string;
  children: ReactNode;
}

export function RequireRole({ roles, resource, action = 'view', children }: RequireRoleProps) {
  const { role, loading: roleLoading } = useUserRole();
  const { can, loading: permLoading } = usePermission();
  const location = useLocation();

  if (roleLoading || permLoading) {
    return <div>Memeriksa akses...</div>;
  }

  // If not logged in, redirect to auth
  if (!role) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // 1. Priority: Resource Permission (Dynamic Check)
  if (resource) {
    if (!can(action, resource)) {
      // If already at dashboard, don't redirect to avoiding loop
      if (location.pathname === '/dashboard') {
        return <div>Anda tidak memiliki akses ke dashboard ini.</div>;
      }
      return <Navigate to="/dashboard" state={{ from: location }} replace />;
    }
  }
  // 2. Fallback: Role Check (Hard Check) - Only if no resource specified
  else if (!roles.includes(role)) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
