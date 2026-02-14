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
  Plus, Search, Workflow, MoreHorizontal, Edit, Copy, Trash2, Eye, EyeOff,
  ArrowRight, ArrowLeft, ChevronRight, UserPlus, ShoppingCart, CreditCard,
  CheckCircle2, Mail, Megaphone, Loader2
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// ─── Funnel Stage Types ───
type StageType = "opt_in" | "offer" | "checkout" | "upsell" | "confirmation" | "onboarding";

interface FunnelStage {
  id: string;
  type: StageType;
  title: string;
  description: string;
  config: Record<string, any>;
}

interface Funnel {
  id: number;
  name: string;
  description: string;
  status: "draft" | "active" | "paused" | "archived";
  stages: FunnelStage[];
  createdAt: string;
  stats: { visitors: number; conversions: number; revenue: number };
}

const stageIcons: Record<StageType, any> = {
  opt_in: UserPlus,
  offer: Megaphone,
  checkout: CreditCard,
  upsell: ShoppingCart,
  confirmation: CheckCircle2,
  onboarding: Mail,
};

const stageColors: Record<StageType, string> = {
  opt_in: "bg-blue-500/10 text-blue-600 border-blue-200",
  offer: "bg-purple-500/10 text-purple-600 border-purple-200",
  checkout: "bg-amber-500/10 text-amber-600 border-amber-200",
  upsell: "bg-orange-500/10 text-orange-600 border-orange-200",
  confirmation: "bg-green-500/10 text-green-600 border-green-200",
  onboarding: "bg-teal-500/10 text-teal-600 border-teal-200",
};

const stageLabels: Record<StageType, string> = {
  opt_in: "Opt-In",
  offer: "Offer Page",
  checkout: "Checkout",
  upsell: "Upsell",
  confirmation: "Confirmation",
  onboarding: "Onboarding",
};

// ─── Default funnel templates ───
const funnelTemplates: { name: string; description: string; stages: FunnelStage[] }[] = [
  {
    name: "Course Launch Funnel",
    description: "Classic 4-step funnel: capture leads → present offer → checkout → welcome",
    stages: [
      { id: "s1", type: "opt_in", title: "Free Resource Opt-In", description: "Capture email with a free PDF guide or mini-course", config: { formFields: ["name", "email"], leadMagnet: "Free SLE Prep Guide" } },
      { id: "s2", type: "offer", title: "Course Offer Page", description: "Present the full course with testimonials and pricing", config: { headline: "Master the SLE Exam", cta: "Enroll Now" } },
      { id: "s3", type: "checkout", title: "Secure Checkout", description: "Stripe-powered checkout with coupon support", config: { paymentMethods: ["card"], allowCoupons: true } },
      { id: "s4", type: "confirmation", title: "Welcome & Access", description: "Confirmation page with course access link and next steps", config: { redirectUrl: "/dashboard", sendEmail: true } },
    ],
  },
  {
    name: "Coaching Enrollment Funnel",
    description: "3-step funnel: trial booking → coaching package → confirmation",
    stages: [
      { id: "s1", type: "opt_in", title: "Book Free Trial", description: "Schedule a free 15-min trial session", config: { formFields: ["name", "email", "phone"], trialDuration: 15 } },
      { id: "s2", type: "offer", title: "Coaching Packages", description: "Present 5-session and 10-session coaching packages", config: { packages: ["5-session", "10-session"] } },
      { id: "s3", type: "checkout", title: "Secure Payment", description: "Stripe checkout for coaching package", config: { paymentMethods: ["card"], allowCoupons: true } },
    ],
  },
  {
    name: "Webinar Registration Funnel",
    description: "2-step funnel: register → attend → upsell",
    stages: [
      { id: "s1", type: "opt_in", title: "Webinar Registration", description: "Register for the free webinar", config: { formFields: ["name", "email"] } },
      { id: "s2", type: "offer", title: "Replay + Offer", description: "Watch replay and see exclusive offer", config: {} },
      { id: "s3", type: "upsell", title: "Premium Upsell", description: "One-time offer for premium bundle", config: { discount: "30%" } },
      { id: "s4", type: "confirmation", title: "Thank You", description: "Confirmation with access details", config: {} },
    ],
  },
];

