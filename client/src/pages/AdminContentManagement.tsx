import { useState, useMemo, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  BookOpen,
  Layers,
  FileText,
  HelpCircle,
  Search,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  Download,
  Upload,
  BarChart3,
  Check,
  X,
  Save,
  GripVertical,
  Copy,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { toast } from "sonner";

// Sortable Question Item Component
function SortableQuestionItem({
  question,
  index,
  onEdit,
  onDelete,
}: {
  question: any;
  index: number;
  onEdit: (q: any) => void;
  onDelete: (id: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 rounded-lg bg-muted/50 border ${isDragging ? 'ring-2 ring-primary' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
          <p className="font-medium text-sm line-clamp-2">
            {index + 1}. {question.questionText?.substring(0, 50)}...
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => onEdit(question)}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-destructive"
            onClick={() => onDelete(question.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2 ml-8">
        <Badge variant="outline" className="text-xs">
          {question.questionType}
        </Badge>
        <Badge
          variant="secondary"
          className={`text-xs ${
            question.difficulty === "easy"
              ? "bg-green-100 text-green-700"
              : question.difficulty === "hard"
              ? "bg-red-100 text-red-700"
              : ""
          }`}
        >
          {question.difficulty}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {question.points} pts
        </span>
      </div>
    </div>
  );
}

export default function AdminContentManagement() {
  const { user, loading: authLoading, isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  
  // Selection state
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialog state
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [selectedTargetLessonId, setSelectedTargetLessonId] = useState<number | null>(null);
  
  // Inline editing state
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [editingModuleId, setEditingModuleId] = useState<number | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  
  // Import state
  const [importFormat, setImportFormat] = useState<"json" | "csv">("json");
  const [importMode, setImportMode] = useState<"append" | "replace">("append");
  const [importData, setImportData] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Question form state
  const [questionForm, setQuestionForm] = useState({
    questionText: "",
    questionTextFr: "",
    questionType: "multiple_choice" as "multiple_choice" | "true_false" | "fill_in_blank",
    difficulty: "medium" as "easy" | "medium" | "hard",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
    points: 10,
  });
  
  // Queries
  const { data: courses, isLoading: coursesLoading, refetch: refetchCourses } = trpc.courses.list.useQuery();
  
  const { data: modules, isLoading: modulesLoading, refetch: refetchModules } = trpc.courses.getModules.useQuery(
    { courseId: selectedCourseId! },
    { enabled: !!selectedCourseId }
  );
  
  const { data: lessons, isLoading: lessonsLoading, refetch: refetchLessons } = trpc.lessons.getByModule.useQuery(
    { moduleId: selectedModuleId! },
    { enabled: !!selectedModuleId }
  );
  
  const { data: questions, isLoading: questionsLoading, refetch: refetchQuestions } = trpc.admin.getQuizQuestions.useQuery(
    { lessonId: selectedLessonId! },
    { enabled: !!selectedLessonId }
  );
  
  const { data: questionStats, refetch: refetchStats } = trpc.admin.getQuizQuestionStats.useQuery(
    { lessonId: selectedLessonId! },
    { enabled: !!selectedLessonId && isStatsDialogOpen }
  );
  
  const { data: quizLessons } = trpc.admin.getQuizLessons.useQuery(
    undefined,
    { enabled: isDuplicateDialogOpen }
  );
  
  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Mutations
  const createQuestionMutation = trpc.admin.createQuizQuestion.useMutation({
    onSuccess: () => {
      toast.success("Question created successfully");
      setIsQuestionDialogOpen(false);
      refetchQuestions();
      resetQuestionForm();
    },
    onError: (error) => {
      toast.error(`Failed to create question: ${error.message}`);
    },
  });
  
  const updateQuestionMutation = trpc.admin.updateQuizQuestion.useMutation({
    onSuccess: () => {
      toast.success("Question updated successfully");
      setIsQuestionDialogOpen(false);
      refetchQuestions();
      resetQuestionForm();
    },
    onError: (error) => {
      toast.error(`Failed to update question: ${error.message}`);
    },
  });
  
  const deleteQuestionMutation = trpc.admin.deleteQuizQuestion.useMutation({
    onSuccess: () => {
      toast.success("Question deleted successfully");
      refetchQuestions();
    },
    onError: (error) => {
      toast.error(`Failed to delete question: ${error.message}`);
    },
  });
  
  const importQuestionsMutation = trpc.admin.importQuizQuestions.useMutation({
    onSuccess: (result) => {
      toast.success(`Imported ${result.imported} questions successfully`);
      setIsImportDialogOpen(false);
      setImportData("");
      refetchQuestions();
    },
    onError: (error) => {
      toast.error(`Import failed: ${error.message}`);
    },
  });
  
  const updateCourseMutation = trpc.admin.updateCourse.useMutation({
    onSuccess: () => {
      toast.success("Course updated");
      setEditingCourseId(null);
      refetchCourses();
    },
    onError: (error) => toast.error(`Failed: ${error.message}`),
  });
  
  const updateModuleMutation = trpc.admin.updateModule.useMutation({
    onSuccess: () => {
      toast.success("Module updated");
      setEditingModuleId(null);
      refetchModules();
    },
    onError: (error) => toast.error(`Failed: ${error.message}`),
  });
  
  const updateLessonMutation = trpc.admin.updateLesson.useMutation({
    onSuccess: () => {
      toast.success("Lesson updated");
      setEditingLessonId(null);
      refetchLessons();
    },
    onError: (error) => toast.error(`Failed: ${error.message}`),
  });
  
  const reorderQuestionsMutation = trpc.admin.reorderQuizQuestions.useMutation({
    onSuccess: () => {
      toast.success("Questions reordered");
      refetchQuestions();
    },
    onError: (error) => toast.error(`Failed to reorder: ${error.message}`),
  });
  
  const duplicateQuizMutation = trpc.admin.duplicateQuiz.useMutation({
    onSuccess: (result) => {
      toast.success(`Duplicated ${result.copiedCount} questions successfully`);
      setIsDuplicateDialogOpen(false);
      setSelectedTargetLessonId(null);
    },
    onError: (error) => toast.error(`Failed to duplicate: ${error.message}`),
  });
  
  // Computed values
  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    if (!searchQuery) return courses;
    return courses.filter((course: any) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [courses, searchQuery]);
  
  const selectedCourse = courses?.find((c: any) => c.id === selectedCourseId);
  const selectedModule = modules?.find((m: any) => m.id === selectedModuleId);
  const selectedLesson = lessons?.find((l: any) => l.id === selectedLessonId);
  
  // Handlers
  const resetQuestionForm = () => {
    setQuestionForm({
      questionText: "",
      questionTextFr: "",
      questionType: "multiple_choice",
      difficulty: "medium",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
      points: 10,
    });
    setEditingQuestion(null);
  };
  
  const handleQuestionSubmit = () => {
    if (!selectedLessonId) return;
    
    const questionData = {
      lessonId: selectedLessonId,
      questionText: questionForm.questionText,
      questionTextFr: questionForm.questionTextFr || undefined,
      questionType: questionForm.questionType as "multiple_choice" | "true_false" | "fill_blank" | "matching" | "short_answer" | "audio_response",
      difficulty: questionForm.difficulty as "easy" | "medium" | "hard",
      options: questionForm.questionType === "multiple_choice" 
        ? questionForm.options.filter(o => o.trim() !== "")
        : questionForm.questionType === "true_false"
        ? ["True", "False"]
        : [],
      correctAnswer: questionForm.correctAnswer,
      explanation: questionForm.explanation || undefined,
      points: questionForm.points,
    };
    
    if (editingQuestion) {
      // @ts-ignore - TS2345
      updateQuestionMutation.mutate({ id: editingQuestion.id, ...questionData });
    } else {
      // @ts-ignore - TS2345
      createQuestionMutation.mutate(questionData);
    }
  };
  
  const handleEditQuestion = (question: any) => {
    setEditingQuestion(question);
    let parsedOptions = ["", "", "", ""];
    try {
      const opts = typeof question.options === 'string' ? JSON.parse(question.options) : question.options;
      if (Array.isArray(opts)) {
        parsedOptions = [...opts, "", "", "", ""].slice(0, 4);
      }
    } catch {}
    
    setQuestionForm({
      questionText: question.questionText || "",
      questionTextFr: question.questionTextFr || "",
      questionType: question.questionType || "multiple_choice",
      difficulty: question.difficulty || "medium",
      options: parsedOptions,
      correctAnswer: question.correctAnswer || 0,
      explanation: question.explanation || "",
      points: question.points || 10,
    });
    setIsQuestionDialogOpen(true);
  };
  
  const handleDeleteQuestion = (questionId: number) => {
    if (confirm("Are you sure you want to delete this question?")) {
      deleteQuestionMutation.mutate({ id: questionId });
    }
  };
  
  const handleExport = async (format: "json" | "csv") => {
    if (!selectedLessonId) return;
    
    try {
      const result = await (trpc.admin.exportQuizQuestions as any).query({ lessonId: selectedLessonId, format });
      const blob = new Blob([result.data], { type: format === "json" ? "application/json" : "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${questions?.length || 0} questions as ${format.toUpperCase()}`);
    } catch (error: any) {
      toast.error(`Export failed: ${error.message}`);
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setImportData(event.target?.result as string);
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'csv') setImportFormat('csv');
      else setImportFormat('json');
    };
    reader.readAsText(file);
  };
  
  const handleImport = () => {
    if (!selectedLessonId || !importData) return;
    importQuestionsMutation.mutate({
      lessonId: selectedLessonId,
      format: importFormat,
      data: importData,
      mode: importMode,
    });
  };
  
  const startEditCourse = (course: any) => {
    setEditingCourseId(course.id);
    setEditValue(course.title);
  };
  
  const saveEditCourse = () => {
    if (editingCourseId && editValue.trim()) {
      // @ts-ignore - TS2353
      updateCourseMutation.mutate({ id: editingCourseId, title: editValue.trim() });
    }
  };
  
  const startEditModule = (module: any) => {
    setEditingModuleId(module.id);
    setEditValue(module.title);
  };
  
  const saveEditModule = () => {
    if (editingModuleId && editValue.trim()) {
      // @ts-ignore - TS2353
      updateModuleMutation.mutate({ id: editingModuleId, title: editValue.trim() });
    }
  };
  
  const startEditLesson = (lesson: any) => {
    setEditingLessonId(lesson.id);
    setEditValue(lesson.title);
  };
  
  const saveEditLesson = () => {
    if (editingLessonId && editValue.trim()) {
      // @ts-ignore - TS2353
      updateLessonMutation.mutate({ id: editingLessonId, title: editValue.trim() });
    }
  };
  
  const cancelEdit = () => {
    setEditingCourseId(null);
    setEditingModuleId(null);
    setEditingLessonId(null);
    setEditValue("");
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !selectedLessonId || !questions) return;
    
    const oldIndex = questions.findIndex((q: any) => q.id === active.id);
    const newIndex = questions.findIndex((q: any) => q.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(questions, oldIndex, newIndex);
      reorderQuestionsMutation.mutate({
        lessonId: selectedLessonId,
        questionIds: newOrder.map((q: any) => q.id),
      });
    }
  };
  
  const handleDuplicateQuiz = () => {
    if (!selectedLessonId || !selectedTargetLessonId) return;
    duplicateQuizMutation.mutate({
      sourceLessonId: selectedLessonId,
      targetLessonId: selectedTargetLessonId,
    });
  };
  
  // Chart data for statistics
  const difficultyChartData = useMemo(() => {
    if (!questionStats?.questions) return [];
    const counts = { easy: 0, medium: 0, hard: 0 };
    questionStats.questions.forEach((q: any) => {
      counts[q.difficulty as keyof typeof counts]++;
    });
    return [
      { name: 'Easy', value: counts.easy, fill: '#22c55e' },
      { name: 'Medium', value: counts.medium, fill: '#eab308' },
      { name: 'Hard', value: counts.hard, fill: '#ef4444' },
    ];
  }, [questionStats]);
  
  const successRateByDifficulty = useMemo(() => {
    if (!questionStats?.questions) return [];
    const groups: { [key: string]: { total: number; sum: number } } = {
      easy: { total: 0, sum: 0 },
      medium: { total: 0, sum: 0 },
      hard: { total: 0, sum: 0 },
    };
    questionStats.questions.forEach((q: any) => {
      groups[q.difficulty].total++;
      groups[q.difficulty].sum += q.successRate;
    });
    return [
      { name: 'Easy', rate: groups.easy.total > 0 ? Math.round(groups.easy.sum / groups.easy.total) : 0 },
      { name: 'Medium', rate: groups.medium.total > 0 ? Math.round(groups.medium.sum / groups.medium.total) : 0 },
      { name: 'Hard', rate: groups.hard.total > 0 ? Math.round(groups.hard.sum / groups.hard.total) : 0 },
    ];
  }, [questionStats]);
  
  // Auth checks
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }
  
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              You don't have permission to access this page.
            </p>
            <Link href="/">
              <Button className="w-full mt-4">Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/admin" className="hover:text-foreground">Admin</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Content Management</span>
        </nav>
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Content Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage courses, modules, lessons, and quiz questions
            </p>
          </div>
          <Button onClick={() => refetchCourses()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-500/20">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Courses</p>
                  <p className="text-2xl font-bold">{courses?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500/20">
                  <Layers className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Modules</p>
                  <p className="text-2xl font-bold">{modules?.length || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-500/20">
                  <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lessons</p>
                  <p className="text-2xl font-bold">{lessons?.length || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-amber-500/20">
                  <HelpCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quiz Questions</p>
                  <p className="text-2xl font-bold">{questions?.length || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Courses Column */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Courses
                </CardTitle>
                <Badge variant="secondary">{filteredCourses.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {coursesLoading ? (
                  <div className="text-center py-4 text-muted-foreground">Loading...</div>
                ) : filteredCourses.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No courses found</div>
                ) : (
                  filteredCourses.map((course: any) => (
                    <div key={course.id} className="group">
                      {editingCourseId === course.id ? (
                        <div className="p-2 rounded-lg bg-muted/50 border-2 border-primary">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="mb-2"
                            autoFocus
                          />
                          <div className="flex gap-1">
                            <Button size="sm" onClick={saveEditCourse} disabled={updateCourseMutation.isPending}>
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedCourseId(course.id);
                            setSelectedModuleId(null);
                            setSelectedLessonId(null);
                          }}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedCourseId === course.id
                              ? "bg-primary/10 border-2 border-primary"
                              : "bg-muted/50 hover:bg-muted border-2 border-transparent"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <p className="font-medium text-sm line-clamp-2">{course.title}</p>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100"
                              onClick={(e) => { e.stopPropagation(); startEditCourse(course); }}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{course.level}</Badge>
                            <Badge variant="secondary" className="text-xs">{course.status}</Badge>
                          </div>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Modules Column */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Modules
                </CardTitle>
                {modules && <Badge variant="secondary">{modules.length}</Badge>}
              </div>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-y-auto">
              {!selectedCourseId ? (
                <div className="text-center py-8 text-muted-foreground">
                  Select a course to view modules
                </div>
              ) : modulesLoading ? (
                <div className="text-center py-4 text-muted-foreground">Loading...</div>
              ) : !modules || modules.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No modules</div>
              ) : (
                <div className="space-y-2">
                  {modules.map((module: any) => (
                    <div key={module.id} className="group">
                      {editingModuleId === module.id ? (
                        <div className="p-2 rounded-lg bg-muted/50 border-2 border-primary">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="mb-2"
                            autoFocus
                          />
                          <div className="flex gap-1">
                            <Button size="sm" onClick={saveEditModule} disabled={updateModuleMutation.isPending}>
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedModuleId(module.id);
                            setSelectedLessonId(null);
                          }}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedModuleId === module.id
                              ? "bg-primary/10 border-2 border-primary"
                              : "bg-muted/50 hover:bg-muted border-2 border-transparent"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <p className="font-medium text-sm line-clamp-2">{module.title}</p>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100"
                              onClick={(e) => { e.stopPropagation(); startEditModule(module); }}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Order: {module.sortOrder}</p>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Lessons Column */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Lessons
                </CardTitle>
                {lessons && <Badge variant="secondary">{lessons.length}</Badge>}
              </div>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-y-auto">
              {!selectedModuleId ? (
                <div className="text-center py-8 text-muted-foreground">
                  Select a module to view lessons
                </div>
              ) : lessonsLoading ? (
                <div className="text-center py-4 text-muted-foreground">Loading...</div>
              ) : !lessons || lessons.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No lessons</div>
              ) : (
                <div className="space-y-2">
                  {lessons.map((lesson: any) => (
                    <div key={lesson.id} className="group">
                      {editingLessonId === lesson.id ? (
                        <div className="p-2 rounded-lg bg-muted/50 border-2 border-primary">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="mb-2"
                            autoFocus
                          />
                          <div className="flex gap-1">
                            <Button size="sm" onClick={saveEditLesson} disabled={updateLessonMutation.isPending}>
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedLessonId(lesson.id)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedLessonId === lesson.id
                              ? "bg-primary/10 border-2 border-primary"
                              : "bg-muted/50 hover:bg-muted border-2 border-transparent"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <p className="font-medium text-sm line-clamp-2">{lesson.title}</p>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100"
                              onClick={(e) => { e.stopPropagation(); startEditLesson(lesson); }}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{lesson.contentType}</Badge>
                          </div>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Questions Column */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Questions
                </CardTitle>
                {selectedLessonId && selectedLesson?.contentType === "quiz" && (
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => setIsStatsDialogOpen(true)}
                      title="View Statistics"
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => handleExport("json")}
                      title="Export JSON"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => setIsImportDialogOpen(true)}
                      title="Import Questions"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => setIsDuplicateDialogOpen(true)}
                      title="Duplicate Quiz"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        resetQuestionForm();
                        setIsQuestionDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-y-auto">
              {!selectedLessonId ? (
                <div className="text-center py-8 text-muted-foreground">
                  Select a lesson to view questions
                </div>
              ) : selectedLesson?.contentType !== "quiz" ? (
                <div className="text-center py-8 text-muted-foreground">
                  This lesson is not a quiz
                </div>
              ) : questionsLoading ? (
                <div className="text-center py-4 text-muted-foreground">Loading...</div>
              ) : !questions || questions.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No questions yet
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={questions.map((q: any) => q.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {questions.map((question: any, index: number) => (
                        <SortableQuestionItem
                          key={question.id}
                          question={question}
                          index={index}
                          onEdit={handleEditQuestion}
                          onDelete={handleDeleteQuestion}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Lesson Details */}
        {selectedLesson && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Lesson Details: {selectedLesson.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Course</p>
                  <p className="font-medium">{selectedCourse?.title}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Module</p>
                  <p className="font-medium">{selectedModule?.title}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  {/* @ts-ignore - TS2339: auto-suppressed during TS cleanup */}
                  <Badge>{selectedLesson.type}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">{selectedLesson.estimatedMinutes} minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      
      {/* Question Dialog */}
      <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? "Edit Question" : "Add New Question"}
            </DialogTitle>
            <DialogDescription>
              {selectedLesson?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Question (English) *</label>
              <Textarea
                placeholder="Enter the question text..."
                value={questionForm.questionText}
                onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Question (French)</label>
              <Textarea
                placeholder="Entrez le texte de la question..."
                value={questionForm.questionTextFr}
                onChange={(e) => setQuestionForm({ ...questionForm, questionTextFr: e.target.value })}
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Question Type</label>
                <Select
                  value={questionForm.questionType}
                  onValueChange={(value: any) => setQuestionForm({ ...questionForm, questionType: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                    <SelectItem value="fill_in_blank">Fill in the Blank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Difficulty</label>
                <Select
                  value={questionForm.difficulty}
                  onValueChange={(value: any) => setQuestionForm({ ...questionForm, difficulty: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {questionForm.questionType === "multiple_choice" && (
              <div>
                <label className="text-sm font-medium">Answer Options</label>
                <div className="space-y-2 mt-2">
                  {questionForm.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...questionForm.options];
                          newOptions[index] = e.target.value;
                          setQuestionForm({ ...questionForm, options: newOptions });
                        }}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant={questionForm.correctAnswer === index ? "default" : "outline"}
                        onClick={() => setQuestionForm({ ...questionForm, correctAnswer: index })}
                        title="Mark as correct answer"
                      >
                        {questionForm.correctAnswer === index ? "✓" : index + 1}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium">Explanation</label>
              <Textarea
                placeholder="Explain why this is the correct answer..."
                value={questionForm.explanation}
                onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Points</label>
              <Input
                type="number"
                value={questionForm.points}
                onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) || 10 })}
                className="mt-1 w-24"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQuestionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleQuestionSubmit}
              disabled={!questionForm.questionText || createQuestionMutation.isPending || updateQuestionMutation.isPending}
            >
              {editingQuestion ? "Update Question" : "Create Question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Import Quiz Questions</DialogTitle>
            <DialogDescription>
              Import questions from JSON or CSV file
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium">Format</label>
                <Select value={importFormat} onValueChange={(v: any) => setImportFormat(v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium">Mode</label>
                <Select value={importMode} onValueChange={(v: any) => setImportMode(v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="append">Append to existing</SelectItem>
                    <SelectItem value="replace">Replace all</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Upload File</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv"
                onChange={handleFileUpload}
                className="mt-1 block w-full text-sm text-muted-foreground
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Or paste data directly</label>
              <Textarea
                placeholder={importFormat === "json" 
                  ? '[{"questionText": "...", "questionType": "multiple_choice", ...}]'
                  : 'questionText,questionTextFr,questionType,difficulty,options,correctAnswer,explanation,points'}
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                className="mt-1 font-mono text-xs"
                rows={8}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!importData || importQuestionsMutation.isPending}
            >
              {importQuestionsMutation.isPending ? "Importing..." : "Import Questions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Statistics Dialog */}
      <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quiz Question Statistics</DialogTitle>
            <DialogDescription>
              Performance analytics for {selectedLesson?.title}
            </DialogDescription>
          </DialogHeader>
          
          {questionStats && (
            <div className="space-y-6 py-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Total Attempts</p>
                    <p className="text-2xl font-bold">{questionStats.summary.totalAttempts}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Average Score</p>
                    <p className="text-2xl font-bold">{questionStats.summary.avgScore}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Avg Time</p>
                    <p className="text-2xl font-bold">{Math.round(questionStats.summary.avgTime / 60)}m</p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Charts Row */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Difficulty Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={difficultyChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {difficultyChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Success Rate by Difficulty</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={successRateByDifficulty}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Bar dataKey="rate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
              
              {/* Question Stats Table */}
              <div>
                <h4 className="font-medium mb-3">Per-Question Performance</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3">Question</th>
                        <th className="text-center p-3">Type</th>
                        <th className="text-center p-3">Difficulty</th>
                        <th className="text-center p-3">Attempts</th>
                        <th className="text-center p-3">Success Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questionStats.questions.map((q: any, idx: number) => (
                        <tr key={q.id} className="border-t">
                          <td className="p-3">
                            <span className="font-medium">{idx + 1}.</span>{" "}
                            {q.questionText?.substring(0, 40)}...
                          </td>
                          <td className="text-center p-3">
                            <Badge variant="outline" className="text-xs">{q.questionType}</Badge>
                          </td>
                          <td className="text-center p-3">
                            <Badge
                              variant="secondary"
                              className={`text-xs ${
                                q.difficulty === "easy"
                                  ? "bg-green-100 text-green-700"
                                  : q.difficulty === "hard"
                                  ? "bg-red-100 text-red-700"
                                  : ""
                              }`}
                            >
                              {q.difficulty}
                            </Badge>
                          </td>
                          <td className="text-center p-3">{q.totalAttempts}</td>
                          <td className="text-center p-3">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    q.successRate >= 70
                                      ? "bg-green-500"
                                      : q.successRate >= 40
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{ width: `${q.successRate}%` }}
                                />
                              </div>
                              <span className="font-medium">{q.successRate}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => handleExport("csv")}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => setIsStatsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Duplicate Quiz Dialog */}
      <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Duplicate Quiz</DialogTitle>
            <DialogDescription>
              Copy all questions from this quiz to another lesson
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label className="text-sm font-medium">Target Lesson</label>
            <Select 
              value={selectedTargetLessonId?.toString() || ""}
              onValueChange={(v) => setSelectedTargetLessonId(parseInt(v))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a quiz lesson..." />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {quizLessons?.filter((l: any) => l.id !== selectedLessonId).map((lesson: any) => (
                  <SelectItem key={lesson.id} value={lesson.id.toString()}>
                    <div className="flex flex-col">
                      <span>{lesson.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {lesson.courseTitle} → {lesson.moduleTitle}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {questions && questions.length > 0 && (
              <p className="text-sm text-muted-foreground mt-3">
                This will copy {questions.length} questions to the selected lesson.
              </p>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDuplicateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDuplicateQuiz}
              disabled={!selectedTargetLessonId || duplicateQuizMutation.isPending}
            >
              {duplicateQuizMutation.isPending ? "Duplicating..." : "Duplicate Quiz"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}
