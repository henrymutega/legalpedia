import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, ChevronDown, Newspaper, FileText } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationBell from './NotificationBell';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import logoWhite from '@/assets/legalpedia-logo-white.png';

const Navbar = () => {
  const { t } = useTranslation();
  const { user, profile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);
  const location = useLocation();
  const closeTimer = useRef<number | null>(null);

  const links = [
    { path: '/', label: t('nav.home') },
    { path: '/about', label: t('nav.about') },
    { path: '/services', label: t('nav.services') },
  ];
  const tail = [
    { path: '/ai-assistant', label: t('nav.ai_assistant', 'AI Assistant') },
    { path: '/contact', label: t('nav.contact') },
  ];

  const resources = [
    {
      to: '/news-research',
      title: t('nav.news_research', 'News & Research'),
      desc: t('nav.news_research_desc', 'Insights, articles, legal news and research.'),
      icon: Newspaper,
    },
    {
      to: '/legal-documents',
      title: t('nav.legal_documents', 'Legal Documents'),
      desc: t('nav.legal_documents_desc', 'Browse, preview and purchase ready-to-use legal templates.'),
      icon: FileText,
    },
  ];

  const isResourcesActive = location.pathname.startsWith('/news-research')
    || location.pathname.startsWith('/legal-documents')
    || location.pathname.startsWith('/publications');

  // Close dropdown on route change
  useEffect(() => { setResourcesOpen(false); setMobileResourcesOpen(false); setIsOpen(false); }, [location.pathname]);

  const openResources = () => {
    if (closeTimer.current) { window.clearTimeout(closeTimer.current); closeTimer.current = null; }
    setResourcesOpen(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setResourcesOpen(false), 150);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md border-b border-gold/20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center" aria-label="LegalPedia home">
            <img src={logoWhite} alt="LegalPedia" className="h-40 lg:h-36 w-auto object-contain transition-transform duration-300 hover:scale-105" width={200} height={100} />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium tracking-wide uppercase transition-colors duration-200 ${
                  location.pathname === link.path ? 'text-gold' : 'text-primary-foreground/80 hover:text-gold'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Resources dropdown */}
            <div className="relative" onMouseEnter={openResources} onMouseLeave={scheduleClose}>
              <button
                onClick={() => setResourcesOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={resourcesOpen}
                className={`inline-flex items-center gap-1 text-sm font-medium tracking-wide uppercase transition-colors duration-200 ${
                  isResourcesActive ? 'text-gold' : 'text-primary-foreground/80 hover:text-gold'
                }`}
              >
                {t('nav.resources', 'Resources')}
                <ChevronDown size={14} className={`transition-transform ${resourcesOpen ? 'rotate-180' : ''}`} />
              </button>
              {resourcesOpen && (
                <div
                  role="menu"
                  className="absolute top-full right-0 mt-3 w-[420px] rounded-xl bg-background border border-border shadow-card p-2 animate-fade-in"
                  onMouseEnter={openResources}
                  onMouseLeave={scheduleClose}
                >
                  {resources.map((r) => {
                    const Icon = r.icon;
                    return (
                      <Link
                        key={r.to}
                        to={r.to}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
                      >
                        <span className="shrink-0 mt-0.5 inline-flex items-center justify-center w-9 h-9 rounded-md bg-gold/10 text-gold">
                          <Icon size={18} />
                        </span>
                        <span className="flex-1">
                          <span className="block text-sm font-semibold text-foreground group-hover:text-gold transition-colors">{r.title}</span>
                          <span className="block text-xs text-muted-foreground mt-0.5">{r.desc}</span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {tail.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium tracking-wide uppercase transition-colors duration-200 ${
                  location.pathname === link.path ? 'text-gold' : 'text-primary-foreground/80 hover:text-gold'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <LanguageSwitcher />
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/dashboard" className="text-sm font-medium text-primary-foreground/80 hover:text-gold transition-colors">
                  {t('nav.dashboard', 'Dashboard')}
                </Link>
                <NotificationBell />
                <Avatar className="w-8 h-8">
                  {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile.display_name || ''} />}
                  <AvatarFallback className="bg-gold/20 text-gold text-xs">
                    {(profile?.display_name || 'U')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button onClick={signOut} className="text-primary-foreground/80 hover:text-gold transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 text-sm font-medium text-gold hover:text-gold-light transition-colors">
                <User size={16} />
                {t('nav.login', 'Login')}
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-primary-foreground p-2"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-primary border-t border-gold/20 animate-fade-in">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium tracking-wide uppercase py-2 transition-colors ${
                  location.pathname === link.path ? 'text-gold' : 'text-primary-foreground/80 hover:text-gold'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile resources accordion */}
            <button
              onClick={() => setMobileResourcesOpen((v) => !v)}
              className={`flex items-center justify-between text-sm font-medium tracking-wide uppercase py-2 transition-colors ${
                isResourcesActive ? 'text-gold' : 'text-primary-foreground/80'
              }`}
            >
              <span>{t('nav.resources', 'Resources')}</span>
              <ChevronDown size={14} className={`transition-transform ${mobileResourcesOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobileResourcesOpen && (
              <div className="pl-3 flex flex-col gap-1 border-l border-gold/20 ml-1 mb-1">
                {resources.map((r) => (
                  <Link
                    key={r.to}
                    to={r.to}
                    className="block py-2 text-sm text-primary-foreground/80 hover:text-gold transition-colors"
                  >
                    <span className="font-medium">{r.title}</span>
                    <span className="block text-[11px] text-primary-foreground/50 mt-0.5">{r.desc}</span>
                  </Link>
                ))}
              </div>
            )}

            {tail.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium tracking-wide uppercase py-2 transition-colors ${
                  location.pathname === link.path ? 'text-gold' : 'text-primary-foreground/80 hover:text-gold'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-3 mt-1 border-t border-gold/10 flex flex-col gap-3">
              <LanguageSwitcher />
              {user ? (
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile.display_name || ''} />}
                      <AvatarFallback className="bg-gold/20 text-gold text-xs">
                        {(profile?.display_name || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-primary-foreground/80">{profile?.display_name || profile?.email || 'User'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <NotificationBell />
                    <Link to="/dashboard" className="text-sm text-primary-foreground/80 hover:text-gold">
                      {t('nav.dashboard', 'Dashboard')}
                    </Link>
                    <button
                      onClick={() => { signOut(); setIsOpen(false); }}
                      className="flex items-center gap-1.5 text-sm text-primary-foreground/80 hover:text-gold transition-colors"
                    >
                      <LogOut size={16} />
                      {t('nav.logout', 'Logout')}
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-sm font-medium text-gold hover:text-gold-light transition-colors py-2"
                >
                  <User size={16} />
                  {t('nav.login', 'Login')}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
