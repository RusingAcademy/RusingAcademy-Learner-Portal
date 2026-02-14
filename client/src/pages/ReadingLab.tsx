/**
 * Reading Comprehension Lab — Timed reading passages with comprehension questions
 * Sprint 34: Reading Comprehension Lab
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Sidebar from "@/components/Sidebar";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

/* ─── Reading Passages by CEFR Level ─── */
const PASSAGES: Record<string, { title: string; text: string; wordCount: number; questions: { q: string; options: string[]; correct: number }[] }[]> = {
  A1: [
    {
      title: "Ma journée",
      text: "Je m'appelle Marie. Je me lève à sept heures. Je prends le petit déjeuner avec ma famille. Je mange du pain et je bois du café. Après, je vais au travail en bus. Je travaille dans un bureau. Je commence à neuf heures. À midi, je déjeune avec mes collègues. Nous mangeons à la cafétéria. L'après-midi, je travaille jusqu'à cinq heures. Le soir, je rentre chez moi. Je prépare le dîner et je regarde la télévision.",
      wordCount: 78,
      questions: [
        { q: "À quelle heure Marie se lève-t-elle?", options: ["Six heures", "Sept heures", "Huit heures", "Neuf heures"], correct: 1 },
        { q: "Comment Marie va-t-elle au travail?", options: ["En voiture", "À pied", "En bus", "En métro"], correct: 2 },
        { q: "Où Marie déjeune-t-elle?", options: ["Chez elle", "Au restaurant", "À la cafétéria", "Au parc"], correct: 2 },
        { q: "Que fait Marie le soir?", options: ["Elle sort", "Elle étudie", "Elle prépare le dîner", "Elle dort"], correct: 2 },
      ],
    },
    {
      title: "Le bureau",
      text: "Mon bureau est grand. Il y a un ordinateur sur la table. J'ai aussi un téléphone et des stylos. La fenêtre est à gauche. Il y a une plante verte près de la fenêtre. Mon collègue Pierre travaille à côté de moi. Il est très gentil. Nous parlons français et anglais au travail. Le matin, nous buvons du café ensemble.",
      wordCount: 56,
      questions: [
        { q: "Qu'est-ce qu'il y a sur la table?", options: ["Un livre", "Un ordinateur", "Une lampe", "Un sac"], correct: 1 },
        { q: "Où est la fenêtre?", options: ["À droite", "En face", "À gauche", "Derrière"], correct: 2 },
        { q: "Comment est Pierre?", options: ["Méchant", "Triste", "Gentil", "Fatigué"], correct: 2 },
      ],
    },
  ],
  A2: [
    {
      title: "La réunion d'équipe",
      text: "Chaque lundi matin, notre équipe a une réunion. Le directeur, M. Dupont, commence par présenter les objectifs de la semaine. Ensuite, chaque membre de l'équipe parle de ses projets. La semaine dernière, j'ai présenté mon rapport sur la satisfaction des clients. Mes collègues ont posé des questions intéressantes. Après la réunion, nous avons pris un café ensemble. Ces réunions sont importantes pour la communication dans notre département.",
      wordCount: 68,
      questions: [
        { q: "Quand a lieu la réunion d'équipe?", options: ["Chaque vendredi", "Chaque lundi matin", "Chaque mercredi", "Deux fois par semaine"], correct: 1 },
        { q: "Qui commence la réunion?", options: ["Le secrétaire", "Le directeur", "Un collègue", "Le client"], correct: 1 },
        { q: "Quel rapport a été présenté?", options: ["Budget", "Satisfaction des clients", "Ventes", "Ressources humaines"], correct: 1 },
        { q: "Pourquoi ces réunions sont-elles importantes?", options: ["Pour le budget", "Pour la communication", "Pour les vacances", "Pour les promotions"], correct: 1 },
      ],
    },
  ],
  B1: [
    {
      title: "Le bilinguisme au Canada",
      text: "Le Canada est un pays officiellement bilingue depuis 1969, année de l'adoption de la Loi sur les langues officielles. Cette loi garantit que les citoyens canadiens peuvent recevoir des services fédéraux en français ou en anglais. Dans la fonction publique fédérale, le bilinguisme est souvent une exigence pour les postes de direction. Les employés doivent démontrer leur compétence dans les deux langues officielles en passant des examens standardisés. Ces examens évaluent trois compétences : la compréhension de l'écrit, l'expression écrite et la compétence orale. Chaque compétence est notée selon trois niveaux : A, B et C, le niveau C étant le plus élevé.",
      wordCount: 108,
      questions: [
        { q: "Depuis quand le Canada est-il officiellement bilingue?", options: ["1960", "1969", "1975", "1982"], correct: 1 },
        { q: "Combien de compétences sont évaluées dans les examens?", options: ["Deux", "Trois", "Quatre", "Cinq"], correct: 1 },
        { q: "Quel est le niveau le plus élevé?", options: ["A", "B", "C", "D"], correct: 2 },
        { q: "Pour quels postes le bilinguisme est-il souvent exigé?", options: ["Tous les postes", "Les postes de direction", "Les postes temporaires", "Les postes à temps partiel"], correct: 1 },
        { q: "Que garantit la Loi sur les langues officielles?", options: ["L'éducation gratuite", "Des services fédéraux bilingues", "L'emploi garanti", "La retraite anticipée"], correct: 1 },
      ],
    },
  ],
  B2: [
    {
      title: "L'impact de la technologie sur l'apprentissage des langues",
      text: "L'avènement des technologies numériques a profondément transformé l'apprentissage des langues secondes. Les applications mobiles, les plateformes en ligne et l'intelligence artificielle offrent désormais des possibilités d'apprentissage personnalisé qui étaient impensables il y a seulement une décennie. Les algorithmes de répétition espacée, par exemple, optimisent la mémorisation du vocabulaire en présentant les mots à des intervalles stratégiquement calculés. De même, les systèmes de reconnaissance vocale permettent aux apprenants de pratiquer leur prononciation et de recevoir un retour immédiat. Toutefois, ces outils technologiques ne remplacent pas l'interaction humaine, qui demeure essentielle pour développer la compétence communicative. Les meilleurs programmes d'apprentissage combinent donc les avantages de la technologie avec l'encadrement d'enseignants qualifiés.",
      wordCount: 118,
      questions: [
        { q: "Qu'est-ce que les algorithmes de répétition espacée optimisent?", options: ["La grammaire", "La mémorisation du vocabulaire", "La prononciation", "L'écriture"], correct: 1 },
        { q: "Que permettent les systèmes de reconnaissance vocale?", options: ["Lire plus vite", "Pratiquer la prononciation", "Écrire des essais", "Traduire des textes"], correct: 1 },
        { q: "Qu'est-ce qui demeure essentiel selon le texte?", options: ["La technologie", "L'interaction humaine", "Les examens", "Les manuels"], correct: 1 },
        { q: "Que combinent les meilleurs programmes?", options: ["Technologie et coût réduit", "Technologie et enseignants qualifiés", "IA et examens", "Applications et jeux"], correct: 1 },
      ],
    },
  ],
  C1: [
    {
      title: "La politique linguistique canadienne : enjeux et perspectives",
      text: "La politique linguistique du Canada, fondée sur le principe du bilinguisme institutionnel, fait l'objet de débats constants quant à son efficacité et sa pertinence dans un contexte de diversité linguistique croissante. Si la Loi sur les langues officielles de 1969, modernisée en 2023, constitue le pilier juridique de cette politique, sa mise en œuvre concrète soulève des défis considérables. Dans la fonction publique fédérale, l'exigence du bilinguisme pour les postes de direction a été critiquée comme étant à la fois insuffisante et excessive : insuffisante parce que la maîtrise réelle des deux langues officielles reste souvent superficielle, et excessive parce qu'elle peut constituer une barrière à l'avancement pour des candidats autrement qualifiés. Par ailleurs, l'émergence de nouvelles réalités linguistiques, notamment l'importance croissante des langues autochtones et des langues d'immigration, invite à repenser le cadre bilingue traditionnel vers un modèle plus inclusif de plurilinguisme.",
      wordCount: 148,
      questions: [
        { q: "Sur quel principe repose la politique linguistique canadienne?", options: ["Le multilinguisme", "Le bilinguisme institutionnel", "L'unilinguisme", "Le plurilinguisme"], correct: 1 },
        { q: "En quelle année la Loi sur les langues officielles a-t-elle été modernisée?", options: ["2019", "2021", "2023", "2025"], correct: 2 },
        { q: "Pourquoi l'exigence du bilinguisme est-elle critiquée comme insuffisante?", options: ["Elle coûte trop cher", "La maîtrise reste souvent superficielle", "Elle exclut les immigrants", "Elle ne concerne que le français"], correct: 1 },
        { q: "Vers quel modèle le texte suggère-t-il d'évoluer?", options: ["L'unilinguisme anglais", "Le bilinguisme renforcé", "Le plurilinguisme inclusif", "L'immersion totale"], correct: 2 },
      ],
    },
  ],
};

