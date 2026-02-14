import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Rocket, Mail, Bell, BookOpen, CheckCircle, Settings,
  Users, ArrowRight, Play, Pause, Edit, Save, Plus, Trash2,
} from "lucide-react";

type OnboardingStep = {
  id: string;
  type: "email" | "notification" | "course_assign" | "delay" | "tag";
  title: string;
  config: Record<string, any>;
  enabled: boolean;
};

const DEFAULT_STEPS: OnboardingStep[] = [
  { id: "1", type: "email", title: "Welcome Email", config: { subject: "Welcome to RusingÂcademy!", template: "welcome", delay: 0 }, enabled: true },
  { id: "2", type: "notification", title: "Admin Notification", config: { message: "New student enrolled: {{name}}", recipients: "admin" }, enabled: true },
  { id: "3", type: "delay", title: "Wait 1 hour", config: { hours: 1 }, enabled: true },
  { id: "4", type: "course_assign", title: "Assign Free Starter Course", config: { courseType: "starter", autoEnroll: true }, enabled: true },
  { id: "5", type: "email", title: "Getting Started Guide", config: { subject: "Your learning journey starts here", template: "getting_started", delay: 0 }, enabled: true },
  { id: "6", type: "tag", title: "Tag as New Student", config: { tags: ["new_student", "onboarding"] }, enabled: true },
];

const STEP_ICONS: Record<string, any> = {
  email: Mail,
  notification: Bell,
  course_assign: BookOpen,
  delay: Settings,
  tag: Users,
};

