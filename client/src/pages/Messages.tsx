import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Send,
  MessageSquare,
  ArrowLeft,
  Calendar,
  Clock,
  Filter,
  X,
  Loader2,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Conversation {
  id: number;
  participantId: number;
  participantName: string;
  participantAvatar: string | null;
  participantRole: "coach" | "learner";
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}

interface Message {
  id: number;
  senderId: number;
  content: string;
  createdAt: Date;
  read: boolean | null;
}

export default function Messages() {
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const isEn = language === "en";
  const locale = isEn ? enUS : fr;

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations with polling for real-time updates
  const { data: conversations, isLoading: conversationsLoading, refetch: refetchConversations } = 
    trpc.message.conversations.useQuery(undefined, { 
      enabled: isAuthenticated,
      refetchInterval: 5000, // Poll every 5 seconds for new messages
    });

  // Fetch messages for selected conversation with polling
  const { data: messages, isLoading: messagesLoading, refetch: refetchMessages } = 
    trpc.message.list.useQuery(
      { conversationId: selectedConversation?.id || 0 },
      { 
        enabled: !!selectedConversation,
        refetchInterval: 3000, // Poll every 3 seconds when conversation is open
      }
    );

  // Send message mutation
  const sendMessageMutation = trpc.message.send.useMutation({
    onSuccess: () => {
      setNewMessage("");
      refetchMessages();
      refetchConversations();
    },
  });

  // Mark as read mutation
  const markAsReadMutation = trpc.message.markAsRead.useMutation({
    onSuccess: () => {
      refetchConversations();
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation && selectedConversation.unreadCount > 0) {
      markAsReadMutation.mutate({ conversationId: selectedConversation.id });
    }
  }, [selectedConversation]);

  // Filter conversations based on search
  const filteredConversations = (conversations as unknown as Conversation[] || []).filter((conv) => {
    const matchesSearch = conv.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (dateFilter === "all") return true;
    
    const messageDate = new Date(conv.lastMessageAt);
    const now = new Date();
    
    if (dateFilter === "today") {
      return isToday(messageDate);
    } else if (dateFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return messageDate >= weekAgo;
    } else if (dateFilter === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return messageDate >= monthAgo;
    }
    
    return true;
  });

  // Filter messages based on search
  const filteredMessages = (messages as unknown as Message[] || []).filter((msg) =>
    msg.content.toLowerCase().includes(messageSearchQuery.toLowerCase())
  );

  // Highlight search terms in messages
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const parts = text.split(new RegExp(`(${searchTerm})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const formatMessageDate = (date: Date) => {
    if (isToday(date)) {
      return format(date, "HH:mm", { locale });
    } else if (isYesterday(date)) {
      return isEn ? "Yesterday" : "Hier";
    }
    return format(date, "MMM d", { locale });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    sendMessageMutation.mutate({
      conversationId: selectedConversation.id,
      content: newMessage.trim(),
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-900 dark:text-slate-100" />
              <h2 className="text-xl font-semibold mb-2">
                {isEn ? "Sign in to view messages" : "Connectez-vous pour voir les messages"}
              </h2>
              <p className="text-slate-900 dark:text-slate-100 mb-4">
                {isEn 
                  ? "You need to be signed in to access your messages."
                  : "Vous devez être connecté pour accéder à vos messages."}
              </p>
              <Button asChild>
                <a href="/login">{isEn ? "Sign In" : "Se connecter"}</a>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">
              {isEn ? "Messages" : "Messages"}
            </h1>
            <p className="text-slate-900 dark:text-slate-100">
              {isEn 
                ? "Communicate with your coaches and learners"
                : "Communiquez avec vos coachs et apprenants"}
            </p>
          </div>

          {/* Main Content */}
          <Card className="overflow-hidden">
            <div className="flex h-[600px]">
              {/* Conversations List */}
              <div className={cn(
                "w-full md:w-80 border-r flex flex-col",
                selectedConversation && "hidden md:flex"
              )}>
                {/* Search & Filter Header */}
                <div className="p-4 border-b space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-900 dark:text-slate-100" />
                    <Input
                      placeholder={isEn ? "Search conversations..." : "Rechercher..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                        onClick={() => setSearchQuery("")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Date Filter */}
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {(["all", "today", "week", "month"] as const).map((filter) => (
                      <Button
                        key={filter}
                        variant={dateFilter === filter ? "default" : "outline"}
                        size="sm"
                        className="text-xs whitespace-nowrap"
                        onClick={() => setDateFilter(filter)}
                      >
                        {filter === "all" && (isEn ? "All" : "Tout")}
                        {filter === "today" && (isEn ? "Today" : "Aujourd'hui")}
                        {filter === "week" && (isEn ? "This Week" : "Cette semaine")}
                        {filter === "month" && (isEn ? "This Month" : "Ce mois")}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Conversations */}
                <ScrollArea className="flex-1">
                  {conversationsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-slate-900 dark:text-slate-100" />
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-900 dark:text-slate-100">
                      <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
                      <p className="text-sm">
                        {searchQuery 
                          ? (isEn ? "No conversations found" : "Aucune conversation trouvée")
                          : (isEn ? "No messages yet" : "Aucun message")}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredConversations.map((conv: Conversation) => (
                        <button
                          key={conv.id}
                          className={cn(
                            "w-full p-4 text-left hover:bg-muted/50 transition-colors",
                            selectedConversation?.id === conv.id && "bg-muted"
                          )}
                          onClick={() => setSelectedConversation(conv)}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={conv.participantAvatar || undefined} />
                              <AvatarFallback>
                                {conv.participantName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-medium truncate">
                                  {conv.participantName}
                                </span>
                                <span className="text-xs text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                  {formatMessageDate(new Date(conv.lastMessageAt))}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2 mt-0.5">
                                <p className="text-sm text-slate-900 dark:text-slate-100 truncate">
                                  {conv.lastMessage}
                                </p>
                                {conv.unreadCount > 0 && (
                                  <Badge className="h-5 min-w-[20px] flex items-center justify-center">
                                    {conv.unreadCount}
                                  </Badge>
                                )}
                              </div>
                              <Badge variant="outline" className="mt-1 text-xs">
                                {conv.participantRole === "coach" 
                                  ? (isEn ? "Coach" : "Coach")
                                  : (isEn ? "Learner" : "Apprenant")}
                              </Badge>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Messages Area */}
              <div className={cn(
                "flex-1 flex flex-col",
                !selectedConversation && "hidden md:flex"
              )}>
                {selectedConversation ? (
                  <>
                    {/* Conversation Header */}
                    <div className="p-4 border-b flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setSelectedConversation(null)}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedConversation.participantAvatar || undefined} />
                        <AvatarFallback>
                          {selectedConversation.participantName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{selectedConversation.participantName}</h3>
                        <Badge variant="outline" className="text-xs">
                          {selectedConversation.participantRole === "coach" 
                            ? (isEn ? "Coach" : "Coach")
                            : (isEn ? "Learner" : "Apprenant")}
                        </Badge>
                      </div>
                      
                      {/* Message Search Toggle */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowSearch(!showSearch)}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Message Search Bar */}
                    {showSearch && (
                      <div className="p-3 border-b bg-muted/30">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-900 dark:text-slate-100" />
                          <Input
                            placeholder={isEn ? "Search in conversation..." : "Rechercher dans la conversation..."}
                            value={messageSearchQuery}
                            onChange={(e) => setMessageSearchQuery(e.target.value)}
                            className="pl-9"
                            autoFocus
                          />
                          {messageSearchQuery && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                              onClick={() => setMessageSearchQuery("")}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        {messageSearchQuery && (
                          <p className="text-xs text-slate-900 dark:text-slate-100 mt-2">
                            {filteredMessages.length} {isEn ? "results found" : "résultats trouvés"}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4">
                      {messagesLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-slate-900 dark:text-slate-100" />
                        </div>
                      ) : filteredMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-slate-900 dark:text-slate-100">
                          <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
                          <p className="text-sm">
                            {messageSearchQuery
                              ? (isEn ? "No messages match your search" : "Aucun message ne correspond")
                              : (isEn ? "Start the conversation" : "Commencez la conversation")}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredMessages.map((msg: Message) => {
                            const isOwn = msg.senderId === user?.id;
                            return (
                              <div
                                key={msg.id}
                                className={cn(
                                  "flex",
                                  isOwn ? "justify-end" : "justify-start"
                                )}
                              >
                                <div
                                  className={cn(
                                    "max-w-[70%] rounded-2xl px-4 py-2",
                                    isOwn
                                      ? "bg-primary text-primary-foreground rounded-br-sm"
                                      : "bg-muted rounded-bl-sm"
                                  )}
                                >
                                  <p className="text-sm">
                                    {highlightSearchTerm(msg.content, messageSearchQuery)}
                                  </p>
                                  <div className={cn(
                                    "flex items-center gap-1 mt-1",
                                    isOwn ? "justify-end" : "justify-start"
                                  )}>
                                    <span className={cn(
                                      "text-xs",
                                      isOwn ? "text-primary-foreground/70" : "text-slate-900 dark:text-slate-100"
                                    )}>
                                      {format(new Date(msg.createdAt), "HH:mm", { locale })}
                                    </span>
                                    {isOwn && msg.read && (
                                      <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </ScrollArea>

                    {/* Message Input */}
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Textarea
                          placeholder={isEn ? "Type a message..." : "Écrivez un message..."}
                          value={newMessage}
                          onChange={(e) => {
                            setNewMessage(e.target.value);
                            // Show typing indicator
                            setIsTyping(true);
                            if (typingTimeoutRef.current) {
                              clearTimeout(typingTimeoutRef.current);
                            }
                            typingTimeoutRef.current = setTimeout(() => {
                              setIsTyping(false);
                            }, 2000);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          className="min-h-[44px] max-h-32 resize-none"
                          rows={1}
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        >
                          {sendMessageMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-900 dark:text-slate-100">
                    <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-1">
                      {isEn ? "Select a conversation" : "Sélectionnez une conversation"}
                    </h3>
                    <p className="text-sm">
                      {isEn 
                        ? "Choose a conversation from the list to start messaging"
                        : "Choisissez une conversation pour commencer"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
