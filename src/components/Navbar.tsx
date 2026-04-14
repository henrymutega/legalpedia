import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
//import { useAuth } from '@/contexts/AuthContext';
//import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const Navbar = () => {
  const { t } = useTranslation();
  //const { user, profile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links = [
    { path: '/', label: t('nav.home') },
    { path: '/about', label: t('nav.about') },
    { path: '/services', label: t('nav.services') },
    { path: '/publications', label: t('nav.publications') },
    { path: '/contact', label: t('nav.contact') },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md border-b border-gold/20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="font-heading text-xl lg:text-2xl font-bold text-primary-foreground tracking-wide">
            LEGALPEDIA
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium tracking-wide uppercase transition-colors duration-200 ${
                  location.pathname === link.path
                    ? 'text-gold'
                    : 'text-primary-foreground/80 hover:text-gold'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <LanguageSwitcher />
            {/* {user ? (
              <div className="flex items-center gap-3">
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
            )} */}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-primary-foreground p-2"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden bg-primary border-t border-gold/20 animate-fade-in">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`text-sm font-medium tracking-wide uppercase py-2 transition-colors ${
                  location.pathname === link.path
                    ? 'text-gold'
                    : 'text-primary-foreground/80 hover:text-gold'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gold/10 flex flex-col gap-3">
              <LanguageSwitcher />
              {/* {user ? (
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
                  <button
                    onClick={() => { signOut(); setIsOpen(false); }}
                    className="flex items-center gap-1.5 text-sm text-primary-foreground/80 hover:text-gold transition-colors"
                  >
                    <LogOut size={16} />
                    {t('nav.logout', 'Logout')}
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-1.5 text-sm font-medium text-gold hover:text-gold-light transition-colors py-2"
                >
                  <User size={16} />
                  {t('nav.login', 'Login')}
                </Link>
              )} */}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
