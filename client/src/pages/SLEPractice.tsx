/**
 * SLE Practice — RusingÂcademy Learning Portal
 * SLE exam simulation modes: Reading Comprehension, Written Expression, Oral Interaction
 * Design: Clean white light theme, accessible
 */
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect, useCallback } from "react";

type ExamType = "reading" | "written" | "oral";
type ExamLevel = "A" | "B" | "C";

interface SimulationState {
  active: boolean;
  examType: ExamType;
  level: ExamLevel;
  currentQ: number;
  answers: (number | string)[];
  timeLeft: number;
  submitted: boolean;
}

// --- Reading Comprehension Questions ---
const readingQuestions: Record<ExamLevel, { passage: string; questions: { q: string; options: string[]; correct: number }[] }[]> = {
  A: [{
    passage: "The Government of Canada is committed to providing services in both official languages. All federal employees are encouraged to use the official language of their choice in the workplace. Language training is available to help employees improve their second-language skills.",
    questions: [
      { q: "What is the Government of Canada committed to?", options: ["Providing services in English only", "Providing services in both official languages", "Reducing language training", "Hiring only bilingual employees"], correct: 1 },
      { q: "What are federal employees encouraged to do?", options: ["Speak only English", "Use the official language of their choice", "Avoid using French", "Take mandatory language tests"], correct: 1 },
      { q: "What is available to help employees?", options: ["Financial bonuses", "Language training", "Extra vacation days", "Remote work options"], correct: 1 },
    ],
  }],
  B: [{
    passage: "The Second Language Evaluation (SLE) is a standardized test used by the Government of Canada to assess the second-language proficiency of federal public servants. The evaluation consists of three components: Reading Comprehension, Written Expression, and Oral Interaction. Each component is assessed independently, and candidates receive a level designation of A, B, or C, with C being the highest level of proficiency. Many positions in the federal public service require bilingual proficiency, making the SLE an important milestone in a public servant's career.",
    questions: [
      { q: "How many components does the SLE consist of?", options: ["Two", "Three", "Four", "Five"], correct: 1 },
      { q: "What is the highest level of proficiency?", options: ["A", "B", "C", "D"], correct: 2 },
      { q: "Why is the SLE considered important?", options: ["It is optional for all positions", "Many positions require bilingual proficiency", "It replaces performance evaluations", "It determines salary levels"], correct: 1 },
      { q: "Which of the following is NOT a component of the SLE?", options: ["Reading Comprehension", "Written Expression", "Oral Interaction", "Listening Comprehension"], correct: 3 },
    ],
  }],
  C: [{
    passage: "The Treasury Board of Canada's Policy on Official Languages establishes the framework for the implementation of the Official Languages Act within federal institutions. The policy aims to ensure that Canadians can communicate with and receive services from federal institutions in the official language of their choice. Furthermore, the policy promotes the use of both English and French as languages of work in regions designated as bilingual for language-of-work purposes. Federal institutions are required to take positive measures to support the development of English and French linguistic minority communities and to foster the full recognition and use of both official languages in Canadian society. The Directive on Official Languages for People Management complements this policy by establishing specific requirements for staffing, language training, and the maintenance of language skills.",
    questions: [
      { q: "What does the Treasury Board's Policy on Official Languages establish?", options: ["A new language test format", "The framework for implementing the Official Languages Act", "Mandatory bilingualism for all Canadians", "A salary scale based on language proficiency"], correct: 1 },
      { q: "What are federal institutions required to support?", options: ["Only English-speaking communities", "The development of linguistic minority communities", "Private language schools", "International language exchanges"], correct: 1 },
      { q: "What does the Directive on Official Languages for People Management address?", options: ["Budget allocation for translation services", "Staffing, language training, and maintenance of language skills", "Public communications strategy", "International diplomatic protocols"], correct: 1 },
      { q: "In which regions is the use of both languages as languages of work promoted?", options: ["All regions of Canada", "Regions designated as bilingual for language-of-work purposes", "Only Ottawa", "Only Quebec and New Brunswick"], correct: 1 },
      { q: "What is the primary aim of the policy?", options: ["To eliminate French in the workplace", "To ensure Canadians can communicate with federal institutions in their chosen official language", "To reduce the number of bilingual positions", "To outsource translation services"], correct: 1 },
    ],
  }],
};