// ─── Stage Card Component ───
function StageCard({ stage, index, total, onEdit, onDelete }: {
  stage: FunnelStage; index: number; total: number; onEdit: () => void; onDelete: () => void;
}) {
  const Icon = stageIcons[stage.type] || Workflow;
  return (
    <div className="flex items-center">
      <div className={`relative p-4 rounded-xl border-2 min-w-[180px] max-w-[200px] ${stageColors[stage.type]} cursor-pointer hover:shadow-lg transition-all group`} onClick={onEdit}>
        <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-background border-2 flex items-center justify-center text-xs font-bold">{index + 1}</div>
        <Icon className="h-5 w-5 mb-2" />
        <p className="font-semibold text-sm leading-tight">{stage.title}</p>
        <p className="text-xs mt-1 opacity-70 line-clamp-2">{stage.description}</p>
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onDelete(); }}><Trash2 className="h-3 w-3" /></Button>
        </div>
      </div>
      {index < total - 1 && (
        <div className="flex items-center px-1 shrink-0">
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

// ─── Main Funnel Builder ───
export default function FunnelBuilder() {
  const utils = trpc.useUtils();

  // Backend data
  const { data: funnelsData, isLoading } = trpc.funnels.list.useQuery();
  const { data: statsData } = trpc.funnels.getStats.useQuery();

  const createMutation = trpc.funnels.create.useMutation({
    onSuccess: () => { utils.funnels.list.invalidate(); utils.funnels.getStats.invalidate(); toast.success("Funnel created from template"); },
    onError: (err) => toast.error(err.message),
  });
  const updateMutation = trpc.funnels.update.useMutation({
    onSuccess: () => { utils.funnels.list.invalidate(); toast.success("Funnel updated"); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.funnels.delete.useMutation({
    onSuccess: () => { utils.funnels.list.invalidate(); utils.funnels.getStats.invalidate(); toast.success("Funnel deleted"); },
    onError: (err) => toast.error(err.message),
  });
  const duplicateMutation = trpc.funnels.duplicate.useMutation({
    onSuccess: () => { utils.funnels.list.invalidate(); utils.funnels.getStats.invalidate(); toast.success("Funnel duplicated"); },
    onError: (err) => toast.error(err.message),
  });

  const funnels: Funnel[] = useMemo(() => (funnelsData || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    description: f.description || "",
    status: f.status || "draft",
    stages: f.stages || [],
    createdAt: f.createdAt,
    stats: f.stats || { visitors: 0, conversions: 0, revenue: 0 },
  })), [funnelsData]);

  const [search, setSearch] = useState("");
  const [editingFunnel, setEditingFunnel] = useState<Funnel | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [templateIndex, setTemplateIndex] = useState(0);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Stage editor
  const [stageDialogOpen, setStageDialogOpen] = useState(false);
  const [editingStageIndex, setEditingStageIndex] = useState<number | null>(null);
  const [stageTitle, setStageTitle] = useState("");
  const [stageDesc, setStageDesc] = useState("");
  const [stageType, setStageType] = useState<StageType>("opt_in");

  // Add stage dialog
  const [addStageOpen, setAddStageOpen] = useState(false);

  const filtered = useMemo(() => funnels.filter(f =>
    !search || f.name.toLowerCase().includes(search.toLowerCase())
  ), [funnels, search]);

  const totalStats = useMemo(() => ({
    funnels: statsData?.total ?? funnels.length,
    active: statsData?.active ?? funnels.filter(f => f.status === "active").length,
    totalVisitors: funnels.reduce((a, f) => a + f.stats.visitors, 0),
    totalRevenue: funnels.reduce((a, f) => a + f.stats.revenue, 0),
  }), [funnels, statsData]);

  // Handlers
  const handleCreateFunnel = () => {
    if (!newName.trim()) { toast.error("Funnel name required"); return; }
    const template = funnelTemplates[templateIndex];
    createMutation.mutate({
      name: newName,
      description: newDesc || template.description,
      stages: template.stages.map((s, i) => ({ ...s, id: `s${Date.now()}-${i}` })),
    });
    setCreateOpen(false);
    setNewName("");
    setNewDesc("");
  };

  const handleDeleteFunnel = (id: number) => {
    if (!confirm("Delete this funnel?")) return;
    deleteMutation.mutate({ id });
    if (editingFunnel?.id === id) setEditingFunnel(null);
  };

  const handleToggleStatus = (id: number) => {
    const funnel = funnels.find(f => f.id === id);
    if (!funnel) return;
    const newStatus = funnel.status === "active" ? "paused" : "active";
    updateMutation.mutate({ id, status: newStatus as any });
    if (editingFunnel?.id === id) {
      setEditingFunnel({ ...editingFunnel, status: newStatus as any });
    }
  };

  const handleDuplicateFunnel = (funnel: Funnel) => {
    duplicateMutation.mutate({ id: funnel.id });
  };

  const openEditStage = (index: number) => {
    if (!editingFunnel) return;
    const stage = editingFunnel.stages[index];
    setEditingStageIndex(index);
    setStageTitle(stage.title);
    setStageDesc(stage.description);
    setStageType(stage.type);
    setStageDialogOpen(true);
  };

  const handleSaveStage = () => {
    if (!editingFunnel || editingStageIndex === null) return;
    const updatedStages = [...editingFunnel.stages];
    updatedStages[editingStageIndex] = {
      ...updatedStages[editingStageIndex],
      title: stageTitle,
      description: stageDesc,
      type: stageType,
    };
    const updated = { ...editingFunnel, stages: updatedStages };
    setEditingFunnel(updated);
    updateMutation.mutate({ id: updated.id, stages: updatedStages });
    setStageDialogOpen(false);
  };

  const handleDeleteStage = (index: number) => {
    if (!editingFunnel) return;
    if (!confirm("Remove this stage?")) return;
    const updatedStages = editingFunnel.stages.filter((_, i) => i !== index);
    const updated = { ...editingFunnel, stages: updatedStages };
    setEditingFunnel(updated);
    updateMutation.mutate({ id: updated.id, stages: updatedStages });
  };

  const handleAddStage = (type: StageType) => {
    if (!editingFunnel) return;
    const newStage: FunnelStage = {
      id: `s${Date.now()}`,
      type,
      title: stageLabels[type],
      description: `New ${stageLabels[type].toLowerCase()} stage`,
      config: {},
    };
    const updatedStages = [...editingFunnel.stages, newStage];
    const updated = { ...editingFunnel, stages: updatedStages };
    setEditingFunnel(updated);
    updateMutation.mutate({ id: updated.id, stages: updatedStages });
    setAddStageOpen(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ─── FUNNEL EDITOR VIEW ───
  if (editingFunnel) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setEditingFunnel(null)}><ArrowLeft className="h-5 w-5" /></Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">{editingFunnel.name}</h1>
            <p className="text-sm text-muted-foreground">{editingFunnel.description}</p>
          </div>
          <Badge variant={editingFunnel.status === "active" ? "default" : "secondary"}>{editingFunnel.status}</Badge>
          <Button size="sm" variant="outline" onClick={() => handleToggleStatus(editingFunnel.id)}>
            {editingFunnel.status === "active" ? <><EyeOff className="h-4 w-4 mr-1" /> Pause</> : <><Eye className="h-4 w-4 mr-1" /> Activate</>}
          </Button>
        </div>

        {/* Pipeline Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{editingFunnel.stats.visitors.toLocaleString()}</p><p className="text-xs text-muted-foreground">Visitors</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{editingFunnel.stats.conversions}</p><p className="text-xs text-muted-foreground">Conversions</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">${editingFunnel.stats.revenue.toLocaleString()}</p><p className="text-xs text-muted-foreground">Revenue</p></CardContent></Card>
        </div>

        {/* Visual Pipeline */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><Workflow className="h-4 w-4" /> Pipeline Stages</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setAddStageOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Stage</Button>
            </div>
            <p className="text-xs text-muted-foreground">Visual representation of your funnel flow. Click a stage to edit.</p>
          </CardHeader>
          <CardContent>
            {editingFunnel.stages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Workflow className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No stages yet. Add your first stage to build the funnel.</p>
                <Button size="sm" className="mt-3" onClick={() => setAddStageOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Stage</Button>
              </div>
            ) : (
              <div className="flex items-center overflow-x-auto pb-4 gap-0">
                {editingFunnel.stages.map((stage, index) => (
                  <StageCard
                    key={stage.id}
                    stage={stage}
                    index={index}
                    total={editingFunnel.stages.length}
                    onEdit={() => openEditStage(index)}
                    onDelete={() => handleDeleteStage(index)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stage Details Table */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Stage Configuration</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left">
                  <th className="pb-2 font-medium">#</th>
                  <th className="pb-2 font-medium">Stage</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Description</th>
                  <th className="pb-2 font-medium text-right">Actions</th>
                </tr></thead>
                <tbody>
                  {editingFunnel.stages.map((stage, i) => {
                    const Icon = stageIcons[stage.type] || Workflow;
                    return (
                      <tr key={stage.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-2.5 text-muted-foreground">{i + 1}</td>
                        <td className="py-2.5 font-medium flex items-center gap-2"><Icon className="h-4 w-4" /> {stage.title}</td>
                        <td className="py-2.5"><Badge variant="outline" className="text-xs">{stageLabels[stage.type] || stage.type}</Badge></td>
                        <td className="py-2.5 text-muted-foreground max-w-xs truncate">{stage.description}</td>
                        <td className="py-2.5 text-right">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditStage(i)}><Edit className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteStage(i)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Stage Dialog */}
        <Dialog open={stageDialogOpen} onOpenChange={setStageDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Stage</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Stage Type</Label>
                <Select value={stageType} onValueChange={(v) => setStageType(v as StageType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(stageLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Title</Label><Input value={stageTitle} onChange={(e) => setStageTitle(e.target.value)} /></div>
              <div><Label>Description</Label><Textarea value={stageDesc} onChange={(e) => setStageDesc(e.target.value)} rows={3} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStageDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveStage}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Stage Dialog */}
        <Dialog open={addStageOpen} onOpenChange={setAddStageOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Stage</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              {(Object.entries(stageLabels) as [StageType, string][]).map(([type, label]) => {
                const Icon = stageIcons[type];
                return (
                  <button
                    key={type}
                    onClick={() => handleAddStage(type)}
                    className={`p-4 rounded-lg border text-left hover:shadow-md transition-all ${stageColors[type]}`}
                  >
                    <Icon className="h-5 w-5 mb-2" />
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

  // ─── FUNNEL LIST VIEW ───
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Funnels</h1><p className="text-sm text-muted-foreground">Build conversion pipelines: opt-in → offer → checkout → confirmation.</p></div>
        <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> New Funnel</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-xl font-bold">{totalStats.funnels}</p><p className="text-xs text-muted-foreground">Total Funnels</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xl font-bold text-green-600">{totalStats.active}</p><p className="text-xs text-muted-foreground">Active</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xl font-bold">{totalStats.totalVisitors.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Visitors</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xl font-bold">${totalStats.totalRevenue.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Revenue</p></CardContent></Card>
      </div>

      <Card><CardContent className="p-4">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search funnels..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      </CardContent></Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-medium">No funnels yet</p>
            <p className="text-sm text-muted-foreground mb-4">Create your first funnel from a template</p>
            <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-1" /> Create Funnel</Button>
          </div>
        ) : filtered.map(funnel => (
          <Card key={funnel.id} className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => setEditingFunnel(funnel)}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <Badge variant={funnel.status === "active" ? "default" : funnel.status === "paused" ? "secondary" : "outline"}>{funnel.status}</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingFunnel(funnel); }}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleToggleStatus(funnel.id); }}>
                      {funnel.status === "active" ? <><EyeOff className="h-4 w-4 mr-2" /> Pause</> : <><Eye className="h-4 w-4 mr-2" /> Activate</>}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicateFunnel(funnel); }}><Copy className="h-4 w-4 mr-2" /> Duplicate</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteFunnel(funnel.id); }}><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">{funnel.name}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{funnel.description}</p>
              {/* Mini pipeline preview */}
              <div className="flex items-center gap-1 mb-3">
                {funnel.stages.map((stage, i) => {
                  const Icon = stageIcons[stage.type] || Workflow;
                  return (
                    <div key={stage.id} className="flex items-center gap-1">
                      <div className={`p-1 rounded ${stageColors[stage.type] || "bg-gray-100"}`}><Icon className="h-3 w-3" /></div>
                      {i < funnel.stages.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{funnel.stages.length} stages</span>
                <span>{funnel.stats.visitors.toLocaleString()} visitors</span>
                <span>{funnel.stats.conversions} conversions</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Funnel Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create New Funnel</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Funnel Name</Label><Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., SLE Course Launch" /></div>
            <div><Label>Description</Label><Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="What is this funnel for?" rows={2} /></div>
            <div><Label>Template</Label>
              <Select value={String(templateIndex)} onValueChange={(v) => setTemplateIndex(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {funnelTemplates.map((t, i) => (
                    <SelectItem key={i} value={String(i)}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">{funnelTemplates[templateIndex].description}</p>
              <div className="flex items-center gap-1 mt-2">
                {funnelTemplates[templateIndex].stages.map((s, i) => {
                  const Icon = stageIcons[s.type];
                  return (
                    <div key={i} className="flex items-center gap-1">
                      <div className={`p-1 rounded ${stageColors[s.type]}`}><Icon className="h-3 w-3" /></div>
                      {i < funnelTemplates[templateIndex].stages.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFunnel} disabled={createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Create Funnel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
