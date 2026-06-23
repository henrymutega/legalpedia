import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import { useStaffCases, claimCase, CASE_STATUSES, type CaseRow } from '@/hooks/useStaffCases';
import { useStaffDirectory } from '@/hooks/useStaffDirectory';
import { useTasks, claimTask } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';
import { Briefcase, Clock, FileUp, CheckCircle2, Hand, MessageSquare, FileText, ListChecks } from 'lucide-react';

const LawyerDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cases, files, comments, loading } = useStaffCases();
  const { staff } = useStaffDirectory(['lawyer', 'admin', 'super_admin']);
  const { tasks } = useTasks({ assignee: '__unassigned__' }, user?.id);

  const nameOf = (id: string | null | undefined) => {
    if (!id) return '—';
    const m = staff.find(s => s.user_id === id);
    return m?.display_name || m?.email || 'Lawyer';
  };

  const [view, setView] = useState<'mine' | 'unassigned' | 'all'>('mine');

  const visible = useMemo(() => {
    if (view === 'mine') return cases.filter(c => c.assigned_lawyer_id === user?.id);
    if (view === 'unassigned') return cases.filter(c => !c.assigned_lawyer_id);
    return cases;
  }, [cases, view, user]);

  const myCases = cases.filter(c => c.assigned_lawyer_id === user?.id);
  const myActive = myCases.filter(c => c.status !== 'completed');
  const completed = myCases.filter(c => c.status === 'completed').length;
  const unassigned = cases.filter(c => !c.assigned_lawyer_id);
  const recentUploads = files.slice(0, 6);

  const cards = [
    { label: String(t('dashboard.my_active_cases')), value: myActive.length, icon: Briefcase, tone: 'blue' as const },
    { label: String(t('dashboard.unassigned_queue')), value: unassigned.length, icon: Hand, tone: 'amber' as const },
    { label: String(t('dashboard.recent_uploads')), value: files.length, icon: FileUp, tone: 'purple' as const },
    { label: String(t('dashboard.completed')), value: completed, icon: CheckCircle2, tone: 'emerald' as const },
  ];

  const handleClaim = async (caseId: string) => {
    if (!user) return;
    const { data, error } = await claimCase(caseId, user.id);
    if (error) {
      toast({ title: t('dashboard.could_not_claim'), description: error.message, variant: 'destructive' });
    } else if (!data) {
      toast({ title: t('dashboard.already_claimed'), description: t('dashboard.already_claimed_desc'), variant: 'destructive' });
    } else {
      toast({ title: t('dashboard.case_claimed'), description: t('dashboard.case_claimed_desc') });
      navigate(`/dashboard/cases/${caseId}`);
    }
  };

  const filesByCase = useMemo(() => {
    const m = new Map<string, number>();
    files.forEach(f => m.set(f.case_id, (m.get(f.case_id) || 0) + 1));
    return m;
  }, [files]);

  return (
    <DashboardLayout
      title={String(t('dashboard.lawyer_workspace'))}
      subtitle={String(t('dashboard.lawyer_workspace_subtitle'))}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map(c => <StatCard key={c.label} {...c} />)}
        </div>

        {/* Unassigned queue */}
        {unassigned.length > 0 && (
          <div className="mb-8">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Hand size={18} /> {t('dashboard.unassigned_cases')}
            </h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {unassigned.slice(0, 6).map(c => (
                <div key={c.id} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-foreground line-clamp-2">{c.title}</h3>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded border bg-muted">
                      {String(t(`category.${c.category}`, { defaultValue: c.category.replace('_', ' ') }))}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {t('dashboard.client')}: {nameOf(c.client_id)} · {new Date(c.created_at).toLocaleDateString()}
                  </p>
                  {c.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{c.description}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleClaim(c.id)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gold text-accent-foreground font-semibold rounded-md hover:bg-gold-dark transition-colors text-sm"
                    >
                      <Hand size={14} /> {t('dashboard.claim')}
                    </button>
                    <Link to={`/dashboard/cases/${c.id}`} className="px-3 py-2 border border-border rounded-md text-sm hover:bg-muted">
                      {t('dashboard.view')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unassigned Tasks queue */}
        {tasks.length > 0 && (
          <div className="mb-8">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <ListChecks size={18} /> {String(t('dashboard.unassigned_tasks', 'Unassigned Tasks'))}
              <span className="text-xs font-normal text-muted-foreground">({tasks.length})</span>
            </h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {tasks.slice(0, 6).map(task => (
                <div key={task.id} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-foreground line-clamp-2">{task.title}</h3>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded border bg-muted">
                      {String(t(`priority.${task.priority}`, { defaultValue: task.priority }))}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {String(t(`category.${task.category}`, { defaultValue: task.category.replace('_', ' ') }))} · {new Date(task.created_at).toLocaleDateString()}
                  </p>
                  {task.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        if (!user) return;
                        const { data, error } = await claimTask(task.id, user.id);
                        if (error) toast({ title: t('dashboard.could_not_claim'), description: error.message, variant: 'destructive' });
                        else if (!data) toast({ title: t('dashboard.already_claimed'), variant: 'destructive' });
                        else {
                          toast({ title: String(t('tasks.task_claimed', 'Task claimed')) });
                          navigate(`/dashboard/tasks/${task.id}`);
                        }
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gold text-accent-foreground font-semibold rounded-md hover:bg-gold-dark transition-colors text-sm"
                    >
                      <Hand size={14} /> {t('dashboard.claim')}
                    </button>
                    <Link to={`/dashboard/tasks/${task.id}`} className="px-3 py-2 border border-border rounded-md text-sm hover:bg-muted">
                      {t('dashboard.view')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-4 border-b border-border">
          {(['mine', 'unassigned', 'all'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                view === v ? 'border-gold text-gold' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {v === 'mine' ? t('dashboard.my_cases') : v === 'unassigned' ? t('dashboard.unassigned') : t('dashboard.all_cases')}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kanban */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                {CASE_STATUSES.map(s => <div key={s} className="h-64 bg-muted/40 rounded-lg animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                {CASE_STATUSES.map(status => {
                  const items = visible.filter(c => c.status === status);
                  return (
                    <div key={status} className="bg-muted/30 rounded-lg border-t-4 border-gold/40 p-3 min-h-[200px]">
                      <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className="text-sm font-semibold text-foreground">{String(t(`case_status.${status}`, { defaultValue: status.replace('_', ' ') }))}</h3>
                        <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">
                          {items.length}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {items.map((c: CaseRow) => (
                          <Link key={c.id} to={`/dashboard/cases/${c.id}`}
                            className="block bg-background rounded-md p-3 border border-border hover:border-gold transition-colors">
                            <p className="font-medium text-sm text-foreground line-clamp-2">{c.title}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[11px] text-muted-foreground">
                                {String(t(`category.${c.category}`, { defaultValue: c.category.replace('_', ' ') }))}
                              </span>
                              <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                                <FileText size={11} /> {filesByCase.get(c.id) || 0}
                              </span>
                            </div>
                            {c.assigned_lawyer_id && (
                              <p className="text-[10px] text-muted-foreground/80 mt-1">
                                {nameOf(c.assigned_lawyer_id)}
                              </p>
                            )}
                          </Link>
                        ))}
                        {items.length === 0 && (
                          <p className="text-xs text-muted-foreground/70 text-center py-4">{t('dashboard.empty')}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Activity feed */}
          <div>
            <h2 className="font-heading text-lg font-semibold mb-3 flex items-center gap-2">
              <Clock size={18} /> {t('dashboard.recent_activity')}
            </h2>
            <div className="bg-card border border-border rounded-lg divide-y divide-border max-h-[600px] overflow-auto">
              {[
                ...recentUploads.map(f => ({ kind: 'file' as const, created_at: f.created_at, ...f })),
                ...comments.slice(0, 10).map(c => ({ kind: 'comment' as const, created_at: c.created_at, ...c })),
              ]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 12)
                .map((item: any) => {
                  const c = cases.find(x => x.id === item.case_id);
                  return (
                    <Link key={item.kind + item.id} to={`/dashboard/cases/${item.case_id}`}
                      className="block px-4 py-3 hover:bg-muted/40 transition-colors">
                      <div className="flex items-start gap-2">
                        {item.kind === 'file'
                          ? <FileUp size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                          : <MessageSquare size={14} className="text-purple-600 mt-0.5 flex-shrink-0" />}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-1">
                            {item.kind === 'file' ? item.filename : t('dashboard.new_comment')}
                          </p>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {c?.title ?? t('dashboard.case')} · {nameOf(item.kind === 'file' ? item.uploaded_by : item.author_id)}
                          </p>
                          <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                            {new Date(item.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              {!loading && recentUploads.length === 0 && comments.length === 0 && (
                <p className="px-4 py-6 text-sm text-muted-foreground text-center">{t('dashboard.no_activity')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LawyerDashboard;
