/**
 * In-App Messaging Component
 * 
 * Real-time messaging interface for Coach-Learner communication
 * within the LMS Portal and Coach Dashboard.
 * 
 * @component InAppMessaging
 */

import React, { useState, useEffect, useRef } from 'react';

// Design tokens
const tokens = {
  colors: {
    primary: '#1E3A5F',
    secondary: '#C9A227',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: '#1A1A1A',
    textMuted: '#6B7280',
    success: '#10B981',
    border: '#E5E7EB',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    full: '9999px',
  },
};

// Types
interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'coach' | 'learner';
  content: string;
  createdAt: string;
  readAt?: string;
}

interface Conversation {
  id: string;
  participants: Participant[];
  lastMessage?: Message;
  unreadCount: number;
}

interface Participant {
  id: string;
  name: string;
  role: 'coach' | 'learner';
  avatar?: string;
  isOnline: boolean;
}

interface InAppMessagingProps {
  userId: string;
  userRole: 'coach' | 'learner';
}

export const InAppMessaging: React.FC<InAppMessagingProps> = ({ userId, userRole }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [userId]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
      const interval = setInterval(() => fetchMessages(activeConversation.id), 5000);
      return () => clearInterval(interval);
    }
  }, [activeConversation?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await fetch(`/api/messages/conversations?userId=${userId}`);
      const data = await response.json();
      setConversations(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`);
      const data = await response.json();
      setMessages(data);
      await fetch('/api/messages/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, userId }),
      });
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    try {
      await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConversation.id,
          senderId: userId,
          content: newMessage.trim(),
        }),
      });
      setNewMessage('');
      fetchMessages(activeConversation.id);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getOtherParticipant = (conversation: Conversation): Participant | undefined => {
    return conversation.participants.find((p) => p.id !== userId);
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'À l\'instant';
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return date.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' });
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <p style={{ color: tokens.colors.textMuted }}>Chargement des messages...</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      height: '600px',
      border: `1px solid ${tokens.colors.border}`,
      borderRadius: tokens.borderRadius.lg,
      overflow: 'hidden',
      backgroundColor: tokens.colors.background,
    }}>
      {/* Conversations List */}
      <div style={{
        width: '300px',
        borderRight: `1px solid ${tokens.colors.border}`,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          padding: tokens.spacing.md,
          borderBottom: `1px solid ${tokens.colors.border}`,
          backgroundColor: tokens.colors.primary,
          color: tokens.colors.background,
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Messages</h3>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.length === 0 ? (
            <p style={{ padding: tokens.spacing.md, color: tokens.colors.textMuted, textAlign: 'center' }}>
              Aucune conversation
            </p>
          ) : (
            conversations.map((conv) => {
              const other = getOtherParticipant(conv);
              const isActive = activeConversation?.id === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversation(conv)}
                  style={{
                    padding: tokens.spacing.md,
                    cursor: 'pointer',
                    backgroundColor: isActive ? tokens.colors.surface : 'transparent',
                    borderBottom: `1px solid ${tokens.colors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing.sm,
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: tokens.colors.background,
                    fontWeight: 600,
                    position: 'relative',
                  }}>
                    {other?.name.charAt(0).toUpperCase()}
                    {other?.isOnline && (
                      <div style={{
                        position: 'absolute',
                        bottom: '2px',
                        right: '2px',
                        width: '10px',
                        height: '10px',
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.success,
                        border: '2px solid white',
                      }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{other?.name}</span>
                      {conv.unreadCount > 0 && (
                        <span style={{
                          backgroundColor: tokens.colors.secondary,
                          color: tokens.colors.background,
                          borderRadius: tokens.borderRadius.full,
                          padding: '2px 8px',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}>
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p style={{
                        margin: '4px 0 0',
                        fontSize: '12px',
                        color: tokens.colors.textMuted,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {conv.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div style={{
              padding: tokens.spacing.md,
              borderBottom: `1px solid ${tokens.colors.border}`,
              backgroundColor: tokens.colors.surface,
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing.sm,
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: tokens.colors.background,
                fontWeight: 600,
              }}>
                {getOtherParticipant(activeConversation)?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>{getOtherParticipant(activeConversation)?.name}</p>
                <p style={{ margin: 0, fontSize: '12px', color: tokens.colors.textMuted }}>
                  {getOtherParticipant(activeConversation)?.role === 'coach' ? 'Coach' : 'Apprenant'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: tokens.spacing.md }}>
              {messages.map((msg) => {
                const isMine = msg.senderId === userId;
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: isMine ? 'flex-end' : 'flex-start',
                      marginBottom: tokens.spacing.sm,
                    }}
                  >
                    <div style={{
                      maxWidth: '70%',
                      padding: tokens.spacing.sm + ' ' + tokens.spacing.md,
                      borderRadius: tokens.borderRadius.lg,
                      backgroundColor: isMine ? tokens.colors.primary : tokens.colors.surface,
                      color: isMine ? tokens.colors.background : tokens.colors.text,
                    }}>
                      <p style={{ margin: 0, fontSize: '14px' }}>{msg.content}</p>
                      <p style={{
                        margin: '4px 0 0',
                        fontSize: '10px',
                        opacity: 0.7,
                        textAlign: 'right',
                      }}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{
              padding: tokens.spacing.md,
              borderTop: `1px solid ${tokens.colors.border}`,
              display: 'flex',
              gap: tokens.spacing.sm,
            }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Écrivez votre message..."
                style={{
                  flex: 1,
                  padding: tokens.spacing.sm + ' ' + tokens.spacing.md,
                  border: `1px solid ${tokens.colors.border}`,
                  borderRadius: tokens.borderRadius.full,
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                style={{
                  padding: tokens.spacing.sm + ' ' + tokens.spacing.lg,
                  backgroundColor: newMessage.trim() ? tokens.colors.secondary : tokens.colors.border,
                  color: tokens.colors.background,
                  border: 'none',
                  borderRadius: tokens.borderRadius.full,
                  fontWeight: 600,
                  cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Envoyer
              </button>
            </div>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: tokens.colors.textMuted,
          }}>
            <p>Sélectionnez une conversation pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InAppMessaging;
