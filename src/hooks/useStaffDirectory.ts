import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StaffMember {
  user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: 'lawyer' | 'admin' | 'super_admin';
}

/** Returns lawyers (and optionally admins) with their profile info. */
export const useStaffDirectory = (roles: Array<'lawyer' | 'admin' | 'super_admin'> = ['lawyer']) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: roleRows } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('role', roles);
      const ids = Array.from(new Set((roleRows || []).map(r => r.user_id)));
      if (ids.length === 0) {
        if (!cancelled) { setStaff([]); setLoading(false); }
        return;
      }
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, email, avatar_url')
        .in('user_id', ids);
      const byId = new Map((profiles || []).map(p => [p.user_id, p]));
      const merged: StaffMember[] = (roleRows || []).map(r => {
        const p = byId.get(r.user_id);
        return {
          user_id: r.user_id,
          display_name: p?.display_name ?? null,
          email: p?.email ?? null,
          avatar_url: p?.avatar_url ?? null,
          role: r.role as StaffMember['role'],
        };
      });
      if (!cancelled) { setStaff(merged); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [roles.join(',')]);

  return { staff, loading };
};
