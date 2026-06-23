import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const FREE_LIMIT = 3;
const STORAGE_KEY = 'legalpedia_guest_message_count';

function readCount(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? Math.max(0, parseInt(raw, 10) || 0) : 0;
  } catch { return 0; }
}

export function useGuestLimit() {
  const { user } = useAuth();
  const [count, setCount] = useState<number>(() => readCount());

  // Sync across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setCount(readCount());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const isGuest = !user;
  const remaining = isGuest ? Math.max(0, FREE_LIMIT - count) : Infinity;
  const limitReached = isGuest && count >= FREE_LIMIT;

  const recordQuestion = useCallback(() => {
    if (!isGuest) return;
    const next = readCount() + 1;
    try { localStorage.setItem(STORAGE_KEY, String(next)); } catch { /* ignore */ }
    setCount(next);
  }, [isGuest]);

  const reset = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    setCount(0);
  }, []);

  return { isGuest, count, remaining, limitReached, recordQuestion, reset, FREE_LIMIT };
}
