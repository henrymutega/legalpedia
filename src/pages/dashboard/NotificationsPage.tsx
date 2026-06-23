import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '@/hooks/useNotifications';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import EmptyState from '@/components/dashboard/EmptyState';
import LoadingGrid from '@/components/dashboard/LoadingGrid';
import { Bell, CheckCheck } from 'lucide-react';

const NotificationsPage = () => {
  const { t } = useTranslation();
  const { items, unread, loading, markAllRead, markRead } = useNotifications();

  return (
    <DashboardLayout
      title={String(t('notifications.title', 'Notifications'))}
      actions={
        unread > 0 ? (
          <button onClick={markAllRead} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-md px-3 py-1.5">
            <CheckCheck size={14} /> {String(t('notifications.mark_all_read', 'Mark all read'))}
          </button>
        ) : null
      }
    >
      {loading ? (
        <LoadingGrid rows={5} height="h-16" />
      ) : items.length === 0 ? (
        <EmptyState icon={Bell} title={String(t('notifications.empty', 'No notifications'))} />
      ) : (
        <div className="bg-card border border-border rounded-lg divide-y divide-border overflow-hidden">
          {items.map(n => {
            const inner = (
              <div className={`px-4 py-3 transition-colors ${!n.read_at ? 'bg-gold/5' : ''} hover:bg-muted/50`}>
                <p className="text-sm font-medium text-foreground">{n.title}</p>
                {n.body && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.body}</p>}
                <p className="text-[11px] text-muted-foreground/80 mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            );
            return n.link ? (
              <Link key={n.id} to={n.link} onClick={() => !n.read_at && markRead(n.id)} className="block">
                {inner}
              </Link>
            ) : (
              <button key={n.id} onClick={() => !n.read_at && markRead(n.id)} className="block w-full text-left">
                {inner}
              </button>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default NotificationsPage;