// --- Written Expression Questions ---
const writtenQuestions: Record<ExamLevel, { sentence: string; options: string[]; correct: number }[]> = {
  A: [
    { sentence: "The meeting _____ at 2:00 PM tomorrow.", options: ["start", "starts", "starting", "started"], correct: 1 },
    { sentence: "She _____ working on the report since this morning.", options: ["is", "was", "has been", "have been"], correct: 2 },
    { sentence: "The documents need to be _____ before Friday.", options: ["submit", "submitted", "submitting", "submits"], correct: 1 },
    { sentence: "We should _____ the client about the delay.", options: ["inform", "informs", "informed", "informing"], correct: 0 },
    { sentence: "The new policy _____ into effect next month.", options: ["go", "goes", "going", "gone"], correct: 1 },
  ],
  B: [
    { sentence: "If the budget _____ approved, we can proceed with the project.", options: ["is", "was", "were", "be"], correct: 0 },
    { sentence: "The committee _____ that the proposal be revised before the next meeting.", options: ["recommends", "recommend", "recommending", "recommended"], correct: 0 },
    { sentence: "Neither the manager _____ the team lead was available for comment.", options: ["or", "nor", "and", "but"], correct: 1 },
    { sentence: "The report, _____ was submitted last week, contains several errors.", options: ["that", "which", "who", "whom"], correct: 1 },
    { sentence: "Had the deadline been extended, we _____ completed the analysis.", options: ["would have", "will have", "would", "could"], correct: 0 },
    { sentence: "The minister emphasized the importance of _____ both official languages.", options: ["to promote", "promoting", "promote", "promoted"], correct: 1 },
  ],
  C: [
    { sentence: "The Deputy Minister's directive, _____ implications are far-reaching, requires immediate implementation.", options: ["who's", "whose", "which", "that"], correct: 1 },
    { sentence: "Not only _____ the policy address current concerns, but it also anticipates future challenges.", options: ["does", "did", "has", "is"], correct: 0 },
    { sentence: "The stakeholders insisted that the consultation process _____ transparent and inclusive.", options: ["is", "be", "was", "were"], correct: 1 },
    { sentence: "_____ the complexity of the issue, a phased approach to implementation is recommended.", options: ["Given", "Giving", "Gave", "Give"], correct: 0 },
    { sentence: "The audit revealed discrepancies _____ could not be attributed to clerical error alone.", options: ["who", "which", "what", "whom"], correct: 1 },
    { sentence: "It is imperative that all departments _____ their compliance reports by the stipulated deadline.", options: ["submit", "submits", "submitted", "submitting"], correct: 0 },
    { sentence: "The proposed amendments, _____ controversial, were ultimately adopted by consensus.", options: ["although", "despite", "however", "albeit"], correct: 3 },
  ],
};

// --- Oral Interaction Prompts ---
const oralPrompts: Record<ExamLevel, { scenario: string; prompts: string[] }[]> = {
  A: [{
    scenario: "You are calling a colleague to schedule a meeting about a new project.",
    prompts: [
      "Introduce yourself and state the purpose of your call.",
      "Suggest a date and time for the meeting.",
      "Ask if the colleague has any questions about the project.",
      "Thank the colleague and confirm the meeting details.",
    ],
  }],
  B: [{
    scenario: "You are presenting a proposal to your team for improving workplace efficiency.",
    prompts: [
      "Describe the current challenge your team is facing.",
      "Present your proposed solution with at least two specific recommendations.",
      "Address potential concerns or objections from team members.",
      "Summarize the expected benefits and propose next steps.",
    ],
  }],
  C: [{
    scenario: "You are participating in a policy consultation meeting where you must defend a position on bilingual service delivery.",
    prompts: [
      "Present the current state of bilingual service delivery in your department.",
      "Analyze the strengths and weaknesses of the existing approach.",
      "Propose a comprehensive strategy for improvement, addressing resource allocation and training.",
      "Respond to a hypothetical counter-argument that bilingual services are too costly.",
      "Conclude with a compelling summary of why investment in bilingual services is essential.",
    ],
  }],
};

