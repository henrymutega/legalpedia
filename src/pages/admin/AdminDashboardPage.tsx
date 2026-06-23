import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { FileText, BookOpen, Newspaper } from 'lucide-react';

const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const [counts, setCounts] = useState({ services: 0, publications: 0, posts: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      const [s, p, po] = await Promise.all([
        supabase.from('services').select('id', { count: 'exact', head: true }),
        supabase.from('publications').select('id', { count: 'exact', head: true }),
        supabase.from('posts').select('id', { count: 'exact', head: true }),
      ]);
      setCounts({
        services: s.count || 0,
        publications: p.count || 0,
        posts: po.count || 0,
      });
    };
    fetchCounts();
  }, []);

  const stats = [
    { label: t('admin.dashboard.services'), count: counts.services, icon: FileText, color: 'text-blue-500' },
    { label: t('admin.dashboard.publications'), count: counts.publications, icon: BookOpen, color: 'text-green-500' },
    { label: t('admin.dashboard.blog_posts'), count: counts.posts, icon: Newspaper, color: 'text-purple-500' },
  ];

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-muted ${s.color}`}>
                <s.icon size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.count}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-heading text-lg font-semibold text-foreground mb-2">{t('admin.dashboard.welcome_title')}</h2>
        <p className="text-muted-foreground text-sm">{t('admin.dashboard.welcome_desc')}</p>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
