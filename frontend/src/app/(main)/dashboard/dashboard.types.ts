export type AttendanceStatus = 'PRESENT' | 'ABSENT';

export type MockGroupPost = {
  id: number;
  title: string;
  message: string;
  createdAt: string;
};

export type MockAttendanceRecord = {
  status: AttendanceStatus;
  date: string;
};

export type DashboardFeedItem = {
  id: number;
  date: string;
  title: string;
  description: string;
  status: AttendanceStatus;
};
