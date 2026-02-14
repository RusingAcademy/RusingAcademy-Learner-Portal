/**
 * Grammar Drills Engine — Interactive grammar exercises by topic and CEFR level
 * Sprint 36: Grammar Drills Engine
 */
import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Sidebar from "@/components/Sidebar";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

/* ─── Grammar Drill Data ─── */
type DrillQuestion = { prompt: string; answer: string; options?: string[]; hint?: string };
type DrillSet = { topic: string; level: string; type: "fill_blank" | "conjugation" | "reorder" | "multiple_choice"; questions: DrillQuestion[] };

const DRILLS: DrillSet[] = [
  // A1 — Articles
  { topic: "Articles définis et indéfinis", level: "A1", type: "fill_blank", questions: [
    { prompt: "___ chat est sur la table.", answer: "Le", options: ["Le", "La", "Un", "Des"], hint: "Chat is masculine" },
    { prompt: "J'ai ___ sœur et ___ frère.", answer: "une, un", options: ["une, un", "un, une", "la, le", "des, des"], hint: "Sister is feminine, brother is masculine" },
    { prompt: "Elle mange ___ pomme.", answer: "une", options: ["une", "un", "la", "le"], hint: "Pomme is feminine" },
    { prompt: "___ enfants jouent dans le parc.", answer: "Les", options: ["Les", "Des", "Un", "Le"], hint: "Plural definite article" },
    { prompt: "Il y a ___ fleurs dans le jardin.", answer: "des", options: ["des", "les", "une", "la"], hint: "Plural indefinite article" },
  ]},
  // A1 — Être/Avoir
  { topic: "Être et Avoir au présent", level: "A1", type: "conjugation", questions: [
    { prompt: "Je ___ (être) étudiant.", answer: "suis", options: ["suis", "es", "est", "sommes"] },
    { prompt: "Nous ___ (avoir) un chien.", answer: "avons", options: ["avons", "avez", "ont", "ai"] },
    { prompt: "Ils ___ (être) contents.", answer: "sont", options: ["sont", "sommes", "êtes", "est"] },
    { prompt: "Tu ___ (avoir) quel âge?", answer: "as", options: ["as", "ai", "a", "avez"] },
    { prompt: "Elle ___ (être) canadienne.", answer: "est", options: ["est", "es", "suis", "sont"] },
  ]},
  // A2 — Passé composé
  { topic: "Le passé composé", level: "A2", type: "fill_blank", questions: [
    { prompt: "J'___ (manger) une pizza hier.", answer: "ai mangé", options: ["ai mangé", "suis mangé", "mange", "mangeais"] },
    { prompt: "Elle ___ (aller) au bureau.", answer: "est allée", options: ["est allée", "a allé", "a allée", "est allé"] },
    { prompt: "Nous ___ (finir) le rapport.", answer: "avons fini", options: ["avons fini", "sommes finis", "avons finir", "finissons"] },
    { prompt: "Ils ___ (venir) à la réunion.", answer: "sont venus", options: ["sont venus", "ont venu", "ont venus", "sont venu"] },
    { prompt: "Tu ___ (prendre) le bus?", answer: "as pris", options: ["as pris", "es pris", "a pris", "prends"] },
  ]},
  // A2 — Sentence reorder
  { topic: "L'ordre des mots", level: "A2", type: "reorder", questions: [
    { prompt: "bureau / au / je / vais / chaque / matin", answer: "Je vais au bureau chaque matin", hint: "Subject + verb + location + time" },
    { prompt: "ne / pas / je / français / parle", answer: "Je ne parle pas français", hint: "Subject + ne + verb + pas + object" },
    { prompt: "souvent / elle / café / boit / du", answer: "Elle boit souvent du café", hint: "Subject + verb + adverb + object" },
    { prompt: "hier / nous / sommes / allés / cinéma / au", answer: "Hier nous sommes allés au cinéma", hint: "Time + subject + auxiliary + past participle + location" },
  ]},
  // B1 — Subjonctif
  { topic: "Le subjonctif présent", level: "B1", type: "conjugation", questions: [
    { prompt: "Il faut que je ___ (faire) mes devoirs.", answer: "fasse", options: ["fasse", "fais", "fait", "ferai"] },
    { prompt: "Je veux que tu ___ (être) heureux.", answer: "sois", options: ["sois", "es", "seras", "étais"] },
    { prompt: "Il est important que nous ___ (avoir) le temps.", answer: "ayons", options: ["ayons", "avons", "aurons", "avions"] },
    { prompt: "Bien qu'il ___ (pleuvoir), nous sortons.", answer: "pleuve", options: ["pleuve", "pleut", "pleuvra", "pleuvait"] },
    { prompt: "Je doute qu'elle ___ (pouvoir) venir.", answer: "puisse", options: ["puisse", "peut", "pourra", "pouvait"] },
  ]},
  // B1 — Pronoms relatifs
  { topic: "Les pronoms relatifs", level: "B1", type: "multiple_choice", questions: [
    { prompt: "Le livre ___ j'ai lu est intéressant.", answer: "que", options: ["que", "qui", "dont", "où"] },
    { prompt: "La femme ___ parle est ma collègue.", answer: "qui", options: ["qui", "que", "dont", "où"] },
    { prompt: "Le bureau ___ je travaille est grand.", answer: "où", options: ["où", "qui", "que", "dont"] },
    { prompt: "Le sujet ___ nous parlons est important.", answer: "dont", options: ["dont", "que", "qui", "où"] },
    { prompt: "Les étudiants ___ ont réussi sont contents.", answer: "qui", options: ["qui", "que", "dont", "où"] },
  ]},
  // B2 — Concordance des temps
  { topic: "La concordance des temps", level: "B2", type: "fill_blank", questions: [
    { prompt: "Si j'avais su, je ___ (venir) plus tôt.", answer: "serais venu", options: ["serais venu", "suis venu", "viendrai", "venais"] },
    { prompt: "Il a dit qu'il ___ (finir) le rapport demain.", answer: "finirait", options: ["finirait", "finira", "finit", "a fini"] },
    { prompt: "Si nous ___ (étudier) plus, nous réussirions.", answer: "étudiions", options: ["étudiions", "étudions", "étudierons", "avons étudié"] },
    { prompt: "Elle pensait que tu ___ (être) malade.", answer: "étais", options: ["étais", "es", "seras", "serais"] },
    { prompt: "Quand j'___ (arriver), il pleuvait.", answer: "suis arrivé", options: ["suis arrivé", "arrivais", "arriverai", "arrive"] },
  ]},
  // C1 — Voix passive et nominalisations
  { topic: "La voix passive et les nominalisations", level: "C1", type: "multiple_choice", questions: [
    { prompt: "Le rapport ___ par le comité hier.", answer: "a été approuvé", options: ["a été approuvé", "a approuvé", "est approuvé", "approuvait"] },
    { prompt: "La ___ de ce projet nécessite des ressources.", answer: "réalisation", options: ["réalisation", "réaliser", "réalisé", "réalisant"] },
    { prompt: "Les mesures ___ par le gouvernement sont contestées.", answer: "prises", options: ["prises", "prendre", "pris", "prenantes"] },
    { prompt: "L'___ des résultats sera faite la semaine prochaine.", answer: "analyse", options: ["analyse", "analyser", "analysé", "analysant"] },
    { prompt: "Cette décision ___ après de longues délibérations.", answer: "a été prise", options: ["a été prise", "a pris", "est prise", "prenait"] },
  ]},
];

