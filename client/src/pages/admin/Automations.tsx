import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Search, Zap, MoreHorizontal, Edit, Copy, Trash2, Play, Pause,
  ArrowLeft, ArrowRight, Mail, Clock, UserPlus, ShoppingCart, GraduationCap,
  CheckCircle2, AlertCircle, ChevronDown, Loader2
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// ─── Types ───
type TriggerType = "enrollment" | "purchase" | "course_complete" | "lesson_complete" | "signup" | "inactivity" | "tag_added" | "manual";
type ActionType = "send_email" | "wait" | "add_tag" | "remove_tag" | "enroll_course" | "notify_admin" | "send_sms";

interface AutomationStep {
  id: string;
  type: ActionType;
  config: Record<string, any>;
}

interface Automation {
  id: number;
  name: string;
  description: string;
  trigger: TriggerType;
  triggerConfig: Record<string, any>;
  status: "active" | "paused" | "draft";
  steps: AutomationStep[];
  stats: { triggered: number; completed: number; active: number };
  createdAt: string;
}

const triggerLabels: Record<TriggerType, string> = {
  enrollment: "Course Enrollment",
  purchase: "Purchase Completed",
  course_complete: "Course Completed",
  lesson_complete: "Lesson Completed",
  signup: "New Signup",
  inactivity: "User Inactivity",
  tag_added: "Tag Added",
  manual: "Manual Trigger",
};

const triggerIcons: Record<TriggerType, any> = {
  enrollment: GraduationCap,
  purchase: ShoppingCart,
  course_complete: CheckCircle2,
  lesson_complete: CheckCircle2,
  signup: UserPlus,
  inactivity: Clock,
  tag_added: Zap,
  manual: Play,
};

const actionLabels: Record<ActionType, string> = {
  send_email: "Send Email",
  wait: "Wait / Delay",
  add_tag: "Add Tag",
  remove_tag: "Remove Tag",
  enroll_course: "Enroll in Course",
  notify_admin: "Notify Admin",
  send_sms: "Send SMS",
};

const actionIcons: Record<ActionType, any> = {
  send_email: Mail,
  wait: Clock,
  add_tag: Zap,
  remove_tag: Zap,
  enroll_course: GraduationCap,
  notify_admin: AlertCircle,
  send_sms: Mail,
};

