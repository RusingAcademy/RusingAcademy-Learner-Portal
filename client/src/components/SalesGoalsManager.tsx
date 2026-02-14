import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Target,
  Plus,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Trash2,
  Trophy,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface Goal {
  id: number;
  name: string;
  description: string | null;
  goalType: "revenue" | "deals" | "leads" | "meetings" | "conversions";
  targetValue: number;
  currentValue: number;
  period: "weekly" | "monthly" | "quarterly" | "yearly";
  startDate: Date;
  endDate: Date;
  assignedTo: number | null;
  status: "active" | "completed" | "missed" | "cancelled";
  createdBy: number;
  createdAt: Date;
}

export default function SalesGoalsManager() {
  const { language } = useLanguage();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    goalType: "revenue" as Goal["goalType"],
    targetValue: 0,
    period: "monthly" as Goal["period"],
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });

  const labels = language === "fr" ? {
    title: "Objectifs de vente",
    subtitle: "Définissez et suivez vos objectifs commerciaux",
    createGoal: "Créer un objectif",
    editGoal: "Modifier l'objectif",
    name: "Nom",
    description: "Description",
    goalType: "Type d'objectif",
    targetValue: "Valeur cible",
    currentValue: "Valeur actuelle",
    period: "Période",
    startDate: "Date de début",
    endDate: "Date de fin",
    status: "Statut",
    progress: "Progression",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    revenue: "Chiffre d'affaires",
    deals: "Deals conclus",
    leads: "Leads générés",
    meetings: "Réunions tenues",
    conversions: "Conversions",
    weekly: "Hebdomadaire",
    monthly: "Mensuel",
    quarterly: "Trimestriel",
    yearly: "Annuel",
    active: "Actif",
    completed: "Terminé",
    missed: "Manqué",
    cancelled: "Annulé",
    noGoals: "Aucun objectif défini",
    createFirst: "Créez votre premier objectif de vente",
    daysRemaining: "jours restants",
    overdue: "En retard",
    onTrack: "En bonne voie",
    atRisk: "À risque",
    teamGoal: "Objectif d'équipe",
    activeGoals: "Objectifs actifs",
    completedGoals: "Objectifs atteints",
    totalTarget: "Cible totale",
    avgProgress: "Progression moyenne",
  } : {
    title: "Sales Goals",
    subtitle: "Define and track your sales objectives",
    createGoal: "Create Goal",
    editGoal: "Edit Goal",
    name: "Name",
    description: "Description",
    goalType: "Goal Type",
    targetValue: "Target Value",
    currentValue: "Current Value",
    period: "Period",
    startDate: "Start Date",
    endDate: "End Date",
    status: "Status",
    progress: "Progress",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    revenue: "Revenue",
    deals: "Deals Won",
    leads: "Leads Generated",
    meetings: "Meetings Held",
    conversions: "Conversions",
    weekly: "Weekly",
    monthly: "Monthly",
    quarterly: "Quarterly",
    yearly: "Yearly",
    active: "Active",
    completed: "Completed",
    missed: "Missed",
    cancelled: "Cancelled",
    noGoals: "No goals defined",
    createFirst: "Create your first sales goal",
    daysRemaining: "days remaining",
    overdue: "Overdue",
    onTrack: "On Track",
    atRisk: "At Risk",
    teamGoal: "Team Goal",
    activeGoals: "Active Goals",
    completedGoals: "Completed Goals",
    totalTarget: "Total Target",
    avgProgress: "Avg Progress",
  };

  const goalTypeLabels: Record<Goal["goalType"], string> = {
    revenue: labels.revenue,
    deals: labels.deals,
    leads: labels.leads,
    meetings: labels.meetings,
    conversions: labels.conversions,
  };

  const periodLabels: Record<Goal["period"], string> = {
    weekly: labels.weekly,
    monthly: labels.monthly,
    quarterly: labels.quarterly,
    yearly: labels.yearly,
  };

  const statusLabels: Record<Goal["status"], string> = {
    active: labels.active,
    completed: labels.completed,
    missed: labels.missed,
    cancelled: labels.cancelled,
  };

  // Queries
  const goalsQuery = trpc.crm.getSalesGoals.useQuery(undefined, { enabled: true });
  const createGoalMutation = trpc.crm.createSalesGoal.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Objectif créé" : "Goal created");
      goalsQuery.refetch();
      setShowCreateDialog(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(language === "fr" ? "Erreur de création" : "Creation failed");
      console.error(error);
    },
  });
  const updateGoalMutation = trpc.crm.updateSalesGoal.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Objectif mis à jour" : "Goal updated");
      goalsQuery.refetch();
      setEditingGoal(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(language === "fr" ? "Erreur de mise à jour" : "Update failed");
      console.error(error);
    },
  });
  const deleteGoalMutation = trpc.crm.deleteSalesGoal.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Objectif supprimé" : "Goal deleted");
      goalsQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(language === "fr" ? "Erreur de suppression" : "Delete failed");
      console.error(error);
    },
  });

  const goals = (goalsQuery.data?.goals || []) as unknown as Goal[];

  // Calculate summary stats
  const stats = useMemo(() => {
    const activeGoals = goals.filter(g => g.status === "active");
    const completedGoals = goals.filter(g => g.status === "completed");
    const totalTarget = activeGoals.reduce((sum, g) => sum + g.targetValue, 0);
    const avgProgress = activeGoals.length > 0
      ? Math.round(activeGoals.reduce((sum, g) => sum + (g.currentValue / g.targetValue) * 100, 0) / activeGoals.length)
      : 0;

    return {
      activeCount: activeGoals.length,
      completedCount: completedGoals.length,
      totalTarget,
      avgProgress,
    };
  }, [goals]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      goalType: "revenue",
      targetValue: 0,
      period: "monthly",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    });
  };

  const handleCreateGoal = () => {
    createGoalMutation.mutate({
      name: formData.name,
      description: formData.description || undefined,
      goalType: formData.goalType,
      targetValue: formData.targetValue,
      period: formData.period,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
    });
  };

  const handleUpdateGoal = () => {
    if (!editingGoal) return;
    updateGoalMutation.mutate({
      id: editingGoal.id,
      name: formData.name,
      description: formData.description || undefined,
      targetValue: formData.targetValue,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
    });
  };

  const handleDeleteGoal = (id: number) => {
    if (confirm(language === "fr" ? "Supprimer cet objectif ?" : "Delete this goal?")) {
      deleteGoalMutation.mutate({ id });
    }
  };

  const startEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      description: goal.description || "",
      goalType: goal.goalType,
      targetValue: goal.targetValue,
      period: goal.period,
      startDate: new Date(goal.startDate).toISOString().split("T")[0],
      endDate: new Date(goal.endDate).toISOString().split("T")[0],
    });
  };

  const getProgressStatus = (goal: Goal) => {
    const progress = (goal.currentValue / goal.targetValue) * 100;
    const now = new Date();
    const end = new Date(goal.endDate);
    const start = new Date(goal.startDate);
    const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDays = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const expectedProgress = (elapsedDays / totalDays) * 100;

    if (now > end && progress < 100) return "overdue";
    if (progress >= expectedProgress * 0.9) return "onTrack";
    return "atRisk";
  };

  const getDaysRemaining = (endDate: Date) => {
    const now = new Date();
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getGoalIcon = (type: Goal["goalType"]) => {
    switch (type) {
      case "revenue": return <DollarSign className="h-5 w-5" />;
      case "deals": return <Trophy className="h-5 w-5" />;
      case "leads": return <Users className="h-5 w-5" />;
      case "meetings": return <Calendar className="h-5 w-5" />;
      case "conversions": return <TrendingUp className="h-5 w-5" />;
    }
  };

  const formatValue = (value: number, type: Goal["goalType"]) => {
    if (type === "revenue") {
      return new Intl.NumberFormat(language === "fr" ? "fr-CA" : "en-CA", {
        style: "currency",
        currency: "CAD",
        minimumFractionDigits: 0,
      }).format(value);
    }
    return value.toLocaleString();
  };

  const GoalForm = () => (
    <div className="space-y-4">
      <div>
        <Label>{labels.name}</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={language === "fr" ? "Ex: Objectif Q1 2024" : "Ex: Q1 2024 Target"}
        />
      </div>
      <div>
        <Label>{labels.description}</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder={language === "fr" ? "Description optionnelle..." : "Optional description..."}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{labels.goalType}</Label>
          <Select
            value={formData.goalType}
            onValueChange={(value) => setFormData({ ...formData, goalType: value as Goal["goalType"] })}
            disabled={!!editingGoal}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">{labels.revenue}</SelectItem>
              <SelectItem value="deals">{labels.deals}</SelectItem>
              <SelectItem value="leads">{labels.leads}</SelectItem>
              <SelectItem value="meetings">{labels.meetings}</SelectItem>
              <SelectItem value="conversions">{labels.conversions}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>{labels.period}</Label>
          <Select
            value={formData.period}
            onValueChange={(value) => setFormData({ ...formData, period: value as Goal["period"] })}
            disabled={!!editingGoal}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">{labels.weekly}</SelectItem>
              <SelectItem value="monthly">{labels.monthly}</SelectItem>
              <SelectItem value="quarterly">{labels.quarterly}</SelectItem>
              <SelectItem value="yearly">{labels.yearly}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>{labels.targetValue}</Label>
        <Input
          type="number"
          value={formData.targetValue}
          onChange={(e) => setFormData({ ...formData, targetValue: parseInt(e.target.value) || 0 })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{labels.startDate}</Label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>
        <div>
          <Label>{labels.endDate}</Label>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6" />
            {labels.title}
          </h2>
          <p className="text-muted-foreground">{labels.subtitle}</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setShowCreateDialog(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              {labels.createGoal}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{labels.createGoal}</DialogTitle>
            </DialogHeader>
            <GoalForm />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                {labels.cancel}
              </Button>
              <Button onClick={handleCreateGoal} disabled={!formData.name || formData.targetValue <= 0}>
                {labels.save}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeCount}</p>
                <p className="text-sm text-muted-foreground">{labels.activeGoals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completedCount}</p>
                <p className="text-sm text-muted-foreground">{labels.completedGoals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-[#E7F2F2]">
                <DollarSign className="h-5 w-5 text-[#0F3D3E]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatValue(stats.totalTarget, "revenue")}</p>
                <p className="text-sm text-muted-foreground">{labels.totalTarget}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-100">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgProgress}%</p>
                <p className="text-sm text-muted-foreground">{labels.avgProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{labels.noGoals}</h3>
            <p className="text-muted-foreground mb-4">{labels.createFirst}</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {labels.createGoal}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const progress = Math.round((goal.currentValue / goal.targetValue) * 100);
            const progressStatus = getProgressStatus(goal);
            const daysRemaining = getDaysRemaining(goal.endDate);

            return (
              <Card key={goal.id} className={goal.status !== "active" ? "opacity-60" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-full ${
                        goal.goalType === "revenue" ? "bg-green-100 text-green-600" :
                        goal.goalType === "deals" ? "bg-yellow-100 text-yellow-600" :
                        goal.goalType === "leads" ? "bg-blue-100 text-blue-600" :
                        goal.goalType === "meetings" ? "bg-[#E7F2F2] text-[#0F3D3E]" :
                        "bg-orange-100 text-orange-600"
                      }`}>
                        {getGoalIcon(goal.goalType)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{goal.name}</CardTitle>
                        <CardDescription>
                          {goalTypeLabels[goal.goalType]} • {periodLabels[goal.period]}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(goal)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {goal.description && (
                    <p className="text-sm text-muted-foreground mb-4">{goal.description}</p>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>{formatValue(goal.currentValue, goal.goalType)}</span>
                      <span className="text-muted-foreground">
                        / {formatValue(goal.targetValue, goal.goalType)}
                      </span>
                    </div>

                    <Progress value={Math.min(progress, 100)} className="h-2" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            goal.status === "completed" ? "default" :
                            goal.status === "missed" ? "destructive" :
                            goal.status === "cancelled" ? "secondary" :
                            "outline"
                          }
                        >
                          {statusLabels[goal.status]}
                        </Badge>
                        {goal.status === "active" && (
                          <Badge
                            variant="outline"
                            className={
                              progressStatus === "onTrack" ? "border-green-500 text-green-600" :
                              progressStatus === "atRisk" ? "border-yellow-500 text-yellow-600" :
                              "border-red-500 text-red-600"
                            }
                          >
                            {progressStatus === "onTrack" ? (
                              <><CheckCircle className="h-3 w-3 mr-1" />{labels.onTrack}</>
                            ) : progressStatus === "atRisk" ? (
                              <><AlertTriangle className="h-3 w-3 mr-1" />{labels.atRisk}</>
                            ) : (
                              <><XCircle className="h-3 w-3 mr-1" />{labels.overdue}</>
                            )}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {daysRemaining > 0 ? (
                          <span>{daysRemaining} {labels.daysRemaining}</span>
                        ) : (
                          <span className="text-red-500">{labels.overdue}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingGoal} onOpenChange={(open) => !open && setEditingGoal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{labels.editGoal}</DialogTitle>
          </DialogHeader>
          <GoalForm />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditingGoal(null)}>
              {labels.cancel}
            </Button>
            <Button onClick={handleUpdateGoal} disabled={!formData.name || formData.targetValue <= 0}>
              {labels.save}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
