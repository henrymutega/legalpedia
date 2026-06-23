import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useStaffDirectory } from '@/hooks/useStaffDirectory';
import { useTaskPresence } from '@/hooks/useTaskPresence';
import { claimTask, releaseTask, reassignTask, updateTaskStatus, type TaskRow } from '@/hooks/useTasks';
import Layout from '@/components/dashboard/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Hand, Send, MessageSquare, Activity, Users, UserCog, Trash2 } from 'lucide-react';
import {
  TASK_STATUSES,
  STATUS_LABEL,
  STATUS_BADGE,
  PRIORITY_BADGE,
  CATEGORY_LABEL,
  labelize,
  type TaskStatus,
} from '@/lib/taskConstants';

const TaskDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { isStaff, isAdmin, isLawyer } = useUserRole();
  const { staff } = useStaffDirectory(['lawyer', 'admin', 'super_admin']);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [task, setTask] = useState<TaskRow | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  const { presence } = useTaskPresence(isStaff ? id : undefined);

  useEffect(() => {
    if (!id || !user) return;
    let cancelled = false;
    const load = async () => {
      const [{ data: t }, { data: c }, { data: a }] = await Promise.all([
        supabase.from('tasks').select('*').eq('id', id).maybeSingle(),
        supabase.from('task_comments').select('*').eq('task_id', id).order('created_at', { ascending: true }),
        supabase.from('task_activity').select('*').eq('task_id', id).order('created_at', { ascending: false }).limit(40),
      ]);
      if (cancelled) return;
      setTask(t as TaskRow | null);
      setComments(c || []);
      setActivity(a || []);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel(`task-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `id=eq.${id}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_comments', filter: `task_id=eq.${id}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_activity', filter: `task_id=eq.${id}` }, load)
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [id, user]);

  const nameOf = (uid: string | null | undefined) => {
    if (!uid) return null;
    if (uid === user?.id) return String(t('cases.you'));
    const m = staff.find(s => s.user_id === uid);
    return m?.display_name || m?.email || String(t('cases.user'));
  };

  const handleClaim = async () => {
    if (!user || !task) return;
    const { data, error } = await claimTask(task.id, user.id);
    if (error) toast({ title: t('tasks.could_not_claim'), description: error.message, variant: 'destructive' });
    else if (!data) toast({ title: t('tasks.already_claimed'), description: t('tasks.already_claimed_desc'), variant: 'destructive' });
    else toast({ title: t('tasks.claimed') });
  };

  const handleRelease = async () => {
    if (!task) return;
    const { error } = await releaseTask(task.id);
    if (error) toast({ title: t('tasks.assign_failed'), description: error.message, variant: 'destructive' });
    else toast({ title: t('tasks.released') });
  };

  const handleAssign = async (uid: string) => {
    if (!task || !user) return;
    const { error } = await reassignTask(task.id, uid || null, user.id);
    if (error) toast({ title: t('tasks.assign_failed'), description: error.message, variant: 'destructive' });
    else toast({ title: uid ? t('tasks.reassigned') : t('tasks.unassigned') });
  };

  const handleStatus = async (status: TaskStatus) => {
    if (!task) return;
    const { error } = await updateTaskStatus(task.id, status);
    if (error) toast({ title: t('tasks.status_update_failed'), description: error.message, variant: 'destructive' });
  };

  const handleComment = async () => {
    if (!task || !user) return;
    const text = comment.trim();
    if (!text) return;
    const { error } = await supabase.from('task_comments').insert({
      task_id: task.id,
      author_id: user.id,
      content: text.slice(0, 4000),
    });
    if (error) toast({ title: t('tasks.comment_failed'), description: error.message, variant: 'destructive' });
    else setComment('');
  };

  const handleDelete = async () => {
    if (!task || !confirm(String(t('tasks.confirm_delete')))) return;
    const { error } = await supabase.from('tasks').delete().eq('id', task.id);
    if (error) toast({ title: t('tasks.delete_failed'), description: error.message, variant: 'destructive' });
    else { toast({ title: t('tasks.task_deleted') }); navigate('/dashboard'); }
  };

  if (loading) return <Layout><div className="container mx-auto px-4 py-10">{t('tasks.loading')}</div></Layout>;
  if (!task) return <Layout><div className="container mx-auto px-4 py-10">{t('tasks.not_found')}</div></Layout>;

  const others = presence.filter(p => p.user_id !== user?.id);
  const canActOnStatus = isAdmin || task.assigned_to === user?.id;
  const canClaim = isLawyer && !task.assigned_to;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gold mb-4">
          <ArrowLeft size={16} /> {t('tasks.back')}
        </Link>

        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_BADGE[task.status]}`}>
                  {String(t(`case_status.${task.status}`, { defaultValue: STATUS_LABEL[task.status] }))}
                </span>
                <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded border ${PRIORITY_BADGE[task.priority]}`}>
                  {String(t(`priority.${task.priority}`, { defaultValue: task.priority }))}
                </span>
                <span className="text-xs text-muted-foreground">
                  {String(t(`category.${task.category}`, { defaultValue: CATEGORY_LABEL[task.category] || labelize(task.category) }))}
                </span>
                {task.related_case_id && (
                  <Link to={`/dashboard/cases/${task.related_case_id}`} className="text-xs text-gold hover:underline">
                    {t('tasks.linked_case')}
                  </Link>
                )}
              </div>
              <h1 className="font-heading text-2xl font-bold text-foreground">{task.title}</h1>
              <p className="text-xs text-muted-foreground mt-1">
                {t('tasks.created_by', { name: nameOf(task.created_by) })} · {new Date(task.created_at).toLocaleString()}
                {task.due_date && <> · {t('tasks.due_on', { date: new Date(task.due_date).toLocaleDateString() })}</>}
              </p>
            </div>
            {isAdmin && (
              <button onClick={handleDelete} className="text-sm text-red-600 hover:text-red-700 inline-flex items-center gap-1">
                <Trash2 size={14} /> {t('tasks.delete')}
              </button>
            )}
          </div>

          {task.description && (
            <p className="text-sm text-foreground whitespace-pre-wrap mb-4">{task.description}</p>
          )}

          <div className="border-t border-border pt-4 grid gap-4 md:grid-cols-2">
            {/* Assignment */}
            <div>
              <p className="text-xs text-muted-foreground mb-1 inline-flex items-center gap-1">
                <UserCog size={12} /> {t('tasks.handled_by')}
              </p>
              {task.assigned_to ? (
                <p className="text-sm font-medium text-foreground">{nameOf(task.assigned_to)}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">{t('tasks.unassigned')}</p>
              )}
              {isAdmin && (
                <select value={task.assigned_to || ''} onChange={e => handleAssign(e.target.value)}
                  className="mt-2 w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm">
                  <option value="">{t('tasks.unassigned_option')}</option>
                  {staff.map(s => <option key={s.user_id} value={s.user_id}>{s.display_name || s.email}</option>)}
                </select>
              )}
              {!isAdmin && task.assigned_to === user?.id && (
                <button onClick={handleRelease} className="mt-2 text-xs text-muted-foreground hover:text-foreground underline">
                  {t('tasks.release_task')}
                </button>
              )}
              {canClaim && (
                <button onClick={handleClaim}
                  className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-gold text-accent-foreground font-semibold rounded-md hover:bg-gold-dark text-sm">
                  <Hand size={14} /> {t('tasks.claim_task')}
                </button>
              )}
            </div>

            {/* Status + presence */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t('tasks.status')}</p>
              {canActOnStatus ? (
                <select value={task.status} onChange={e => handleStatus(e.target.value as TaskStatus)}
                  className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm">
                  {TASK_STATUSES.map(s => <option key={s} value={s}>{String(t(`case_status.${s}`, { defaultValue: STATUS_LABEL[s] }))}</option>)}
                </select>
              ) : (
                <p className="text-sm">{String(t(`case_status.${task.status}`, { defaultValue: STATUS_LABEL[task.status] }))}</p>
              )}
              {isStaff && others.length > 0 && (
                <div className="mt-3 inline-flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
                  <Users size={12} />
                  {others.length === 1
                    ? t('tasks.viewing_singular', { name: nameOf(others[0].user_id) })
                    : t('tasks.viewing_plural', { count: others.length })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Internal comments + Activity */}
        <div className="grid gap-6 lg:grid-cols-3">
          {isStaff && (
            <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
              <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageSquare size={18} /> {t('tasks.internal_notes')}
              </h2>
              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {comments.length === 0 && <p className="text-sm text-muted-foreground">{t('tasks.no_notes')}</p>}
                {comments.map(c => (
                  <div key={c.id} className="p-3 bg-background rounded border border-border">
                    <p className="text-xs text-muted-foreground mb-1">
                      {nameOf(c.author_id)} · {new Date(c.created_at).toLocaleString()}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{c.content}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={comment} onChange={e => setComment(e.target.value)} maxLength={4000}
                  placeholder={String(t('tasks.add_note_placeholder'))}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(); } }}
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-sm" />
                <button onClick={handleComment} disabled={!comment.trim()}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-gold text-accent-foreground font-semibold rounded-md hover:bg-gold-dark disabled:opacity-50">
                  <Send size={14} />
                </button>
              </div>
            </div>
          )}

          <div className={isStaff ? '' : 'lg:col-span-3'}>
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity size={18} /> {t('tasks.activity')}
              </h2>
              <ol className="relative border-l border-border ml-2 space-y-4">
                {activity.length === 0 && <p className="text-sm text-muted-foreground">{t('tasks.no_activity')}</p>}
                {activity.map(a => (
                  <li key={a.id} className="ml-4">
                    <div className="absolute -left-1.5 w-3 h-3 rounded-full bg-gold border border-background" />
                    <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</p>
                    <p className="text-sm">
                      <span className="font-medium">{nameOf(a.actor_id)}</span>{' '}
                      <ActivityText action={a.action} detail={a.detail} nameOf={nameOf} t={t} />
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const ActivityText = ({ action, detail, nameOf, t }: { action: string; detail: any; nameOf: (id: string) => string | null; t: any }) => {
  switch (action) {
    case 'created': return <>{t('tasks.act_created')}</>;
    case 'claimed': return <>{t('tasks.act_claimed')}</>;
    case 'released': return <>{t('tasks.act_released')}</>;
    case 'assigned': return <>{t('tasks.act_assigned_to')} <span className="font-medium">{nameOf(detail?.to) || t('tasks.someone')}</span></>;
    case 'status_changed': return <>{t('tasks.act_status_changed')} {String(t(`case_status.${detail?.from}`, { defaultValue: labelize(detail?.from || '') }))} → <span className="font-medium">{String(t(`case_status.${detail?.to}`, { defaultValue: labelize(detail?.to || '') }))}</span></>;
    case 'commented': return <>{t('tasks.act_commented')}</>;
    default: return <>{action.replace(/_/g, ' ')}</>;
  }
};

export default TaskDetailPage;
