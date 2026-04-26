'use client';

/**
 * Announcements feed ("Teated" in the app UI). Renders a chronological list of
 * {@link TeatedItem} rows using Material UI. Supports two row kinds: broadcast
 * posts to a group and (future) personal messages from a teacher.
 *
 * UI copy is Estonian for end users; comments in this file are English for devs.
 */
import BusinessIcon from '@mui/icons-material/Business';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import NotificationsIcon from '@mui/icons-material/Notifications';
import {
  Avatar,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  Paper,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useMemo } from 'react';

/** One row in the announcements feed: either a group post or a personal note. */
export type TeatedItem =
  | {
      kind: 'group';
      id: string;
      title: string;
      body: string;
      at: string;
    }
  | {
      kind: 'personal';
      id: string;
      senderName: string;
      groupName: string;
      body: string;
      at: string;
    }
  | {
      kind: 'notification';
      id: string;
      notificationId: number;
      title: string;
      body: string;
      at: string;
      readAt: string | null;
    };

/** Up to two letters for avatar chips (first + last name when both exist). */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** MUI palette slots for personal rows; stable per item id via {@link avatarColorIndex}. */
const personalAvatarBg = [
  'secondary.main',
  'info.light',
  'info.main',
  'success.light',
  'error.light',
  'secondary.light',
] as const;

/** Deterministic palette index so the same row id keeps the same avatar color. */
function avatarColorIndex(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % personalAvatarBg.length;
}

/**
 * Formats an ISO timestamp for display. Uses `et-EE` to match the product locale.
 * On parse failure, returns the raw string so the UI still shows something.
 */
