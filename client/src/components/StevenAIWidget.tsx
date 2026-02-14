/**
 * Steven AI Widget - RAG-Powered Chatbot
 * 
 * Intelligent assistant connected to RusingÂcademy's
 * proprietary methodology and pedagogical documents.
 * 
 * @component StevenAIWidget
 */

import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

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
    error: '#EF4444',
    aiPurple: '#8B5CF6',
  },
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
  borderRadius: { sm: '4px', md: '8px', lg: '12px', full: '9999px' },
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ source: string; category: string }>;
  timestamp: Date;
}

interface StevenAIWidgetProps {
  learnerLevel?: 'A' | 'B' | 'C';
  category?: string;
  position?: 'bottom-right' | 'bottom-left';
  defaultOpen?: boolean;
}

export const StevenAIWidget: React.FC<StevenAIWidgetProps> = ({
  learnerLevel,
  category,
  position = 'bottom-right',
  defaultOpen = false,
}) => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `Bonjour${user?.firstName ? ` ${user.firstName}` : ''}! 👋

Je suis **Steven**, votre assistant IA pédagogique de RusingÂcademy.

Je suis spécialisé dans la préparation aux examens linguistiques du gouvernement canadien (SLE). Je peux vous aider avec:

• 📚 **Préparation SLE** - Niveaux A, B et C
• ✍️ **Expression écrite** - Techniques et exercices
• 🗣️ **Communication orale** - Stratégies d'entrevue
• 📖 **Grammaire** - Français et anglais
• 🏛️ **Vocabulaire gouvernemental**

Comment puis-je vous aider aujourd'hui?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/steven-ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages.filter(m => m.id !== 'welcome').map(m => ({ role: m.role, content: m.content })),
          learnerLevel,
          category,
        }),
      });

      const data = await response.json();
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        sources: data.sources,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Je rencontre actuellement des difficultés techniques. Veuillez réessayer ou contacter un coach Lingueefy.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const positionStyles = position === 'bottom-right'
    ? { right: tokens.spacing.lg, bottom: tokens.spacing.lg }
    : { left: tokens.spacing.lg, bottom: tokens.spacing.lg };

  return (
    <>
      {isOpen && (
        <div style={{ position: 'fixed', ...positionStyles, bottom: '100px', width: '380px', height: '520px', backgroundColor: tokens.colors.background, borderRadius: tokens.borderRadius.lg, boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 9998, border: `1px solid ${tokens.colors.aiPurple}20` }}>
          <div style={{ padding: tokens.spacing.md, background: `linear-gradient(135deg, ${tokens.colors.primary} 0%, ${tokens.colors.aiPurple} 100%)`, color: tokens.colors.background, display: 'flex', alignItems: 'center', gap: tokens.spacing.sm }}>
            <div style={{ width: '40px', height: '40px', borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🎓</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '16px' }}>Steven AI</div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>Assistant pédagogique RusingÂcademy</div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: tokens.colors.background, cursor: 'pointer', fontSize: '20px', padding: tokens.spacing.xs }} aria-label="Fermer le chat">✕</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: tokens.spacing.md, display: 'flex', flexDirection: 'column', gap: tokens.spacing.md, backgroundColor: tokens.colors.surface }}>
            {messages.map(message => (
              <div key={message.id} style={{ display: 'flex', flexDirection: 'column', alignItems: message.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '85%', padding: tokens.spacing.md, borderRadius: tokens.borderRadius.lg, backgroundColor: message.role === 'user' ? tokens.colors.primary : tokens.colors.background, color: message.role === 'user' ? tokens.colors.background : tokens.colors.text, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.5' }}>{message.content}</div>
                {message.sources && message.sources.length > 0 && (
                  <div style={{ marginTop: tokens.spacing.xs, fontSize: '11px', color: tokens.colors.textMuted, display: 'flex', flexWrap: 'wrap', gap: tokens.spacing.xs }}>
                    <span>📚 Sources:</span>
                    {message.sources.map((source, idx) => (<span key={idx} style={{ backgroundColor: `${tokens.colors.aiPurple}15`, padding: '2px 6px', borderRadius: tokens.borderRadius.sm }}>{source.source}</span>))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (<div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm, color: tokens.colors.textMuted, fontSize: '14px' }}><div style={{ width: '8px', height: '8px', borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.aiPurple, animation: 'pulse 1s infinite' }} />Steven réfléchit...</div>)}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ padding: tokens.spacing.md, borderTop: `1px solid ${tokens.colors.surface}`, display: 'flex', gap: tokens.spacing.sm }}>
            <input ref={inputRef} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={handleKeyPress} placeholder="Posez votre question..." style={{ flex: 1, padding: tokens.spacing.md, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.textMuted}30`, fontSize: '14px', outline: 'none' }} disabled={isLoading} />
            <button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()} style={{ padding: `${tokens.spacing.sm} ${tokens.spacing.md}`, backgroundColor: tokens.colors.aiPurple, color: tokens.colors.background, border: 'none', borderRadius: tokens.borderRadius.md, cursor: isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer', opacity: isLoading || !inputValue.trim() ? 0.5 : 1, fontWeight: 600 }}>Envoyer</button>
          </div>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} style={{ position: 'fixed', ...positionStyles, width: '60px', height: '60px', borderRadius: tokens.borderRadius.full, background: `linear-gradient(135deg, ${tokens.colors.primary} 0%, ${tokens.colors.aiPurple} 100%)`, color: tokens.colors.background, border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', zIndex: 9999, transition: 'transform 0.2s ease' }} aria-label={isOpen ? 'Fermer Steven AI' : 'Ouvrir Steven AI'}>{isOpen ? '✕' : '🎓'}</button>
    </>
  );
};

export default StevenAIWidget;
