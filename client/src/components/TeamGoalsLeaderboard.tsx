import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trophy,
  Medal,
  Award,
  Users,
  Target,
  Plus,
  Crown,
  TrendingUp,
  Calendar,
  UserPlus,
  Trash2,
} from "lucide-react";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  target: number;
  progress: number;
  rank: number;
}

interface TeamGoal {
  id: number;
  name: string;
  goalType: string;
  targetValue: number;
  currentValue: number;
  period: string;
  startDate: string;
  endDate: string;
  status: string;
  members: TeamMember[];
}

export default function TeamGoalsLeaderboard() {
  const { language } = useLanguage();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<TeamGoal | null>(null);
  const [newGoal, setNewGoal] = useState({
    name: "",
    goalType: "revenue" as "revenue" | "deals" | "leads" | "meetings" | "conversions",
    targetValue: 100000,
    period: "monthly" as "weekly" | "monthly" | "quarterly" | "yearly",
  });
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [individualTarget, setIndividualTarget] = useState<number>(0);

  const labels = language === "fr" ? {
    title: "Objectifs d'équipe",
    subtitle: "Classement et progression des membres de l'équipe",
    createGoal: "Créer un objectif d'équipe",
    assignMember: "Assigner un membre",
    goalName: "Nom de l'objectif",
    goalType: "Type",
    target: "Cible",
    period: "Période",
    revenue: "Revenus",
    deals: "Transactions",
    leads: "Leads",
    meetings: "Réunions",
    conversions: "Conversions",
    weekly: "Hebdomadaire",
    monthly: "Mensuel",
    quarterly: "Trimestriel",
    yearly: "Annuel",
    create: "Créer",
    cancel: "Annuler",
    assign: "Assigner",
    leaderboard: "Classement",
    rank: "Rang",
    member: "Membre",
    progress: "Progression",
    contribution: "Contribution",
    teamProgress: "Progression de l'équipe",
    individualTarget: "Cible individuelle",
    selectMember: "Sélectionner un membre",
    noGoals: "Aucun objectif d'équipe créé",
    createFirst: "Créez votre premier objectif d'équipe",
    topPerformer: "Meilleur performeur",
    onTrack: "En bonne voie",
    atRisk: "À risque",
    behind: "En retard",
    daysRemaining: "jours restants",
    completed: "Complété",
  } : {
    title: "Team Goals",
    subtitle: "Team member rankings and progress",
    createGoal: "Create Team Goal",
    assignMember: "Assign Member",
    goalName: "Goal Name",
    goalType: "Type",
    target: "Target",
    period: "Period",
    revenue: "Revenue",
    deals: "Deals",
    leads: "Leads",
    meetings: "Meetings",
    conversions: "Conversions",
    weekly: "Weekly",
    monthly: "Monthly",
    quarterly: "Quarterly",
    yearly: "Yearly",
    create: "Create",
    cancel: "Cancel",
    assign: "Assign",
    leaderboard: "Leaderboard",
    rank: "Rank",
    member: "Member",
    progress: "Progress",
    contribution: "Contribution",
    teamProgress: "Team Progress",
    individualTarget: "Individual Target",
    selectMember: "Select Member",
    noGoals: "No team goals created",
    createFirst: "Create your first team goal",
    topPerformer: "Top Performer",
    onTrack: "On Track",
    atRisk: "At Risk",
    behind: "Behind",
    daysRemaining: "days remaining",
    completed: "Completed",
  };

  // Fetch goals
  const goalsQuery = trpc.crm.getSalesGoals.useQuery();
  const usersQuery = trpc.admin.getAnalytics.useQuery();
  const createGoalMutation = trpc.crm.createSalesGoal.useMutation({
    onSuccess: () => {
      goalsQuery.refetch();
      setShowCreateDialog(false);
      setNewGoal({ name: "", goalType: "revenue", targetValue: 100000, period: "monthly" });
    },
  });
  const assignMemberMutation = trpc.crm.assignTeamGoalMember.useMutation({
    onSuccess: () => {
      goalsQuery.refetch();
      setShowAssignDialog(false);
      setSelectedUserId("");
      setIndividualTarget(0);
    },
  });

  // Transform goals data with mock team members for display
  const teamGoals = useMemo(() => {
    const goalsData = goalsQuery.data;
    const goals = goalsData && 'goals' in goalsData ? goalsData.goals : (Array.isArray(goalsData) ? goalsData : []);
    
    // Create mock team members for demonstration
    const mockMembers: TeamMember[] = [
      { id: 1, name: "Alice Martin", email: "alice@example.com", target: 25000, progress: 28000, rank: 1 },
      { id: 2, name: "Bob Johnson", email: "bob@example.com", target: 25000, progress: 22000, rank: 2 },
      { id: 3, name: "Carol Williams", email: "carol@example.com", target: 25000, progress: 18000, rank: 3 },
      { id: 4, name: "David Brown", email: "david@example.com", target: 25000, progress: 15000, rank: 4 },
    ];

    return goals.map(goal => ({
      ...goal,
      members: mockMembers.map(m => ({
        ...m,
        target: Math.round(goal.targetValue / 4),
        progress: Math.round((m.progress / 25000) * (goal.targetValue / 4)),
      })).sort((a, b) => b.progress - a.progress).map((m, i) => ({ ...m, rank: i + 1 })),
    })) as unknown as TeamGoal[];
  }, [goalsQuery.data]);

  const formatValue = (value: number, goalType: string) => {
    if (goalType === "revenue") {
      return new Intl.NumberFormat(language === "fr" ? "fr-CA" : "en-CA", {
        style: "currency",
        currency: "CAD",
        minimumFractionDigits: 0,
      }).format(value);
    }
    return value.toLocaleString();
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-muted-foreground font-medium">{rank}</span>;
    }
  };

  const getStatusBadge = (progress: number, target: number, endDate: string) => {
    const percentage = (progress / target) * 100;
    const daysLeft = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const expectedProgress = daysLeft > 0 ? 100 - (daysLeft / 30) * 100 : 100;

    if (percentage >= 100) {
      return <Badge className="bg-green-500">{labels.completed}</Badge>;
    }
    if (percentage >= expectedProgress - 10) {
      return <Badge className="bg-blue-500">{labels.onTrack}</Badge>;
    }
    if (percentage >= expectedProgress - 25) {
      return <Badge className="bg-yellow-500">{labels.atRisk}</Badge>;
    }
    return <Badge className="bg-red-500">{labels.behind}</Badge>;
  };

  const handleCreateGoal = () => {
    const now = new Date();
    let endDate = new Date(now);
    
    switch (newGoal.period) {
      case "weekly":
        endDate.setDate(endDate.getDate() + 7);
        break;
      case "monthly":
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case "quarterly":
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case "yearly":
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    createGoalMutation.mutate({
      name: newGoal.name,
      goalType: newGoal.goalType,
      targetValue: newGoal.targetValue,
      period: newGoal.period,
      startDate: now,
      endDate: endDate,
    });
  };

  const handleAssignMember = () => {
    if (!selectedGoal || !selectedUserId) return;
    
    assignMemberMutation.mutate({
      goalId: selectedGoal.id,
      userId: parseInt(selectedUserId),
      individualTarget,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            {labels.title}
          </h2>
          <p className="text-muted-foreground">{labels.subtitle}</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {labels.createGoal}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{labels.createGoal}</DialogTitle>
              <DialogDescription>
                {language === "fr" 
                  ? "Créez un objectif partagé pour votre équipe"
                  : "Create a shared goal for your team"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{labels.goalName}</Label>
                <Input
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  placeholder={language === "fr" ? "Ex: Objectif Q1 2026" : "E.g., Q1 2026 Target"}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{labels.goalType}</Label>
                  <Select
                    value={newGoal.goalType}
                    onValueChange={(v) => setNewGoal({ ...newGoal, goalType: v as typeof newGoal.goalType })}
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
                    value={newGoal.period}
                    onValueChange={(v) => setNewGoal({ ...newGoal, period: v as typeof newGoal.period })}
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
                <Label>{labels.target}</Label>
                <Input
                  type="number"
                  value={newGoal.targetValue}
                  onChange={(e) => setNewGoal({ ...newGoal, targetValue: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                {labels.cancel}
              </Button>
              <Button onClick={handleCreateGoal} disabled={!newGoal.name || createGoalMutation.isPending}>
                {labels.create}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Goals */}
      {teamGoals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">{labels.noGoals}</h3>
            <p className="text-muted-foreground">{labels.createFirst}</p>
          </CardContent>
        </Card>
      ) : (
        teamGoals.map((goal) => {
          const progress = (goal.currentValue / goal.targetValue) * 100;
          const daysLeft = Math.ceil((new Date(goal.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

          return (
            <Card key={goal.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      {goal.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {daysLeft > 0 ? `${daysLeft} ${labels.daysRemaining}` : labels.completed}
                      </span>
                      <Badge variant="outline">
                        {labels[goal.goalType as keyof typeof labels] || goal.goalType}
                      </Badge>
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {formatValue(goal.currentValue, goal.goalType)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      / {formatValue(goal.targetValue, goal.goalType)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Team Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{labels.teamProgress}</span>
                    <span className="text-sm text-muted-foreground">{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-3" />
                </div>

                {/* Leaderboard */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Crown className="h-4 w-4 text-yellow-500" />
                      {labels.leaderboard}
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedGoal(goal);
                        setShowAssignDialog(true);
                      }}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      {labels.assignMember}
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">{labels.rank}</TableHead>
                        <TableHead>{labels.member}</TableHead>
                        <TableHead className="text-right">{labels.progress}</TableHead>
                        <TableHead className="text-right">{labels.contribution}</TableHead>
                        <TableHead className="w-24"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {goal.members.map((member) => {
                        const memberProgress = (member.progress / member.target) * 100;
                        const contribution = goal.currentValue > 0 
                          ? ((member.progress / goal.currentValue) * 100).toFixed(1)
                          : "0";

                        return (
                          <TableRow key={member.id}>
                            <TableCell>
                              <div className="flex items-center justify-center">
                                {getRankIcon(member.rank)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={member.avatar} />
                                  <AvatarFallback>
                                    {member.name.split(" ").map(n => n[0]).join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{member.name}</p>
                                  <p className="text-xs text-muted-foreground">{member.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="space-y-1">
                                <p className="font-medium">
                                  {formatValue(member.progress, goal.goalType)}
                                </p>
                                <Progress value={Math.min(memberProgress, 100)} className="h-1.5 w-24 ml-auto" />
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline">
                                {contribution}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(member.progress, member.target, goal.endDate)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Top Performer Highlight */}
                {goal.members.length > 0 && (
                  <div className="bg-gradient-to-r from-[#FFFBEB] to-[#FFF8F3] dark:from-yellow-900/20 dark:to-[#7C2D12]/20 rounded-lg p-4 flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                      <Trophy className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{labels.topPerformer}</p>
                      <p className="font-bold text-lg">{goal.members[0].name}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-2xl font-bold text-yellow-600">
                        {formatValue(goal.members[0].progress, goal.goalType)}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 justify-end">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        {((goal.members[0].progress / goal.members[0].target) * 100).toFixed(0)}% {language === "fr" ? "de la cible" : "of target"}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}

      {/* Assign Member Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{labels.assignMember}</DialogTitle>
            <DialogDescription>
              {language === "fr"
                ? `Assigner un membre à l'objectif "${selectedGoal?.name}"`
                : `Assign a member to goal "${selectedGoal?.name}"`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{labels.selectMember}</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder={labels.selectMember} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Alice Martin</SelectItem>
                  <SelectItem value="2">Bob Johnson</SelectItem>
                  <SelectItem value="3">Carol Williams</SelectItem>
                  <SelectItem value="4">David Brown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{labels.individualTarget}</Label>
              <Input
                type="number"
                value={individualTarget}
                onChange={(e) => setIndividualTarget(parseInt(e.target.value) || 0)}
                placeholder={selectedGoal ? formatValue(Math.round(selectedGoal.targetValue / 4), selectedGoal.goalType) : ""}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              {labels.cancel}
            </Button>
            <Button 
              onClick={handleAssignMember} 
              disabled={!selectedUserId || assignMemberMutation.isPending}
            >
              {labels.assign}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
