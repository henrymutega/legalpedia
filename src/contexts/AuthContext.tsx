import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  full_name: string | null;
  phone: string | null;
  gender: string | null;
  date_of_birth: string | null;
  address: string | null;
  profile_completed: boolean | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
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
        .select('display_name, email, avatar_url, full_name, phone, gender, date_of_birth, address, profile_completed')
        .eq('user_id', userId)
        .maybeSingle();
      setProfile((data as Profile | null) ?? null);
    } catch {
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    let currentUserId: string | null = null;

    // 1) Subscribe FIRST so we never miss an event.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      // Token refresh / focus-driven events fire when a tab regains focus.
      // Only sync the session token; don't remount the app or refetch.
      const newUserId = newSession?.user?.id ?? null;
      if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setSession(newSession);
        return;
      }
      if (newUserId === currentUserId) {
        // Same user (e.g. SIGNED_IN re-fired on focus) — just sync session token.
        setSession(newSession);
        return;
      }

      currentUserId = newUserId;
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
      currentUserId = existing?.user?.id ?? null;
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
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
