import { mockDashboardFeedItems } from '@/app/(main)/dashboard/dashboard.mocks';
import { DashboardFeedCard } from '@/app/(main)/dashboard/DashboardFeedCard';
import { PageTitle } from '@/components/PageTitle';

export default function DashboardPage() {
  const feedItems = mockDashboardFeedItems;

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
