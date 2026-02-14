import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  Play,
  Pause,
  Volume2,
  Mic,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Award,
  Target,
  Headphones,
  MessageSquare,
  Loader2,
  ArrowLeft,
  Star,
  Zap,
} from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAppLayout } from "@/contexts/AppLayoutContext";

type SLELevel = "A" | "B" | "C";
type ExerciseType = "listening" | "repetition" | "comprehension";

interface AudioPhrase {
  id: string;
  text: string;
  textFr?: string;
  audioUrl: string;
  level: SLELevel;
  category: string;
  duration?: number;
}

export default function SLEPractice() {
  const { isInsideAppLayout } = useAppLayout();
  const { language } = useLanguage();
  const isEn = language === "en";
  
  const [selectedLevel, setSelectedLevel] = useState<SLELevel>("A");
  const [activeExercise, setActiveExercise] = useState<ExerciseType>("listening");
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [completedPhrases, setCompletedPhrases] = useState<Set<string>>(new Set());
  const [sessionScore, setSessionScore] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Fetch audio by level
  const { data: audioData, isLoading } = trpc.audio.getSLEPracticeAudio.useQuery({
    level: selectedLevel,
  });
  
  const phrases = audioData?.audio || [];
  const currentPhrase = phrases[currentPhraseIndex];
  
  // Level descriptions
  const levelInfo: Record<SLELevel, { title: string; titleFr: string; description: string; descriptionFr: string; color: string }> = {
    A: {
      title: "Level A - Basic",
      titleFr: "Niveau A - Base",
      description: "Simple phrases for everyday workplace communication",
      descriptionFr: "Phrases simples pour la communication quotidienne au travail",
      color: "bg-green-500",
    },
    B: {
      title: "Level B - Intermediate",
      titleFr: "Niveau B - Intermédiaire",
      description: "Professional discussions and meeting participation",
      descriptionFr: "Discussions professionnelles et participation aux réunions",
      color: "bg-yellow-500",
    },
    C: {
      title: "Level C - Advanced",
      titleFr: "Niveau C - Avancé",
      description: "Complex negotiations and strategic communication",
      descriptionFr: "Négociations complexes et communication stratégique",
      color: "bg-red-500",
    },
  };
  
  const playAudio = () => {
    if (!currentPhrase) return;
    
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(currentPhrase.audioUrl);
      audioRef.current = audio;
      audio.play();
      audio.onended = () => setIsPlaying(false);
      setIsPlaying(true);
    }
  };
  
  const markComplete = () => {
    if (currentPhrase) {
      setCompletedPhrases((prev) => new Set([...prev, currentPhrase.id]));
      setSessionScore((prev) => prev + 10);
    }
  };
  
  const nextPhrase = () => {
    if (currentPhraseIndex < phrases.length - 1) {
      setCurrentPhraseIndex((prev) => prev + 1);
      setShowTranslation(false);
      setIsPlaying(false);
      audioRef.current?.pause();
    }
  };
  
  const prevPhrase = () => {
    if (currentPhraseIndex > 0) {
      setCurrentPhraseIndex((prev) => prev - 1);
      setShowTranslation(false);
      setIsPlaying(false);
      audioRef.current?.pause();
    }
  };
  
  const resetSession = () => {
    setCurrentPhraseIndex(0);
    setCompletedPhrases(new Set());
    setSessionScore(0);
    setShowTranslation(false);
    setIsPlaying(false);
    audioRef.current?.pause();
  };
  
  const progress = phrases.length > 0 ? (completedPhrases.size / phrases.length) * 100 : 0;
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#F8FAFA] to-white dark:from-gray-900 dark:to-gray-800">
      {!isInsideAppLayout && <Header />}
      
      <main className="flex-1 container py-8">
        {/* Back Link */}
        <Link href="/rusingacademy" className="inline-flex items-center text-[#0F3D3E] hover:underline mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {isEn ? "Back to RusingÂcademy" : "Retour à RusingÂcademy"}
        </Link>
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#0F3D3E] to-[#145A5B] rounded-3xl p-8 mb-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <Target className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {isEn ? "SLE Practice Lab" : "Laboratoire de pratique ELS"}
              </h1>
              <p className="text-white/80">
                {isEn 
                  ? "Master your French oral skills with structured audio exercises"
                  : "Maîtrisez vos compétences orales en français avec des exercices audio structurés"}
              </p>
            </div>
          </div>
          
          {/* Session Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{completedPhrases.size}</div>
              <div className="text-sm text-white/70">{isEn ? "Completed" : "Terminées"}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{sessionScore}</div>
              <div className="text-sm text-white/70">{isEn ? "Points" : "Points"}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{Math.round(progress)}%</div>
              <div className="text-sm text-white/70">{isEn ? "Progress" : "Progrès"}</div>
            </div>
          </div>
        </div>
        
        {/* Level Selector */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {(["A", "B", "C"] as SLELevel[]).map((level) => (
            <button
              key={level}
              onClick={() => {
                setSelectedLevel(level);
                resetSession();
              }}
              className={`p-6 rounded-2xl border-2 transition-all ${
                selectedLevel === level
                  ? "border-[#0F3D3E] bg-[#E7F2F2] dark:bg-[#0F3D3E]/20"
                  : "border-gray-200 hover:border-[#0F3D3E]/50"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-3 h-3 rounded-full ${levelInfo[level].color}`} />
                <span className="font-bold text-lg">
                  {isEn ? levelInfo[level].title : levelInfo[level].titleFr}
                </span>
              </div>
              <p className="text-sm text-muted-foreground text-left">
                {isEn ? levelInfo[level].description : levelInfo[level].descriptionFr}
              </p>
            </button>
          ))}
        </div>
        
        {/* Exercise Type Tabs */}
        <Tabs value={activeExercise} onValueChange={(v) => setActiveExercise(v as ExerciseType)} className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="listening" className="flex items-center gap-2">
              <Headphones className="h-4 w-4" />
              <span className="hidden sm:inline">{isEn ? "Listening" : "Écoute"}</span>
            </TabsTrigger>
            <TabsTrigger value="repetition" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              <span className="hidden sm:inline">{isEn ? "Repetition" : "Répétition"}</span>
            </TabsTrigger>
            <TabsTrigger value="comprehension" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">{isEn ? "Comprehension" : "Compréhension"}</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Listening Exercise */}
          <TabsContent value="listening" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#0F3D3E]" />
              </div>
            ) : phrases.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Volume2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isEn ? "No audio available for this level yet." : "Aucun audio disponible pour ce niveau."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[#E7F2F2] to-[#F0F7F7] dark:from-[#0F3D3E]/20 dark:to-[#0F3D3E]/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Headphones className="h-5 w-5 text-[#0F3D3E]" />
                        {isEn ? "Listening Exercise" : "Exercice d'écoute"}
                      </CardTitle>
                      <CardDescription>
                        {isEn 
                          ? `Phrase ${currentPhraseIndex + 1} of ${phrases.length}`
                          : `Phrase ${currentPhraseIndex + 1} sur ${phrases.length}`}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className={`${levelInfo[selectedLevel].color} text-white border-0`}>
                      {isEn ? "Level" : "Niveau"} {selectedLevel}
                    </Badge>
                  </div>
                  <Progress value={(currentPhraseIndex + 1) / phrases.length * 100} className="mt-4" />
                </CardHeader>
                
                <CardContent className="p-8">
                  {currentPhrase && (
                    <div className="space-y-6">
                      {/* Audio Player */}
                      <div className="flex items-center justify-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={playAudio}
                          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                            isPlaying
                              ? "bg-[#0F3D3E] text-white"
                              : "bg-[#E7F2F2] text-[#0F3D3E] hover:bg-[#0F3D3E] hover:text-white"
                          }`}
                        >
                          {isPlaying ? (
                            <Pause className="h-10 w-10" />
                          ) : (
                            <Play className="h-10 w-10 ml-1" />
                          )}
                        </motion.button>
                      </div>
                      
                      {/* French Text */}
                      <div className="text-center">
                        <p className="text-2xl font-medium text-gray-900 dark:text-white mb-4">
                          {currentPhrase.textFr}
                        </p>
                        
                        {/* Toggle Translation */}
                        <AnimatePresence>
                          {showTranslation && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-lg text-muted-foreground"
                            >
                              {currentPhrase.text}
                            </motion.p>
                          )}
                        </AnimatePresence>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowTranslation(!showTranslation)}
                          className="mt-2"
                        >
                          {showTranslation 
                            ? (isEn ? "Hide Translation" : "Masquer la traduction")
                            : (isEn ? "Show Translation" : "Afficher la traduction")}
                        </Button>
                      </div>
                      
                      {/* Category Badge */}
                      <div className="flex justify-center">
                        <Badge variant="secondary" className="capitalize">
                          {currentPhrase.category}
                        </Badge>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={prevPhrase}
                          disabled={currentPhraseIndex === 0}
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          {isEn ? "Previous" : "Précédent"}
                        </Button>
                        
                        <div className="flex items-center gap-2">
                          {!completedPhrases.has(currentPhrase.id) ? (
                            <Button onClick={markComplete} className="bg-[#0F3D3E] hover:bg-[#0F3D3E]/90">
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              {isEn ? "Mark Complete" : "Marquer terminé"}
                            </Button>
                          ) : (
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              {isEn ? "Completed" : "Terminé"}
                            </Badge>
                          )}
                        </div>
                        
                        <Button
                          onClick={nextPhrase}
                          disabled={currentPhraseIndex === phrases.length - 1}
                        >
                          {isEn ? "Next" : "Suivant"}
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Repetition Exercise */}
          <TabsContent value="repetition" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5 text-[#0F3D3E]" />
                  {isEn ? "Repetition Exercise" : "Exercice de répétition"}
                </CardTitle>
                <CardDescription>
                  {isEn 
                    ? "Listen to the phrase, then record yourself repeating it"
                    : "Écoutez la phrase, puis enregistrez-vous en la répétant"}
                </CardDescription>
              </CardHeader>
              <CardContent className="py-12 text-center">
                <div className="w-20 h-20 rounded-full bg-[#E7F2F2] flex items-center justify-center mx-auto mb-4">
                  <Mic className="h-10 w-10 text-[#0F3D3E]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {isEn ? "Coming Soon" : "Bientôt disponible"}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {isEn 
                    ? "Record yourself and compare your pronunciation with the native speaker."
                    : "Enregistrez-vous et comparez votre prononciation avec le locuteur natif."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Comprehension Exercise */}
          <TabsContent value="comprehension" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-[#0F3D3E]" />
                  {isEn ? "Comprehension Exercise" : "Exercice de compréhension"}
                </CardTitle>
                <CardDescription>
                  {isEn 
                    ? "Listen to the audio and answer questions about what you heard"
                    : "Écoutez l'audio et répondez aux questions sur ce que vous avez entendu"}
                </CardDescription>
              </CardHeader>
              <CardContent className="py-12 text-center">
                <div className="w-20 h-20 rounded-full bg-[#E7F2F2] flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-10 w-10 text-[#0F3D3E]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {isEn ? "Coming Soon" : "Bientôt disponible"}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {isEn 
                    ? "Test your understanding with comprehension questions after each audio."
                    : "Testez votre compréhension avec des questions après chaque audio."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Session Summary */}
        {completedPhrases.size > 0 && (
          <Card className="bg-gradient-to-r from-[#E7F2F2] to-[#F0F7F7] dark:from-[#0F3D3E]/20 dark:to-[#0F3D3E]/10 border-[#0F3D3E]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#0F3D3E] text-white flex items-center justify-center">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {isEn ? "Session Progress" : "Progrès de la session"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isEn 
                        ? `${completedPhrases.size} phrases completed • ${sessionScore} points earned`
                        : `${completedPhrases.size} phrases terminées • ${sessionScore} points gagnés`}
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={resetSession}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {isEn ? "Reset Session" : "Réinitialiser"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      
      {!isInsideAppLayout && <Footer />}
    </div>
  );
}
