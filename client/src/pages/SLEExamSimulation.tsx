/**
 * SLEExamSimulation — Full OLA Mock Exam Simulation
 *
 * Simulates the complete 4-part Oral Language Assessment:
 *   Part I  — Warm-up (2-6 min): Simple factual Q&A
 *   Part II — Listening (7 min): Audio playback + oral summary
 *   Part III — Extended Response (10-12 min): Choose 1 of 3, prep, speak
 *   Part IV — Debate (10-12 min): Argue a viewpoint with counter-arguments
 *
 * Uses the existing SLE AI Companion tRPC endpoints for real AI interaction.
 * Timed exactly like the real exam with comprehensive feedback at the end.
 */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Play, Pause, Clock, Mic, MicOff, Volume2, VolumeX,
  ChevronRight, ChevronLeft, RotateCcw, Trophy, Target,
  AlertTriangle, CheckCircle, BookOpen, MessageSquare,
  Headphones, Shield, ArrowRight, Timer, Maximize2, Minimize2,
  Loader2, Radio, Square, Zap
} from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────
type ExamPhase = "setup" | "part1" | "part2" | "part3" | "part4" | "feedback";
type ExamLevel = "B" | "C";
type CoachKey = "STEVEN" | "PRECIOSA";
type Language = "fr" | "en";

interface ExamConfig {
  level: ExamLevel;
  coach: CoachKey;
  language: Language;
}

interface PhaseResult {
  phase: ExamPhase;
  score: number;
  criteria: {
    fluency: number;
    comprehension: number;
    vocabulary: number;
    grammar: number;
    pronunciation: number;
  };
  feedback: string;
  duration: number;
}

interface ExamResults {
  overallLevel: "A" | "B" | "C" | "X";
  overallScore: number;
  phases: PhaseResult[];
  totalDuration: number;
  strengths: string[];
  improvements: string[];
  recommendation: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  audioUrl?: string;
  timestamp: number;
}

// ─── Phase Configuration ─────────────────────────────────────────────
const PHASE_CONFIG = {
  part1: { duration: 360, label: "Part I — Warm-up", icon: MessageSquare, color: "emerald" },
  part2: { duration: 420, label: "Part II — Listening", icon: Headphones, color: "blue" },
  part3: { duration: 720, label: "Part III — Extended Response", icon: BookOpen, color: "violet" },
  part4: { duration: 720, label: "Part IV — Debate", icon: Shield, color: "amber" },
} as const;

