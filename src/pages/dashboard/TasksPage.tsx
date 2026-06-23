import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { useStaffDirectory } from '@/hooks/useStaffDirectory';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import EmptyState from '@/components/dashboard/EmptyState';
import LoadingGrid from '@/components/dashboard/LoadingGrid';
import TaskCard from '@/components/tasks/TaskCard';
import { TASK_STATUSES, TASK_PRIORITIES, STATUS_LABEL, type TaskStatus, type TaskPriority } from '@/lib/taskConstants';
import { ListChecks, Plus, Search, LayoutGrid, Columns } from 'lucide-react';

const TasksPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [status, setStatus] = useState<TaskStatus | ''>('');
  const [priority, setPriority] = useState<TaskPriority | ''>('');
  const [assignee, setAssignee] = useState<string>('');
  const [q, setQ] = useState('');
  const [view, setView] = useState<'grid' | 'board'>('grid');

  const { tasks, loading } = useTasks({ status, priority, assignee }, user?.id);
  const { staff } = useStaffDirectory(['lawyer', 'admin', 'super_admin']);

  const nameOf = (id: string | null | undefined) => {
    if (!id) return null;
    const m = staff.find(s => s.user_id === id);
    return m?.display_name || m?.email || 'Lawyer';
  };

  const visible = useMemo(() => {
    if (!q.trim()) return tasks;
    const s = q.toLowerCase();
    return tasks.filter(t => t.title.toLowerCase().includes(s) || (t.description?.toLowerCase().includes(s) ?? false));
  }, [tasks, q]);

  const byStatus = useMemo(() => {
    const m: Record<string, typeof visible> = {};
    TASK_STATUSES.forEach(s => { m[s] = []; });
    visible.forEach(t => { (m[t.status] || (m[t.status] = [])).push(t); });
    return m;
  }, [visible]);

  return (
    <DashboardLayout
      title={String(t('nav_dashboard.tasks', 'Tasks'))}
      actions={
        <div className="flex items-center gap-2">
          <div className="inline-flex bg-muted rounded-md p-0.5">
            <button onClick={() => setView('grid')} aria-label="Grid view"
              className={`p-1.5 rounded ${view === 'grid' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>
              <LayoutGrid size={14} />
            </button>
            <button onClick={() => setView('board')} aria-label="Board view"
              className={`p-1.5 rounded ${view === 'board' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>
              <Columns size={14} />
            </button>
          </div>
          <Link to="/dashboard/tasks/new" className="inline-flex items-center gap-2 px-3 py-2 bg-gold text-accent-foreground font-semibold rounded-md hover:bg-gold-dark transition-colors text-sm">
            <Plus size={16} /> {String(t('tasks.new_task', 'New Task'))}
          </Link>
        </div>
      }
    >
      <div className="bg-card border border-border rounded-lg p-3 mb-4 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={String(t('dashboard.search_cases'))}
            className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-md text-sm" />
        </div>
        <select value={assignee} onChange={e => setAssignee(e.target.value)} className="px-3 py-2 bg-background border border-border rounded-md text-sm">
          <option value="">{String(t('dashboard.all_lawyers', 'All assignees'))}</option>
          <option value="__me__">{String(t('dashboard.my_cases', 'Mine'))}</option>
          <option value="__unassigned__">{String(t('dashboard.unassigned', 'Unassigned'))}</option>
        </select>
        {view === 'grid' && (
          <select value={status} onChange={e => setStatus(e.target.value as TaskStatus | '')} className="px-3 py-2 bg-background border border-border rounded-md text-sm">
            <option value="">{String(t('dashboard.all_statuses', 'All statuses'))}</option>
            {TASK_STATUSES.map(s => <option key={s} value={s}>{String(t(`case_status.${s}`, s))}</option>)}
          </select>
        )}
        <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority | '')} className="px-3 py-2 bg-background border border-border rounded-md text-sm">
          <option value="">{String(t('tasks.priority', 'Priority'))}</option>
          {TASK_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {loading ? (
        <LoadingGrid rows={4} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title={String(t('tasks.no_activity', 'No tasks yet.'))}
          action={
            <Link to="/dashboard/tasks/new" className="inline-flex items-center gap-2 px-3 py-2 bg-gold text-accent-foreground font-semibold rounded-md hover:bg-gold-dark text-sm">
              <Plus size={16} /> {String(t('tasks.new_task', 'New Task'))}
            </Link>
          }
        />
      ) : view === 'grid' ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visible.map(task => (
            <TaskCard key={task.id} task={task} assigneeName={nameOf(task.assigned_to)} />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          {TASK_STATUSES.map(s => (
            <div key={s} className="bg-muted/40 rounded-lg p-3 min-h-[200px]">
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {String(t(`case_status.${s}`, STATUS_LABEL[s]))}
                </h3>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-background text-muted-foreground">{byStatus[s]?.length || 0}</span>
              </div>
              <div className="space-y-2">
                {(byStatus[s] || []).map(task => (
                  <TaskCard key={task.id} task={task} assigneeName={nameOf(task.assigned_to)} />
                ))}
                {(!byStatus[s] || byStatus[s].length === 0) && (
                  <p className="text-[11px] text-muted-foreground/70 text-center py-4">—</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default TasksPage;
