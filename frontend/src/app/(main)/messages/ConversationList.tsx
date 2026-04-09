'use client';

import {
  Box,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  TextField,
  InputAdornment,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group';
import { useState } from 'react';
import { MockConversation } from './mock-data';

interface ConversationListProps {
  conversations: MockConversation[];
  activeId: number | null;
  onSelect: (id: number) => void;
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  if (diff < oneDay && now.getDate() === date.getDate()) {
    return date.toLocaleTimeString('et-EE', { hour: '2-digit', minute: '2-digit' });
  }
  if (diff < 2 * oneDay) {
    return 'Eile';
  }
  return date.toLocaleDateString('et-EE', { day: 'numeric', month: 'short' });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const avatarColors = ['#F7D372', '#B2E2E2', '#AED6F1', '#E8F3E8', '#F5B7B1', '#D7BDE2'];

export default function ConversationList({ conversations, activeId, onSelect }: ConversationListProps) {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minWidth: 0,
      }}
    >
      {/* Search */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Otsi vestlust..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: '#f5f0e8',
              '& fieldset': { border: 'none' },
            },
          }}
        />
      </Box>

      {/* Conversation list */}
      <List sx={{ flex: 1, overflow: 'auto', px: 1 }}>
        {filtered.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 4, textAlign: 'center' }}>
            Vestlusi ei leitud
          </Typography>
        )}
        {filtered.map((conv) => (
          <ListItemButton
            key={conv.id}
            selected={conv.id === activeId}
            onClick={() => onSelect(conv.id)}
            sx={{
              borderRadius: '14px',
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(247, 211, 114, 0.3)',
                '&:hover': { backgroundColor: 'rgba(247, 211, 114, 0.4)' },
              },
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
            }}
          >
            <ListItemAvatar>
              <Badge
                badgeContent={conv.unreadCount}
                color="error"
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              >
                <Avatar
                  sx={{
                    bgcolor: avatarColors[conv.id % avatarColors.length],
                    color: '#2C2C2C',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                  }}
                >
                  {conv.isGroup ? <GroupIcon /> : getInitials(conv.name)}
                </Avatar>
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: conv.unreadCount > 0 ? 700 : 500,
                      color: 'text.primary',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '140px',
                    }}
                  >
                    {conv.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, ml: 1 }}>
                    {formatTime(conv.lastMessageTime)}
                  </Typography>
                </Box>
              }
              secondary={
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                    fontWeight: conv.unreadCount > 0 ? 600 : 400,
                  }}
                >
                  {conv.lastMessage}
                </Typography>
              }
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
