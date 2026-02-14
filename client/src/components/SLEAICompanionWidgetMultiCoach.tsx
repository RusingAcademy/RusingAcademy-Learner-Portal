import { useState, useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useVADRecorder } from "@/hooks/useVADRecorder";

// ─── Types ───────────────────────────────────────────────────────────
interface Coach {
  id: string;
  name: string;
  title: string;
  specialty: string;
  specialtyIcon: string;
  image: string;
  greeting: string;
  voiceKey: "steven" | "sue_anne" | "erika" | "preciosa";
  coachKey: "STEVEN" | "SUE_ANNE" | "ERIKA" | "PRECIOSA";
  lang: "fr" | "en";
}

interface Message {
  role: "user" | "assistant";
  content: string;
  audioUrl?: string;
  score?: number;
}

// ─── Coach Data ──────────────────────────────────────────────────────
const coaches: Coach[] = [
  {
    id: "steven",
    name: "Coach Steven",
    title: "Coach de français ÉLS",
    specialty: "Français oral (FLS)",
    specialtyIcon: "🇫🇷",
    image: "https://rusingacademy-cdn.b-cdn.net/images/coaches/Steven(2).webp",
    greeting: "Bonjour ! Je suis Steven, votre coach personnel pour l'examen oral.\n\nNous allons faire une simulation complète ensemble pour vous préparer au jour J.\n\nComment vous appelez-vous ?",
    voiceKey: "steven",
    coachKey: "STEVEN",
    lang: "fr",
  },
  {
    id: "preciosa",
    name: "Coach Preciosa",
    title: "English SLE Coach",
    specialty: "Oral English (ESL)",
    specialtyIcon: "🇬🇧",
    image: "https://rusingacademy-cdn.b-cdn.net/images/coaches/Preciosa2.webp",
    greeting: "Hi there! I'm Preciosa, your personal coach for the oral exam.\n\nWe're going to do a full mock exam together to get you ready for the big day.\n\nWhat's your name?",
    voiceKey: "preciosa",
    coachKey: "PRECIOSA",
    lang: "en",
  }
];

// ─── Waveform Rings ─────────────────────────────────────────────────
// Concentric organic rings that pulse around the coach photo
const WaveformRings = ({ level, isCoachSpeaking, isUserSpeaking, isListening }: {
  level: number;
  isCoachSpeaking: boolean;
  isUserSpeaking: boolean;
  isListening: boolean;
}) => {
  const isActive = isCoachSpeaking || isUserSpeaking;
  const color = isCoachSpeaking ? "139,92,246" : isUserSpeaking ? "6,182,212" : "16,185,129";
  const intensity = isCoachSpeaking ? 0.8 : isUserSpeaking ? Math.max(level * 4, 0.3) : 0.12;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
      {/* Ring 1 — closest, strongest */}
      <div
        className="absolute rounded-full"
        style={{
          width: 'min(72vw, 340px)',
          height: 'min(72vw, 340px)',
          border: `2.5px solid rgba(${color}, ${isActive ? 0.45 : isListening ? 0.1 : 0.05})`,
          background: `radial-gradient(circle, rgba(${color}, ${isActive ? 0.1 : 0.02}) 0%, transparent 70%)`,
          transform: `scale(${1 + intensity * 0.1})`,
          transition: isActive ? 'transform 0.08s ease-out, border-color 0.2s' : 'all 0.6s ease-out',
        }}
      />
      {/* Ring 2 — middle */}
      <div
        className="absolute rounded-full"
        style={{
          width: 'min(88vw, 420px)',
          height: 'min(88vw, 420px)',
          border: `2px solid rgba(${color}, ${isActive ? 0.3 : isListening ? 0.06 : 0.03})`,
          background: `radial-gradient(circle, rgba(${color}, ${isActive ? 0.06 : 0.01}) 0%, transparent 70%)`,
          transform: `scale(${1 + intensity * 0.14})`,
          transition: isActive ? 'transform 0.12s ease-out, border-color 0.2s' : 'all 0.7s ease-out',
        }}
      />
      {/* Ring 3 — outer */}
      <div
        className="absolute rounded-full"
        style={{
          width: 'min(100vw, 500px)',
          height: 'min(100vw, 500px)',
          border: `1.5px solid rgba(${color}, ${isActive ? 0.18 : 0.02})`,
          background: `radial-gradient(circle, rgba(${color}, ${isActive ? 0.03 : 0}) 0%, transparent 70%)`,
          transform: `scale(${1 + intensity * 0.18})`,
          transition: isActive ? 'transform 0.16s ease-out, border-color 0.2s' : 'all 0.8s ease-out',
        }}
      />
      {/* Ring 4 — outermost glow (only when active) */}
      {isActive && (
        <div
          className="absolute rounded-full"
          style={{
            width: 'min(110vw, 580px)',
            height: 'min(110vw, 580px)',
            border: `1px solid rgba(${color}, 0.08)`,
            transform: `scale(${1 + intensity * 0.22})`,
            transition: 'transform 0.2s ease-out',
          }}
        />
      )}
    </div>
  );
};

