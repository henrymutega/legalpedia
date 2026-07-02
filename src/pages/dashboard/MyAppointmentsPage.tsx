import { useEffect, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import EmptyState from '@/components/dashboard/EmptyState';
import { supabase } from '@/integrations/supabase/client';
import { CalendarClock, Loader2, Inbox, Plus } from 'lucide-react';
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
  created_at: string;
}
const STATUS_TONE: Record<Appointment['status'], string> = {
  new: 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30',
  contacted: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  scheduled: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
  completed: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  cancelled: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
};
const MyAppointmentsPage = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });
    setItems((data || []) as Appointment[]);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const channel = supabase
      .channel('my-appointments-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);
  const upcoming = useMemo(
    () => items.filter(a => a.status !== 'completed' && a.status !== 'cancelled').length,
    [items],
  );
  return (
    <DashboardLayout
      title={String(t('appointments.my_title', 'My Appointments'))}
      subtitle={String(t('appointments.my_subtitle', 'Consultation requests you have booked'))}
      actions={
        <Link
          to="/contact"
          className="inline-flex items-center gap-1.5 rounded-md bg-gold px-3 py-2 text-sm font-medium text-primary hover:bg-gold/90"
        >
          <Plus size={15} /> {String(t('appointments.book_new', 'Book appointment'))}
        </Link>
      }
    >
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gold" /></div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={String(t('appointments.my_empty_title', 'No appointments yet'))}
          description={String(t('appointments.my_empty_desc', 'Book a consultation and it will appear here.'))}
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {String(t('appointments.upcoming_count', 'Upcoming'))}: <span className="font-semibold text-foreground">{upcoming}</span>
          </p>
          <div className="space-y-3">
            {items.map(a => (
              <div key={a.id} className="bg-card border border-border rounded-xl p-4 lg:p-5">
                <div className="flex flex-wrap items-start gap-3 justify-between mb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading text-base font-semibold text-foreground truncate">
                        {t(`appointment.services.${a.service}`, a.service)}
                      </h3>
                      <Badge variant="outline" className={STATUS_TONE[a.status]}>{t(`appointments.status.${a.status}`)}</Badge>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    {new Date(a.created_at).toLocaleDateString()}
                  </div>
                </div>
                {(a.preferred_date || a.preferred_time) && (
                  <p className="text-xs text-muted-foreground mb-2">
                    <CalendarClock size={12} className="inline mr-1 text-gold" />
                    {t('appointments.preferred', 'Preferred')}: {a.preferred_date || '—'} {a.preferred_time || ''}
                  </p>
                )}
                {a.message && (
                  <p className="text-sm text-foreground bg-muted/40 rounded-md p-3 whitespace-pre-wrap">{a.message}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};
export default MyAppointmentsPage;