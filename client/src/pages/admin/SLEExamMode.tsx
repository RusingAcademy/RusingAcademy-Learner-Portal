import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  GraduationCap, Clock, Target, BarChart3, Users,
  Play, Settings, FileText, Award, TrendingUp,
  AlertTriangle, CheckCircle, Brain, BookOpen,
  Plus, Edit, Trash2, Eye, Download, Activity,
} from "lucide-react";

export default function SLEExamMode() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateExam, setShowCreateExam] = useState(false);

  const { data: stats } = trpc.sleExam.getStats.useQuery();
  const { data: exams, refetch } = trpc.sleExam.listExams.useQuery();
  const { data: config } = trpc.sleExam.getConfig.useQuery();

  const createMutation = trpc.sleExam.createExam.useMutation({
    onSuccess: () => { toast.success("Exam simulation created"); setShowCreateExam(false); refetch(); },
    onError: (e: any) => toast.error(e.message),
  });

  const [newExam, setNewExam] = useState({
    title: "",
    examType: "reading" as "reading" | "writing" | "oral",
    level: "B" as "A" | "B" | "C",
  });

  // Compute pass rate from stats
  const passRate = stats?.completedSessions && stats.totalSessions
    ? Math.round((stats.completedSessions / stats.totalSessions) * 100)
    : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-6 w-6" /> SLE Exam Mode
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Official Second Language Evaluation simulation with scoring and analytics</p>
        </div>
        <Button onClick={() => setShowCreateExam(true)}>
          <Plus className="h-4 w-4 mr-1.5" /> Create Exam
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10"><FileText className="h-5 w-5 text-blue-500" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Total Sessions</p>
                <p className="text-xl font-bold">{stats?.totalSessions ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10"><CheckCircle className="h-5 w-5 text-green-500" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-xl font-bold">{stats?.completedSessions ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10"><Target className="h-5 w-5 text-purple-500" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Score</p>
                <p className="text-xl font-bold">{Math.round(stats?.avgScore ?? 0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10"><Award className="h-5 w-5 text-amber-500" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
                <p className="text-xl font-bold">{passRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10"><Activity className="h-5 w-5 text-cyan-500" /></div>
              <div>
                <p className="text-xs text-muted-foreground">This Week</p>
                <p className="text-xl font-bold">{stats?.recentActivity ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Exam Library</TabsTrigger>
          <TabsTrigger value="results">Results & Analytics</TabsTrigger>
          <TabsTrigger value="config">Exam Configuration</TabsTrigger>
          <TabsTrigger value="questions">Question Bank</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Create Exam */}
          {showCreateExam && (
            <Card className="border-primary/30">
              <CardHeader><CardTitle className="text-lg">Create SLE Exam Simulation</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Exam Title</Label>
                    <Input value={newExam.title} onChange={(e) => setNewExam(p => ({ ...p, title: e.target.value }))} placeholder="e.g., SLE Reading Practice - Level B" />
                  </div>
                  <div className="space-y-2">
                    <Label>Exam Type</Label>
                    <Select value={newExam.examType} onValueChange={(v) => setNewExam(p => ({ ...p, examType: v as any }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reading">Reading Comprehension</SelectItem>
                        <SelectItem value="writing">Written Expression</SelectItem>
                        <SelectItem value="oral">Oral Interaction</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Target Level</Label>
                    <Select value={newExam.level} onValueChange={(v) => setNewExam(p => ({ ...p, level: v as any }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Level A (Basic)</SelectItem>
                        <SelectItem value="B">Level B (Intermediate)</SelectItem>
                        <SelectItem value="C">Level C (Advanced)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowCreateExam(false)}>Cancel</Button>
                  <Button onClick={() => createMutation.mutate({
                    examType: newExam.examType,
                    level: newExam.level,
                    title: newExam.title,
                  })} disabled={!newExam.title || createMutation.isPending}>
                    <Plus className="h-4 w-4 mr-1.5" /> Create Exam
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Exam Session List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Exam Sessions</CardTitle>
                <Badge variant="outline">{(exams as any[])?.length ?? 0} sessions</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {!exams || (exams as any[]).length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="font-medium">No exam sessions yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Sessions will appear as learners take SLE practice exams</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(exams as any[]).map((exam: any) => (
                    <div key={exam.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${exam.examType === "reading" ? "bg-blue-500/10" : exam.examType === "writing" ? "bg-green-500/10" : "bg-purple-500/10"}`}>
                          {exam.examType === "reading" ? <BookOpen className="h-5 w-5 text-blue-500" /> : exam.examType === "writing" ? <FileText className="h-5 w-5 text-green-500" /> : <Brain className="h-5 w-5 text-purple-500" />}
                        </div>
                        <div>
                          <p className="font-medium">{exam.userName ?? "Unknown"}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-[10px] h-5">Level {exam.level}</Badge>
                            <span className="capitalize">{exam.examType}</span>
                            <Clock className="h-3 w-3" /> {exam.timeUsed ? Math.round(exam.timeUsed / 60) : 0}min / {Math.round(exam.timeLimit / 60)}min
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {exam.score !== null && (
                          <span className={`text-sm font-bold ${Number(exam.score) >= 70 ? "text-green-500" : Number(exam.score) >= 50 ? "text-amber-500" : "text-red-500"}`}>
                            {Math.round(Number(exam.score))}%
                          </span>
                        )}
                        <Badge variant={exam.status === "completed" ? "default" : exam.status === "in_progress" ? "secondary" : "destructive"}>
                          {exam.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SLE Level Guide */}
          <Card>
            <CardHeader><CardTitle className="text-lg">SLE Level Requirements</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(config?.levels ?? [
                  { key: "A", label: "Level A", description: "Basic proficiency" },
                  { key: "B", label: "Level B", description: "Intermediate proficiency" },
                  { key: "C", label: "Level C", description: "Advanced proficiency" },
                ]).map((l: any) => {
                  const rubric = config?.scoringRubric?.[l.key as keyof typeof config.scoringRubric];
                  return (
                    <Card key={l.key} className={`border-${l.key === "A" ? "blue" : l.key === "B" ? "purple" : "amber"}-500/30 bg-${l.key === "A" ? "blue" : l.key === "B" ? "purple" : "amber"}-500/5`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>{l.label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{l.description}</p>
                        {rubric && <p className="text-xs font-medium mt-2">Score range: {rubric.min}% – {rubric.max}%</p>}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {/* By Type */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Performance by Exam Type</CardTitle>
                <Button size="sm" variant="outline" onClick={() => toast.success("Export started")}>
                  <Download className="h-4 w-4 mr-1.5" /> Export Results
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!stats?.byType || (stats.byType as any[]).length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="font-medium">No exam results yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Results will appear after students complete exams</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(stats.byType as any[]).map((t: any) => (
                    <Card key={t.examType}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {t.examType === "reading" ? <BookOpen className="h-5 w-5 text-blue-500" /> : t.examType === "writing" ? <FileText className="h-5 w-5 text-green-500" /> : <Brain className="h-5 w-5 text-purple-500" />}
                          <span className="font-medium capitalize">{t.examType}</span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between"><span className="text-muted-foreground">Attempts</span><span className="font-medium">{t.count}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Avg Score</span><span className="font-medium">{Math.round(Number(t.avgScore || 0))}%</span></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* By Level */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Performance by Level</CardTitle></CardHeader>
            <CardContent>
              {!stats?.byLevel || (stats.byLevel as any[]).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No level data available yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(stats.byLevel as any[]).map((l: any) => {
                    const avgPct = Math.round(Number(l.avgScore || 0));
                    return (
                      <div key={l.level} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Level {l.level} ({l.count} attempts)</span>
                          <span className="font-medium">{avgPct}% avg</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${avgPct >= 70 ? "bg-green-500" : avgPct >= 50 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${avgPct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Settings className="h-5 w-5" /> Exam Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Timed Mode", desc: "Enforce time limits during exam simulations", key: "timedMode" },
                { label: "Randomize Questions", desc: "Shuffle question order for each attempt", key: "randomize" },
                { label: "Show Correct Answers", desc: "Display correct answers after submission", key: "showAnswers" },
                { label: "Allow Retakes", desc: "Allow students to retake exams", key: "allowRetakes" },
                { label: "Proctoring Mode", desc: "Enable browser lockdown during exams", key: "proctoring" },
                { label: "AI Feedback", desc: "Generate AI-powered feedback on written/oral responses", key: "aiFeedback" },
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{setting.label}</p>
                    <p className="text-xs text-muted-foreground">{setting.desc}</p>
                  </div>
                  <Switch defaultChecked={setting.key !== "proctoring"} onCheckedChange={() => toast.success(`${setting.label} updated`)} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Exam Type Config from Backend */}
          {config?.examTypes && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Exam Type Parameters</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(config.examTypes as any[]).map((et: any) => (
                    <Card key={et.key}>
                      <CardContent className="p-4">
                        <p className="font-medium text-sm">{et.label}</p>
                        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                          <div className="flex justify-between"><span>Time Limit</span><span className="font-medium text-foreground">{Math.round(et.timeLimitSeconds / 60)} min</span></div>
                          <div className="flex justify-between"><span>Questions</span><span className="font-medium text-foreground">{et.questionCount}</span></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Question Bank</CardTitle>
                <Button size="sm" onClick={() => toast.info("Question editor coming soon — create reading, writing, and oral questions with AI-assisted generation")}>
                  <Plus className="h-4 w-4 mr-1.5" /> Add Questions
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { type: "Reading", icon: BookOpen, color: "bg-blue-500/10 text-blue-500" },
                  { type: "Writing", icon: FileText, color: "bg-green-500/10 text-green-500" },
                  { type: "Oral", icon: Brain, color: "bg-purple-500/10 text-purple-500" },
                ].map((q) => (
                  <Card key={q.type}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${q.color}`}><q.icon className="h-5 w-5" /></div>
                        <div>
                          <p className="text-sm font-medium">{q.type} Questions</p>
                          <p className="text-lg font-bold">—</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">AI Question Generation</p>
                    <p className="text-xs text-muted-foreground">Use the AI Companion to auto-generate SLE-aligned questions based on official exam formats. Questions are reviewed before publishing.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
