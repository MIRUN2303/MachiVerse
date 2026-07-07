import { useAppStore } from '../store/useAppStore';

export function getUserById(id: string) {
  return useAppStore.getState().users.find((u: any) => u.id === id);
}

export function getGroupById(id: string) {
  return useAppStore.getState().groups.find((g: any) => g.id === id);
}

export function getGroupEvents(groupId: string) {
  return useAppStore.getState().getGroupEvents(groupId);
}

export function getUpcomingGroupEvents(groupId: string) {
  const all = useAppStore.getState().getGroupEvents(groupId);
  return all.filter((e: any) => e.status === 'upcoming');
}

export function getCompletedGroupEvents(groupId: string) {
  const all = useAppStore.getState().getGroupEvents(groupId);
  return all.filter((e: any) => e.status !== 'upcoming');
}

export function computeMemberGroupStats(userId: string, groupId: string) {
  const group = useAppStore.getState().groups.find((g: any) => g.id === groupId);
  const member = group?.members.find((m: any) => m.userId === userId);
  return member?.stats || { matchesPlayed: 0, wins: 0, losses: 0, winRate: 0, attendanceRate: 0, currentStreak: 0, points: 0 };
}

export function getOverallWinRate(userId: string) {
  const user = useAppStore.getState().users.find((u: any) => u.id === userId);
  return user?.stats.winRate || 0;
}
