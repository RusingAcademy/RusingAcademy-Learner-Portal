/**
 * Steven AI Path Assistant Component
 * The Path Series - GC Bilingual Mastery Series™
 * 
 * AI-powered assistant for guiding learners through The Path Series
 * using RAG (Retrieval-Augmented Generation).
 * 
 * @brand Lingueefy
 * @copyright Rusinga International Consulting Ltd.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Bot, User, Send, Sparkles, BookOpen, Target, Lightbulb,
  MessageCircle, X, Minimize2, Maximize2, Volume2, VolumeX
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface StevenAIProps {
  currentPathId?: string;
  currentModuleId?: string;
  userLevel?: 'A' | 'B' | 'C';
  language?: 'en' | 'fr';
  onClose?: () => void;
}

// ============================================================================
// SUGGESTED QUESTIONS
// ============================================================================

const SUGGESTED_QUESTIONS = {
  fr: [
    "Comment me préparer pour l'examen ELS niveau B?",
    "Expliquez-moi le subjonctif en français.",
    "Quels sont les mots de transition essentiels?",
    "Comment structurer un courriel professionnel?",
    "Donnez-moi des conseils pour l'expression orale."
  ],
  en: [
    "How do I prepare for the SLE Level B exam?",
    "Explain the French subjunctive to me.",
    "What are essential transition words?",
    "How do I structure a professional email?",
    "Give me tips for oral expression."
  ]
};

// ============================================================================
// STEVEN AI COMPONENT
// ============================================================================

export const StevenAIPathAssistant: React.FC<StevenAIProps> = ({
  currentPathId,
  currentModuleId,
  userLevel = 'B',
  language = 'fr',
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial greeting
  useEffect(() => {
    const greeting: Message = {
      id: 'greeting',
      role: 'assistant',
      content: language === 'fr'
        ? "Bonjour! Je suis Steven, votre assistant IA pour The Path Series. Je suis spécialisé dans la préparation aux examens ELS pour les fonctionnaires canadiens. Comment puis-je vous aider aujourd'hui?"
        : "Hello! I'm Steven, your AI assistant for The Path Series. I specialize in SLE exam preparation for Canadian public servants. How can I help you today?",
      timestamp: new Date()
    };
    setMessages([greeting]);
  }, [language]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/steven-ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: input,
          pathId: currentPathId,
          moduleId: currentModuleId,
          sleLevel: userLevel,
          language
        })
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        sources: data.sources
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: language === 'fr'
          ? "Désolé, une erreur s'est produite. Veuillez réessayer."
          : "Sorry, an error occurred. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
      if (lastAssistantMessage) {
        const utterance = new SpeechSynthesisUtterance(lastAssistantMessage.content);
        utterance.lang = language === 'fr' ? 'fr-CA' : 'en-CA';
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    }
  };

  if (isMinimized) {
    return (
      <Button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
      >
        <Bot className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[600px] shadow-2xl flex flex-col z-50">
      {/* Header */}
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-white">
              <AvatarImage src="/steven-ai-avatar.png" />
              <AvatarFallback className="bg-white text-blue-600">
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">Steven AI</CardTitle>
              <p className="text-xs text-blue-100">
                {language === 'fr' ? 'Assistant Path Series' : 'Path Series Assistant'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggleSpeech} className="text-white hover:bg-white/20">
              {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsMinimized(true)} className="text-white hover:bg-white/20">
              <Minimize2 className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Context badges */}
        <div className="flex gap-2 mt-2">
          {currentPathId && (
            <Badge variant="secondary" className="bg-white/20 text-white text-xs">
              <BookOpen className="h-3 w-3 mr-1" />
              Path {currentPathId.replace('path-', '')}
            </Badge>
          )}
          <Badge variant="secondary" className="bg-white/20 text-white text-xs">
            <Target className="h-3 w-3 mr-1" />
            {language === 'fr' ? 'Niveau' : 'Level'} {userLevel}
          </Badge>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Lightbulb className="h-3 w-3" />
                        {language === 'fr' ? 'Sources:' : 'Sources:'} {message.sources.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 animate-pulse text-blue-600" />
                    <span className="text-sm text-muted-foreground">
                      {language === 'fr' ? 'Steven réfléchit...' : 'Steven is thinking...'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggested questions */}
          {messages.length === 1 && (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {language === 'fr' ? 'Questions suggérées:' : 'Suggested questions:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS[language].slice(0, 3).map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-1 px-2"
                    onClick={() => handleSuggestedQuestion(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Input */}
      <CardFooter className="p-3 border-t">
        <div className="flex w-full gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={language === 'fr' ? 'Posez votre question...' : 'Ask your question...'}
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default StevenAIPathAssistant;
