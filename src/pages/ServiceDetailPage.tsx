import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import Layout from '@/components/Layout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import SeoHead from '@/components/cms/SeoHead';
import FaqSection from '@/components/cms/FaqSection';
import { useServiceContent } from '@/hooks/cms/useServiceContent';

const ServiceDetailPage = () => {
  const { t } = useTranslation();
  const { serviceId, subId } = useParams<{ serviceId: string; subId: string }>();
  const { services, getByKey } = useServiceContent();

  const service = getByKey(serviceId);

  if (!service) {
    return (
      <Layout>
        <div className="py-32 text-center">
          <p className="text-muted-foreground">Service not found.</p>
          <Link to="/services" className="text-gold mt-4 inline-block">← Back to Services</Link>
        </div>
      </Layout>
    );
  }

  // Specific sub-service (a benefit/topic within a practice area).
  // Match against locale-independent slugs so MN/ZH pages resolve correctly.
  const subIndex = subId ? service.benefitSlugs.findIndex((s) => s === subId) : -1;
  const subService = subIndex >= 0 ? service.benefits[subIndex] : undefined;

  if (subId && subService) {
    return (
      <Layout>
        <SeoHead
          pageKey={`services-${service.key}-${subId}`}
          fallbackTitle={`${subService} — ${service.title}`}
          fallbackDescription={t('services.sub_covers_desc', { topic: subService, area: service.title, defaultValue: `${subService} services within ${service.title}.` })}
          canonical={`/services/${service.key}/${subId}`}
        />
        <section className="relative py-20 lg:py-28 overflow-hidden">
          <img src={service.image} alt={subService} className="absolute inset-0 w-full h-full object-cover" width={1920} height={640} />
          <div className="absolute inset-0 bg-primary/70" />
          <div className="relative container mx-auto px-4 lg:px-8">
            <Link to={`/services/${service.key}`} className="inline-flex items-center text-gold text-sm mb-6 hover:gap-2 transition-all gap-1">
              <ArrowLeft size={14} /> {service.title}
            </Link>
            <h1 className="font-heading text-4xl lg:text-5xl font-bold text-primary-foreground">{subService}</h1>
            <p className="text-primary-foreground/70 text-lg mt-4 max-w-2xl">{service.title}</p>
          </div>
        </section>

        <section className="py-16 lg:py-24 bg-background">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-foreground text-lg leading-relaxed mb-8">
              {service.detailIntro || t('services.sub_intro', {
                topic: subService,
                area: service.title,
                defaultValue: `Our ${service.title} team offers dedicated, hands-on support for ${subService}. From your first consultation to final resolution, we translate complex legal requirements into clear, practical steps so you always know where you stand and what happens next.`,
              })}
            </p>
            <p className="text-muted-foreground leading-relaxed mb-10">{service.full || service.short}</p>

            {/* What this service covers */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
                {t('services.sub_overview_title', 'What this service covers')}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {service.detailOverview || t('services.sub_overview', {
                  topic: subService,
                  area: service.title,
                  defaultValue: `${subService} is a core part of our ${service.title} practice. We assess your circumstances, identify risks and opportunities, and prepare the documents, filings, and strategy needed to protect your interests. Whether you are an individual or a business, our advice is tailored to your specific goals and budget.`,
                })}
              </p>
            </div>

            {/* What's included */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
                {t('services.sub_included_title', "What's included")}
              </h2>
              <ul className="grid sm:grid-cols-2 gap-4">
                {(service.detailIncluded.length ? service.detailIncluded : [
                  t('services.sub_inc_1', { topic: subService, defaultValue: `Initial review and assessment of your ${subService} matter` }),
                  t('services.sub_inc_2', { defaultValue: 'Clear, written advice on your rights and options' }),
                  t('services.sub_inc_3', { defaultValue: 'Preparation and review of all required documents' }),
                  t('services.sub_inc_4', { defaultValue: 'Representation and negotiation on your behalf' }),
                  t('services.sub_inc_5', { defaultValue: 'Ongoing updates and direct access to your lawyer' }),
                  t('services.sub_inc_6', { defaultValue: 'Transparent fees agreed before we begin' }),
                ]).map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-foreground">
                    <CheckCircle size={18} className="text-gold shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Our process */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
                {t('services.sub_process_title', 'How we work with you')}
              </h2>
              <ol className="space-y-5">
                {(service.detailProcess.length ? service.detailProcess.map((s) => ({ t: s.title, d: s.desc })) : [
                  { t: t('services.sub_step_1_t', 'Consultation'), d: t('services.sub_step_1_d', { topic: subService, defaultValue: `We listen to your situation, explain how the law applies to ${subService}, and outline the possible routes forward.` }) },
                  { t: t('services.sub_step_2_t', 'Strategy & quote'), d: t('services.sub_step_2_d', { defaultValue: 'We agree a clear plan and transparent fee so there are no surprises.' }) },
                  { t: t('services.sub_step_3_t', 'Action'), d: t('services.sub_step_3_d', { defaultValue: 'We prepare documents, handle filings, and represent you in negotiations or proceedings.' }) },
                  { t: t('services.sub_step_4_t', 'Resolution'), d: t('services.sub_step_4_d', { defaultValue: 'We see your matter through to completion and advise on any next steps.' }) },
                ]).map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex-shrink-0 w-9 h-9 rounded-full bg-gold text-accent-foreground font-semibold flex items-center justify-center">{i + 1}</span>
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-foreground">{step.t}</h3>
                      <p className="text-muted-foreground leading-relaxed">{step.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Why it matters */}
            <div className="bg-primary text-primary-foreground p-8 rounded-lg mb-12">
              <h2 className="font-heading text-2xl font-bold mb-4">
                {t('services.sub_why_title', 'Why it matters')}
              </h2>
              <p className="text-primary-foreground/80 leading-relaxed">
                {service.detailWhy || t('services.sub_why', {
                  topic: subService,
                  area: service.title,
                  defaultValue: `Getting ${subService} right protects you from costly mistakes, delays, and disputes down the line. Our experienced ${service.title} team gives you the confidence that every detail is handled correctly and your interests are fully protected.`,
                })}
              </p>
            </div>

            <div className="bg-muted p-8 rounded-lg mb-10">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-6">{t('services.related', 'Related Services')}</h2>
              <ul className="grid sm:grid-cols-2 gap-3">
                {service.benefits.map((b, i) => ({ b, slug: service.benefitSlugs[i] })).filter(({ b }) => b !== subService).map(({ b, slug }, i) => (
                  <li key={i}>
                    <Link to={`/services/${service.key}/${slug}`} className="flex items-center gap-3 text-foreground hover:text-gold transition-colors">
                      <CheckCircle size={18} className="text-gold shrink-0" />
                      <span>{b}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/contact" className="inline-flex items-center px-8 py-3.5 bg-gold text-accent-foreground font-semibold text-sm uppercase tracking-wider rounded-sm hover:bg-gold-dark transition-colors shadow-gold">
                {t('services.contact_lawyer')}
              </Link>
              <Link to={`/ai-assistant?q=${encodeURIComponent(subService)}`} className="inline-flex items-center gap-1.5 px-8 py-3.5 border border-gold text-gold font-semibold text-sm uppercase tracking-wider rounded-sm hover:bg-gold/10 transition-colors">
                <Sparkles size={15} /> {t('faq.ask_ai', 'Ask our AI for more')}
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  const benefits = service.benefits;
  const faqs = t('services.faqs', { returnObjects: true }) as Array<{ q: string; a: string }>;
  const related = services.filter((s) => s.key !== service.key).slice(0, 3);
  const heroImage = service.image;

  return (
    <Layout>
      <SeoHead pageKey={`services-${service.key}`} fallbackTitle={service.title} fallbackDescription={service.short} canonical={`/services/${service.key}`} />
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <img
          src={heroImage}
          alt={service.title}
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
            {service.title}
          </h1>
          <p className="text-primary-foreground/70 text-lg mt-4 max-w-2xl">
            {service.short}
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <p className="text-foreground text-lg leading-relaxed mb-10">
            {service.full || service.short}
          </p>

          <div className="bg-muted p-8 rounded-lg mb-10">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-6">{t('services.benefits')}</h2>
            <ul className="space-y-3">
              {Array.isArray(benefits) && benefits.map((b, i) => (
                <li key={i}>
                  <Link to={`/services/${service.key}/${service.benefitSlugs[i]}`} className="flex items-center gap-3 text-foreground hover:text-gold transition-colors group">
                    <CheckCircle size={18} className="text-gold shrink-0" />
                    <span className="flex-1">{b}</span>
                    <ArrowRight size={15} className="text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
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

      {/* FAQ — CMS-first, fallback to i18n */}
      <FaqSection category={`services.${serviceId}`} title={t('services.faq_title')} />
      {Array.isArray(faqs) && faqs.length > 0 && (
        <section className="py-16 bg-background border-t border-border">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left font-heading text-base text-foreground hover:no-underline">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    <p className="whitespace-pre-wrap">{f.a}</p>
                    <Link
                      to={`/ai-assistant?q=${encodeURIComponent(f.q)}`}
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:text-gold-dark transition-colors"
                    >
                      <Sparkles size={15} className="shrink-0" />
                      {t('faq.ask_ai', 'Ask our AI for more')}
                    </Link>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}



      {/* Related services */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-8">{t('services.related')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((rel) => (
              <Link
                key={rel.key}
                to={`/services/${rel.key}`}
                className="group relative bg-card rounded-lg shadow-soft hover:shadow-card transition-all overflow-hidden"
              >
                <div className="relative h-32">
                  <img
                    src={rel.image}
                    alt={rel.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width={640}
                    height={200}
                  />
                  <div className="absolute inset-0 bg-primary/50" />
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                    {rel.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3">{rel.short}</p>
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
