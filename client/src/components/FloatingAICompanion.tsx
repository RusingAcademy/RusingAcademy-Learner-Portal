/**
 * FloatingAICompanion — persistent bottom-right SLE AI Companion widget.
 * Appears on all authenticated pages as a small teal bubble.
 * Expands into a full chat panel with the AI Language Coach.
 */
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import type { Message } from "@/components/AIChatBox";
import { Streamdown } from "streamdown";

const SYSTEM_PROMPT: Message = {
  role: "system",
  content: `You are the RusingÂcademy SLE AI Companion — a bilingual (English/French) assistant that lives in the bottom-right corner of the learning portal. You are concise, friendly, and focused on helping Canadian public servants with their SLE preparation. Keep responses short (2-3 paragraphs max) since you're in a compact chat widget. Provide:
- Quick grammar tips and corrections
- SLE exam strategies for Reading, Writing, and Oral
- Vocabulary relevant to the federal public service
- Encouragement and motivation
Match the user's language. If they write in French, respond in French.`,
};

const QUICK_PROMPTS = [
  { label: "SLE Tips", icon: "school", prompt: "Give me 3 quick tips for my SLE oral exam." },
  { label: "Grammar", icon: "spellcheck", prompt: "Explain the difference between passé composé and imparfait." },
  { label: "Vocabulary", icon: "translate", prompt: "Give me 5 useful French expressions for a government meeting." },
  { label: "Motivation", icon: "emoji_events", prompt: "I'm feeling discouraged about my SLE preparation. Can you help?" },
];

export default function FloatingAICompanion() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([SYSTEM_PROMPT]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (response) => {
      setMessages((prev) => [...prev, { role: "assistant", content: response.content }]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm temporarily unavailable. Please try again." },
      ]);
    },
  });

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, chatMutation.isPending]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  if (!isAuthenticated) return null;

  const displayMessages = messages.filter((m) => m.role !== "system");

  const handleSend = (content: string) => {
    if (!content.trim() || chatMutation.isPending) return;
    const newMessages = [...messages, { role: "user" as const, content: content.trim() }];
    setMessages(newMessages);
    setInput("");
    chatMutation.mutate({ messages: newMessages.map((m) => ({ role: m.role, content: m.content })) });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-4 z-[60] w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ height: "520px", animation: "fadeInUp 0.25s ease-out" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#008090] to-[#006d7a] text-white flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="material-icons" style={{ fontSize: "18px" }}>smart_toy</span>
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">SLE AI Companion</p>
                <p className="text-[10px] text-white/70">Your bilingual language coach</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setMessages([SYSTEM_PROMPT]);
                }}
                className="w-7 h-7 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors"
                title="New conversation"
              >
                <span className="material-icons" style={{ fontSize: "16px" }}>refresh</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors"
                title="Close"
              >
                <span className="material-icons" style={{ fontSize: "18px" }}>close</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50/50">
            {displayMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-14 h-14 rounded-full bg-[#008090]/10 flex items-center justify-center mb-4">
                  <span className="material-icons text-[#008090]" style={{ fontSize: "28px" }}>smart_toy</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Hello! I'm your SLE Companion</p>
                <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                  Ask me anything about your SLE preparation, grammar, vocabulary, or exam strategies.
                </p>
                <div className="grid grid-cols-2 gap-2 w-full">
                  {QUICK_PROMPTS.map((qp) => (
                    <button
                      key={qp.label}
                      onClick={() => handleSend(qp.prompt)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:border-[#008090]/30 hover:bg-[#008090]/5 transition-all text-left"
                    >
                      <span className="material-icons text-[#008090]" style={{ fontSize: "16px" }}>{qp.icon}</span>
                      <span className="text-[11px] font-medium text-gray-700">{qp.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {displayMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-6 h-6 rounded-full bg-[#008090]/10 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                        <span className="material-icons text-[#008090]" style={{ fontSize: "14px" }}>smart_toy</span>
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#008090] text-white rounded-br-sm"
                          : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm max-w-none [&_p]:mb-1 [&_p]:mt-0 [&_li]:text-xs [&_ul]:my-1 [&_ol]:my-1">
                          <Streamdown>{msg.content}</Streamdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                {chatMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="w-6 h-6 rounded-full bg-[#008090]/10 flex items-center justify-center mr-2 flex-shrink-0">
                      <span className="material-icons text-[#008090]" style={{ fontSize: "14px" }}>smart_toy</span>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl rounded-bl-sm px-4 py-3 shadow-sm">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#008090]/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 rounded-full bg-[#008090]/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 rounded-full bg-[#008090]/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-gray-100 bg-white flex-shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="flex items-end gap-2"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                rows={1}
                className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008090]/20 focus:border-[#008090]/40 max-h-20 bg-gray-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || chatMutation.isPending}
                className="w-9 h-9 rounded-xl bg-[#008090] hover:bg-[#006d7a] disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
              >
                <span className="material-icons text-white" style={{ fontSize: "18px" }}>
                  {chatMutation.isPending ? "hourglass_empty" : "send"}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-[60] w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isOpen
            ? "bg-gray-600 hover:bg-gray-700"
            : "bg-gradient-to-br from-[#008090] to-[#006d7a] hover:shadow-xl"
        }`}
        aria-label={isOpen ? "Close AI Companion" : "Open AI Companion"}
      >
        <span className="material-icons text-white" style={{ fontSize: "24px" }}>
          {isOpen ? "close" : "smart_toy"}
        </span>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#f5a623] border-2 border-white flex items-center justify-center">
            <span className="text-[8px] font-bold text-white">AI</span>
          </span>
        )}
      </button>
    </>
  );
}
