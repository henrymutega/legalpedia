import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

import ClientDashboard from './ClientDashboard';
import LawyerDashboard from './LawyerDashboard';
import AdminWorkspaceDashboard from './AdminWorkspaceDashboard';

const DashboardPage = () => {
  const { loading: authLoading } = useAuth();
  const { isAdmin, isLawyer, loading: roleLoading } = useUserRole();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading dashboard…
      </div>
    );
  }

  if (isAdmin) return <AdminWorkspaceDashboard />;
  if (isLawyer) return <LawyerDashboard />;
  return <ClientDashboard />;
};

export default DashboardPage;
