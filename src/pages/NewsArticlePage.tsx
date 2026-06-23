import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Loader2, Tag } from 'lucide-react';
import Layout from '@/components/Layout';
import SeoHead from '@/components/cms/SeoHead';
import { useLegalDocumentBySlug, useLegalCategories } from '@/hooks/cms/useLegalDocs';
import { useLocale, useLocaleField } from '@/hooks/cms/useLocaleField';
import { generateHTML } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExt from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { useMemo } from 'react';

const renderTipTap = (doc: any): string => {
  if (!doc || typeof doc !== 'object') return '';
  try {
    return generateHTML(doc, [StarterKit, LinkExt, Image]);
  } catch {
    return '';
  }
};

const NewsArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const locale = useLocale();
  const { data: doc, isLoading } = useLegalDocumentBySlug(slug);
  const { data: categories = [] } = useLegalCategories();

  const title = useLocaleField(doc, 'title', doc?.title || '');
  const summary = useLocaleField(doc, 'summary', doc?.summary || '');
  const bodyKey = `content_${locale}` as const;
  const fallbackKey = doc ? (doc[bodyKey] ? bodyKey : 'content_en') : 'content_en';
  const html = useMemo(() => (doc ? renderTipTap((doc as any)[fallbackKey]) : ''), [doc, fallbackKey]);
  const category = doc ? categories.find((c: any) => c.id === doc.category_id) : null;

  if (isLoading) {
    return <Layout><div className="container mx-auto px-4 py-20"><Loader2 className="mx-auto animate-spin text-gold" /></div></Layout>;
  }
  if (!doc) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">{t('news_research.not_found', 'Article not found.')}</p>
          <Link to="/news-research" className="text-gold underline mt-3 inline-block">{t('news_research.back', 'Back to News & Research')}</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SeoHead
        pageKey={`news-${doc.slug}`}
        fallbackTitle={doc.meta_title || title}
        fallbackDescription={doc.meta_description || summary || doc.description || ''}
        canonical={`/news-research/${doc.slug}`}
      />
      <article className="bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl py-12 lg:py-16">
          <Link to="/news-research" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold mb-6 transition-colors">
            <ArrowLeft size={15} /> {t('news_research.back', 'Back to News & Research')}
          </Link>

          {category && (
            <Link to="/news-research" className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-gold font-semibold">
              <Tag size={11} /> {(category as any)[`name_${locale}`] || category.name_en || category.name}
            </Link>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-3xl lg:text-5xl font-bold text-foreground mt-3 leading-tight"
          >
            {title}
          </motion.h1>

          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-4">
            {doc.published_at && (
              <span className="inline-flex items-center gap-1"><Calendar size={12} /> {new Date(doc.published_at).toLocaleDateString()}</span>
            )}
          </div>

          {summary && <p className="text-lg text-muted-foreground mt-6 leading-relaxed">{summary}</p>}

          {doc.thumbnail_url && (
            <img src={doc.thumbnail_url} alt={title} className="w-full rounded-xl mt-8 shadow-soft" />
          )}

          {html ? (
            <div
              className="prose prose-lg dark:prose-invert max-w-none mt-8"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <p className="text-muted-foreground italic mt-8">{t('news_research.no_content', 'No content for this article yet.')}</p>
          )}

          {doc.keywords && doc.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-border">
              {doc.keywords.map((k: string) => (
                <span key={k} className="px-3 py-1 bg-muted text-xs rounded-full text-muted-foreground">#{k}</span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Layout>
  );
};

export default NewsArticlePage;
