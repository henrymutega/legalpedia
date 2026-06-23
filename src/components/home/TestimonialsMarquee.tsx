import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Star, Quote } from 'lucide-react';
import { useTestimonials } from '@/hooks/cms/useServiceContent';

const TestimonialsMarquee = () => {
  const { t } = useTranslation();
  const { testimonials: items } = useTestimonials();
  if (!Array.isArray(items) || items.length === 0) return null;
  const loop = [...items, ...items, ...items];

  const initials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  return (
    <section className="py-20 lg:py-28 bg-primary relative overflow-hidden">
      {/* ambient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-cream/5 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 mb-12 relative">
        <div className="text-center">
          <div className="w-16 h-0.5 bg-gold mx-auto mb-6" />
          <h2 className="font-heading text-3xl lg:text-5xl font-bold text-primary-foreground mb-3">
            {t('home.testimonials_title')}
          </h2>
          <p className="text-primary-foreground/60 max-w-xl mx-auto">
            {t('home.testimonials_subtitle', 'Trusted by enterprises, founders and families across Mongolia and beyond.')}
          </p>
        </div>
      </div>

      <div className="relative group">
        {/* Edge fades */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 lg:w-40 bg-gradient-to-r from-primary to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 lg:w-40 bg-gradient-to-l from-primary to-transparent z-10" />

        <motion.div
          className="flex gap-6 w-max"
          animate={{ x: ['0%', '-33.333%'] }}
          transition={{ duration: 50, ease: 'linear', repeat: Infinity }}
          style={{ animationPlayState: 'running' }}
          whileHover={{ animationPlayState: 'paused' }}
        >
          {loop.map((item, i) => (
            <div
              key={i}
              className="w-[320px] lg:w-[380px] shrink-0 rounded-2xl p-7 bg-navy-light/40 border border-gold/15 backdrop-blur-sm hover:border-gold/40 transition-colors duration-500"
            >
              <Quote size={22} className="text-gold mb-4" />
              <p className="text-primary-foreground/80 text-sm leading-relaxed italic mb-6 line-clamp-5">
                "{item.text}"
              </p>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center font-semibold text-accent-foreground text-sm shadow-gold">
                  {initials(item.name)}
                </div>
                <div>
                  <p className="text-gold font-semibold text-sm leading-tight">{item.name}</p>
                  <p className="text-primary-foreground/50 text-xs">{item.role}</p>
                </div>
              </div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, s) => (
                  <Star key={s} size={12} className="fill-gold text-gold" />
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsMarquee;
