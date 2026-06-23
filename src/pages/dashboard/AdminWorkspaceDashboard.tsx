import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import { useStaffCases, assignCase, CASE_STATUSES, STATUS_TONE } from '@/hooks/useStaffCases';
import { useStaffDirectory } from '@/hooks/useStaffDirectory';
import { useToast } from '@/hooks/use-toast';
import { Briefcase, Users, AlertTriangle, ListChecks, Search, FileUp, MessageSquare, FileText, UserPlus } from 'lucide-react';

const AdminWorkspaceDashboard = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { cases, files, comments, loading } = useStaffCases();
  const { staff } = useStaffDirectory(['lawyer', 'admin', 'super_admin']);
  const lawyers = staff.filter(s => s.role === 'lawyer');

  const handleAssign = async (caseId: string, lawyerId: string) => {
    if (!lawyerId) return;
    const { error } = await assignCase(caseId, lawyerId);
    if (error) toast({ title: t('dashboard.could_not_claim'), description: error.message, variant: 'destructive' });
    else toast({ title: String(t('dashboard.case_assigned', 'Case assigned')) });
  };

  const nameOf = (id: string | null) => {
    if (!id) return t('dashboard.unassigned');
    const m = staff.find(s => s.user_id === id);
    return m?.display_name || m?.email || t('roles.staff');
  };

  const [statusFilter, setStatusFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return cases.filter(c => {
      if (statusFilter && c.status !== statusFilter) return false;
      if (assigneeFilter === '__unassigned__' && c.assigned_lawyer_id) return false;
      else if (assigneeFilter && assigneeFilter !== '__unassigned__' && c.assigned_lawyer_id !== assigneeFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!c.title.toLowerCase().includes(q) && !(c.description?.toLowerCase().includes(q) ?? false)) return false;
      }
      return true;
    });
  }, [cases, statusFilter, assigneeFilter, search]);

  const stats = useMemo(() => ({
    total: cases.length,
    unassigned: cases.filter(c => !c.assigned_lawyer_id).length,
    review: cases.filter(c => c.status === 'under_review').length,
    completed: cases.filter(c => c.status === 'completed').length,
  }), [cases]);

  const workload = useMemo(() => {
    const map = new Map<string, number>();
    cases.forEach(c => {
      if (c.assigned_lawyer_id && c.status !== 'completed') {
        map.set(c.assigned_lawyer_id, (map.get(c.assigned_lawyer_id) || 0) + 1);
      }
    });
    // include all lawyers, even with 0 active
    lawyers.forEach(l => { if (!map.has(l.user_id)) map.set(l.user_id, 0); });
    return Array.from(map.entries())
      .map(([uid, count]) => ({ uid, name: nameOf(uid), count }))
      .sort((a, b) => b.count - a.count);
  }, [cases, lawyers, staff]);

  const filesByCase = useMemo(() => {
    const m = new Map<string, number>();
    files.forEach(f => m.set(f.case_id, (m.get(f.case_id) || 0) + 1));
    return m;
  }, [files]);

  const cards = [
    { label: String(t('dashboard.total_cases')), value: stats.total, icon: Briefcase, tone: 'blue' as const },
    { label: String(t('dashboard.active_lawyers')), value: lawyers.length, icon: Users, tone: 'slate' as const },
    { label: String(t('dashboard.unassigned')), value: stats.unassigned, icon: AlertTriangle, tone: 'amber' as const },
    { label: String(t('dashboard.under_review')), value: stats.review, icon: ListChecks, tone: 'purple' as const },
  ];

  const maxLoad = Math.max(1, ...workload.map(w => w.count));

  return (
    <DashboardLayout
      title={String(t('dashboard.operations'))}
      subtitle={String(t('dashboard.operations_subtitle'))}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map(c => <StatCard key={c.label} {...c} />)}
        </div>

        {/* Pending Assignment — highest priority */}
        <div className="bg-card border border-border rounded-lg p-5 mb-8">
          <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
            <UserPlus size={18} className="text-gold" />
            {String(t('dashboard.pending_assignment', 'Pending Assignment'))}
            <span className="text-xs font-normal text-muted-foreground">
              ({cases.filter(c => !c.assigned_lawyer_id).length})
            </span>
          </h2>
          {cases.filter(c => !c.assigned_lawyer_id).length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              {String(t('dashboard.no_pending_assignment', 'No new cases awaiting assignment.'))}
            </p>
          ) : (
            <div className="divide-y divide-border -mx-5">
              {cases
                .filter(c => !c.assigned_lawyer_id)
                .slice(0, 8)
                .map(c => (
                  <div key={c.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <Link to={`/dashboard/cases/${c.id}`} className="font-medium text-foreground hover:text-gold line-clamp-1">
                        {c.title}
                      </Link>
                      <p className="text-[11px] text-muted-foreground">
                        {nameOf(c.client_id)} · {String(t(`category.${c.category}`, { defaultValue: c.category.replace('_', ' ') }))} · {new Date(c.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <select
                      defaultValue=""
                      onChange={e => handleAssign(c.id, e.target.value)}
                      className="px-3 py-1.5 bg-background border border-border rounded-md text-sm"
                    >
                      <option value="" disabled>
                        {String(t('dashboard.assign_to_lawyer', 'Assign to lawyer…'))}
                      </option>
                      {lawyers.map(l => (
                        <option key={l.user_id} value={l.user_id}>
                          {l.display_name || l.email}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Lawyer workload */}
          <div className="lg:col-span-2 bg-card border border-border rounded-lg p-5">
            <h2 className="font-heading text-lg font-semibold mb-4">{t('dashboard.lawyer_workload')}</h2>
            {workload.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('dashboard.no_lawyers')}</p>
            ) : (
              <div className="space-y-3">
                {workload.map(w => (
                  <div key={w.uid}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{w.name}</span>
                      <span className="text-muted-foreground">{t('dashboard.active_count', { count: w.count })}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gold transition-all" style={{ width: `${(w.count / maxLoad) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status breakdown */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="font-heading text-lg font-semibold mb-4">{t('dashboard.status_breakdown')}</h2>
            <div className="space-y-3">
              {CASE_STATUSES.map(s => {
                const count = cases.filter(c => c.status === s).length;
                const pct = cases.length ? (count / cases.length) * 100 : 0;
                return (
                  <div key={s}>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{String(t(`case_status.${s}`, { defaultValue: s.replace('_', ' ') }))}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="font-heading text-lg font-semibold mb-3 flex items-center gap-2">
              <FileUp size={18} /> {t('dashboard.recent_uploads')}
            </h2>
            <div className="divide-y divide-border -mx-5">
              {files.slice(0, 8).map(f => {
                const c = cases.find(x => x.id === f.case_id);
                return (
                  <Link key={f.id} to={`/dashboard/cases/${f.case_id}`} className="flex items-center justify-between gap-3 px-5 py-2.5 hover:bg-muted/40">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1">{f.filename}</p>
                      <p className="text-[11px] text-muted-foreground">{c?.title} · {nameOf(f.uploaded_by)}</p>
                    </div>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded border bg-muted">{String(t(`file_kind.${f.kind}`, { defaultValue: f.kind }))}</span>
                  </Link>
                );
              })}
              {files.length === 0 && <p className="px-5 py-6 text-sm text-muted-foreground text-center">{t('dashboard.no_uploads')}</p>}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="font-heading text-lg font-semibold mb-3 flex items-center gap-2">
              <MessageSquare size={18} /> {t('dashboard.recent_comments')}
            </h2>
            <div className="divide-y divide-border -mx-5">
              {comments.slice(0, 8).map(cm => {
                const c = cases.find(x => x.id === cm.case_id);
                return (
                  <Link key={cm.id} to={`/dashboard/cases/${cm.case_id}`} className="block px-5 py-2.5 hover:bg-muted/40">
                    <p className="text-sm text-foreground line-clamp-2">{cm.content}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{c?.title} · {nameOf(cm.author_id)}</p>
                  </Link>
                );
              })}
              {comments.length === 0 && <p className="px-5 py-6 text-sm text-muted-foreground text-center">{t('dashboard.no_comments')}</p>}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-4 mb-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('dashboard.search_cases')}
              className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-md text-sm" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-md text-sm">
            <option value="">{t('dashboard.all_statuses')}</option>
            {CASE_STATUSES.map(s => <option key={s} value={s}>{String(t(`case_status.${s}`, { defaultValue: s.replace('_', ' ') }))}</option>)}
          </select>
          <select value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-md text-sm">
            <option value="">{t('dashboard.all_lawyers')}</option>
            <option value="__unassigned__">{t('dashboard.unassigned')}</option>
            {lawyers.map(l => <option key={l.user_id} value={l.user_id}>{l.display_name || l.email}</option>)}
          </select>
        </div>

        {/* Case table */}
        {loading ? (
          <div className="space-y-2">{[0,1,2,3].map(i => <div key={i} className="h-16 bg-muted/40 rounded-lg animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground">{t('dashboard.no_match')}</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">{t('dashboard.case')}</th>
                  <th className="px-4 py-3 font-semibold">{t('cases.status')}</th>
                  <th className="px-4 py-3 font-semibold">{t('dashboard.lawyer')}</th>
                  <th className="px-4 py-3 font-semibold">{t('dashboard.files')}</th>
                  <th className="px-4 py-3 font-semibold">{t('dashboard.updated')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link to={`/dashboard/cases/${c.id}`} className="font-medium text-foreground hover:text-gold">
                        {c.title}
                      </Link>
                      <p className="text-[11px] text-muted-foreground">{String(t(`category.${c.category}`, { defaultValue: c.category.replace('_', ' ') }))}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${STATUS_TONE[c.status] || 'bg-muted'}`}>
                        {String(t(`case_status.${c.status}`, { defaultValue: c.status }))}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{nameOf(c.assigned_lawyer_id)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><FileText size={12} /> {filesByCase.get(c.id) || 0}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(c.updated_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminWorkspaceDashboard;
