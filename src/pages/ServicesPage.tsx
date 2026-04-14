import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Scale, Building2, Shield, Home, Users, Briefcase, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import headerImage from '@/assets/header-services.jpg';

const serviceIcons: Record<string, React.ReactNode> = {
  corporate: <Building2 size={36} />,
  litigation: <Scale size={36} />,
  ip: <Shield size={36} />,
  realestate: <Home size={36} />,
  family: <Users size={36} />,
  employment: <Briefcase size={36} />,
};

const serviceImages: Record<string, string> = {
  corporate: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop',
  litigation: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&h=400&fit=crop',
  ip: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
  realestate: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop',
  family: 'https://images.unsplash.com/photo-1591474200742-8e512e6f98f8?w=600&h=400&fit=crop',
  employment: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&h=400&fit=crop',
};

const ServicesPage = () => {
  const { t } = useTranslation();
  const serviceKeys = ['corporate', 'litigation', 'ip', 'realestate', 'family', 'employment'];

  return (
    <Layout>
      <PageHeader title={t('services.title')} subtitle={t('services.subtitle')} image={headerImage} />

      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceKeys.map((key, i) => (
              <Link
                key={key}
                to={`/services/${key}`}
                className={`group bg-card border border-border rounded-lg overflow-hidden shadow-soft hover:shadow-card transform hover:scale-105 transition-all duration-300 ease-in-out animate-fade-in-up animation-delay-${i % 4}00`}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={serviceImages[key]}
                    alt={t(`services.items.${key}.title`)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-primary/40 group-hover:bg-primary/20 transition-colors duration-300" />
                  <div className="absolute bottom-4 left-4 text-gold group-hover:scale-110 transition-transform">
                    {serviceIcons[key]}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                    {t(`services.items.${key}.title`)}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {t(`services.items.${key}.short`)}
                  </p>
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

export default ServicesPage;
