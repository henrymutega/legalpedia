import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { LogIn } from 'lucide-react';

const AdminLoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', data.user.id)
      .in('role', ['admin', 'super_admin']);

    if (!roles || roles.length === 0) {
      setError(t('auth.no_admin_access'));
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary px-4">
      <div className="w-full max-w-md bg-card rounded-lg shadow-card p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
            <LogIn size={24} className="text-gold" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">{t('auth.admin_login')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('auth.admin_subtitle')}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('auth.email')}</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('auth.password')}</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gold text-accent-foreground font-semibold rounded-md hover:bg-gold-dark transition-colors disabled:opacity-50"
          >
            {loading ? t('auth.submitting') : t('auth.submit')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
