import type { DashboardFeedItem } from './dashboard.types';

export const mockDashboardFeedItems: DashboardFeedItem[] = [
  {
    id: 1,
    date: '2026-04-05',
    title: 'Daily description - Bumblebees',
    description: 'Today we played outside and learned colors.',
    status: 'PRESENT',
  },
  {
    id: 2,
    date: '2026-04-04',
    title: 'Daily description - Bumblebees',
    description: 'We painted and sang songs.',
    status: 'ABSENT',
  },
  {
    id: 3,
    date: '2026-04-03',
    title: 'Daily description - Bumblebees',
    description:
      'We practiced numbers and listened to a story. ndustry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was ',
    status: 'PRESENT',
  },
];
