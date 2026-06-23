import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useUserRole, UserRole } from '@/hooks/useUserRole';
import { ShieldCheck } from 'lucide-react';

const ASSIGNABLE_ROLES: UserRole[] = ['client', 'lawyer', 'admin', 'super_admin'];

interface Row {
  user_id: string;
  display_name: string | null;
  email: string | null;
  created_at: string;
  role: UserRole;
}

const roleBadge: Record<UserRole, string> = {
  super_admin: 'bg-gold/20 text-gold',
  admin: 'bg-purple-100 text-purple-700',
  lawyer: 'bg-blue-100 text-blue-700',
  client: 'bg-muted text-muted-foreground',
};

const AdminUsersPage = () => {
  const { t } = useTranslation();
  const { isSuperAdmin, loading: roleLoading } = useUserRole();
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from('profiles').select('user_id, display_name, email, created_at').order('created_at', { ascending: false }),
      supabase.from('user_roles').select('user_id, role'),
    ]);
    const roleMap = new Map<string, UserRole>();
    (roles || []).forEach((r: any) => {
      const existing = roleMap.get(r.user_id);
      const rank: Record<UserRole, number> = { super_admin: 4, admin: 3, lawyer: 2, client: 1 };
      if (!existing || rank[r.role as UserRole] > rank[existing]) roleMap.set(r.user_id, r.role);
    });
    setRows((profiles || []).map((p: any) => ({
      ...p,
      role: roleMap.get(p.user_id) || 'client',
    })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const changeRole = async (userId: string, current: UserRole, next: UserRole) => {
    if (current === next) return;
    // Remove all elevated roles, then insert next (unless 'client' which is the default no-row state)
    const { error: delErr } = await supabase
      .from('user_roles').delete().eq('user_id', userId)
      .in('role', ['admin', 'lawyer', 'super_admin']);
    if (delErr) {
      toast({ title: t('admin.users.role_update_failed'), description: delErr.message, variant: 'destructive' });
      return;
    }
    if (next !== 'client') {
      const { error: insErr } = await supabase.from('user_roles').insert({ user_id: userId, role: next });
      if (insErr) {
        toast({ title: t('admin.users.role_assign_failed'), description: insErr.message, variant: 'destructive' });
        return;
      }
    }
    toast({ title: t('admin.users.role_updated') });
    load();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-heading text-2xl font-bold text-foreground">{t('admin.users.title')}</h1>
        {isSuperAdmin && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-gold/20 text-gold">
            <ShieldCheck size={14} /> {t('admin.users.super_admin_access')}
          </span>
        )}
      </div>

      {!roleLoading && !isSuperAdmin && (
        <div className="mb-4 p-3 rounded-md bg-muted text-sm text-muted-foreground">
          {t('admin.users.only_super')}
        </div>
      )}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.common.name')}</TableHead>
              <TableHead>{t('admin.common.email')}</TableHead>
              <TableHead>{t('admin.common.role')}</TableHead>
              <TableHead>{t('admin.users.joined')}</TableHead>
              {isSuperAdmin && <TableHead>{t('admin.users.change_role')}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{t('admin.common.loading')}</TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{t('admin.users.no_users')}</TableCell></TableRow>
            ) : rows.map(u => (
              <TableRow key={u.user_id}>
                <TableCell className="font-medium">{u.display_name || '—'}</TableCell>
                <TableCell className="text-sm">{u.email || '—'}</TableCell>
                <TableCell>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${roleBadge[u.role]}`}>
                    {t(`roles.${u.role}`, u.role.replace('_', ' '))}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString()}
                </TableCell>
                {isSuperAdmin && (
                  <TableCell>
                    <select
                      value={u.role}
                      onChange={e => changeRole(u.user_id, u.role, e.target.value as UserRole)}
                      className="px-2 py-1.5 bg-background border border-border rounded text-sm capitalize"
                    >
                      {ASSIGNABLE_ROLES.map(r => (
                        <option key={r} value={r}>{t(`roles.${r}`, r.replace('_', ' '))}</option>
                      ))}
                    </select>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;