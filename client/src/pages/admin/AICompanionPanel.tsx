import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Brain, Activity, Users, BarChart3, Settings2, Mic, BookOpen,
  TrendingUp, Loader2, Save, Target, Clock, MessageSquare,
  ChevronRight, AlertTriangle, ArrowLeft, Plus, Trash2, Sliders, User
} from "lucide-react";

type AITab = "overview" | "settings" | "users" | "drilldown" | "rules" | "oral" | "content";

const PFL_LEVELS = ["A", "B", "C"];
const SIMULATION_TYPES = [
  { id: "oral_reading", label: "Oral – Reading Comprehension" },
  { id: "oral_writing", label: "Oral – Written Expression" },
  { id: "oral_interaction", label: "Oral – Interaction" },
  { id: "written_grammar", label: "Written – Grammar" },
  { id: "written_vocabulary", label: "Written – Vocabulary" },
  { id: "written_comprehension", label: "Written – Comprehension" },
  { id: "sle_mock_exam", label: "SLE – Mock Exam" },
];

export default function AICompanionPanel() {
  const [activeTab, setActiveTab] = useState<AITab>("overview");
  const [aiSettings, setAiSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [newRuleKey, setNewRuleKey] = useState("");
  const [newRuleValue, setNewRuleValue] = useState("");

  const overviewQuery = trpc.aiAnalytics.getOverview.useQuery();
  const topUsersQuery = trpc.aiAnalytics.getTopUsers.useQuery({ limit: 10 });
  const byLevelQuery = trpc.aiAnalytics.getByLevel.useQuery();
  const byTypeQuery = trpc.aiAnalytics.getByType.useQuery();
  const dailyTrendQuery = trpc.aiAnalytics.getDailyTrend.useQuery({ days: 30 });
  const aiUsersQuery = trpc.aiAnalytics.listAIUsers.useQuery();
  const drilldownQuery = trpc.aiAnalytics.getUserDrilldown.useQuery(
    { userId: selectedUserId! },
    { enabled: !!selectedUserId }
  );
  const rulesQuery = trpc.aiRules.getRules.useQuery();
  const settingsQuery = trpc.settings.getAll.useQuery();
  const setBulkMut = trpc.settings.setBulk.useMutation();
  const setRuleMut = trpc.aiRules.setRule.useMutation({ onSuccess: () => { rulesQuery.refetch(); toast.success("Rule saved"); } });
  const deleteRuleMut = trpc.aiRules.deleteRule.useMutation({ onSuccess: () => { rulesQuery.refetch(); toast.success("Rule deleted"); } });

  const updateAiField = (key: string, value: string) => {
    setAiSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveAiSettings = async (keys: string[]) => {
    setSaving(true);
    try {
      const settings: Record<string, string> = {};
      keys.forEach(k => { if (aiSettings[k] !== undefined) settings[k] = aiSettings[k]; });
      await setBulkMut.mutateAsync({ settings });
      settingsQuery.refetch();
      toast.success("AI settings saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const overview = overviewQuery.data;

  const kpiCards = [
    { label: "Total AI Sessions", value: overview?.totalAiSessions ?? 0, icon: Brain, color: "text-violet-600" },
    { label: "Practice Logs", value: overview?.totalPracticeLogs ?? 0, icon: Activity, color: "text-blue-600" },
    { label: "Avg Session Duration", value: `${overview?.avgSessionDuration ?? 0}s`, icon: Clock, color: "text-emerald-600" },
    { label: "Avg Score", value: `${overview?.avgScore ?? 0}%`, icon: Target, color: "text-amber-600" },
  ];

  // ─── OVERVIEW TAB ───
  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className="text-sm text-muted-foreground">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">By PFL Level</CardTitle></CardHeader>
          <CardContent>
            {(byLevelQuery.data as any[] || []).length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No data yet.</p>}
            {(byLevelQuery.data as any[] || []).map((row: any) => (
              <div key={row.targetLevel} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-2"><Badge>{row.targetLevel}</Badge><span className="text-sm">{row.count} sessions</span></div>
                <span className="text-sm font-medium">{Math.round(Number(row.avgScore || 0))}% avg</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">By Practice Type</CardTitle></CardHeader>
          <CardContent>
            {(byTypeQuery.data as any[] || []).length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No data yet.</p>}
            {(byTypeQuery.data as any[] || []).map((row: any) => (
              <div key={row.practiceType} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-2"><Badge variant="outline">{row.practiceType}</Badge><span className="text-sm">{row.count} sessions</span></div>
                <span className="text-sm font-medium">{Math.round(Number(row.avgScore || 0))}% avg</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Daily AI Usage (Last 30 Days)</CardTitle></CardHeader>
        <CardContent>
          {(dailyTrendQuery.data as any[] || []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No daily data yet. Usage will appear here once learners start practicing.</p>
          ) : (
            <div className="space-y-1">
              {(dailyTrendQuery.data as any[] || []).slice(-14).map((day: any) => (
                <div key={day.date} className="flex items-center gap-3 text-sm">
                  <span className="w-24 text-muted-foreground">{day.date}</span>
                  <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                    <div className="bg-primary/60 h-full rounded-full" style={{ width: `${Math.min(100, Number(day.sessions) * 10)}%` }} />
                  </div>
                  <span className="w-20 text-right font-medium">{day.sessions} sess.</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // ─── SETTINGS TAB ───
  const renderSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Lingueefy AI Configuration</CardTitle><CardDescription>Control how the AI companion behaves for your learners.</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>AI Model</Label>
              <Select value={aiSettings.ai_model || "gpt-4o"} onValueChange={(v) => updateAiField("ai_model", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4o (Recommended)</SelectItem>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini (Faster)</SelectItem>
                  <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Max Tokens per Response</Label><Input value={aiSettings.ai_max_tokens || "1024"} onChange={(e) => updateAiField("ai_max_tokens", e.target.value)} placeholder="1024" /></div>
          </div>
          <div className="space-y-1.5"><Label>System Prompt</Label><Textarea value={aiSettings.ai_system_prompt || ""} onChange={(e) => updateAiField("ai_system_prompt", e.target.value)} placeholder="You are Lingueefy, a bilingual coaching companion for Canadian public servants preparing for SLE exams..." rows={5} /></div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2"><Label>Enable Oral Simulation</Label><Switch checked={aiSettings.ai_oral_enabled === "true"} onCheckedChange={(v) => updateAiField("ai_oral_enabled", v ? "true" : "false")} /></div>
            <div className="flex items-center justify-between py-2"><Label>Enable Written Practice</Label><Switch checked={aiSettings.ai_written_enabled !== "false"} onCheckedChange={(v) => updateAiField("ai_written_enabled", v ? "true" : "false")} /></div>
            <div className="flex items-center justify-between py-2"><Label>Enable Grammar Correction</Label><Switch checked={aiSettings.ai_grammar_enabled !== "false"} onCheckedChange={(v) => updateAiField("ai_grammar_enabled", v ? "true" : "false")} /></div>
            <div className="flex items-center justify-between py-2"><Label>Enable Vocabulary Builder</Label><Switch checked={aiSettings.ai_vocab_enabled !== "false"} onCheckedChange={(v) => updateAiField("ai_vocab_enabled", v ? "true" : "false")} /></div>
          </div>
          <div className="space-y-1.5"><Label>Daily Session Limit per User</Label><Input value={aiSettings.ai_daily_limit || "10"} onChange={(e) => updateAiField("ai_daily_limit", e.target.value)} placeholder="10" /></div>
          <Button onClick={() => saveAiSettings(["ai_model", "ai_max_tokens", "ai_system_prompt", "ai_oral_enabled", "ai_written_enabled", "ai_grammar_enabled", "ai_vocab_enabled", "ai_daily_limit"])} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save AI Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  // ─── USERS LIST TAB ───
  const renderUsersList = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Users — Drill-Down</CardTitle>
          <CardDescription>Click on any user to view their sessions, progression, and errors in detail.</CardDescription>
        </CardHeader>
        <CardContent>
          {aiUsersQuery.isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center"><Loader2 className="h-4 w-4 animate-spin" /> Loading users...</div>
          ) : (aiUsersQuery.data as any[] || []).length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No AI usage data yet. Users will appear here once they start practicing.</p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="grid grid-cols-6 gap-4 px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b">
                <span className="col-span-2">User</span>
                <span>Sessions</span>
                <span>Avg Score</span>
                <span>Last Active</span>
                <span></span>
              </div>
              {(aiUsersQuery.data as any[]).map((user: any) => (
                <button key={user.userId} onClick={() => { setSelectedUserId(user.userId); setActiveTab("drilldown"); }}
                  className="w-full grid grid-cols-6 gap-4 px-3 py-3 text-sm text-left rounded-lg hover:bg-muted/50 transition-colors items-center">
                  <div className="col-span-2 min-w-0">
                    <p className="font-medium truncate">{user.name || user.email || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <span className="font-medium">{user.totalSessions}</span>
                  <span>
                    <Badge variant={Number(user.avgScore) >= 70 ? "default" : Number(user.avgScore) >= 50 ? "secondary" : "destructive"} className="text-xs">
                      {Math.round(Number(user.avgScore || 0))}%
                    </Badge>
                  </span>
                  <span className="text-muted-foreground text-xs">{user.lastActive ? new Date(user.lastActive).toLocaleDateString() : "—"}</span>
                  <span className="text-right"><ChevronRight className="h-4 w-4 text-muted-foreground inline" /></span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // ─── USER DRILL-DOWN TAB ───
  const renderDrilldown = () => {
    const data = drilldownQuery.data as any;
    if (!selectedUserId) return <div className="text-center py-12 text-muted-foreground"><p>Select a user from the Users tab.</p></div>;
    if (drilldownQuery.isLoading) return <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center"><Loader2 className="h-5 w-5 animate-spin" /> Loading user data...</div>;

    const user = data?.user as any;
    const sessions = (data?.sessions || []) as any[];
    const progression = (data?.progression || []) as any[];
    const errors = (data?.recentErrors || []) as any[];

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => { setSelectedUserId(null); setActiveTab("users"); }}><ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Users</Button>
          <div>
            <h2 className="text-lg font-bold">{user?.name || user?.email || "User #" + selectedUserId}</h2>
            <p className="text-xs text-muted-foreground">{user?.email} · Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</p>
          </div>
        </div>

        {/* User KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center"><Brain className="h-5 w-5 mx-auto mb-1 text-violet-600" /><p className="text-xl font-bold">{sessions.length}</p><p className="text-xs text-muted-foreground">Total Sessions</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><Target className="h-5 w-5 mx-auto mb-1 text-amber-600" /><p className="text-xl font-bold">{sessions.length > 0 ? Math.round(sessions.reduce((a: number, s: any) => a + Number(s.score || 0), 0) / sessions.filter((s: any) => s.score != null).length || 0) : 0}%</p><p className="text-xs text-muted-foreground">Avg Score</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><AlertTriangle className="h-5 w-5 mx-auto mb-1 text-red-500" /><p className="text-xl font-bold">{errors.length}</p><p className="text-xs text-muted-foreground">Low Scores (&lt;60%)</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><TrendingUp className="h-5 w-5 mx-auto mb-1 text-emerald-600" /><p className="text-xl font-bold">{progression.length}</p><p className="text-xs text-muted-foreground">Weeks Active</p></CardContent></Card>
        </div>

        {/* Weekly Progression */}
        {progression.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Weekly Progression</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1">
                {progression.map((week: any, i: number) => (
                  <div key={week.week || i} className="flex items-center gap-3 text-sm">
                    <span className="w-20 text-muted-foreground text-xs">Week {i + 1}</span>
                    <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                      <div className={`h-full rounded-full ${Number(week.avgScore) >= 70 ? "bg-emerald-500" : Number(week.avgScore) >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${Math.min(100, Number(week.avgScore))}%` }} />
                    </div>
                    <span className="w-16 text-right font-medium">{Math.round(Number(week.avgScore))}%</span>
                    <span className="w-16 text-right text-xs text-muted-foreground">{week.sessionCount} sess.</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Sessions */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Recent Sessions ({sessions.length})</CardTitle></CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No sessions recorded.</p>
            ) : (
              <div className="space-y-1 max-h-[400px] overflow-y-auto">
                <div className="grid grid-cols-6 gap-3 px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b sticky top-0 bg-background">
                  <span>Type</span><span>Level</span><span>Score</span><span>Duration</span><span className="col-span-2">Date</span>
                </div>
                {sessions.map((s: any) => (
                  <div key={s.id} className="grid grid-cols-6 gap-3 px-2 py-2 text-sm rounded hover:bg-muted/30">
                    <span><Badge variant="outline" className="text-xs">{s.practiceType || "—"}</Badge></span>
                    <span><Badge className="text-xs">{s.targetLevel || "—"}</Badge></span>
                    <span>
                      <Badge variant={Number(s.score) >= 70 ? "default" : Number(s.score) >= 50 ? "secondary" : "destructive"} className="text-xs">
                        {s.score != null ? `${s.score}%` : "—"}
                      </Badge>
                    </span>
                    <span className="text-muted-foreground">{s.durationSeconds ? `${Math.round(s.durationSeconds / 60)}min` : "—"}</span>
                    <span className="col-span-2 text-muted-foreground text-xs">{s.createdAt ? new Date(s.createdAt).toLocaleString() : "—"}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Errors */}
        {errors.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500" /> Low Score Sessions (&lt;60%)</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {errors.map((e: any) => (
                  <div key={e.id} className="p-3 border rounded-lg bg-red-50/50 dark:bg-red-950/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="destructive" className="text-xs">{e.score}%</Badge>
                      <Badge variant="outline" className="text-xs">{e.practiceType}</Badge>
                      <Badge className="text-xs">{e.targetLevel}</Badge>
                      <span className="text-xs text-muted-foreground ml-auto">{e.createdAt ? new Date(e.createdAt).toLocaleDateString() : ""}</span>
                    </div>
                    {e.feedback && <p className="text-xs text-muted-foreground mt-1">{e.feedback}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // ─── RULES TAB ───
  const renderRules = () => {
    const rules = (rulesQuery.data as any[] || []);
    const levelRules = rules.filter((r: any) => r.key.startsWith("ai_rule_level_"));
    const simRules = rules.filter((r: any) => r.key.startsWith("ai_rule_sim_"));
    const otherRules = rules.filter((r: any) => !r.key.startsWith("ai_rule_level_") && !r.key.startsWith("ai_rule_sim_"));

    return (
      <div className="space-y-6">
        {/* Level Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sliders className="h-4 w-4" /> PFL Level Rules (A / B / C)</CardTitle>
            <CardDescription>Configure scoring thresholds, difficulty, and behavior for each PFL level.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {PFL_LEVELS.map((level) => {
              const ruleKey = `ai_rule_level_${level.toLowerCase()}`;
              const existing = levelRules.find((r: any) => r.key === ruleKey);
              const currentValue = existing?.value || "";
              return (
                <div key={level} className="flex items-center gap-4 p-3 border rounded-lg">
                  <Badge className="text-lg px-3 py-1 font-bold">{level}</Badge>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Configuration (JSON or text)</Label>
                    <Input
                      defaultValue={currentValue}
                      placeholder={`e.g. {"minScore": ${level === "A" ? 80 : level === "B" ? 60 : 40}, "difficulty": "${level === "A" ? "advanced" : level === "B" ? "intermediate" : "beginner"}", "maxRetries": 3}`}
                      onBlur={(e) => { if (e.target.value !== currentValue) setRuleMut.mutate({ key: ruleKey, value: e.target.value }); }}
                    />
                  </div>
                  {existing && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { if (confirm(`Delete rule for Level ${level}?`)) deleteRuleMut.mutate({ key: ruleKey }); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Simulation Type Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Mic className="h-4 w-4" /> Simulation Type Rules</CardTitle>
            <CardDescription>Enable/disable simulation types and configure their behavior.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {SIMULATION_TYPES.map((sim) => {
              const ruleKey = `ai_rule_sim_${sim.id}`;
              const existing = simRules.find((r: any) => r.key === ruleKey);
              const isEnabled = existing?.value !== "disabled";
              return (
                <div key={sim.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <Switch checked={isEnabled} onCheckedChange={(v) => setRuleMut.mutate({ key: ruleKey, value: v ? "enabled" : "disabled" })} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{sim.label}</p>
                    <p className="text-xs text-muted-foreground">{ruleKey}</p>
                  </div>
                  <Badge variant={isEnabled ? "default" : "secondary"}>{isEnabled ? "Active" : "Disabled"}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Custom Rules */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div><CardTitle className="flex items-center gap-2"><Settings2 className="h-4 w-4" /> Custom Rules</CardTitle><CardDescription>Add custom AI behavior rules.</CardDescription></div>
              <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
                <Button size="sm" onClick={() => setShowRuleDialog(true)}><Plus className="h-3.5 w-3.5 mr-1" /> Add Rule</Button>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Custom Rule</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-1.5"><Label>Rule Key</Label><Input value={newRuleKey} onChange={(e) => setNewRuleKey(e.target.value)} placeholder="e.g. ai_rule_max_retries" /></div>
                    <div className="space-y-1.5"><Label>Rule Value</Label><Textarea value={newRuleValue} onChange={(e) => setNewRuleValue(e.target.value)} placeholder="e.g. 3 or JSON config" rows={3} /></div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={() => {
                      if (!newRuleKey.trim()) { toast.error("Key is required"); return; }
                      const key = newRuleKey.startsWith("ai_rule_") ? newRuleKey : `ai_rule_${newRuleKey}`;
                      setRuleMut.mutate({ key, value: newRuleValue });
                      setNewRuleKey(""); setNewRuleValue(""); setShowRuleDialog(false);
                    }}>Save Rule</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {otherRules.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No custom rules yet.</p>
            ) : (
              <div className="space-y-2">
                {otherRules.map((rule: any) => (
                  <div key={rule.key} className="flex items-center gap-3 p-2 border rounded-lg group">
                    <code className="text-xs bg-muted px-2 py-1 rounded">{rule.key}</code>
                    <span className="flex-1 text-sm truncate">{rule.value}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100" onClick={() => deleteRuleMut.mutate({ key: rule.key })}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // ─── ORAL TAB ───
  const renderOral = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Oral Simulation Tracking</CardTitle><CardDescription>Monitor oral practice sessions, pronunciation scores, and SLE oral exam preparation.</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-muted/50 rounded-lg text-center"><Mic className="h-6 w-6 mx-auto mb-2 text-violet-600" /><p className="text-xl font-bold">{overview?.totalAiSessions ?? 0}</p><p className="text-xs text-muted-foreground">Oral Sessions</p></div>
            <div className="p-4 bg-muted/50 rounded-lg text-center"><Target className="h-6 w-6 mx-auto mb-2 text-amber-600" /><p className="text-xl font-bold">{overview?.avgScore ?? 0}%</p><p className="text-xs text-muted-foreground">Avg Oral Score</p></div>
            <div className="p-4 bg-muted/50 rounded-lg text-center"><Users className="h-6 w-6 mx-auto mb-2 text-blue-600" /><p className="text-xl font-bold">{(topUsersQuery.data as any[] || []).length}</p><p className="text-xs text-muted-foreground">Active Speakers</p></div>
          </div>

          {/* Top Oral Users */}
          <h3 className="font-semibold text-sm mb-3">Top Oral Practitioners</h3>
          {(topUsersQuery.data as any[] || []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No oral practice data yet.</p>
          ) : (
            <div className="space-y-2">
              {(topUsersQuery.data as any[] || []).slice(0, 5).map((user: any, i: number) => (
                <div key={user.userId || i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => { setSelectedUserId(user.userId); setActiveTab("drilldown"); }}>
                  <span className="text-sm font-medium text-muted-foreground w-6">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name || user.email || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{user.sessionCount} sessions</p>
                  </div>
                  <Badge variant={Number(user.avgScore) >= 70 ? "default" : "secondary"}>{Math.round(Number(user.avgScore || 0))}%</Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // ─── CONTENT TAB ───
  const renderContent = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Content Feeding</CardTitle><CardDescription>Manage the knowledge base and training content that powers the AI companion.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5"><Label>Custom Knowledge Base</Label><Textarea value={aiSettings.ai_knowledge_base || ""} onChange={(e) => updateAiField("ai_knowledge_base", e.target.value)} placeholder="Paste SLE exam preparation content, grammar rules, vocabulary lists..." rows={8} /></div>
          <div className="space-y-1.5"><Label>Exam-Specific Instructions</Label><Textarea value={aiSettings.ai_exam_instructions || ""} onChange={(e) => updateAiField("ai_exam_instructions", e.target.value)} placeholder="Specific instructions for SLE exam preparation (Reading, Writing, Oral)..." rows={4} /></div>
          <div className="space-y-1.5"><Label>Vocabulary Focus Areas</Label><Input value={aiSettings.ai_vocab_focus || ""} onChange={(e) => updateAiField("ai_vocab_focus", e.target.value)} placeholder="e.g. Government terminology, Policy language, Administrative French" /></div>
          <Button onClick={() => saveAiSettings(["ai_knowledge_base", "ai_exam_instructions", "ai_vocab_focus"])} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save Content Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const tabItems: { key: AITab; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "settings", label: "AI Settings", icon: Settings2 },
    { key: "users", label: "Users", icon: Users },
    { key: "drilldown", label: "Drill-Down", icon: User },
    { key: "rules", label: "Rules & Levels", icon: Sliders },
    { key: "oral", label: "Oral Simulation", icon: Mic },
    { key: "content", label: "Content Feeding", icon: BookOpen },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1"><Brain className="h-6 w-6 text-violet-600" /><h1 className="text-2xl font-bold">Lingueefy AI Companion</h1></div>
        <p className="text-sm text-muted-foreground">Full control over your AI coaching system — settings, analytics, user drill-down, configurable rules, and content feeding.</p>
      </div>
      <div className="flex gap-1 mb-6 border-b overflow-x-auto">
        {tabItems.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <tab.icon className="h-4 w-4" /> {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "overview" && renderOverview()}
      {activeTab === "settings" && renderSettings()}
      {activeTab === "users" && renderUsersList()}
      {activeTab === "drilldown" && renderDrilldown()}
      {activeTab === "rules" && renderRules()}
      {activeTab === "oral" && renderOral()}
      {activeTab === "content" && renderContent()}
    </div>
  );
}
