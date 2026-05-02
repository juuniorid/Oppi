import clsx from 'clsx';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import dayjs from 'dayjs';
import type { DashboardFeedItem } from './dashboard.types';

type DashboardFeedCardProps = {
  item: DashboardFeedItem;
  canManage?: boolean;
  isDeleting?: boolean;
  onEdit?: (item: DashboardFeedItem) => void;
  onDelete?: (item: DashboardFeedItem) => void;
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

export function DashboardFeedCard({
  item,
  canManage = false,
  isDeleting = false,
  onEdit,
  onDelete,
}: DashboardFeedCardProps) {
  const hasStatus = item.status != null;
  const isPresent = item.status === 'PRESENT';

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

          <Typography
            component="h2"
            variant="subtitle1"
            fontWeight={600}
            sx={{ color: 'text.primary', mb: 1.5 }}
          >
            {item.title}
          </Typography>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1.5, lineHeight: 1.6 }}
            >
              {item.description}
            </Typography>
          </Box>

          {hasStatus ? <Divider sx={{ my: 1.5 }} /> : null}

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
                  {isPresent ? 'Kohal' : 'Puudus'}
                </Typography>
              </Box>
            </Box>
          ) : null}

          {canManage ? (
            <Stack
              direction="row"
              justifyContent="flex-end"
              spacing={1}
              sx={{ mt: 2 }}
            >
              <Button
                size="small"
                variant="neutral"
                onClick={() => onEdit?.(item)}
              >
                Muuda
              </Button>
              <Button
                size="small"
                variant="negative"
                onClick={() => onDelete?.(item)}
                disabled={isDeleting}
              >
                {isDeleting ? 'Kustutan...' : 'Kustuta'}
              </Button>
            </Stack>
          ) : null}
        </Box>
      </CardContent>
    </Card>
  );
}
