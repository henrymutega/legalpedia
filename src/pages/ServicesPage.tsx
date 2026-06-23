import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, LayoutGrid, Check } from 'lucide-react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import SeoHead from '@/components/cms/SeoHead';
import FaqSection from '@/components/cms/FaqSection';
import { useServiceContent } from '@/hooks/cms/useServiceContent';
import headerImage from '@/assets/header-services.jpg';

const ServicesPage = () => {
  const { t } = useTranslation();
  const { services } = useServiceContent();
  const [active, setActive] = useState<string>('all');

  const activeCat = services.find((c) => c.key === active);

  // Build the cards shown in the main panel
  const cards =
    active === 'all'
      ? services.map((c) => ({
          to: `/services/${c.key}`,
          icon: c.icon,
          image: c.image,
          title: c.title,
          line: c.short,
        }))
      : (activeCat?.benefits || []).map((b, i) => ({
          to: `/services/${active}/${activeCat!.benefitSlugs[i]}`,
          icon: activeCat!.icon,
          image: activeCat!.image,
          title: b,
          line: activeCat!.title,
          _k: i,
        }));

  return (
    <Layout>
      <SeoHead pageKey="services" fallbackTitle={t('services.title')} fallbackDescription={t('services.subtitle')} canonical="/services" />
      <PageHeader title={t('services.title')} subtitle={t('services.subtitle')} image={headerImage} />

      <section className="py-12 lg:py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Mobile: horizontal category chips */}
          <div className="lg:hidden -mx-4 px-4 mb-8 flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            <CategoryChip label={t('services.all', 'All Services')} icon={LayoutGrid} active={active === 'all'} onClick={() => setActive('all')} />
            {services.map((c) => (
              <CategoryChip key={c.key} label={c.title} icon={c.icon} active={active === c.key} onClick={() => setActive(c.key)} />
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-3">
                  {t('services.categories', 'Practice Areas')}
                </p>
                <SidebarItem label={t('services.all', 'All Services')} icon={LayoutGrid} active={active === 'all'} onClick={() => setActive('all')} />
                {services.map((c) => (
                  <SidebarItem key={c.key} label={c.title} icon={c.icon} active={active === c.key} onClick={() => setActive(c.key)} />
                ))}
              </div>
            </aside>

            {/* Main panel */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between mb-6">
                <h2 className="font-heading text-2xl lg:text-3xl font-bold text-foreground">
                  {active === 'all' ? t('services.all', 'All Services') : (activeCat?.title || '')}
                </h2>
                <span className="text-sm text-muted-foreground">{cards.length}</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                >
                  {cards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                      <motion.div
                        key={`${active}-${i}`}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: Math.min(i, 6) * 0.05 }}
                      >
                        <Link
                          to={card.to}
                          className="group flex h-full flex-col bg-card border border-border rounded-xl overflow-hidden shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300"
                        >
                          <div className="relative h-36 overflow-hidden">
                            <img
                              src={card.image}
                              alt={card.title}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-primary/40 group-hover:bg-primary/25 transition-colors" />
                            <div className="absolute bottom-3 left-3 w-10 h-10 rounded-lg bg-background/90 backdrop-blur flex items-center justify-center text-gold">
                              <Icon size={20} />
                            </div>
                          </div>
                          <div className="flex flex-1 flex-col p-5">
                            <h3 className="font-heading text-lg font-semibold text-foreground mb-1.5 line-clamp-2">
                              {card.title}
                            </h3>
                            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4">{card.line}</p>
                            <span className="mt-auto inline-flex items-center text-gold text-sm font-medium gap-1 group-hover:gap-2 transition-all">
                              {t('services.learn_more')} <ArrowRight size={14} />
                            </span>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <FaqSection category="services" title={t('services.faq_title')} />
    </Layout>
  );
};

function SidebarItem({ label, icon: Icon, active, onClick }: { label: string; icon: any; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-gold/10 text-gold' : 'text-foreground hover:bg-muted'
      }`}
    >
      <Icon size={18} className={active ? 'text-gold' : 'text-muted-foreground group-hover:text-foreground'} />
      <span className="flex-1 text-left">{label}</span>
      {active && <Check size={15} className="text-gold" />}
    </button>
  );
}

function CategoryChip({ label, icon: Icon, active, onClick }: { label: string; icon: any; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
        active ? 'bg-gold/10 text-gold border-gold/40' : 'text-foreground border-border hover:bg-muted'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

export default ServicesPage;
