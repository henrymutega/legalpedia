import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useStaffDirectory } from '@/hooks/useStaffDirectory';
import Layout from '@/components/dashboard/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ListPlus } from 'lucide-react';
import {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  CATEGORY_LABEL,
  type TaskPriority,
} from '@/lib/taskConstants';

const schema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().max(4000).optional(),
  category: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
});

const NewTaskPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isStaff, loading: roleLoading } = useUserRole();
  const { staff } = useStaffDirectory(['lawyer']);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('corporate');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assignTo, setAssignTo] = useState<string>('');
  const [caseId, setCaseId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [cases, setCases] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isStaff) return;
    (async () => {
      const { data } = await supabase.from('cases').select('id, title').order('created_at', { ascending: false }).limit(200);
      setCases(data || []);
    })();
  }, [isStaff]);

  if (!roleLoading && !isStaff) {
    navigate('/dashboard');
    return null;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ title, description, category, priority });
    if (!parsed.success) {
      toast({ title: t('tasks.invalid_input'), description: parsed.error.issues[0].message, variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const payload: any = {
      title: parsed.data.title,
      description: parsed.data.description || null,
      category: parsed.data.category,
      priority: parsed.data.priority,
      created_by: user!.id,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      related_case_id: caseId || null,
    };
    if (assignTo) {
      payload.assigned_to = assignTo;
      payload.assigned_by = user!.id;
      payload.assigned_at = new Date().toISOString();
      payload.status = 'assigned';
    }
    const { data, error } = await supabase.from('tasks').insert(payload).select().single();
    setSubmitting(false);
    if (error) {
      toast({ title: t('tasks.create_failed'), description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: t('tasks.task_created') });
    navigate(`/dashboard/tasks/${data.id}`);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gold mb-4">
          <ArrowLeft size={16} /> {t('tasks.back')}
        </button>
        <h1 className="font-heading text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <ListPlus size={22} /> {t('tasks.new_task')}
        </h1>
        <form onSubmit={submit} className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('tasks.title')}</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required maxLength={200}
              className="w-full px-3 py-2 bg-background border border-border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('tasks.description')}</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} maxLength={4000}
              className="w-full px-3 py-2 bg-background border border-border rounded-md" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">{t('tasks.category')}</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md">
                {TASK_CATEGORIES.map(c => <option key={c} value={c}>{String(t(`category.${c}`, { defaultValue: CATEGORY_LABEL[c] }))}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('tasks.priority')}</label>
              <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md capitalize">
                {TASK_PRIORITIES.map(p => <option key={p} value={p}>{String(t(`priority.${p}`, { defaultValue: p }))}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">{t('tasks.assign_to_optional')}</label>
              <select value={assignTo} onChange={e => setAssignTo(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md">
                <option value="">{t('tasks.leave_for_claim')}</option>
                {staff.map(s => <option key={s.user_id} value={s.user_id}>{s.display_name || s.email}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('tasks.due_date_optional')}</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('tasks.related_case_optional')}</label>
            <select value={caseId} onChange={e => setCaseId(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md">
              <option value="">{t('tasks.none_option')}</option>
              {cases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <button type="submit" disabled={submitting}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gold text-accent-foreground font-semibold rounded-md hover:bg-gold-dark transition-colors disabled:opacity-50">
            {submitting ? t('tasks.creating') : t('tasks.create_task')}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default NewTaskPage;
