import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, BookOpen, ArrowRight } from 'lucide-react';

const cards = [
  {
    icon: Sparkles,
    titleKey: 'home.floating.ai.title',
    titleFallback: 'AI Legal Assistant',
    descKey: 'home.floating.ai.desc',
    descFallback: 'Intelligent multilingual legal guidance powered by LegalPedia AI.',
    ctaKey: 'home.floating.ai.cta',
    ctaFallback: 'Chat With AI',
    to: '/ai-assistant',
    accent: 'from-gold/30 via-gold/10 to-transparent',
    delay: 0,
  },
  {
    icon: BookOpen,
    titleKey: 'home.floating.services.title',
    titleFallback: 'Legal Services & Publications',
    descKey: 'home.floating.services.desc',
    descFallback: 'Explore legal services, contracts, and professional legal resources.',
    ctaKey: 'home.floating.services.cta',
    ctaFallback: 'Explore Services',
    to: '/services',
    accent: 'from-gold-light/25 via-gold/5 to-transparent',
    delay: 0.3,
  },
];

const HeroFloatingCards = () => {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto px-4 lg:px-8">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-7 max-w-4xl mx-auto">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.15 + c.delay, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
                whileHover={{ y: -14, scale: 1.015 }}
                className="group relative h-full rounded-2xl p-6 lg:p-7 overflow-hidden border border-cream/15 bg-primary/30 backdrop-blur-2xl shadow-card hover:shadow-gold transition-shadow duration-700"
              >
                {/* gradient accent */}
                <div className={`absolute inset-0 bg-gradient-to-br ${c.accent} opacity-70 pointer-events-none`} />
                {/* hover glow */}
                <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gold/25 blur-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
                {/* glass top highlight */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cream/40 to-transparent" />

                <div className="relative w-12 h-12 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold mb-5 shadow-gold">
                  <Icon size={22} />
                </div>
                <h3 className="relative font-heading text-xl font-semibold text-cream mb-2 leading-tight">
                  {t(c.titleKey, c.titleFallback)}
                </h3>
                <p className="relative text-cream/75 text-sm leading-relaxed mb-5">
                  {t(c.descKey, c.descFallback)}
                </p>
                <Link
                  to={c.to}
                  className="relative inline-flex items-center gap-1.5 text-gold text-sm font-semibold tracking-wide group-hover:gap-3 transition-all"
                >
                  {t(c.ctaKey, c.ctaFallback)}
                  <ArrowRight size={14} />
                </Link>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default HeroFloatingCards;
