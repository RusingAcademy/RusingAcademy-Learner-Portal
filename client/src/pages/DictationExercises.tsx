import { useState, useRef, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

interface Sentence {
  text: string;
  translation: string;
  difficulty: string;
}

type Phase = "setup" | "generating" | "practice" | "results";

export default function DictationExercises() {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<Phase>("setup");
  const [cefrLevel, setCefrLevel] = useState("B1");
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [results, setResults] = useState<{ sentence: string; userAnswer: string; correct: boolean }[]>([]);
  const [showTranslation, setShowTranslation] = useState(false);
  const [activeTab, setActiveTab] = useState("practice");
  const startTimeRef = useRef(Date.now());

  const history = trpc.dictation.getHistory.useQuery();
  const generateSentences = trpc.dictation.generateSentences.useMutation();
  const saveResult = trpc.dictation.saveResult.useMutation({
    onSuccess: () => history.refetch(),
  });

  const levels = ["A1", "A2", "B1", "B2", "C1"];

  const handleStart = async () => {
    setPhase("generating");
    try {
      const data = await generateSentences.mutateAsync({ cefrLevel, count: 8 });
      if (data?.sentences?.length) {
        setSentences(data.sentences);
        setCurrentIndex(0);
        setResults([]);
        setUserInput("");
        startTimeRef.current = Date.now();
        setPhase("practice");
      } else {
        toast.error("Failed to generate sentences");
        setPhase("setup");
      }
    } catch {
      toast.error("Error generating sentences");
      setPhase("setup");
    }
  };

  const speakSentence = useCallback((text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-CA";
    utterance.rate = 0.85;
    speechSynthesis.speak(utterance);
  }, []);

  const speakSlow = useCallback((text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-CA";
    utterance.rate = 0.5;
    speechSynthesis.speak(utterance);
  }, []);

  const checkAnswer = () => {
    const current = sentences[currentIndex];
    const normalizedInput = userInput.trim().toLowerCase().replace(/[.,!?;:]/g, "");
    const normalizedAnswer = current.text.trim().toLowerCase().replace(/[.,!?;:]/g, "");
    const isCorrect = normalizedInput === normalizedAnswer;

    const newResults = [...results, { sentence: current.text, userAnswer: userInput, correct: isCorrect }];
    setResults(newResults);

    if (currentIndex < sentences.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserInput("");
      setShowTranslation(false);
    } else {
      // Finished
      const correctCount = newResults.filter(r => r.correct).length;
      const accuracy = Math.round((correctCount / newResults.length) * 100);
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      saveResult.mutate({
        cefrLevel,
        totalSentences: newResults.length,
        correctSentences: correctCount,
        accuracy,
        timeSpentSeconds: timeSpent,
      });
      setPhase("results");
    }
  };

  const skipSentence = () => {
    const current = sentences[currentIndex];
    const newResults = [...results, { sentence: current.text, userAnswer: "(skipped)", correct: false }];
    setResults(newResults);

    if (currentIndex < sentences.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserInput("");
      setShowTranslation(false);
    } else {
      const correctCount = newResults.filter(r => r.correct).length;
      const accuracy = Math.round((correctCount / newResults.length) * 100);
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      saveResult.mutate({
        cefrLevel,
        totalSentences: newResults.length,
        correctSentences: correctCount,
        accuracy,
        timeSpentSeconds: timeSpent,
      });
      setPhase("results");
    }
  };

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dictation Exercises</h1>
        <p className="text-muted-foreground mt-1">Improve your listening and spelling by transcribing French sentences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="history">History ({history.data?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="practice" className="space-y-6">
          {phase === "setup" && (
            <>
              <Card>
                <CardHeader><CardTitle>Select Difficulty Level</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3 flex-wrap">
                    {levels.map(level => (
                      <Button
                        key={level}
                        variant={cefrLevel === level ? "default" : "outline"}
                        onClick={() => setCefrLevel(level)}
                        className="min-w-[60px]"
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You'll hear 8 French sentences. Type what you hear as accurately as possible.
                  </p>
                </CardContent>
              </Card>
              <Button size="lg" className="w-full" onClick={handleStart}>
                Start Dictation — Level {cefrLevel}
              </Button>
            </>
          )}

          {phase === "generating" && (
            <Card>
              <CardContent className="py-16 text-center space-y-4">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <h3 className="text-lg font-semibold">Generating Sentences...</h3>
                <p className="text-muted-foreground">AI is preparing dictation sentences at {cefrLevel} level</p>
              </CardContent>
            </Card>
          )}

          {phase === "practice" && sentences[currentIndex] && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-card p-4 rounded-lg border">
                <Badge variant="secondary">Sentence {currentIndex + 1} / {sentences.length}</Badge>
                <Badge>{cefrLevel}</Badge>
              </div>

              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex gap-3 justify-center">
                    <Button size="lg" onClick={() => speakSentence(sentences[currentIndex].text)}>
                      🔊 Play
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => speakSlow(sentences[currentIndex].text)}>
                      🐢 Slow
                    </Button>
                    <Button size="lg" variant="ghost" onClick={() => setShowTranslation(!showTranslation)}>
                      💡 Hint
                    </Button>
                  </div>

                  {showTranslation && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg text-center text-sm">
                      <span className="text-amber-700 dark:text-amber-300">Translation: {sentences[currentIndex].translation}</span>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium mb-2 block">Type what you hear:</label>
                    <Input
                      value={userInput}
                      onChange={e => setUserInput(e.target.value)}
                      placeholder="Type the French sentence here..."
                      className="text-lg"
                      onKeyDown={e => { if (e.key === "Enter" && userInput.trim()) checkAnswer(); }}
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3 justify-between">
                    <Button variant="ghost" onClick={skipSentence}>Skip</Button>
                    <Button onClick={checkAnswer} disabled={!userInput.trim()}>
                      Check & Next →
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-1 flex-wrap">
                {sentences.map((_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium ${
                      i === currentIndex
                        ? "bg-primary text-primary-foreground"
                        : i < results.length
                        ? results[i]?.correct
                          ? "bg-green-500/20 text-green-600"
                          : "bg-red-500/20 text-red-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          )}

          {phase === "results" && (
            <div className="space-y-4">
              <Card>
                <CardContent className="py-12 text-center space-y-4">
                  <div className="text-5xl">
                    {results.filter(r => r.correct).length >= results.length * 0.7 ? "🎉" : "📝"}
                  </div>
                  <h2 className="text-3xl font-bold">
                    {results.filter(r => r.correct).length} / {results.length} correct
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    {Math.round((results.filter(r => r.correct).length / results.length) * 100)}% accuracy
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {results.map((r, i) => (
                  <Card key={i} className={r.correct ? "border-green-500/30" : "border-red-500/30"}>
                    <CardContent className="py-3">
                      <div className="flex items-start gap-3">
                        <span className="text-lg">{r.correct ? "✅" : "❌"}</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{r.sentence}</p>
                          {!r.correct && (
                            <p className="text-sm text-red-500 mt-1">Your answer: {r.userAnswer}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button className="w-full" onClick={() => setPhase("setup")}>
                Practice Again
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {!history.data?.length ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-4xl mb-3">📝</div>
                <h3 className="font-semibold">No dictation history yet</h3>
                <p className="text-muted-foreground text-sm mt-1">Complete your first dictation exercise to see results here</p>
              </CardContent>
            </Card>
          ) : (
            history.data.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Level {entry.cefrLevel}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleDateString()} — {entry.correctSentences}/{entry.totalSentences} correct
                      </p>
                    </div>
                    <Badge variant={(entry.accuracy ?? 0) >= 70 ? "default" : "secondary"}>
                      {entry.accuracy ?? 0}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
