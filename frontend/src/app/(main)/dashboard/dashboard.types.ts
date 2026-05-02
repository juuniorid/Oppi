export type AttendanceStatus = 'PRESENT' | 'ABSENT';

export type DashboardFeedItem = {
  id: number;
  date: string;
  title: string;
  description: string;
  status?: AttendanceStatus;
  childId?: number;
};
