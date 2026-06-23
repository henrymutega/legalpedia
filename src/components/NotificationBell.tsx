import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

const NotificationBell = () => {
  const { t } = useTranslation();
  const { items, unread, markAllRead, markRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleClick = async (n: any) => {
    if (!n.read_at) await markRead(n.id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative text-primary-foreground/80 hover:text-gold transition-colors p-1.5"
        aria-label={t('notifications.title')}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-[28rem] bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <h3 className="font-semibold text-foreground text-sm">{t('notifications.title')}</h3>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                <CheckCheck size={12} /> {t('notifications.mark_all_read')}
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t('notifications.empty')}</p>
            ) : (
              <ul className="divide-y divide-border">
                {items.map(n => (
                  <li key={n.id}>
                    <button
                      onClick={() => handleClick(n)}
                      className={`w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors ${!n.read_at ? 'bg-gold/5' : ''}`}
                    >
                      <p className="text-sm font-medium text-foreground line-clamp-2">{n.title}</p>
                      {n.body && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.body}</p>}
                      <p className="text-[11px] text-muted-foreground/80 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
