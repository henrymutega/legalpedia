import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, UserCog } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ProfileFields, { ProfileFormState } from '@/components/profile/ProfileFields';

const DISMISS_KEY = 'profile_prompt_dismissed_at';
const REMIND_AFTER = 1000 * 60 * 60 * 24; // 24h

const ProfileCompletionModal = () => {
  const { t } = useTranslation();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileFormState>({
    full_name: '',
    phone: '',
    gender: '',
    date_of_birth: '',
    address: '',
  });

  useEffect(() => {
    if (loading || !user || !profile) return;
    if (profile.profile_completed) return;
    const dismissed = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (dismissed && Date.now() - dismissed < REMIND_AFTER) return;
    setForm({
      full_name: profile.full_name || profile.display_name || '',
      phone: profile.phone || '',
      gender: profile.gender || '',
      date_of_birth: profile.date_of_birth || '',
      address: profile.address || '',
    });
    setOpen(true);
  }, [loading, user, profile]);

  const later = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setOpen(false);
  };

  const save = async () => {
    if (!user) return;
    if (!form.full_name.trim() || !form.phone.trim()) {
      toast({ title: t('profile.error', 'Could not update your profile.'), variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name.trim().slice(0, 120),
        display_name: form.full_name.trim().slice(0, 120),
        phone: form.phone.trim().slice(0, 40),
        gender: form.gender || null,
        date_of_birth: form.date_of_birth || null,
        address: form.address.trim().slice(0, 200) || null,
        profile_completed: true,
      } as any)
      .eq('user_id', user.id);
    setSaving(false);
    if (error) {
      toast({ title: t('profile.error', 'Could not update your profile.'), description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: t('profile.saved', 'Profile updated') });
    await refreshProfile();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) later(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog size={18} className="text-gold" />
            {t('profile.complete_title', 'Complete your profile')}
          </DialogTitle>
          <DialogDescription>{t('profile.complete_desc', 'Please fill in a few details so we can serve you better.')}</DialogDescription>
        </DialogHeader>
        <ProfileFields form={form} setForm={setForm} />
        <div className="flex items-center justify-end gap-3 pt-2">
          <button onClick={later} className="text-sm text-muted-foreground hover:text-foreground font-medium">
            {t('profile.later', 'Remind me later')}
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold text-accent-foreground font-semibold text-sm rounded-md hover:bg-gold-dark transition-colors disabled:opacity-60"
          >
            {saving && <Loader2 size={15} className="animate-spin" />}
            {saving ? t('profile.saving', 'Saving...') : t('profile.save', 'Save Profile')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileCompletionModal;