type Phase = "select" | "drill" | "results";

export default function GrammarDrillsPage() {
  const { user, loading: authLoading } = useAuth();
  const utils = trpc.useUtils();
  const saveResult = trpc.grammarDrills.saveResult.useMutation({
    onSuccess: () => { utils.grammarDrills.history.invalidate(); utils.grammarDrills.stats.invalidate(); utils.grammarDrills.statsByTopic.invalidate(); },
  });
  const { data: history } = trpc.grammarDrills.history.useQuery(undefined, { enabled: !!user });
  const { data: stats } = trpc.grammarDrills.stats.useQuery(undefined, { enabled: !!user });
  const { data: topicStats } = trpc.grammarDrills.statsByTopic.useQuery(undefined, { enabled: !!user });

  const [phase, setPhase] = useState<Phase>("select");
  const [selectedLevel, setSelectedLevel] = useState("B1");
  const [selectedDrill, setSelectedDrill] = useState<DrillSet | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [reorderInput, setReorderInput] = useState("");

  const filteredDrills = useMemo(() => DRILLS.filter(d => d.level === selectedLevel), [selectedLevel]);

  const startDrill = useCallback((drill: DrillSet) => {
    setSelectedDrill(drill);
    setAnswers([]);
    setCurrentQ(0);
    setStartTime(Date.now());
    setReorderInput("");
    setPhase("drill");
  }, []);

  const answerCurrent = useCallback((answer: string) => {
    setAnswers(prev => {
      const next = [...prev];
      next[currentQ] = answer;
      return next;
    });
    if (selectedDrill && currentQ < selectedDrill.questions.length - 1) {
      setTimeout(() => { setCurrentQ(prev => prev + 1); setReorderInput(""); }, 300);
    }
  }, [currentQ, selectedDrill]);

  const submitDrill = useCallback(() => {
    if (!selectedDrill) return;
    const correct = selectedDrill.questions.reduce((sum, q, i) => {
      const userAns = (answers[i] || "").toLowerCase().trim();
      const correctAns = q.answer.toLowerCase().trim();
      return sum + (userAns === correctAns ? 1 : 0);
    }, 0);
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    const score = Math.round((correct / selectedDrill.questions.length) * 100);

    saveResult.mutate({
      topic: selectedDrill.topic,
      cefrLevel: selectedDrill.level as "A1" | "A2" | "B1" | "B2" | "C1",
      drillType: selectedDrill.type,
      score,
      totalQuestions: selectedDrill.questions.length,
      correctAnswers: correct,
      timeSpentSeconds: totalTime,
      language: "fr",
    });

    setPhase("results");
  }, [selectedDrill, answers, startTime, saveResult]);

  const drillTypeLabel = (t: string) => ({ fill_blank: "Fill in the Blank", conjugation: "Conjugation", reorder: "Sentence Reorder", multiple_choice: "Multiple Choice" }[t] || t);
  const drillTypeIcon = (t: string) => ({ fill_blank: "edit_note", conjugation: "spellcheck", reorder: "swap_vert", multiple_choice: "checklist" }[t] || "quiz");

  if (authLoading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#008090] border-t-transparent rounded-full" /></div>;
  if (!user) { window.location.href = getLoginUrl(); return null; }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span className="material-icons text-[#008090]">spellcheck</span>
                Grammar Drills
              </h1>
              <p className="text-gray-500 mt-1">Master French grammar through targeted practice</p>
            </div>
            <button onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#008090] border border-[#008090] flex items-center gap-2 hover:bg-[#008090]/5">
              <span className="material-icons text-base">{showHistory ? "play_circle" : "history"}</span>
              {showHistory ? "Practice" : "History"}
            </button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "Drills", value: stats.totalDrills ?? 0, icon: "assignment", color: "#008090" },
                { label: "Avg Score", value: `${stats.avgScore ?? 0}%`, icon: "grade", color: "#f5a623" },
                { label: "Total Time", value: `${Math.round((stats.totalTime ?? 0) / 60)}m`, icon: "timer", color: "#8b5cf6" },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                  <span className="material-icons text-2xl mb-1" style={{ color: s.color }}>{s.icon}</span>
                  <div className="text-xl font-bold text-gray-900">{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {showHistory ? (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Drill History</h2>
              {!history?.length ? (
                <div className="text-center py-16 text-gray-400">
                  <span className="material-icons text-5xl mb-3 block">spellcheck</span>
                  <p>No grammar drills completed yet.</p>
                </div>
              ) : history.map((h: any, i: number) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{h.topic}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-3 mt-1">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#008090]/10 text-[#008090]">{h.cefrLevel}</span>
                      <span>{drillTypeLabel(h.drillType)}</span>
                      <span>{h.correctAnswers}/{h.totalQuestions}</span>
                    </div>
                  </div>
                  <div className="text-lg font-bold" style={{ color: (h.score ?? 0) >= 80 ? "#22c55e" : (h.score ?? 0) >= 60 ? "#f5a623" : "#e74c3c" }}>{h.score}%</div>
                </div>
              ))}
            </div>
          ) : phase === "select" ? (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Level</h2>
              <div className="flex gap-3 mb-6 flex-wrap">
                {["A1", "A2", "B1", "B2", "C1"].map(level => (
                  <button key={level} onClick={() => setSelectedLevel(level)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedLevel === level ? "bg-[#008090] text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:border-[#008090]"}`}>
                    {level}
                  </button>
                ))}
              </div>

              {/* Topic Stats */}
              {topicStats && topicStats.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">Your Topic Performance</h3>
                  <div className="flex gap-2 flex-wrap">
                    {topicStats.map((ts: any, i: number) => (
                      <div key={i} className="px-3 py-1.5 rounded-lg bg-white border border-gray-100 text-xs flex items-center gap-2">
                        <span className="font-medium text-gray-700">{ts.topic}</span>
                        <span className="font-bold" style={{ color: (ts.avgScore ?? 0) >= 80 ? "#22c55e" : "#f5a623" }}>{ts.avgScore}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {filteredDrills.map((drill, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => startDrill(drill)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#008090]/10 flex items-center justify-center">
                          <span className="material-icons text-[#008090]">{drillTypeIcon(drill.type)}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{drill.topic}</h3>
                          <div className="text-sm text-gray-500 mt-0.5">{drillTypeLabel(drill.type)} · {drill.questions.length} questions</div>
                        </div>
                      </div>
                      <span className="material-icons text-[#008090] text-2xl">play_circle</span>
                    </div>
                  </div>
                ))}
                {filteredDrills.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <span className="material-icons text-4xl mb-2 block">construction</span>
                    <p>More drills coming soon for this level!</p>
                  </div>
                )}
              </div>
            </div>
          ) : phase === "drill" && selectedDrill ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selectedDrill.topic}</h2>
                  <div className="text-sm text-gray-500">{drillTypeLabel(selectedDrill.type)}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {currentQ + 1} / {selectedDrill.questions.length}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-200 rounded-full mb-8">
                <div className="h-2 bg-[#008090] rounded-full transition-all" style={{ width: `${((currentQ + 1) / selectedDrill.questions.length) * 100}%` }} />
              </div>

              {/* Current Question */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mb-6">
                <p className="text-lg font-semibold text-gray-900 mb-6">{selectedDrill.questions[currentQ].prompt}</p>

                {selectedDrill.questions[currentQ].options ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedDrill.questions[currentQ].options!.map((opt, oi) => (
                      <button key={oi} onClick={() => answerCurrent(opt)}
                        className={`p-4 rounded-xl text-sm text-left transition-all ${answers[currentQ] === opt ? "bg-[#008090] text-white shadow-md" : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : selectedDrill.type === "reorder" ? (
                  <div>
                    <input type="text" value={reorderInput} onChange={e => setReorderInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && reorderInput.trim()) answerCurrent(reorderInput.trim()); }}
                      placeholder="Type the correct sentence order..."
                      className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#008090]/30" />
                    <button onClick={() => { if (reorderInput.trim()) answerCurrent(reorderInput.trim()); }}
                      className="mt-3 px-4 py-2 rounded-xl text-sm font-semibold bg-[#008090] text-white hover:bg-[#006a75]">
                      Confirm
                    </button>
                  </div>
                ) : null}

                {selectedDrill.questions[currentQ].hint && (
                  <p className="text-xs text-gray-400 mt-4 flex items-center gap-1">
                    <span className="material-icons text-xs">lightbulb</span> {selectedDrill.questions[currentQ].hint}
                  </p>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button onClick={() => { if (currentQ > 0) { setCurrentQ(currentQ - 1); setReorderInput(""); } }}
                  disabled={currentQ === 0}
                  className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30">
                  ← Previous
                </button>
                {currentQ === selectedDrill.questions.length - 1 ? (
                  <button onClick={submitDrill}
                    disabled={answers.filter(a => a).length < selectedDrill.questions.length}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#008090] text-white hover:bg-[#006a75] disabled:opacity-40">
                    Submit Drill
                  </button>
                ) : (
                  <button onClick={() => { setCurrentQ(currentQ + 1); setReorderInput(""); }}
                    className="px-4 py-2 rounded-xl text-sm text-[#008090] hover:text-[#006a75]">
                    Next →
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Results */
            <div>
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center mb-8">
                <span className="material-icons text-5xl mb-3 text-[#008090]">emoji_events</span>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Drill Complete!</h2>
                {(() => {
                  const correct = selectedDrill?.questions.reduce((sum, q, i) => {
                    const userAns = (answers[i] || "").toLowerCase().trim();
                    return sum + (userAns === q.answer.toLowerCase().trim() ? 1 : 0);
                  }, 0) ?? 0;
                  const total = selectedDrill?.questions.length ?? 1;
                  const score = Math.round((correct / total) * 100);
                  return (
                    <div className="text-4xl font-bold mt-4" style={{ color: score >= 80 ? "#22c55e" : score >= 60 ? "#f5a623" : "#e74c3c" }}>
                      {score}%
                      <div className="text-sm text-gray-500 font-normal mt-1">{correct}/{total} correct</div>
                    </div>
                  );
                })()}
              </div>

              <div className="space-y-4 mb-8">
                {selectedDrill?.questions.map((q, qi) => {
                  const userAns = (answers[qi] || "").toLowerCase().trim();
                  const isCorrect = userAns === q.answer.toLowerCase().trim();
                  return (
                    <div key={qi} className={`rounded-xl p-4 border ${isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                      <div className="flex items-start gap-2">
                        <span className={`material-icons text-lg ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                          {isCorrect ? "check_circle" : "cancel"}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{q.prompt}</p>
                          {!isCorrect && (
                            <p className="text-sm mt-1">
                              <span className="text-red-600">Your answer: {answers[qi] || "(no answer)"}</span>
                              <span className="text-green-600 ml-3">Correct: {q.answer}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 justify-center">
                <button onClick={() => setPhase("select")}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#008090] border border-[#008090] hover:bg-[#008090]/5">
                  Choose Another
                </button>
                {selectedDrill && (
                  <button onClick={() => startDrill(selectedDrill)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#008090] text-white hover:bg-[#006a75]">
                    Try Again
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
