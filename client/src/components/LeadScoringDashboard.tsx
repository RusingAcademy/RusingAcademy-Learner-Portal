import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  Target,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Filter,
  ChevronRight,
  Zap,
  Award,
  Activity,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface LeadActivity {
  id: number;
  type: string;
  description: string | null;
  timestamp: Date;
  metadata?: unknown;
}

interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  company: string | null;
  leadScore: number | null;
  status: string | null;
  source: string;
  createdAt: Date;
  lastContactedAt: Date | null;
  activities?: LeadActivity[];
}

export default function LeadScoringDashboard() {
  const { language } = useLanguage();
  const [sortBy, setSortBy] = useState<"score" | "recent" | "activity">("score");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Fetch leads with scores
  const leadsQuery = trpc.crm.getLeadsWithScores.useQuery({
    sortBy,
    status: filterStatus === "all" ? undefined : filterStatus,
    limit: 50,
  });

  // Fetch lead activities when a lead is selected
  const activitiesQuery = trpc.crm.getLeadActivities.useQuery(
    { leadId: selectedLead?.id || 0 },
    { enabled: !!selectedLead }
  );

  // Fetch scoring stats
  const statsQuery = trpc.crm.getLeadScoringStats.useQuery();

  const t = {
    en: {
      title: "Lead Scoring Dashboard",
      subtitle: "Track and prioritize your highest-value leads",
      leaderboard: "Leaderboard",
      timeline: "Activity Timeline",
      insights: "Insights",
      topLeads: "Top Leads",
      recentActivity: "Recent Activity",
      highPotential: "High Potential",
      score: "Score",
      rank: "Rank",
      conversionProb: "Conversion Probability",
      lastContact: "Last Contact",
      activities: "Activities",
      viewProfile: "View Profile",
      sortBy: "Sort by",
      sortScore: "Highest Score",
      sortRecent: "Most Recent",
      sortActivity: "Most Active",
      filterStatus: "Filter by Status",
      all: "All Statuses",
      new: "New",
      contacted: "Contacted",
      qualified: "Qualified",
      negotiating: "Negotiating",
      avgScore: "Average Score",
      hotLeads: "Hot Leads",
      warmLeads: "Warm Leads",
      coldLeads: "Cold Leads",
      noLeads: "No leads found",
      loading: "Loading...",
      refresh: "Refresh",
      scoreBreakdown: "Score Breakdown",
      engagement: "Engagement",
      fit: "Fit Score",
      behavior: "Behavior",
      activityTypes: {
        created: "Lead created",
        status_changed: "Status changed",
        assigned: "Assigned to team member",
        contacted: "Contact made",
        note_added: "Note added",
        email_sent: "Email sent",
        call_made: "Call made",
        meeting_scheduled: "Meeting scheduled",
        proposal_sent: "Proposal sent",
        converted: "Converted to customer",
        email_opened: "Opened email",
        email_clicked: "Clicked email link",
      },
      daysAgo: "days ago",
      today: "Today",
      yesterday: "Yesterday",
    },
    fr: {
      title: "Tableau de bord de notation des leads",
      subtitle: "Suivez et priorisez vos leads les plus précieux",
      leaderboard: "Classement",
      timeline: "Chronologie d'activité",
      insights: "Aperçus",
      topLeads: "Meilleurs leads",
      recentActivity: "Activité récente",
      highPotential: "Haut potentiel",
      score: "Score",
      rank: "Rang",
      conversionProb: "Probabilité de conversion",
      lastContact: "Dernier contact",
      activities: "Activités",
      viewProfile: "Voir le profil",
      sortBy: "Trier par",
      sortScore: "Score le plus élevé",
      sortRecent: "Plus récent",
      sortActivity: "Plus actif",
      filterStatus: "Filtrer par statut",
      all: "Tous les statuts",
      new: "Nouveau",
      contacted: "Contacté",
      qualified: "Qualifié",
      negotiating: "En négociation",
      avgScore: "Score moyen",
      hotLeads: "Leads chauds",
      warmLeads: "Leads tièdes",
      coldLeads: "Leads froids",
      noLeads: "Aucun lead trouvé",
      loading: "Chargement...",
      refresh: "Actualiser",
      scoreBreakdown: "Répartition du score",
      engagement: "Engagement",
      fit: "Score d'adéquation",
      behavior: "Comportement",
      activityTypes: {
        created: "Lead créé",
        status_changed: "Statut modifié",
        assigned: "Assigné à un membre",
        contacted: "Contact effectué",
        note_added: "Note ajoutée",
        email_sent: "Email envoyé",
        call_made: "Appel effectué",
        meeting_scheduled: "Réunion planifiée",
        proposal_sent: "Proposition envoyée",
        converted: "Converti en client",
        email_opened: "Email ouvert",
        email_clicked: "Lien email cliqué",
      },
      daysAgo: "jours",
      today: "Aujourd'hui",
      yesterday: "Hier",
    },
  };

  const l = t[language];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30";
    if (score >= 60) return "text-blue-600 bg-blue-100 dark:bg-blue-900/30";
    if (score >= 40) return "text-amber-600 bg-amber-100 dark:bg-amber-900/30";
    return "text-slate-600 bg-slate-100 dark:bg-slate-800";
  };

  const getScoreTrend = (score: number, previousScore?: number) => {
    if (!previousScore) return null;
    if (score > previousScore) return <TrendingUp className="h-4 w-4 text-emerald-500" />;
    if (score < previousScore) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-slate-400" />;
  };

  const getConversionProbability = (score: number) => {
    if (score >= 80) return { value: 75, label: "High" };
    if (score >= 60) return { value: 50, label: "Medium" };
    if (score >= 40) return { value: 25, label: "Low" };
    return { value: 10, label: "Very Low" };
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-amber-500" />;
    if (rank === 2) return <Award className="h-5 w-5 text-slate-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-700" />;
    return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "email_sent":
      case "email_opened":
      case "email_clicked":
        return <Mail className="h-4 w-4" />;
      case "call_made":
        return <Phone className="h-4 w-4" />;
      case "meeting_scheduled":
        return <Calendar className="h-4 w-4" />;
      case "note_added":
        return <MessageSquare className="h-4 w-4" />;
      case "proposal_sent":
        return <Target className="h-4 w-4" />;
      case "converted":
        return <Zap className="h-4 w-4 text-emerald-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const leads = leadsQuery.data?.leads || [];
  const stats = statsQuery.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{l.title}</h2>
          <p className="text-muted-foreground">{l.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={l.filterStatus} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{l.all}</SelectItem>
              <SelectItem value="new">{l.new}</SelectItem>
              <SelectItem value="contacted">{l.contacted}</SelectItem>
              <SelectItem value="qualified">{l.qualified}</SelectItem>
              <SelectItem value="negotiating">{l.negotiating}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={l.sortBy} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">{l.sortScore}</SelectItem>
              <SelectItem value="recent">{l.sortRecent}</SelectItem>
              <SelectItem value="activity">{l.sortActivity}</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              leadsQuery.refetch();
              statsQuery.refetch();
            }}
          >
            <RefreshCw className={`h-4 w-4 ${leadsQuery.isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{l.avgScore}</p>
                  <p className="text-3xl font-bold">{stats.averageScore.toFixed(0)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Star className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{l.hotLeads}</p>
                  <p className="text-3xl font-bold text-emerald-600">{stats.hotLeads}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{l.warmLeads}</p>
                  <p className="text-3xl font-bold text-amber-600">{stats.warmLeads}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{l.coldLeads}</p>
                  <p className="text-3xl font-bold text-slate-600">{stats.coldLeads}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              {l.leaderboard}
            </CardTitle>
            <CardDescription>{l.topLeads}</CardDescription>
          </CardHeader>
          <CardContent>
            {leadsQuery.isLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                {l.loading}
              </div>
            ) : leads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">{l.noLeads}</div>
            ) : (
              <div className="space-y-3">
                {leads.map((lead: Lead, index: number) => {
                  const prob = getConversionProbability(lead.leadScore || 0);
                  return (
                    <div
                      key={lead.id}
                      className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-white dark:hover:bg-slate-800/50 ${
                        selectedLead?.id === lead.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedLead(lead)}
                    >
                      <div className="w-8 flex justify-center">{getRankBadge(index + 1)}</div>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {lead.firstName[0]}
                          {lead.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">
                            {lead.firstName} {lead.lastName}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {lead.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {lead.company || lead.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-semibold ${getScoreColor(
                            lead.leadScore || 0
                          )}`}
                        >
                          {lead.leadScore || 0}
                          {getScoreTrend(lead.leadScore || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {prob.value}% {l.conversionProb.toLowerCase()}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lead Details / Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {selectedLead ? `${selectedLead.firstName}'s ${l.timeline}` : l.timeline}
            </CardTitle>
            <CardDescription>
              {selectedLead ? selectedLead.email : l.recentActivity}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedLead ? (
              <div className="space-y-4">
                {/* Score Breakdown */}
                <div className="p-4 rounded-lg bg-white dark:bg-slate-800/50">
                  <h4 className="text-sm font-medium mb-3">{l.scoreBreakdown}</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{l.engagement}</span>
                        <span>{Math.min((selectedLead.leadScore || 0) * 0.4, 40).toFixed(0)}/40</span>
                      </div>
                      <Progress value={Math.min((selectedLead.leadScore || 0) * 0.4, 40) * 2.5} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{l.fit}</span>
                        <span>{Math.min((selectedLead.leadScore || 0) * 0.35, 35).toFixed(0)}/35</span>
                      </div>
                      <Progress value={Math.min((selectedLead.leadScore || 0) * 0.35, 35) * 2.86} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{l.behavior}</span>
                        <span>{Math.min((selectedLead.leadScore || 0) * 0.25, 25).toFixed(0)}/25</span>
                      </div>
                      <Progress value={Math.min((selectedLead.leadScore || 0) * 0.25, 25) * 4} className="h-2" />
                    </div>
                  </div>
                </div>

                {/* Activity Timeline */}
                <div className="space-y-3">
                  {activitiesQuery.isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    </div>
                  ) : activitiesQuery.data?.activities?.length ? (
                    // @ts-expect-error - TS2345: auto-suppressed during TS cleanup
                    activitiesQuery.data.activities.map((activity: LeadActivity, idx: number) => (
                      <div key={activity.id || idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            {getActivityIcon(activity.type)}
                          </div>
                          {idx < (activitiesQuery.data?.activities?.length || 0) - 1 && (
                            <div className="w-px h-full bg-slate-200 dark:bg-slate-700 my-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-sm font-medium">
                            {l.activityTypes[activity.type as keyof typeof l.activityTypes] ||
                              activity.type}
                          </p>
                          {activity.description && (
                            <p className="text-xs text-muted-foreground">{activity.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No activities recorded
                    </p>
                  )}
                </div>

                <Button className="w-full" variant="outline">
                  {l.viewProfile}
                  <ArrowUpRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select a lead to view their activity timeline</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
