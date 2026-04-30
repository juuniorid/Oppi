import clsx from 'clsx';
import { Box, Card, CardContent, Divider, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import dayjs from 'dayjs';
import type { DashboardFeedItem } from './dashboard.types';

type DashboardFeedCardProps = {
  item: DashboardFeedItem;
};

function formatDashboardCardDate(value: string): string {
  const parsed = dayjs(value);
  if (!parsed.isValid()) {
    return value;
  }

  try {
    return new Intl.DateTimeFormat('et-EE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(parsed.toDate());
  } catch {
    return value;
  }
}

function getDashboardCardHeading(item: DashboardFeedItem): string {
  if (item.groupName) {
    return `Päevakokkuvõte - ${item.groupName}`;
  }

  return item.title;
}

export function DashboardFeedCard({ item }: DashboardFeedCardProps) {
  const hasStatus = item.status != null;
  const isPresent = item.status === 'PRESENT';
  const heading = getDashboardCardHeading(item);

  return (
    <Card variant="outlined" elevation={0} sx={{ bgcolor: 'background.paper' }}>
      <CardContent>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            component="time"
            variant="caption"
            color="text.secondary"
            dateTime={item.date}
            sx={{ display: 'block', fontVariantNumeric: 'tabular-nums', mb: 1 }}
          >
            {formatDashboardCardDate(item.date)}
          </Typography>

          {hasStatus ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {isPresent ? (
                  <CheckCircleIcon className="text-green-600" />
                ) : (
                  <CancelIcon className="text-red-500" />
                )}

                <Typography
                  variant="body2"
                  className={clsx(
                    isPresent ? 'text-green-600' : 'text-red-500'
                  )}
                  sx={{ fontWeight: 600 }}
                >
                  {isPresent ? 'Present' : 'Absent'}
                </Typography>
              </Box>
            </Box>
          ) : null}

          {hasStatus ? <Divider sx={{ my: 1.5 }} /> : null}

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              component="h2"
              variant="subtitle1"
              fontWeight={600}
              sx={{ color: 'text.primary', mb: 1.5 }}
            >
              {heading}
            </Typography>
            {item.childName && hasStatus ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1.5, fontWeight: 500 }}
              >
                {item.childName}
              </Typography>
            ) : null}
            {item.groupName && !hasStatus ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1.5, fontWeight: 500 }}
              >
                {item.title}
              </Typography>
            ) : null}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 1.5,
                pl: 1.5,
                borderLeft: 2,
                borderColor: 'divider',
                lineHeight: 1.6,
              }}
            >
              {item.description}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
