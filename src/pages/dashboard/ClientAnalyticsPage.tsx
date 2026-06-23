import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import LoadingGrid from '@/components/dashboard/LoadingGrid';
import EmptyState from '@/components/dashboard/EmptyState';
import {
  Briefcase, Clock, CheckCircle2, FileText, MessageSquare, Upload, Bell, CalendarClock,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#ef4444'];

interface CaseRow { id: string; title: string; status: string; category: string; created_at: string; updated_at: string; assigned_lawyer_id: string | null }
interface FileRow { id: string; case_id: string; filename: string; kind: string; created_at: string }
interface CommentRow { id: string; case_id: string; content: string; author_id: string; created_at: string }
interface ApptRow { id: string; service: string; status: string; preferred_date: string | null; created_at: string }

const ClientAnalyticsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [files, setFiles] = useState<FileRow[]>([]);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [appts, setAppts] = useState<ApptRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data: c } = await supabase
        .from('cases')
        .select('id, title, status, category, created_at, updated_at, assigned_lawyer_id')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });
      if (cancelled) return;
      const list = (c as CaseRow[]) || [];
      setCases(list);
      const ids = list.map(x => x.id);
      const [f, cm, ap] = await Promise.all([
        ids.length
          ? supabase.from('case_files').select('id, case_id, filename, kind, created_at').in('case_id', ids).order('created_at', { ascending: false })
          : Promise.resolve({ data: [] as any }),
        ids.length
          ? supabase.from('case_comments').select('id, case_id, content, author_id, created_at').in('case_id', ids).order('created_at', { ascending: false })
          : Promise.resolve({ data: [] as any }),
        supabase.from('appointments').select('id, service, status, preferred_date, created_at').eq('email', user.email || '').order('created_at', { ascending: false }),
      ]);
      if (cancelled) return;
      setFiles((f.data as FileRow[]) || []);
      setComments((cm.data as CommentRow[]) || []);
      setAppts((ap.data as ApptRow[]) || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const stats = useMemo(() => ({
    total: cases.length,
    active: cases.filter(c => c.status !== 'completed').length,
    completed: cases.filter(c => c.status === 'completed').length,
    documents: files.length,
  }), [cases, files]);

  const statusData = useMemo(() => {
    const m = new Map<string, number>();
    cases.forEach(c => m.set(c.status, (m.get(c.status) || 0) + 1));
    return Array.from(m, ([name, value]) => ({ name: String(t(`case_status.${name}`, name)), value }));
  }, [cases, t]);

  const categoryData = useMemo(() => {
    const m = new Map<string, number>();
    cases.forEach(c => m.set(c.category, (m.get(c.category) || 0) + 1));
    return Array.from(m, ([name, value]) => ({ name: String(t(`category.${name}`, name)), value }));
  }, [cases, t]);

  const trendData = useMemo(() => {
    const m = new Map<string, { date: string; cases: number; documents: number; messages: number }>();
    const k = (d: string) => d.slice(0, 10);
    const last30 = new Date(); last30.setDate(last30.getDate() - 30);
    const ensure = (key: string) => m.get(key) || { date: key, cases: 0, documents: 0, messages: 0 };
    cases.filter(c => new Date(c.created_at) >= last30).forEach(c => {
      const key = k(c.created_at); const e = ensure(key); e.cases++; m.set(key, e);
    });
    files.filter(c => new Date(c.created_at) >= last30).forEach(c => {
      const key = k(c.created_at); const e = ensure(key); e.documents++; m.set(key, e);
    });
    comments.filter(c => new Date(c.created_at) >= last30).forEach(c => {
      const key = k(c.created_at); const e = ensure(key); e.messages++; m.set(key, e);
    });
    return Array.from(m.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [cases, files, comments]);

  const recent = useMemo(() => {
    const items = [
      ...files.map(f => ({ kind: 'file' as const, id: f.id, case_id: f.case_id, label: f.filename, at: f.created_at })),
      ...comments.map(c => ({ kind: 'comment' as const, id: c.id, case_id: c.case_id, label: c.content, at: c.created_at })),
    ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 8);
    return items;
  }, [files, comments]);

  return (
    <DashboardLayout
      title={String(t('client_analytics.title', 'My Analytics'))}
      subtitle={String(t('client_analytics.subtitle', 'An overview of your cases and interactions'))}
    >
      {loading ? <LoadingGrid rows={4} /> : cases.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={String(t('dashboard.no_cases', 'No cases yet'))}
          description={String(t('client_analytics.empty', 'Start a new case to see your analytics here.'))}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={Briefcase} label={String(t('dashboard.total_cases', 'Total Cases'))} value={stats.total} />
            <StatCard icon={Clock} label={String(t('dashboard.active', 'Active'))} value={stats.active} tone="amber" />
            <StatCard icon={CheckCircle2} label={String(t('case_status.completed', 'Completed'))} value={stats.completed} tone="emerald" />
            <StatCard icon={FileText} label={String(t('client_analytics.documents', 'Documents'))} value={stats.documents} />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-3">{String(t('dashboard.by_status', 'Cases by Status'))}</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={80} label>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-3">{String(t('dashboard.by_category', 'Cases by Category'))}</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3">{String(t('client_analytics.activity_30', '30-Day Activity'))}</h3>
            {trendData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">{String(t('analytics_page.no_activity', 'No recent activity.'))}</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cases" stroke="hsl(var(--primary))" strokeWidth={2} name={String(t('nav_dashboard.cases', 'Cases'))} />
                  <Line type="monotone" dataKey="documents" stroke="hsl(var(--accent))" strokeWidth={2} name={String(t('client_analytics.documents', 'Documents'))} />
                  <Line type="monotone" dataKey="messages" stroke="#3b82f6" strokeWidth={2} name={String(t('nav_dashboard.messages', 'Messages'))} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Bell size={16} /> {String(t('dashboard.recent_activity', 'Recent Activity'))}</h3>
              {recent.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">{String(t('dashboard.no_activity', 'No activity yet.'))}</p>
              ) : (
                <ul className="divide-y divide-border">
                  {recent.map(item => (
                    <li key={item.kind + item.id}>
                      <Link to={`/dashboard/cases/${item.case_id}`} className="block py-2.5 hover:bg-muted/40 -mx-2 px-2 rounded transition-colors">
                        <p className="text-sm font-medium flex items-center gap-2">
                          {item.kind === 'file' ? <Upload size={14} /> : <MessageSquare size={14} />}
                          {item.kind === 'file'
                            ? String(t('client_analytics.uploaded_file', 'Document uploaded'))
                            : String(t('dashboard.new_comment', 'New comment'))}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{item.label}</p>
                        <p className="text-[11px] text-muted-foreground/70 mt-0.5">{new Date(item.at).toLocaleString()}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><CalendarClock size={16} /> {String(t('client_analytics.appointments', 'Your Appointments'))}</h3>
              {appts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">{String(t('client_analytics.no_appts', 'No appointments yet.'))}</p>
              ) : (
                <ul className="divide-y divide-border">
                  {appts.slice(0, 8).map(a => (
                    <li key={a.id} className="py-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">{a.service}</p>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full border border-border bg-muted">{a.status}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {a.preferred_date ? new Date(a.preferred_date).toLocaleDateString() : new Date(a.created_at).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ClientAnalyticsPage;
