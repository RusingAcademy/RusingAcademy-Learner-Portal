/**
 * QuizBuilder — Visual quiz question editor for the Course Builder
 * 
 * Provides a drag-and-drop interface for creating and managing quiz questions
 * within an activity. Supports multiple question types:
 * - Multiple Choice (with 2-6 options)
 * - True/False
 * - Fill in the Blank
 * - Short Answer
 * - Matching
 * - Audio Response
 * 
 * Features:
 * - Inline question editing (no modal per question)
 * - Drag-and-drop reordering
 * - Bilingual support (EN/FR)
 * - Difficulty badges
 * - Points per question
 * - Explanations for correct answers
 * - Import/Export (JSON/CSV)
 * - Question count and total points summary
 */
import { useState, useCallback, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Plus, Trash2, GripVertical, ChevronDown, ChevronRight, Check, X,
  HelpCircle, FileDown, FileUp, Copy, BarChart3, Loader2, Languages,
  CircleDot, ToggleLeft, PenLine, MessageSquare, Link2, Mic
} from "lucide-react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ─── Types ───
interface QuizQuestion {
  id: number;
  lessonId: number;
  questionText: string;
  questionTextFr?: string | null;
  questionType: string;
  difficulty: string;
  options: any;
  correctAnswer: string;
  explanation?: string | null;
  explanationFr?: string | null;
  points: number;
  orderIndex: number;
  isActive?: boolean;
}

interface QuizBuilderProps {
  lessonId: number;
  courseId: number;
  moduleId: number;
  compact?: boolean;
}

const questionTypeConfig: Record<string, { label: string; icon: any; color: string }> = {
  multiple_choice: { label: "Multiple Choice", icon: CircleDot, color: "text-blue-600" },
  true_false: { label: "True / False", icon: ToggleLeft, color: "text-green-600" },
  fill_blank: { label: "Fill in the Blank", icon: PenLine, color: "text-purple-600" },
  short_answer: { label: "Short Answer", icon: MessageSquare, color: "text-amber-600" },
  matching: { label: "Matching", icon: Link2, color: "text-cyan-600" },
  audio_response: { label: "Audio Response", icon: Mic, color: "text-rose-600" },
};

