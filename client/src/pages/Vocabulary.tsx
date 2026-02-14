/**
 * Vocabulary Builder — Word collection, mastery tracking, and quiz mode
 * Sprint 20: Vocabulary Builder & Dictionary
 */
import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Sidebar from "@/components/Sidebar";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

const MASTERY_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  new: { label: "New", color: "#3b82f6", bg: "bg-blue-50 text-blue-700", icon: "fiber_new" },
  learning: { label: "Learning", color: "#f59e0b", bg: "bg-amber-50 text-amber-700", icon: "school" },
  familiar: { label: "Familiar", color: "#8b5cf6", bg: "bg-purple-50 text-purple-700", icon: "thumb_up" },
  mastered: { label: "Mastered", color: "#22c55e", bg: "bg-green-50 text-green-700", icon: "verified" },
};

const POS_OPTIONS = ["noun", "verb", "adjective", "adverb", "preposition", "conjunction", "pronoun", "interjection", "expression"];

type ViewMode = "list" | "quiz";

export default function Vocabulary() {
  const { user, loading: authLoading } = useAuth();
  const [collapsed, setCollapsed] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMastery, setFilterMastery] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");
  const [definition, setDefinition] = useState("");
  const [example, setExample] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("");

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [quizRevealed, setQuizRevealed] = useState(false);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });
  const [quizDone, setQuizDone] = useState(false);

  const utils = trpc.useUtils();
  const { data: items = [], isLoading } = trpc.vocabulary.list.useQuery();
  const { data: stats } = trpc.vocabulary.stats.useQuery();
  const addItem = trpc.vocabulary.add.useMutation({
    onSuccess: () => { utils.vocabulary.list.invalidate(); utils.vocabulary.stats.invalidate(); resetForm(); },
  });
  const reviewItem = trpc.vocabulary.review.useMutation({
    onSuccess: () => { utils.vocabulary.list.invalidate(); utils.vocabulary.stats.invalidate(); },
  });
  const deleteItem = trpc.vocabulary.delete.useMutation({
    onSuccess: () => { utils.vocabulary.list.invalidate(); utils.vocabulary.stats.invalidate(); },
  });

  const aiSuggest = trpc.aiVocabulary.suggestWords.useMutation({
    onSuccess: (data: any) => {
      if (data.words && data.words.length > 0) {
        data.words.forEach((w: any) => {
          addItem.mutate({
            word: w.word,
            translation: w.translation,
            definition: w.definition || undefined,
            exampleSentence: w.example || undefined,
            pronunciation: w.pronunciation || undefined,
            partOfSpeech: w.partOfSpeech || undefined,
          });
        });
        toast.success(`Added ${data.words.length} AI-suggested words!`);
      }
    },
    onError: () => toast.error("AI suggestion failed. Try again."),
  });

  function resetForm() {
    setWord(""); setTranslation(""); setDefinition(""); setExample(""); setPronunciation(""); setPartOfSpeech("");
    setShowForm(false);
  }

  function handleAdd() {
    if (!word.trim() || !translation.trim()) return;
    addItem.mutate({
      word, translation, definition: definition || undefined,
      exampleSentence: example || undefined, pronunciation: pronunciation || undefined,
      partOfSpeech: partOfSpeech || undefined,
    });
  }

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = !searchQuery ||
        item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.translation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMastery = !filterMastery || item.mastery === filterMastery;
      return matchesSearch && matchesMastery;
    });
  }, [items, searchQuery, filterMastery]);

  // Quiz items (only non-mastered)
  const quizItems = useMemo(() => {
    const eligible = items.filter(i => i.mastery !== "mastered");
    // Shuffle
    return [...eligible].sort(() => Math.random() - 0.5).slice(0, 10);
  }, [items]);

  function startQuiz() {
    setViewMode("quiz");
    setQuizIndex(0);
    setQuizAnswer("");
    setQuizRevealed(false);
    setQuizScore({ correct: 0, total: 0 });
    setQuizDone(false);
  }

  const handleQuizAnswer = useCallback((correct: boolean) => {
    const currentItem = quizItems[quizIndex];
    if (currentItem) {
      reviewItem.mutate({ itemId: currentItem.id, correct });
    }
    const newScore = { correct: quizScore.correct + (correct ? 1 : 0), total: quizScore.total + 1 };
    setQuizScore(newScore);
    setQuizAnswer("");
    setQuizRevealed(false);
    if (quizIndex + 1 >= quizItems.length) {
      setQuizDone(true);
    } else {
      setQuizIndex(prev => prev + 1);
    }
  }, [quizItems, quizIndex, quizScore, reviewItem]);

  if (authLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-2 border-[#008090] border-t-transparent rounded-full" /></div>;
  if (!user) { window.location.href = getLoginUrl(); return null; }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className="flex-1 lg:ml-[240px] overflow-y-auto">
        <div className="lg:hidden flex items-center gap-3 p-4 bg-white border-b border-gray-200 sticky top-0 z-30">
          <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-lg hover:bg-gray-100">
            <span className="material-icons text-gray-600">menu</span>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Vocabulary</h1>
        </div>

        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3">
                {viewMode === "quiz" && (
                  <button onClick={() => setViewMode("list")} className="p-1.5 rounded-lg hover:bg-gray-100">
                    <span className="material-icons text-gray-500">arrow_back</span>
                  </button>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="material-icons text-[#008090]">translate</span>
                    {viewMode === "list" ? "Vocabulary Builder" : "Vocabulary Quiz"}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {viewMode === "list" ? `${items.length} words collected` : `${quizItems.length} words to review`}
                  </p>
                </div>
              </div>
            </div>
            {viewMode === "list" && (
              <div className="flex gap-2">
                <button onClick={startQuiz} disabled={items.filter(i => i.mastery !== "mastered").length === 0}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#008090] border border-[#008090] flex items-center gap-2 hover:bg-[#008090]/5 disabled:opacity-40">
                  <span className="material-icons text-base">quiz</span>
                  Quiz Mode
                </button>
                <button onClick={() => aiSuggest.mutate({ topic: "public service bilingualism", level: "B2", count: 5 })}
                  disabled={aiSuggest.isPending}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#8b5cf6] border border-[#8b5cf6] flex items-center gap-2 hover:bg-[#8b5cf6]/5 disabled:opacity-40">
                  <span className="material-icons text-base">{aiSuggest.isPending ? "hourglass_empty" : "auto_awesome"}</span>
                  {aiSuggest.isPending ? "Generating..." : "AI Suggest"}
                </button>
                <button onClick={() => setShowForm(true)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 hover:shadow-md" style={{ background: "#008090" }}>
                  <span className="material-icons text-base">add</span>
                  Add Word
                </button>
              </div>
            )}
          </div>

          {/* Stats Bar */}
          {viewMode === "list" && stats && stats.total > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              {Object.entries(MASTERY_CONFIG).map(([key, config]) => (
                <button key={key} onClick={() => setFilterMastery(filterMastery === key ? null : key)}
                  className={`bg-white rounded-xl border p-4 text-center transition-all hover:shadow-sm ${filterMastery === key ? "border-[#008090] ring-1 ring-[#008090]/20" : "border-gray-100"}`}>
                  <span className="material-icons text-lg mb-1" style={{ color: config.color }}>{config.icon}</span>
                  <div className="text-xl font-bold text-gray-900">{(stats as any)[key] ?? 0}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">{config.label}</div>
                </button>
              ))}
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <span className="material-icons text-lg mb-1 text-[#008090]">analytics</span>
                <div className="text-xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Total</div>
              </div>
            </div>
          )}

          {/* LIST VIEW */}
          {viewMode === "list" && (
            <>
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
                  <input type="text" placeholder="Search words..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#008090]/20 focus:border-[#008090]" />
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[1,2,3,4,5].map(i => <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />)}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-16">
                  <span className="material-icons text-6xl text-gray-300 mb-4 block">translate</span>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    {items.length === 0 ? "No vocabulary words yet" : "No matching words"}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {items.length === 0 ? "Start building your vocabulary by adding words!" : "Try adjusting your search or filter."}
                  </p>
                  {items.length === 0 && (
                    <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "#008090" }}>
                      Add First Word
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredItems.map(item => {
                    const mastery = MASTERY_CONFIG[item.mastery] ?? MASTERY_CONFIG.new;
                    return (
                      <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 group hover:shadow-sm transition-all">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: mastery.color + "15" }}>
                            <span className="material-icons text-lg" style={{ color: mastery.color }}>{mastery.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-sm font-bold text-gray-900">{item.word}</span>
                              <span className="text-sm text-[#008090] font-medium">→ {item.translation}</span>
                              {item.partOfSpeech && (
                                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] text-gray-500 font-medium italic">{item.partOfSpeech}</span>
                              )}
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${mastery.bg}`}>{mastery.label}</span>
                            </div>
                            {item.definition && <p className="text-xs text-gray-600 mb-1">{item.definition}</p>}
                            {item.exampleSentence && <p className="text-xs text-gray-400 italic">"{item.exampleSentence}"</p>}
                            {item.pronunciation && <p className="text-[10px] text-gray-400 mt-1">/{item.pronunciation}/</p>}
                            <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                              <span>Reviewed {item.reviewCount}x</span>
                              <span>Correct {item.correctCount}/{item.reviewCount}</span>
                            </div>
                          </div>
                          <button onClick={() => { if (confirm("Delete this word?")) deleteItem.mutate({ itemId: item.id }); }}
                            className="p-1.5 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <span className="material-icons text-sm text-gray-400">delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* QUIZ VIEW */}
          {viewMode === "quiz" && (
            quizDone || quizItems.length === 0 ? (
              <div className="text-center py-16 max-w-md mx-auto">
                <span className="material-icons text-6xl text-green-400 mb-4 block">emoji_events</span>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {quizItems.length === 0 ? "No words to quiz!" : "Quiz Complete!"}
                </h3>
                {quizScore.total > 0 && (
                  <div className="mb-4">
                    <div className="text-4xl font-bold text-[#008090] mb-1">{Math.round((quizScore.correct / quizScore.total) * 100)}%</div>
                    <p className="text-sm text-gray-500">{quizScore.correct}/{quizScore.total} correct</p>
                  </div>
                )}
                <div className="flex gap-3 justify-center">
                  <button onClick={() => setViewMode("list")} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50">
                    Back to List
                  </button>
                  {quizItems.length > 0 && (
                    <button onClick={startQuiz} className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "#008090" }}>
                      Try Again
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="max-w-lg mx-auto">
                {/* Progress */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#008090] rounded-full transition-all duration-300" style={{ width: `${(quizIndex / quizItems.length) * 100}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{quizIndex + 1}/{quizItems.length}</span>
                </div>

                {/* Quiz card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center mb-6">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-4 block">Translate this word</span>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{quizItems[quizIndex]?.word}</p>
                  {quizItems[quizIndex]?.partOfSpeech && (
                    <p className="text-xs text-gray-400 italic mb-4">({quizItems[quizIndex].partOfSpeech})</p>
                  )}

                  {!quizRevealed ? (
                    <>
                      <input type="text" placeholder="Type your answer..." value={quizAnswer}
                        onChange={e => setQuizAnswer(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") setQuizRevealed(true); }}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-center text-gray-900 text-base mb-4 focus:outline-none focus:ring-2 focus:ring-[#008090]/20"
                        autoFocus />
                      <button onClick={() => setQuizRevealed(true)}
                        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "#008090" }}>
                        Check Answer
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="p-4 rounded-xl bg-gray-50 mb-4">
                        <p className="text-xs text-gray-500 mb-1">Correct answer:</p>
                        <p className="text-lg font-bold text-[#008090]">{quizItems[quizIndex]?.translation}</p>
                        {quizAnswer && (
                          <p className="text-xs text-gray-400 mt-2">Your answer: <span className="font-medium">{quizAnswer}</span></p>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-4">Did you get it right?</p>
                      <div className="flex gap-3 justify-center">
                        <button onClick={() => handleQuizAnswer(false)}
                          className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100">
                          Incorrect
                        </button>
                        <button onClick={() => handleQuizAnswer(true)}
                          className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-green-50 text-green-600 hover:bg-green-100">
                          Correct
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Score */}
                <div className="text-center text-xs text-gray-400">
                  Score: {quizScore.correct}/{quizScore.total}
                </div>
              </div>
            )
          )}

          {/* Add Word Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={resetForm}>
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Add Vocabulary Word</h2>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Word / Expression *</label>
                    <input type="text" placeholder="e.g., néanmoins" value={word} onChange={e => setWord(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008090]/20 focus:border-[#008090]" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Translation *</label>
                    <input type="text" placeholder="e.g., nevertheless" value={translation} onChange={e => setTranslation(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008090]/20 focus:border-[#008090]" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Part of Speech</label>
                    <select value={partOfSpeech} onChange={e => setPartOfSpeech(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008090]/20">
                      <option value="">Select...</option>
                      {POS_OPTIONS.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Definition</label>
                    <textarea placeholder="Optional definition..." value={definition} onChange={e => setDefinition(e.target.value)} rows={2}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008090]/20 resize-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Example Sentence</label>
                    <textarea placeholder="Use the word in a sentence..." value={example} onChange={e => setExample(e.target.value)} rows={2}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008090]/20 resize-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Pronunciation</label>
                    <input type="text" placeholder="e.g., ne.ɑ̃.mwɛ̃" value={pronunciation} onChange={e => setPronunciation(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008090]/20" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button onClick={resetForm} className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
                  <button onClick={handleAdd}
                    disabled={!word.trim() || !translation.trim() || addItem.isPending}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: "#008090" }}>
                    {addItem.isPending ? "Adding..." : "Add Word"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