export function formatTeatedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat('et-EE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

type TeatedFeedProps = {
  items: TeatedItem[];
  onNotificationOpen?: (notificationId: number, readAt: string | null) => void;
  isNotificationPending?: (notificationId: number) => boolean;
};

export function TeatedFeed({
  items,
  onNotificationOpen,
  isNotificationPending,
}: TeatedFeedProps) {
  // Newest first so the latest announcement is at the top.
  const sorted = useMemo(
    () =>
      [...items].sort(
        (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
      ),
    [items]
  );

  // Empty state: no loading/error UI here; parent may pass [] after fetch failure.
  if (sorted.length === 0) {
    return (
      <Paper
        variant="outlined"
        elevation={0}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            minHeight: '40vh',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            px: 2,
            py: 6,
            textAlign: 'center',
          }}
        >
          <Avatar
            sx={(theme) => ({
              width: 64,
              height: 64,
              bgcolor: alpha(theme.palette.secondary.main, 0.35),
              color: 'warning.main',
            })}
            aria-hidden
          >
            <InboxOutlinedIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 280 }}
          >
            Sul pole veel teateid.
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      variant="outlined"
      elevation={0}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <List disablePadding sx={{ py: 0 }}>
        {sorted.map((item, index) => {
          // Notification rows are interactive (mark-as-read), others are static.
          // Add button-like semantics so keyboard users can activate them too.
          const isNotificationInteractive =
            item.kind === 'notification' && Boolean(onNotificationOpen);
          const notificationPending =
            item.kind === 'notification' && isNotificationPending
              ? isNotificationPending(item.notificationId)
              : false;
          const canActivateNotification =
            isNotificationInteractive && !notificationPending;

          return (
          <ListItem
            key={item.id}
            alignItems="flex-start"
            divider={index < sorted.length - 1}
            role={canActivateNotification ? 'button' : undefined}
            tabIndex={canActivateNotification ? 0 : undefined}
            aria-disabled={
              item.kind === 'notification' && notificationPending
                ? true
                : undefined
            }
            onClick={
              canActivateNotification
                ? () => onNotificationOpen?.(item.notificationId, item.readAt)
                : undefined
            }
            onKeyDown={
              canActivateNotification
                ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onNotificationOpen?.(item.notificationId, item.readAt);
                    }
                  }
                : undefined
            }
            sx={{
              px: { xs: 2, sm: 2.5 },
              py: 2,
              cursor: canActivateNotification ? 'pointer' : 'default',
              opacity:
                item.kind === 'notification' && notificationPending ? 0.7 : 1,
              bgcolor:
                item.kind === 'notification' && item.readAt == null
                  ? 'action.selected'
                  : undefined,
              transition: 'background-color 150ms ease',
              '&:hover':
                canActivateNotification
                  ? { bgcolor: 'action.hover' }
                  : undefined,
              '&:focus-visible':
                canActivateNotification
                  ? { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: -2 }
                  : undefined,
            }}
          >
            <ListItemAvatar sx={{ minWidth: 56 }}>
              {item.kind === 'group' ? (
                <Avatar
                  sx={{
                    bgcolor: 'secondary.main',
                    color: 'warning.main',
                    boxShadow: 1,
                    border: '2px solid',
                    borderColor: 'background.paper',
                  }}
                  aria-hidden
                >
                  <BusinessIcon />
                </Avatar>
              ) : item.kind === 'notification' ? (
                <Avatar
                  sx={{
                    bgcolor: 'info.light',
                    color: 'info.dark',
                    boxShadow: 1,
                    border: '2px solid',
                    borderColor: 'background.paper',
                  }}
                  aria-hidden
                >
                  <NotificationsIcon />
                </Avatar>
              ) : (
                <Avatar
                  sx={{
                    bgcolor: personalAvatarBg[avatarColorIndex(item.id)],
                    color: 'text.primary',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    boxShadow: 1,
                    border: '2px solid',
                    borderColor: 'background.paper',
                  }}
                  aria-hidden
                >
                  {initials(item.senderName)}
                </Avatar>
              )}
            </ListItemAvatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              {item.kind === 'group' ? (
                <>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ lineHeight: 1.2, letterSpacing: '0.08em' }}
                  >
                    Rühm
                  </Typography>
                  <Typography
                    component="h2"
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{ mt: 0.25, color: 'text.primary' }}
                  >
                    {item.title}
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
                    {item.body}
                  </Typography>
                  <Typography
                    component="time"
                    variant="caption"
                    color="text.secondary"
                    dateTime={item.at}
                    sx={{ mt: 1, display: 'block', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatTeatedAt(item.at)}
                  </Typography>
                </>
              ) : item.kind === 'notification' ? (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="overline"
                      color="text.secondary"
                      sx={{ lineHeight: 1.2, letterSpacing: '0.08em' }}
                    >
                      Teavitus
                    </Typography>
                    {item.readAt == null ? (
                      <Box
                        component="span"
                        aria-label="Lugemata teavitus"
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '9999px',
                          bgcolor: 'primary.main',
                          display: 'inline-block',
                        }}
                      />
                    ) : null}
                  </Box>
                  <Typography
                    component="h2"
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{ mt: 0.25, color: 'text.primary' }}
                  >
                    {item.title}
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
                    {item.body}
                  </Typography>
                  <Typography
                    component="time"
                    variant="caption"
                    color="text.secondary"
                    dateTime={item.at}
                    sx={{ mt: 1, display: 'block', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatTeatedAt(item.at)}
                  </Typography>
                </>
              ) : (
                <>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ lineHeight: 1.2, letterSpacing: '0.08em' }}
                  >
                    Õpetaja
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{ mt: 0.25, color: 'text.primary' }}
                  >
                    {item.senderName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                    {item.groupName}
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
                    {item.body}
                  </Typography>
                  <Typography
                    component="time"
                    variant="caption"
                    color="text.secondary"
                    dateTime={item.at}
                    sx={{ mt: 1, display: 'block', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatTeatedAt(item.at)}
                  </Typography>
                </>
              )}
            </Box>
          </ListItem>
          );
        })}
      </List>
    </Paper>
  );
}
