import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';
import { useServiceContent, type ServiceVM } from '@/hooks/cms/useServiceContent';

function TiltCard({ item, index }: { item: ServiceVM; index: number }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 150, damping: 18 });
  const sy = useSpring(y, { stiffness: 150, damping: 18 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-8, 8]);
  const Icon = item.icon;
  const [slide, setSlide] = useState(0);
  const images = item.images.length ? item.images : [item.image];
  const captions = item.benefits.length ? item.benefits : [item.short];

  useEffect(() => {
    const id = setInterval(
      () => setSlide((s) => (s + 1) % images.length),
      // stagger each card's timing so they don't flip in unison
      4000,
    );
    return () => clearInterval(id);
  }, [images.length]);

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  // staggered translate for floating uneven layout on desktop
  const offset = index % 2 === 0 ? 'lg:translate-y-0' : 'lg:translate-y-8';

  return (
    <motion.div
      style={{ perspective: 1000 }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.01 }}
      transition={{ duration: 0.6, delay: Math.min(index, 3) * 0.07 }}
      className={`${offset} snap-center shrink-0 w-[78%] sm:w-auto`}
    >
      <Link
        ref={ref}
        to={`/services/${item.key}`}
        onMouseMove={handleMove}
        onMouseLeave={reset}
        className="group block"
      >
        <motion.div
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          className="relative h-72 rounded-2xl overflow-hidden border border-border bg-card shadow-soft hover:shadow-card transition-shadow duration-500"
        >
          {/* background image slider — cycles through category-specific images */}
          <AnimatePresence initial={false} mode="popLayout">
            <motion.img
              key={slide}
              src={images[slide]}
              alt=""
              aria-hidden="true"
              loading="lazy"
              width={800}
              height={600}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 0.9, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ opacity: { duration: 1 }, scale: { duration: 5, ease: 'easeOut' } }}
              className="absolute inset-0 w-full h-full object-cover group-hover:opacity-100 group-hover:scale-110 transition-transform duration-700"
            />
          </AnimatePresence>

          {/* slide indicators */}
          <div className="absolute top-4 right-4 z-20 flex gap-1.5" style={{ transform: 'translateZ(50px)' }}>
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setSlide(i);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === slide ? 'w-5 bg-gold' : 'w-1.5 bg-cream/50 hover:bg-cream/80'}`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
          {/* readability overlay — darker at bottom for text, lighter at top to show image */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-transparent pointer-events-none" />
          {/* ambient glow */}
          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-gold/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          {/* gradient mesh */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 pointer-events-none" />

          <div className="relative h-full flex flex-col p-7" style={{ transform: 'translateZ(40px)' }}>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 6 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="w-14 h-14 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold mb-auto"
            >
              <Icon size={26} />
            </motion.div>

            <div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                {item.title}
              </h3>
              {/* rotating caption synced with the image slider */}
              <div className="h-5 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={slide}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4 }}
                    className="text-gold/90 text-sm font-medium"
                  >
                    {captions[slide % captions.length]}
                  </motion.p>
                </AnimatePresence>
              </div>
              <div className="overflow-hidden">
                <p className="text-muted-foreground text-sm leading-relaxed opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-24 transition-all duration-500">
                  {item.short}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-gold text-sm font-medium mt-3 opacity-70 group-hover:opacity-100 group-hover:gap-3 transition-all">
                {t('services.learn_more')}
                <ArrowUpRight size={14} />
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

const PracticeAreasGrid = () => {
  const { t } = useTranslation();
  const { services } = useServiceContent();
  return (
    <section className="py-20 lg:py-28 bg-background relative overflow-hidden">
      {/* subtle background ornaments */}
      <div className="absolute top-1/3 -left-20 w-72 h-72 rounded-full bg-gold/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative">
        <div className="text-center mb-14">
          <div className="w-16 h-0.5 bg-gold mx-auto mb-6" />
          <h2 className="font-heading text-3xl lg:text-5xl font-bold text-foreground mb-4">
            {t('home.services_title')}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t('home.practice_subtitle', 'Specialized counsel across every domain of modern legal practice.')}
          </p>
        </div>

        {/* Mobile: horizontal snap carousel */}
        <div className="sm:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scrollbar-hide">
          {services.map((it, i) => (
            <TiltCard key={it.key} item={it} index={i} />
          ))}
        </div>

        {/* Desktop/tablet: staggered grid */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {services.map((it, i) => (
            <TiltCard key={it.key} item={it} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PracticeAreasGrid;
