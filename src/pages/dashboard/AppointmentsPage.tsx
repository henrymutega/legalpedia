import { useEffect, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import EmptyState from '@/components/dashboard/EmptyState';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useStaffDirectory } from '@/hooks/useStaffDirectory';
import { useToast } from '@/hooks/use-toast';
import { CalendarClock, Mail, Search, UserPlus, Loader2, Inbox } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Appointment {
  id: string;
  full_name: string;
  email: string;
  service: string;
  preferred_date: string | null;
  preferred_time: string | null;
  message: string | null;
  status: 'new' | 'contacted' | 'scheduled' | 'completed' | 'cancelled';
  assigned_to: string | null;
  notes: string | null;
  created_at: string;
}

const STATUSES: Appointment['status'][] = ['new', 'contacted', 'scheduled', 'completed', 'cancelled'];
const STATUS_TONE: Record<Appointment['status'], string> = {
  new: 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30',
  contacted: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  scheduled: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
  completed: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  cancelled: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
};

const AppointmentsPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAdmin, isSuperAdmin } = useUserRole();
  const canManage = isAdmin || isSuperAdmin;
  const { staff } = useStaffDirectory(['lawyer', 'admin', 'super_admin']);
  const lawyers = staff.filter(s => s.role === 'lawyer');

  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [serviceFilter, setServiceFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: t('appointments.load_error', 'Could not load appointments'), description: error.message, variant: 'destructive' });
    } else {
      setItems((data || []) as Appointment[]);
    }
    setLoading(false);
  }, [toast, t]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const channel = supabase
      .channel('appointments-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const filtered = useMemo(() => {
    return items.filter(a => {
      if (statusFilter && a.status !== statusFilter) return false;
      if (serviceFilter && a.service !== serviceFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!a.full_name.toLowerCase().includes(q) && !a.email.toLowerCase().includes(q) && !(a.message?.toLowerCase().includes(q) ?? false)) return false;
      }
      return true;
    });
  }, [items, statusFilter, serviceFilter, search]);

  const stats = useMemo(() => ({
    total: items.length,
    new: items.filter(a => a.status === 'new').length,
    scheduled: items.filter(a => a.status === 'scheduled').length,
    completed: items.filter(a => a.status === 'completed').length,
  }), [items]);

  const updateStatus = async (id: string, status: Appointment['status']) => {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (error) toast({ title: t('appointments.update_error', 'Update failed'), description: error.message, variant: 'destructive' });
    else toast({ title: t('appointments.updated', 'Appointment updated') });
  };

  const assignLawyer = async (id: string, lawyerId: string) => {
    const { error } = await supabase.from('appointments').update({ assigned_to: lawyerId || null }).eq('id', id);
    if (error) toast({ title: t('appointments.update_error', 'Update failed'), description: error.message, variant: 'destructive' });
    else toast({ title: t('appointments.assigned', 'Appointment assigned') });
  };

  const saveNotes = async (id: string, notes: string) => {
    const { error } = await supabase.from('appointments').update({ notes }).eq('id', id);
    if (error) toast({ title: t('appointments.update_error', 'Update failed'), description: error.message, variant: 'destructive' });
  };

  const nameOf = (uid: string | null) => {
    if (!uid) return t('dashboard.unassigned', 'Unassigned');
    const m = staff.find(s => s.user_id === uid);
    return m?.display_name || m?.email || '—';
  };

  const services = ['corporate', 'civil_litigation', 'intellectual_property', 'real_estate', 'family', 'employment'];

  return (
    <DashboardLayout
      title={String(t('appointments.title', 'Appointments'))}
      subtitle={String(t('appointments.subtitle', 'Consultation requests from clients'))}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label={String(t('appointments.stat_total', 'Total'))} value={stats.total} icon={Inbox} />
        <StatCard label={String(t('appointments.stat_new', 'New'))} value={stats.new} icon={Mail} />
        <StatCard label={String(t('appointments.stat_scheduled', 'Scheduled'))} value={stats.scheduled} icon={CalendarClock} />
        <StatCard label={String(t('appointments.stat_completed', 'Completed'))} value={stats.completed} icon={UserPlus} />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <input
            placeholder={String(t('appointments.search_ph', 'Search by name, email, message…'))}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 text-sm bg-background border border-border rounded-md">
          <option value="">{t('appointments.all_statuses', 'All statuses')}</option>
          {STATUSES.map(s => <option key={s} value={s}>{t(`appointments.status.${s}`)}</option>)}
        </select>
        <select value={serviceFilter} onChange={e => setServiceFilter(e.target.value)} className="px-3 py-2 text-sm bg-background border border-border rounded-md">
          <option value="">{t('appointments.all_services', 'All services')}</option>
          {services.map(s => <option key={s} value={s}>{t(`appointment.services.${s}`)}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gold" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={String(t('appointments.empty_title', 'No appointments yet'))}
          description={String(t('appointments.empty_desc', 'New consultation requests will appear here.'))}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <div key={a.id} className="bg-card border border-border rounded-xl p-4 lg:p-5">
              <div className="flex flex-wrap items-start gap-3 justify-between mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-heading text-base font-semibold text-foreground truncate">{a.full_name}</h3>
                    <Badge variant="outline" className={STATUS_TONE[a.status]}>{t(`appointments.status.${a.status}`)}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <a href={`mailto:${a.email}`} className="hover:text-gold">{a.email}</a>
                    {' · '}
                    {t(`appointment.services.${a.service}`, a.service)}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  {new Date(a.created_at).toLocaleString()}
                </div>
              </div>

              {(a.preferred_date || a.preferred_time) && (
                <p className="text-xs text-muted-foreground mb-2">
                  <CalendarClock size={12} className="inline mr-1 text-gold" />
                  {t('appointments.preferred', 'Preferred')}: {a.preferred_date || '—'} {a.preferred_time || ''}
                </p>
              )}

              {a.message && (
                <p className="text-sm text-foreground bg-muted/40 rounded-md p-3 mb-3 whitespace-pre-wrap">{a.message}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                    {t('appointments.status_label', 'Status')}
                  </label>
                  <select
                    value={a.status}
                    onChange={e => updateStatus(a.id, e.target.value as Appointment['status'])}
                    className="w-full px-2 py-1.5 text-xs bg-background border border-border rounded-md"
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{t(`appointments.status.${s}`)}</option>)}
                  </select>
                </div>
                {canManage && (
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                      {t('appointments.assign_to', 'Assign to lawyer')}
                    </label>
                    <select
                      value={a.assigned_to || ''}
                      onChange={e => assignLawyer(a.id, e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-background border border-border rounded-md"
                    >
                      <option value="">{t('dashboard.unassigned', 'Unassigned')}</option>
                      {lawyers.map(l => (
                        <option key={l.user_id} value={l.user_id}>{l.display_name || l.email}</option>
                      ))}
                    </select>
                  </div>
                )}
                {!canManage && a.assigned_to && (
                  <p className="text-xs text-muted-foreground self-end">
                    {t('appointments.assigned_to', 'Assigned to')}: {nameOf(a.assigned_to)}
                  </p>
                )}
              </div>

              <details className="mt-2">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  {t('appointments.internal_notes', 'Internal notes')}
                </summary>
                <textarea
                  defaultValue={a.notes || ''}
                  onBlur={e => { if (e.target.value !== (a.notes || '')) saveNotes(a.id, e.target.value); }}
                  rows={2}
                  placeholder={String(t('appointments.notes_ph', 'Add notes (auto-saved on blur)…'))}
                  className="mt-2 w-full px-3 py-2 text-xs bg-background border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-gold/40"
                />
              </details>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AppointmentsPage;
