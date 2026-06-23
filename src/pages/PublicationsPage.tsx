import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileText, Newspaper, BookOpen, Loader2, Eye } from 'lucide-react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import SeoHead from '@/components/cms/SeoHead';
import { usePublications } from '@/hooks/cms/useCms';
import { pickLocale, useLocale } from '@/hooks/cms/useLocaleField';
import headerImage from '@/assets/header-publications.jpg';
import { downloadFile } from '@/lib/download-file';
import { toast } from 'sonner';

type Category = 'all' | 'news' | 'legal' | 'research';

const iconMap: Record<string, typeof Newspaper> = {
  news: Newspaper,
  legal: FileText,
  research: BookOpen,
};

const PublicationsPage = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const [filter, setFilter] = useState<Category>('all');
  const [downloading, setDownloading] = useState<string | null>(null);

  const { data: publications, isLoading } = usePublications(filter === 'all' ? undefined : filter);

  const filters: { key: Category; label: string }[] = [
    { key: 'all', label: t('publications.filter_all') },
    { key: 'news', label: t('publications.filter_news') },
    { key: 'legal', label: t('publications.filter_legal') },
    { key: 'research', label: t('publications.filter_research') },
  ];

  const handleDownload = async (fileUrl: string | null, fileName: string) => {
    if (!fileUrl) {
      toast.info(t('publications.no_file', 'This document is not yet available for download.'));
      return;
    }
    setDownloading(fileName);
    try {
      const safeName = fileName.replace(/[^\w.\-]+/g, '_') + '.pdf';
      await downloadFile(fileUrl, safeName, 'publications');
    } catch (error) {
      console.error('Download failed', error);
      toast.error(t('publications.download_error', 'Download failed. Please try again.'));
    } finally {
      setDownloading(null);
    }
  };

  const list = publications || [];

  return (
    <Layout>
      <SeoHead pageKey="publications" fallbackTitle={t('publications.title')} fallbackDescription={t('publications.subtitle')} canonical="/publications" />
      <PageHeader title={t('publications.title')} subtitle={t('publications.subtitle')} image={headerImage} />

      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap gap-3 mb-10 justify-center">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-5 py-2 text-sm font-medium rounded-sm transition-colors ${
                  filter === f.key ? 'bg-gold text-accent-foreground' : 'bg-muted text-muted-foreground hover:bg-gold/10 hover:text-gold'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading…</p>
          ) : list.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">{t('publications.empty', 'No publications available yet.')}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
              {list.map((pub: any, i: number) => {
                const Icon = iconMap[pub.category] || FileText;
                const title = pickLocale(pub, 'title', locale, pub.title);
                return (
                  <div key={pub.id} className={`flex flex-col bg-card border border-border p-6 rounded-lg shadow-soft hover:shadow-card transition-shadow animate-fade-in-up animation-delay-${i % 4}00`}>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-gold/10 shrink-0">
                        <Icon size={22} className="text-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading text-base font-semibold text-foreground leading-snug">{title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground">{pub.date}</span>
                          <span className="text-xs text-gold capitalize font-medium">{pub.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-auto">
                      <button
                        onClick={() => handleDownload(pub.file_url, pub.title)}
                        disabled={downloading === pub.title}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-accent-foreground text-xs font-semibold uppercase rounded-sm hover:bg-gold-dark transition-colors disabled:opacity-50"
                      >
                        {downloading === pub.title ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        {t('publications.download')}
                      </button>
                      {pub.file_url && (
                        <a href={pub.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 border border-border text-xs font-semibold uppercase rounded-sm text-foreground hover:bg-muted transition-colors">
                          <Eye size={14} /> {t('publications.preview')}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default PublicationsPage;
