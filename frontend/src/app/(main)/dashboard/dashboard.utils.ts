import type {
  AttendanceStatus,
  DashboardFeedItem,
  MockAttendanceRecord,
  MockGroupPost,
} from './dashboard.types';

export function getDateKey(value: string): string {
  return value.slice(0, 10);
}

export function mapDashboardFeedItems(
  posts: MockGroupPost[],
  attendanceRecords: MockAttendanceRecord[]
): DashboardFeedItem[] {
  return posts.map((post) => {
    const postDate = getDateKey(post.createdAt);

    const attendanceForDay = attendanceRecords.find(
      (attendance) => getDateKey(attendance.date) === postDate
    );

    const status: AttendanceStatus = attendanceForDay?.status ?? 'PRESENT';

    return {
      id: post.id,
      date: postDate,
      title: post.title,
      description: post.message,
      status,
    };
  });
}
