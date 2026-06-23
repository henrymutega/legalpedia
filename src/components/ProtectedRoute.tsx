import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole, UserRole } from '@/hooks/useUserRole';

interface Props {
  children: ReactNode;
  /** Optional minimum role(s). If omitted, any authenticated user is allowed. */
  allow?: UserRole[];
}

const ProtectedRoute = ({ children, allow }: Props) => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const location = useLocation();

  if (authLoading || (user && roleLoading)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allow && !allow.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;