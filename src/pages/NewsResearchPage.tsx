import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Newspaper, Search, ArrowRight, Loader2, Calendar, Tag, Clock } from 'lucide-react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import SeoHead from '@/components/cms/SeoHead';
import { Input } from '@/components/ui/input';
import { useLegalDocuments, useLegalCategories } from '@/hooks/cms/useLegalDocs';
import { useLocale, useLocaleField } from '@/hooks/cms/useLocaleField';
import headerImage from '@/assets/header-publications.jpg';

const FeaturedCard = ({ doc, categories }: any) => {
  const locale = useLocale();
  const { t } = useTranslation();
  const title = useLocaleField(doc, 'title', doc.title || '');
  const summary = useLocaleField(doc, 'summary', doc.summary || doc.description || '');
  const category = categories.find((c: any) => c.id === doc.category_id);
  const catName = category ? (category[`name_${locale}`] || category.name_en || category.name) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-card border border-border shadow-card hover:shadow-gold/20 hover:border-gold/30 transition-all duration-300 mb-10"
    >
      <Link to={`/news-research/${doc.slug}`} className="grid grid-cols-1 md:grid-cols-2 gap-0 group">
        <div className="relative aspect-[16/10] md:aspect-auto md:h-full min-h-[240px] bg-gradient-to-br from-primary/20 to-gold/10 flex items-center justify-center overflow-hidden">
          {doc.thumbnail_url ? (
            <img
              src={doc.thumbnail_url}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <Newspaper size={72} className="text-gold/30" strokeWidth={1} />
          )}
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold text-accent-foreground text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
              {t('news_research.featured')}
            </span>
          </div>
        </div>
        <div className="p-6 lg:p-10 flex flex-col justify-center">
          {catName && (
            <span className="text-xs font-semibold uppercase tracking-wider text-gold inline-flex items-center gap-1.5 mb-3">
              <Tag size={12} /> {catName}
            </span>
          )}
          <h2 className="font-heading text-xl lg:text-3xl font-bold text-foreground leading-tight line-clamp-3 group-hover:text-gold transition-colors duration-300">
            {title}
          </h2>
          {summary && (
            <p className="text-muted-foreground mt-4 line-clamp-3 text-sm lg:text-base leading-relaxed">
              {summary}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-5">
            {doc.published_at && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={14} /> {new Date(doc.published_at).toLocaleDateString()}
              </span>
            )}
            {doc.reading_time && (
              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} /> {t('news_research.read_min', { n: doc.reading_time })}
              </span>
            )}
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-gold mt-5 group-hover:gap-3 transition-all duration-300">
            {t('news_research.read_article')} <ArrowRight size={16} />
          </span>
        </div>
      </Link>
    </motion.div>
  );
};

const ArticleCard = ({ doc, categories }: any) => {
  const locale = useLocale();
  const { t } = useTranslation();
  const title = useLocaleField(doc, 'title', doc.title || '');
  const summary = useLocaleField(doc, 'summary', doc.summary || doc.description || '');
  const category = categories.find((c: any) => c.id === doc.category_id);
  const catName = category ? (category[`name_${locale}`] || category.name_en || category.name) : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.4 }}
      className="group bg-card border border-border rounded-2xl overflow-hidden shadow-soft hover:shadow-card hover:border-gold/30 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
    >
      <Link to={`/news-research/${doc.slug}`} className="flex flex-col h-full">
        <div className="relative aspect-[3/2] bg-gradient-to-br from-primary/10 to-gold/10 flex items-center justify-center overflow-hidden">
          {doc.thumbnail_url ? (
            <img
              src={doc.thumbnail_url}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <Newspaper size={48} className="text-gold/30" strokeWidth={1} />
          )}
        </div>
        <div className="p-5 flex flex-col flex-1">
          {catName && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-gold inline-flex items-center gap-1.5 mb-2">
              <Tag size={11} /> {catName}
            </span>
          )}
          <h3 className="font-heading text-base font-bold text-foreground leading-snug line-clamp-2 group-hover:text-gold transition-colors duration-300">
            {title}
          </h3>
          {summary && (
            <p className="text-sm text-muted-foreground mt-2.5 line-clamp-2 leading-relaxed">
              {summary}
            </p>
          )}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
            {doc.published_at && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar size={12} /> {new Date(doc.published_at).toLocaleDateString()}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {t('news_research.read_article')} <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

const NewsResearchPage = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const { data: categories = [] } = useLegalCategories();
  const { data: items = [], isLoading } = useLegalDocuments({ type: 'news', search, categoryId });

  const featured = items[0];
  const rest = items.slice(1);

  const getCategoryName = (c: any) => {
    return c[`name_${locale}`] || c.name_en || c.name;
  };

  return (
    <Layout>
      <SeoHead
        pageKey="news-research"
        fallbackTitle={t('news_research.title')}
        fallbackDescription={t('news_research.subtitle')}
        canonical="/news-research"
      />
      <PageHeader
        title={t('news_research.title')}
        subtitle={t('news_research.subtitle')}
        image={headerImage}
      />

      <section className="py-12 lg:py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Filters & Search */}
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between mb-12">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategoryId(null)}
                className={`px-4 py-2 text-sm font-medium rounded-full border transition-all duration-200 ${
                  !categoryId
                    ? 'bg-gold text-accent-foreground border-gold shadow-gold'
                    : 'bg-card text-muted-foreground border-border hover:border-gold/40 hover:text-foreground'
                }`}
              >
                {t('news_research.all', 'All')}
              </button>
              {categories.slice(0, 8).map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => setCategoryId(c.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-full border transition-all duration-200 ${
                    categoryId === c.id
                      ? 'bg-gold text-accent-foreground border-gold shadow-gold'
                      : 'bg-card text-muted-foreground border-border hover:border-gold/40 hover:text-foreground'
                  }`}
                >
                  {getCategoryName(c)}
                </button>
              ))}
            </div>
            <div className="relative max-w-sm w-full">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('news_research.search_placeholder', 'Search articles…')}
                className="pl-9 rounded-full border-border focus:border-gold focus:ring-gold/20"
              />
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-gold" size={32} />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <Newspaper size={48} className="text-muted-foreground/30 mx-auto mb-4" strokeWidth={1} />
              <p className="text-muted-foreground text-lg">{t('publications.empty', 'No articles yet.')}</p>
            </div>
          ) : (
            <>
              {featured && <FeaturedCard doc={featured} categories={categories} />}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {rest.map((d: any) => (
                  <ArticleCard key={d.id} doc={d} categories={categories} />
                ))}
              </div>
            </>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5 }}
            className="mt-16 lg:mt-24 p-8 lg:p-12 rounded-2xl bg-gradient-to-br from-primary to-primary/90 text-primary-foreground flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10"
          >
            <div className="flex-1">
              <h3 className="font-heading text-xl lg:text-2xl font-bold">
                {t('news_research.docs_cta_title', 'Looking for ready-to-use legal documents?')}
              </h3>
              <p className="text-primary-foreground/70 text-sm lg:text-base mt-3 max-w-2xl leading-relaxed">
                {t('news_research.docs_cta_desc', 'Browse our marketplace of professional contracts, agreements, and compliance templates.')}
              </p>
            </div>
            <Link
              to="/legal-documents"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-gold text-accent-foreground font-semibold text-sm rounded-lg hover:bg-gold-dark transition-colors shadow-gold shrink-0"
            >
              {t('news_research.docs_cta_btn', 'Open Legal Documents')} <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default NewsResearchPage;