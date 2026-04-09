'use client';

import { useState, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import {
  mockConversations,
  mockMessages,
  currentUser,
  MockMessage,
  MockConversation,
} from './mock-data';

export default function MessagesPage() {
  const [conversations, setConversations] = useState<MockConversation[]>(mockConversations);
  const [messages, setMessages] = useState<Record<number, MockMessage[]>>(mockMessages);
  const [activeId, setActiveId] = useState<number | null>(null);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  const handleSelect = useCallback((id: number) => {
    setActiveId(id);
    // Clear unread count
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)),
    );
  }, []);

  const handleBack = useCallback(() => {
    setActiveId(null);
  }, []);

  const handleSendMessage = useCallback(
    (conversationId: number, text: string) => {
      const newMsg: MockMessage = {
        id: Date.now(),
        conversationId,
        senderId: currentUser.id,
        text,
        timestamp: new Date(),
      };

      setMessages((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] ?? []), newMsg],
      }));

      // Update last message in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? { ...c, lastMessage: text, lastMessageTime: new Date() }
            : c,
        ),
      );
    },
    [],
  );

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        // Negative margin + full height to use the parent's rounded card space fully
        m: { xs: -2, sm: -2.5, md: -3 },
        overflow: 'hidden',
        borderRadius: { xs: '16px', md: '24px' },
      }}
    >
      {/* Conversation sidebar */}
      <Box
        sx={{
          width: { xs: '100%', md: 320 },
          flexShrink: 0,
          borderRight: { md: '1px solid rgba(218, 208, 195, 0.55)' },
          display: {
            xs: activeId !== null ? 'none' : 'flex',
            md: 'flex',
          },
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <Box sx={{ px: 2, pt: 2, pb: 0.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Sõnumid
          </Typography>
        </Box>
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={handleSelect}
        />
      </Box>

      {/* Chat window */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: {
            xs: activeId !== null ? 'flex' : 'none',
            md: 'flex',
          },
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            messages={messages[activeConversation.id] ?? []}
            onSendMessage={handleSendMessage}
            onBack={handleBack}
          />
        ) : (
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 2,
              color: 'text.secondary',
            }}
          >
            <ChatBubbleOutlineIcon sx={{ fontSize: 48, opacity: 0.4 }} />
            <Typography variant="body1">Vali vestlus, et alustada</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
