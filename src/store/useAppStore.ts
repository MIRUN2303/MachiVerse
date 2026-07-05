import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AttendanceStatus, Notification, Event } from '../data/types';
import { EVENTS, NOTIFICATIONS, CURRENT_USER_ID, GROUPS } from '../data/mockData';

// =============================================
// HELPER: generate unique id
// =============================================
const uid = () => `e_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

interface CreateEventInput {
  groupId: string;
  title: string;
  sport: string;
  date: string;         // 'YYYY-MM-DD'
  time: string;         // 'HH:MM'
  endTime?: string;
  venue: string;
  description?: string;
  coverImage?: string;
  maxSlots?: number;
  isRecurring?: boolean;
  recurringPattern?: string;
}

interface AppState {
  // Auth
  currentUserId: string;

  // Events
  events: Event[];
  updateAttendance: (eventId: string, userId: string, status: AttendanceStatus) => void;
  createEvent: (input: CreateEventInput) => string; // returns new eventId

  // Derived helpers
  getGroupEvents: (groupId: string) => Event[];
  getNextGroupEvent: (groupId: string) => Event | undefined;
  getMyGroupsNextEvents: () => { groupId: string; event: Event }[];

  // Notifications
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  unreadCount: () => number;
  addNotification: (n: Omit<Notification, 'id' | 'timestamp'>) => void;

  // UI state
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUserId: CURRENT_USER_ID,
      events: EVENTS,
      notifications: NOTIFICATIONS,
      activeTab: 'home',

      // ---- ATTENDANCE ----
      updateAttendance: (eventId, userId, status) => {
        set(state => ({
          events: state.events.map(event => {
            if (event.id !== eventId) return event;
            const existing = event.attendance.find(a => a.userId === userId);
            if (existing) {
              return {
                ...event,
                attendance: event.attendance.map(a =>
                  a.userId === userId
                    ? { ...a, status, updatedAt: new Date().toISOString() }
                    : a
                ),
              };
            } else {
              return {
                ...event,
                attendance: [
                  ...event.attendance,
                  { userId, status, updatedAt: new Date().toISOString() },
                ],
              };
            }
          }),
        }));
      },

      // ---- CREATE EVENT (inside a group) ----
      createEvent: (input) => {
        const newId = uid();
        const currentUserId = get().currentUserId;
        const now = new Date().toISOString();

        // Lookup group sport as default if not provided
        const group = GROUPS.find(g => g.id === input.groupId);
        const sport = (input.sport || group?.sport || 'custom') as any;

        const newEvent: Event = {
          id: newId,
          title: input.title,
          sport,
          groupId: input.groupId,
          date: input.date,
          time: input.time,
          endTime: input.endTime || '',
          venue: input.venue,
          venueAddress: '',
          description: input.description || '',
          coverImage: input.coverImage || group?.banner || '',
          organizer: currentUserId,
          maxSlots: input.maxSlots || 12,
          weather: { condition: 'TBD', temp: 28, icon: '☀️', humidity: 60, wind: 10 },
          attendance: [
            { userId: currentUserId, status: 'coming', updatedAt: now },
          ],
          leagues: [],
          status: 'upcoming',
          isRecurring: input.isRecurring || false,
          recurringPattern: input.recurringPattern,
          announcements: [],
          gallery: [],
          tags: [],
        };

        set(state => ({
          events: [...state.events, newEvent],
        }));

        // Auto-add a notification
        get().addNotification({
          type: 'event',
          title: `New Event: ${input.title}`,
          body: `Created in ${group?.name || 'your group'}. Invite your crew!`,
          read: false,
          actionUrl: `/events/${newId}`,
          avatar: '📅',
        });

        return newId;
      },

      // ---- DERIVED: all events for a specific group, sorted by date ----
      getGroupEvents: (groupId) => {
        return get()
          .events
          .filter(e => e.groupId === groupId)
          .sort((a, b) => {
            // upcoming first, then by date
            if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
            if (b.status === 'upcoming' && a.status !== 'upcoming') return 1;
            return a.date.localeCompare(b.date);
          });
      },

      // ---- DERIVED: next upcoming event for a group ----
      getNextGroupEvent: (groupId) => {
        const today = new Date().toISOString().split('T')[0];
        return get()
          .events
          .filter(e => e.groupId === groupId && e.status === 'upcoming' && e.date >= today)
          .sort((a, b) => a.date.localeCompare(b.date))[0];
      },

      // ---- DERIVED: next event for each of my groups ----
      getMyGroupsNextEvents: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        const myGroupIds = GROUPS
          .filter(g => g.members.some(m => m.userId === state.currentUserId))
          .map(g => g.id);

        return myGroupIds
          .map(groupId => {
            const event = state.events
              .filter(e => e.groupId === groupId && e.status === 'upcoming' && e.date >= today)
              .sort((a, b) => a.date.localeCompare(b.date))[0];
            return event ? { groupId, event } : null;
          })
          .filter(Boolean) as { groupId: string; event: Event }[];
      },

      // ---- NOTIFICATIONS ----
      markNotificationRead: (id) => {
        set(state => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      markAllRead: () => {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
        }));
      },

      unreadCount: () => get().notifications.filter(n => !n.read).length,

      addNotification: (n) => {
        const newNotif: Notification = {
          ...n,
          id: `notif_${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        set(state => ({
          notifications: [newNotif, ...state.notifications],
        }));
      },

      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: 'machiverse-store',
      partialize: (state) => ({
        events: state.events,
        notifications: state.notifications,
        activeTab: state.activeTab,
      }),
    }
  )
);
