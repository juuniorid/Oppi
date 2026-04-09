'use client';

import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  InputAdornment,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupIcon from '@mui/icons-material/Group';
import { useState, useRef, useEffect } from 'react';
import { MockConversation, MockMessage, MockUser, currentUser } from './mock-data';

interface ChatWindowProps {
  conversation: MockConversation;
  messages: MockMessage[];
  onSendMessage: (conversationId: number, text: string) => void;
  onBack: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getSenderName(senderId: number, participants: MockUser[]): string {
  return participants.find((p) => p.id === senderId)?.name ?? 'Teadmata';
}

function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString('et-EE', { hour: '2-digit', minute: '2-digit' });
}

function formatDateHeader(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  if (diff < oneDay && now.getDate() === date.getDate()) return 'Täna';
  if (diff < 2 * oneDay) return 'Eile';
  return date.toLocaleDateString('et-EE', { weekday: 'long', day: 'numeric', month: 'long' });
}

function groupMessagesByDate(messages: MockMessage[]): { date: string; messages: MockMessage[] }[] {
  const groups: { date: string; messages: MockMessage[] }[] = [];

  messages.forEach((msg) => {
    const dateStr = formatDateHeader(msg.timestamp);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.date === dateStr) {
      lastGroup.messages.push(msg);
    } else {
      groups.push({ date: dateStr, messages: [msg] });
    }
  });

  return groups;
}

const avatarColors = ['secondary.main', 'info.light', 'info.main', 'success.light', 'error.light', 'secondary.light'];

export default function ChatWindow({ conversation, messages, onSendMessage, onBack }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    onSendMessage(conversation.id, text);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const grouped = groupMessagesByDate(messages);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <IconButton
          onClick={onBack}
          size="small"
          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Avatar
          sx={{
            bgcolor: avatarColors[conversation.id % avatarColors.length],
            color: 'text.primary',
            fontWeight: 600,
            width: 38,
            height: 38,
            fontSize: '0.8rem',
          }}
        >
          {conversation.isGroup ? <GroupIcon fontSize="small" /> : getInitials(conversation.name)}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {conversation.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {conversation.isGroup
              ? `${conversation.participants.length} liiget`
              : conversation.participants.find((p) => p.id !== currentUser.id)?.role === 'PARENT'
                ? 'Lapsevanem'
                : 'Õpetaja'}
          </Typography>
        </Box>
      </Box>

      {/* Message feed */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          px: 2,
          py: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {grouped.map((group) => (
          <Box key={group.date}>
            {/* Date divider */}
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  bgcolor: 'action.hover',
                  borderRadius: '8px',
                  px: 1.5,
                  py: 0.5,
                  color: 'text.secondary',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                }}
              >
                {group.date}
              </Typography>
            </Box>

            {/* Messages */}
            {group.messages.map((msg) => {
              const isMine = msg.senderId === currentUser.id;
              return (
                <Box
                  key={msg.id}
                  sx={{
                    display: 'flex',
                    justifyContent: isMine ? 'flex-end' : 'flex-start',
                    mb: 1,
                    gap: 1,
                    alignItems: 'flex-end',
                  }}
                >
                  {!isMine && (
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        fontSize: '0.65rem',
                        bgcolor: avatarColors[msg.senderId % avatarColors.length],
                        color: 'text.primary',
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(getSenderName(msg.senderId, conversation.participants))}
                    </Avatar>
                  )}
                  <Box
                    sx={{
                      maxWidth: '70%',
                      bgcolor: isMine ? 'secondary.main' : 'background.default',
                      borderRadius: isMine
                        ? '16px 16px 4px 16px'
                        : '16px 16px 16px 4px',
                      px: 2,
                      py: 1,
                    }}
                  >
                    {conversation.isGroup && !isMine && (
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 600, color: 'secondary.dark', display: 'block', mb: 0.25 }}
                      >
                        {getSenderName(msg.senderId, conversation.participants)}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.5, wordBreak: 'break-word' }}>
                      {msg.text}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        display: 'block',
                        textAlign: 'right',
                        mt: 0.5,
                        fontSize: '0.65rem',
                      }}
                    >
                      {formatMessageTime(msg.timestamp)}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input area */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <TextField
          fullWidth
          size="small"
          multiline
          maxRows={3}
          placeholder="Kirjuta sõnum..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleSend}
                  disabled={!input.trim()}
                  sx={{
                    bgcolor: input.trim() ? 'secondary.main' : 'transparent',
                    color: 'text.primary',
                    '&:hover': { bgcolor: 'secondary.dark' },
                    '&.Mui-disabled': { color: 'text.disabled' },
                    width: 34,
                    height: 34,
                  }}
                >
                  <SendIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '14px',
              backgroundColor: 'background.default',
              '& fieldset': { border: 'none' },
            },
          }}
        />
      </Box>
    </Box>
  );
}
