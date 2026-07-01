import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ProfileFields, { ProfileFormState } from '@/components/profile/ProfileFields';

const SettingsPage = () => {
  const { t } = useTranslation();
  const { user, profile, refreshProfile } = useAuth();
  const { role } = useUserRole();
  const { toast } = useToast();
  const [form, setForm] = useState<ProfileFormState>({
    full_name: profile?.full_name || profile?.display_name || '',
    phone: profile?.phone || '',
    gender: profile?.gender || '',
    date_of_birth: profile?.date_of_birth || '',
    address: profile?.address || '',
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!user) return;
    if (!form.full_name.trim()) {
      toast({ title: String(t('profile.error', 'Could not update your profile.')), variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name.trim().slice(0, 120),
      display_name: form.full_name.trim().slice(0, 120),
      phone: form.phone.trim().slice(0, 40) || null,
      gender: form.gender || null,
      date_of_birth: form.date_of_birth || null,
      address: form.address.trim().slice(0, 200) || null,
      profile_completed: true,
    } as any).eq('user_id', user.id);
    setSaving(false);
    if (error) toast({ title: String(t('validation.something_wrong')), description: error.message, variant: 'destructive' });
    else {
      toast({ title: String(t('profile.saved', 'Profile updated')) });
      await refreshProfile();
    }
  };

  return (
    <DashboardLayout title={String(t('nav_dashboard.settings', 'Settings'))}>
      <div className="max-w-2xl space-y-6">
        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-semibold text-foreground mb-4">{String(t('settings.profile', 'Profile'))}</h2>
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-14 h-14 border border-gold/30">
              {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
              <AvatarFallback className="bg-gold/20 text-gold">{(form.full_name || profile?.email || 'U')[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground truncate">{profile?.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{String(t(`roles.${role}`, role))}</p>
            </div>
          </div>
          <ProfileFields form={form} setForm={setForm} />
          <button onClick={save} disabled={saving} className="mt-4 px-4 py-2 bg-gold text-accent-foreground font-semibold rounded-md hover:bg-gold-dark disabled:opacity-50 text-sm">
            {saving ? String(t('profile.saving', 'Saving...')) : String(t('common.save', 'Save'))}
          </button>
        </section>

        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-semibold text-foreground mb-3">{String(t('settings.language', 'Language'))}</h2>
          <div className="inline-flex bg-primary rounded-md px-3 py-2"><LanguageSwitcher /></div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
