import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';

const languages = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'zh', label: '中文', name: '中文' },
  { code: 'mn', label: 'МН', name: 'Mongolian' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Desktop: dropdown */}
      <div className="hidden lg:block">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 text-sm font-medium text-primary-foreground/80 hover:text-gold transition-colors px-2 py-1 rounded"
        >
          <Globe size={16} className="text-gold" />
          <span>{currentLang.label}</span>
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-36 rounded-md bg-popover border border-border shadow-lg py-1 animate-fade-in z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  i18n.changeLanguage(lang.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                  i18n.language === lang.code
                    ? 'text-gold bg-gold/10'
                    : 'text-popover-foreground hover:bg-muted'
                }`}
              >
                <span>{lang.name}</span>
                {i18n.language === lang.code && <Check size={14} className="text-gold" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile: inline buttons */}
      <div className="flex items-center gap-1 lg:hidden">
        <Globe size={16} className="text-gold mr-1" />
        {languages.map((lang, i) => (
          <span key={lang.code} className="flex items-center">
            <button
              onClick={() => i18n.changeLanguage(lang.code)}
              className={`text-xs font-medium px-1.5 py-0.5 rounded transition-colors ${
                i18n.language === lang.code
                  ? 'text-gold bg-gold/10'
                  : 'text-primary-foreground/60 hover:text-gold'
              }`}
            >
              {lang.label}
            </button>
            {i < languages.length - 1 && (
              <span className="text-primary-foreground/30 text-xs">|</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;

