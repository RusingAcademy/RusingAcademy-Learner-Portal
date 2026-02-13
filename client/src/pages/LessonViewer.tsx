/**
 * LessonViewer — RusingÂcademy Learning Portal
 * Interactive 7-slot lesson structure with real course content
 * Slots: Hook → Video → Strategy → Written → Oral → Quiz → Coaching
 * Design: Premium glassmorphism, teal/gold, step-by-step progression
 */
import { useState, useCallback, useMemo } from "react";
import { Link, useParams, useLocation } from "wouter";
import { getProgramById, type Program } from "@/data/courseData";
import { getLessonContent, type SlotContent } from "@/data/lessonContent";
import { useGamification } from "@/contexts/GamificationContext";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";

const SLOT_CONFIG = [
  { key: "hook", icon: "bolt", label: "Hook / Accroche", labelFr: "Accroche", color: "#e74c3c", description: "Warm-up scenario to activate prior knowledge" },
  { key: "video", icon: "play_circle", label: "Video Lesson / Scène", labelFr: "Leçon Vidéo", color: "#3498db", description: "Core instructional content with examples" },
  { key: "strategy", icon: "psychology", label: "Grammar / Strategy", labelFr: "Grammaire & Stratégie", color: "#8b5cf6", description: "Pattern → Proof → Practice methodology" },
  { key: "written", icon: "edit_note", label: "Written Practice", labelFr: "Pratique Écrite", color: "#059669", description: "Guided writing exercises and scenarios" },
  { key: "oral", icon: "mic", label: "Oral Practice", labelFr: "Pratique Orale + Phonétique", color: "#f59e0b", description: "Speaking activities and pronunciation drills" },
  { key: "quiz", icon: "quiz", label: "Formative Quiz", labelFr: "Quiz Formatif", color: "#008090", description: "8 questions to check understanding" },
  { key: "coaching", icon: "support_agent", label: "Coaching Corner", labelFr: "Conseil du Coach", color: "#f5a623", description: "Reflection and self-assessment" },
];

const SLOT_KEY_MAP: Record<string, string> = {
  hook: "hook",
  video: "video",
  strategy: "strategy",
  written: "written",
  oral: "oral",
  quiz: "quiz",
  coaching: "coaching",
};

