export type AttendanceStatus = 'PRESENT' | 'ABSENT';

export type DashboardFeedItem = {
  id: number;
  date: string;
  title: string;
  description: string;
  groupName?: string;
  childName?: string;
  childId?: number;
  status?: AttendanceStatus;
};
