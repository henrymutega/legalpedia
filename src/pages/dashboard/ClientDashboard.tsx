import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import EmptyState from '@/components/dashboard/EmptyState';
import LoadingGrid from '@/components/dashboard/LoadingGrid';
import { Plus, FileText, Upload, FolderOpen, Phone, Briefcase, Clock, CheckCircle2, AlertCircle, Bell } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  uploaded: 'bg-blue-100 text-blue-700 border-blue-200',
  under_review: 'bg-amber-100 text-amber-800 border-amber-200',
  reviewed: 'bg-purple-100 text-purple-700 border-purple-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const ClientDashboard = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState<any[]>([]);
  const [recentFiles, setRecentFiles] = useState<any[]>([]);
  const [recentComments, setRecentComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const load = async () => {
      const { data: c } = await supabase
        .from('cases')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });
      if (cancelled) return;
      const list = c || [];
      setCases(list);
      const ids = list.map(x => x.id);
      if (ids.length) {
        const [{ data: files }, { data: comments }] = await Promise.all([
          supabase.from('case_files').select('*').in('case_id', ids).order('created_at', { ascending: false }).limit(5),
          supabase.from('case_comments').select('*').in('case_id', ids).order('created_at', { ascending: false }).limit(5),
        ]);
        if (!cancelled) {
          setRecentFiles(files || []);
          setRecentComments(comments || []);
        }
      }
      if (!cancelled) setLoading(false);
    };
    load();

    const ch = supabase
      .channel('client-dash')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases', filter: `client_id=eq.${user.id}` }, load)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'case_files' }, load)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'case_comments' }, load)
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [user]);

  const stats = useMemo(() => {
    const count = (s: string) => cases.filter(c => c.status === s).length;
    return {
      total: cases.length,
      under_review: count('under_review'),
      reviewed: count('reviewed'),
      completed: count('completed'),
    };
  }, [cases]);

  const cards = [
    { label: String(t('dashboard.active_cases')), value: stats.total, icon: Briefcase, tone: 'blue' as const },
    { label: String(t('dashboard.under_review')), value: stats.under_review, icon: Clock, tone: 'amber' as const },
    { label: String(t('dashboard.pending_action')), value: stats.reviewed, icon: AlertCircle, tone: 'purple' as const },
    { label: String(t('dashboard.completed')), value: stats.completed, icon: CheckCircle2, tone: 'emerald' as const },
  ];

  return (
    <DashboardLayout
      title={profile?.display_name ? String(t('dashboard.welcome_name', { name: profile.display_name })) : String(t('dashboard.welcome'))}
      subtitle={String(t('dashboard.subtitle'))}
      actions={
        <button
          onClick={() => navigate('/dashboard/new')}
          className="inline-flex items-center gap-2 px-3 py-2 bg-gold text-accent-foreground font-semibold rounded-md hover:bg-gold-dark transition-colors text-sm"
        >
          <Plus size={16} /> {String(t('dashboard.new_case'))}
        </button>
      }
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map(c => <StatCard key={c.label} {...c} />)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button onClick={() => navigate('/dashboard/new')}
            className="text-left bg-card border border-border rounded-lg p-5 hover:border-gold hover:-translate-y-0.5 transition-all">
            <Upload className="text-gold mb-3" size={22} />
            <p className="font-semibold text-foreground">{String(t('dashboard.upload_document'))}</p>
            <p className="text-xs text-muted-foreground mt-1">{String(t('dashboard.upload_document_desc'))}</p>
          </button>
          <a href="#cases" className="block bg-card border border-border rounded-lg p-5 hover:border-gold hover:-translate-y-0.5 transition-all">
            <FolderOpen className="text-gold mb-3" size={22} />
            <p className="font-semibold text-foreground">{String(t('dashboard.view_my_cases'))}</p>
            <p className="text-xs text-muted-foreground mt-1">{String(t('dashboard.view_my_cases_desc'))}</p>
          </a>
          <Link to="/contact" className="block bg-card border border-border rounded-lg p-5 hover:border-gold hover:-translate-y-0.5 transition-all">
            <Phone className="text-gold mb-3" size={22} />
            <p className="font-semibold text-foreground">{String(t('dashboard.contact_team'))}</p>
            <p className="text-xs text-muted-foreground mt-1">{String(t('dashboard.contact_team_desc'))}</p>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 id="cases" className="font-heading text-lg font-semibold text-foreground mb-3">{String(t('dashboard.my_cases'))}</h2>
            {loading ? (
              <LoadingGrid rows={3} />
            ) : cases.length === 0 ? (
              <EmptyState
                icon={FileText}
                title={String(t('dashboard.no_cases'))}
                description={String(t('dashboard.upload_document_desc'))}
                action={
                  <button onClick={() => navigate('/dashboard/new')} className="inline-flex items-center gap-2 px-3 py-2 bg-gold text-accent-foreground font-semibold rounded-md hover:bg-gold-dark text-sm">
                    <Plus size={16} /> {String(t('dashboard.new_case'))}
                  </button>
                }
              />
            ) : (
              <div className="grid gap-3">
                {cases.map(c => (
                  <Link key={c.id} to={`/dashboard/cases/${c.id}`}
                    className="block bg-card border border-border rounded-lg p-4 hover:border-gold transition-colors">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <h3 className="font-semibold text-foreground">{c.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {String(t(`category.${c.category}`, { defaultValue: c.category.replace('_', ' ') }))} · {new Date(c.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_COLORS[c.status] || 'bg-muted'}`}>
                        {String(t(`case_status.${c.status}`, { defaultValue: c.status.replace('_', ' ') }))}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Bell size={18} /> {String(t('dashboard.recent_activity'))}
            </h2>
            <div className="bg-card border border-border rounded-lg divide-y divide-border">
              {[...recentFiles.map(f => ({ kind: 'file', ...f })), ...recentComments.map(c => ({ kind: 'comment', ...c }))]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 8)
                .map((item: any) => (
                  <Link key={item.kind + item.id} to={`/dashboard/cases/${item.case_id}`}
                    className="block px-4 py-3 hover:bg-muted/40 transition-colors">
                    <p className="text-sm font-medium text-foreground">
                      {item.kind === 'file' ? String(t('cases.uploaded', { count: 1 })) : String(t('dashboard.new_comment'))}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {item.kind === 'file' ? item.filename : item.content}
                    </p>
                    <p className="text-[11px] text-muted-foreground/80 mt-1">{new Date(item.created_at).toLocaleString()}</p>
                  </Link>
                ))}
              {!loading && recentFiles.length === 0 && recentComments.length === 0 && (
                <p className="px-4 py-6 text-sm text-muted-foreground text-center">{String(t('dashboard.no_activity'))}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;
