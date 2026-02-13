/**
 * Flashcards Page — Deck management + SM-2 spaced repetition review
 * Sprint 17: Notes & Flashcards
 */
import { useState, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import Sidebar from "@/components/Sidebar";
import { getLoginUrl } from "@/const";

const DECK_COLORS = ["teal", "blue", "amber", "rose", "purple", "green", "orange"];
const COLOR_MAP: Record<string, { bg: string; text: string; light: string }> = {
  teal: { bg: "bg-[#008090]", text: "text-[#008090]", light: "bg-teal-50" },
  blue: { bg: "bg-blue-600", text: "text-blue-600", light: "bg-blue-50" },
  amber: { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50" },
  rose: { bg: "bg-rose-500", text: "text-rose-600", light: "bg-rose-50" },
  purple: { bg: "bg-purple-600", text: "text-purple-600", light: "bg-purple-50" },
  green: { bg: "bg-green-600", text: "text-green-600", light: "bg-green-50" },
  orange: { bg: "bg-orange-500", text: "text-orange-600", light: "bg-orange-50" },
};

function getColor(c: string) { return COLOR_MAP[c] ?? COLOR_MAP.teal; }

type ViewMode = "decks" | "cards" | "review";

export default function Flashcards() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("decks");
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const [showDeckForm, setShowDeckForm] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);

  // Deck form
  const [deckName, setDeckName] = useState("");
  const [deckDesc, setDeckDesc] = useState("");
  const [deckColor, setDeckColor] = useState("teal");

  // Card form
  const [cardFront, setCardFront] = useState("");
  const [cardBack, setCardBack] = useState("");
  const [cardHint, setCardHint] = useState("");

  // Review state
  const [reviewIndex, setReviewIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewComplete, setReviewComplete] = useState(false);

  const utils = trpc.useUtils();
  const { data: decks = [], isLoading: decksLoading } = trpc.flashcards.listDecks.useQuery();
  const { data: stats } = trpc.flashcards.getStats.useQuery();
  const { data: cards = [] } = trpc.flashcards.listCards.useQuery(
    { deckId: selectedDeckId! },
    { enabled: !!selectedDeckId && viewMode === "cards" }
  );
  const { data: dueCards = [] } = trpc.flashcards.getDueCards.useQuery(
    { deckId: selectedDeckId ?? undefined },
    { enabled: viewMode === "review" }
  );

  const createDeck = trpc.flashcards.createDeck.useMutation({
    onSuccess: () => { utils.flashcards.listDecks.invalidate(); setShowDeckForm(false); setDeckName(""); setDeckDesc(""); },
  });
  const deleteDeck = trpc.flashcards.deleteDeck.useMutation({
    onSuccess: () => { utils.flashcards.listDecks.invalidate(); setViewMode("decks"); setSelectedDeckId(null); },
  });
  const createCard = trpc.flashcards.createCard.useMutation({
    onSuccess: () => { utils.flashcards.listCards.invalidate(); utils.flashcards.listDecks.invalidate(); utils.flashcards.getStats.invalidate(); setShowCardForm(false); setCardFront(""); setCardBack(""); setCardHint(""); },
  });
  const deleteCard = trpc.flashcards.deleteCard.useMutation({
    onSuccess: () => { utils.flashcards.listCards.invalidate(); utils.flashcards.listDecks.invalidate(); utils.flashcards.getStats.invalidate(); },
  });
  const reviewCard = trpc.flashcards.reviewCard.useMutation({
    onSuccess: () => { utils.flashcards.getStats.invalidate(); utils.flashcards.getDueCards.invalidate(); },
  });

  const handleReview = useCallback((quality: number) => {
    if (!dueCards[reviewIndex]) return;
    reviewCard.mutate({ cardId: dueCards[reviewIndex].id, quality });
    setIsFlipped(false);
    if (reviewIndex + 1 >= dueCards.length) {
      setReviewComplete(true);
    } else {
      setReviewIndex(prev => prev + 1);
    }
  }, [dueCards, reviewIndex, reviewCard]);

  function startReview(deckId?: number) {
    setSelectedDeckId(deckId ?? null);
    setViewMode("review");
    setReviewIndex(0);
    setIsFlipped(false);
    setReviewComplete(false);
  }

  if (authLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-2 border-[#008090] border-t-transparent rounded-full" /></div>;
  if (!user) { window.location.href = getLoginUrl(); return null; }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className="flex-1 lg:ml-[240px] overflow-y-auto">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 p-4 bg-white border-b border-gray-200 sticky top-0 z-30">
          <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-lg hover:bg-gray-100">
            <span className="material-icons text-gray-600">menu</span>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Flashcards</h1>
        </div>

        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3">
                {viewMode !== "decks" && (
                  <button onClick={() => { setViewMode("decks"); setSelectedDeckId(null); }} className="p-1.5 rounded-lg hover:bg-gray-100">
                    <span className="material-icons text-gray-500">arrow_back</span>
                  </button>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="material-icons text-[#008090]">style</span>
                    {viewMode === "decks" ? "Flashcards" : viewMode === "cards" ? decks.find(d => d.id === selectedDeckId)?.name ?? "Deck" : "Review Session"}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {viewMode === "decks" ? `${decks.length} decks · ${stats?.total ?? 0} cards · ${stats?.dueToday ?? 0} due today` :
                     viewMode === "cards" ? `${cards.length} cards` :
                     `${dueCards.length} cards to review`}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {viewMode === "decks" && (
                <>
                  <button
                    onClick={() => startReview()}
                    disabled={!stats?.dueToday}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#008090] border border-[#008090] flex items-center gap-2 hover:bg-[#008090]/5 disabled:opacity-40"
                  >
                    <span className="material-icons text-base">play_arrow</span>
                    Review All ({stats?.dueToday ?? 0})
                  </button>
                  <button
                    onClick={() => setShowDeckForm(true)}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 hover:shadow-md"
                    style={{ background: "#008090" }}
                  >
                    <span className="material-icons text-base">add</span>
                    New Deck
                  </button>
                </>
              )}
              {viewMode === "cards" && (
                <button
                  onClick={() => setShowCardForm(true)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 hover:shadow-md"
                  style={{ background: "#008090" }}
                >
                  <span className="material-icons text-base">add</span>
                  Add Card
                </button>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          {viewMode === "decks" && stats && stats.total > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              {[
                { label: "Total", value: stats.total, icon: "style", color: "#008090" },
                { label: "New", value: stats.new, icon: "fiber_new", color: "#3b82f6" },
                { label: "Learning", value: stats.learning, icon: "school", color: "#f59e0b" },
                { label: "Review", value: stats.review, icon: "replay", color: "#8b5cf6" },
                { label: "Mastered", value: stats.mastered, icon: "verified", color: "#22c55e" },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                  <span className="material-icons text-lg mb-1" style={{ color: s.color }}>{s.icon}</span>
                  <div className="text-xl font-bold text-gray-900">{s.value}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Deck Form Modal */}
          {showDeckForm && (
            <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowDeckForm(false)}>
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-bold text-gray-900 mb-4">New Deck</h2>
                <input type="text" placeholder="Deck name..." value={deckName} onChange={e => setDeckName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#008090]/20 focus:border-[#008090]" />
                <textarea placeholder="Description (optional)..." value={deckDesc} onChange={e => setDeckDesc(e.target.value)} rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#008090]/20 resize-none" />
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-gray-500">Color:</span>
                  {DECK_COLORS.map(c => (
                    <button key={c} onClick={() => setDeckColor(c)}
                      className={`w-6 h-6 rounded-full ${getColor(c).bg} border-2 ${deckColor === c ? "border-gray-900 ring-2 ring-gray-300" : "border-transparent"}`} />
                  ))}
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowDeckForm(false)} className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
                  <button onClick={() => createDeck.mutate({ name: deckName, description: deckDesc || undefined, color: deckColor })}
                    disabled={!deckName.trim() || createDeck.isPending}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: "#008090" }}>
                    {createDeck.isPending ? "Creating..." : "Create"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Card Form Modal */}
          {showCardForm && (
            <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowCardForm(false)}>
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Add Flashcard</h2>
                <div className="mb-3">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Front (Question/Term)</label>
                  <textarea placeholder="e.g., What is the past tense of 'go'?" value={cardFront} onChange={e => setCardFront(e.target.value)} rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008090]/20 resize-none" />
                </div>
                <div className="mb-3">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Back (Answer/Definition)</label>
                  <textarea placeholder="e.g., 'went'" value={cardBack} onChange={e => setCardBack(e.target.value)} rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008090]/20 resize-none" />
                </div>
                <div className="mb-4">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Hint (optional)</label>
                  <input type="text" placeholder="e.g., Starts with 'w'" value={cardHint} onChange={e => setCardHint(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008090]/20" />
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowCardForm(false)} className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
                  <button onClick={() => { if (selectedDeckId) createCard.mutate({ deckId: selectedDeckId, front: cardFront, back: cardBack, hint: cardHint || undefined }); }}
                    disabled={!cardFront.trim() || !cardBack.trim() || createCard.isPending}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: "#008090" }}>
                    {createCard.isPending ? "Adding..." : "Add Card"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DECKS VIEW */}
          {viewMode === "decks" && (
            decksLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3].map(i => <div key={i} className="h-40 rounded-2xl bg-gray-100 animate-pulse" />)}
              </div>
            ) : decks.length === 0 ? (
              <div className="text-center py-16">
                <span className="material-icons text-6xl text-gray-300 mb-4 block">style</span>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No flashcard decks yet</h3>
                <p className="text-sm text-gray-500 mb-4">Create your first deck to start learning with spaced repetition!</p>
                <button onClick={() => setShowDeckForm(true)} className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "#008090" }}>
                  Create Deck
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {decks.map(deck => {
                  const color = getColor(deck.color);
                  return (
                    <div key={deck.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all group cursor-pointer"
                      onClick={() => { setSelectedDeckId(deck.id); setViewMode("cards"); }}>
                      <div className={`h-2 ${color.bg}`} />
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`w-10 h-10 rounded-xl ${color.light} flex items-center justify-center`}>
                            <span className={`material-icons ${color.text}`}>style</span>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); if (confirm("Delete this deck and all its cards?")) deleteDeck.mutate({ deckId: deck.id }); }}
                            className="p-1.5 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-icons text-sm text-gray-400">delete</span>
                          </button>
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 mb-1">{deck.name}</h3>
                        {deck.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{deck.description}</p>}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">{deck.cardCount} cards</span>
                          <button onClick={(e) => { e.stopPropagation(); startReview(deck.id); }}
                            className={`px-3 py-1 rounded-lg text-xs font-medium ${color.text} ${color.light} hover:opacity-80`}>
                            Review
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* CARDS VIEW */}
          {viewMode === "cards" && (
            cards.length === 0 ? (
              <div className="text-center py-16">
                <span className="material-icons text-6xl text-gray-300 mb-4 block">content_copy</span>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No cards in this deck</h3>
                <p className="text-sm text-gray-500 mb-4">Add your first flashcard to start studying!</p>
                <button onClick={() => setShowCardForm(true)} className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "#008090" }}>
                  Add Card
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cards.map((card, i) => {
                  const statusColors: Record<string, string> = {
                    new: "bg-blue-100 text-blue-700",
                    learning: "bg-amber-100 text-amber-700",
                    review: "bg-purple-100 text-purple-700",
                    mastered: "bg-green-100 text-green-700",
                  };
                  return (
                    <div key={card.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-4 group hover:shadow-sm transition-all">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-400 shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 mb-1">{card.front}</p>
                            <p className="text-xs text-gray-500">{card.back}</p>
                            {card.hint && <p className="text-[10px] text-gray-400 mt-1 italic">Hint: {card.hint}</p>}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[card.status] ?? statusColors.new}`}>
                              {card.status}
                            </span>
                            <button onClick={() => { if (selectedDeckId && confirm("Delete this card?")) deleteCard.mutate({ cardId: card.id, deckId: selectedDeckId }); }}
                              className="p-1 rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="material-icons text-sm text-gray-400">delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* REVIEW VIEW */}
          {viewMode === "review" && (
            reviewComplete || dueCards.length === 0 ? (
              <div className="text-center py-16">
                <span className="material-icons text-6xl text-green-400 mb-4 block">check_circle</span>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {dueCards.length === 0 ? "No cards due for review!" : "Review Complete!"}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {dueCards.length === 0 ? "All caught up! Come back later for more reviews." : "Great job! You've reviewed all due cards."}
                </p>
                <button onClick={() => { setViewMode("decks"); setSelectedDeckId(null); }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "#008090" }}>
                  Back to Decks
                </button>
              </div>
            ) : (
              <div className="max-w-lg mx-auto">
                {/* Progress */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#008090] rounded-full transition-all duration-300" style={{ width: `${((reviewIndex) / dueCards.length) * 100}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{reviewIndex + 1}/{dueCards.length}</span>
                </div>

                {/* Card */}
                <div
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm min-h-[300px] flex flex-col items-center justify-center p-8 cursor-pointer transition-all hover:shadow-md"
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  {!isFlipped ? (
                    <>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-4">Front</span>
                      <p className="text-xl font-semibold text-gray-900 text-center mb-4">{dueCards[reviewIndex]?.front}</p>
                      {dueCards[reviewIndex]?.hint && (
                        <p className="text-xs text-gray-400 italic">Hint: {dueCards[reviewIndex].hint}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-6">Tap to reveal answer</p>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] text-[#008090] uppercase tracking-wider mb-4">Answer</span>
                      <p className="text-xl font-semibold text-gray-900 text-center">{dueCards[reviewIndex]?.back}</p>
                    </>
                  )}
                </div>

                {/* Rating buttons (only when flipped) */}
                {isFlipped && (
                  <div className="mt-6 space-y-3">
                    <p className="text-xs text-gray-500 text-center font-medium">How well did you know this?</p>
                    <div className="grid grid-cols-4 gap-2">
                      <button onClick={() => handleReview(1)} className="py-3 rounded-xl text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-all">
                        Again
                      </button>
                      <button onClick={() => handleReview(3)} className="py-3 rounded-xl text-xs font-semibold bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all">
                        Hard
                      </button>
                      <button onClick={() => handleReview(4)} className="py-3 rounded-xl text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all">
                        Good
                      </button>
                      <button onClick={() => handleReview(5)} className="py-3 rounded-xl text-xs font-semibold bg-green-50 text-green-600 hover:bg-green-100 transition-all">
                        Easy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}
