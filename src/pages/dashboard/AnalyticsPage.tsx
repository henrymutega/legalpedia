import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import LoadingGrid from '@/components/dashboard/LoadingGrid';
import { Briefcase, ListChecks, Clock, CheckCircle2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';

interface CaseRow { id: string; status: string; category: string; assigned_lawyer_id: string | null; created_at: string; updated_at: string }
interface TaskRow { id: string; status: string; priority: string; assigned_to: string | null; created_at: string }
interface Staff { user_id: string; display_name: string | null; email: string | null }

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#ef4444'];

const AnalyticsPage = () => {
  const { t } = useTranslation();
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [c, t, roles] = await Promise.all([
        supabase.from('cases').select('id, status, category, assigned_lawyer_id, created_at, updated_at'),
        supabase.from('tasks').select('id, status, priority, assigned_to, created_at'),
        supabase.from('user_roles').select('user_id, role').in('role', ['lawyer', 'admin', 'super_admin']),
      ]);
      if (cancelled) return;
      const ids = Array.from(new Set((roles.data || []).map((r: any) => r.user_id)));
      const { data: profs } = await supabase.from('profiles').select('user_id, display_name, email').in('user_id', ids);
      if (cancelled) return;
      setCases((c.data as CaseRow[]) || []);
      setTasks((t.data as TaskRow[]) || []);
      setStaff((profs as Staff[]) || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const stats = useMemo(() => ({
    totalCases: cases.length,
    activeCases: cases.filter(c => c.status !== 'completed').length,
    completedCases: cases.filter(c => c.status === 'completed').length,
    openTasks: tasks.filter(x => x.status !== 'completed').length,
  }), [cases, tasks]);

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

  const workloadData = useMemo(() => {
    const m = new Map<string, number>();
    cases.filter(c => c.assigned_lawyer_id).forEach(c => {
      m.set(c.assigned_lawyer_id!, (m.get(c.assigned_lawyer_id!) || 0) + 1);
    });
    return Array.from(m, ([id, count]) => {
      const s = staff.find(x => x.user_id === id);
      return { name: s?.display_name || s?.email || 'Lawyer', cases: count };
    }).sort((a, b) => b.cases - a.cases).slice(0, 10);
  }, [cases, staff]);

  const trendData = useMemo(() => {
    const m = new Map<string, { date: string; cases: number; tasks: number }>();
    const k = (d: string) => d.slice(0, 10);
    const last30 = new Date(); last30.setDate(last30.getDate() - 30);
    cases.filter(c => new Date(c.created_at) >= last30).forEach(c => {
      const key = k(c.created_at);
      const e = m.get(key) || { date: key, cases: 0, tasks: 0 };
      e.cases++; m.set(key, e);
    });
    tasks.filter(c => new Date(c.created_at) >= last30).forEach(c => {
      const key = k(c.created_at);
      const e = m.get(key) || { date: key, cases: 0, tasks: 0 };
      e.tasks++; m.set(key, e);
    });
    return Array.from(m.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [cases, tasks]);

  return (
    <DashboardLayout
      title={String(t('nav_dashboard.analytics', 'Analytics'))}
      subtitle={String(t('dashboard.operations_subtitle', 'Operations overview'))}
    >
      {loading ? <LoadingGrid rows={4} /> : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={Briefcase} label={String(t('dashboard.total_cases', 'Total Cases'))} value={stats.totalCases} />
            <StatCard icon={Clock} label={String(t('dashboard.active', 'Active'))} value={stats.activeCases} tone="amber" />
            <StatCard icon={CheckCircle2} label={String(t('case_status.completed', 'Completed'))} value={stats.completedCases} tone="emerald" />
            <StatCard icon={ListChecks} label={String(t('dashboard.open_tasks', 'Open Tasks'))} value={stats.openTasks} />
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
            <h3 className="text-sm font-semibold mb-3">{String(t('dashboard.lawyer_workload', 'Lawyer Workload'))}</h3>
            {workloadData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">{String(t('analytics_page.no_assigned', 'No assigned cases yet.'))}</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={workloadData} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip />
                  <Bar dataKey="cases" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3">{String(t('dashboard.last_30', '30-Day Activity'))}</h3>
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
                  <Line type="monotone" dataKey="cases" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="tasks" stroke="hsl(var(--accent))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AnalyticsPage;
