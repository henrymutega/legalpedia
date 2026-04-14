import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';

import serviceCorporate from '@/assets/service-corporate.jpg';
import serviceLitigation from '@/assets/service-litigation.jpg';
import serviceIp from '@/assets/service-ip.jpg';
import serviceRealestate from '@/assets/service-realestate.jpg';
import serviceFamily from '@/assets/service-family.jpg';
import serviceEmployment from '@/assets/service-employment.jpg';

const allServiceKeys = ['corporate', 'litigation', 'ip', 'realestate', 'family', 'employment'];

const serviceImages: Record<string, string> = {
  corporate: serviceCorporate,
  litigation: serviceLitigation,
  ip: serviceIp,
  realestate: serviceRealestate,
  family: serviceFamily,
  employment: serviceEmployment,
};

const ServiceDetailPage = () => {
  const { t } = useTranslation();
  const { serviceId } = useParams<{ serviceId: string }>();

  if (!serviceId || !allServiceKeys.includes(serviceId)) {
    return (
      <Layout>
        <div className="py-32 text-center">
          <p className="text-muted-foreground">Service not found.</p>
          <Link to="/services" className="text-gold mt-4 inline-block">← Back to Services</Link>
        </div>
      </Layout>
    );
  }

  const benefits = t(`services.items.${serviceId}.benefits`, { returnObjects: true }) as string[];
  const relatedKeys = allServiceKeys.filter((k) => k !== serviceId).slice(0, 3);
  const heroImage = serviceImages[serviceId];

  return (
    <Layout>
      {/* Hero with background image */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <img
          src={heroImage}
          alt={t(`services.items.${serviceId}.title`)}
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={640}
        />
        <div className="absolute inset-0 bg-primary/70" />
        <div className="relative container mx-auto px-4 lg:px-8">
          <Link to="/services" className="inline-flex items-center text-gold text-sm mb-6 hover:gap-2 transition-all gap-1">
            <ArrowLeft size={14} /> {t('services.title')}
          </Link>
          <h1 className="font-heading text-4xl lg:text-5xl font-bold text-primary-foreground">
            {t(`services.items.${serviceId}.title`)}
          </h1>
          <p className="text-primary-foreground/70 text-lg mt-4 max-w-2xl">
            {t(`services.items.${serviceId}.short`)}
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <p className="text-foreground text-lg leading-relaxed mb-10">
            {t(`services.items.${serviceId}.full`)}
          </p>

          <div className="bg-muted p-8 rounded-lg mb-10">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-6">{t('services.benefits')}</h2>
            <ul className="space-y-3">
              {Array.isArray(benefits) && benefits.map((b, i) => (
                <li key={i} className="flex items-center gap-3 text-foreground">
                  <CheckCircle size={18} className="text-gold shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <Link
            to="/contact"
            className="inline-flex items-center px-8 py-3.5 bg-gold text-accent-foreground font-semibold text-sm uppercase tracking-wider rounded-sm hover:bg-gold-dark transition-colors shadow-gold"
          >
            {t('services.contact_lawyer')}
          </Link>
        </div>
      </section>

      {/* Related services */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-8">{t('services.related')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedKeys.map((key) => (
              <Link
                key={key}
                to={`/services/${key}`}
                className="group relative bg-card rounded-lg shadow-soft hover:shadow-card transition-all overflow-hidden"
              >
                <div className="relative h-32">
                  <img
                    src={serviceImages[key]}
                    alt={t(`services.items.${key}.title`)}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width={640}
                    height={200}
                  />
                  <div className="absolute inset-0 bg-primary/50" />
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                    {t(`services.items.${key}.title`)}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3">{t(`services.items.${key}.short`)}</p>
                  <span className="inline-flex items-center text-gold text-sm font-medium gap-1 group-hover:gap-2 transition-all">
                    {t('services.learn_more')} <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ServiceDetailPage;
