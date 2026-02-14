import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Headphones,
  ChevronRight,
  Volume2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: string;
  questionText: string;
  questionTextFr: string;
  options: string[];
  optionsFr: string[];
  correctAnswer: number;
  explanation: string;
  explanationFr: string;
}

interface ListeningExerciseProps {
  title: string;
  titleFr: string;
  audioUrl: string;
  audioText: string;
  audioTextFr: string;
  questions: Question[];
  language: "en" | "fr";
  onComplete: (score: number, total: number) => void;
}

export default function ListeningExercise({
  title,
  titleFr,
  audioUrl,
  audioText,
  audioTextFr,
  questions,
  language,
  onComplete,
}: ListeningExerciseProps) {
  const isEn = language === "en";
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  const playAudio = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.play();
      audio.onended = () => {
        setIsPlaying(false);
        setPlayCount((prev) => prev + 1);
      };
      setIsPlaying(true);
    }
  };
  
  const checkAnswer = () => {
    if (selectedAnswer === null) return;
    
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setCorrectAnswers((prev) => prev + 1);
    }
    setShowResult(true);
  };
  
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsComplete(true);
      onComplete(correctAnswers + (selectedAnswer === currentQuestion.correctAnswer ? 1 : 0), questions.length);
    }
  };
  
  const resetExercise = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectAnswers(0);
    setPlayCount(0);
    setShowTranscript(false);
    setIsComplete(false);
    audioRef.current?.pause();
    setIsPlaying(false);
  };
  
  if (isComplete) {
    const finalScore = correctAnswers + (selectedAnswer === currentQuestion.correctAnswer ? 1 : 0);
    const percentage = Math.round((finalScore / questions.length) * 100);
    const passed = percentage >= 70;
    
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
              passed ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {passed ? (
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            ) : (
              <XCircle className="h-12 w-12 text-red-600" />
            )}
          </motion.div>
          
          <h2 className="text-2xl font-bold mb-2">
            {passed
              ? (isEn ? "Excellent Work!" : "Excellent travail !")
              : (isEn ? "Keep Practicing!" : "Continuez à pratiquer !")}
          </h2>
          
          <p className="text-muted-foreground mb-6">
            {isEn
              ? `You scored ${finalScore} out of ${questions.length} (${percentage}%)`
              : `Vous avez obtenu ${finalScore} sur ${questions.length} (${percentage}%)`}
          </p>
          
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={resetExercise}>
              <RotateCcw className="h-4 w-4 mr-2" />
              {isEn ? "Try Again" : "Réessayer"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-[#E7F2F2] to-[#F0F7F7] dark:from-[#0F3D3E]/20 dark:to-[#0F3D3E]/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-[#0F3D3E]" />
              {isEn ? title : titleFr}
            </CardTitle>
            <CardDescription>
              {isEn
                ? `Question ${currentQuestionIndex + 1} of ${questions.length}`
                : `Question ${currentQuestionIndex + 1} sur ${questions.length}`}
            </CardDescription>
          </div>
          <Badge variant="outline">
            {correctAnswers}/{currentQuestionIndex} {isEn ? "correct" : "correct"}
          </Badge>
        </div>
        <Progress value={progress} className="mt-4" />
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Audio Player */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={playAudio}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isPlaying
                  ? "bg-[#0F3D3E] text-white"
                  : "bg-[#E7F2F2] text-[#0F3D3E] hover:bg-[#0F3D3E] hover:text-white"
              }`}
            >
              {isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8 ml-1" />
              )}
            </motion.button>
            
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                {isEn ? `Played ${playCount} time(s)` : `Écouté ${playCount} fois`}
              </div>
            </div>
          </div>
          
          {/* Transcript Toggle */}
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTranscript(!showTranscript)}
            >
              {showTranscript
                ? (isEn ? "Hide Transcript" : "Masquer la transcription")
                : (isEn ? "Show Transcript" : "Afficher la transcription")}
            </Button>
            
            <AnimatePresence>
              {showTranscript && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 bg-white dark:bg-gray-700 rounded-lg text-left"
                >
                  <p className="text-sm">{isEn ? audioText : audioTextFr}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Question */}
        <div>
          <h3 className="font-medium mb-4">
            {isEn ? currentQuestion.questionText : currentQuestion.questionTextFr}
          </h3>
          
          <RadioGroup
            value={selectedAnswer?.toString()}
            onValueChange={(value) => setSelectedAnswer(parseInt(value))}
            disabled={showResult}
          >
            {(isEn ? currentQuestion.options : currentQuestion.optionsFr).map((option, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 p-4 rounded-lg border transition-all ${
                  showResult
                    ? index === currentQuestion.correctAnswer
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : selectedAnswer === index
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-200"
                    : selectedAnswer === index
                    ? "border-[#0F3D3E] bg-[#E7F2F2] dark:bg-[#0F3D3E]/20"
                    : "border-gray-200 hover:border-[#0F3D3E]/50"
                }`}
              >
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
                {showResult && index === currentQuestion.correctAnswer && (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                {showResult && selectedAnswer === index && index !== currentQuestion.correctAnswer && (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
            ))}
          </RadioGroup>
        </div>
        
        {/* Explanation */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg ${
                selectedAnswer === currentQuestion.correctAnswer
                  ? "bg-green-50 dark:bg-green-900/20 border border-green-200"
                  : "bg-red-50 dark:bg-red-900/20 border border-red-200"
              }`}
            >
              <p className="text-sm">
                {isEn ? currentQuestion.explanation : currentQuestion.explanationFr}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          {!showResult ? (
            <Button
              onClick={checkAnswer}
              disabled={selectedAnswer === null}
              className="bg-[#0F3D3E] hover:bg-[#0F3D3E]/90"
            >
              {isEn ? "Check Answer" : "Vérifier la réponse"}
            </Button>
          ) : (
            <Button onClick={nextQuestion} className="bg-[#0F3D3E] hover:bg-[#0F3D3E]/90">
              {currentQuestionIndex < questions.length - 1
                ? (isEn ? "Next Question" : "Question suivante")
                : (isEn ? "See Results" : "Voir les résultats")}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
