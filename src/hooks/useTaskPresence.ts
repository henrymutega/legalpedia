import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PresenceRow {
  task_id: string;
  user_id: string;
  last_seen: string;
}

const ACTIVE_WINDOW_MS = 60_000; // someone seen in last minute = active

/**
 * Heartbeats current user's presence on a task and watches who else is here.
 * Only call this for staff users on task detail pages.
 */
export const useTaskPresence = (taskId: string | undefined) => {
  const { user } = useAuth();
  const [presence, setPresence] = useState<PresenceRow[]>([]);

  useEffect(() => {
    if (!taskId || !user) return;

    let cancelled = false;
    const heartbeat = async () => {
      await supabase
        .from('lawyer_presence')
        .upsert(
          { task_id: taskId, user_id: user.id, last_seen: new Date().toISOString() },
          { onConflict: 'task_id,user_id' },
        );
    };

    const fetchPresence = async () => {
      const cutoff = new Date(Date.now() - ACTIVE_WINDOW_MS).toISOString();
      const { data } = await supabase
        .from('lawyer_presence')
        .select('*')
        .eq('task_id', taskId)
        .gte('last_seen', cutoff);
      if (!cancelled) setPresence((data as PresenceRow[]) || []);
    };

    heartbeat();
    fetchPresence();
    const hbInterval = setInterval(heartbeat, 20_000);
    const refreshInterval = setInterval(fetchPresence, 15_000);

    const channel = supabase
      .channel(`presence-${taskId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lawyer_presence', filter: `task_id=eq.${taskId}` },
        () => fetchPresence(),
      )
      .subscribe();

    const cleanup = async () => {
      cancelled = true;
      clearInterval(hbInterval);
      clearInterval(refreshInterval);
      supabase.removeChannel(channel);
      await supabase
        .from('lawyer_presence')
        .delete()
        .eq('task_id', taskId)
        .eq('user_id', user.id);
    };

    window.addEventListener('beforeunload', cleanup);
    return () => {
      window.removeEventListener('beforeunload', cleanup);
      cleanup();
    };
  }, [taskId, user]);

  return { presence };
};
