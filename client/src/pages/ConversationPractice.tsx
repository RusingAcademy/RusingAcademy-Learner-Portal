import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Mic, MicOff, Send, Play, Pause, Volume2, MessageSquare,
  User, Bot, Clock, Target, Star, ArrowLeft, Loader2,
  BookOpen, Headphones, PenTool, ChevronRight, Sparkles,
  RefreshCw, Award, BarChart3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EcosystemFooter } from "@/components/EcosystemFooter";
import EcosystemHeaderGold from "@/components/EcosystemHeaderGold";
import { Streamdown } from "streamdown";
import { useAppLayout } from "@/contexts/AppLayoutContext";

type SessionState = "setup" | "active" | "ended";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  score?: number;
  corrections?: string | null;
  suggestions?: string | null;
  timestamp: Date;
}

export default function ConversationPractice() {
  const { isInsideAppLayout } = useAppLayout();
  const { language } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const isEn = language === "en";

  // Session setup state
  const [sessionState, setSessionState] = useState<SessionState>("setup");
  const [selectedCoach, setSelectedCoach] = useState("STEVEN");
  const [selectedLevel, setSelectedLevel] = useState("B");
  const [selectedSkill, setSelectedSkill] = useState("oral_expression");
  const [topic, setTopic] = useState("");

  // Active session state
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [lastEvaluation, setLastEvaluation] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Fetch coaches
  const { data: coaches } = trpc.sleCompanion.getCoaches.useQuery();

  // Start session mutation
  const startSessionMutation = trpc.sleCompanion.startSession.useMutation({
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      setMessages([{
        id: 0,
        role: "assistant",
        content: data.welcomeMessage,
        timestamp: new Date(),
      }]);
      setSessionState("active");
      toast.success(isEn ? "Session started!" : "Session démarrée!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Send message mutation
  const sendMessageMutation = trpc.sleCompanion.sendMessage.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length,
          role: "assistant" as const,
          content: data.coachResponse,
          score: data.evaluation.score,
          corrections: Array.isArray(data.evaluation.corrections)
            ? data.evaluation.corrections.join("; ")
            : data.evaluation.corrections,
          suggestions: Array.isArray(data.evaluation.suggestions)
            ? data.evaluation.suggestions.join("; ")
            : data.evaluation.suggestions,
          timestamp: new Date(),
        },
      ]);
      setLastEvaluation(data.evaluation);
      setIsSending(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setIsSending(false);
    },
  });

  // Transcribe audio mutation
  const transcribeMutation = trpc.sleCompanion.uploadAndTranscribeAudio.useMutation({
    onSuccess: (data) => {
      setInputText(data.transcription);
      setIsTranscribing(false);
      toast.success(isEn ? "Audio transcribed!" : "Audio transcrit!");
    },
    onError: (error) => {
      toast.error(error.message);
      setIsTranscribing(false);
    },
  });

  // End session mutation
  const endSessionMutation = trpc.sleCompanion.endSession.useMutation({
    onSuccess: () => {
      setSessionState("ended");
      toast.success(isEn ? "Session ended. Great practice!" : "Session terminée. Excellent entraînement!");
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStartSession = () => {
    if (!isAuthenticated) {
      toast.info(isEn ? "Please log in to start a practice session" : "Veuillez vous connecter pour démarrer une session");
      window.location.href = getLoginUrl();
      return;
    }
    startSessionMutation.mutate({
      coachKey: selectedCoach as "STEVEN" | "PRECIOSA",
      level: selectedLevel as "A" | "B" | "C",
      skill: selectedSkill as "oral_expression" | "oral_comprehension" | "written_expression" | "written_comprehension",
      topic: topic || undefined,
    });
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !sessionId || isSending) return;
    const userMessage: Message = {
      id: messages.length,
      role: "user",
      content: inputText.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsSending(true);
    sendMessageMutation.mutate({
      sessionId,
      message: inputText.trim(),
    });
    setInputText("");
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());

        // Convert to base64 and transcribe
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          if (sessionId) {
            setIsTranscribing(true);
            transcribeMutation.mutate({
              audioBase64: base64,
              mimeType: "audio/webm",
              sessionId,
              language: "fr",
            });
          }
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info(isEn ? "Recording... Speak now" : "Enregistrement... Parlez maintenant");
    } catch (error) {
      toast.error(isEn ? "Microphone access denied" : "Accès au microphone refusé");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleEndSession = () => {
    if (sessionId) {
      endSessionMutation.mutate({ sessionId });
    }
  };

  const handleNewSession = () => {
    setSessionState("setup");
    setSessionId(null);
    setMessages([]);
    setInputText("");
    setLastEvaluation(null);
  };

  const coachOptions = [
    { key: "STEVEN", name: "Coach Steven", specialty: isEn ? "French SLE Coach" : "Coach SLE français", emoji: "🇫🇷" },
    { key: "PRECIOSA", name: "Coach Preciosa", specialty: isEn ? "English SLE Coach" : "Coach SLE anglais", emoji: "🇬🇧" },
  ];

  const skillOptions = [
    { value: "oral_expression", label: isEn ? "Oral Expression" : "Expression Orale", icon: Mic },
    { value: "oral_comprehension", label: isEn ? "Oral Comprehension" : "Compréhension Orale", icon: Headphones },
    { value: "written_expression", label: isEn ? "Written Expression" : "Expression Écrite", icon: PenTool },
    { value: "written_comprehension", label: isEn ? "Reading Comprehension" : "Compréhension Écrite", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F3]">
      {!isInsideAppLayout && <EcosystemHeaderGold />}
      <main className="flex-1">
        {/* Setup Screen */}
        {sessionState === "setup" && (
          <>
            {/* Hero */}
            <section className="relative overflow-hidden py-12 lg:py-20 bg-gradient-to-br from-[#0F3D3E] via-[#145A5B] to-[#0F3D3E]">
              <div className="container relative z-10 text-center">
                <Badge className="bg-[#C65A1E]/20 text-[#C65A1E] border-[#C65A1E]/30 mb-4">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {isEn ? "AI-Powered Conversation Practice" : "Pratique de Conversation Assistée par IA"}
                </Badge>
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4" style={{ color: "#f8f7f7" }}>
                  {isEn ? "Conversation Practice Mode" : "Mode Pratique de Conversation"}
                </h1>
                <p className="text-lg text-white/80 max-w-3xl mx-auto" style={{ color: "#ffffff" }}>
                  {isEn
                    ? "Practice speaking and writing with AI coaches who provide real-time feedback, corrections, and encouragement."
                    : "Pratiquez l'expression orale et écrite avec des coachs IA qui fournissent des commentaires, corrections et encouragements en temps réel."}
                </p>
              </div>
            </section>

            {/* Setup Form */}
            <section className="py-12">
              <div className="container max-w-3xl">
                <Card className="shadow-xl border-none">
                  <CardHeader>
                    <CardTitle className="text-[#0F3D3E]">
                      {isEn ? "Configure Your Session" : "Configurez Votre Session"}
                    </CardTitle>
                    <CardDescription>
                      {isEn
                        ? "Choose your coach, level, and skill focus to start practicing."
                        : "Choisissez votre coach, niveau et compétence pour commencer à pratiquer."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Coach Selection */}
                    <div>
                      <label className="text-sm font-medium text-[#0F3D3E] mb-3 block">
                        {isEn ? "Choose Your Coach" : "Choisissez Votre Coach"}
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {coachOptions.map((coach) => (
                          <button
                            key={coach.key}
                            onClick={() => setSelectedCoach(coach.key)}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                              selectedCoach === coach.key
                                ? "border-[#C65A1E] bg-[#C65A1E]/5"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <span className="text-2xl mb-1 block">{coach.emoji}</span>
                            <p className="font-semibold text-sm text-[#0F3D3E]">{coach.name}</p>
                            <p className="text-xs text-muted-foreground">{coach.specialty}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Level Selection */}
                    <div>
                      <label className="text-sm font-medium text-[#0F3D3E] mb-2 block">
                        {isEn ? "Your Level" : "Votre Niveau"}
                      </label>
                      <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">{isEn ? "Level A - Beginner" : "Niveau A - Débutant"}</SelectItem>
                          <SelectItem value="B">{isEn ? "Level B - Intermediate" : "Niveau B - Intermédiaire"}</SelectItem>
                          <SelectItem value="C">{isEn ? "Level C - Advanced" : "Niveau C - Avancé"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Skill Selection */}
                    <div>
                      <label className="text-sm font-medium text-[#0F3D3E] mb-3 block">
                        {isEn ? "Skill Focus" : "Compétence Ciblée"}
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {skillOptions.map((skill) => {
                          const SkillIcon = skill.icon;
                          return (
                            <button
                              key={skill.value}
                              onClick={() => setSelectedSkill(skill.value)}
                              className={`p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                                selectedSkill === skill.value
                                  ? "border-[#C65A1E] bg-[#C65A1E]/5"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <SkillIcon className={`h-5 w-5 ${selectedSkill === skill.value ? "text-[#C65A1E]" : "text-muted-foreground"}`} />
                              <span className="text-sm font-medium">{skill.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Optional Topic */}
                    <div>
                      <label className="text-sm font-medium text-[#0F3D3E] mb-2 block">
                        {isEn ? "Topic (Optional)" : "Sujet (Optionnel)"}
                      </label>
                      <Textarea
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder={isEn ? "e.g., Workplace meeting, SLE oral exam, Restaurant ordering..." : "ex., Réunion de travail, Examen oral SLE, Commande au restaurant..."}
                        rows={2}
                      />
                    </div>

                    <Button
                      className="w-full bg-[#C65A1E] hover:bg-[#A84A15] text-white"
                      size="lg"
                      onClick={handleStartSession}
                      disabled={startSessionMutation.isPending}
                    >
                      {startSessionMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {isEn ? "Starting..." : "Démarrage..."}
                        </>
                      ) : (
                        <>
                          <MessageSquare className="mr-2 h-5 w-5" />
                          {isEn ? "Start Practice Session" : "Démarrer la Session"}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </section>
          </>
        )}

        {/* Active Session */}
        {sessionState === "active" && (
          <div className="flex flex-col h-[calc(100vh-64px)]">
            {/* Session Header */}
            <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">
                  {coachOptions.find((c) => c.key === selectedCoach)?.emoji}
                </span>
                <div>
                  <p className="font-semibold text-sm text-[#0F3D3E]">
                    {coachOptions.find((c) => c.key === selectedCoach)?.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {isEn ? `Level ${selectedLevel}` : `Niveau ${selectedLevel}`}
                    </Badge>
                    <span>•</span>
                    <span>{skillOptions.find((s) => s.value === selectedSkill)?.label}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {lastEvaluation && (
                  <Badge className={`${lastEvaluation.score >= 80 ? "bg-emerald-100 text-emerald-700" : lastEvaluation.score >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                    <Star className="h-3 w-3 mr-1" />
                    {lastEvaluation.score}/100
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEndSession}
                  className="text-red-500 border-red-200 hover:bg-red-50"
                >
                  {isEn ? "End Session" : "Terminer"}
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[80%] ${msg.role === "user" ? "order-1" : ""}`}>
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          msg.role === "user"
                            ? "bg-[#0F3D3E] text-white rounded-br-sm"
                            : "bg-white shadow-sm border rounded-bl-sm"
                        }`}
                      >
                        <Streamdown>{msg.content}</Streamdown>
                      </div>
                      {/* Evaluation feedback */}
                      {msg.role === "assistant" && msg.score !== undefined && (
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px]">
                              <BarChart3 className="h-3 w-3 mr-1" />
                              Score: {msg.score}/100
                            </Badge>
                          </div>
                          {msg.corrections && (
                            <p className="text-xs text-red-600 bg-red-50 rounded px-2 py-1">
                              <strong>{isEn ? "Corrections:" : "Corrections:"}</strong> {msg.corrections}
                            </p>
                          )}
                          {msg.suggestions && (
                            <p className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1">
                              <strong>{isEn ? "Suggestions:" : "Suggestions:"}</strong> {msg.suggestions}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-white shadow-sm border rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">{isEn ? "Thinking..." : "Réflexion..."}</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t p-4">
              <div className="flex items-end gap-2 max-w-4xl mx-auto">
                {/* Mic button */}
                <Button
                  variant="outline"
                  size="icon"
                  className={`flex-shrink-0 ${isRecording ? "bg-red-50 border-red-300 text-red-500" : ""}`}
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  disabled={isTranscribing}
                >
                  {isTranscribing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : isRecording ? (
                    <MicOff className="h-5 w-5" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </Button>

                {/* Text input */}
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={isEn ? "Type your message or use the microphone..." : "Tapez votre message ou utilisez le microphone..."}
                  rows={1}
                  className="flex-1 resize-none min-h-[40px] max-h-[120px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />

                {/* Send button */}
                <Button
                  className="bg-[#C65A1E] hover:bg-[#A84A15] text-white flex-shrink-0"
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isSending}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              {isRecording && (
                <p className="text-center text-xs text-red-500 mt-2 animate-pulse">
                  🔴 {isEn ? "Recording... Click mic to stop" : "Enregistrement... Cliquez sur le micro pour arrêter"}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Session Ended */}
        {sessionState === "ended" && (
          <section className="py-16">
            <div className="container max-w-2xl">
              <Card className="shadow-xl border-none text-center">
                <CardContent className="p-10">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#0F3D3E] mb-2">
                    {isEn ? "Session Complete!" : "Session Terminée!"}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {isEn
                      ? `You exchanged ${messages.filter((m) => m.role === "user").length} messages. Keep practicing to improve!`
                      : `Vous avez échangé ${messages.filter((m) => m.role === "user").length} messages. Continuez à pratiquer pour vous améliorer!`}
                  </p>
                  {lastEvaluation && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                      <p className="text-sm font-medium text-[#0F3D3E] mb-2">
                        {isEn ? "Last Score" : "Dernier Score"}
                      </p>
                      <p className="text-4xl font-bold text-[#C65A1E]">{lastEvaluation.score}/100</p>
                      {lastEvaluation.feedback && (
                        <p className="text-sm text-muted-foreground mt-2">{lastEvaluation.feedback}</p>
                      )}
                    </div>
                  )}
                  <div className="flex gap-3 justify-center">
                    <Button
                      className="bg-[#C65A1E] hover:bg-[#A84A15] text-white"
                      onClick={handleNewSession}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {isEn ? "New Session" : "Nouvelle Session"}
                    </Button>
                    <Link href="/app/practice-history">
                      <Button variant="outline">
                        {isEn ? "View History" : "Voir l'Historique"}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}
      </main>
      {sessionState !== "active" && (
        <EcosystemFooter lang={isEn ? "en" : "fr"} theme="light" activeBrand="rusingacademy" />
      )}
    </div>
  );
}
