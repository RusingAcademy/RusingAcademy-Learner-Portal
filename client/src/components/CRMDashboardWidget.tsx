import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import {
  Target,
  Mail,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  MousePointerClick,
  Eye,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

interface CRMDashboardWidgetProps {
  onNavigateToCRM?: () => void;
}

export default function CRMDashboardWidget({ onNavigateToCRM }: CRMDashboardWidgetProps) {
  const { language } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch CRM data
  const sequenceAnalyticsQuery = trpc.crm.getOverallSequenceAnalytics.useQuery(undefined, {
    staleTime: 60000, // 1 minute
  });
  
  const outcomeStatsQuery = trpc.crm.getOutcomeStats.useQuery(undefined, {
    staleTime: 60000,
  });
  
  const pendingMeetingsQuery = trpc.crm.getPendingOutcomeMeetings.useQuery(undefined, {
    staleTime: 60000,
  });

  const t = {
    en: {
      title: "CRM Overview",
      subtitle: "Lead management & sequence performance",
      sequences: "Email Sequences",
      activeSequences: "Active Sequences",
      totalEnrollments: "Total Enrollments",
      avgOpenRate: "Avg. Open Rate",
      avgClickRate: "Avg. Click Rate",
      avgConversion: "Avg. Conversion",
      meetings: "Meeting Outcomes",
      pendingOutcomes: "Pending Outcomes",
      completedMeetings: "Completed Meetings",
      conversionRate: "Conversion Rate",
      qualifiedLeads: "Qualified Leads",
      needsAttention: "Needs Attention",
      meetingsPending: "meetings need outcome recording",
      viewDetails: "View Details",
      refresh: "Refresh",
      noData: "No data available",
      loading: "Loading...",
      performance: "Performance",
      excellent: "Excellent",
      good: "Good",
      needsImprovement: "Needs Improvement",
    },
    fr: {
      title: "Aperçu CRM",
      subtitle: "Gestion des leads et performance des séquences",
      sequences: "Séquences d'emails",
      activeSequences: "Séquences actives",
      totalEnrollments: "Inscriptions totales",
      avgOpenRate: "Taux d'ouverture moy.",
      avgClickRate: "Taux de clic moy.",
      avgConversion: "Conversion moy.",
      meetings: "Résultats des réunions",
      pendingOutcomes: "Résultats en attente",
      completedMeetings: "Réunions terminées",
      conversionRate: "Taux de conversion",
      qualifiedLeads: "Leads qualifiés",
      needsAttention: "Attention requise",
      meetingsPending: "réunions nécessitent un enregistrement de résultat",
      viewDetails: "Voir les détails",
      refresh: "Actualiser",
      noData: "Aucune donnée disponible",
      loading: "Chargement...",
      performance: "Performance",
      excellent: "Excellent",
      good: "Bon",
      needsImprovement: "À améliorer",
    },
  };

  const l = t[language];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      sequenceAnalyticsQuery.refetch(),
      outcomeStatsQuery.refetch(),
      pendingMeetingsQuery.refetch(),
    ]);
    setIsRefreshing(false);
  };

  const sequenceData = sequenceAnalyticsQuery.data;
  const outcomeData = outcomeStatsQuery.data;
  const pendingMeetings = pendingMeetingsQuery.data || [];

  const isLoading = sequenceAnalyticsQuery.isLoading || outcomeStatsQuery.isLoading;

  // Calculate performance rating
  const getPerformanceRating = (openRate: number, clickRate: number) => {
    const score = (openRate * 0.6 + clickRate * 0.4);
    if (score >= 25) return { label: l.excellent, color: "text-emerald-500", bg: "bg-emerald-500/10" };
    if (score >= 15) return { label: l.good, color: "text-blue-500", bg: "bg-blue-500/10" };
    return { label: l.needsImprovement, color: "text-amber-500", bg: "bg-[#C65A1E]/10" };
  };

  const performance = sequenceData 
    ? getPerformanceRating(sequenceData.averageOpenRate, sequenceData.averageClickRate)
    : null;

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{l.title}</CardTitle>
              <CardDescription className="text-sm">{l.subtitle}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
            {onNavigateToCRM && (
              <Button variant="outline" size="sm" onClick={onNavigateToCRM}>
                {l.viewDetails}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            {l.loading}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Alert for pending outcomes */}
            {pendingMeetings.length > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#C65A1E]/10 border border-amber-500/20">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    {l.needsAttention}
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-500">
                    {pendingMeetings.length} {l.meetingsPending}
                  </p>
                </div>
                <Badge variant="outline" className="border-amber-500 text-amber-600">
                  {pendingMeetings.length}
                </Badge>
              </div>
            )}

            {/* Two-column layout for stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sequence Performance */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {l.sequences}
                </div>
                
                {sequenceData ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-white dark:bg-slate-800/50">
                        <div className="text-2xl font-bold">{sequenceData.activeSequences}</div>
                        <div className="text-xs text-muted-foreground">{l.activeSequences}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-white dark:bg-slate-800/50">
                        <div className="text-2xl font-bold">{sequenceData.totalEnrollments}</div>
                        <div className="text-xs text-muted-foreground">{l.totalEnrollments}</div>
                      </div>
                    </div>
                    
                    {/* Metrics with progress bars */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Eye className="h-3.5 w-3.5" />
                          {l.avgOpenRate}
                        </span>
                        <span className="font-medium">{sequenceData.averageOpenRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={sequenceData.averageOpenRate} className="h-1.5" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <MousePointerClick className="h-3.5 w-3.5" />
                          {l.avgClickRate}
                        </span>
                        <span className="font-medium">{sequenceData.averageClickRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={sequenceData.averageClickRate} className="h-1.5" />
                    </div>

                    {performance && (
                      <div className={`flex items-center gap-2 p-2 rounded-lg ${performance.bg}`}>
                        <TrendingUp className={`h-4 w-4 ${performance.color}`} />
                        <span className={`text-sm font-medium ${performance.color}`}>
                          {l.performance}: {performance.label}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground py-4 text-center">
                    {l.noData}
                  </div>
                )}
              </div>

              {/* Meeting Outcomes */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {l.meetings}
                </div>
                
                {outcomeData ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-white dark:bg-slate-800/50">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-amber-500" />
                          <span className="text-2xl font-bold">{pendingMeetings.length}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{l.pendingOutcomes}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-white dark:bg-slate-800/50">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="text-2xl font-bold">{outcomeData.completedMeetings}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{l.completedMeetings}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-emerald-600" />
                          <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                            {outcomeData.qualifiedLeads}
                          </span>
                        </div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-500">{l.qualifiedLeads}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <span className="text-xl font-bold text-blue-700 dark:text-blue-400">
                            {outcomeData.conversionRate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-500">{l.conversionRate}</div>
                      </div>
                    </div>

                    {/* Conversion funnel mini-visualization */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all"
                          style={{ width: `${outcomeData.conversionRate}%` }}
                        />
                      </div>
                      <span>{outcomeData.converted} converted</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground py-4 text-center">
                    {l.noData}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
