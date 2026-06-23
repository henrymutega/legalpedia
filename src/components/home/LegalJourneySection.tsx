import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import imgConfusion from '@/assets/journey-confusion.jpg';
import imgReaching from '@/assets/journey-reaching.jpg';
import imgSupport from '@/assets/journey-support.jpg';
import imgSuccess from '@/assets/journey-success.jpg';

const steps = [
  {
    image: imgConfusion,
    emotionKey: 'home.journey.s1.emotion',
    emotionFallback: 'Overwhelmed',
    titleKey: 'home.journey.s1.title',
    titleFallback: 'Confusion',
    descKey: 'home.journey.s1.desc',
    descFallback: 'A legal challenge appears — uncertainty, pressure and scattered information weigh on the mind.',
    tone: 'from-primary/80 via-primary/30 to-transparent',
  },
  {
    image: imgReaching,
    emotionKey: 'home.journey.s2.emotion',
    emotionFallback: 'Hopeful',
    titleKey: 'home.journey.s2.title',
    titleFallback: 'Reaching Out',
    descKey: 'home.journey.s2.desc',
    descFallback: 'A first call to LegalPedia — the moment hope replaces hesitation.',
    tone: 'from-navy-light/80 via-navy-light/30 to-transparent',
  },
  {
    image: imgSupport,
    emotionKey: 'home.journey.s3.emotion',
    emotionFallback: 'Supported',
    titleKey: 'home.journey.s3.title',
    titleFallback: 'Legal Support',
    descKey: 'home.journey.s3.desc',
    descFallback: 'Experienced counsel listens, advises and stands beside you every step of the way.',
    tone: 'from-gold/70 via-gold/20 to-transparent',
  },
  {
    image: imgSuccess,
    emotionKey: 'home.journey.s4.emotion',
    emotionFallback: 'Relieved',
    titleKey: 'home.journey.s4.title',
    titleFallback: 'Success',
    descKey: 'home.journey.s4.desc',
    descFallback: 'Resolution achieved. Peace of mind, restored confidence, a brighter chapter ahead.',
    tone: 'from-gold-light/70 via-gold/20 to-transparent',
  },
];

const LegalJourneySection = () => {
  const { t } = useTranslation();
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden bg-primary text-cream">
      {/* atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-72 lg:w-96 h-72 lg:h-96 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-72 lg:w-96 h-72 lg:h-96 bg-navy-light/30 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative">
        <div className="text-center mb-12 lg:mb-20 max-w-2xl mx-auto">
          <div className="w-16 h-0.5 bg-gold mx-auto mb-6" />
          <h2 className="font-heading text-3xl lg:text-5xl font-bold mb-4 tracking-tight">
            {t('home.journey.title', 'Your Legal Journey')}
          </h2>
          <p className="text-cream/70 text-base lg:text-lg leading-relaxed">
            {t(
              'home.journey.subtitle',
              'A human story — from the first moment of doubt, to the quiet relief of resolution.'
            )}
          </p>
        </div>

        {/* Compact, gif-like human tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.01 }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative text-center"
            >
              {/* Small circular animated portrait */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                className="relative mx-auto mb-5"
              >
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 mx-auto rounded-full overflow-hidden ring-2 ring-gold/30 shadow-gold group-hover:ring-gold transition-all duration-500">
                  <img
                    src={step.image}
                    alt={t(step.titleKey, step.titleFallback)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.4s] ease-out"
                    loading="lazy"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${step.tone} opacity-50 mix-blend-overlay`} />
                </div>
                {/* step number badge */}
                <span className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-gold text-accent-foreground font-heading font-bold text-sm flex items-center justify-center shadow-gold">
                  {i + 1}
                </span>
              </motion.div>

              {/* Emotion chip */}
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-cream/10 border border-cream/15 text-cream/80 text-[10px] font-semibold tracking-[0.18em] uppercase mb-2">
                {t(step.emotionKey, step.emotionFallback)}
              </span>

              <h3 className="font-heading text-lg lg:text-xl font-bold text-cream mb-1.5 leading-tight">
                {t(step.titleKey, step.titleFallback)}
              </h3>
              <p className="text-cream/70 text-xs lg:text-sm leading-relaxed max-w-[220px] mx-auto">
                {t(step.descKey, step.descFallback)}
              </p>
            </motion.article>
          ))}
        </div>

        <div className="mt-12 lg:mt-16 text-center">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold text-accent-foreground font-semibold text-sm uppercase tracking-wider rounded-sm hover:bg-gold-dark transition-colors shadow-gold"
          >
            {t('home.journey.cta', 'Start Your Journey')}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LegalJourneySection;
