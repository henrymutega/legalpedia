import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { TaskStatus, TaskPriority } from '@/lib/taskConstants';

export interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  priority: TaskPriority;
  status: TaskStatus;
  related_case_id: string | null;
  created_by: string;
  assigned_by: string | null;
  assigned_to: string | null;
  assigned_at: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

interface Filters {
  status?: TaskStatus | '';
  category?: string;
  priority?: TaskPriority | '';
  assignee?: string;        // user_id, '__me__', '__unassigned__', or ''
  caseId?: string;
}

export const useTasks = (filters: Filters = {}, currentUserId?: string) => {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setError(null);
    let q = supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (filters.status) q = q.eq('status', filters.status);
    if (filters.category) q = q.eq('category', filters.category);
    if (filters.priority) q = q.eq('priority', filters.priority);
    if (filters.caseId) q = q.eq('related_case_id', filters.caseId);
    if (filters.assignee === '__unassigned__') q = q.is('assigned_to', null);
    else if (filters.assignee === '__me__' && currentUserId) q = q.eq('assigned_to', currentUserId);
    else if (filters.assignee) q = q.eq('assigned_to', filters.assignee);
    const { data, error } = await q;
    if (error) setError(error.message);
    setTasks((data as TaskRow[]) || []);
    setLoading(false);
  }, [filters.status, filters.category, filters.priority, filters.assignee, filters.caseId, currentUserId]);

  useEffect(() => {
    fetchTasks();
    const channel = supabase
      .channel('tasks-stream')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTasks();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTasks]);

  return { tasks, loading, error, refresh: fetchTasks };
};

// Atomic claim — only succeeds if still unassigned.
export const claimTask = async (taskId: string, userId: string) => {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      assigned_to: userId,
      assigned_by: userId,
      assigned_at: new Date().toISOString(),
      status: 'assigned',
    })
    .eq('id', taskId)
    .is('assigned_to', null)
    .select()
    .maybeSingle();
  return { data, error };
};

export const releaseTask = async (taskId: string) => {
  return supabase
    .from('tasks')
    .update({ assigned_to: null, assigned_by: null, assigned_at: null, status: 'open' })
    .eq('id', taskId);
};

export const reassignTask = async (taskId: string, toUserId: string | null, byUserId: string) => {
  return supabase
    .from('tasks')
    .update({
      assigned_to: toUserId,
      assigned_by: toUserId ? byUserId : null,
      assigned_at: toUserId ? new Date().toISOString() : null,
      status: toUserId ? 'assigned' : 'open',
    })
    .eq('id', taskId);
};

export const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
  return supabase.from('tasks').update({ status }).eq('id', taskId);
};
