import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Mail,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Zap,
} from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  color?: string;
}

function KPICard({ title, value, change, changeLabel, icon, trend, color = "primary" }: KPICardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 text-sm">
                {trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : trend === "down" ? (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                ) : null}
                <span className={trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"}>
                  {change > 0 ? "+" : ""}{change}%
                </span>
                {changeLabel && <span className="text-muted-foreground">{changeLabel}</span>}
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full bg-${color}/10`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function GlobalCRMDashboard() {
  const { language } = useLanguage();
  const [refreshKey, setRefreshKey] = useState(0);

  const labels = language === "fr" ? {
    title: "Tableau de bord CRM",
    subtitle: "Vue d'ensemble de vos performances commerciales",
    refresh: "Actualiser",
    leads: "Leads",
    totalLeads: "Total des leads",
    newLeads: "Nouveaux leads",
    hotLeads: "Leads chauds",
    warmLeads: "Leads tièdes",
    coldLeads: "Leads froids",
    converted: "Convertis",
    conversionRate: "Taux de conversion",
    avgScore: "Score moyen",
    pipeline: "Pipeline",
    pipelineValue: "Valeur du pipeline",
    avgDealSize: "Taille moyenne des deals",
    dealsInProgress: "Deals en cours",
    wonDeals: "Deals gagnés",
    lostDeals: "Deals perdus",
    winRate: "Taux de réussite",
    engagement: "Engagement",
    emailsSent: "Emails envoyés",
    emailsOpened: "Emails ouverts",
    openRate: "Taux d'ouverture",
    clickRate: "Taux de clic",
    meetings: "Réunions",
    meetingsScheduled: "Réunions planifiées",
    meetingsCompleted: "Réunions terminées",
    pendingOutcomes: "Issues en attente",
    alerts: "Alertes",
    recentAlerts: "Alertes récentes",
    duplicates: "Doublons détectés",
    staleLeads: "Leads inactifs",
    overdue: "En retard",
    thisWeek: "cette semaine",
    thisMonth: "ce mois",
    vsLastMonth: "vs mois dernier",
    vsLastWeek: "vs semaine dernière",
    noData: "Aucune donnée disponible",
    loading: "Chargement...",
    overview: "Vue d'ensemble",
    performance: "Performance",
    activity: "Activité",
  } : {
    title: "CRM Dashboard",
    subtitle: "Overview of your sales performance",
    refresh: "Refresh",
    leads: "Leads",
    totalLeads: "Total Leads",
    newLeads: "New Leads",
    hotLeads: "Hot Leads",
    warmLeads: "Warm Leads",
    coldLeads: "Cold Leads",
    converted: "Converted",
    conversionRate: "Conversion Rate",
    avgScore: "Average Score",
    pipeline: "Pipeline",
    pipelineValue: "Pipeline Value",
    avgDealSize: "Avg Deal Size",
    dealsInProgress: "Deals in Progress",
    wonDeals: "Won Deals",
    lostDeals: "Lost Deals",
    winRate: "Win Rate",
    engagement: "Engagement",
    emailsSent: "Emails Sent",
    emailsOpened: "Emails Opened",
    openRate: "Open Rate",
    clickRate: "Click Rate",
    meetings: "Meetings",
    meetingsScheduled: "Scheduled",
    meetingsCompleted: "Completed",
    pendingOutcomes: "Pending Outcomes",
    alerts: "Alerts",
    recentAlerts: "Recent Alerts",
    duplicates: "Duplicates Detected",
    staleLeads: "Stale Leads",
    overdue: "Overdue",
    thisWeek: "this week",
    thisMonth: "this month",
    vsLastMonth: "vs last month",
    vsLastWeek: "vs last week",
    noData: "No data available",
    loading: "Loading...",
    overview: "Overview",
    performance: "Performance",
    activity: "Activity",
  };

  // Fetch CRM data
  const leadsQuery = trpc.crm.getLeadsWithScores.useQuery({ limit: 1000 }, { enabled: true });
  const meetingStatsQuery = trpc.crm.getOutcomeStats.useQuery({}, { enabled: true });

  // Calculate KPIs from data
  const kpis = useMemo(() => {
    const leads = leadsQuery.data?.leads || [];
    const meetingStats = meetingStatsQuery.data;

    // Lead metrics
    const totalLeads = leads.length;
    const hotLeads = leads.filter(l => (Number(l.leadScore) || 0) >= 70).length;
    const warmLeads = leads.filter(l => {
      const score = Number(l.leadScore) || 0;
      return score >= 40 && score < 70;
    }).length;
    const coldLeads = leads.filter(l => (Number(l.leadScore) || 0) < 40).length;
    const convertedLeads = leads.filter(l => l.status === "won").length;
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;
    const avgScore = totalLeads > 0 
      ? Math.round(leads.reduce((sum, l) => sum + (Number(l.leadScore) || 0), 0) / totalLeads)
      : 0;

    // Pipeline metrics
    const pipelineLeads = leads.filter(l => 
      l.status && !["won", "lost", "converted"].includes(l.status)
    );
    const pipelineValue = leads.reduce((sum, l) => sum + (Number(l.budget) || 0), 0);
    const avgDealSize = totalLeads > 0 ? Math.round(pipelineValue / totalLeads) : 0;
    const wonDeals = leads.filter(l => l.status === "won").length;
    const lostDeals = leads.filter(l => l.status === "lost").length;
    const closedDeals = wonDeals + lostDeals;
    const winRate = closedDeals > 0 ? ((wonDeals / closedDeals) * 100).toFixed(1) : 0;

    // Calculate new leads this week (mock - would need createdAt comparison)
    const newLeadsThisWeek = Math.round(totalLeads * 0.1); // Placeholder

    // Engagement metrics (placeholder - would need aggregated sequence stats)
    const emailsSent = 0;
    const emailsOpened = 0;
    const emailsClicked = 0;
    const openRate = 0;
    const clickRate = 0;

    // Meeting metrics
    const meetingsTotal = meetingStats?.totalMeetings || 0;
    const meetingsCompleted = meetingStats?.completedMeetings || 0;
    const pendingOutcomes = meetingsTotal - meetingsCompleted;

    return {
      totalLeads,
      newLeadsThisWeek,
      hotLeads,
      warmLeads,
      coldLeads,
      convertedLeads,
      conversionRate,
      avgScore,
      pipelineValue,
      avgDealSize,
      dealsInProgress: pipelineLeads.length,
      wonDeals,
      lostDeals,
      winRate,
      emailsSent,
      emailsOpened,
      openRate,
      clickRate,
      meetingsTotal,
      meetingsCompleted,
      pendingOutcomes,
    };
  }, [leadsQuery.data, meetingStatsQuery.data]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    leadsQuery.refetch();
    meetingStatsQuery.refetch();
  };

  const isLoading = leadsQuery.isLoading || meetingStatsQuery.isLoading;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === "fr" ? "fr-CA" : "en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{labels.title}</h2>
          <p className="text-muted-foreground">{labels.subtitle}</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          {labels.refresh}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{labels.overview}</TabsTrigger>
          <TabsTrigger value="performance">{labels.performance}</TabsTrigger>
          <TabsTrigger value="activity">{labels.activity}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Lead KPIs */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              {labels.leads}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title={labels.totalLeads}
                value={kpis.totalLeads}
                change={12}
                changeLabel={labels.vsLastMonth}
                icon={<Users className="h-6 w-6 text-primary" />}
                trend="up"
              />
              <KPICard
                title={labels.hotLeads}
                value={kpis.hotLeads}
                icon={<Zap className="h-6 w-6 text-orange-500" />}
              />
              <KPICard
                title={labels.conversionRate}
                value={`${kpis.conversionRate}%`}
                change={5}
                changeLabel={labels.vsLastMonth}
                icon={<Target className="h-6 w-6 text-green-500" />}
                trend="up"
              />
              <KPICard
                title={labels.avgScore}
                value={kpis.avgScore}
                icon={<BarChart3 className="h-6 w-6 text-blue-500" />}
              />
            </div>
          </div>

          {/* Pipeline KPIs */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {labels.pipeline}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title={labels.pipelineValue}
                value={formatCurrency(kpis.pipelineValue)}
                change={8}
                changeLabel={labels.vsLastMonth}
                icon={<DollarSign className="h-6 w-6 text-green-500" />}
                trend="up"
              />
              <KPICard
                title={labels.avgDealSize}
                value={formatCurrency(kpis.avgDealSize)}
                icon={<TrendingUp className="h-6 w-6 text-blue-500" />}
              />
              <KPICard
                title={labels.wonDeals}
                value={kpis.wonDeals}
                icon={<CheckCircle className="h-6 w-6 text-green-500" />}
              />
              <KPICard
                title={labels.winRate}
                value={`${kpis.winRate}%`}
                change={3}
                changeLabel={labels.vsLastMonth}
                icon={<Target className="h-6 w-6 text-primary" />}
                trend="up"
              />
            </div>
          </div>

          {/* Lead Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                {language === "fr" ? "Distribution des leads" : "Lead Distribution"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-around py-4">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-red-600">{kpis.hotLeads}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{labels.hotLeads}</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-yellow-600">{kpis.warmLeads}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{labels.warmLeads}</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-blue-600">{kpis.coldLeads}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{labels.coldLeads}</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-green-600">{kpis.convertedLeads}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{labels.converted}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {/* Engagement KPIs */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {labels.engagement}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title={labels.emailsSent}
                value={kpis.emailsSent}
                icon={<Mail className="h-6 w-6 text-blue-500" />}
              />
              <KPICard
                title={labels.emailsOpened}
                value={kpis.emailsOpened}
                icon={<Mail className="h-6 w-6 text-green-500" />}
              />
              <KPICard
                title={labels.openRate}
                value={`${kpis.openRate}%`}
                change={2}
                changeLabel={labels.vsLastWeek}
                icon={<TrendingUp className="h-6 w-6 text-primary" />}
                trend="up"
              />
              <KPICard
                title={labels.clickRate}
                value={`${kpis.clickRate}%`}
                icon={<Activity className="h-6 w-6 text-[#0F3D3E]" />}
              />
            </div>
          </div>

          {/* Meeting KPIs */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {labels.meetings}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <KPICard
                title={labels.meetingsScheduled}
                value={kpis.meetingsTotal}
                icon={<Calendar className="h-6 w-6 text-blue-500" />}
              />
              <KPICard
                title={labels.meetingsCompleted}
                value={kpis.meetingsCompleted}
                icon={<CheckCircle className="h-6 w-6 text-green-500" />}
              />
              <KPICard
                title={labels.pendingOutcomes}
                value={kpis.pendingOutcomes}
                icon={<Clock className="h-6 w-6 text-yellow-500" />}
              />
            </div>
          </div>

          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>{language === "fr" ? "Résumé des performances" : "Performance Summary"}</CardTitle>
              <CardDescription>
                {language === "fr" 
                  ? "Indicateurs clés de performance ce mois-ci"
                  : "Key performance indicators this month"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{labels.conversionRate}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${Math.min(Number(kpis.conversionRate), 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{kpis.conversionRate}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{labels.winRate}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.min(Number(kpis.winRate), 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{kpis.winRate}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{labels.openRate}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#E7F2F2] rounded-full"
                        style={{ width: `${Math.min(Number(kpis.openRate), 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{kpis.openRate}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                {labels.recentAlerts}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {kpis.pendingOutcomes > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <div className="flex-1">
                      <p className="font-medium text-yellow-800">
                        {kpis.pendingOutcomes} {labels.pendingOutcomes}
                      </p>
                      <p className="text-sm text-yellow-600">
                        {language === "fr" 
                          ? "Réunions nécessitant un suivi"
                          : "Meetings requiring follow-up"}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      {labels.overdue}
                    </Badge>
                  </div>
                )}
                {kpis.coldLeads > 10 && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <TrendingDown className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium text-blue-800">
                        {kpis.coldLeads} {labels.coldLeads}
                      </p>
                      <p className="text-sm text-blue-600">
                        {language === "fr" 
                          ? "Leads nécessitant une attention"
                          : "Leads requiring attention"}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      {labels.staleLeads}
                    </Badge>
                  </div>
                )}
                {kpis.lostDeals > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div className="flex-1">
                      <p className="font-medium text-red-800">
                        {kpis.lostDeals} {labels.lostDeals}
                      </p>
                      <p className="text-sm text-red-600">
                        {language === "fr" 
                          ? "Analyser les raisons de perte"
                          : "Analyze loss reasons"}
                      </p>
                    </div>
                  </div>
                )}
                {kpis.pendingOutcomes === 0 && kpis.coldLeads <= 10 && kpis.lostDeals === 0 && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="font-medium text-green-800">
                      {language === "fr" 
                        ? "Tout est en ordre ! Aucune alerte."
                        : "All clear! No alerts."}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">{kpis.newLeadsThisWeek}</div>
                <p className="text-sm text-muted-foreground">{labels.newLeads} {labels.thisWeek}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">{kpis.wonDeals}</div>
                <p className="text-sm text-muted-foreground">{labels.wonDeals} {labels.thisMonth}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{kpis.dealsInProgress}</div>
                <p className="text-sm text-muted-foreground">{labels.dealsInProgress}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
