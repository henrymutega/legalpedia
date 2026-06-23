import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, FileText, BookOpen, Newspaper, Users, UserCheck, BarChart3,
  HelpCircle, Image as ImageIcon, Globe, Search, Briefcase, ShoppingBag, FolderTree,
  MessageSquareQuote,
} from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface NavItem { to: string; labelKey: string; icon: typeof LayoutDashboard; exact?: boolean }

const OVERVIEW: NavItem[] = [
  { to: '/admin', labelKey: 'admin.nav.overview', icon: LayoutDashboard, exact: true },
];

const CONTENT: NavItem[] = [
  { to: '/admin/pages', labelKey: 'admin.nav.pages', icon: FileText },
  { to: '/admin/publications', labelKey: 'admin.nav.publications', icon: BookOpen },
  { to: '/admin/legal-categories', labelKey: 'admin.nav.doc_categories', icon: FolderTree },
  { to: '/admin/services', labelKey: 'admin.nav.services', icon: Briefcase },
  { to: '/admin/testimonials', labelKey: 'admin.nav.testimonials', icon: MessageSquareQuote },
  { to: '/admin/posts', labelKey: 'admin.nav.blog_news', icon: Newspaper },
  { to: '/admin/team', labelKey: 'admin.nav.team', icon: Users },
  { to: '/admin/faqs', labelKey: 'admin.nav.faqs', icon: HelpCircle },
  { to: '/admin/media', labelKey: 'admin.nav.media', icon: ImageIcon },
];


const SETTINGS: NavItem[] = [
  { to: '/admin/seo', labelKey: 'admin.nav.seo', icon: Search },
  { to: '/admin/analytics', labelKey: 'admin.nav.analytics', icon: BarChart3 },
  { to: '/admin/leads', labelKey: 'admin.nav.leads', icon: UserCheck },
  { to: '/admin/document-payments', labelKey: 'admin.nav.document_payments', icon: ShoppingBag },
  { to: '/admin/users', labelKey: 'admin.nav.users_roles', icon: Users },
];

export const AdminAppSidebar = () => {
  const { t } = useTranslation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { pathname } = useLocation();

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(item.to + '/');

  const renderItem = (item: NavItem) => {
    const label = t(item.labelKey);
    return (
      <SidebarMenuItem key={item.to}>
        <SidebarMenuButton asChild isActive={isActive(item)} tooltip={label}>
          <NavLink to={item.to} end={item.exact} className="flex items-center gap-2">
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-gold/20 bg-primary text-primary-foreground">
      <SidebarHeader className="border-b border-gold/20 bg-primary">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="h-7 w-7 rounded bg-gold/20 text-gold flex items-center justify-center font-bold text-sm shrink-0">
            <Globe className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-heading text-sm font-bold text-primary-foreground tracking-wide truncate">
                LEGALPEDIA
              </span>
              <span className="text-[10px] uppercase tracking-widest text-gold/80">{t('admin.nav.website_cms')}</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-primary">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{OVERVIEW.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-primary-foreground/50">{t('admin.nav.content')}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>{CONTENT.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-primary-foreground/50">{t('admin.nav.site')}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>{SETTINGS.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gold/20 bg-primary">
        {!collapsed && (
          <div className="px-2 py-1.5">
            <LanguageSwitcher />
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={t('admin.nav.legal_operations')}>
              <NavLink to="/dashboard" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{t('admin.nav.legal_operations')}</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminAppSidebar;
