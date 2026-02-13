import { useState, useEffect, useCallback, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ExamType = "reading" | "writing" | "oral";
type Phase = "select" | "generating" | "exam" | "results";

interface Question {
  prompt: string;
  options: string[];
  correctAnswer: string;
  scenario?: string;
}

interface Passage {
  title: string;
  text: string;
  questions: Question[];
}

export default function MockSLEExam() {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<Phase>("select");
  const [examType, setExamType] = useState<ExamType>("reading");
  const [cefrLevel, setCefrLevel] = useState("B1");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [passages, setPassages] = useState<Passage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("new");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const history = trpc.mockSle.getHistory.useQuery();
  const createExam = trpc.mockSle.create.useMutation();
  const completeExam = trpc.mockSle.complete.useMutation();
  const generateQuestions = trpc.mockSle.generateQuestions.useMutation();

  const timeLimits: Record<ExamType, number> = { reading: 5400, writing: 5400, oral: 3600 };

  const handleStart = async () => {
    setPhase("generating");
    try {
      const result = await generateQuestions.mutateAsync({ examType, cefrLevel });
      if (!result) { toast.error("Failed to generate exam"); setPhase("select"); return; }

      if (examType === "reading" && result.passages) {
        setPassages(result.passages);
        const allQ = result.passages.flatMap((p: Passage) => p.questions);
        setQuestions(allQ);
      } else if (examType === "oral" && result.questions) {
        setQuestions(result.questions);
      } else if (examType === "writing" && result.prompts) {
        setQuestions(result.prompts.map((p: any) => ({
          prompt: `${p.type}: ${p.scenario}\n\n${p.instructions}`,
          options: [],
          correctAnswer: "",
        })));
      }

      await createExam.mutateAsync({ examType, cefrLevel });
      setTimeLeft(timeLimits[examType]);
      setCurrentIndex(0);
      setAnswers({});
      setScore(null);
      setPhase("exam");
    } catch {
      toast.error("Failed to generate exam");
      setPhase("select");
    }
  };

  useEffect(() => {
    if (phase !== "exam" || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const handleSubmit = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    const finalScore = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    setScore(finalScore);
    setPhase("results");
    history.refetch();
  }, [questions, answers]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const examTypeConfig = {
    reading: { icon: "📖", label: "Reading Comprehension", labelFr: "Compréhension écrite", desc: "Read passages and answer questions", time: "90 min" },
    writing: { icon: "✍️", label: "Written Expression", labelFr: "Expression écrite", desc: "Write responses to prompts", time: "90 min" },
    oral: { icon: "🎧", label: "Oral Comprehension", labelFr: "Compréhension orale", desc: "Listen and answer questions", time: "60 min" },
  };

  const levels = ["A1", "A2", "B1", "B2", "C1"];

  return (
    <div className="container max-w-5xl py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mock SLE Exams</h1>
        <p className="text-muted-foreground mt-1">Simulate the official Second Language Evaluation under timed conditions</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="new">New Exam</TabsTrigger>
          <TabsTrigger value="history">History ({history.data?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-6">
          {phase === "select" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(Object.entries(examTypeConfig) as [ExamType, typeof examTypeConfig.reading][]).map(([type, config]) => (
                  <Card
                    key={type}
                    className={`cursor-pointer transition-all hover:shadow-md ${examType === type ? "ring-2 ring-primary" : ""}`}
                    onClick={() => setExamType(type)}
                  >
                    <CardContent className="pt-6 text-center space-y-3">
                      <div className="text-4xl">{config.icon}</div>
                      <h3 className="font-semibold">{config.label}</h3>
                      <p className="text-sm text-muted-foreground">{config.labelFr}</p>
                      <p className="text-xs text-muted-foreground">{config.desc}</p>
                      <Badge variant="outline">{config.time}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader><CardTitle className="text-lg">Select CEFR Level</CardTitle></CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              <Button size="lg" className="w-full" onClick={handleStart}>
                Start {examTypeConfig[examType].label} — Level {cefrLevel}
              </Button>
            </>
          )}

          {phase === "generating" && (
            <Card>
              <CardContent className="py-16 text-center space-y-4">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <h3 className="text-lg font-semibold">Generating Your Exam...</h3>
                <p className="text-muted-foreground">AI is creating a personalized {examType} exam at {cefrLevel} level</p>
              </CardContent>
            </Card>
          )}

          {phase === "exam" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-card p-4 rounded-lg border sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{examTypeConfig[examType].label}</Badge>
                  <Badge>{cefrLevel}</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {currentIndex + 1} / {questions.length}
                  </span>
                  <Badge variant={timeLeft < 300 ? "destructive" : "outline"} className="text-lg px-3 py-1">
                    ⏱ {formatTime(timeLeft)}
                  </Badge>
                </div>
              </div>

              {questions[currentIndex] && (
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    {questions[currentIndex].scenario && (
                      <div className="bg-muted p-4 rounded-lg text-sm italic">
                        {questions[currentIndex].scenario}
                      </div>
                    )}
                    <h3 className="text-lg font-medium">{questions[currentIndex].prompt}</h3>
                    {questions[currentIndex].options?.length > 0 && (
                      <div className="space-y-3">
                        {questions[currentIndex].options.map((opt, oi) => (
                          <button
                            key={oi}
                            onClick={() => setAnswers(prev => ({ ...prev, [currentIndex]: opt }))}
                            className={`w-full text-left p-4 rounded-lg border transition-all ${
                              answers[currentIndex] === opt
                                ? "border-primary bg-primary/10 ring-1 ring-primary"
                                : "hover:border-primary/50"
                            }`}
                          >
                            <span className="font-medium mr-2">{String.fromCharCode(65 + oi)}.</span>
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                    {examType === "writing" && (
                      <textarea
                        className="w-full h-48 p-4 border rounded-lg bg-background resize-none focus:ring-2 focus:ring-primary"
                        placeholder="Write your response here..."
                        value={answers[currentIndex] || ""}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [currentIndex]: e.target.value }))}
                      />
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                >
                  Previous
                </Button>
                {currentIndex < questions.length - 1 ? (
                  <Button onClick={() => setCurrentIndex(currentIndex + 1)}>Next</Button>
                ) : (
                  <Button variant="destructive" onClick={handleSubmit}>Submit Exam</Button>
                )}
              </div>

              <div className="flex gap-1 flex-wrap">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-8 h-8 rounded text-xs font-medium transition-all ${
                      i === currentIndex
                        ? "bg-primary text-primary-foreground"
                        : answers[i]
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === "results" && score !== null && (
            <Card>
              <CardContent className="py-12 text-center space-y-6">
                <div className="text-6xl">{score >= 70 ? "🎉" : score >= 50 ? "📊" : "📚"}</div>
                <h2 className="text-3xl font-bold">{score}%</h2>
                <p className="text-lg text-muted-foreground">
                  {score >= 70 ? "Excellent! You passed!" : score >= 50 ? "Good effort! Keep practicing." : "Keep studying — you'll get there!"}
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Badge variant="secondary">{examTypeConfig[examType].label}</Badge>
                  <Badge>{cefrLevel}</Badge>
                  <Badge variant="outline">
                    {Object.values(answers).filter(Boolean).length} / {questions.length} answered
                  </Badge>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => { setPhase("select"); setActiveTab("history"); }}>
                    View History
                  </Button>
                  <Button onClick={() => setPhase("select")}>Take Another Exam</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {!history.data?.length ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-4xl mb-3">📝</div>
                <h3 className="font-semibold">No exams taken yet</h3>
                <p className="text-muted-foreground text-sm mt-1">Start your first mock SLE exam to see results here</p>
              </CardContent>
            </Card>
          ) : (
            history.data.map((exam) => (
              <Card key={exam.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{examTypeConfig[exam.examType as ExamType]?.icon}</span>
                      <div>
                        <h4 className="font-medium">{examTypeConfig[exam.examType as ExamType]?.label}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(exam.createdAt).toLocaleDateString()} — Level {exam.cefrLevel}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {exam.score !== null && (
                        <Badge variant={exam.score >= 70 ? "default" : "secondary"}>
                          {exam.score}%
                        </Badge>
                      )}
                      <Badge variant="outline">{exam.status}</Badge>
                    </div>
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
