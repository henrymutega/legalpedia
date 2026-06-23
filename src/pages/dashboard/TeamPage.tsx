import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole, UserRole } from '@/hooks/useUserRole';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import EmptyState from '@/components/dashboard/EmptyState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Users } from 'lucide-react';

const ASSIGNABLE: UserRole[] = ['client', 'lawyer', 'admin', 'super_admin'];

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

const TeamPage = () => {
  const { t } = useTranslation();
  const { isSuperAdmin, isAdmin, loading: roleLoading } = useUserRole();
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<UserRole | ''>('');
  const [q, setQ] = useState('');

  const load = async () => {
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from('profiles').select('user_id, display_name, email, created_at').order('created_at', { ascending: false }),
      supabase.from('user_roles').select('user_id, role'),
    ]);
    const roleMap = new Map<string, UserRole>();
    const rank: Record<UserRole, number> = { super_admin: 4, admin: 3, lawyer: 2, client: 1 };
    (roles || []).forEach((r: any) => {
      const existing = roleMap.get(r.user_id);
      if (!existing || rank[r.role as UserRole] > rank[existing]) roleMap.set(r.user_id, r.role);
    });
    setRows((profiles || []).map((p: any) => ({ ...p, role: roleMap.get(p.user_id) || 'client' })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const changeRole = async (userId: string, current: UserRole, next: UserRole) => {
    if (current === next) return;
    const { error: delErr } = await supabase.from('user_roles').delete().eq('user_id', userId)
      .in('role', ['admin', 'lawyer', 'super_admin']);
    if (delErr) { toast({ title: String(t('common.failed', 'Failed')), description: delErr.message, variant: 'destructive' }); return; }
    if (next !== 'client') {
      const { error: insErr } = await supabase.from('user_roles').insert({ user_id: userId, role: next });
      if (insErr) { toast({ title: String(t('common.failed', 'Failed')), description: insErr.message, variant: 'destructive' }); return; }
    }
    toast({ title: String(t('team_page.role_updated', 'Role updated')) });
    load();
  };

  const visible = rows
    .filter(r => !filter || r.role === filter)
    .filter(r => {
      if (!q.trim()) return true;
      const s = q.toLowerCase();
      return (r.display_name || '').toLowerCase().includes(s) || (r.email || '').toLowerCase().includes(s);
    });

  return (
    <DashboardLayout
      title={String(t('nav_dashboard.team', 'Team'))}
      subtitle={String(t('dashboard.operations_subtitle', 'Manage users and roles'))}
      actions={
        isSuperAdmin && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-gold/20 text-gold">
            <ShieldCheck size={14} /> {String(t('team_page.super_admin', 'Super Admin'))}
          </span>
        )
      }
    >
      {!roleLoading && !isAdmin && (
        <div className="mb-4 p-3 rounded-md bg-muted text-sm text-muted-foreground">
          {String(t('team_page.admin_required', 'Admin access required.'))}
        </div>
      )}

      <div className="bg-card border border-border rounded-lg p-3 mb-4 flex flex-wrap gap-2 items-center">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder={String(t('team_page.search_ph', 'Search name or email'))}
          className="flex-1 min-w-[200px] px-3 py-2 bg-background border border-border rounded-md text-sm" />
        <select value={filter} onChange={e => setFilter(e.target.value as UserRole | '')} className="px-3 py-2 bg-background border border-border rounded-md text-sm">
          <option value="">{String(t('team_page.all_roles', 'All roles'))}</option>
          {ASSIGNABLE.map(r => <option key={r} value={r}>{String(t(`roles.${r}`, r.replace('_', ' ')))}</option>)}
        </select>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="py-10 text-center text-muted-foreground text-sm">{String(t('common.loading', 'Loading…'))}</div>
        ) : visible.length === 0 ? (
          <EmptyState icon={Users} title={String(t('team_page.empty', 'No team members found.'))} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{String(t('team_page.col_name', 'Name'))}</TableHead>
                <TableHead>{String(t('team_page.col_email', 'Email'))}</TableHead>
                <TableHead>{String(t('team_page.col_role', 'Role'))}</TableHead>
                <TableHead>{String(t('team_page.col_joined', 'Joined'))}</TableHead>
                {isSuperAdmin && <TableHead>{String(t('team_page.col_change', 'Change'))}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map(u => (
                <TableRow key={u.user_id}>
                  <TableCell className="font-medium">{u.display_name || '—'}</TableCell>
                  <TableCell className="text-sm">{u.email || '—'}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${roleBadge[u.role]}`}>
                      {String(t(`roles.${u.role}`, u.role.replace('_', ' ')))}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  {isSuperAdmin && (
                    <TableCell>
                      <select value={u.role} onChange={e => changeRole(u.user_id, u.role, e.target.value as UserRole)}
                        className="px-2 py-1.5 bg-background border border-border rounded text-sm capitalize">
                        {ASSIGNABLE.map(r => <option key={r} value={r}>{String(t(`roles.${r}`, r.replace('_', ' ')))}</option>)}
                      </select>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeamPage;
