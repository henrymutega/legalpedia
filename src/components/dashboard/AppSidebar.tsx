import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Briefcase, ListChecks, Bell, Users, BarChart3, Settings, Plus, CalendarClock,
  FileText, MessageSquare, Shield,
} from 'lucide-react';

import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from '@/components/ui/sidebar';
import { useUserRole } from '@/hooks/useUserRole';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface NavItem {
  to: string;
  labelKey: string;
  fallback: string;
  icon: typeof LayoutDashboard;
  staffOnly?: boolean;
  clientOnly?: boolean;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
  exact?: boolean;
}

const PRIMARY: NavItem[] = [
  { to: '/dashboard', labelKey: 'nav_dashboard.overview', fallback: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/dashboard/cases', labelKey: 'nav_dashboard.cases', fallback: 'Cases', icon: Briefcase },
  { to: '/dashboard/tasks', labelKey: 'nav_dashboard.tasks', fallback: 'Tasks', icon: ListChecks, staffOnly: true },
  { to: '/dashboard/my-analytics', labelKey: 'nav_dashboard.my_analytics', fallback: 'My Analytics', icon: BarChart3, clientOnly: true },
  { to: '/dashboard/documents', labelKey: 'nav_dashboard.documents', fallback: 'Documents', icon: FileText },
  { to: '/dashboard/messages', labelKey: 'nav_dashboard.messages', fallback: 'Messages', icon: MessageSquare },
  { to: '/dashboard/appointments', labelKey: 'nav_dashboard.appointments', fallback: 'Appointments', icon: CalendarClock, staffOnly: true },
  { to: '/dashboard/my-appointments', labelKey: 'nav_dashboard.my_appointments', fallback: 'My Appointments', icon: CalendarClock, clientOnly: true },
  { to: '/dashboard/notifications', labelKey: 'nav_dashboard.notifications', fallback: 'Notifications', icon: Bell },
];


const MANAGE: NavItem[] = [
  { to: '/dashboard/team', labelKey: 'nav_dashboard.team', fallback: 'Team', icon: Users, adminOnly: true },
  { to: '/dashboard/analytics', labelKey: 'nav_dashboard.analytics', fallback: 'Analytics', icon: BarChart3, adminOnly: true },
];

const FOOTER: NavItem[] = [
  { to: '/admin', labelKey: 'nav_dashboard.cms', fallback: 'Website CMS', icon: Shield, adminOnly: true },
  { to: '/dashboard/settings', labelKey: 'nav_dashboard.settings', fallback: 'Settings', icon: Settings },
];


export const AppSidebar = () => {
  const { t } = useTranslation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { pathname } = useLocation();
  const { isStaff, isAdmin, isSuperAdmin } = useUserRole();

  const visible = (item: NavItem) => {
    if (item.staffOnly && !isStaff) return false;
    if (item.clientOnly && isStaff) return false;
    if (item.adminOnly && !isAdmin) return false;
    if (item.superAdminOnly && !isSuperAdmin) return false;
    return true;
  };

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(item.to + '/');

  const renderItem = (item: NavItem) => (
    <SidebarMenuItem key={item.to}>
      <SidebarMenuButton asChild isActive={isActive(item)} tooltip={String(t(item.labelKey, item.fallback))}>
        <NavLink to={item.to} end={item.exact} className="flex items-center gap-2">
          <item.icon className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{String(t(item.labelKey, item.fallback))}</span>}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-gold/20 bg-primary text-primary-foreground">
      <SidebarHeader className="border-b border-gold/20 bg-primary">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="h-7 w-7 rounded bg-gold/20 text-gold flex items-center justify-center font-bold text-sm shrink-0">L</div>
          {!collapsed && (
            <span className="font-heading text-base font-bold text-primary-foreground tracking-wide truncate">
              LEGALPEDIA
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-primary">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-primary-foreground/50">{String(t('nav_dashboard.workspace', 'Workspace'))}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>{PRIMARY.filter(visible).map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            {!collapsed && <SidebarGroupLabel className="text-primary-foreground/50">{String(t('nav_dashboard.manage', 'Manage'))}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>{MANAGE.filter(visible).map(renderItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={String(t('dashboard.new_case', 'New Case'))} className="bg-gold/15 text-gold hover:bg-gold/25 hover:text-gold">
                  <NavLink to="/dashboard/new" className="flex items-center gap-2">
                    <Plus className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{String(t('dashboard.new_case', 'New Case'))}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {isStaff && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={String(t('tasks.new_task', 'New Task'))}>
                    <NavLink to="/dashboard/tasks/new" className="flex items-center gap-2">
                      <Plus className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{String(t('tasks.new_task', 'New Task'))}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gold/20 bg-primary">
        {!collapsed && (
          <div className="px-2 py-1.5">
            <LanguageSwitcher />
          </div>
        )}
        <SidebarMenu>{FOOTER.filter(visible).map(renderItem)}</SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
