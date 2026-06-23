import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const SERVICE_KEYS = [
  'corporate',
  'civil_litigation',
  'intellectual_property',
  'real_estate',
  'family',
  'employment',
] as const;
export type ServiceKey = typeof SERVICE_KEYS[number];

interface Props {
  variant?: 'card' | 'plain';
  onSuccess?: () => void;
}

const AppointmentForm = ({ variant = 'card', onSuccess }: Props) => {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    service: '' as ServiceKey | '',
    preferred_date: '',
    preferred_time: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const reset = () => setForm({ full_name: '', email: '', service: '', preferred_date: '', preferred_time: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim() || !form.service) {
      toast({ title: t('appointment.error_required', 'Please fill in all required fields.'), variant: 'destructive' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast({ title: t('appointment.error_email', 'Please enter a valid email address.'), variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('appointments').insert({
      full_name: form.full_name.trim().slice(0, 120),
      email: form.email.trim().toLowerCase().slice(0, 200),
      service: form.service,
      preferred_date: form.preferred_date || null,
      preferred_time: form.preferred_time || null,
      message: form.message.trim().slice(0, 2000) || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: t('appointment.error_generic', 'Could not submit your request.'), description: error.message, variant: 'destructive' });
      return;
    }
    // Analytics
    try {
      await supabase.from('chat_analytics').insert({
        query: `[appointment_submitted:${form.service}:${i18n.language}]`,
        response_length: 0,
        success: true,
        language: i18n.language?.slice(0, 2) || 'en',
      });
    } catch { /* ignore */ }

    toast({ title: t('appointment.success_title', 'Appointment request sent'), description: t('appointment.success_desc', 'We will contact you shortly.') });
    setSuccess(true);
    reset();
    onSuccess?.();
  };

  const wrapper = variant === 'card'
    ? 'bg-card border border-border rounded-xl p-5 lg:p-6 shadow-sm'
    : '';

  const input = 'w-full px-3.5 py-2.5 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition';

  if (success) {
    return (
      <div className={wrapper + ' text-center py-10'}>
        <div className="w-14 h-14 rounded-full bg-gold/15 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="text-gold" size={28} />
        </div>
        <h3 className="font-heading text-lg font-semibold text-foreground mb-1">
          {t('appointment.success_title', 'Appointment request sent')}
        </h3>
        <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
          {t('appointment.success_desc', 'We will contact you shortly.')}
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="text-sm text-gold hover:text-gold-dark font-medium"
        >
          {t('appointment.book_another', 'Book another appointment')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={wrapper + ' space-y-4'}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            {t('appointment.full_name', 'Full Name')} <span className="text-destructive">*</span>
          </label>
          <input
            type="text" required maxLength={120}
            value={form.full_name}
            onChange={e => setForm({ ...form, full_name: e.target.value })}
            placeholder={t('appointment.full_name_ph', 'Jane Doe')}
            className={input}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            {t('appointment.email', 'Email Address')} <span className="text-destructive">*</span>
          </label>
          <input
            type="email" required maxLength={200}
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder={t('appointment.email_ph', 'you@example.com')}
            className={input}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5">
          {t('appointment.service', 'Service Needed')} <span className="text-destructive">*</span>
        </label>
        <select
          required
          value={form.service}
          onChange={e => setForm({ ...form, service: e.target.value as ServiceKey })}
          className={input}
        >
          <option value="">{t('appointment.service_ph', 'Select a service')}</option>
          {SERVICE_KEYS.map(k => (
            <option key={k} value={k}>{t(`appointment.services.${k}`)}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            {t('appointment.preferred_date', 'Preferred Date')}
          </label>
          <input
            type="date"
            value={form.preferred_date}
            onChange={e => setForm({ ...form, preferred_date: e.target.value })}
            min={new Date().toISOString().slice(0, 10)}
            className={input}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            {t('appointment.preferred_time', 'Preferred Time')}
          </label>
          <input
            type="time"
            value={form.preferred_time}
            onChange={e => setForm({ ...form, preferred_time: e.target.value })}
            className={input}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5">
          {t('appointment.message', 'Short Message')}
        </label>
        <textarea
          rows={4} maxLength={2000}
          value={form.message}
          onChange={e => setForm({ ...form, message: e.target.value })}
          placeholder={t('appointment.message_ph', 'Briefly describe your legal matter (optional)…')}
          className={input + ' resize-none'}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold text-accent-foreground font-semibold text-sm uppercase tracking-wider rounded-md hover:bg-gold-dark transition-colors shadow-gold disabled:opacity-60"
      >
        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {submitting ? t('appointment.submitting', 'Sending…') : t('appointment.submit', 'Request Consultation')}
      </button>
    </form>
  );
};

export default AppointmentForm;