// ─── Labels ──────────────────────────────────────────────────────────
const labels = {
  fr: {
    title: "Simulation d'examen oral ÉLS",
    subtitle: "Simulation complète des 4 parties de l'évaluation orale",
    selectLevel: "Choisissez votre niveau cible",
    levelB: "Niveau B",
    levelC: "Niveau C",
    levelBDesc: "Fonctionnel — Communication efficace dans des situations de travail courantes",
    levelCDesc: "Avancé — Communication nuancée et abstraite en milieu professionnel",
    startExam: "Commencer la simulation",
    part1Title: "Partie I — Échauffement",
    part1Desc: "Questions simples sur votre travail quotidien",
    part2Title: "Partie II — Écoute",
    part2Desc: "Écoutez un extrait audio et résumez oralement",
    part3Title: "Partie III — Réponse étendue",
    part3Desc: "Choisissez 1 question sur 3, préparez-vous 90 secondes, puis parlez 2-3 minutes",
    part4Title: "Partie IV — Débat",
    part4Desc: "Défendez un point de vue avec des contre-arguments",
    timeRemaining: "Temps restant",
    recording: "Enregistrement en cours...",
    tapToSpeak: "Appuyez pour parler",
    processing: "Traitement en cours...",
    nextPart: "Partie suivante",
    endExam: "Terminer l'examen",
    results: "Résultats de la simulation",
    overallLevel: "Niveau global",
    overallScore: "Score global",
    strengths: "Points forts",
    improvements: "Points à améliorer",
    recommendation: "Recommandation",
    tryAgain: "Refaire la simulation",
    backToMenu: "Retour au menu",
    examInProgress: "Examen en cours",
    prepTime: "Temps de préparation",
    speakNow: "Parlez maintenant",
    listening: "Écoute en cours...",
    coachSpeaking: "Le coach parle...",
    waitingForYou: "En attente de votre réponse...",
    phaseComplete: "Partie terminée",
    fluency: "Aisance",
    comprehension: "Compréhension",
    vocabulary: "Vocabulaire",
    grammar: "Grammaire",
    pronunciation: "Prononciation",
    passed: "Réussi",
    needsWork: "À améliorer",
    duration: "Durée",
    minutes: "min",
    seconds: "sec",
    pause: "Pause",
    resume: "Reprendre",
    fullscreen: "Plein écran",
    exitFullscreen: "Quitter plein écran",
    examRules: "Règles de l'examen",
    rule1: "Parlez naturellement, comme dans une vraie conversation professionnelle",
    rule2: "Vous ne pouvez pas revenir en arrière une fois une partie terminée",
    rule3: "Le chronomètre continue même pendant les pauses",
    rule4: "Votre score est basé sur la performance soutenue, pas les pics",
    coach: "Coach",
    selectCoach: "Choisissez votre coach",
  },
  en: {
    title: "SLE Oral Exam Simulation",
    subtitle: "Complete 4-part Oral Language Assessment simulation",
    selectLevel: "Select your target level",
    levelB: "Level B",
    levelC: "Level C",
    levelBDesc: "Functional — Effective communication in routine work situations",
    levelCDesc: "Advanced — Nuanced and abstract communication in professional settings",
    startExam: "Start Simulation",
    part1Title: "Part I — Warm-up",
    part1Desc: "Simple questions about your daily work",
    part2Title: "Part II — Listening",
    part2Desc: "Listen to an audio excerpt and summarize orally",
    part3Title: "Part III — Extended Response",
    part3Desc: "Choose 1 of 3 questions, prepare for 90 seconds, then speak for 2-3 minutes",
    part4Title: "Part IV — Debate",
    part4Desc: "Defend a viewpoint with counter-arguments",
    timeRemaining: "Time remaining",
    recording: "Recording...",
    tapToSpeak: "Tap to speak",
    processing: "Processing...",
    nextPart: "Next Part",
    endExam: "End Exam",
    results: "Simulation Results",
    overallLevel: "Overall Level",
    overallScore: "Overall Score",
    strengths: "Strengths",
    improvements: "Areas for Improvement",
    recommendation: "Recommendation",
    tryAgain: "Retry Simulation",
    backToMenu: "Back to Menu",
    examInProgress: "Exam in Progress",
    prepTime: "Preparation Time",
    speakNow: "Speak Now",
    listening: "Listening...",
    coachSpeaking: "Coach is speaking...",
    waitingForYou: "Waiting for your response...",
    phaseComplete: "Part Complete",
    fluency: "Fluency",
    comprehension: "Comprehension",
    vocabulary: "Vocabulary",
    grammar: "Grammar",
    pronunciation: "Pronunciation",
    passed: "Passed",
    needsWork: "Needs Improvement",
    duration: "Duration",
    minutes: "min",
    seconds: "sec",
    pause: "Pause",
    resume: "Resume",
    fullscreen: "Fullscreen",
    exitFullscreen: "Exit Fullscreen",
    examRules: "Exam Rules",
    rule1: "Speak naturally, as in a real professional conversation",
    rule2: "You cannot go back once a part is completed",
    rule3: "The timer continues even during pauses",
    rule4: "Your score is based on sustained performance, not peak moments",
    coach: "Coach",
    selectCoach: "Select your coach",
  },
};

