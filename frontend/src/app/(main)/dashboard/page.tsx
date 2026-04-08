import {
  mockAttendanceRecords,
  mockGroupPosts,
} from '@/app/(main)/dashboard/dashboard.mocks';
import { mapDashboardFeedItems } from '@/app/(main)/dashboard/dashboard.utils';
import { DashboardFeedCard } from '@/app/(main)/dashboard/DashboardFeedCard';
import { PageTitle } from '@/components/PageTitle';

export default function DashboardPage() {
  const feedItems = mapDashboardFeedItems(
    mockGroupPosts,
    mockAttendanceRecords
  );

  return (
    <div>
      <PageTitle>Avaleht</PageTitle>

      <div className="space-y-6">
        {feedItems.map((item) => (
          <DashboardFeedCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
