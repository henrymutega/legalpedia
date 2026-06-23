import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, FileText, Download, Eye, Star, TrendingUp, Globe, FileType2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import SeoHead from '@/components/cms/SeoHead';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLegalCategories, useLegalDocuments } from '@/hooks/cms/useLegalDocs';
import { useLocaleField, useLocale } from '@/hooks/cms/useLocaleField';
import headerImage from '@/assets/header-publications.jpg';

const formatPrice = (cents: number, currency: string) => {
  if (!cents) return '';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
};

const LegalDocumentsPage = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [sort, setSort] = useState<'newest' | 'popular' | 'price_asc' | 'price_desc'>('newest');

  const { data: categories = [] } = useLegalCategories();
  const { data: docs = [], isLoading } = useLegalDocuments({ categoryId, search, priceFilter, sort });

  const categoryById = useMemo(() => Object.fromEntries(categories.map((c: any) => [c.id, c])), [categories]);

  return (
    <Layout>
      <SeoHead pageKey="legal-documents" fallbackTitle={t('legal_docs.title')} fallbackDescription={t('legal_docs.subtitle')} canonical="/legal-documents" />
      <PageHeader title={t('legal_docs.title')} subtitle={t('legal_docs.subtitle')} image={headerImage} />

      <section className="py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Search + filters bar */}
          <div className="bg-card border border-border rounded-xl shadow-soft p-4 lg:p-5 mb-8 lg:mb-10 sticky top-16 lg:top-20 z-30 backdrop-blur supports-[backdrop-filter]:bg-card/90">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-6 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('legal_docs.search_placeholder')}
                  className="pl-9"
                />
              </div>
              <div className="md:col-span-3">
                <Select value={priceFilter} onValueChange={(v) => setPriceFilter(v as any)}>
                  <SelectTrigger><SelectValue placeholder={t('legal_docs.price')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('legal_docs.price_all')}</SelectItem>
                    <SelectItem value="free">{t('legal_docs.price_free')}</SelectItem>
                    <SelectItem value="paid">{t('legal_docs.price_paid')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-3">
                <Select value={sort} onValueChange={(v) => setSort(v as any)}>
                  <SelectTrigger><SelectValue placeholder={t('legal_docs.sort')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">{t('legal_docs.sort_newest')}</SelectItem>
                    <SelectItem value="popular">{t('legal_docs.sort_popular')}</SelectItem>
                    <SelectItem value="price_asc">{t('legal_docs.sort_price_asc')}</SelectItem>
                    <SelectItem value="price_desc">{t('legal_docs.sort_price_desc')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category chips — horizontally scrollable on mobile */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              <button
                onClick={() => setCategoryId(null)}
                className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  categoryId === null ? 'bg-gold text-accent-foreground border-gold' : 'bg-background text-muted-foreground border-border hover:border-gold/40 hover:text-foreground'
                }`}
              >
                {t('legal_docs.all_categories')}
              </button>
              {categories.map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => setCategoryId(c.id)}
                  className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                    categoryId === c.id ? 'bg-gold text-accent-foreground border-gold' : 'bg-background text-muted-foreground border-border hover:border-gold/40 hover:text-foreground'
                  }`}
                >
                  {c[`name_${locale}`] || c.name_en || c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 rounded-xl bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : docs.length === 0 ? (
            <div className="text-center py-20">
              <Filter className="mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">{t('legal_docs.empty')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {docs.map((d: any, i: number) => (
                <DocCard key={d.id} doc={d} category={categoryById[d.category_id]} index={i} locale={locale} t={t} />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

const DocCard = ({ doc, category, index, locale, t }: any) => {
  const title = useLocaleField(doc, 'title', doc.title);
  const description = useLocaleField(doc, 'description', doc.description || '');
  const navigate = useNavigate();

  return (
    <motion.button
      type="button"
      onClick={() => navigate(`/legal-documents/${doc.id}`)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.01 }}
      transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.04 }}
      className="group text-left bg-card border border-border rounded-xl overflow-hidden shadow-soft hover:shadow-card hover:border-gold/40 transition-all"
    >
      <div className="relative aspect-[16/9] bg-gradient-to-br from-primary/10 to-gold/10 overflow-hidden">
        {doc.thumbnail_url ? (
          <img src={doc.thumbnail_url} alt={title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText size={48} className="text-gold/40" />
          </div>
        )}
        {doc.featured && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-gold text-accent-foreground rounded">
            <Star size={10} /> {t('legal_docs.featured')}
          </span>
        )}
        <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-background/90 text-foreground rounded">
          {doc.is_free || doc.price_cents === 0 ? t('legal_docs.free') : formatPrice(doc.price_cents, doc.currency)}
        </span>
      </div>
      <div className="p-4">
        {category && (
          <span className="text-[10px] uppercase tracking-wider text-gold font-semibold">
            {category[`name_${locale}`] || category.name_en || category.name}
          </span>
        )}
        <h3 className="font-heading text-base font-semibold text-foreground mt-1 line-clamp-2 group-hover:text-gold transition-colors">{title}</h3>
        {description && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{description}</p>}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-3">
          {doc.file_type && <span className="inline-flex items-center gap-1"><FileType2 size={11} /> {doc.file_type.toUpperCase()}</span>}
          {doc.languages?.length > 0 && <span className="inline-flex items-center gap-1"><Globe size={11} /> {doc.languages.join(', ').toUpperCase()}</span>}
          {doc.download_count > 0 && <span className="inline-flex items-center gap-1"><TrendingUp size={11} /> {doc.download_count}</span>}
        </div>
      </div>
    </motion.button>
  );
};

export default LegalDocumentsPage;