const EXAM_TIMES: Record<ExamType, Record<ExamLevel, number>> = {
  reading: { A: 600, B: 900, C: 1200 },
  written: { A: 600, B: 900, C: 1200 },
  oral: { A: 300, B: 480, C: 600 },
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function ExamCard({ type, icon, title, desc, color, onStart }: {
  type: ExamType; icon: string; title: string; desc: string; color: string;
  onStart: (type: ExamType) => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group">
      <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}10` }}>
        <span className="material-icons" style={{ color, fontSize: "28px" }}>{icon}</span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h3>
      <p className="text-sm text-gray-500 mb-4 leading-relaxed">{desc}</p>
      <button onClick={() => onStart(type)}
        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-105"
        style={{ background: color }}
        aria-label={`Start ${title} simulation`}>
        Start Simulation
      </button>
    </div>
  );
}

function ReadingSimulation({ level, state, onAnswer, onSubmit }: {
  level: ExamLevel; state: SimulationState;
  onAnswer: (qIdx: number, aIdx: number) => void; onSubmit: () => void;
}) {
  const data = readingQuestions[level][0];
  if (!data) return null;

  return (
    <div className="space-y-5">
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
          <span className="material-icons text-[#008090]" style={{ fontSize: "18px" }}>article</span>
          Reading Passage
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed">{data.passage}</p>
      </div>

      {data.questions.map((q, qIdx) => (
        <div key={qIdx} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-900 mb-3">
            {qIdx + 1}. {q.q}
          </p>
          <div className="space-y-2">
            {q.options.map((opt, oIdx) => {
              const selected = state.answers[qIdx] === oIdx;
              const isCorrect = state.submitted && oIdx === q.correct;
              const isWrong = state.submitted && selected && oIdx !== q.correct;
              return (
                <button key={oIdx} onClick={() => !state.submitted && onAnswer(qIdx, oIdx)}
                  disabled={state.submitted}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm border transition-all ${
                    isCorrect ? "border-[#10b981] bg-[#10b981]/5 text-[#10b981] font-semibold"
                    : isWrong ? "border-[#e74c3c] bg-[#e74c3c]/5 text-[#e74c3c]"
                    : selected ? "border-[#008090] bg-[#008090]/5 text-[#008090] font-medium"
                    : "border-gray-200 hover:border-[#008090] hover:bg-gray-50 text-gray-700"
                  }`}
                  role="radio" aria-checked={selected} aria-label={opt}>
                  <span className="inline-flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] ${
                      selected ? "border-[#008090] bg-[#008090] text-white" : "border-gray-300"
                    }`}>
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {!state.submitted && (
        <button onClick={onSubmit}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-[#008090] hover:brightness-105 transition-all"
          disabled={state.answers.filter((a) => a !== -1).length < data.questions.length}>
          Submit Answers
        </button>
      )}
    </div>
  );
}

function WrittenSimulation({ level, state, onAnswer, onSubmit }: {
  level: ExamLevel; state: SimulationState;
  onAnswer: (qIdx: number, aIdx: number) => void; onSubmit: () => void;
}) {
  const questions = writtenQuestions[level];
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">Instructions:</span> Choose the correct word or phrase to complete each sentence.
        </p>
      </div>

      {questions.map((q, qIdx) => (
        <div key={qIdx} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-900 mb-3">{qIdx + 1}. {q.sentence}</p>
          <div className="flex flex-wrap gap-2">
            {q.options.map((opt, oIdx) => {
              const selected = state.answers[qIdx] === oIdx;
              const isCorrect = state.submitted && oIdx === q.correct;
              const isWrong = state.submitted && selected && oIdx !== q.correct;
              return (
                <button key={oIdx} onClick={() => !state.submitted && onAnswer(qIdx, oIdx)}
                  disabled={state.submitted}
                  className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                    isCorrect ? "border-[#10b981] bg-[#10b981]/10 text-[#10b981] font-bold"
                    : isWrong ? "border-[#e74c3c] bg-[#e74c3c]/10 text-[#e74c3c]"
                    : selected ? "border-[#008090] bg-[#008090]/10 text-[#008090] font-semibold"
                    : "border-gray-200 hover:border-[#008090] text-gray-700"
                  }`}>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {!state.submitted && (
        <button onClick={onSubmit}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-[#008090] hover:brightness-105 transition-all">
          Submit Answers
        </button>
      )}
    </div>
  );
}

