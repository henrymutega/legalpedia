import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Supabase establishes a recovery session when the user clicks the email link.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError(t('auth.passwords_no_match', 'Passwords do not match'));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    await supabase.auth.signOut();
    toast({
      title: t('auth.password_updated', 'Password updated'),
      description: t('auth.password_updated_desc', 'Your password has been updated. Please sign in.'),
    });
    navigate('/login', { replace: true });
  };

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center bg-background px-4 py-16">
        <div className="w-full max-w-md bg-card rounded-lg shadow-card p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
              <KeyRound size={24} className="text-gold" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              {t('auth.set_new_password', 'Set a new password')}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {t('auth.set_new_password_subtitle', 'Enter a new password for your account')}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
          )}

          {!ready ? (
            <p className="text-center text-sm text-muted-foreground">
              {t('auth.invalid_reset_link', 'Invalid or expired reset link. Please request a new one.')}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t('auth.new_password', 'New password')}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t('auth.confirm_new_password', 'Confirm new password')}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gold text-accent-foreground font-semibold rounded-md hover:bg-gold-dark transition-colors disabled:opacity-50"
              >
                {loading ? t('auth.updating_password', 'Updating...') : t('auth.update_password', 'Update password')}
              </button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ResetPasswordPage;
