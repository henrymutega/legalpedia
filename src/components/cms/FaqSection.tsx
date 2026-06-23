import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFaqs } from '@/hooks/cms/useCms';
import { useLocaleField } from '@/hooks/cms/useLocaleField';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface Props {
  category?: string;
  title?: string;
  className?: string;
  limit?: number;
}

const FaqRow = ({ faq }: { faq: any }) => {
  const { t } = useTranslation();
  const q = useLocaleField(faq, 'question', faq.question);
  const a = useLocaleField(faq, 'answer', faq.answer);
  return (
    <AccordionItem value={faq.id}>
      <AccordionTrigger className="text-left font-heading text-base text-foreground hover:no-underline">{q}</AccordionTrigger>
      <AccordionContent className="text-muted-foreground leading-relaxed">
        <p className="whitespace-pre-wrap">{a}</p>
        <Link
          to={`/ai-assistant?q=${encodeURIComponent(q)}`}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:text-gold-dark transition-colors"
        >
          <Sparkles size={15} className="shrink-0" />
          {t('faq.ask_ai', 'Ask our AI for more')}
        </Link>
      </AccordionContent>
    </AccordionItem>
  );
};

const FaqSection = ({ category, title, className, limit }: Props) => {
  const { data, isLoading } = useFaqs(category);
  if (isLoading) return null;
  const faqs = limit ? (data || []).slice(0, limit) : data || [];
  if (faqs.length === 0) return null;

  return (
    <section className={className ?? 'py-16 bg-background border-t border-border'}>
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
        {title && (
          <h2 className="font-heading text-2xl lg:text-3xl font-bold text-foreground mb-8 text-center">{title}</h2>
        )}
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f) => <FaqRow key={f.id} faq={f} />)}
        </Accordion>
      </div>
    </section>
  );
};

export default FaqSection;
