import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, User as UserIcon, Home } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import NotificationBell from '@/components/NotificationBell';
import AppSidebar from './AppSidebar';
import GlobalSearch from './GlobalSearch';

interface Props {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

const DashboardLayout = ({ children, title, subtitle, actions }: Props) => {
  const { t } = useTranslation();
  const { profile, signOut } = useAuth();
  const { role } = useUserRole();
  const navigate = useNavigate();

  const initials = (profile?.display_name || profile?.email || 'U')
    .split(/\s+/).map(s => s[0]).join('').slice(0, 2).toUpperCase();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 h-14 bg-primary border-b border-gold/20 flex items-center gap-2 px-3 lg:px-4">
            <SidebarTrigger className="text-primary-foreground hover:text-gold" />
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-primary-foreground/70 hover:text-gold transition-colors"
              aria-label={String(t('nav.home', 'Home'))}
            >
              <Home size={14} /> 
              <span className="hidden md:inline">{String(t('nav.home', 'Home'))}</span>
            </Link>
            <div className="flex-1" />
            <GlobalSearch />
            <LanguageSwitcher />
            <NotificationBell />
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
                    <span className="text-[11px] text-muted-foreground capitalize">{String(t(`roles.${role}`, role))}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                  <UserIcon className="mr-2 h-4 w-4" /> {String(t('nav_dashboard.settings', 'Settings'))}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> {String(t('auth.logout', 'Sign Out'))}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          {(title || subtitle || actions) && (
            <div className="bg-card border-b border-border px-4 lg:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                {title && <h1 className="font-heading text-xl lg:text-2xl font-bold text-foreground truncate">{title}</h1>}
                {subtitle && <p className="text-xs lg:text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
              </div>
              {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
            </div>
          )}

          <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
