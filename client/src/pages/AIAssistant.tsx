/**
 * AI Assistant — RusingÂcademy Learning Portal
 * Bilingual AI Language Coach with chat interface and adaptive recommendations
 * Design: Clean white light theme, accessible
 */
import DashboardLayout from "@/components/DashboardLayout";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { Link } from "wouter";

export default function AIAssistant() {
  const { t, lang } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (response) => {
      setMessages((prev) => [...prev, { role: "assistant", content: response.content }]);
    },
    onError: () => {
      setMessages((prev) => [...prev, { role: "assistant", content: lang === "fr"
        ? "Désolé, je suis temporairement indisponible. Veuillez réessayer."
        : "Sorry, I'm temporarily unavailable. Please try again." }]);
    },
  });

  const recommendationsQuery = trpc.ai.getRecommendations.useQuery();

  const handleSend = (content: string) => {
    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    chatMutation.mutate({ messages: newMessages });
  };

  const suggestedPrompts = lang === "fr" ? [
    "Comment me préparer pour l'ELS niveau B ?",
    "Expliquez-moi le subjonctif en français.",
    "Donnez-moi un exercice de vocabulaire pour la fonction publique.",
    "Quelles sont les meilleures stratégies pour l'interaction orale ?",
  ] : [
    "How do I prepare for the SLE level B exam?",
    "Explain the French subjunctive tense to me.",
    "Give me a vocabulary exercise for the public service.",
    "What are the best strategies for the oral interaction test?",
  ];

  return (
    <DashboardLayout>
      <div className="max-w-[1100px] space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              {t("nav.aiAssistant")}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {lang === "fr"
                ? "Votre coach linguistique bilingue propulsé par l'IA"
                : "Your bilingual AI-powered language coach"}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#10b981]/10 text-[#10b981] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            Online
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Chat Box — Main Area */}
          <div className="lg:col-span-2">
            <AIChatBox
              messages={messages}
              onSendMessage={handleSend}
              isLoading={chatMutation.isPending}
              placeholder={lang === "fr" ? "Posez votre question en français ou en anglais..." : "Ask your question in English or French..."}
              height={520}
              emptyStateMessage={lang === "fr"
                ? "Bonjour ! Je suis votre coach linguistique IA. Posez-moi des questions sur la grammaire, le vocabulaire, la préparation à l'ELS, ou toute autre question liée à l'apprentissage des langues."
                : "Hello! I'm your AI language coach. Ask me about grammar, vocabulary, SLE preparation, or any language learning question."}
              suggestedPrompts={suggestedPrompts}
            />
          </div>

          {/* Right Panel — Recommendations & Quick Actions */}
          <div className="space-y-4">
            {/* Recommendations */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="material-icons text-[#008090]" style={{ fontSize: "18px" }}>auto_awesome</span>
                {t("dashboard.recommended")}
              </h2>
              <div className="space-y-2">
                {recommendationsQuery.data?.map((rec, idx) => (
                  <Link key={idx} href={rec.link}>
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                      <span className="material-icons text-[#008090] mt-0.5" style={{ fontSize: "18px" }}>{rec.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 group-hover:text-[#008090] transition-colors">{rec.title}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{rec.description}</p>
                      </div>
                    </div>
                  </Link>
                )) ?? (
                  <div className="text-center py-4">
                    <span className="material-icons text-gray-300" style={{ fontSize: "24px" }}>lightbulb</span>
                    <p className="text-xs text-gray-400 mt-1">Loading recommendations...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Topics */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="material-icons text-[#f5a623]" style={{ fontSize: "18px" }}>tips_and_updates</span>
                {lang === "fr" ? "Sujets rapides" : "Quick Topics"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: lang === "fr" ? "Grammaire" : "Grammar", emoji: "📝" },
                  { label: lang === "fr" ? "Vocabulaire" : "Vocabulary", emoji: "📚" },
                  { label: "SLE Tips", emoji: "🎯" },
                  { label: lang === "fr" ? "Verbes" : "Verbs", emoji: "🔤" },
                  { label: lang === "fr" ? "Écriture" : "Writing", emoji: "✍️" },
                  { label: lang === "fr" ? "Oral" : "Speaking", emoji: "🗣️" },
                ].map((topic) => (
                  <button key={topic.label}
                    onClick={() => handleSend(lang === "fr"
                      ? `Aidez-moi avec ${topic.label.toLowerCase()}`
                      : `Help me with ${topic.label.toLowerCase()}`)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 text-gray-600 hover:border-[#008090] hover:text-[#008090] hover:bg-[#008090]/5 transition-all">
                    {topic.emoji} {topic.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Capabilities */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                {lang === "fr" ? "Capacités" : "Capabilities"}
              </h3>
              <ul className="space-y-1.5">
                {[
                  lang === "fr" ? "Explications grammaticales FR/EN" : "Grammar explanations FR/EN",
                  lang === "fr" ? "Préparation aux examens ELS" : "SLE exam preparation",
                  lang === "fr" ? "Exercices de vocabulaire" : "Vocabulary exercises",
                  lang === "fr" ? "Correction de textes" : "Text correction",
                  lang === "fr" ? "Stratégies d'apprentissage" : "Learning strategies",
                ].map((cap) => (
                  <li key={cap} className="flex items-center gap-2 text-[11px] text-gray-500">
                    <span className="material-icons text-[#10b981]" style={{ fontSize: "12px" }}>check_circle</span>
                    {cap}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
