import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'super_admin' | 'admin' | 'lawyer' | 'client';

export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<UserRole>('client');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setRole('client');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        if (cancelled) return;
        const roles = (data || []).map((r: any) => r.role);
        if (roles.includes('super_admin')) setRole('super_admin');
        else if (roles.includes('admin')) setRole('admin');
        else if (roles.includes('lawyer')) setRole('lawyer');
        else setRole('client');
      } catch {
        if (!cancelled) setRole('client');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, authLoading]);

  const isSuperAdmin = role === 'super_admin';
  const isAdmin = role === 'admin' || isSuperAdmin;
  const isLawyer = role === 'lawyer';
  const isStaff = isAdmin || isLawyer;
  return { role, isStaff, isAdmin, isSuperAdmin, isLawyer, loading: loading || authLoading };
};