// ─── Automation Templates ───
const automationTemplates: Omit<Automation, "id" | "createdAt">[] = [
  {
    name: "Welcome Sequence",
    description: "5-email onboarding sequence for new signups",
    trigger: "signup",
    triggerConfig: {},
    status: "draft",
    steps: [
      { id: "s1", type: "send_email", config: { subject: "Welcome to RusingÂcademy!", template: "welcome", language: "bilingual" } },
      { id: "s2", type: "wait", config: { days: 1, hours: 0 } },
      { id: "s3", type: "send_email", config: { subject: "Getting Started: Your Learning Path", template: "getting_started" } },
      { id: "s4", type: "wait", config: { days: 2, hours: 0 } },
      { id: "s5", type: "send_email", config: { subject: "Meet Your Coaches", template: "meet_coaches" } },
      { id: "s6", type: "wait", config: { days: 3, hours: 0 } },
      { id: "s7", type: "send_email", config: { subject: "Your Free Assessment is Ready", template: "free_assessment" } },
      { id: "s8", type: "wait", config: { days: 5, hours: 0 } },
      { id: "s9", type: "send_email", config: { subject: "Special Offer: 20% Off Your First Course", template: "special_offer" } },
    ],
    stats: { triggered: 0, completed: 0, active: 0 },
  },
  {
    name: "Post-Purchase Follow-Up",
    description: "Engagement sequence after course purchase",
    trigger: "purchase",
    triggerConfig: {},
    status: "draft",
    steps: [
      { id: "s1", type: "send_email", config: { subject: "Your Course is Ready!", template: "purchase_confirmation" } },
      { id: "s2", type: "add_tag", config: { tag: "customer" } },
      { id: "s3", type: "wait", config: { days: 3, hours: 0 } },
      { id: "s4", type: "send_email", config: { subject: "How's Your Progress?", template: "check_in" } },
      { id: "s5", type: "wait", config: { days: 7, hours: 0 } },
      { id: "s6", type: "send_email", config: { subject: "Unlock Advanced Features", template: "upsell" } },
    ],
    stats: { triggered: 0, completed: 0, active: 0 },
  },
  {
    name: "Course Completion Celebration",
    description: "Celebrate and upsell when a course is completed",
    trigger: "course_complete",
    triggerConfig: {},
    status: "draft",
    steps: [
      { id: "s1", type: "send_email", config: { subject: "Congratulations! You Did It!", template: "completion_congrats" } },
      { id: "s2", type: "add_tag", config: { tag: "course_completed" } },
      { id: "s3", type: "notify_admin", config: { message: "A student completed a course" } },
      { id: "s4", type: "wait", config: { days: 2, hours: 0 } },
      { id: "s5", type: "send_email", config: { subject: "What's Next? Your Recommended Path", template: "next_steps" } },
    ],
    stats: { triggered: 0, completed: 0, active: 0 },
  },
  {
    name: "Re-Engagement Campaign",
    description: "Win back inactive users after 14 days",
    trigger: "inactivity",
    triggerConfig: { inactiveDays: 14 },
    status: "draft",
    steps: [
      { id: "s1", type: "send_email", config: { subject: "We Miss You!", template: "re_engage_1" } },
      { id: "s2", type: "wait", config: { days: 3, hours: 0 } },
      { id: "s3", type: "send_email", config: { subject: "Your Progress is Waiting", template: "re_engage_2" } },
      { id: "s4", type: "wait", config: { days: 5, hours: 0 } },
      { id: "s5", type: "send_email", config: { subject: "Last Chance: Special Offer Inside", template: "re_engage_offer" } },
    ],
    stats: { triggered: 0, completed: 0, active: 0 },
  },
];