/** Render markdown-like content into styled HTML */
function RichContent({ content, slotKey }: { content: string; slotKey: string }) {
  const lines = content.split('\n');
  const elements: React.ReactElement[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let tableHeaders: string[] = [];
  let inBlockquote = false;
  let blockquoteLines: string[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];

  const flushBlockquote = () => {
    if (blockquoteLines.length > 0) {
      elements.push(
        <blockquote key={`bq-${elements.length}`} className="border-l-4 pl-4 py-2 my-3 text-sm italic text-gray-600 rounded-r-lg" style={{
          borderColor: "#008090",
          background: "rgba(0,128,144,0.04)",
        }}>
          {blockquoteLines.map((l, i) => <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: formatInline(l) }} />)}
        </blockquote>
      );
      blockquoteLines = [];
    }
    inBlockquote = false;
  };

  const flushTable = () => {
    if (tableRows.length > 0) {
      elements.push(
        <div key={`tbl-${elements.length}`} className="overflow-x-auto my-4 rounded-xl" style={{ border: "1px solid rgba(0,128,144,0.1)" }}>
          <table className="w-full text-sm">
            {tableHeaders.length > 0 && (
              <thead>
                <tr style={{ background: "rgba(0,128,144,0.06)" }}>
                  {tableHeaders.map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left font-semibold text-gray-900 text-xs">{h.trim()}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {tableRows.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: "1px solid rgba(0,128,144,0.06)" }}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-gray-700" dangerouslySetInnerHTML={{ __html: formatInline(cell.trim()) }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      tableHeaders = [];
    }
    inTable = false;
  };

  function formatInline(text: string): string {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="text-gray-600">$1</em>')
      .replace(/`(.+?)`/g, '<code class="px-1 py-0.5 rounded bg-gray-100 text-[#008090] text-xs font-mono">$1</code>');
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      if (inBlockquote) flushBlockquote();
      if (inTable) flushTable();
      continue;
    }

    // Code blocks
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${elements.length}`} className="bg-gray-50 rounded-xl p-4 my-3 text-xs font-mono overflow-x-auto" style={{ border: "1px solid rgba(0,128,144,0.08)" }}>
            <code>{codeLines.join('\n')}</code>
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) { codeLines.push(line); continue; }

    // Tables
    if (trimmed.includes('|') && trimmed.startsWith('|')) {
      const cells = trimmed.split('|').filter(c => c.trim());
      if (trimmed.match(/^\|[\s:-]+\|/)) continue; // separator row
      if (!inTable) {
        inTable = true;
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Blockquotes
    if (trimmed.startsWith('>')) {
      inBlockquote = true;
      blockquoteLines.push(trimmed.replace(/^>\s*/, ''));
      continue;
    } else if (inBlockquote) {
      flushBlockquote();
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={`h4-${elements.length}`} className="text-base font-bold text-gray-900 mt-5 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          {trimmed.replace('### ', '')}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={`h3-${elements.length}`} className="text-lg font-bold text-gray-900 mt-6 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          {trimmed.replace('## ', '')}
        </h3>
      );
      continue;
    }

    // Horizontal rule
    if (trimmed === '---') {
      elements.push(<hr key={`hr-${elements.length}`} className="my-4" style={{ borderColor: "rgba(0,128,144,0.08)" }} />);
      continue;
    }

    // Checklist items
    if (trimmed.startsWith('- [ ]') || trimmed.startsWith('- [x]')) {
      const checked = trimmed.startsWith('- [x]');
      const text = trimmed.replace(/^- \[.\]\s*/, '');
      elements.push(
        <label key={`check-${elements.length}`} className="flex items-start gap-2 py-1 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" defaultChecked={checked} className="mt-1 accent-[#008090]" />
          <span dangerouslySetInnerHTML={{ __html: formatInline(text) }} />
        </label>
      );
      continue;
    }

    // List items
    if (trimmed.match(/^\d+\.\s/)) {
      const text = trimmed.replace(/^\d+\.\s+/, '');
      elements.push(
        <div key={`li-${elements.length}`} className="flex gap-2 py-1 text-sm text-gray-700">
          <span className="text-[#008090] font-bold flex-shrink-0">{trimmed.match(/^\d+/)![0]}.</span>
          <span dangerouslySetInnerHTML={{ __html: formatInline(text) }} />
        </div>
      );
      continue;
    }
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const text = trimmed.replace(/^[-*]\s+/, '');
      elements.push(
        <div key={`ul-${elements.length}`} className="flex gap-2 py-0.5 text-sm text-gray-700 pl-2">
          <span className="text-[#008090] mt-1.5 flex-shrink-0">•</span>
          <span dangerouslySetInnerHTML={{ __html: formatInline(text) }} />
        </div>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${elements.length}`} className="text-sm text-gray-700 leading-relaxed my-2" dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />
    );
  }

  // Flush remaining
  if (inBlockquote) flushBlockquote();
  if (inTable) flushTable();

  return <div className="space-y-1">{elements}</div>;
}

/** Quiz component with real questions from lesson content */
function FormativeQuiz({ lessonId, realQuiz, onComplete }: { 
  lessonId: string; 
  realQuiz?: { title: string; questions: any[] } | null;
  onComplete: (score: number) => void;
}) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(string | number)[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [fillAnswer, setFillAnswer] = useState("");

  // Use real quiz data if available, otherwise fallback
  const questions = useMemo(() => {
    if (realQuiz?.questions?.length) {
      return realQuiz.questions.map((q: any) => ({
        q: q.question,
        type: q.type || "multiple-choice",
        opts: q.options || [],
        answer: q.answer,
        feedback: q.feedback || "",
      }));
    }
    // Fallback generic questions
    return [
      { q: "Which greeting is most appropriate in a formal Canadian workplace?", type: "multiple-choice", opts: ["Hey, what's up?", "Good morning, how are you?", "Yo!", "Sup?"], answer: "Good morning, how are you?", feedback: "In a professional setting, 'Good morning, how are you?' is the most appropriate greeting." },
      { q: "When introducing yourself professionally, you should include:", type: "multiple-choice", opts: ["Your nickname", "Your name and role", "Your salary", "Your age"], answer: "Your name and role", feedback: "A professional introduction includes your name and your role in the organization." },
      { q: "The correct way to ask for clarification is:", type: "multiple-choice", opts: ["What?!", "Could you please repeat that?", "Huh?", "I don't care"], answer: "Could you please repeat that?", feedback: "Using polite language like 'Could you please repeat that?' shows professionalism." },
      { q: "In a professional email, the appropriate closing is:", type: "multiple-choice", opts: ["Later!", "XOXO", "Best regards,", "Bye bye"], answer: "Best regards,", feedback: "'Best regards' is a standard professional email closing." },
      { q: "Active listening involves:", type: "multiple-choice", opts: ["Checking your phone", "Making eye contact and nodding", "Interrupting frequently", "Looking away"], answer: "Making eye contact and nodding", feedback: "Active listening means showing engagement through eye contact and appropriate responses." },
    ];
  }, [realQuiz]);

  const handleMultipleChoice = (idx: number) => {
    setSelectedAnswer(idx);
    setShowFeedback(true);
    
    setTimeout(() => {
      const newAnswers = [...answers, questions[currentQ].opts[idx]];
      setAnswers(newAnswers);
      setSelectedAnswer(null);
      setShowFeedback(false);
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
      } else {
        const score = newAnswers.reduce((s, a, i) => s + (String(a).toLowerCase().trim() === String(questions[i].answer).toLowerCase().trim() ? 1 : 0), 0);
        setShowResult(true);
        onComplete(Math.round((score / questions.length) * 100));
      }
    }, 2500);
  };

  const handleFillBlank = () => {
    if (!fillAnswer.trim()) return;
    setShowFeedback(true);
    
    setTimeout(() => {
      const newAnswers = [...answers, fillAnswer.trim()];
      setAnswers(newAnswers);
      setFillAnswer("");
      setShowFeedback(false);
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
      } else {
        const score = newAnswers.reduce((s: number, a, i) => s + (String(a).toLowerCase().trim() === String(questions[i].answer).toLowerCase().trim() ? 1 : 0), 0);
        setShowResult(true);
        onComplete(Math.round((score / questions.length) * 100));
      }
    }, 2500);
  };

  if (showResult) {
    const score = answers.reduce((s: number, a, i) => s + (String(a).toLowerCase().trim() === String(questions[i].answer).toLowerCase().trim() ? 1 : 0), 0);
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 60;
    return (
      <div className="text-center py-8">
        <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-4" style={{
          background: passed ? "linear-gradient(135deg, #f5a623, #ffd700)" : "rgba(231,76,60,0.1)",
          boxShadow: passed ? "0 8px 32px rgba(245,166,35,0.3)" : "none",
        }}>
          <span className="material-icons text-4xl" style={{ color: passed ? "white" : "#e74c3c" }}>
            {passed ? "emoji_events" : "refresh"}
          </span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
          {passed ? (pct >= 90 ? "Excellent !" : "Bien joué !") : "Continuez à pratiquer !"}
        </h3>
        <p className="text-4xl font-bold mt-3" style={{ color: passed ? "#f5a623" : "#e74c3c" }}>{pct}%</p>
        <p className="text-sm text-gray-500 mt-1">{score}/{questions.length} bonnes réponses</p>
        {passed && <p className="text-sm text-[#008090] mt-3 font-medium">+50 XP earned!</p>}
        
        {/* Show answer review */}
        <div className="mt-6 text-left max-w-lg mx-auto space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Review</h4>
          {questions.map((q, i) => {
            const isCorrect = String(answers[i]).toLowerCase().trim() === String(q.answer).toLowerCase().trim();
            return (
              <div key={i} className="p-3 rounded-xl text-sm" style={{
                background: isCorrect ? "rgba(0,128,144,0.05)" : "rgba(231,76,60,0.05)",
                border: `1px solid ${isCorrect ? "rgba(0,128,144,0.15)" : "rgba(231,76,60,0.15)"}`,
              }}>
                <div className="flex items-start gap-2">
                  <span className="material-icons flex-shrink-0 mt-0.5" style={{ fontSize: "16px", color: isCorrect ? "#008090" : "#e74c3c" }}>
                    {isCorrect ? "check_circle" : "cancel"}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900 text-xs">{q.q}</p>
                    {!isCorrect && <p className="text-xs text-[#008090] mt-1">Réponse correcte : <strong>{q.answer}</strong></p>}
                    {q.feedback && <p className="text-xs text-gray-500 mt-1 italic">{q.feedback}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!passed && (
          <button onClick={() => { setCurrentQ(0); setAnswers([]); setShowResult(false); }}
            className="mt-6 px-8 py-3 rounded-xl text-sm font-semibold text-white" style={{ background: "#008090" }}>
            <span className="material-icons align-middle mr-1" style={{ fontSize: "16px" }}>replay</span>
            Réessayer
          </button>
        )}
      </div>
    );
  }

  const currentQuestion = questions[currentQ];
  const isCorrectAnswer = selectedAnswer !== null && currentQuestion.opts[selectedAnswer] === currentQuestion.answer;
  const isFillCorrect = showFeedback && fillAnswer.toLowerCase().trim() === String(currentQuestion.answer).toLowerCase().trim();

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-1.5">
        {questions.map((_, i) => (
          <div key={i} className="flex-1 h-2 rounded-full transition-all duration-500" style={{
            background: i < currentQ ? "#008090" : i === currentQ ? "rgba(0,128,144,0.3)" : "rgba(0,128,144,0.08)",
          }} />
        ))}
      </div>
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-400 font-medium">Question {currentQ + 1} / {questions.length}</p>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{
          background: currentQuestion.type === "fill-in-the-blank" ? "rgba(245,166,35,0.15)" : "rgba(0,128,144,0.1)",
          color: currentQuestion.type === "fill-in-the-blank" ? "#f5a623" : "#008090",
        }}>
          {currentQuestion.type === "fill-in-the-blank" ? "Fill in the blank" : "Multiple choice"}
        </span>
      </div>

      <h4 className="text-lg font-semibold text-gray-900 leading-relaxed">{currentQuestion.q}</h4>

      {currentQuestion.type === "fill-in-the-blank" ? (
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={fillAnswer}
              onChange={(e) => setFillAnswer(e.target.value)}
              disabled={showFeedback}
              placeholder="Tapez votre réponse..."
              className="flex-1 px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2"
              style={{
                borderColor: showFeedback ? (isFillCorrect ? "#008090" : "#e74c3c") : "rgba(0,128,144,0.2)",
                background: showFeedback ? (isFillCorrect ? "rgba(0,128,144,0.05)" : "rgba(231,76,60,0.05)") : "white",
              }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !showFeedback) handleFillBlank(); }}
            />
            {!showFeedback && (
              <button onClick={handleFillBlank}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: "#008090" }}>
                Valider
              </button>
            )}
          </div>
          {showFeedback && (
            <div className="p-3 rounded-xl text-sm" style={{
              background: isFillCorrect ? "rgba(0,128,144,0.06)" : "rgba(231,76,60,0.06)",
              border: `1px solid ${isFillCorrect ? "rgba(0,128,144,0.2)" : "rgba(231,76,60,0.2)"}`,
            }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-icons" style={{ fontSize: "18px", color: isFillCorrect ? "#008090" : "#e74c3c" }}>
                  {isFillCorrect ? "check_circle" : "cancel"}
                </span>
                <span className="font-semibold" style={{ color: isFillCorrect ? "#008090" : "#e74c3c" }}>
                  {isFillCorrect ? "Correct !" : `Incorrect — Réponse : ${currentQuestion.answer}`}
                </span>
              </div>
              {currentQuestion.feedback && <p className="text-xs text-gray-600 italic ml-7">{currentQuestion.feedback}</p>}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {currentQuestion.opts.map((opt: string, idx: number) => {
            const isSelected = selectedAnswer === idx;
            const isCorrect = opt === currentQuestion.answer;
            let bg = "rgba(255,255,255,0.8)";
            let border = "1px solid rgba(0,128,144,0.1)";
            if (showFeedback && isSelected && isCorrect) {
              bg = "rgba(0,128,144,0.1)"; border = "2px solid #008090";
            } else if (showFeedback && isSelected && !isCorrect) {
              bg = "rgba(231,76,60,0.08)"; border = "2px solid #e74c3c";
            } else if (showFeedback && isCorrect) {
              bg = "rgba(0,128,144,0.06)"; border = "1px solid rgba(0,128,144,0.3)";
            }
            return (
              <button key={idx} onClick={() => !showFeedback && handleMultipleChoice(idx)}
                disabled={showFeedback}
                className="w-full text-left p-4 rounded-xl transition-all duration-300 text-sm flex items-center gap-3"
                style={{ background: bg, border }}>
                <span className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{
                  background: isSelected ? (isCorrect ? "#008090" : "#e74c3c") : "rgba(0,128,144,0.08)",
                  color: isSelected ? "white" : "#008090",
                }}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1">{opt}</span>
                {showFeedback && isCorrect && (
                  <span className="material-icons text-[#008090]" style={{ fontSize: "20px" }}>check_circle</span>
                )}
                {showFeedback && isSelected && !isCorrect && (
                  <span className="material-icons text-[#e74c3c]" style={{ fontSize: "20px" }}>cancel</span>
                )}
              </button>
            );
          })}
          {showFeedback && currentQuestion.feedback && (
            <div className="mt-3 p-3 rounded-xl text-sm" style={{
              background: "rgba(0,128,144,0.04)",
              border: "1px solid rgba(0,128,144,0.1)",
            }}>
              <span className="material-icons align-middle mr-1 text-[#008090]" style={{ fontSize: "16px" }}>lightbulb</span>
              <span className="text-gray-600 italic">{currentQuestion.feedback}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LessonViewer() {
  const params = useParams<{ programId: string; pathId: string; lessonId: string }>();
  const [, navigate] = useLocation();
  const programId = params.programId as Program;
  const pathId = params.pathId || "";
  const lessonId = params.lessonId || "";
  const program = getProgramById(programId);
  const path = program?.paths.find((p) => p.id === pathId);

  // Find the lesson across all modules
  let lesson = null;
  let currentModule = null;
  if (path) {
    for (const mod of path.modules) {
      const found = mod.lessons.find((l) => l.id === lessonId);
      if (found) { lesson = found; currentModule = mod; break; }
    }
  }

  // Get real lesson content from extracted data
  const realContent = useMemo(() => getLessonContent(lessonId, programId), [lessonId, programId]);

  const { completedLessons, addXP, completeLesson, completeSlot } = useGamification();
  const moduleIndex = currentModule ? path!.modules.indexOf(currentModule) : 0;
  const [activeSlot, setActiveSlot] = useState(0);
  const [completedSlots, setCompletedSlots] = useState<Set<number>>(new Set());
  const lessonKey = `${programId}-${lessonId}`;
  const isLessonComplete = completedLessons.has(lessonKey);

  const handleSlotComplete = useCallback((slotIdx: number) => {
    setCompletedSlots((prev) => {
      const next = new Set(prev);
      next.add(slotIdx);
      return next;
    });
    completeSlot(lessonKey, slotIdx, programId, pathId, moduleIndex);
    toast.success(`${SLOT_CONFIG[slotIdx].label} completed!`, { duration: 2000 });
    if (slotIdx < SLOT_CONFIG.length - 1) {
      setTimeout(() => setActiveSlot(slotIdx + 1), 500);
    }
  }, [lessonKey, programId, pathId, moduleIndex, completeSlot]);

  const { passQuiz } = useGamification();
  const handleQuizComplete = useCallback((score: number) => {
    if (score >= 60) {
      handleSlotComplete(5);
      addXP(50);
      passQuiz(`${programId}-${lessonId}-formative`, score, 8, Math.round(score * 8 / 100), programId, pathId, lessonId, "formative");
    }
    toast.success(`Quiz terminé: ${score}% — ${score >= 60 ? "+50 XP" : "Réessayez!"}`, { duration: 3000 });
  }, [handleSlotComplete, addXP, passQuiz, programId, pathId, lessonId]);

  const handleLessonComplete = useCallback(() => {
    if (!isLessonComplete && lesson) {
      completeLesson(lessonKey, programId, pathId, moduleIndex);
      addXP(lesson.xpReward);
      toast.success(`Leçon terminée ! +${lesson.xpReward} XP 🎉`, { duration: 4000 });
    }
  }, [isLessonComplete, lesson, lessonKey, completeLesson, addXP]);

  const findNextLesson = () => {
    if (!path || !currentModule) return null;
    const allLessons = path.modules.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleId: m.id })));
    const currentIdx = allLessons.findIndex((l) => l.id === lessonId);
    if (currentIdx >= 0 && currentIdx < allLessons.length - 1) {
      return allLessons[currentIdx + 1];
    }
    return null;
  };

  if (!program || !path || !lesson || !currentModule) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <span className="material-icons text-6xl text-gray-300">error_outline</span>
          <p className="text-gray-500 mt-4">Lesson not found.</p>
          <Link href="/programs" className="text-[#008090] text-sm mt-2 inline-block hover:underline">← Back to Programs</Link>
        </div>
      </DashboardLayout>
    );
  }

  const nextLesson = findNextLesson();
  const allSlotsComplete = completedSlots.size >= SLOT_CONFIG.length;
  const currentSlotKey = SLOT_CONFIG[activeSlot].key;
  const slotRealContent = realContent?.[currentSlotKey];
  const hasRealContent = !!slotRealContent?.content;

  // Get quiz data from real content
  const quizData = realContent?.quiz?.quiz || null;

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
          <Link href={`/programs/${programId}`} className="hover:text-[#008090] transition-colors">{program.title}</Link>
          <span className="text-gray-300">/</span>
          <Link href={`/programs/${programId}/${pathId}`} className="hover:text-[#008090] transition-colors">Path {path.number}</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">Lesson {lesson.id}</span>
        </div>

        {/* Lesson Header */}
        <div className="rounded-2xl p-6" style={{
          background: "linear-gradient(135deg, rgba(0,128,144,0.06), rgba(245,166,35,0.04))",
          border: "1px solid rgba(0,128,144,0.1)",
        }}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{
                  background: "rgba(0,128,144,0.1)", color: "#008090",
                }}>
                  Module {currentModule.id} — Leçon {lesson.id}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{
                  background: "rgba(245,166,35,0.15)", color: "#f5a623",
                }}>
                  +{lesson.xpReward} XP
                </span>
                {hasRealContent && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{
                    background: "rgba(0,128,144,0.08)", color: "#008090",
                  }}>
                    <span className="material-icons align-middle" style={{ fontSize: "10px" }}>verified</span> Contenu complet
                  </span>
                )}
                {isLessonComplete && (
                  <span className="text-[10px] font-bold text-[#f5a623] flex items-center gap-0.5">
                    <span className="material-icons" style={{ fontSize: "12px" }}>check_circle</span>
                    Terminée
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                {lesson.title}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">{lesson.titleFr}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="material-icons" style={{ fontSize: "14px" }}>schedule</span>
              {lesson.duration}
            </div>
          </div>

          {/* Slot Progress */}
          <div className="mt-4 flex items-center gap-1">
            {SLOT_CONFIG.map((slot, idx) => (
              <div key={slot.key} className="flex-1 h-2.5 rounded-full cursor-pointer transition-all duration-300 hover:scale-y-125"
                onClick={() => setActiveSlot(idx)}
                title={slot.label}
                style={{
                  background: completedSlots.has(idx) ? slot.color : idx === activeSlot ? `${slot.color}40` : "rgba(0,128,144,0.06)",
                }} />
            ))}
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-gray-400 font-medium">{completedSlots.size}/{SLOT_CONFIG.length} activités complétées</span>
            <span className="text-[10px] font-semibold" style={{ color: SLOT_CONFIG[activeSlot].color }}>{SLOT_CONFIG[activeSlot].label}</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Slot Navigation (Sidebar) */}
          <div className="lg:col-span-1 space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Activités de la leçon</h3>
            {SLOT_CONFIG.map((slot, idx) => (
              <button key={slot.key} onClick={() => setActiveSlot(idx)}
                className="w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all duration-200"
                style={{
                  background: idx === activeSlot ? "rgba(255,255,255,0.95)" : "transparent",
                  border: idx === activeSlot ? `1px solid ${slot.color}30` : "1px solid transparent",
                  boxShadow: idx === activeSlot ? `0 4px 16px ${slot.color}15` : "none",
                }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all" style={{
                  background: completedSlots.has(idx) ? slot.color : `${slot.color}15`,
                }}>
                  <span className="material-icons" style={{
                    fontSize: "16px",
                    color: completedSlots.has(idx) ? "white" : slot.color,
                  }}>
                    {completedSlots.has(idx) ? "check" : slot.icon}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{slot.label}</p>
                  <p className="text-[10px] text-gray-400">{slot.labelFr}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Slot Content */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl p-6" style={{
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(0,128,144,0.08)",
              minHeight: "450px",
            }}>
              {/* Slot Header */}
              <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: "1px solid rgba(0,128,144,0.06)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                  background: `${SLOT_CONFIG[activeSlot].color}15`,
                }}>
                  <span className="material-icons" style={{ color: SLOT_CONFIG[activeSlot].color }}>
                    {SLOT_CONFIG[activeSlot].icon}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {slotRealContent?.title || SLOT_CONFIG[activeSlot].label}
                  </h2>
                  <p className="text-xs text-gray-400">{SLOT_CONFIG[activeSlot].description}</p>
                </div>
              </div>

              {/* Slot Body */}
              {activeSlot === 5 ? (
                <FormativeQuiz lessonId={lessonId} realQuiz={quizData} onComplete={handleQuizComplete} />
              ) : (
                <div className="space-y-4">
                  {hasRealContent ? (
                    <RichContent content={slotRealContent!.content} slotKey={currentSlotKey} />
                  ) : (
                    <div className="space-y-4">
                      {getDefaultSlotContent(currentSlotKey, lesson.title, lesson.id).map((para, i) => (
                        <p key={i} className="text-sm text-gray-700 leading-relaxed">{para}</p>
                      ))}
                    </div>
                  )}

                  {/* Slot action button */}
                  {!completedSlots.has(activeSlot) && (
                    <button onClick={() => handleSlotComplete(activeSlot)}
                      className="mt-6 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                      style={{ background: SLOT_CONFIG[activeSlot].color }}>
                      <span className="material-icons align-middle mr-1" style={{ fontSize: "16px" }}>check_circle</span>
                      Marquer comme terminé & Continuer
                    </button>
                  )}
                  {completedSlots.has(activeSlot) && (
                    <div className="mt-6 flex items-center gap-2 text-sm font-medium" style={{ color: SLOT_CONFIG[activeSlot].color }}>
                      <span className="material-icons" style={{ fontSize: "18px" }}>check_circle</span>
                      Activité terminée !
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lesson Completion / Navigation */}
        <div className="rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4" style={{
          background: allSlotsComplete ? "linear-gradient(135deg, rgba(245,166,35,0.1), rgba(0,128,144,0.05))" : "rgba(255,255,255,0.6)",
          border: allSlotsComplete ? "1px solid rgba(245,166,35,0.3)" : "1px solid rgba(0,128,144,0.08)",
        }}>
          <Link href={`/programs/${programId}/${pathId}`}
            className="text-sm text-gray-500 hover:text-[#008090] transition-colors flex items-center gap-1">
            <span className="material-icons" style={{ fontSize: "16px" }}>arrow_back</span>
            Retour au Path {path.number}
          </Link>

          <div className="flex items-center gap-3">
            {allSlotsComplete && !isLessonComplete && (
              <button onClick={handleLessonComplete}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #f5a623, #e8941a)" }}>
                <span className="material-icons align-middle mr-1" style={{ fontSize: "16px" }}>emoji_events</span>
                Terminer la leçon (+{lesson.xpReward} XP)
              </button>
            )}
            {nextLesson && (
              <Link href={`/programs/${programId}/${pathId}/${nextLesson.id}`}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-1 hover:shadow-lg transition-all"
                style={{ background: "#008090" }}>
                Leçon suivante
                <span className="material-icons" style={{ fontSize: "16px" }}>arrow_forward</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Fallback content when real content is not available
function getDefaultSlotContent(slotKey: string, lessonTitle: string, lessonId: string): string[] {
  const contents: Record<string, string[]> = {
    hook: [
      `Imaginez que vous commencez votre première journée dans un nouveau bureau gouvernemental. Votre superviseur vous présente à l'équipe dans la langue cible. Comment répondriez-vous ?`,
      `Prenez un moment pour réfléchir à ce scénario. Quels mots ou expressions vous viennent à l'esprit ?`,
      `Dans cette leçon, "${lessonTitle}", nous allons développer les compétences nécessaires pour gérer cette situation avec confiance.`,
    ],
    video: [
      `Regardez la vidéo pédagogique pour la Leçon ${lessonId} : "${lessonTitle}"`,
      `Les concepts clés abordés dans cette leçon incluent le vocabulaire professionnel, les structures grammaticales et le contexte culturel pertinent pour la fonction publique canadienne.`,
      `Après le visionnage, prenez note des 3 phrases ou structures les plus importantes que vous avez apprises.`,
    ],
    strategy: [
      `Stratégie métacognitive du jour : **Écoute active et Prédiction**`,
      `Avant de participer à une conversation, essayez de prédire le vocabulaire et les structures dont vous pourriez avoir besoin. Cette préparation mentale améliore considérablement la performance en temps réel.`,
      `Conseil pratique : Avant votre prochaine réunion, notez 5 phrases clés dont vous pourriez avoir besoin. Révisez-les juste avant le début de la réunion.`,
    ],
    written: [
      `Complétez les exercices écrits suivants pour renforcer votre apprentissage de cette leçon.`,
      `Exercice 1 : Rédigez un court courriel professionnel (50-75 mots) en utilisant au moins 3 nouveaux éléments de vocabulaire de cette leçon.`,
      `Exercice 2 : Complétez les blancs dans le dialogue ci-dessous avec les expressions appropriées.`,
      `Exercice 3 : Réécrivez les phrases informelles en utilisant un registre professionnel.`,
    ],
    oral: [
      `Pratiquez à voix haute les phrases clés de cette leçon.`,
      `Activité 1 : Enregistrez-vous en vous présentant dans un contexte professionnel en utilisant les structures de cette leçon.`,
      `Activité 2 : Jouez le scénario de l'Accroche avec un partenaire ou pratiquez seul(e), en jouant les deux rôles.`,
      `N'oubliez pas : Concentrez-vous sur la clarté et la confiance, pas sur la perfection !`,
    ],
    quiz: [
      `Testez votre compréhension avec ce quiz formatif.`,
      `Vous avez besoin de 60% pour réussir. Vous pouvez reprendre le quiz autant de fois que nécessaire.`,
      `Bonne chance !`,
    ],
    coaching: [
      `Réfléchissez à ce que vous avez appris dans cette leçon :`,
      `1. Quelle a été la phrase ou la structure la plus utile que vous avez apprise aujourd'hui ?`,
      `2. Sur une échelle de 1 à 5, à quel point vous sentez-vous confiant(e) pour utiliser ces compétences dans une situation de travail réelle ?`,
      `3. Quelle est une situation spécifique cette semaine où vous pourriez pratiquer ce que vous avez appris ?`,
      `Fixez-vous un objectif personnel pour appliquer le contenu de cette leçon avant votre prochaine session.`,
    ],
  };
  return contents[slotKey] || ["Le contenu de cette section sera bientôt disponible."];
}
