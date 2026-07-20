import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useSitePage } from '@/hooks/cms/useCms';
import { useLocale } from '@/hooks/cms/useLocaleField';
import logoWhite from '@/assets/legalpedia-logo-white.png';

const Footer = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { data: page } = useSitePage('footer');
  const content: any = page ? ((page as any)[`content_${locale}`] || page.content) : null;

  const links = [
    { path: '/', label: t('nav.home') },
    { path: '/about', label: t('nav.about') },
    { path: '/services', label: t('nav.services') },
    { path: '/publications', label: t('nav.publications') },
    { path: '/contact', label: t('nav.contact') },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <img src={logoWhite} alt={content?.brand || 'LegalPedia'} className="h-auto w-auto mb-0" width={160} height={64} />
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              {content?.description || t('footer.description')}
            </p>
          </div>

          <div>
            <h4 className="font-heading text-lg font-semibold text-gold mb-4">{t('footer.quick_links')}</h4>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-primary-foreground/70 hover:text-gold transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg font-semibold text-gold mb-4">{t('footer.contact_info')}</h4>
            <ul className="space-y-3">
              {/* <li className="flex items-start gap-3 text-sm text-primary-foreground/70">
                <MapPin size={16} className="text-gold mt-0.5 shrink-0" />
                {content?.address || t('contact.address')}
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/70">
                <Phone size={16} className="text-gold shrink-0" />
                {content?.phone || t('contact.phone')}
              </li> */}
              <li className="flex items-center gap-3 text-sm text-primary-foreground/70">
                <Mail size={16} className="text-gold shrink-0" />
                {content?.email || t('contact.email')}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gold/20 mt-10 pt-6 text-center">
          <p className="text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} {content?.brand || 'LegalPedia'}. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
