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

function splitDashboardCardTitle(title: string): {
  heading: string;
} {
  const [, ...rest] = title.split(' - ');
  const groupName = rest.join(' - ').trim();

  return {
    heading: groupName ? `PÄEVAKOKKUVÕTE - ${groupName}` : 'PÄEVAKOKKUVÕTE',
  };
}

export function DashboardFeedCard({ item }: DashboardFeedCardProps) {
  const isPresent = item.status === 'PRESENT';
  const { heading } = splitDashboardCardTitle(item.title);

  return (
    <Card
      variant="outlined"
      elevation={0}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
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
                className={clsx(isPresent ? 'text-green-600' : 'text-red-500')}
                sx={{ fontWeight: 600 }}
              >
                {isPresent ? 'Present' : 'Absent'}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              component="h2"
              variant="subtitle1"
              fontWeight={600}
              sx={{ color: 'text.primary', mb: 1.5 }}
            >
              {heading}
            </Typography>
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
