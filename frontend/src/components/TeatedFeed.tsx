'use client';

import BusinessIcon from '@mui/icons-material/Business';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
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
    };

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const personalAvatarBg = [
  'secondary.main',
  'info.light',
  'info.main',
  'success.light',
  'error.light',
  'secondary.light',
] as const;

function avatarColorIndex(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % personalAvatarBg.length;
}

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
};

export function TeatedFeed({ items }: TeatedFeedProps) {
  const sorted = useMemo(
    () =>
      [...items].sort(
        (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
      ),
    [items]
  );

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
        {sorted.map((item, index) => (
          <ListItem
            key={item.id}
            alignItems="flex-start"
            divider={index < sorted.length - 1}
            sx={{
              px: { xs: 2, sm: 2.5 },
              py: 2,
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
        ))}
      </List>
    </Paper>
  );
}