type Phase = "select" | "reading" | "questions" | "results";

export default function ReadingLab() {
  const { user, loading: authLoading } = useAuth();
  const utils = trpc.useUtils();
  const saveResult = trpc.readingLab.saveResult.useMutation({
    onSuccess: () => { utils.readingLab.history.invalidate(); utils.readingLab.stats.invalidate(); },
  });
  const { data: history } = trpc.readingLab.history.useQuery(undefined, { enabled: !!user });
  const { data: stats } = trpc.readingLab.stats.useQuery(undefined, { enabled: !!user });

  const [phase, setPhase] = useState<Phase>("select");
  const [selectedLevel, setSelectedLevel] = useState("B1");
  const [passageIndex, setPassageIndex] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const passage = useMemo(() => PASSAGES[selectedLevel]?.[passageIndex], [selectedLevel, passageIndex]);

  // Timer
  useEffect(() => {
    if (phase !== "reading") return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, startTime]);

  const startReading = useCallback(() => {
    setStartTime(Date.now());
    setElapsedSeconds(0);
    setAnswers([]);
    setPhase("reading");
  }, []);

  const finishReading = useCallback(() => {
    setPhase("questions");
  }, []);

  const answerQuestion = useCallback((qIndex: number, optionIndex: number) => {
    setAnswers(prev => {
      const next = [...prev];
      next[qIndex] = optionIndex;
      return next;
    });
  }, []);

  const submitAnswers = useCallback(() => {
    if (!passage) return;
    const correct = passage.questions.reduce((sum, q, i) => sum + (answers[i] === q.correct ? 1 : 0), 0);
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    const wpm = Math.round((passage.wordCount / totalTime) * 60);
    const score = Math.round((correct / passage.questions.length) * 100);

    saveResult.mutate({
      passageTitle: passage.title,
      cefrLevel: selectedLevel as "A1" | "A2" | "B1" | "B2" | "C1",
      wordsPerMinute: wpm,
      score,
      totalQuestions: passage.questions.length,
      correctAnswers: correct,
      timeSpentSeconds: totalTime,
      language: "fr",
    });

    setPhase("results");
  }, [passage, answers, startTime, selectedLevel, saveResult]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

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
                <span className="material-icons text-[#008090]">auto_stories</span>
                Reading Comprehension Lab
              </h1>
              <p className="text-gray-500 mt-1">Improve your reading speed and comprehension</p>
            </div>
            <button onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#008090] border border-[#008090] flex items-center gap-2 hover:bg-[#008090]/5">
              <span className="material-icons text-base">{showHistory ? "play_circle" : "history"}</span>
              {showHistory ? "Practice" : "History"}
            </button>
          </div>

          {/* Stats Bar */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Exercises", value: stats.totalExercises ?? 0, icon: "assignment", color: "#008090" },
                { label: "Avg Score", value: `${stats.avgScore ?? 0}%`, icon: "grade", color: "#f5a623" },
                { label: "Avg WPM", value: stats.avgWpm ?? 0, icon: "speed", color: "#8b5cf6" },
                { label: "Total Time", value: `${Math.round((stats.totalTime ?? 0) / 60)}m`, icon: "timer", color: "#e74c3c" },
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
            /* History View */
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Reading History</h2>
              {!history?.length ? (
                <div className="text-center py-16 text-gray-400">
                  <span className="material-icons text-5xl mb-3 block">menu_book</span>
                  <p>No reading exercises completed yet.</p>
                </div>
              ) : history.map((h: any, i: number) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{h.passageTitle}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-3 mt-1">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#008090]/10 text-[#008090]">{h.cefrLevel}</span>
                      <span>{h.correctAnswers}/{h.totalQuestions} correct</span>
                      <span>{h.wordsPerMinute} WPM</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold" style={{ color: (h.score ?? 0) >= 80 ? "#22c55e" : (h.score ?? 0) >= 60 ? "#f5a623" : "#e74c3c" }}>{h.score}%</div>
                    <div className="text-xs text-gray-400">{formatTime(h.timeSpentSeconds ?? 0)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : phase === "select" ? (
            /* Level & Passage Selection */
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Level</h2>
              <div className="flex gap-3 mb-6 flex-wrap">
                {["A1", "A2", "B1", "B2", "C1"].map(level => (
                  <button key={level} onClick={() => { setSelectedLevel(level); setPassageIndex(0); }}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedLevel === level ? "bg-[#008090] text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:border-[#008090]"}`}>
                    {level}
                  </button>
                ))}
              </div>
              <div className="space-y-4">
                {PASSAGES[selectedLevel]?.map((p, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => { setPassageIndex(i); startReading(); }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{p.title}</h3>
                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-4">
                          <span>{p.wordCount} words</span>
                          <span>{p.questions.length} questions</span>
                        </div>
                      </div>
                      <span className="material-icons text-[#008090] text-3xl">play_circle</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : phase === "reading" ? (
            /* Reading Phase */
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-[#008090]/10 text-[#008090]">{selectedLevel}</span>
                  <h2 className="text-lg font-semibold text-gray-900">{passage?.title}</h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <span className="material-icons text-base">timer</span>
                    {formatTime(elapsedSeconds)}
                  </div>
                  <button onClick={finishReading}
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#008090] text-white hover:bg-[#006a75] transition-colors">
                    Done Reading
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <p className="text-lg leading-relaxed text-gray-800 font-serif">{passage?.text}</p>
              </div>
              <div className="text-center mt-4 text-sm text-gray-400">{passage?.wordCount} words — Read carefully, then click "Done Reading" to answer questions</div>
            </div>
          ) : phase === "questions" ? (
            /* Questions Phase */
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Comprehension Questions</h2>
                <div className="text-sm text-gray-500">
                  {answers.filter(a => a !== undefined).length}/{passage?.questions.length} answered
                </div>
              </div>
              <div className="space-y-6">
                {passage?.questions.map((q, qi) => (
                  <div key={qi} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <p className="font-semibold text-gray-900 mb-4">{qi + 1}. {q.q}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.options.map((opt, oi) => (
                        <button key={oi} onClick={() => answerQuestion(qi, oi)}
                          className={`p-3 rounded-xl text-sm text-left transition-all ${answers[qi] === oi ? "bg-[#008090] text-white shadow-md" : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"}`}>
                          <span className="font-semibold mr-2">{String.fromCharCode(65 + oi)}.</span> {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={submitAnswers}
                  disabled={answers.filter(a => a !== undefined).length < (passage?.questions.length ?? 0)}
                  className="px-6 py-3 rounded-xl text-sm font-semibold bg-[#008090] text-white hover:bg-[#006a75] disabled:opacity-40 transition-colors">
                  Submit Answers
                </button>
              </div>
            </div>
          ) : (
            /* Results Phase */
            <div>
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center mb-8">
                <span className="material-icons text-5xl mb-3 text-[#008090]">emoji_events</span>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Exercise Complete!</h2>
                <div className="grid grid-cols-3 gap-6 mt-6">
                  {(() => {
                    const correct = passage?.questions.reduce((sum, q, i) => sum + (answers[i] === q.correct ? 1 : 0), 0) ?? 0;
                    const total = passage?.questions.length ?? 1;
                    const totalTime = Math.floor((Date.now() - startTime) / 1000);
                    const wpm = Math.round(((passage?.wordCount ?? 0) / totalTime) * 60);
                    const score = Math.round((correct / total) * 100);
                    return [
                      { label: "Score", value: `${score}%`, color: score >= 80 ? "#22c55e" : score >= 60 ? "#f5a623" : "#e74c3c" },
                      { label: "Reading Speed", value: `${wpm} WPM`, color: "#8b5cf6" },
                      { label: "Time", value: formatTime(totalTime), color: "#008090" },
                    ].map((r, i) => (
                      <div key={i}>
                        <div className="text-3xl font-bold" style={{ color: r.color }}>{r.value}</div>
                        <div className="text-sm text-gray-500 mt-1">{r.label}</div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Answer Review */}
              <div className="space-y-4 mb-8">
                {passage?.questions.map((q, qi) => {
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
                <button onClick={() => { setPhase("select"); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#008090] border border-[#008090] hover:bg-[#008090]/5">
                  Choose Another
                </button>
                <button onClick={startReading}
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
