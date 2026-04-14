import { useTranslation } from 'react-i18next';
import { Shield, Scale, Globe, Heart, Quote } from 'lucide-react';

const trustIcons = [
  <Shield size={32} />,
  <Scale size={32} />,
  <Globe size={32} />,
  <Heart size={32} />,
];

const WhyChooseSection = () => {
  const { t } = useTranslation();
  const trustPoints = t('whyChoose.points', { returnObjects: true }) as Array<{ title: string; desc: string }>;
  const quotes = t('whyChoose.quotes', { returnObjects: true }) as Array<{ text: string; author: string; role: string }>;

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="w-16 h-0.5 bg-gold mx-auto mb-6" />
          <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {t('whyChoose.title')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('whyChoose.subtitle')}
          </p>
        </div>

        {/* Trust Points */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {Array.isArray(trustPoints) && trustPoints.map((point, i) => (
            <div
              key={i}
              className="group bg-card border border-border rounded-2xl p-6 text-center shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-gold/10 text-gold flex items-center justify-center mx-auto mb-4 group-hover:bg-gold/20 transition-colors">
                {trustIcons[i]}
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                {point.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {point.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Client Experience Quotes */}
        <div className="max-w-5xl mx-auto">
          <h3 className="font-heading text-2xl font-bold text-foreground text-center mb-8">
            {t('whyChoose.experience_title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.isArray(quotes) && quotes.map((q, i) => (
              <div
                key={i}
                className="bg-primary rounded-2xl p-6 shadow-soft"
              >
                <Quote size={20} className="text-gold mb-3" />
                <p className="text-primary-foreground/85 text-sm leading-relaxed italic mb-4">
                  "{q.text}"
                </p>
                <div className="border-t border-gold/15 pt-3">
                  <p className="text-gold font-semibold text-sm">{q.author}</p>
                  <p className="text-primary-foreground/50 text-xs">{q.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