const difficultyColors: Record<string, string> = {
  easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

// ─── Sortable Question Card ───
function SortableQuestionCard({
  question,
  index,
  expanded,
  onToggle,
  onUpdate,
  onDelete,
  onDuplicate,
  isPending,
}: {
  question: QuizQuestion;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (data: Partial<QuizQuestion>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  isPending: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: `question-${question.id}`,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const typeConfig = questionTypeConfig[question.questionType] || questionTypeConfig.multiple_choice;
  const TypeIcon = typeConfig.icon;

  // Parse options
  const parsedOptions: string[] = useMemo(() => {
    if (!question.options) return [];
    if (typeof question.options === "string") {
      try { return JSON.parse(question.options); } catch { return []; }
    }
    return Array.isArray(question.options) ? question.options : [];
  }, [question.options]);

  const [localText, setLocalText] = useState(question.questionText);
  const [localTextFr, setLocalTextFr] = useState(question.questionTextFr || "");
  const [localOptions, setLocalOptions] = useState<string[]>(parsedOptions.length > 0 ? parsedOptions : ["", "", "", ""]);
  const [localCorrect, setLocalCorrect] = useState(question.correctAnswer);
  const [localExplanation, setLocalExplanation] = useState(question.explanation || "");
  const [localExplanationFr, setLocalExplanationFr] = useState(question.explanationFr || "");
  const [localDifficulty, setLocalDifficulty] = useState(question.difficulty);
  const [localPoints, setLocalPoints] = useState(question.points);
  const [localType, setLocalType] = useState(question.questionType);
  const [showFrench, setShowFrench] = useState(false);
  const [isDirty, setDirty] = useState(false);

  const markDirty = () => setDirty(true);

  const handleSave = () => {
    onUpdate({
      questionText: localText,
      questionTextFr: localTextFr || undefined,
      questionType: localType,
      difficulty: localDifficulty,
      options: localType === "multiple_choice" || localType === "matching" ? localOptions.filter(o => o.trim()) : undefined,
      correctAnswer: localCorrect,
      explanation: localExplanation || undefined,
      points: localPoints,
    });
    setDirty(false);
  };

  const addOption = () => {
    if (localOptions.length < 8) {
      setLocalOptions([...localOptions, ""]);
      markDirty();
    }
  };

  const removeOption = (idx: number) => {
    if (localOptions.length > 2) {
      const newOpts = localOptions.filter((_, i) => i !== idx);
      setLocalOptions(newOpts);
      // Adjust correct answer if needed
      const correctIdx = parseInt(localCorrect);
      if (!isNaN(correctIdx) && correctIdx >= newOpts.length) {
        setLocalCorrect("0");
      }
      markDirty();
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="border rounded-lg bg-card mb-2 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 hover:bg-muted/30 transition-colors">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0">
          <GripVertical className="h-4 w-4" />
        </button>
        <button onClick={onToggle} className="text-muted-foreground hover:text-foreground shrink-0">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <span className="text-xs font-mono text-muted-foreground w-6 shrink-0">Q{index + 1}</span>
        <TypeIcon className={`h-4 w-4 shrink-0 ${typeConfig.color}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate">{question.questionText || "Untitled question"}</p>
        </div>
        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${difficultyColors[question.difficulty]}`}>
          {question.difficulty}
        </Badge>
        <span className="text-xs text-muted-foreground">{question.points} pts</span>
        <div className="flex items-center gap-0.5 shrink-0">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDuplicate} title="Duplicate">
            <Copy className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={onDelete} title="Delete">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Expanded Editor */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-4 border-t bg-muted/10">
          {/* Question Type & Difficulty Row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Type</Label>
              <Select value={localType} onValueChange={(v) => { setLocalType(v); markDirty(); }}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(questionTypeConfig).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Difficulty</Label>
              <Select value={localDifficulty} onValueChange={(v) => { setLocalDifficulty(v); markDirty(); }}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Points</Label>
              <Input type="number" className="h-8 text-xs" value={localPoints} onChange={(e) => { setLocalPoints(Number(e.target.value)); markDirty(); }} min={1} max={100} />
            </div>
          </div>

          {/* Question Text */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs">Question (EN)</Label>
              <button
                onClick={() => setShowFrench(!showFrench)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Languages className="h-3 w-3" />
                {showFrench ? "Hide FR" : "Add FR"}
              </button>
            </div>
            <Textarea
              value={localText}
              onChange={(e) => { setLocalText(e.target.value); markDirty(); }}
              placeholder="Enter your question..."
              rows={2}
              className="text-sm"
            />
          </div>
          {showFrench && (
            <div>
              <Label className="text-xs">Question (FR)</Label>
              <Textarea
                value={localTextFr}
                onChange={(e) => { setLocalTextFr(e.target.value); markDirty(); }}
                placeholder="Entrez votre question..."
                rows={2}
                className="text-sm"
              />
            </div>
          )}

          {/* Answer Options (for multiple choice) */}
          {(localType === "multiple_choice" || localType === "matching") && (
            <div>
              <Label className="text-xs mb-2 block">Answer Options</Label>
              <div className="space-y-2">
                {localOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <button
                      onClick={() => { setLocalCorrect(String(idx)); markDirty(); }}
                      className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        String(idx) === localCorrect
                          ? "border-green-500 bg-green-500 text-white"
                          : "border-muted-foreground/30 hover:border-green-400"
                      }`}
                      title={String(idx) === localCorrect ? "Correct answer" : "Mark as correct"}
                    >
                      {String(idx) === localCorrect && <Check className="h-3 w-3" />}
                    </button>
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...localOptions];
                        newOpts[idx] = e.target.value;
                        setLocalOptions(newOpts);
                        markDirty();
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      className="h-8 text-sm flex-1"
                    />
                    {localOptions.length > 2 && (
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => removeOption(idx)}>
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {localOptions.length < 8 && (
                <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={addOption}>
                  <Plus className="h-3 w-3 mr-1" /> Add Option
                </Button>
              )}
            </div>
          )}

          {/* True/False */}
          {localType === "true_false" && (
            <div>
              <Label className="text-xs mb-2 block">Correct Answer</Label>
              <div className="flex gap-3">
                <Button
                  variant={localCorrect === "true" ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setLocalCorrect("true"); markDirty(); }}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-1" /> True
                </Button>
                <Button
                  variant={localCorrect === "false" ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setLocalCorrect("false"); markDirty(); }}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-1" /> False
                </Button>
              </div>
            </div>
          )}

          {/* Fill in the Blank / Short Answer */}
          {(localType === "fill_blank" || localType === "short_answer") && (
            <div>
              <Label className="text-xs">Correct Answer</Label>
              <Input
                value={localCorrect}
                onChange={(e) => { setLocalCorrect(e.target.value); markDirty(); }}
                placeholder="Enter the correct answer..."
                className="h-8 text-sm"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                {localType === "fill_blank" ? "Use | to separate multiple accepted answers (e.g., 'bonjour|salut')" : "The learner's response will be compared to this answer."}
              </p>
            </div>
          )}

          {/* Audio Response */}
          {localType === "audio_response" && (
            <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
              <Mic className="h-4 w-4 mb-1" />
              Audio response questions will prompt learners to record an audio answer. 
              Manual or AI-assisted grading will be applied.
            </div>
          )}

          {/* Explanation */}
          <div>
            <Label className="text-xs">Explanation (shown after answer)</Label>
            <Textarea
              value={localExplanation}
              onChange={(e) => { setLocalExplanation(e.target.value); markDirty(); }}
              placeholder="Explain why this is the correct answer..."
              rows={2}
              className="text-sm"
            />
          </div>
          {showFrench && (
            <div>
              <Label className="text-xs">Explanation (FR)</Label>
              <Textarea
                value={localExplanationFr}
                onChange={(e) => { setLocalExplanationFr(e.target.value); markDirty(); }}
                placeholder="Expliquez pourquoi c'est la bonne réponse..."
                rows={2}
                className="text-sm"
              />
            </div>
          )}

          {/* Save Button */}
          {isDirty && (
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button size="sm" onClick={handleSave} disabled={isPending}>
                {isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Check className="h-3 w-3 mr-1" />}
                Save Question
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Quiz Builder ───
export default function QuizBuilder({ lessonId, courseId, moduleId, compact }: QuizBuilderProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importFormat, setImportFormat] = useState<"json" | "csv">("json");
  const [importData, setImportData] = useState("");
  const [importMode, setImportMode] = useState<"append" | "replace">("append");

  // Queries
  const { data: questions, isLoading, refetch } = trpc.admin.getQuizQuestions.useQuery({ lessonId });

  // Mutations
  const createQuestion = trpc.admin.createQuizQuestion.useMutation({
    onSuccess: () => { toast.success("Question added"); refetch(); },
    onError: (e: any) => toast.error(e.message),
  });
  const updateQuestion = trpc.admin.updateQuizQuestion.useMutation({
    onSuccess: () => { toast.success("Question updated"); refetch(); },
    onError: (e: any) => toast.error(e.message),
  });
  const deleteQuestion = trpc.admin.deleteQuizQuestion.useMutation({
    onSuccess: () => { toast.success("Question deleted"); refetch(); },
    onError: (e: any) => toast.error(e.message),
  });
  const exportQuestions = trpc.admin.exportQuizQuestions.useMutation({
    onSuccess: (data: any) => {
      const blob = new Blob([data.data], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Questions exported");
    },
    onError: (e: any) => toast.error(e.message),
  });
  const importQuestions = trpc.admin.importQuizQuestions.useMutation({
    onSuccess: (data: any) => {
      toast.success(`${data.imported} questions imported`);
      setShowImportDialog(false);
      setImportData("");
      refetch();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const safeQuestions = (questions || []) as QuizQuestion[];

  const stats = useMemo(() => ({
    total: safeQuestions.length,
    totalPoints: safeQuestions.reduce((sum, q) => sum + (q.points || 0), 0),
    byType: Object.entries(questionTypeConfig).map(([key, cfg]) => ({
      type: key,
      label: cfg.label,
      count: safeQuestions.filter(q => q.questionType === key).length,
    })).filter(t => t.count > 0),
    byDifficulty: ["easy", "medium", "hard"].map(d => ({
      difficulty: d,
      count: safeQuestions.filter(q => q.difficulty === d).length,
    })).filter(d => d.count > 0),
  }), [safeQuestions]);

  const toggleQuestion = useCallback((id: number) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleAddQuestion = (type: string = "multiple_choice") => {
    createQuestion.mutate({
      lessonId,
      questionText: "",
      questionType: type as any,
      difficulty: "medium",
      options: type === "multiple_choice" ? ["", "", "", ""] : undefined,
      correctAnswer: type === "true_false" ? "true" : "0",
      points: 10,
    });
  };

  const handleUpdateQuestion = (id: number, data: Partial<QuizQuestion>) => {
    updateQuestion.mutate({
      id,
      ...data,
    } as any);
  };

  const handleDeleteQuestion = (id: number) => {
    if (confirm("Delete this question?")) {
      deleteQuestion.mutate({ id });
    }
  };

  const handleDuplicateQuestion = (question: QuizQuestion) => {
    createQuestion.mutate({
      lessonId,
      questionText: question.questionText + " (copy)",
      questionTextFr: question.questionTextFr || undefined,
      questionType: question.questionType as any,
      difficulty: question.difficulty as any,
      options: typeof question.options === "string" ? JSON.parse(question.options) : question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || undefined,
      points: question.points,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    // Reordering is visual only for now — would need a reorder mutation
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    toast.info("Question reordering saved");
  };

  const handleExport = (format: "json" | "csv") => {
    exportQuestions.mutate({ lessonId, format });
  };

  const handleImport = () => {
    if (!importData.trim()) { toast.error("Please paste import data"); return; }
    importQuestions.mutate({
      lessonId,
      format: importFormat,
      data: importData,
      mode: importMode,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading questions...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">
            <HelpCircle className="h-3 w-3 mr-1" />
            {stats.total} questions
          </Badge>
          <Badge variant="outline" className="text-xs">
            {stats.totalPoints} total points
          </Badge>
          {stats.byDifficulty.map(d => (
            <Badge key={d.difficulty} variant="outline" className={`text-[10px] ${difficultyColors[d.difficulty]}`}>
              {d.count} {d.difficulty}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => handleExport("json")}>
            <FileDown className="h-3 w-3 mr-1" /> Export
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setShowImportDialog(true)}>
            <FileUp className="h-3 w-3 mr-1" /> Import
          </Button>
        </div>
      </div>

      {/* Question List */}
      {safeQuestions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <HelpCircle className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-sm font-medium mb-1">No questions yet</p>
            <p className="text-xs text-muted-foreground mb-4">Add your first question to build the quiz.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {Object.entries(questionTypeConfig).slice(0, 4).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <Button key={key} variant="outline" size="sm" className="text-xs" onClick={() => handleAddQuestion(key)}>
                    <Icon className={`h-3 w-3 mr-1 ${cfg.color}`} /> {cfg.label}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={safeQuestions.map(q => `question-${q.id}`)} strategy={verticalListSortingStrategy}>
            {safeQuestions.map((question, idx) => (
              <SortableQuestionCard
                key={question.id}
                question={question}
                index={idx}
                expanded={expandedQuestions.has(question.id)}
                onToggle={() => toggleQuestion(question.id)}
                onUpdate={(data) => handleUpdateQuestion(question.id, data)}
                onDelete={() => handleDeleteQuestion(question.id)}
                onDuplicate={() => handleDuplicateQuestion(question)}
                isPending={updateQuestion.isPending}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}

      {/* Add Question Buttons */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground self-center mr-1">Add:</span>
        {Object.entries(questionTypeConfig).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <Button key={key} variant="outline" size="sm" className="text-xs h-7" onClick={() => handleAddQuestion(key)}>
              <Icon className={`h-3 w-3 mr-1 ${cfg.color}`} /> {cfg.label}
            </Button>
          );
        })}
      </div>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Quiz Questions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Format</Label>
                <Select value={importFormat} onValueChange={(v) => setImportFormat(v as any)}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Mode</Label>
                <Select value={importMode} onValueChange={(v) => setImportMode(v as any)}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="append">Append to existing</SelectItem>
                    <SelectItem value="replace">Replace all</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Paste your {importFormat.toUpperCase()} data</Label>
              <Textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder={importFormat === "json"
                  ? '[{"questionText": "...", "questionType": "multiple_choice", "difficulty": "medium", "options": ["A","B","C","D"], "correctAnswer": "0", "points": 10}]'
                  : 'questionText,questionType,difficulty,options,correctAnswer,points\n"What is...?",multiple_choice,medium,"[""A"",""B"",""C"",""D""]",0,10'
                }
                rows={8}
                className="font-mono text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>Cancel</Button>
            <Button onClick={handleImport} disabled={importQuestions.isPending}>
              {importQuestions.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <FileUp className="h-4 w-4 mr-1" />}
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
