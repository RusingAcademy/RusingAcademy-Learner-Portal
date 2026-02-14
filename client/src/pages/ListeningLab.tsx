/**
 * Listening Comprehension Lab — Audio passages with comprehension questions
 * Sprint 35: Listening Comprehension Lab
 */
import { useState, useCallback, useMemo, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Sidebar from "@/components/Sidebar";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

/* ─── Listening Exercises by CEFR Level ─── */
const EXERCISES: Record<string, { title: string; transcript: string; questions: { q: string; options: string[]; correct: number }[] }[]> = {
  A1: [
    {
      title: "Se présenter",
      transcript: "Bonjour, je m'appelle Sophie. J'ai trente ans. Je suis canadienne. J'habite à Ottawa. Je travaille dans un bureau du gouvernement. Je parle français et anglais. J'aime lire et faire du sport. Le week-end, je visite ma famille à Gatineau.",
      questions: [
        { q: "Quel âge a Sophie?", options: ["Vingt ans", "Trente ans", "Quarante ans"], correct: 1 },
        { q: "Où habite Sophie?", options: ["Montréal", "Ottawa", "Toronto"], correct: 1 },
        { q: "Que fait Sophie le week-end?", options: ["Elle travaille", "Elle voyage", "Elle visite sa famille"], correct: 2 },
      ],
    },
    {
      title: "Au téléphone",
      transcript: "Allô? Bonjour, c'est Marie. Je voudrais prendre un rendez-vous avec le directeur, s'il vous plaît. Oui, mardi à dix heures, c'est parfait. Merci beaucoup. Au revoir!",
      questions: [
        { q: "Qui appelle?", options: ["Le directeur", "Marie", "Sophie"], correct: 1 },
        { q: "Que veut Marie?", options: ["Un café", "Un rendez-vous", "Un document"], correct: 1 },
        { q: "Quand est le rendez-vous?", options: ["Lundi", "Mardi", "Mercredi"], correct: 1 },
      ],
    },
  ],
  A2: [
    {
      title: "La météo du jour",
      transcript: "Bonjour à tous! Voici la météo pour aujourd'hui. Ce matin, il fait froid avec des températures autour de moins cinq degrés. Cet après-midi, le soleil va apparaître et les températures vont monter jusqu'à deux degrés. Ce soir, attention, il va neiger. N'oubliez pas vos manteaux et vos bottes!",
      questions: [
        { q: "Quelle est la température ce matin?", options: ["Moins cinq degrés", "Deux degrés", "Dix degrés"], correct: 0 },
        { q: "Que va-t-il se passer ce soir?", options: ["Il va pleuvoir", "Il va neiger", "Il va faire chaud"], correct: 1 },
        { q: "Qu'est-ce qu'on recommande?", options: ["Des lunettes de soleil", "Des manteaux et des bottes", "Un parapluie"], correct: 1 },
      ],
    },
  ],
  B1: [
    {
      title: "Entrevue d'emploi dans la fonction publique",
      transcript: "Interviewer: Bonjour, merci d'être venu. Pouvez-vous vous présenter? Candidat: Bien sûr. Je m'appelle Jean-Pierre Tremblay. J'ai travaillé pendant cinq ans au ministère de la Santé comme analyste de politiques. J'ai un diplôme en administration publique de l'Université d'Ottawa. Je suis bilingue — j'ai obtenu le niveau C en compréhension de l'écrit et en expression écrite, et le niveau B en compétence orale. Interviewer: Excellent. Pourquoi souhaitez-vous ce poste? Candidat: Je suis passionné par la politique de santé publique et je crois que mon expérience en analyse de données et en rédaction de rapports serait un atout pour votre équipe.",
      questions: [
        { q: "Combien d'années d'expérience a Jean-Pierre?", options: ["Trois ans", "Cinq ans", "Sept ans"], correct: 1 },
        { q: "Quel est son niveau en compétence orale?", options: ["A", "B", "C"], correct: 1 },
        { q: "Où a-t-il obtenu son diplôme?", options: ["Université Laval", "Université d'Ottawa", "Université McGill"], correct: 1 },
        { q: "Quel est son domaine de passion?", options: ["Finance", "Politique de santé publique", "Technologie"], correct: 1 },
      ],
    },
  ],
  B2: [
    {
      title: "Conférence sur le bilinguisme",
      transcript: "Mesdames et messieurs, bienvenue à cette conférence sur l'avenir du bilinguisme dans la fonction publique canadienne. Depuis l'adoption de la Loi sur les langues officielles, des progrès considérables ont été réalisés. Cependant, des défis persistent. Premièrement, le recrutement de candidats véritablement bilingues reste difficile dans certaines régions. Deuxièmement, le maintien des compétences linguistiques après l'obtention des niveaux requis n'est pas toujours assuré. Troisièmement, l'intégration des nouvelles technologies dans la formation linguistique offre des possibilités prometteuses mais nécessite des investissements importants. Je propose trois recommandations : renforcer les programmes d'immersion, créer des communautés de pratique linguistique, et développer des outils d'apprentissage adaptatifs basés sur l'intelligence artificielle.",
      questions: [
        { q: "Combien de défis sont mentionnés?", options: ["Deux", "Trois", "Quatre"], correct: 1 },
        { q: "Quel est le premier défi mentionné?", options: ["Le budget", "Le recrutement de candidats bilingues", "La technologie"], correct: 1 },
        { q: "Combien de recommandations sont proposées?", options: ["Deux", "Trois", "Cinq"], correct: 1 },
        { q: "Quelle technologie est mentionnée pour l'apprentissage?", options: ["Réalité virtuelle", "Intelligence artificielle", "Blockchain"], correct: 1 },
      ],
    },
  ],
  C1: [
    {
      title: "Débat parlementaire sur la modernisation linguistique",
      transcript: "Honorables membres, le projet de loi C-13 représente une étape cruciale dans la modernisation de notre cadre linguistique. Les modifications proposées visent à renforcer la protection du français, non seulement au Québec mais dans l'ensemble des communautés francophones en situation minoritaire. Le commissaire aux langues officielles a souligné que, malgré cinquante ans de politique bilingue, l'asymétrie entre les deux langues officielles persiste. Les données démographiques sont éloquentes : la proportion de francophones hors Québec continue de diminuer. Il est donc impératif d'agir avec détermination. Toutefois, nous devons veiller à ce que ces mesures ne créent pas de nouvelles inégalités ni ne compromettent les droits linguistiques des anglophones du Québec.",
      questions: [
        { q: "De quel projet de loi parle-t-on?", options: ["C-11", "C-13", "C-15"], correct: 1 },
        { q: "Que vise le projet de loi?", options: ["Réduire le bilinguisme", "Renforcer la protection du français", "Éliminer l'anglais"], correct: 1 },
        { q: "Que continue de faire la proportion de francophones hors Québec?", options: ["Augmenter", "Rester stable", "Diminuer"], correct: 2 },
        { q: "Quelle préoccupation est exprimée à la fin?", options: ["Le coût", "Les droits des anglophones du Québec", "L'immigration"], correct: 1 },
      ],
    },
  ],
};

type Phase = "select" | "listening" | "questions" | "results";

export default function ListeningLab() {
  const { user, loading: authLoading } = useAuth();
  const utils = trpc.useUtils();
  const saveResult = trpc.listeningLab.saveResult.useMutation({
    onSuccess: () => { utils.listeningLab.history.invalidate(); utils.listeningLab.stats.invalidate(); },
  });
  const { data: history } = trpc.listeningLab.history.useQuery(undefined, { enabled: !!user });
  const { data: stats } = trpc.listeningLab.stats.useQuery(undefined, { enabled: !!user });

  const [phase, setPhase] = useState<Phase>("select");
  const [selectedLevel, setSelectedLevel] = useState("B1");
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showHistory, setShowHistory] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const exercise = useMemo(() => EXERCISES[selectedLevel]?.[exerciseIndex], [selectedLevel, exerciseIndex]);

  const playAudio = useCallback(() => {
    if (!exercise) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(exercise.transcript);
    utterance.lang = "fr-CA";
    utterance.rate = playbackSpeed;
    utterance.onend = () => setIsPlaying(false);
    synthRef.current = utterance;
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  }, [exercise, playbackSpeed]);

  const stopAudio = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  const startExercise = useCallback(() => {
    setAnswers([]);
    setShowTranscript(false);
    setStartTime(Date.now());
    setPhase("listening");
  }, []);

  const goToQuestions = useCallback(() => {
    stopAudio();
    setPhase("questions");
  }, [stopAudio]);

  const answerQuestion = useCallback((qIndex: number, optionIndex: number) => {
    setAnswers(prev => {
      const next = [...prev];
      next[qIndex] = optionIndex;
      return next;
    });
  }, []);

  const submitAnswers = useCallback(() => {
    if (!exercise) return;
    const correct = exercise.questions.reduce((sum, q, i) => sum + (answers[i] === q.correct ? 1 : 0), 0);
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    const score = Math.round((correct / exercise.questions.length) * 100);

    saveResult.mutate({
      exerciseTitle: exercise.title,
      cefrLevel: selectedLevel as "A1" | "A2" | "B1" | "B2" | "C1",
      score,
      totalQuestions: exercise.questions.length,
      correctAnswers: correct,
      timeSpentSeconds: totalTime,
      language: "fr",
    });

    setPhase("results");
  }, [exercise, answers, startTime, selectedLevel, saveResult]);

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
                <span className="material-icons text-[#008090]">headphones</span>
                Listening Comprehension Lab
              </h1>
              <p className="text-gray-500 mt-1">Train your ear with authentic French audio</p>
            </div>
            <button onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#008090] border border-[#008090] flex items-center gap-2 hover:bg-[#008090]/5">
              <span className="material-icons text-base">{showHistory ? "play_circle" : "history"}</span>
              {showHistory ? "Practice" : "History"}
            </button>
          </div>

          {/* Stats Bar */}
          {stats && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "Exercises", value: stats.totalExercises ?? 0, icon: "headphones", color: "#008090" },
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Listening History</h2>
              {!history?.length ? (
                <div className="text-center py-16 text-gray-400">
                  <span className="material-icons text-5xl mb-3 block">headphones</span>
                  <p>No listening exercises completed yet.</p>
                </div>
              ) : history.map((h: any, i: number) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{h.exerciseTitle}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-3 mt-1">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#008090]/10 text-[#008090]">{h.cefrLevel}</span>
                      <span>{h.correctAnswers}/{h.totalQuestions} correct</span>
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
                  <button key={level} onClick={() => { setSelectedLevel(level); setExerciseIndex(0); }}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedLevel === level ? "bg-[#008090] text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:border-[#008090]"}`}>
                    {level}
                  </button>
                ))}
              </div>
              <div className="space-y-4">
                {EXERCISES[selectedLevel]?.map((e, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => { setExerciseIndex(i); startExercise(); }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{e.title}</h3>
                        <div className="text-sm text-gray-500 mt-1">{e.questions.length} questions</div>
                      </div>
                      <span className="material-icons text-[#008090] text-3xl">play_circle</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : phase === "listening" ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-[#008090]/10 text-[#008090]">{selectedLevel}</span>
                  <h2 className="text-lg font-semibold text-gray-900">{exercise?.title}</h2>
                </div>
              </div>

              {/* Audio Player */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center mb-6">
                <span className="material-icons text-6xl text-[#008090] mb-4 block">{isPlaying ? "graphic_eq" : "headphones"}</span>
                <div className="flex items-center justify-center gap-4 mb-6">
                  <button onClick={isPlaying ? stopAudio : playAudio}
                    className="w-14 h-14 rounded-full bg-[#008090] text-white flex items-center justify-center hover:bg-[#006a75] transition-colors shadow-lg">
                    <span className="material-icons text-2xl">{isPlaying ? "stop" : "play_arrow"}</span>
                  </button>
                </div>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-sm text-gray-500">Speed:</span>
                  {[0.75, 1, 1.25].map(speed => (
                    <button key={speed} onClick={() => setPlaybackSpeed(speed)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${playbackSpeed === speed ? "bg-[#008090] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                      {speed}x
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowTranscript(!showTranscript)}
                  className="text-sm text-[#008090] hover:underline flex items-center gap-1 mx-auto">
                  <span className="material-icons text-base">description</span>
                  {showTranscript ? "Hide Transcript" : "Show Transcript"}
                </button>
                {showTranscript && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl text-left">
                    <p className="text-sm text-gray-700 leading-relaxed font-serif">{exercise?.transcript}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <button onClick={goToQuestions}
                  className="px-6 py-3 rounded-xl text-sm font-semibold bg-[#008090] text-white hover:bg-[#006a75] transition-colors">
                  Answer Questions
                </button>
              </div>
            </div>
          ) : phase === "questions" ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Comprehension Questions</h2>
                <button onClick={playAudio} className="text-sm text-[#008090] hover:underline flex items-center gap-1">
                  <span className="material-icons text-base">replay</span> Listen Again
                </button>
              </div>
              <div className="space-y-6">
                {exercise?.questions.map((q, qi) => (
                  <div key={qi} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <p className="font-semibold text-gray-900 mb-4">{qi + 1}. {q.q}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => (
                        <button key={oi} onClick={() => answerQuestion(qi, oi)}
                          className={`w-full p-3 rounded-xl text-sm text-left transition-all ${answers[qi] === oi ? "bg-[#008090] text-white shadow-md" : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"}`}>
                          <span className="font-semibold mr-2">{String.fromCharCode(65 + oi)}.</span> {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={submitAnswers}
                  disabled={answers.filter(a => a !== undefined).length < (exercise?.questions.length ?? 0)}
                  className="px-6 py-3 rounded-xl text-sm font-semibold bg-[#008090] text-white hover:bg-[#006a75] disabled:opacity-40 transition-colors">
                  Submit Answers
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center mb-8">
                <span className="material-icons text-5xl mb-3 text-[#008090]">emoji_events</span>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Exercise Complete!</h2>
                {(() => {
                  const correct = exercise?.questions.reduce((sum, q, i) => sum + (answers[i] === q.correct ? 1 : 0), 0) ?? 0;
                  const total = exercise?.questions.length ?? 1;
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
                {exercise?.questions.map((q, qi) => {
                  const isCorrect = answers[qi] === q.correct;
                  return (
                    <div key={qi} className={`rounded-xl p-4 border ${isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                      <div className="flex items-start gap-2">
                        <span className={`material-icons text-lg ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                          {isCorrect ? "check_circle" : "cancel"}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{q.q}</p>
                          {!isCorrect && (
                            <p className="text-sm mt-1">
                              <span className="text-red-600">Your answer: {q.options[answers[qi]]}</span>
                              <span className="text-green-600 ml-3">Correct: {q.options[q.correct]}</span>
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
                <button onClick={startExercise}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#008090] text-white hover:bg-[#006a75]">
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
