import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Scale, Building2, Shield, Users, Briefcase, Home as HomeIcon, Quote, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';
import UserFlowSection from '@/components/UserFlowSection';
import WhyChooseSection from '@/components/WhyChooseSection';
import hero1 from '@/assets/hero-1.jpg';
import hero2 from '@/assets/hero-2.jpg';
import hero3 from '@/assets/hero-3.jpg';
import serviceCorporate from '@/assets/service-corporate.jpg';
import serviceLitigation from '@/assets/service-litigation.jpg';
import serviceIp from '@/assets/service-ip.jpg';
import serviceRealestate from '@/assets/service-realestate.jpg';
import serviceFamily from '@/assets/service-family.jpg';
import serviceEmployment from '@/assets/service-employment.jpg';

const heroImages = [hero1, hero2, hero3];

const serviceIcons: Record<string, React.ReactNode> = {
  corporate: <Building2 size={28} />,
  litigation: <Scale size={28} />,
  ip: <Shield size={28} />,
  realestate: <HomeIcon size={28} />,
  family: <Users size={28} />,
  employment: <Briefcase size={28} />,
};

const serviceBackgrounds: Record<string, string> = {
  corporate: serviceCorporate,
  litigation: serviceLitigation,
  ip: serviceIp,
  realestate: serviceRealestate,
  family: serviceFamily,
  employment: serviceEmployment,
};

const HomePage = () => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroTexts = [t('hero.slide1'), t('hero.slide2'), t('hero.slide3')];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const serviceKeys = ['corporate', 'litigation', 'ip', 'realestate', 'family', 'employment'];
  const testimonials = t('testimonials', { returnObjects: true }) as Array<{ name: string; role: string; text: string }>;

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[80vh] lg:h-[90vh] overflow-hidden">
        {heroImages.map((img, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" width={1920} height={1080} />
            <div className="absolute inset-0 bg-overlay" />
          </div>
        ))}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl animate-fade-in-up">
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-cream leading-tight mb-6">
                {heroTexts[currentSlide]}
              </h1>
              <p className="text-cream/80 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl">
                {t('hero.subtitle')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/contact" className="inline-flex items-center px-8 py-3.5 bg-gold text-accent-foreground font-semibold text-sm uppercase tracking-wider rounded-sm hover:bg-gold-dark transition-colors shadow-gold">
                  {t('hero.cta_consult')}
                </Link>
                <Link to="/services" className="inline-flex items-center px-8 py-3.5 border-2 border-gold text-gold font-semibold text-sm uppercase tracking-wider rounded-sm hover:bg-gold/10 transition-colors">
                  {t('hero.cta_services')}
                </Link>
              </div>
            </div>
          </div>
        </div>
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-primary/50 text-cream rounded-full hover:bg-primary/70 transition-colors" aria-label="Previous slide">
          <ChevronLeft size={24} />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-primary/50 text-cream rounded-full hover:bg-primary/70 transition-colors" aria-label="Next slide">
          <ChevronRight size={24} />
        </button>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroImages.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} className={`w-3 h-3 rounded-full transition-colors ${i === currentSlide ? 'bg-gold' : 'bg-cream/40'}`} aria-label={`Go to slide ${i + 1}`} />
          ))}
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8 text-center max-w-3xl">
          <div className="w-16 h-0.5 bg-gold mx-auto mb-6" />
          <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-6">
            {t('home.intro_title')}
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {t('home.intro_text')}
          </p>
        </div>
      </section>

      {/* Services Preview with Background Images */}
      <section className="py-16 lg:py-24 bg-muted">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-16 h-0.5 bg-gold mx-auto mb-6" />
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">
              {t('home.services_title')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceKeys.map((key, i) => (
              <Link
                key={key}
                to={`/services/${key}`}
                className={`group relative rounded-lg overflow-hidden shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 h-64 animate-fade-in-up animation-delay-${i % 4}00`}
              >
                <img
                  src={serviceBackgrounds[key]}
                  alt={t(`services.items.${key}.title`)}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  width={640}
                  height={256}
                />
                <div className="absolute inset-0 bg-primary/65 group-hover:bg-primary/75 transition-colors duration-300" />
                <div className="relative h-full flex flex-col justify-end p-6">
                  <div className="text-gold mb-3">
                    {serviceIcons[key]}
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-primary-foreground mb-2">
                    {t(`services.items.${key}.title`)}
                  </h3>
                  <p className="text-primary-foreground/70 text-sm leading-relaxed line-clamp-2">
                    {t(`services.items.${key}.short`)}
                  </p>
                  <span className="inline-flex items-center text-gold text-sm font-medium gap-1 group-hover:gap-2 transition-all mt-3">
                    {t('services.learn_more')} <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <WhyChooseSection />

      {/* User Flow */}
      <UserFlowSection />

      {/* Testimonials */}
      <section className="py-16 lg:py-24 bg-primary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-16 h-0.5 bg-gold mx-auto mb-6" />
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-primary-foreground">
              {t('home.testimonials_title')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.isArray(testimonials) && testimonials.map((item, i) => (
              <div key={i} className={`bg-navy-light/50 border border-gold/10 p-8 rounded-lg animate-fade-in-up animation-delay-${i}00`}>
                <Quote size={24} className="text-gold mb-4" />
                <p className="text-primary-foreground/80 text-sm leading-relaxed mb-6 italic">
                  "{item.text}"
                </p>
                <div>
                  <p className="text-gold font-semibold text-sm">{item.name}</p>
                  <p className="text-primary-foreground/50 text-xs">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
