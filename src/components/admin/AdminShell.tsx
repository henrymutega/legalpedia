import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, Home, Briefcase } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import AdminAppSidebar from './AdminAppSidebar';

interface Props {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

const titleKeyFromPath = (pathname: string) => {
  const map: Record<string, string> = {
    '/admin': 'admin.nav.overview',
    '/admin/pages': 'admin.nav.pages',
    '/admin/publications': 'admin.nav.publications',
    '/admin/services': 'admin.nav.services',
    '/admin/posts': 'admin.nav.blog_news',
    '/admin/team': 'admin.nav.team',
    '/admin/faqs': 'admin.nav.faqs',
    '/admin/media': 'admin.nav.media',
    '/admin/seo': 'admin.shell.seo_settings',
    '/admin/analytics': 'admin.shell.website_analytics',
    '/admin/leads': 'admin.nav.leads',
    '/admin/users': 'admin.nav.users_roles',
  };
  return map[pathname] || 'admin.shell.admin';
};

const AdminShell = ({ children, title, subtitle, actions }: Props) => {
  const { t } = useTranslation();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        {t('admin.common.loading')}
      </div>
    );
  }
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const initials = (profile?.display_name || profile?.email || 'A')
    .split(/\s+/).map(s => s[0]).join('').slice(0, 2).toUpperCase();

  const heading = title || t(titleKeyFromPath(pathname));

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AdminAppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 h-14 bg-primary border-b border-gold/20 flex items-center gap-2 px-3 lg:px-4">
            <SidebarTrigger className="text-primary-foreground hover:text-gold" />
            <Link
              to="/"
              className="hidden md:inline-flex items-center gap-1.5 text-xs text-primary-foreground/70 hover:text-gold transition-colors"
            >
              <Home size={14} /> {t('admin.shell.view_site')}
            </Link>
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:inline-flex text-primary-foreground/80 hover:text-gold hover:bg-gold/10"
              onClick={() => navigate('/dashboard')}
            >
              <Briefcase className="h-4 w-4 mr-1.5" />
              {t('admin.shell.legal_ops')}
            </Button>
            <LanguageSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full hover:opacity-90 transition-opacity">
                <Avatar className="w-8 h-8 border border-gold/30">
                  {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile.display_name || ''} />}
                  <AvatarFallback className="bg-gold/20 text-gold text-xs font-semibold">{initials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium truncate">{profile?.display_name || profile?.email}</span>
                    <span className="text-[11px] text-muted-foreground">{t('admin.shell.administrator')}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <Briefcase className="mr-2 h-4 w-4" /> {t('admin.nav.legal_operations')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                  <UserIcon className="mr-2 h-4 w-4" /> {t('admin.shell.settings')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> {t('admin.shell.sign_out')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <div className="bg-card border-b border-border px-4 lg:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <h1 className="font-heading text-xl lg:text-2xl font-bold text-foreground truncate">{heading}</h1>
              {subtitle && <p className="text-xs lg:text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
          </div>

          <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminShell;
