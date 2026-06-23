import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('display_name, email, avatar_url')
        .eq('user_id', userId)
        .maybeSingle();
      setProfile(data ?? null);
    } catch {
      setProfile(null);
    }
  };

  useEffect(() => {
    // 1) Subscribe FIRST so we never miss an event.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        // Defer Supabase calls to avoid deadlock inside the auth callback.
        setTimeout(() => fetchProfile(newSession.user.id), 0);
      } else {
        setProfile(null);
      }
    });

    // 2) Then restore existing session from storage.
    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      setUser(existing?.user ?? null);
      if (existing?.user) fetchProfile(existing.user.id);
      setLoading(false);
    }).catch(() => setLoading(false));

    // Safety net: never hang in loading forever.
    const t = setTimeout(() => setLoading(false), 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(t);
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    if (typeof window !== 'undefined') window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
