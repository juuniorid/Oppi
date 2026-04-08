import clsx from 'clsx';
import { Card, CardContent, Divider } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import type { DashboardFeedItem } from './dashboard.types';

type DashboardFeedCardProps = {
  item: DashboardFeedItem;
};

export function DashboardFeedCard({ item }: DashboardFeedCardProps) {
  const isPresent = item.status === 'PRESENT';

  return (
    <Card
      sx={{
        boxShadow: 1,
      }}
    >
      <CardContent>
        <div className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-wide text-lightInk sm:text-sm">
            {item.date}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isPresent ? (
                <CheckCircleIcon className="text-green-600" />
              ) : (
                <CancelIcon className="text-red-500" />
              )}

              <span
                className={clsx(
                  'text-sm font-semibold sm:text-base',
                  isPresent ? 'text-green-600' : 'text-red-500'
                )}
              >
                {isPresent ? 'Present' : 'Absent'}
              </span>
            </div>
          </div>

          <Divider />

          <div className="space-y-2">
            <p className="text-base font-semibold text-ink sm:text-xl">
              {item.title}
            </p>
            <p className="text-sm leading-6 text-mediumInk sm:text-base">
              {item.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
