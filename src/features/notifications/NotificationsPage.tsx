import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';
import { Button, ConfirmModal, EmptyState } from '../../components/ui';
import { FadeUp, StaggerList, StaggerItem } from '../../components/motion';
import { clsx } from 'clsx';
import type { AppRequest } from '../../data/types';

// ─── Request type display config ───────────────────────────────────
const REQUEST_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  friend_request:         { label: 'Friend Request',         icon: '👤', color: '#3b82f6' },
  group_invite:          { label: 'Group Invite',           icon: '👥', color: '#f59e0b' },
  team_invite:           { label: 'Team Invite',            icon: '🏃', color: '#10b981' },
  event_invite:          { label: 'Event Invite',           icon: '📅', color: '#7c3aed' },
  tournament_invite:     { label: 'Tournament Invite',      icon: '🏆', color: '#f59e0b' },
  match_invite:          { label: 'Match Invite',           icon: '⚔️', color: '#ef4444' },
  group_join_request:    { label: 'Join Request',           icon: '🚪', color: '#8b5cf6' },
  team_join_request:     { label: 'Team Join Request',      icon: '📋', color: '#06b6d4' },
  organization_invite:   { label: 'Organization Invite',    icon: '🏛️', color: '#ec4899' },
  admin_invite:          { label: 'Admin Invite',           icon: '🔑', color: '#f97316' },
  collaboration_request: { label: 'Collaboration Request',  icon: '🤝', color: '#22c55e' },
};

const NOTIF_CONFIG: Record<string, { icon: string; color: string }> = {
  event:        { icon: '📅', color: '#7c3aed' },
  attendance:   { icon: '✅', color: '#10b981' },
  score:        { icon: '🏆', color: '#f59e0b' },
  achievement:  { icon: '🎖️', color: '#f59e0b' },
  announcement: { icon: '📢', color: '#ec4899' },
  reminder:     { icon: '⏰', color: '#8b5cf6' },
  friend_request: { icon: '👤', color: '#3b82f6' },
  group_join:     { icon: '👥', color: '#f59e0b' },
};

// ─── Helpers ────────────────────────────────────────────────────────
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

function getSenderName(users: any[], senderId: string): string {
  const u = users.find((x: any) => x.id === senderId);
  return u?.name || 'Unknown';
}

function getSenderAvatar(users: any[], senderId: string): string {
  const u = users.find((x: any) => x.id === senderId);
  return u?.avatar || '';
}

function getEntityName(req: AppRequest): string {
  if (req.metadata?.groupName) return req.metadata.groupName;
  if (req.metadata?.teamName) return req.metadata.teamName;
  if (req.metadata?.eventName) return req.metadata.eventName;
  if (req.relatedEntityId) return `#${req.relatedEntityId.slice(0, 8)}`;
  return '';
}

