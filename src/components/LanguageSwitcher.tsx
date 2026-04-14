import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'zh', label: '中文' },
  { code: 'mn', label: 'МН' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  return (
    <div className="flex items-center gap-1">
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
  );
};

export default LanguageSwitcher;
