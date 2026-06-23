import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import AppointmentForm from '@/components/AppointmentForm';
import SeoHead from '@/components/cms/SeoHead';
import FaqSection from '@/components/cms/FaqSection';
import { useSitePage } from '@/hooks/cms/useCms';
import { pickLocale, useLocale } from '@/hooks/cms/useLocaleField';
import headerImage from '@/assets/header-contact.jpg';

const ContactPage = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { data: page } = useSitePage('contact');
  const content = page ? ((page as any)[`content_${locale}`] || page.content) : null;

  const title = pickLocale(page, 'title', locale, t('contact.title'));

  return (
    <Layout>
      <SeoHead pageKey="contact" fallbackTitle={title} fallbackDescription={t('contact.subtitle')} canonical="/contact" />
      <PageHeader title={title} subtitle={t('contact.subtitle')} image={headerImage} />

      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 max-w-6xl mx-auto">
            <div className="animate-fade-in-up">
              <h2 className="font-heading text-2xl lg:text-3xl font-bold text-foreground mb-2">
                {(content as any)?.appointment_title || t('appointment.section_title', 'Book a Consultation')}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {(content as any)?.appointment_desc || t('appointment.section_desc', 'Tell us about your matter and a member of our team will reach out shortly.')}
              </p>
              <AppointmentForm />
            </div>

            <div className="space-y-8 animate-fade-in-up animation-delay-200">
              <div>
                <h3 className="font-heading text-2xl font-bold text-foreground mb-4">{t('contact.office_title')}</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-foreground"><MapPin size={18} className="text-gold mt-0.5 shrink-0" /><span className="text-sm">{(content as any)?.address || t('contact.address')}</span></li>
                  <li className="flex items-center gap-3 text-foreground"><Phone size={18} className="text-gold shrink-0" /><span className="text-sm">{(content as any)?.phone || t('contact.phone')}</span></li>
                  <li className="flex items-center gap-3 text-foreground"><Mail size={18} className="text-gold shrink-0" /><span className="text-sm">{(content as any)?.email || t('contact.email')}</span></li>
                  <li className="flex items-center gap-3 text-foreground"><Clock size={18} className="text-gold shrink-0" /><span className="text-sm">{(content as any)?.hours || t('contact.hours')}</span></li>
                </ul>
              </div>
              <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center border border-border">
                <span className="text-muted-foreground text-sm">📍 Map</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FaqSection category="contact" title={t('about.faq_title', 'Frequently Asked Questions')} />
    </Layout>
  );
};

export default ContactPage;