// ─── Request Card ───────────────────────────────────────────────────
interface RequestCardProps {
  request: AppRequest;
  users: any[];
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, users, onAccept, onDecline }) => {
  const cfg = REQUEST_CONFIG[request.requestType] || { label: request.requestType, icon: '📨', color: '#888' };
  const entityName = getEntityName(request);
  return (
    <div className="glass border border-white/10 rounded-2xl p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 overflow-hidden"
        style={{ background: `${cfg.color}20`, border: `1px solid ${cfg.color}40` }}>
        {getSenderAvatar(users, request.senderId)
          ? <img src={getSenderAvatar(users, request.senderId)} alt="" className="w-full h-full object-cover" />
          : <span>{cfg.icon}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">
          {getSenderName(users, request.senderId)}
        </p>
        <p className="text-xs text-white/50 mt-0.5">{cfg.label}{entityName ? ` • ${entityName}` : ''}</p>
        <p className="text-[11px] text-white/30 mt-0.5">{timeAgo(request.createdAt)}</p>
        <div className="flex gap-2 mt-2">
          <button onClick={() => onAccept(request.id)}
            className="text-[11px] font-bold px-4 py-1.5 rounded-xl transition-all active:scale-95"
            style={{ background: 'var(--green)', color: '#080808' }}>
            Accept
          </button>
          <button onClick={() => onDecline(request.id)}
            className="text-[11px] font-bold px-4 py-1.5 rounded-xl transition-all active:scale-95"
            style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Page ───────────────────────────────────────────────────────────
export const NotificationsPage: React.FC = () => {
  const notifications = useAppStore(s => s.notifications);
  const requests = useAppStore(s => s.requests);
  const users = useAppStore(s => s.users);
  const currentUserId = useAppStore(s => s.currentUserId);
  const markAllRead = useAppStore(s => s.markAllRead);
  const markRead = useAppStore(s => s.markNotificationRead);
  const acceptRequest = useAppStore(s => s.acceptRequest);
  const declineRequest = useAppStore(s => s.declineRequest);

  const [confirmAction, setConfirmAction] = useState<{ requestId: string; action: 'accept' | 'decline'; senderName?: string; label?: string } | null>(null);

  // Pending requests for current user
  const pendingRequests = requests.filter(
    r => r.recipientId === currentUserId && r.status === 'pending'
  );

  // Notifications "for me" — exclude read group_join (now tracked via requests)
  const myNotifications = notifications.filter(n => !n.userId || n.userId === currentUserId);
  const unread = myNotifications.filter(n => !n.read).length;

  const handleAccept = (requestId: string) => {
    const req = pendingRequests.find(r => r.id === requestId);
    if (!req) return;
    const cfg = REQUEST_CONFIG[req.requestType];
    setConfirmAction({
      requestId,
      action: 'accept',
      senderName: getSenderName(users, req.senderId),
      label: cfg?.label || 'Request',
    });
  };

  const handleDecline = (requestId: string) => {
    const req = pendingRequests.find(r => r.id === requestId);
    if (!req) return;
    const cfg = REQUEST_CONFIG[req.requestType];
    setConfirmAction({
      requestId,
      action: 'decline',
      senderName: getSenderName(users, req.senderId),
      label: cfg?.label || 'Request',
    });
  };

  const executeAction = () => {
    if (!confirmAction) return;
    const { requestId, action } = confirmAction;
    if (action === 'accept') {
      acceptRequest(requestId);
    } else {
      declineRequest(requestId);
    }
    setConfirmAction(null);
  };

  return (
    <div className="page-container !pb-24 space-y-6">
      <FadeUp>
        <h1 className="font-display font-black text-2xl text-white">Notifications</h1>
      </FadeUp>

      {/* ─── Pending Requests ─── */}
      {pendingRequests.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-[17px] text-white">Requests</h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(var(--amber-rgb),0.15)', color: 'var(--amber)' }}>
              {pendingRequests.length} pending
            </span>
          </div>
          <StaggerList className="space-y-2">
            {pendingRequests.map(req => (
              <StaggerItem key={req.id}>
                <RequestCard
                  request={req}
                  users={users}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                />
              </StaggerItem>
            ))}
          </StaggerList>
        </section>
      )}

      {/* ─── Notifications Header ─── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-[17px] text-white">Activity</h2>
          {unread > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-white/40">{unread} unread</span>
              <Button variant="ghost" size="sm" onClick={markAllRead}>Mark all read</Button>
            </div>
          )}
        </div>

        {myNotifications.length === 0 ? (
          <EmptyState
            emoji="🔔"
            title="No notifications yet"
            description="When someone sends you a request or updates an event, it'll show up here"
          />
        ) : (
          <StaggerList className="space-y-2">
            {myNotifications.map(notif => {
              const cfg = NOTIF_CONFIG[notif.type];
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
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 overflow-hidden"
                      style={{ background: `${cfg.color}20`, border: `1px solid ${cfg.color}40` }}>
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
                    </div>
                    {!notif.read && (
                      <span className="w-2 h-2 bg-violet-400 rounded-full flex-shrink-0 mt-1" />
                    )}
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerList>
        )}
      </section>

      {/* ─── Confirm Modal ─── */}
      <ConfirmModal
        open={!!confirmAction}
        title={confirmAction?.action === 'accept' ? `Accept ${confirmAction?.label || 'Request'}` : 'Decline Request'}
        message={confirmAction?.action === 'accept'
          ? `Are you sure you want to accept the ${confirmAction?.label?.toLowerCase() || 'request'} from ${confirmAction?.senderName || 'this user'}?`
          : `Are you sure you want to decline the ${confirmAction?.label?.toLowerCase() || 'request'} from ${confirmAction?.senderName || 'this user'}?`}
        confirmLabel={confirmAction?.action === 'accept' ? 'Accept' : 'Decline'}
        variant={confirmAction?.action === 'decline' ? 'danger' : 'default'}
        onConfirm={executeAction}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
};