// ─── Audio Level Bars ────────────────────────────────────────────────
// Horizontal bar visualizer below the status text
const AudioBars = ({ level, isActive, color }: { level: number; isActive: boolean; color: string }) => (
  <div className="flex items-center justify-center gap-[3px] h-6 mt-3">
    {Array.from({ length: 16 }).map((_, i) => {
      const barLevel = isActive
        ? Math.max(3, level * 24 * (0.5 + Math.sin(Date.now() / 70 + i * 0.7) * 0.5))
        : 3;
      return (
        <div
          key={i}
          className="rounded-full"
          style={{
            width: '3px',
            height: `${barLevel}px`,
            background: isActive
              ? `linear-gradient(to top, ${color}, ${color}88)`
              : 'rgba(255,255,255,0.08)',
            transition: isActive ? 'height 0.04s ease-out' : 'all 0.5s ease-out',
          }}
        />
      );
    })}
  </div>
);

// ─── Subtitle Display ────────────────────────────────────────────────
// Shows the last message as a subtitle at the bottom — video-call style
const SubtitleOverlay = ({ messages, coachName, lang }: { messages: Message[]; coachName: string; lang: "fr" | "en" }) => {
  const lastMsg = messages[messages.length - 1];
  if (!lastMsg) return null;

  return (
    <div className="absolute bottom-20 left-4 right-4 z-20 flex justify-center pointer-events-none sm:bottom-24">
      <div
        className="max-w-md px-5 py-3 rounded-2xl text-center"
        style={{
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] mb-1.5"
          style={{ color: lastMsg.role === "user" ? '#06B6D4' : '#A78BFA' }}>
          {lastMsg.role === "user" ? (lang === "fr" ? "Vous" : "You") : coachName}
        </p>
        <p className="text-white text-sm sm:text-base leading-relaxed font-medium" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
          {lastMsg.content.length > 120 ? lastMsg.content.slice(-120) + "..." : lastMsg.content}
        </p>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────
export default function SLEAICompanionWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<"coaches" | "session">("coaches");
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [currentCoachIndex, setCurrentCoachIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessingMessage, setIsProcessingMessage] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sessionIdRef = useRef<number | null>(null);
  const selectedCoachRef = useRef<Coach | null>(null);

  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);
  useEffect(() => { selectedCoachRef.current = selectedCoach; }, [selectedCoach]);

  // ─── VAD Recorder ──────────────────────────────────────────────────
  const {
    state: vadState,
    isListening,
    isSpeaking: userSpeaking,
    audioLevel,
    openMic,
    closeMic,
    pauseMic,
    resumeMic,
  } = useVADRecorder({
    speechThreshold: 0.01,
    silenceTimeout: 700,
    minSpeechDuration: 300,
    maxDuration: 60,
    onUtterance: (blob) => handleUtterance(blob),
    onError: (err) => toast.error(`Microphone : ${err.message}`),
  });

  // ─── tRPC Mutations ────────────────────────────────────────────────
  const startSessionMutation = trpc.sleCompanion.startSession.useMutation();
  const sendMessageMutation = trpc.sleCompanion.sendMessage.useMutation();
  const uploadAndTranscribeMutation = trpc.sleCompanion.uploadAndTranscribeAudio.useMutation();
  const endSessionMutation = trpc.sleCompanion.endSession.useMutation();

  const generateCoachAudioMutation = trpc.audio.generateCoachAudio.useMutation({
    onSuccess: (data) => {
      if (data.audioUrl && audioRef.current) {
        audioRef.current.volume = 1.0;
        audioRef.current.src = data.audioUrl;
        audioRef.current.play().catch(() => {
          toast.error("Erreur de lecture audio");
        });
        setIsSpeaking(true);
      }
      setIsGeneratingAudio(false);
    },
    onError: (error) => {
      console.error("TTS Error:", error);
      setIsGeneratingAudio(false);
      setIsSpeaking(false);
      resumeMic();
    },
  });

  // ─── Floating button coach rotation ────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      const interval = setInterval(() => {
        setCurrentCoachIndex((prev) => (prev + 1) % coaches.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // ─── Custom open event ─────────────────────────────────────────────
  useEffect(() => {
    const handleOpenEvent = () => setIsOpen(true);
    window.addEventListener("openSLEAICompanion", handleOpenEvent);
    return () => window.removeEventListener("openSLEAICompanion", handleOpenEvent);
  }, []);

  // ─── Pause mic when coach is speaking ──────────────────────────────
  useEffect(() => {
    if (isSpeaking || isGeneratingAudio) {
      pauseMic();
    }
  }, [isSpeaking, isGeneratingAudio, pauseMic]);

  // ─── Audio ended → resume mic ─────────────────────────────────────
  const handleAudioEnded = useCallback(() => {
    setIsSpeaking(false);
    if (!isProcessingMessage) {
      resumeMic();
    }
  }, [isProcessingMessage, resumeMic]);

  // ─── Coach Selection ───────────────────────────────────────────────
  const handleCoachSelect = useCallback(async (coach: Coach) => {
    setSelectedCoach(coach);
    setCurrentScreen("session");
    setMessages([]);
    setIsStartingSession(true);

    try {
      const session = await startSessionMutation.mutateAsync({
        coachKey: coach.coachKey,
        level: "B" as const,
        skill: "oral_expression" as const,
        topic: "Full Mock Exam (OLA)",
      });

      setSessionId(session.sessionId);

      // Use the structured greeting — always the same mandatory structure
      const welcomeText = coach.greeting;
      setMessages([{ role: "assistant", content: welcomeText }]);

      // Play greeting immediately with max volume
      setIsGeneratingAudio(true);
      setIsSpeaking(true);
      generateCoachAudioMutation.mutate({
        text: welcomeText,
        coachName: coach.voiceKey,
        speed: 1.0,
      });

      // Open mic — auto-resumes after greeting ends
      await openMic();
    } catch (error) {
      console.error("Failed to start session:", error);
      toast.error("Erreur d'initialisation de la session");
      setMessages([{ role: "assistant", content: coach.greeting }]);
    } finally {
      setIsStartingSession(false);
    }
  }, [startSessionMutation, generateCoachAudioMutation, openMic]);

  // ─── Handle User Utterance (auto-detected by VAD) ─────────────────
  const handleUtterance = useCallback(async (blob: Blob) => {
    const currentSessionId = sessionIdRef.current;
    if (!currentSessionId) { resumeMic(); return; }

    setIsProcessingMessage(true);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
      });
      reader.readAsDataURL(blob);
      const audioBase64 = await base64Promise;

      const coach = selectedCoachRef.current;
      const transcriptionResult = await uploadAndTranscribeMutation.mutateAsync({
        audioBase64,
        mimeType: blob.type || "audio/webm",
        sessionId: currentSessionId,
        language: coach?.lang || "fr",
      });

      const transcribedText = transcriptionResult.transcription || "";

      if (!transcribedText.trim()) {
        setIsProcessingMessage(false);
        resumeMic();
        return;
      }

      setMessages(prev => [...prev, { role: "user", content: transcribedText }]);

      const coachResponse = await sendMessageMutation.mutateAsync({
        sessionId: currentSessionId,
        message: transcribedText,
      });

      const responseText = coachResponse.coachResponse || "";
      setMessages(prev => [...prev, {
        role: "assistant",
        content: responseText,
        score: coachResponse.evaluation?.score,
      }]);
      setIsProcessingMessage(false);

      if (responseText) {
        // Use ref to guarantee correct voice — prevents race condition where
        // selectedCoach state could be stale during async callback chain
        const coach = selectedCoachRef.current;
        const voiceKey = coach?.voiceKey || "steven";
        setIsGeneratingAudio(true);
        generateCoachAudioMutation.mutate({
          text: responseText,
          coachName: voiceKey,
          speed: 1.0,
        });
      } else {
        resumeMic();
      }
    } catch (error: any) {
      console.error("Error processing utterance:", error);
      const errMsg = error?.message || error?.data?.message || "Unknown error";
      const fr = selectedCoachRef.current?.lang === "fr";
      toast.error(fr ? `Erreur : ${errMsg}` : `Error: ${errMsg}`);
      setIsProcessingMessage(false);
      resumeMic();
    }
  }, [uploadAndTranscribeMutation, sendMessageMutation, generateCoachAudioMutation, resumeMic]);

  // ─── Back / Close ──────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    closeMic();
    setIsSpeaking(false);
    setIsGeneratingAudio(false);
    if (sessionId) { endSessionMutation.mutate({ sessionId }); setSessionId(null); }
    setCurrentScreen("coaches");
    setSelectedCoach(null);
    setMessages([]);
  }, [sessionId, endSessionMutation, closeMic]);

  const handleClose = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    closeMic();
    if (sessionId) { endSessionMutation.mutate({ sessionId }); }
    setIsOpen(false);
    setCurrentScreen("coaches");
    setSelectedCoach(null);
    setSessionId(null);
    setIsSpeaking(false);
    setIsGeneratingAudio(false);
    setIsProcessingMessage(false);
    setMessages([]);
  }, [sessionId, endSessionMutation, closeMic]);

  // ─── Session visual state ─────────────────────────────────────────
  const getSessionState = () => {
    if (isStartingSession) return "starting";
    if (isSpeaking) return "coach-speaking";
    if (isGeneratingAudio || isProcessingMessage) return "thinking";
    if (userSpeaking) return "user-speaking";
    if (isListening) return "listening";
    return "idle";
  };
  const sessionState = getSessionState();

  // ─── Status label — short, human, warm ─────────────────────────────
  const getStatusLabel = () => {
    if (!selectedCoach) return "";
    const fr = selectedCoach.lang === "fr";
    switch (sessionState) {
      case "starting": return fr ? "Préparation..." : "Getting ready...";
      case "coach-speaking": return fr ? `${selectedCoach.name} parle` : `${selectedCoach.name} is speaking`;
      case "thinking": return fr ? "Un instant..." : "One moment...";
      case "user-speaking": return fr ? "Je vous écoute" : "Listening to you";
      case "listening": return fr ? "À vous de parler" : "Your turn to speak";
      default: return fr ? "En attente" : "Standing by";
    }
  };

  const getStatusColor = () => {
    switch (sessionState) {
      case "coach-speaking": return "#C4B5FD";
      case "thinking": return "#67E8F9";
      case "user-speaking": return "#22D3EE";
      case "listening": return "#34D399";
      default: return "#9CA3AF";
    }
  };

  // ─── Photo size — large on desktop, responsive on mobile ──────────
  const photoSize = "min(56vw, 240px)";

  return (
    <>
      {/* Hidden audio element — max volume */}
      <audio ref={audioRef} onEnded={handleAudioEnded} className="hidden" />

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* FLOATING BUTTON — GOLDEN REFERENCE: DO NOT MODIFY              */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex flex-col items-center transition-all duration-500 ${
          isOpen ? "opacity-0 pointer-events-none scale-75" : "opacity-100 scale-100"
        }`}
      >
        <button onClick={() => setIsOpen(true)} className="relative group" aria-label="Open SLE AI Companion">
          <div className="absolute -inset-2 rounded-full opacity-60 blur-md" style={{ background: 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 50%, #06B6D4 100%)', animation: 'rotateGlow 3s linear infinite' }} />
          <div className="absolute -inset-1 rounded-full" style={{ background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)', animation: 'breathe 2s ease-in-out infinite' }} />
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 shadow-2xl" style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
            {coaches.map((coach, index) => (
              <img loading="lazy" key={coach.id} src={coach.image} alt={coach.name}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentCoachIndex ? "opacity-100" : "opacity-0"}`} />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="absolute -bottom-1 -right-1">
            <span className="absolute inline-flex h-4 w-4 rounded-full opacity-75" style={{ backgroundColor: '#10B981', animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
            <span className="relative inline-flex rounded-full h-4 w-4" style={{ backgroundColor: '#10B981', border: '3px solid #1e1b4b', boxShadow: '0 0 10px rgba(16, 185, 129, 0.6)' }} />
          </div>
        </button>
        <span className="mt-2 text-sm font-semibold tracking-wide" style={{ background: 'linear-gradient(90deg, #06B6D4, #8B5CF6, #06B6D4)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}>
          SLE AI Companion
        </span>
      </div>

      {/* ─── Keyframes ─────────────────────────────────────────────── */}
      <style>{`
        @keyframes breathe { 0%, 100% { transform: scale(1); opacity: 0.7; } 50% { transform: scale(1.1); opacity: 1; } }
        @keyframes rotateGlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
        @keyframes fadeInScale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 40px rgba(139,92,246,0.3); } 50% { box-shadow: 0 0 80px rgba(139,92,246,0.6), 0 0 120px rgba(6,182,212,0.2); } }
        @keyframes subtlePulse { 0%, 100% { opacity: 0.8; } 50% { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* EXPANDED MODAL — FULL SCREEN VIDEO-CALL AESTHETIC              */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Full-screen dark backdrop */}
          <div className="absolute inset-0 bg-black/92 backdrop-blur-2xl" onClick={handleClose} />

          {/* Modal — full viewport on mobile, constrained on desktop */}
          <div
            className="relative w-full h-full sm:w-[95vw] sm:max-w-xl sm:h-[94vh] sm:max-h-[860px] sm:rounded-3xl overflow-hidden flex flex-col"
            style={{
              background: 'linear-gradient(160deg, #06060e 0%, #0a0a18 30%, #0e0e24 60%, #081420 100%)',
              boxShadow: '0 0 100px rgba(139,92,246,0.15), 0 0 200px rgba(6,182,212,0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
              animation: 'fadeInScale 0.3s ease-out',
              border: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            {/* ═══ HEADER BAR — minimal, clean ═══ */}
            <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.015)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="flex items-center gap-3">
                {currentScreen === "session" && (
                  <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-white/8 transition-colors" aria-label="Back">
                    <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <div>
                  <h2 className="text-sm font-bold text-white/90 tracking-wide">
                    {currentScreen === "coaches" ? "Examen oral ÉLS" : selectedCoach?.name}
                  </h2>
                  {currentScreen === "session" && selectedCoach && (
                    <p className="text-[11px] font-medium" style={{ color: '#67E8F9' }}>
                      {selectedCoach.specialtyIcon} {selectedCoach.specialty}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {currentScreen === "session" && (
                  <button
                    onClick={() => setShowTranscript(!showTranscript)}
                    className={`p-2 rounded-full transition-all ${showTranscript ? "bg-cyan-500/12 text-cyan-400" : "text-white/30 hover:bg-white/5 hover:text-white/50"}`}
                    title={selectedCoach?.lang === "fr" ? "Afficher la transcription" : "Toggle transcript"}
                    aria-label={selectedCoach?.lang === "fr" ? "Afficher la transcription" : "Toggle transcript"}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                )}
                <button onClick={handleClose} className="p-2 rounded-full hover:bg-white/8 transition-colors" aria-label="Close">
                  <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ═══ CONTENT ═══ */}
            <div className="flex-1 overflow-hidden flex flex-col">

              {/* ═══ COACH SELECTION SCREEN ═══ */}
              {currentScreen === "coaches" && (
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 sm:px-10 space-y-10">
                  {/* Title — large, clear, high contrast */}
                  <div className="text-center space-y-3">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      Choisissez votre coach
                    </h3>
                    <p className="text-white/50 text-sm sm:text-base max-w-xs mx-auto leading-relaxed">
                      Appuyez pour commencer votre simulation d'examen oral.
                    </p>
                  </div>

                  {/* Coach cards — large, tappable, high contrast */}
                  <div className="w-full max-w-sm space-y-4">
                    {coaches.map((coach) => (
                      <button
                        key={coach.id}
                        onClick={() => handleCoachSelect(coach)}
                        disabled={isStartingSession}
                        className="w-full group flex items-center gap-5 p-5 sm:p-6 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-wait active:scale-[0.97]"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          backdropFilter: 'blur(20px)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                          e.currentTarget.style.borderColor = 'rgba(139,92,246,0.35)';
                          e.currentTarget.style.boxShadow = '0 8px 48px rgba(139,92,246,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {/* Coach photo — large, rounded */}
                        <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex-shrink-0"
                          style={{
                            width: '72px', height: '72px',
                            border: '2px solid rgba(139,92,246,0.25)',
                            boxShadow: '0 4px 20px rgba(139,92,246,0.12)',
                          }}>
                          <img loading="lazy" src={coach.image} alt={coach.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/25 to-transparent" />
                        </div>
                        {/* Coach info — high contrast text */}
                        <div className="flex-1 text-left">
                          <h3 className="text-white font-bold text-lg sm:text-xl leading-tight">{coach.name}</h3>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-lg">{coach.specialtyIcon}</span>
                            <span className="text-sm font-medium" style={{ color: '#67E8F9' }}>{coach.specialty}</span>
                          </div>
                        </div>
                        {/* Start indicator */}
                        <div className="flex-shrink-0">
                          <svg className="w-6 h-6 text-white/30 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>

                  {isStartingSession && (
                    <div className="flex items-center gap-3 text-sm" style={{ color: '#67E8F9' }}>
                      <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      <span className="font-medium">Connexion en cours...</span>
                    </div>
                  )}
                </div>
              )}

              {/* ═══ SESSION SCREEN — IMMERSIVE VIDEO-CALL ═══ */}
              {currentScreen === "session" && selectedCoach && (
                <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">

                  {/* ── Waveform Rings (behind photo) ── */}
                  <WaveformRings
                    level={audioLevel}
                    isCoachSpeaking={isSpeaking}
                    isUserSpeaking={userSpeaking}
                    isListening={isListening}
                  />

                  {/* ── Coach Photo — LARGE, centered, immersive ── */}
                  <div className="relative z-10 flex flex-col items-center" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
                    <div
                      className="relative overflow-hidden flex-shrink-0"
                      style={{
                        width: photoSize,
                        height: photoSize,
                        borderRadius: '50%',
                        border: isSpeaking
                          ? '5px solid rgba(139,92,246,0.7)'
                          : userSpeaking
                          ? '5px solid rgba(6,182,212,0.7)'
                          : isListening
                          ? '5px solid rgba(16,185,129,0.35)'
                          : '5px solid rgba(255,255,255,0.08)',
                        animation: isSpeaking ? 'pulseGlow 1.5s ease-in-out infinite' : 'none',
                        boxShadow: isSpeaking
                          ? '0 0 60px rgba(139,92,246,0.4), 0 0 120px rgba(139,92,246,0.15)'
                          : userSpeaking
                          ? '0 0 60px rgba(6,182,212,0.4), 0 0 120px rgba(6,182,212,0.15)'
                          : '0 12px 48px rgba(0,0,0,0.6)',
                        transition: 'border-color 0.3s, box-shadow 0.3s',
                      }}
                    >
                      <img
                        loading="lazy"
                        src={selectedCoach.image}
                        alt={selectedCoach.name}
                        className="w-full h-full object-cover"
                        style={{ transform: 'scale(1.08)' }}
                      />
                      {/* Subtle gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
                    </div>

                    {/* ── Coach Name — large, bold, high contrast ── */}
                    <h3 className="mt-6 sm:mt-8 text-xl sm:text-2xl font-extrabold text-white tracking-wide">
                      {selectedCoach.name}
                    </h3>

                    {/* ── Status Label — clear, readable ── */}
                    <p
                      className="mt-2 sm:mt-3 text-base sm:text-lg font-semibold tracking-wide flex items-center gap-2.5"
                      style={{
                        color: getStatusColor(),
                        animation: (sessionState === "coach-speaking" || sessionState === "user-speaking")
                          ? 'subtlePulse 1.5s ease-in-out infinite' : 'none',
                      }}
                    >
                      {(sessionState === "starting" || sessionState === "thinking") && (
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      )}
                      {sessionState === "listening" && (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" style={{ animation: 'subtlePulse 1s ease-in-out infinite' }} />
                      )}
                      {getStatusLabel()}
                    </p>

                    {/* ── Audio Level Bars — always visible ── */}
                    <AudioBars
                      level={audioLevel}
                      isActive={isSpeaking || userSpeaking}
                      color={isSpeaking ? '#C4B5FD' : '#22D3EE'}
                    />
                  </div>

                  {/* ── Subtitle overlay (last message) ── */}
                  {showTranscript && messages.length > 0 && (
                    <SubtitleOverlay messages={messages} coachName={selectedCoach.name} lang={selectedCoach.lang} />
                  )}

                  {/* ── Mic status pill at bottom ── */}
                  <div className="absolute bottom-5 sm:bottom-6 z-10">
                    <div
                      className="flex items-center gap-3 px-5 py-2.5 rounded-full"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid rgba(${userSpeaking ? '6,182,212' : isListening ? '16,185,129' : '255,255,255'}, ${userSpeaking || isListening ? 0.25 : 0.04})`,
                        backdropFilter: 'blur(12px)',
                      }}
                    >
                      {/* Mic icon */}
                      <div className="relative">
                        {userSpeaking && <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-20" />}
                        <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          style={{ color: vadState === "closed" ? '#EF4444' : userSpeaking ? '#22D3EE' : isListening ? '#34D399' : '#6B7280' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </div>
                      {/* Mini level bars */}
                      <div className="flex items-end gap-[2px] h-3.5">
                        {Array.from({ length: 7 }).map((_, i) => (
                          <div key={i} className="w-[2.5px] rounded-full" style={{
                            height: userSpeaking ? `${Math.max(3, audioLevel * 14 * (1 + Math.sin(Date.now() / 80 + i) * 0.5))}px` : '3px',
                            background: userSpeaking ? '#22D3EE' : isListening ? '#34D399' : 'rgba(255,255,255,0.08)',
                            transition: userSpeaking ? 'none' : 'all 0.4s',
                          }} />
                        ))}
                      </div>
                      {/* Status text */}
                      <span className="text-xs font-semibold tracking-wide" style={{
                        color: vadState === "closed" ? '#EF4444' : userSpeaking ? '#22D3EE' : isListening ? '#34D399' : '#6B7280',
                      }}>
                        {vadState === "closed"
                          ? (selectedCoach?.lang === "fr" ? "Micro fermé" : "Mic off")
                          : userSpeaking
                          ? (selectedCoach?.lang === "fr" ? "Vous parlez" : "Speaking")
                          : isListening
                          ? (selectedCoach?.lang === "fr" ? "Écoute" : "Listening")
                          : (selectedCoach?.lang === "fr" ? "En attente" : "Standby")
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer gradient line */}
            <div className="h-1 flex-shrink-0" style={{ background: 'linear-gradient(90deg, #06B6D4 0%, #8B5CF6 50%, #06B6D4 100%)' }} />
          </div>
        </div>
      )}
    </>
  );
}