function OralSimulation({ level, state }: { level: ExamLevel; state: SimulationState }) {
  const data = oralPrompts[level][0];
  if (!data) return null;

  return (
    <div className="space-y-5">
      <div className="bg-[#008090]/5 border border-[#008090]/15 rounded-xl p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
          <span className="material-icons text-[#008090]" style={{ fontSize: "18px" }}>record_voice_over</span>
          Scenario
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed">{data.scenario}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h4 className="text-sm font-bold text-gray-900 mb-3">Speaking Prompts</h4>
        <p className="text-xs text-gray-400 mb-3">Practice responding to each prompt aloud. Time yourself and aim for clear, structured responses.</p>
        <ol className="space-y-3">
          {data.prompts.map((prompt, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#008090]/10 text-[#008090] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-sm text-gray-700">{prompt}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <p className="text-xs text-gray-500 flex items-center gap-2">
          <span className="material-icons text-[#f5a623]" style={{ fontSize: "16px" }}>tips_and_updates</span>
          <strong>Tip:</strong> Record yourself using your phone and listen back. Focus on clarity, grammar, and vocabulary appropriate to the level.
        </p>
      </div>
    </div>
  );
}

export default function SLEPractice() {
  const { t } = useLanguage();
  const [selectedLevel, setSelectedLevel] = useState<ExamLevel>("B");
  const [simulation, setSimulation] = useState<SimulationState | null>(null);

  const startSimulation = useCallback((type: ExamType) => {
    const totalQ = type === "reading" ? readingQuestions[selectedLevel][0]?.questions.length ?? 0
      : type === "written" ? writtenQuestions[selectedLevel].length : 0;
    setSimulation({
      active: true, examType: type, level: selectedLevel,
      currentQ: 0, answers: new Array(totalQ).fill(-1),
      timeLeft: EXAM_TIMES[type][selectedLevel], submitted: false,
    });
  }, [selectedLevel]);

  // Timer
  useEffect(() => {
    if (!simulation?.active || simulation.submitted) return;
    const interval = setInterval(() => {
      setSimulation((prev) => {
        if (!prev || prev.timeLeft <= 0) return prev;
        if (prev.timeLeft === 1) return { ...prev, timeLeft: 0, submitted: true };
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [simulation?.active, simulation?.submitted]);

  const handleAnswer = (qIdx: number, aIdx: number) => {
    setSimulation((prev) => {
      if (!prev) return prev;
      const newAnswers = [...prev.answers];
      newAnswers[qIdx] = aIdx;
      return { ...prev, answers: newAnswers };
    });
  };

  const handleSubmit = () => {
    setSimulation((prev) => prev ? { ...prev, submitted: true } : prev);
  };

  const getScore = (): { correct: number; total: number; percentage: number } => {
    if (!simulation) return { correct: 0, total: 0, percentage: 0 };
    let correct = 0;
    let total = 0;
    if (simulation.examType === "reading") {
      const qs = readingQuestions[simulation.level][0]?.questions ?? [];
      total = qs.length;
      qs.forEach((q, i) => { if (simulation.answers[i] === q.correct) correct++; });
    } else if (simulation.examType === "written") {
      const qs = writtenQuestions[simulation.level];
      total = qs.length;
      qs.forEach((q, i) => { if (simulation.answers[i] === q.correct) correct++; });
    }
    return { correct, total, percentage: total > 0 ? Math.round((correct / total) * 100) : 0 };
  };

  const resetSimulation = () => setSimulation(null);

  return (
    <DashboardLayout>
      <div className="max-w-[900px] space-y-5">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-icons text-[#008090]" style={{ fontSize: "28px" }}>school</span>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              {t("sle.title")}
            </h1>
          </div>
          <p className="text-gray-500 text-sm">{t("sle.subtitle")}</p>

          {/* Level Selector */}
          <div className="flex items-center gap-3 mt-4">
            <span className="text-xs text-gray-400 font-medium">Target Level:</span>
            {(["A", "B", "C"] as ExamLevel[]).map((lvl) => (
              <button key={lvl} onClick={() => { setSelectedLevel(lvl); resetSimulation(); }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  selectedLevel === lvl
                    ? "bg-[#008090] text-white border-[#008090]"
                    : "bg-white text-gray-500 border-gray-200 hover:border-[#008090] hover:text-[#008090]"
                }`}
                aria-pressed={selectedLevel === lvl}>
                Level {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Active Simulation */}
        {simulation?.active ? (
          <div className="space-y-4">
            {/* Timer Bar */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={resetSimulation}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Exit simulation">
                  <span className="material-icons text-gray-400">arrow_back</span>
                </button>
                <div>
                  <span className="text-sm font-bold text-gray-900 capitalize">{simulation.examType} — Level {simulation.level}</span>
                  {simulation.submitted && (
                    <span className="ml-2 text-xs text-[#10b981] font-semibold">Submitted</span>
                  )}
                </div>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${
                simulation.timeLeft < 60 ? "bg-[#e74c3c]/10 text-[#e74c3c]" : "bg-[#008090]/10 text-[#008090]"
              }`} role="timer" aria-label={`Time remaining: ${formatTime(simulation.timeLeft)}`}>
                <span className="material-icons" style={{ fontSize: "16px" }}>timer</span>
                {formatTime(simulation.timeLeft)}
              </div>
            </div>

            {/* Score Card (after submit) */}
            {simulation.submitted && simulation.examType !== "oral" && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center">
                <div className="text-4xl font-bold mb-2" style={{ color: getScore().percentage >= 70 ? "#10b981" : "#e74c3c" }}>
                  {getScore().percentage}%
                </div>
                <p className="text-sm text-gray-500">{getScore().correct} / {getScore().total} correct</p>
                <p className="text-xs mt-2 font-semibold" style={{ color: getScore().percentage >= 70 ? "#10b981" : "#e74c3c" }}>
                  {getScore().percentage >= 70 ? "Congratulations! You passed!" : "Keep practicing — you'll get there!"}
                </p>
                <button onClick={resetSimulation}
                  className="mt-4 px-6 py-2 rounded-xl text-sm font-semibold text-white bg-[#008090] hover:brightness-105 transition-all">
                  Try Another
                </button>
              </div>
            )}

            {/* Simulation Content */}
            {simulation.examType === "reading" && (
              <ReadingSimulation level={simulation.level} state={simulation} onAnswer={handleAnswer} onSubmit={handleSubmit} />
            )}
            {simulation.examType === "written" && (
              <WrittenSimulation level={simulation.level} state={simulation} onAnswer={handleAnswer} onSubmit={handleSubmit} />
            )}
            {simulation.examType === "oral" && (
              <OralSimulation level={simulation.level} state={simulation} />
            )}
          </div>
        ) : (
          <>
            {/* Exam Type Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ExamCard type="reading" icon="menu_book" title={t("sle.readingComprehension")}
                desc="Read passages and answer comprehension questions. Tests your ability to understand written texts in your second language."
                color="#008090" onStart={startSimulation} />
              <ExamCard type="written" icon="edit_note" title={t("sle.writtenExpression")}
                desc="Complete sentences by choosing the correct grammatical form. Tests your knowledge of grammar, syntax, and vocabulary."
                color="#8b5cf6" onStart={startSimulation} />
              <ExamCard type="oral" icon="record_voice_over" title={t("sle.oralInteraction")}
                desc="Practice responding to workplace scenarios. Guided prompts help you structure clear, professional oral responses."
                color="#f5a623" onStart={startSimulation} />
            </div>

            {/* Info Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="material-icons text-[#008090]" style={{ fontSize: "18px" }}>info</span>
                About the SLE
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                {[
                  { level: "Level A", desc: "Basic proficiency — simple workplace interactions and routine tasks." },
                  { level: "Level B", desc: "Intermediate proficiency — most bilingual positions require this level." },
                  { level: "Level C", desc: "Advanced proficiency — complex analysis, policy work, and leadership roles." },
                ].map((item) => (
                  <div key={item.level} className="p-3 rounded-xl bg-gray-50">
                    <div className="text-sm font-bold text-[#008090]">{item.level}</div>
                    <p className="text-[11px] text-gray-500 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
