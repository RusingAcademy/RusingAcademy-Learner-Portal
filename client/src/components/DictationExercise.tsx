/**
 * DictationExercise Component
 * Allows users to listen to audio and type what they hear
 * Provides scoring and feedback on accuracy
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Volume2,
  Eye,
  EyeOff,
  Trophy,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DictationPhrase {
  id: string;
  text: string;
  textFr: string;
  audioUrl: string;
  level: "A" | "B" | "C";
  category: string;
}

interface DictationExerciseProps {
  phrases: DictationPhrase[];
  onComplete?: (results: DictationResult[]) => void;
  showTranslation?: boolean;
  language?: "fr" | "en";
}

interface DictationResult {
  phraseId: string;
  userInput: string;
  correctText: string;
  accuracy: number;
  attempts: number;
  hintsUsed: number;
}

interface WordComparison {
  word: string;
  isCorrect: boolean;
  expected?: string;
}

export function DictationExercise({
  phrases,
  onComplete,
  showTranslation = true,
  language = "fr",
}: DictationExerciseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [results, setResults] = useState<DictationResult[]>([]);
  const [wordComparison, setWordComparison] = useState<WordComparison[]>([]);
  const [playCount, setPlayCount] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  
  const currentPhrase = phrases[currentIndex];
  const correctText = language === "fr" ? currentPhrase?.textFr : currentPhrase?.text;
  const translationText = language === "fr" ? currentPhrase?.text : currentPhrase?.textFr;
  
  // Calculate accuracy between user input and correct text
  const calculateAccuracy = useCallback((input: string, correct: string): number => {
    const normalizeText = (text: string) =>
      text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents for comparison
        .replace(/[^\w\s]/g, "") // Remove punctuation
        .trim()
        .split(/\s+/);
    
    const inputWords = normalizeText(input);
    const correctWords = normalizeText(correct);
    
    if (correctWords.length === 0) return 0;
    
    let matchCount = 0;
    correctWords.forEach((word, index) => {
      if (inputWords[index] === word) {
        matchCount++;
      }
    });
    
    return Math.round((matchCount / correctWords.length) * 100);
  }, []);
  
  // Compare words and highlight differences
  const compareWords = useCallback((input: string, correct: string): WordComparison[] => {
    const normalizeForCompare = (text: string) =>
      text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s]/g, "")
        .trim();
    
    const inputWords = input.trim().split(/\s+/);
    const correctWords = correct.trim().split(/\s+/);
    
    return correctWords.map((word, index) => {
      const inputWord = inputWords[index] || "";
      const normalizedInput = normalizeForCompare(inputWord);
      const normalizedCorrect = normalizeForCompare(word);
      
      return {
        word: word,
        isCorrect: normalizedInput === normalizedCorrect,
        expected: normalizedInput !== normalizedCorrect ? word : undefined,
      };
    });
  }, []);
  
  // Play audio
  const playAudio = useCallback(() => {
    if (!currentPhrase) return;
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    const audio = new Audio(currentPhrase.audioUrl);
    audioRef.current = audio;
    
    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => {
      setIsPlaying(false);
      setPlayCount((prev) => prev + 1);
    };
    audio.onerror = () => setIsPlaying(false);
    
    audio.play().catch(() => setIsPlaying(false));
  }, [currentPhrase]);
  
  // Pause audio
  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);
  
  // Show hint (first few words)
  const handleShowHint = useCallback(() => {
    if (!correctText) return;
    const words = correctText.split(" ");
    const hintWords = words.slice(0, Math.min(3, Math.ceil(words.length / 3)));
    setUserInput(hintWords.join(" ") + " ");
    setShowHint(true);
    setHintsUsed((prev) => prev + 1);
    textareaRef.current?.focus();
  }, [correctText]);
  
  // Submit answer
  const handleSubmit = useCallback(() => {
    if (!correctText || !userInput.trim()) return;
    
    const accuracy = calculateAccuracy(userInput, correctText);
    const comparison = compareWords(userInput, correctText);
    
    setWordComparison(comparison);
    setIsSubmitted(true);
    setAttempts((prev) => prev + 1);
    
    // If accuracy is 100%, auto-advance after delay
    if (accuracy === 100) {
      setTimeout(() => {
        handleNext();
      }, 2000);
    }
  }, [userInput, correctText, calculateAccuracy, compareWords]);
  
  // Try again
  const handleTryAgain = useCallback(() => {
    setUserInput("");
    setIsSubmitted(false);
    setWordComparison([]);
    setShowAnswer(false);
    textareaRef.current?.focus();
  }, []);
  
  // Move to next phrase
  const handleNext = useCallback(() => {
    if (!currentPhrase || !correctText) return;
    
    const accuracy = calculateAccuracy(userInput, correctText);
    
    // Save result
    const result: DictationResult = {
      phraseId: currentPhrase.id,
      userInput,
      correctText,
      accuracy,
      attempts,
      hintsUsed,
    };
    
    const newResults = [...results, result];
    setResults(newResults);
    
    // Move to next or complete
    if (currentIndex < phrases.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setUserInput("");
      setIsSubmitted(false);
      setWordComparison([]);
      setShowHint(false);
      setShowAnswer(false);
      setAttempts(0);
      setHintsUsed(0);
      setPlayCount(0);
    } else {
      // Exercise complete
      onComplete?.(newResults);
    }
  }, [
    currentPhrase,
    correctText,
    userInput,
    attempts,
    hintsUsed,
    results,
    currentIndex,
    phrases.length,
    calculateAccuracy,
    onComplete,
  ]);
  
  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  // Auto-play audio when phrase changes
  useEffect(() => {
    if (currentPhrase && playCount === 0) {
      const timer = setTimeout(() => playAudio(), 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex]);
  
  if (!currentPhrase) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="py-12 text-center">
          <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Exercice terminé!</h3>
          <p className="text-muted-foreground">
            Vous avez complété tous les exercices de dictée.
          </p>
          {results.length > 0 && (
            <div className="mt-6 space-y-2">
              <p className="font-medium">
                Score moyen:{" "}
                <span className="text-primary">
                  {Math.round(
                    results.reduce((acc, r) => acc + r.accuracy, 0) / results.length
                  )}
                  %
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                {results.filter((r) => r.accuracy >= 80).length} / {results.length} phrases
                réussies (≥80%)
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  
  const accuracy = isSubmitted ? calculateAccuracy(userInput, correctText) : 0;
  
  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-4">
        <Progress value={((currentIndex + 1) / phrases.length) * 100} className="flex-1" />
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {currentIndex + 1} / {phrases.length}
        </span>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Exercice de Dictée
              </CardTitle>
              <CardDescription>
                Écoutez l'audio et tapez ce que vous entendez
              </CardDescription>
            </div>
            <Badge
              variant={
                currentPhrase.level === "A"
                  ? "default"
                  : currentPhrase.level === "B"
                  ? "secondary"
                  : "destructive"
              }
            >
              Niveau {currentPhrase.level}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Audio Controls */}
          <div className="flex items-center justify-center gap-4 p-6 bg-muted/50 rounded-lg">
            <Button
              size="lg"
              variant={isPlaying ? "secondary" : "default"}
              onClick={isPlaying ? pauseAudio : playAudio}
              className="gap-2"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-5 w-5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Écouter
                </>
              )}
            </Button>
            
            <Button variant="outline" size="lg" onClick={playAudio} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Rejouer
            </Button>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Volume2 className="h-4 w-4" />
              <span>{playCount}x</span>
            </div>
          </div>
          
          {/* Translation hint (if enabled) */}
          {showTranslation && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <span className="font-medium">Traduction:</span> {translationText}
              </p>
            </div>
          )}
          
          {/* Input Area */}
          <div className="space-y-2">
            <Textarea
              ref={textareaRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Tapez ce que vous entendez..."
              className="min-h-[120px] text-lg"
              disabled={isSubmitted && accuracy === 100}
            />
            
            {/* Word comparison after submission */}
            {isSubmitted && wordComparison.length > 0 && (
              <div className="p-4 rounded-lg border bg-muted/30">
                <p className="text-sm font-medium mb-2">Comparaison:</p>
                <div className="flex flex-wrap gap-1">
                  {wordComparison.map((item, index) => (
                    <span
                      key={index}
                      className={cn(
                        "px-2 py-1 rounded text-sm",
                        item.isCorrect
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      )}
                    >
                      {item.word}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Accuracy Score */}
          {isSubmitted && (
            <div
              className={cn(
                "flex items-center justify-center gap-3 p-4 rounded-lg",
                accuracy >= 80
                  ? "bg-green-100 dark:bg-green-900/30"
                  : accuracy >= 50
                  ? "bg-yellow-100 dark:bg-yellow-900/30"
                  : "bg-red-100 dark:bg-red-900/30"
              )}
            >
              {accuracy >= 80 ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              <span className="text-2xl font-bold">{accuracy}%</span>
              <span className="text-muted-foreground">de précision</span>
            </div>
          )}
          
          {/* Show Answer */}
          {showAnswer && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">
                Réponse correcte:
              </p>
              <p className="text-amber-900 dark:text-amber-200">{correctText}</p>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            {!isSubmitted ? (
              <>
                <Button onClick={handleSubmit} disabled={!userInput.trim()} className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Vérifier
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleShowHint}
                  disabled={showHint}
                  className="gap-2"
                >
                  <Lightbulb className="h-4 w-4" />
                  Indice
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="gap-2"
                >
                  {showAnswer ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Cacher
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      Voir réponse
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                {accuracy < 100 && (
                  <Button variant="outline" onClick={handleTryAgain} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Réessayer
                  </Button>
                )}
                
                <Button onClick={handleNext} className="gap-2">
                  {currentIndex < phrases.length - 1 ? "Suivant" : "Terminer"}
                </Button>
              </>
            )}
          </div>
          
          {/* Stats */}
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <span>Tentatives: {attempts}</span>
            <span>Indices: {hintsUsed}</span>
            <span>Écoutes: {playCount}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DictationExercise;
