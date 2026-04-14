import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileText, Newspaper, BookOpen, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import headerImage from '@/assets/header-publications.jpg';
//import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Category = 'all' | 'news' | 'legal' | 'research';

const iconMap: Record<string, typeof Newspaper> = {
  news: Newspaper,
  legal: FileText,
  research: BookOpen,
};

const PublicationsPage = () => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<Category>('all');
  const [downloading, setDownloading] = useState<string | null>(null);

  // Static publications with optional file paths in storage
  const publications = [
    { id: '1', category: 'news' as const, date: '2026-03-15', titleKey: 'Corporate Governance Trends 2026', filePath: null },
    { id: '2', category: 'legal' as const, date: '2026-02-28', titleKey: 'Guide to Intellectual Property Rights', filePath: null },
    { id: '3', category: 'research' as const, date: '2026-02-10', titleKey: 'International Trade Law Analysis', filePath: null },
    { id: '4', category: 'news' as const, date: '2026-01-20', titleKey: 'New Employment Regulations Summary', filePath: null },
    { id: '5', category: 'legal' as const, date: '2025-12-15', titleKey: 'Real Estate Transaction Handbook', filePath: null },
    { id: '6', category: 'research' as const, date: '2025-11-30', titleKey: 'Family Law Reform Study', filePath: null },
  ];

  const filtered = filter === 'all' ? publications : publications.filter((p) => p.category === filter);

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
      // If it's a storage path, get the public URL
      let url = fileUrl;
    //   if (!fileUrl.startsWith('http')) {
    //     const { data } = supabase.storage.from('publications').getPublicUrl(fileUrl);
    //     url = data.publicUrl;
    //   }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName.replace(/\s+/g, '_') + '.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed', error);
      toast.error(t('publications.download_error', 'Download failed. Please try again.'));
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Layout>
      <PageHeader title={t('publications.title')} subtitle={t('publications.subtitle')} image={headerImage} />

      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap gap-3 mb-10 justify-center">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-5 py-2 text-sm font-medium rounded-sm transition-colors ${
                  filter === f.key
                    ? 'bg-gold text-accent-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-gold/10 hover:text-gold'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            {filtered.map((pub, i) => {
              const Icon = iconMap[pub.category] || FileText;
              return (
                <div
                  key={pub.id}
                  className={`flex items-center gap-4 bg-card border border-border p-5 rounded-lg shadow-soft hover:shadow-card transition-shadow animate-fade-in-up animation-delay-${i % 4}00`}
                >
                  <Icon size={24} className="text-gold shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-base font-semibold text-foreground truncate">
                      {pub.titleKey}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">{pub.date}</span>
                      <span className="text-xs text-gold capitalize font-medium">{pub.category}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(pub.filePath, pub.titleKey)}
                    disabled={downloading === pub.titleKey}
                    className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-gold text-accent-foreground text-xs font-semibold uppercase rounded-sm hover:bg-gold-dark transition-colors disabled:opacity-50"
                  >
                    {downloading === pub.titleKey ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Download size={14} />
                    )}
                    {t('publications.download')}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PublicationsPage;