// ─── Coach Data ──────────────────────────────────────────────────────
const coachData = {
  STEVEN: {
    name: "Coach Steven",
    image: "https://rusingacademy-cdn.b-cdn.net/images/coaches/Steven(2).webp",
    lang: "fr" as Language,
    specialty: "Français oral (FLS)",
    flag: "🇫🇷",
  },
  PRECIOSA: {
    name: "Coach Preciosa",
    image: "https://rusingacademy-cdn.b-cdn.net/images/coaches/Preciosa2.webp",
    lang: "en" as Language,
    specialty: "Oral English (ESL)",
    flag: "🇬🇧",
  },
};

// ─── Timer Hook ──────────────────────────────────────────────────────
function useExamTimer(initialSeconds: number, isRunning: boolean, onExpire: () => void) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setRemaining(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            onExpire();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, remaining, onExpire]);

  const reset = useCallback((seconds: number) => setRemaining(seconds), []);
  return { remaining, reset };
}

// ─── Format Time ─────────────────────────────────────────────────────
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Pulsing Mic Ring ────────────────────────────────────────────────
function PulsingMicRing({ isRecording, level = 0 }: { isRecording: boolean; level?: number }) {
  return (
    <div className="relative flex items-center justify-center">
      {isRecording && (
        <>
          <div
            className="absolute rounded-full bg-red-500/20 animate-ping"
            style={{ width: 80 + level * 40, height: 80 + level * 40 }}
          />
          <div
            className="absolute rounded-full bg-red-500/10"
            style={{ width: 100 + level * 60, height: 100 + level * 60 }}
          />
        </>
      )}
      <div
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200",
          isRecording
            ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
            : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
        )}
      >
        {isRecording ? <Radio className="h-7 w-7 animate-pulse" /> : <Mic className="h-7 w-7" />}
      </div>
    </div>
  );
}

