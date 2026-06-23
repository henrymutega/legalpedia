import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Users, UserCheck, MessageCircle, FileText, Eye } from 'lucide-react';

interface Analytics {
  totalVisitors: number;
  returningVisitors: number;
  loggedInUsers: number;
  chatInteractions: number;
  totalLeads: number;
  topPages: { page: string; count: number }[];
}

const AdminAnalyticsPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<Analytics>({
    totalVisitors: 0,
    returningVisitors: 0,
    loggedInUsers: 0,
    chatInteractions: 0,
    totalLeads: 0,
    topPages: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [visitors, messages, leads, profiles] = await Promise.all([
        supabase.from('visitors').select('*'),
        supabase.from('messages').select('id', { count: 'exact', head: true }),
        supabase.from('leads').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);

      const allVisitors = visitors.data || [];
      const returning = allVisitors.filter(v => v.first_visit !== v.last_visit);

      // Count pages
      const pageCounts: Record<string, number> = {};
      allVisitors.forEach(v => {
        (v.pages_visited || []).forEach((p: string) => {
          pageCounts[p] = (pageCounts[p] || 0) + 1;
        });
      });
      const topPages = Object.entries(pageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([page, count]) => ({ page, count }));

      setData({
        totalVisitors: allVisitors.length,
        returningVisitors: returning.length,
        loggedInUsers: profiles.count || 0,
        chatInteractions: messages.count || 0,
        totalLeads: leads.count || 0,
        topPages,
      });
      setLoading(false);
    };
    fetch();
  }, []);

  const stats = [
    { label: t('admin.analytics.total_visitors'), value: data.totalVisitors, icon: Users, color: 'text-blue-500' },
    { label: t('admin.analytics.returning_visitors'), value: data.returningVisitors, icon: UserCheck, color: 'text-green-500' },
    { label: t('admin.analytics.registered_users'), value: data.loggedInUsers, icon: Users, color: 'text-purple-500' },
    { label: t('admin.analytics.chat_messages'), value: data.chatInteractions, icon: MessageCircle, color: 'text-orange-500' },
    { label: t('admin.analytics.captured_leads'), value: data.totalLeads, icon: FileText, color: 'text-red-500' },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64 text-muted-foreground">{t('admin.analytics.loading')}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">{t('admin.analytics.title')}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-muted ${s.color}`}>
                <s.icon size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Pages */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Eye size={20} className="text-gold" /> {t('admin.analytics.most_visited')}
        </h2>
        {data.topPages.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t('admin.analytics.no_data')}</p>
        ) : (
          <div className="space-y-3">
            {data.topPages.map((p, i) => (
              <div key={p.page} className="flex items-center justify-between">
                <span className="text-sm text-foreground">
                  <span className="text-muted-foreground mr-2">#{i + 1}</span>
                  {p.page}
                </span>
                <span className="text-sm font-semibold text-gold">{p.count} {t('admin.analytics.visits')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAnalyticsPage;
