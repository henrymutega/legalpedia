import { type ReactNode, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
//import { supabase } from '@/integrations/supabase/client';
import { LayoutDashboard, FileText, Newspaper, BookOpen, LogOut, Menu, X, BarChart3, UserCheck } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/services', label: 'Services', icon: FileText },
  { path: '/admin/publications', label: 'Publications', icon: BookOpen },
  { path: '/admin/posts', label: 'Blog / News', icon: Newspaper },
  { path: '/admin/leads', label: 'Leads', icon: UserCheck },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     const { data: { session } } = await supabase.auth.getSession();
  //     if (!session) {
  //       navigate('/admin/login');
  //       return;
  //     }
  //     // Check admin role
  //     const { data: roles } = await supabase
  //       .from('user_roles')
  //       .select('role')
  //       .eq('user_id', session.user.id)
  //       .eq('role', 'admin');
  //     if (!roles || roles.length === 0) {
  //       navigate('/admin/login');
  //       return;
  //     }
  //     setLoading(false);
  //   };
  //   checkAuth();

  //   const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
  //     if (event === 'SIGNED_OUT') navigate('/admin/login');
  //   });
  //   return () => subscription.unsubscribe();
  // }, [navigate]);

  // const handleLogout = async () => {
  //   await supabase.auth.signOut();
  //   navigate('/admin/login');
  // };

  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-background">
  //       <p className="text-muted-foreground">Loading...</p>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen flex bg-muted">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-primary transform transition-transform lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gold/20">
          <Link to="/admin" className="font-heading text-lg font-bold text-primary-foreground">
            Admin Panel
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-primary-foreground">
            <X size={20} />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? 'bg-gold/20 text-gold'
                  : 'text-primary-foreground/70 hover:text-gold hover:bg-gold/10'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <button
            //onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-primary-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card border-b border-border flex items-center px-4 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground">
            <Menu size={24} />
          </button>
          <h1 className="font-heading text-lg font-semibold text-foreground">
            {navItems.find(i => i.path === location.pathname)?.label || 'Admin'}
          </h1>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
