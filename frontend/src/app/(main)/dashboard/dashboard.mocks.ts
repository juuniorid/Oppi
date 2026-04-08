import type { MockAttendanceRecord, MockGroupPost } from './dashboard.types';

export const mockGroupPosts: MockGroupPost[] = [
  {
    id: 1,
    title: 'Daily description - Group name',
    message: 'Today we played outside and learned colors.',
    createdAt: '2026-04-05T10:00:00.000Z',
  },
  {
    id: 2,
    title: 'Daily description - Group name',
    message: 'We painted and sang songs.',
    createdAt: '2026-04-04T10:00:00.000Z',
  },
  {
    id: 3,
    title: 'Daily description - Group name',
    message:
      'We practiced numbers and listened to a story. ndustry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was ',
    createdAt: '2026-04-03T10:00:00.000Z',
  },
];

export const mockAttendanceRecords: MockAttendanceRecord[] = [
  {
    status: 'ABSENT',
    date: '2026-04-04',
  },
];
