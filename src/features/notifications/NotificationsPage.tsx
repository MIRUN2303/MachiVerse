import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';
import { Button, ConfirmModal } from '../../components/ui';
import { FadeUp, StaggerList, StaggerItem } from '../../components/motion';
import { clsx } from 'clsx';

const TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  event:        { icon: '📅', color: '#7c3aed' },
  attendance:   { icon: '✅', color: '#10b981' },
  score:        { icon: '🏆', color: '#f59e0b' },
  achievement:  { icon: '🎖️', color: '#f59e0b' },
  announcement: { icon: '📢', color: '#ec4899' },
  reminder:     { icon: '⏰', color: '#8b5cf6' },
  friend_request: { icon: '👤', color: '#3b82f6' },
  group_join:     { icon: '👥', color: '#f59e0b' },
};

function timeAgo(dateStr: string) {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export const NotificationsPage: React.FC = () => {
  const notifications = useAppStore(s => s.notifications);
  const markRead = useAppStore(s => s.markNotificationRead);
  const markAllRead = useAppStore(s => s.markAllRead);
  const currentUserId = useAppStore(s => s.currentUserId);
  const acceptGroupInvite = useAppStore(s => s.acceptGroupInvite);
  const declineGroupInvite = useAppStore(s => s.declineGroupInvite);
  const markNotificationRead = useAppStore(s => s.markNotificationRead);

  const [confirmGroupAction, setConfirmGroupAction] = useState<{ notifId: string; action: 'accept' | 'decline'; groupName?: string } | null>(null);

  const myNotifications = notifications.filter(n => !n.userId || n.userId === currentUserId);
  const unread = myNotifications.filter(n => !n.read).length;

  const handleAcceptGroup = (notifId: string, _actionUrl: string, body: string) => {
    const groupName = body.includes('"') ? body.split('"')[1] : 'the group';
    setConfirmGroupAction({ notifId, action: 'accept', groupName });
  };

  const handleDeclineGroup = (notifId: string) => {
    setConfirmGroupAction({ notifId, action: 'decline' });
  };

  const executeGroupAction = () => {
    if (!confirmGroupAction) return;
    const { notifId, action } = confirmGroupAction;
    const notif = myNotifications.find(n => n.id === notifId);
    if (!notif) return;
    if (action === 'accept') {
      const parts = (notif.actionUrl || '').split(':');
      if (parts.length >= 3) {
        acceptGroupInvite(parts[1], parts[2]);
      }
    } else {
      declineGroupInvite();
    }
    markNotificationRead(notifId);
    setConfirmGroupAction(null);
  };

  return (
    <div className="page-container !pb-24 space-y-4">
      <FadeUp>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-black text-2xl text-white">Notifications</h1>
            {unread > 0 && <p className="text-white/50 text-sm">{unread} unread</p>}
          </div>
          {unread > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead}>Mark all read</Button>
          )}
        </div>
      </FadeUp>

      <StaggerList className="space-y-2">
        {myNotifications.map(notif => {
          const cfg = TYPE_CONFIG[notif.type];
          return (
            <StaggerItem key={notif.id}>
              <motion.div
                onClick={() => markRead(notif.id)}
                className={clsx(
                  'flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-colors',
                  notif.read ? 'glass opacity-60' : 'glass border border-white/20'
                )}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 overflow-hidden"
                  style={{ background: `${cfg.color}20`, border: `1px solid ${cfg.color}40` }}
                >
                  {notif.avatar?.startsWith('http')
                    ? <img src={notif.avatar} alt="" className="w-full h-full object-cover" />
                    : <span>{notif.avatar || cfg.icon}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className={clsx('text-sm font-semibold', notif.read ? 'text-white/60' : 'text-white')}>
                    {notif.title}
                  </p>
                  <p className="text-white/50 text-xs mt-0.5 line-clamp-2">{notif.body}</p>
                  <p className="text-white/30 text-xs mt-1">{timeAgo(notif.timestamp)}</p>
                  {notif.type === 'group_join' && !notif.read && (
                    <div className="flex gap-2 mt-2">
                      <button onClick={(e) => { e.stopPropagation(); handleAcceptGroup(notif.id, notif.actionUrl || '', notif.body); }}
                        className="text-[11px] font-bold px-4 py-1.5 rounded-xl transition-all active:scale-95"
                        style={{ background: 'var(--green)', color: '#080808' }}>
                        Accept
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeclineGroup(notif.id); }}
                        className="text-[11px] font-bold px-4 py-1.5 rounded-xl transition-all active:scale-95"
                        style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                        Decline
                      </button>
                    </div>
                  )}
                </div>
                {!notif.read && (
                  <span className="w-2 h-2 bg-violet-400 rounded-full flex-shrink-0 mt-1" />
                )}
              </motion.div>
            </StaggerItem>
          );
        })}
      </StaggerList>

      {/* Confirm Group Action */}
      <ConfirmModal
        open={!!confirmGroupAction}
        title={confirmGroupAction?.action === 'accept' ? 'Join Group' : 'Decline Invitation'}
        message={confirmGroupAction?.action === 'accept'
          ? `Are you sure you want to join "${confirmGroupAction?.groupName || 'the group'}"?`
          : 'Are you sure you want to decline this group invitation?'}
        confirmLabel={confirmGroupAction?.action === 'accept' ? 'Join' : 'Decline'}
        variant={confirmGroupAction?.action === 'decline' ? 'danger' : 'default'}
        onConfirm={executeGroupAction}
        onCancel={() => setConfirmGroupAction(null)}
      />
    </div>
  );
};
