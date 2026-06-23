import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const SettingsPage = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { role } = useUserRole();
  const { toast } = useToast();
  const [name, setName] = useState(profile?.display_name || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ display_name: name }).eq('user_id', user.id);
    setSaving(false);
    if (error) toast({ title: String(t('validation.something_wrong')), description: error.message, variant: 'destructive' });
    else toast({ title: String(t('common.save', 'Saved')) });
  };

  return (
    <DashboardLayout title={String(t('nav_dashboard.settings', 'Settings'))}>
      <div className="max-w-2xl space-y-6">
        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-semibold text-foreground mb-4">{String(t('settings.profile', 'Profile'))}</h2>
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-14 h-14 border border-gold/30">
              {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
              <AvatarFallback className="bg-gold/20 text-gold">{(name || profile?.email || 'U')[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground truncate">{profile?.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{String(t(`roles.${role}`, role))}</p>
            </div>
          </div>
          <label className="block text-sm font-medium text-foreground mb-1">{String(t('settings.display_name', 'Display name'))}</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm mb-3" />
          <button onClick={save} disabled={saving} className="px-4 py-2 bg-gold text-accent-foreground font-semibold rounded-md hover:bg-gold-dark disabled:opacity-50 text-sm">
            {saving ? String(t('cases.creating', 'Saving...')) : String(t('common.save', 'Save'))}
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