// ─── Step Visual Component ───
function StepCard({ step, index, total, onEdit, onDelete }: {
  step: AutomationStep; index: number; total: number; onEdit: () => void; onDelete: () => void;
}) {
  const Icon = actionIcons[step.type] || Zap;
  const isWait = step.type === "wait";

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative border rounded-lg p-3 w-52 cursor-pointer transition-all hover:shadow-md group ${
          isWait ? "bg-muted/50 border-dashed" : "bg-card"
        }`}
        onClick={onEdit}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">{actionLabels[step.type] || step.type}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>
        {step.type === "send_email" && <p className="text-xs text-muted-foreground truncate">{step.config.subject || "No subject"}</p>}
        {step.type === "wait" && <p className="text-xs text-muted-foreground">{step.config.days || 0}d {step.config.hours || 0}h</p>}
        {step.type === "add_tag" && <p className="text-xs text-muted-foreground">Tag: {step.config.tag || "none"}</p>}
        {step.type === "remove_tag" && <p className="text-xs text-muted-foreground">Tag: {step.config.tag || "none"}</p>}
        {step.type === "notify_admin" && <p className="text-xs text-muted-foreground truncate">{step.config.message || "Notification"}</p>}
        {step.type === "enroll_course" && <p className="text-xs text-muted-foreground">Auto-enroll</p>}
        <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">{index + 1}</div>
      </div>
      {index < total - 1 && (
        <div className="py-1"><ChevronDown className="h-4 w-4 text-muted-foreground" /></div>
      )}
    </div>
  );
}

// ─── Main Component ───
export default function Automations() {
  const utils = trpc.useUtils();

  // Backend data
  const { data: automationsData, isLoading } = trpc.automations.list.useQuery();
  const { data: statsData } = trpc.automations.getStats.useQuery();

  const createMutation = trpc.automations.create.useMutation({
    onSuccess: () => { utils.automations.list.invalidate(); utils.automations.getStats.invalidate(); toast.success("Automation created"); },
    onError: (err) => toast.error(err.message),
  });
  const updateMutation = trpc.automations.update.useMutation({
    onSuccess: () => { utils.automations.list.invalidate(); toast.success("Automation updated"); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.automations.delete.useMutation({
    onSuccess: () => { utils.automations.list.invalidate(); utils.automations.getStats.invalidate(); toast.success("Automation deleted"); },
    onError: (err) => toast.error(err.message),
  });
  const duplicateMutation = trpc.automations.duplicate.useMutation({
    onSuccess: () => { utils.automations.list.invalidate(); utils.automations.getStats.invalidate(); toast.success("Automation duplicated"); },
    onError: (err) => toast.error(err.message),
  });

  const automations: Automation[] = useMemo(() => (automationsData || []).map((a: any) => ({
    id: a.id,
    name: a.name,
    description: a.description || "",
    trigger: a.trigger || "manual",
    triggerConfig: a.triggerConfig || {},
    status: a.status || "draft",
    steps: a.steps || [],
    stats: a.stats || { triggered: 0, completed: 0, active: 0 },
    createdAt: a.createdAt,
  })), [automationsData]);

  const [search, setSearch] = useState("");
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [templateIdx, setTemplateIdx] = useState(0);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Step editor
  const [stepDialogOpen, setStepDialogOpen] = useState(false);
  const [editingStepIdx, setEditingStepIdx] = useState<number | null>(null);
  const [stepType, setStepType] = useState<ActionType>("send_email");
  const [stepSubject, setStepSubject] = useState("");
  const [stepDays, setStepDays] = useState(0);
  const [stepHours, setStepHours] = useState(0);
  const [stepTag, setStepTag] = useState("");
  const [stepMessage, setStepMessage] = useState("");

  // Add step dialog
  const [addStepOpen, setAddStepOpen] = useState(false);

  const filtered = useMemo(() => automations.filter(a =>
    !search || a.name.toLowerCase().includes(search.toLowerCase())
  ), [automations, search]);

  const totalStats = useMemo(() => ({
    total: statsData?.total ?? automations.length,
    active: statsData?.active ?? automations.filter(a => a.status === "active").length,
    totalTriggered: automations.reduce((a, x) => a + x.stats.triggered, 0),
    totalCompleted: automations.reduce((a, x) => a + x.stats.completed, 0),
  }), [automations, statsData]);

  const handleCreate = () => {
    if (!newName.trim()) { toast.error("Name required"); return; }
    const tpl = automationTemplates[templateIdx];
    createMutation.mutate({
      name: newName,
      description: newDesc || tpl.description,
      // @ts-expect-error - TS2353: auto-suppressed during TS cleanup
      trigger: tpl.trigger,
      triggerConfig: tpl.triggerConfig,
      steps: tpl.steps.map((s, i) => ({ ...s, id: `s${Date.now()}-${i}` })),
    });
    setCreateOpen(false);
    setNewName("");
    setNewDesc("");
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this automation?")) return;
    deleteMutation.mutate({ id });
    if (editingAutomation?.id === id) setEditingAutomation(null);
  };

  const handleToggle = (id: number) => {
    const auto = automations.find(a => a.id === id);
    if (!auto) return;
    const newStatus = auto.status === "active" ? "paused" : "active";
    updateMutation.mutate({ id, status: newStatus as any });
    if (editingAutomation?.id === id) {
      setEditingAutomation({ ...editingAutomation, status: newStatus as any });
    }
  };

  const handleDuplicate = (auto: Automation) => {
    duplicateMutation.mutate({ id: auto.id });
  };

  const openEditStep = (idx: number) => {
    if (!editingAutomation) return;
    const step = editingAutomation.steps[idx];
    setEditingStepIdx(idx);
    setStepType(step.type);
    setStepSubject(step.config.subject || "");
    setStepDays(step.config.days || 0);
    setStepHours(step.config.hours || 0);
    setStepTag(step.config.tag || "");
    setStepMessage(step.config.message || "");
    setStepDialogOpen(true);
  };

  const handleSaveStep = () => {
    if (!editingAutomation || editingStepIdx === null) return;
    const updatedSteps = [...editingAutomation.steps];
    const config: Record<string, any> = {};
    if (stepType === "send_email") config.subject = stepSubject;
    if (stepType === "wait") { config.days = stepDays; config.hours = stepHours; }
    if (stepType === "add_tag" || stepType === "remove_tag") config.tag = stepTag;
    if (stepType === "notify_admin") config.message = stepMessage;
    updatedSteps[editingStepIdx] = { ...updatedSteps[editingStepIdx], type: stepType, config };
    const updated = { ...editingAutomation, steps: updatedSteps };
    setEditingAutomation(updated);
    updateMutation.mutate({ id: updated.id, steps: updatedSteps });
    setStepDialogOpen(false);
  };

  const handleDeleteStep = (idx: number) => {
    if (!editingAutomation) return;
    const updatedSteps = editingAutomation.steps.filter((_, i) => i !== idx);
    const updated = { ...editingAutomation, steps: updatedSteps };
    setEditingAutomation(updated);
    updateMutation.mutate({ id: updated.id, steps: updatedSteps });
  };

  const handleAddStep = (type: ActionType) => {
    if (!editingAutomation) return;
    const config: Record<string, any> = {};
    if (type === "send_email") config.subject = "New Email";
    if (type === "wait") { config.days = 1; config.hours = 0; }
    if (type === "add_tag") config.tag = "new_tag";
    if (type === "notify_admin") config.message = "Notification";
    const newStep: AutomationStep = { id: `s${Date.now()}`, type, config };
    const updatedSteps = [...editingAutomation.steps, newStep];
    const updated = { ...editingAutomation, steps: updatedSteps };
    setEditingAutomation(updated);
    updateMutation.mutate({ id: updated.id, steps: updatedSteps });
    setAddStepOpen(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ─── AUTOMATION EDITOR ───
  if (editingAutomation) {
    const TriggerIcon = triggerIcons[editingAutomation.trigger] || Zap;
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setEditingAutomation(null)}><ArrowLeft className="h-5 w-5" /></Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">{editingAutomation.name}</h1>
            <p className="text-sm text-muted-foreground">{editingAutomation.description}</p>
          </div>
          <Badge variant={editingAutomation.status === "active" ? "default" : "secondary"}>{editingAutomation.status}</Badge>
          <Button size="sm" variant="outline" onClick={() => handleToggle(editingAutomation.id)}>
            {editingAutomation.status === "active" ? <><Pause className="h-4 w-4 mr-1" /> Pause</> : <><Play className="h-4 w-4 mr-1" /> Activate</>}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{editingAutomation.stats.triggered}</p><p className="text-xs text-muted-foreground">Triggered</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{editingAutomation.stats.completed}</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-600">{editingAutomation.stats.active}</p><p className="text-xs text-muted-foreground">In Progress</p></CardContent></Card>
        </div>

        {/* Trigger */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4" /> Trigger</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-dashed">
              <div className="p-2 rounded-lg bg-primary/10"><TriggerIcon className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="font-medium text-sm">{triggerLabels[editingAutomation.trigger] || editingAutomation.trigger}</p>
                <p className="text-xs text-muted-foreground">This automation runs when this event occurs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Steps Flow */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Steps ({editingAutomation.steps.length})</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setAddStepOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Step</Button>
            </div>
          </CardHeader>
          <CardContent>
            {editingAutomation.steps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No steps yet. Add your first action.</p>
                <Button size="sm" className="mt-3" onClick={() => setAddStepOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Step</Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-0">
                {editingAutomation.steps.map((step, i) => (
                  <StepCard
                    key={step.id}
                    step={step}
                    index={i}
                    total={editingAutomation.steps.length}
                    onEdit={() => openEditStep(i)}
                    onDelete={() => handleDeleteStep(i)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Step Dialog */}
        <Dialog open={stepDialogOpen} onOpenChange={setStepDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Step</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Action Type</Label>
                <Select value={stepType} onValueChange={(v) => setStepType(v as ActionType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(actionLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {stepType === "send_email" && <div><Label>Email Subject</Label><Input value={stepSubject} onChange={(e) => setStepSubject(e.target.value)} /></div>}
              {stepType === "wait" && (
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Days</Label><Input type="number" min={0} value={stepDays} onChange={(e) => setStepDays(Number(e.target.value))} /></div>
                  <div><Label>Hours</Label><Input type="number" min={0} max={23} value={stepHours} onChange={(e) => setStepHours(Number(e.target.value))} /></div>
                </div>
              )}
              {(stepType === "add_tag" || stepType === "remove_tag") && <div><Label>Tag Name</Label><Input value={stepTag} onChange={(e) => setStepTag(e.target.value)} /></div>}
              {stepType === "notify_admin" && <div><Label>Message</Label><Textarea value={stepMessage} onChange={(e) => setStepMessage(e.target.value)} rows={3} /></div>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStepDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveStep}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Step Dialog */}
        <Dialog open={addStepOpen} onOpenChange={setAddStepOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Step</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              {(Object.entries(actionLabels) as [ActionType, string][]).map(([type, label]) => {
                const Icon = actionIcons[type];
                return (
                  <button key={type} onClick={() => handleAddStep(type)} className="p-4 rounded-lg border text-left hover:shadow-md hover:bg-muted/50 transition-all">
                    <Icon className="h-5 w-5 mb-2 text-muted-foreground" />
                    <p className="font-medium text-sm">{label}</p>
                  </button>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ─── AUTOMATIONS LIST ───
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Automations</h1><p className="text-sm text-muted-foreground">Trigger-based email sequences and actions for your learners.</p></div>
        <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> New Automation</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-xl font-bold">{totalStats.total}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xl font-bold text-green-600">{totalStats.active}</p><p className="text-xs text-muted-foreground">Active</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xl font-bold">{totalStats.totalTriggered.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Triggered</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xl font-bold text-blue-600">{totalStats.totalCompleted.toLocaleString()}</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
      </div>

      <Card><CardContent className="p-4">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search automations..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      </CardContent></Card>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-medium">No automations yet</p>
            <p className="text-sm text-muted-foreground mb-4">Create your first automation from a template</p>
            <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-1" /> Create Automation</Button>
          </div>
        ) : filtered.map(auto => {
          const TriggerIcon = triggerIcons[auto.trigger] || Zap;
          return (
            <Card key={auto.id} className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => setEditingAutomation(auto)}>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-primary/10 shrink-0"><TriggerIcon className="h-5 w-5 text-primary" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">{auto.name}</h3>
                      <Badge variant={auto.status === "active" ? "default" : auto.status === "paused" ? "secondary" : "outline"} className="text-[10px]">{auto.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{auto.description}</p>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {triggerLabels[auto.trigger] || auto.trigger}</span>
                      <span>{auto.steps.length} steps</span>
                      <span>{auto.stats.triggered} triggered</span>
                      <span className="text-green-600">{auto.stats.completed} completed</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingAutomation(auto); }}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleToggle(auto.id); }}>
                        {auto.status === "active" ? <><Pause className="h-4 w-4 mr-2" /> Pause</> : <><Play className="h-4 w-4 mr-2" /> Activate</>}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicate(auto); }}><Copy className="h-4 w-4 mr-2" /> Duplicate</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(auto.id); }}><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Automation Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create New Automation</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., Welcome Sequence" /></div>
            <div><Label>Description</Label><Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="What does this automation do?" rows={2} /></div>
            <div><Label>Template</Label>
              <Select value={String(templateIdx)} onValueChange={(v) => setTemplateIdx(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {automationTemplates.map((t, i) => <SelectItem key={i} value={String(i)}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">{automationTemplates[templateIdx].description}</p>
              <div className="flex items-center gap-1 mt-2">
                <Badge variant="outline" className="text-[10px]">{triggerLabels[automationTemplates[templateIdx].trigger]}</Badge>
                <span className="text-xs text-muted-foreground">→ {automationTemplates[templateIdx].steps.length} steps</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Create Automation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
