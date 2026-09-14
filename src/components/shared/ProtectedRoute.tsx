import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/components/utils/AuthContext";
import { useAuthStore } from "@/stores/authStore";
import { UserRole } from "@/dto/constants/UserRole";
import { roleRoutes } from "@/components/shared/DemoSwitcher";

export function ProtectedRoute({
  roles,
  children,
}: {
  roles?: UserRole[];
  children: ReactNode;
}) {
  const { isAuthenticated, hasRole } = useAuth();
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && roles.length > 0 && !hasRole(...roles)) {
    const userRole = user?.role;
    const fallbackRoute = userRole ? roleRoutes[userRole] : "/login";
    return <Navigate to={fallbackRoute} replace />;
  }

  return <>{children}</>;
}