const STEP_COLORS: Record<string, string> = {
  email: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  notification: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  course_assign: "bg-green-500/10 text-green-500 border-green-500/20",
  delay: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  tag: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export default function OnboardingWorkflow() {
  const [activeTab, setActiveTab] = useState("workflow");
  const [steps, setSteps] = useState<OnboardingStep[]>(DEFAULT_STEPS);
  const [isActive, setIsActive] = useState(true);
  const [editingStep, setEditingStep] = useState<string | null>(null);

  const { data: config } = trpc.onboarding.getConfig.useQuery();
  const { data: stats } = trpc.onboarding.getStats.useQuery();
  const saveMutation = trpc.onboarding.saveConfig.useMutation({
    onSuccess: () => toast.success("Onboarding workflow saved"),
    onError: () => toast.error("Failed to save workflow"),
  });

  const toggleStep = (id: string) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const removeStep = (id: string) => {
    setSteps(prev => prev.filter(s => s.id !== id));
    toast.success("Step removed");
  };

  const addStep = (type: OnboardingStep["type"]) => {
    const newStep: OnboardingStep = {
      id: Date.now().toString(),
      type,
      title: type === "email" ? "New Email" : type === "notification" ? "New Notification" : type === "course_assign" ? "Assign Course" : type === "delay" ? "Wait" : "Add Tag",
      config: {},
      enabled: true,
    };
    setSteps(prev => [...prev, newStep]);
    setEditingStep(newStep.id);
  };

  const saveWorkflow = () => {
    saveMutation.mutate({
      isActive,
      steps: steps.map(s => ({ type: s.type, title: s.title, config: JSON.stringify(s.config), enabled: s.enabled })),
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Rocket className="h-6 w-6" /> Onboarding Workflow
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Automated welcome sequence for new students</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isActive ? <Play className="h-4 w-4 text-green-500" /> : <Pause className="h-4 w-4 text-muted-foreground" />}
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <span className="text-sm font-medium">{isActive ? "Active" : "Paused"}</span>
          </div>
          <Button onClick={saveWorkflow} disabled={saveMutation.isPending}>
            <Save className="h-4 w-4 mr-1.5" /> Save Workflow
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Onboarded</p>
            <p className="text-2xl font-bold">{stats?.totalOnboarded ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">This Week</p>
            <p className="text-2xl font-bold">{stats?.thisWeek ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Completion Rate</p>
            <p className="text-2xl font-bold">{stats?.completionRate ?? 0}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Avg Time to Complete</p>
            <p className="text-2xl font-bold">{stats?.avgTimeHours ?? 0}h</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="workflow">Workflow Steps</TabsTrigger>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="history">Onboarding History</TabsTrigger>
        </TabsList>

        <TabsContent value="workflow" className="space-y-4">
          {/* Visual Workflow */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Workflow Steps</CardTitle>
                <Badge variant="outline">{steps.filter(s => s.enabled).length} active steps</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {/* Trigger */}
              <div className="flex items-center gap-3 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                <div className="p-2 rounded-lg bg-green-500/10"><Rocket className="h-5 w-5 text-green-500" /></div>
                <div>
                  <p className="font-medium text-sm">Trigger: New User Signup</p>
                  <p className="text-xs text-muted-foreground">Fires when a new user creates an account</p>
                </div>
              </div>

              {steps.map((step, idx) => {
                const Icon = STEP_ICONS[step.type] ?? Settings;
                const colorClass = STEP_COLORS[step.type] ?? "bg-gray-500/10 text-gray-500 border-gray-500/20";
                return (
                  <div key={step.id}>
                    <div className="flex justify-center py-1">
                      <ArrowRight className="h-4 w-4 text-muted-foreground/50 rotate-90" />
                    </div>
                    <div className={`flex items-center gap-3 p-3 border rounded-lg transition-all ${step.enabled ? colorClass : "bg-muted/30 border-muted opacity-50"}`}>
                      <div className="p-2 rounded-lg bg-background/50"><Icon className="h-5 w-5" /></div>
                      <div className="flex-1 min-w-0">
                        {editingStep === step.id ? (
                          <Input
                            value={step.title}
                            onChange={(e) => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, title: e.target.value } : s))}
                            className="h-7 text-sm"
                            onBlur={() => setEditingStep(null)}
                            onKeyDown={(e) => e.key === "Enter" && setEditingStep(null)}
                            autoFocus
                          />
                        ) : (
                          <>
                            <p className="font-medium text-sm">{step.title}</p>
                            <p className="text-xs text-muted-foreground capitalize">{step.type.replace("_", " ")}</p>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingStep(step.id)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Switch checked={step.enabled} onCheckedChange={() => toggleStep(step.id)} />
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" onClick={() => removeStep(step.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add Step */}
              <div className="flex justify-center py-1">
                <ArrowRight className="h-4 w-4 text-muted-foreground/50 rotate-90" />
              </div>
              <div className="flex flex-wrap gap-2 justify-center p-3 border border-dashed rounded-lg">
                <Button size="sm" variant="outline" onClick={() => addStep("email")}><Mail className="h-3.5 w-3.5 mr-1" /> Email</Button>
                <Button size="sm" variant="outline" onClick={() => addStep("notification")}><Bell className="h-3.5 w-3.5 mr-1" /> Notification</Button>
                <Button size="sm" variant="outline" onClick={() => addStep("course_assign")}><BookOpen className="h-3.5 w-3.5 mr-1" /> Course</Button>
                <Button size="sm" variant="outline" onClick={() => addStep("delay")}><Settings className="h-3.5 w-3.5 mr-1" /> Delay</Button>
                <Button size="sm" variant="outline" onClick={() => addStep("tag")}><Users className="h-3.5 w-3.5 mr-1" /> Tag</Button>
              </div>

              {/* End */}
              <div className="flex justify-center py-1">
                <ArrowRight className="h-4 w-4 text-muted-foreground/50 rotate-90" />
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/30 border rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <p className="font-medium text-sm">Onboarding Complete</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Onboarding Email Templates</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Welcome Email", subject: "Welcome to RusingÂcademy!", status: "active" },
                { name: "Getting Started Guide", subject: "Your learning journey starts here", status: "active" },
                { name: "First Week Check-in", subject: "How's your first week going?", status: "draft" },
                { name: "Course Recommendation", subject: "Courses picked for you", status: "draft" },
              ].map((tpl, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{tpl.name}</p>
                      <p className="text-xs text-muted-foreground">{tpl.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={tpl.status === "active" ? "default" : "secondary"}>{tpl.status}</Badge>
                    <Button size="sm" variant="outline" onClick={() => toast.info("Navigate to Email Templates to edit this template")}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Recent Onboardings</CardTitle></CardHeader>
            <CardContent>
              {!stats?.recentOnboardings || (stats.recentOnboardings as any[]).length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No onboardings yet</p>
                  <p className="text-xs text-muted-foreground mt-1">New signups will appear here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(stats.recentOnboardings as any[]).map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {item.name?.charAt(0) ?? "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={item.completed ? "default" : "secondary"}>
                          {item.completed ? "Completed" : `Step ${item.currentStep}/${item.totalSteps}`}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