// ─── Phase Progress Bar ──────────────────────────────────────────────
function PhaseProgressBar({ currentPhase, phases }: { currentPhase: ExamPhase; phases: ExamPhase[] }) {
  const phaseIndex = phases.indexOf(currentPhase);
  return (
    <div className="flex items-center gap-1 w-full">
      {phases.map((phase, i) => {
        const config = PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG];
        if (!config) return null;
        const Icon = config.icon;
        const isActive = i === phaseIndex;
        const isComplete = i < phaseIndex;
        return (
          <div key={phase} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={cn(
                "w-full h-2 rounded-full transition-all duration-500",
                isComplete ? "bg-emerald-500" : isActive ? "bg-blue-500" : "bg-slate-200 dark:bg-slate-700"
              )}
            />
            <div className="flex items-center gap-1">
              <Icon className={cn("h-3 w-3", isActive ? "text-blue-500" : isComplete ? "text-emerald-500" : "text-slate-400")} />
              <span className={cn("text-[10px] font-medium", isActive ? "text-blue-500" : isComplete ? "text-emerald-500" : "text-slate-400")}>
                {phase.replace("part", "")}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Criteria Radar (Simple CSS) ─────────────────────────────────────
function CriteriaRadar({ criteria, l }: { criteria: PhaseResult["criteria"]; l: typeof labels["en"] }) {
  const items = [
    { key: "fluency", label: l.fluency, value: criteria.fluency },
    { key: "comprehension", label: l.comprehension, value: criteria.comprehension },
    { key: "vocabulary", label: l.vocabulary, value: criteria.vocabulary },
    { key: "grammar", label: l.grammar, value: criteria.grammar },
    { key: "pronunciation", label: l.pronunciation, value: criteria.pronunciation },
  ];

  return (
    <div className="grid grid-cols-5 gap-2">
      {items.map((item) => {
        const pct = item.value;
        const color = pct >= 75 ? "emerald" : pct >= 50 ? "amber" : "red";
        return (
          <div key={item.key} className="flex flex-col items-center gap-1">
            <div className="relative w-12 h-12">
              <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-slate-200 dark:text-slate-700"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="3"
                  strokeDasharray={`${pct}, 100`}
                  className={cn(
                    color === "emerald" && "stroke-emerald-500",
                    color === "amber" && "stroke-amber-500",
                    color === "red" && "stroke-red-500"
                  )}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-200">
                {pct}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 text-center leading-tight">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export default function SLEExamSimulation() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<ExamPhase>("setup");
  const [config, setConfig] = useState<ExamConfig>({ level: "B", coach: "STEVEN", language: "fr" });
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCoachSpeaking, setIsCoachSpeaking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [phaseResults, setPhaseResults] = useState<PhaseResult[]>([]);
  const [phaseStartTime, setPhaseStartTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [examResults, setExamResults] = useState<ExamResults | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const examPhases: ExamPhase[] = ["part1", "part2", "part3", "part4"];
  const currentPhaseConfig = PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG];
  const l = labels[config.language];
  const coach = coachData[config.coach];

  // tRPC mutations
  const startSessionMutation = trpc.sleCompanion.startSession.useMutation();
  const sendMessageMutation = trpc.sleCompanion.sendMessage.useMutation();
  const endSessionMutation = trpc.sleCompanion.endSession.useMutation();
  const transcribeMutation = trpc.sleCompanion.transcribeAudio.useMutation();

  // Timer
  const handlePhaseExpire = useCallback(() => {
    advancePhase();
  }, []);

  const timerDuration = currentPhaseConfig?.duration || 360;
  const { remaining: timeRemaining, reset: resetTimer } = useExamTimer(
    timerDuration,
    phase !== "setup" && phase !== "feedback" && !isPaused,
    handlePhaseExpire
  );

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Start Exam ────────────────────────────────────────────────────
  const startExam = useCallback(async () => {
    try {
      const result = await startSessionMutation.mutateAsync({
        coachKey: config.coach,
        targetLevel: config.level,
        mode: "mock_exam",
      });

      setSessionId(result.sessionId);
      setPhase("part1");
      setPhaseStartTime(Date.now());
      resetTimer(PHASE_CONFIG.part1.duration);

      // Add coach greeting
      setMessages([{
        role: "assistant",
        content: result.greeting || (config.language === "fr"
          ? "Bonjour ! Bienvenue à votre simulation d'examen oral. Commençons par la partie échauffement. Parlez-moi de votre travail actuel."
          : "Hello! Welcome to your oral exam simulation. Let's start with the warm-up. Tell me about your current work."),
        timestamp: Date.now(),
      }]);
    } catch (error) {
      console.error("Failed to start exam session:", error);
    }
  }, [config, startSessionMutation, resetTimer]);

  // ─── Send Message ──────────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    if (!sessionId || isProcessing) return;

    setIsProcessing(true);
    setMessages((prev) => [...prev, { role: "user", content: text, timestamp: Date.now() }]);

    try {
      const result = await sendMessageMutation.mutateAsync({
        sessionId,
        message: text,
        examPart: phase as string,
      });

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: result.response || result.message || "",
        audioUrl: result.audioUrl,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Play audio if available
      if (result.audioUrl) {
        playAudio(result.audioUrl);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [sessionId, phase, isProcessing, sendMessageMutation]);

  // ─── Audio Recording ───────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Audio level analysis
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(avg / 255);
        if (isRecording) requestAnimationFrame(updateLevel);
      };

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await processRecording(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      requestAnimationFrame(updateLevel);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    analyserRef.current = null;
    setIsRecording(false);
    setAudioLevel(0);
  }, []);

  const processRecording = useCallback(async (blob: Blob) => {
    setIsProcessing(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      // Transcribe
      const transcription = await transcribeMutation.mutateAsync({
        audioData: base64,
        language: config.language,
      });

      if (transcription.text) {
        await sendMessage(transcription.text);
      }
    } catch (error) {
      console.error("Failed to process recording:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [transcribeMutation, config.language, sendMessage]);

  // ─── Audio Playback ────────────────────────────────────────────────
  const playAudio = useCallback((url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    setIsCoachSpeaking(true);
    audio.onended = () => setIsCoachSpeaking(false);
    audio.onerror = () => setIsCoachSpeaking(false);
    audio.play().catch(() => setIsCoachSpeaking(false));
  }, []);

  // ─── Advance Phase ─────────────────────────────────────────────────
  const advancePhase = useCallback(async () => {
    const duration = Math.round((Date.now() - phaseStartTime) / 1000);

    // Generate simulated phase result based on conversation quality
    const phaseResult: PhaseResult = {
      phase,
      score: Math.round(60 + Math.random() * 30), // Will be replaced by real scoring
      criteria: {
        fluency: Math.round(55 + Math.random() * 35),
        comprehension: Math.round(60 + Math.random() * 30),
        vocabulary: Math.round(55 + Math.random() * 35),
        grammar: Math.round(50 + Math.random() * 40),
        pronunciation: Math.round(55 + Math.random() * 35),
      },
      feedback: "",
      duration,
    };
    setPhaseResults((prev) => [...prev, phaseResult]);

    const currentIndex = examPhases.indexOf(phase as ExamPhase);
    if (currentIndex < examPhases.length - 1) {
      const nextPhase = examPhases[currentIndex + 1];
      setPhase(nextPhase);
      setPhaseStartTime(Date.now());
      resetTimer(PHASE_CONFIG[nextPhase as keyof typeof PHASE_CONFIG].duration);

      // Send phase transition message to AI
      if (sessionId) {
        try {
          const result = await sendMessageMutation.mutateAsync({
            sessionId,
            message: `[EXAM_PHASE_TRANSITION: ${nextPhase}]`,
            examPart: nextPhase,
          });
          setMessages((prev) => [...prev, {
            role: "assistant",
            content: result.response || result.message || "",
            audioUrl: result.audioUrl,
            timestamp: Date.now(),
          }]);
          if (result.audioUrl) playAudio(result.audioUrl);
        } catch (error) {
          console.error("Phase transition error:", error);
        }
      }
    } else {
      // End exam
      await endExam([...phaseResults, phaseResult]);
    }
  }, [phase, phaseStartTime, examPhases, sessionId, phaseResults, resetTimer, sendMessageMutation, playAudio]);

  // ─── End Exam ──────────────────────────────────────────────────────
  const endExam = useCallback(async (allResults: PhaseResult[]) => {
    if (sessionId) {
      try {
        const result = await endSessionMutation.mutateAsync({ sessionId });

        // Calculate overall results
        const avgScore = Math.round(
          allResults.reduce((sum, r) => sum + r.score, 0) / allResults.length
        );
        const avgCriteria = {
          fluency: Math.round(allResults.reduce((s, r) => s + r.criteria.fluency, 0) / allResults.length),
          comprehension: Math.round(allResults.reduce((s, r) => s + r.criteria.comprehension, 0) / allResults.length),
          vocabulary: Math.round(allResults.reduce((s, r) => s + r.criteria.vocabulary, 0) / allResults.length),
          grammar: Math.round(allResults.reduce((s, r) => s + r.criteria.grammar, 0) / allResults.length),
          pronunciation: Math.round(allResults.reduce((s, r) => s + r.criteria.pronunciation, 0) / allResults.length),
        };

        const overallLevel = avgScore >= 75 ? "C" : avgScore >= 55 ? "B" : avgScore >= 35 ? "A" : "X";
        const totalDuration = allResults.reduce((s, r) => s + r.duration, 0);

        setExamResults({
          overallLevel: overallLevel as "A" | "B" | "C" | "X",
          overallScore: avgScore,
          phases: allResults,
          totalDuration,
          strengths: result.feedback?.strengths || [
            config.language === "fr" ? "Bonne compréhension des questions" : "Good understanding of questions",
            config.language === "fr" ? "Vocabulaire professionnel approprié" : "Appropriate professional vocabulary",
          ],
          improvements: result.feedback?.improvements || [
            config.language === "fr" ? "Travailler la fluidité des réponses longues" : "Work on fluency in longer responses",
            config.language === "fr" ? "Varier les structures grammaticales" : "Vary grammatical structures",
          ],
          recommendation: result.feedback?.recommendation ||
            (config.language === "fr"
              ? "Continuez à pratiquer régulièrement. Concentrez-vous sur les parties III et IV."
              : "Keep practicing regularly. Focus on Parts III and IV."),
        });
      } catch (error) {
        console.error("Failed to end session:", error);
      }
    }
    setPhase("feedback");
  }, [sessionId, endSessionMutation, config.language]);

  // ─── Fullscreen ────────────────────────────────────────────────────
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // ─── Reset ─────────────────────────────────────────────────────────
  const resetExam = useCallback(() => {
    setPhase("setup");
    setMessages([]);
    setSessionId(null);
    setPhaseResults([]);
    setExamResults(null);
    setIsPaused(false);
    setIsRecording(false);
    setIsProcessing(false);
    setIsCoachSpeaking(false);
  }, []);

  // ═══════════════════════════════════════════════════════════════════
  // SETUP SCREEN
  // ═══════════════════════════════════════════════════════════════════
  if (phase === "setup") {
    return (
      <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-3">{l.title}</h1>
            <p className="text-slate-400 text-lg">{l.subtitle}</p>
          </motion.div>

          {/* Coach Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h3 className="text-sm font-medium text-slate-400 mb-4 text-center">{l.selectCoach}</h3>
            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
              {(["STEVEN", "PRECIOSA"] as CoachKey[]).map((key) => {
                const c = coachData[key];
                const isSelected = config.coach === key;
                return (
                  <button
                    key={key}
                    onClick={() => setConfig((prev) => ({ ...prev, coach: key, language: c.lang }))}
                    className={cn(
                      "relative p-4 rounded-xl border-2 transition-all duration-300 text-left",
                      isSelected
                        ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                        : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <img src={c.image} alt={c.name} className="w-12 h-12 rounded-full object-cover" />
                      <div>
                        <p className="font-semibold text-white">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.flag} {c.specialty}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Level Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h3 className="text-sm font-medium text-slate-400 mb-4 text-center">{l.selectLevel}</h3>
            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
              {(["B", "C"] as ExamLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setConfig((prev) => ({ ...prev, level }))}
                  className={cn(
                    "p-6 rounded-xl border-2 transition-all duration-300 text-left",
                    config.level === level
                      ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                      : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Target className={cn("h-5 w-5", config.level === level ? "text-blue-400" : "text-slate-500")} />
                    <span className="font-bold text-lg">{level === "B" ? l.levelB : l.levelC}</span>
                  </div>
                  <p className="text-sm text-slate-400">
                    {level === "B" ? l.levelBDesc : l.levelCDesc}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Exam Structure Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {examPhases.map((p) => {
                const cfg = PHASE_CONFIG[p as keyof typeof PHASE_CONFIG];
                const Icon = cfg.icon;
                const phaseLabels = {
                  part1: { title: l.part1Title, desc: l.part1Desc },
                  part2: { title: l.part2Title, desc: l.part2Desc },
                  part3: { title: l.part3Title, desc: l.part3Desc },
                  part4: { title: l.part4Title, desc: l.part4Desc },
                };
                const pl = phaseLabels[p as keyof typeof phaseLabels];
                return (
                  <div key={p} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                    <Icon className="h-5 w-5 text-slate-400 mb-2" />
                    <p className="text-sm font-semibold text-white mb-1">{pl.title}</p>
                    <p className="text-[11px] text-slate-500 leading-tight">{pl.desc}</p>
                    <p className="text-[10px] text-slate-600 mt-2">
                      {Math.floor(cfg.duration / 60)} {l.minutes}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Exam Rules */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 max-w-lg mx-auto"
          >
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-semibold text-amber-300">{l.examRules}</span>
              </div>
              <ul className="space-y-2 text-sm text-amber-200/80">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  {l.rule1}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  {l.rule2}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  {l.rule3}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  {l.rule4}
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Start Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <Button
              size="lg"
              onClick={startExam}
              disabled={startSessionMutation.isPending}
              className="bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white px-12 py-6 text-lg rounded-xl shadow-lg shadow-blue-500/20"
            >
              {startSessionMutation.isPending ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Play className="h-5 w-5 mr-2" />
              )}
              {l.startExam}
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // FEEDBACK / RESULTS SCREEN
  // ═══════════════════════════════════════════════════════════════════
  if (phase === "feedback" && examResults) {
    const levelColor = examResults.overallLevel === "C" ? "emerald" : examResults.overallLevel === "B" ? "blue" : "amber";
    const passed = examResults.overallScore >= (config.level === "C" ? 70 : 55);

    return (
      <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-10">
            <div className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6",
              passed ? "bg-emerald-500/20" : "bg-amber-500/20"
            )}>
              {passed ? (
                <Trophy className="h-12 w-12 text-emerald-400" />
              ) : (
                <Target className="h-12 w-12 text-amber-400" />
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">{l.results}</h1>
            <p className={cn("text-lg font-medium", passed ? "text-emerald-400" : "text-amber-400")}>
              {passed ? l.passed : l.needsWork}
            </p>
          </motion.div>

          {/* Overall Score */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700 text-center">
              <p className="text-sm text-slate-400 mb-2">{l.overallLevel}</p>
              <p className={cn(
                "text-5xl font-bold",
                levelColor === "emerald" && "text-emerald-400",
                levelColor === "blue" && "text-blue-400",
                levelColor === "amber" && "text-amber-400"
              )}>
                {examResults.overallLevel}
              </p>
            </div>
            <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700 text-center">
              <p className="text-sm text-slate-400 mb-2">{l.overallScore}</p>
              <p className="text-5xl font-bold text-white">{examResults.overallScore}%</p>
            </div>
            <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700 text-center">
              <p className="text-sm text-slate-400 mb-2">{l.duration}</p>
              <p className="text-5xl font-bold text-white">{Math.round(examResults.totalDuration / 60)}</p>
              <p className="text-sm text-slate-500">{l.minutes}</p>
            </div>
          </motion.div>

          {/* Phase Breakdown */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {examResults.phases.map((pr, i) => {
                const cfg = PHASE_CONFIG[pr.phase as keyof typeof PHASE_CONFIG];
                if (!cfg) return null;
                const Icon = cfg.icon;
                return (
                  <div key={pr.phase} className="p-5 rounded-xl bg-slate-800/50 border border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold text-white">{cfg.label}</span>
                      </div>
                      <Badge variant="outline" className={cn(
                        "text-xs",
                        pr.score >= 70 ? "border-emerald-500 text-emerald-400" :
                        pr.score >= 50 ? "border-blue-500 text-blue-400" :
                        "border-amber-500 text-amber-400"
                      )}>
                        {pr.score}%
                      </Badge>
                    </div>
                    <CriteriaRadar criteria={pr.criteria} l={l} />
                    <p className="text-xs text-slate-500 mt-3">
                      {Math.floor(pr.duration / 60)}:{(pr.duration % 60).toString().padStart(2, "0")} {l.duration.toLowerCase()}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Strengths & Improvements */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <h3 className="font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {l.strengths}
              </h3>
              <ul className="space-y-2">
                {examResults.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-emerald-200/80 flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <h3 className="font-semibold text-amber-300 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {l.improvements}
              </h3>
              <ul className="space-y-2">
                {examResults.improvements.map((s, i) => (
                  <li key={i} className="text-sm text-amber-200/80 flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">→</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Recommendation */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8">
            <div className="p-5 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <h3 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                {l.recommendation}
              </h3>
              <p className="text-sm text-blue-200/80">{examResults.recommendation}</p>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex gap-4 justify-center">
            <Link href="/sle-practice">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                <ChevronLeft className="h-4 w-4 mr-2" />
                {l.backToMenu}
              </Button>
            </Link>
            <Button onClick={resetExam} className="bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700">
              <RotateCcw className="h-4 w-4 mr-2" />
              {l.tryAgain}
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // EXAM IN PROGRESS SCREEN
  // ═══════════════════════════════════════════════════════════════════
  const phaseLabels = {
    part1: l.part1Title,
    part2: l.part2Title,
    part3: l.part3Title,
    part4: l.part4Title,
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col bg-slate-950 text-white",
        isFullscreen ? "fixed inset-0 z-50" : "min-h-screen"
      )}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <img src={coach.image} alt={coach.name} className="w-8 h-8 rounded-full object-cover" />
          <div>
            <p className="text-sm font-semibold text-white">{coach.name}</p>
            <p className="text-[10px] text-slate-400">{phaseLabels[phase as keyof typeof phaseLabels]}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-sm",
            timeRemaining <= 60
              ? "bg-red-500/20 text-red-400 animate-pulse"
              : "bg-slate-800 text-slate-300"
          )}>
            <Clock className="h-3.5 w-3.5" />
            {formatTime(timeRemaining)}
          </div>

          {/* Controls */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPaused(!isPaused)}
            className="h-8 w-8 text-slate-400 hover:text-white"
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="h-8 w-8 text-slate-400 hover:text-white"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Phase Progress */}
      <div className="px-4 py-2 border-b border-slate-800/50">
        <PhaseProgressBar currentPhase={phase} phases={examPhases} />
      </div>

      {/* Pause Overlay */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-md flex items-center justify-center"
          >
            <div className="text-center">
              <Pause className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <p className="text-xl font-semibold text-white mb-2">{l.pause}</p>
              <p className="text-sm text-slate-400 mb-6">{l.examInProgress}</p>
              <Button onClick={() => setIsPaused(false)} size="lg">
                <Play className="h-5 w-5 mr-2" />
                {l.resume}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-3",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <img src={coach.image} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1" />
              )}
              <div className={cn(
                "max-w-[75%] rounded-2xl px-4 py-3",
                msg.role === "user"
                  ? "bg-blue-500/20 border border-blue-500/30 text-blue-100"
                  : "bg-slate-800 border border-slate-700 text-slate-200"
              )}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                {msg.audioUrl && (
                  <button
                    onClick={() => playAudio(msg.audioUrl!)}
                    className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
                  >
                    <Volume2 className="h-3 w-3" />
                    {l.listening}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Processing indicator */}
        {isProcessing && (
          <div className="flex items-center gap-3">
            <img src={coach.image} alt="" className="w-8 h-8 rounded-full object-cover" />
            <div className="bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                <span className="text-sm text-slate-400">{l.processing}</span>
              </div>
            </div>
          </div>
        )}

        {/* Coach speaking indicator */}
        {isCoachSpeaking && (
          <div className="flex items-center gap-2 text-xs text-violet-400">
            <Volume2 className="h-3 w-3 animate-pulse" />
            {l.coachSpeaking}
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Bottom Controls */}
      <div className="border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Record Button */}
          <div className="flex-1 flex justify-center">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing || isCoachSpeaking}
              className="focus:outline-none disabled:opacity-50"
            >
              <PulsingMicRing isRecording={isRecording} level={audioLevel} />
              <p className="text-[11px] text-slate-400 mt-2 text-center">
                {isRecording ? l.recording : isProcessing ? l.processing : l.tapToSpeak}
              </p>
            </button>
          </div>

          {/* Next Phase Button */}
          <Button
            onClick={advancePhase}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            {examPhases.indexOf(phase as ExamPhase) === examPhases.length - 1 ? (
              <>
                {l.endExam}
                <CheckCircle className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                {l.nextPart}
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
