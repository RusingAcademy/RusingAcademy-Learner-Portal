import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  Mic,
  MicOff,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Volume2,
  Loader2,
  Square,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Phrase {
  id: string;
  text: string;
  textFr: string;
  audioUrl: string;
  tips?: string;
  tipsFr?: string;
}

interface RepetitionExerciseProps {
  title: string;
  titleFr: string;
  phrases: Phrase[];
  language: "en" | "fr";
  onComplete: (completedCount: number, total: number) => void;
}

export default function RepetitionExercise({
  title,
  titleFr,
  phrases,
  language,
  onComplete,
}: RepetitionExerciseProps) {
  const isEn = language === "en";
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [completedPhrases, setCompletedPhrases] = useState<Set<string>>(new Set());
  const [showTips, setShowTips] = useState(false);
  const [hasListened, setHasListened] = useState(false);
  
  const originalAudioRef = useRef<HTMLAudioElement | null>(null);
  const recordingAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const currentPhrase = phrases[currentPhraseIndex];
  const progress = ((currentPhraseIndex + 1) / phrases.length) * 100;
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    };
  }, [recordedAudioUrl]);
  
  const playOriginal = () => {
    if (isPlayingOriginal) {
      originalAudioRef.current?.pause();
      setIsPlayingOriginal(false);
    } else {
      if (originalAudioRef.current) {
        originalAudioRef.current.pause();
      }
      const audio = new Audio(currentPhrase.audioUrl);
      originalAudioRef.current = audio;
      audio.play();
      audio.onended = () => {
        setIsPlayingOriginal(false);
        setHasListened(true);
      };
      setIsPlayingOriginal(true);
    }
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const playRecording = () => {
    if (!recordedAudioUrl) return;
    
    if (isPlayingRecording) {
      recordingAudioRef.current?.pause();
      setIsPlayingRecording(false);
    } else {
      if (recordingAudioRef.current) {
        recordingAudioRef.current.pause();
      }
      const audio = new Audio(recordedAudioUrl);
      recordingAudioRef.current = audio;
      audio.play();
      audio.onended = () => setIsPlayingRecording(false);
      setIsPlayingRecording(true);
    }
  };
  
  const markComplete = () => {
    setCompletedPhrases((prev) => new Set([...prev, currentPhrase.id]));
  };
  
  const nextPhrase = () => {
    if (currentPhraseIndex < phrases.length - 1) {
      // Cleanup previous recording
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
      setCurrentPhraseIndex((prev) => prev + 1);
      setRecordedAudioUrl(null);
      setHasListened(false);
      setShowTips(false);
    } else {
      onComplete(completedPhrases.size + (completedPhrases.has(currentPhrase.id) ? 0 : 1), phrases.length);
    }
  };
  
  const resetPhrase = () => {
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
    }
    setRecordedAudioUrl(null);
    setHasListened(false);
    setShowTips(false);
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-[#E7F2F2] to-[#F0F7F7] dark:from-[#0F3D3E]/20 dark:to-[#0F3D3E]/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-[#0F3D3E]" />
              {isEn ? title : titleFr}
            </CardTitle>
            <CardDescription>
              {isEn
                ? `Phrase ${currentPhraseIndex + 1} of ${phrases.length}`
                : `Phrase ${currentPhraseIndex + 1} sur ${phrases.length}`}
            </CardDescription>
          </div>
          <Badge variant="outline">
            {completedPhrases.size}/{phrases.length} {isEn ? "completed" : "terminées"}
          </Badge>
        </div>
        <Progress value={progress} className="mt-4" />
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Phrase Display */}
        <div className="text-center py-4">
          <p className="text-2xl font-medium text-gray-900 dark:text-white mb-2">
            {currentPhrase.textFr}
          </p>
          <p className="text-lg text-muted-foreground">
            {currentPhrase.text}
          </p>
        </div>
        
        {/* Step 1: Listen to Original */}
        <div className={`p-4 rounded-xl border-2 transition-all ${
          hasListened ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-[#0F3D3E]"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                hasListened ? "bg-green-500 text-white" : "bg-[#0F3D3E] text-white"
              }`}>
                1
              </div>
              <div>
                <p className="font-medium">
                  {isEn ? "Listen to the phrase" : "Écoutez la phrase"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isEn ? "Pay attention to pronunciation" : "Faites attention à la prononciation"}
                </p>
              </div>
            </div>
            
            <Button
              variant={hasListened ? "outline" : "default"}
              onClick={playOriginal}
              className={!hasListened ? "bg-[#0F3D3E] hover:bg-[#0F3D3E]/90" : ""}
            >
              {isPlayingOriginal ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  {isEn ? "Pause" : "Pause"}
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 mr-2" />
                  {isEn ? "Listen" : "Écouter"}
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Step 2: Record Yourself */}
        <div className={`p-4 rounded-xl border-2 transition-all ${
          !hasListened ? "opacity-50 border-gray-200" : recordedAudioUrl ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-[#0F3D3E]"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                recordedAudioUrl ? "bg-green-500 text-white" : hasListened ? "bg-[#0F3D3E] text-white" : "bg-gray-300 text-gray-600"
              }`}>
                2
              </div>
              <div>
                <p className="font-medium">
                  {isEn ? "Record yourself" : "Enregistrez-vous"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isEn ? "Repeat the phrase" : "Répétez la phrase"}
                </p>
              </div>
            </div>
            
            {!isRecording ? (
              <Button
                variant={recordedAudioUrl ? "outline" : "default"}
                onClick={startRecording}
                disabled={!hasListened}
                className={hasListened && !recordedAudioUrl ? "bg-[#0F3D3E] hover:bg-[#0F3D3E]/90" : ""}
              >
                <Mic className="h-4 w-4 mr-2" />
                {recordedAudioUrl ? (isEn ? "Re-record" : "Ré-enregistrer") : (isEn ? "Record" : "Enregistrer")}
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                variant="destructive"
                className="animate-pulse"
              >
                <Square className="h-4 w-4 mr-2" />
                {isEn ? "Stop" : "Arrêter"}
              </Button>
            )}
          </div>
          
          {isRecording && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex items-center justify-center gap-2 text-red-500"
            >
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              {isEn ? "Recording..." : "Enregistrement..."}
            </motion.div>
          )}
        </div>
        
        {/* Step 3: Compare */}
        <AnimatePresence>
          {recordedAudioUrl && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-xl border-2 border-[#0F3D3E] bg-[#E7F2F2] dark:bg-[#0F3D3E]/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#0F3D3E] text-white flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">
                    {isEn ? "Compare and practice" : "Comparez et pratiquez"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isEn ? "Listen to both versions" : "Écoutez les deux versions"}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={playOriginal}>
                  {isPlayingOriginal ? <Pause className="h-4 w-4 mr-2" /> : <Volume2 className="h-4 w-4 mr-2" />}
                  {isEn ? "Original" : "Original"}
                </Button>
                <Button variant="outline" onClick={playRecording}>
                  {isPlayingRecording ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isEn ? "Your Recording" : "Votre enregistrement"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Tips */}
        {(currentPhrase.tips || currentPhrase.tipsFr) && (
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTips(!showTips)}
            >
              {showTips
                ? (isEn ? "Hide Tips" : "Masquer les conseils")
                : (isEn ? "Show Pronunciation Tips" : "Afficher les conseils de prononciation")}
            </Button>
            
            <AnimatePresence>
              {showTips && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-left"
                >
                  <p className="text-sm">
                    {isEn ? currentPhrase.tips : currentPhrase.tipsFr}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={resetPhrase}>
            <RotateCcw className="h-4 w-4 mr-2" />
            {isEn ? "Reset" : "Réinitialiser"}
          </Button>
          
          <div className="flex items-center gap-2">
            {recordedAudioUrl && !completedPhrases.has(currentPhrase.id) && (
              <Button onClick={markComplete} variant="outline">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {isEn ? "Mark Complete" : "Marquer terminé"}
              </Button>
            )}
            
            {completedPhrases.has(currentPhrase.id) && (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                {isEn ? "Completed" : "Terminé"}
              </Badge>
            )}
            
            <Button onClick={nextPhrase} className="bg-[#0F3D3E] hover:bg-[#0F3D3E]/90">
              {currentPhraseIndex < phrases.length - 1
                ? (isEn ? "Next Phrase" : "Phrase suivante")
                : (isEn ? "Finish" : "Terminer")}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
