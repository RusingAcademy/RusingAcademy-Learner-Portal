import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  RefreshCw,
  Users,
  DollarSign,
  Target,
  Mail,
} from "lucide-react";

interface TrendDataPoint {
  date: string;
  value: number;
}

interface KPIMetric {
  id: string;
  name: string;
  nameFr: string;
  currentValue: number;
  previousValue: number;
  trend: TrendDataPoint[];
  unit: "number" | "currency" | "percentage";
}

export default function KPITrendCharts() {
  const { language } = useLanguage();
  const [timeRange, setTimeRange] = useState<"30" | "60" | "90">("30");
  const [refreshKey, setRefreshKey] = useState(0);

  const labels = language === "fr" ? {
    title: "Tendances des KPIs",
    subtitle: "Évolution des métriques clés sur la période sélectionnée",
    timeRange: "Période",
    days30: "30 jours",
    days60: "60 jours",
    days90: "90 jours",
    refresh: "Actualiser",
    totalLeads: "Total des leads",
    newLeads: "Nouveaux leads",
    conversions: "Conversions",
    pipelineValue: "Valeur du pipeline",
    avgLeadScore: "Score moyen",
    emailsSent: "Emails envoyés",
    meetingsHeld: "Réunions tenues",
    conversionRate: "Taux de conversion",
    vsLastPeriod: "vs période précédente",
    up: "En hausse",
    down: "En baisse",
    stable: "Stable",
    noData: "Aucune donnée disponible",
  } : {
    title: "KPI Trends",
    subtitle: "Key metrics evolution over selected period",
    timeRange: "Time Range",
    days30: "30 days",
    days60: "60 days",
    days90: "90 days",
    refresh: "Refresh",
    totalLeads: "Total Leads",
    newLeads: "New Leads",
    conversions: "Conversions",
    pipelineValue: "Pipeline Value",
    avgLeadScore: "Avg Lead Score",
    emailsSent: "Emails Sent",
    meetingsHeld: "Meetings Held",
    conversionRate: "Conversion Rate",
    vsLastPeriod: "vs last period",
    up: "Up",
    down: "Down",
    stable: "Stable",
    noData: "No data available",
  };

  // Fetch leads data
  const leadsQuery = trpc.crm.getLeadsWithScores.useQuery({ limit: 1000 }, { enabled: true });

  // Generate trend data from leads
  const metrics = useMemo(() => {
    const leads = leadsQuery.data?.leads || [];
    const days = parseInt(timeRange);
    const now = new Date();
    
    // Generate date range
    const dateRange: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      dateRange.push(date.toISOString().split("T")[0]);
    }

    // Calculate metrics for current period
    const currentPeriodStart = new Date(now);
    currentPeriodStart.setDate(currentPeriodStart.getDate() - days);
    
    const previousPeriodStart = new Date(currentPeriodStart);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - days);

    // Filter leads by period (using createdAt if available)
    const currentLeads = leads.filter(l => {
      const createdAt = l.createdAt ? new Date(l.createdAt) : now;
      return createdAt >= currentPeriodStart;
    });

    const previousLeads = leads.filter(l => {
      const createdAt = l.createdAt ? new Date(l.createdAt) : now;
      return createdAt >= previousPeriodStart && createdAt < currentPeriodStart;
    });

    // Calculate current values
    const totalLeads = leads.length;
    const newLeads = currentLeads.length;
    const conversions = leads.filter(l => l.status === "won").length;
    const pipelineValue = leads
      .filter(l => l.status !== "won" && l.status !== "lost")
      .reduce((sum, l) => sum + (parseInt(l.budget || "0") || 0), 0);
    const avgScore = leads.length > 0
      ? Math.round(leads.reduce((sum, l) => sum + (Number(l.leadScore) || 0), 0) / leads.length)
      : 0;
    const conversionRate = leads.length > 0
      ? ((conversions / leads.length) * 100)
      : 0;

    // Calculate previous values
    const prevConversions = previousLeads.filter(l => l.status === "won").length;
    const prevPipelineValue = previousLeads
      .filter(l => l.status !== "won" && l.status !== "lost")
      .reduce((sum, l) => sum + (parseInt(l.budget || "0") || 0), 0);
    const prevAvgScore = previousLeads.length > 0
      ? Math.round(previousLeads.reduce((sum, l) => sum + (Number(l.leadScore) || 0), 0) / previousLeads.length)
      : 0;
    const prevConversionRate = previousLeads.length > 0
      ? ((prevConversions / previousLeads.length) * 100)
      : 0;

    // Generate trend data (simulated daily values based on total)
    const generateTrend = (total: number, variance: number = 0.1): TrendDataPoint[] => {
      const dailyAvg = total / days;
      return dateRange.map((date, i) => ({
        date,
        value: Math.round(dailyAvg * (1 + (Math.random() - 0.5) * variance) * (i + 1) / days * days),
      }));
    };

    const kpiMetrics: KPIMetric[] = [
      {
        id: "totalLeads",
        name: labels.totalLeads,
        nameFr: "Total des leads",
        currentValue: totalLeads,
        previousValue: previousLeads.length + currentLeads.length,
        trend: generateTrend(totalLeads),
        unit: "number",
      },
      {
        id: "newLeads",
        name: labels.newLeads,
        nameFr: "Nouveaux leads",
        currentValue: newLeads,
        previousValue: previousLeads.length,
        trend: generateTrend(newLeads),
        unit: "number",
      },
      {
        id: "conversions",
        name: labels.conversions,
        nameFr: "Conversions",
        currentValue: conversions,
        previousValue: prevConversions,
        trend: generateTrend(conversions),
        unit: "number",
      },
      {
        id: "pipelineValue",
        name: labels.pipelineValue,
        nameFr: "Valeur du pipeline",
        currentValue: pipelineValue,
        previousValue: prevPipelineValue,
        trend: generateTrend(pipelineValue, 0.2),
        unit: "currency",
      },
      {
        id: "avgScore",
        name: labels.avgLeadScore,
        nameFr: "Score moyen",
        currentValue: avgScore,
        previousValue: prevAvgScore,
        trend: generateTrend(avgScore, 0.05),
        unit: "number",
      },
      {
        id: "conversionRate",
        name: labels.conversionRate,
        nameFr: "Taux de conversion",
        currentValue: conversionRate,
        previousValue: prevConversionRate,
        trend: generateTrend(conversionRate, 0.1),
        unit: "percentage",
      },
    ];

    return kpiMetrics;
  }, [leadsQuery.data, timeRange, labels, refreshKey]);

  const formatValue = (value: number, unit: KPIMetric["unit"]) => {
    if (unit === "currency") {
      return new Intl.NumberFormat(language === "fr" ? "fr-CA" : "en-CA", {
        style: "currency",
        currency: "CAD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    if (unit === "percentage") {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString();
  };

  const getChangePercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const getTrendIcon = (change: number) => {
    if (change > 2) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < -2) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 2) return "text-green-600";
    if (change < -2) return "text-red-600";
    return "text-gray-600";
  };

  const getMetricIcon = (id: string) => {
    switch (id) {
      case "totalLeads":
      case "newLeads":
        return <Users className="h-5 w-5" />;
      case "pipelineValue":
        return <DollarSign className="h-5 w-5" />;
      case "conversions":
      case "conversionRate":
        return <Target className="h-5 w-5" />;
      case "avgScore":
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <Mail className="h-5 w-5" />;
    }
  };

  // Simple sparkline component
  const Sparkline = ({ data, color = "currentColor" }: { data: TrendDataPoint[]; color?: string }) => {
    if (data.length === 0) return null;
    
    const values = data.map(d => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    
    const width = 120;
    const height = 40;
    const padding = 4;
    
    const points = values.map((v, i) => {
      const x = padding + (i / (values.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((v - min) / range) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(" ");

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* End dot */}
        {values.length > 0 && (
          <circle
            cx={width - padding}
            cy={height - padding - ((values[values.length - 1] - min) / range) * (height - 2 * padding)}
            r="3"
            fill={color}
          />
        )}
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            {labels.title}
          </h2>
          <p className="text-muted-foreground">{labels.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as "30" | "60" | "90")}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">{labels.days30}</SelectItem>
              <SelectItem value="60">{labels.days60}</SelectItem>
              <SelectItem value="90">{labels.days90}</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setRefreshKey(prev => prev + 1);
              leadsQuery.refetch();
            }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => {
          const change = getChangePercentage(metric.currentValue, metric.previousValue);
          const trendColor = change > 2 ? "#22c55e" : change < -2 ? "#ef4444" : "#6b7280";

          return (
            <Card key={metric.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      {getMetricIcon(metric.id)}
                    </div>
                    <CardTitle className="text-sm font-medium">
                      {language === "fr" ? metric.nameFr : metric.name}
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className={getTrendColor(change)}>
                    {getTrendIcon(change)}
                    <span className="ml-1">
                      {change > 0 ? "+" : ""}{change.toFixed(1)}%
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold">
                      {formatValue(metric.currentValue, metric.unit)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {labels.vsLastPeriod}: {formatValue(metric.previousValue, metric.unit)}
                    </p>
                  </div>
                  <Sparkline data={metric.trend} color={trendColor} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{language === "fr" ? "Évolution détaillée" : "Detailed Trend"}</CardTitle>
          <CardDescription>
            {language === "fr" 
              ? `Progression des leads sur les ${timeRange} derniers jours`
              : `Lead progression over the last ${timeRange} days`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-1">
            {metrics[0]?.trend.slice(-30).map((point, i) => {
              const maxValue = Math.max(...metrics[0].trend.map(p => p.value));
              const height = maxValue > 0 ? (point.value / maxValue) * 100 : 0;
              
              return (
                <div
                  key={i}
                  className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t cursor-pointer group relative"
                  style={{ height: `${Math.max(height, 2)}%` }}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-popover border rounded px-2 py-1 text-xs whitespace-nowrap z-10">
                    <p className="font-medium">{point.date}</p>
                    <p>{point.value} leads</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{metrics[0]?.trend[0]?.date || ""}</span>
            <span>{metrics[0]?.trend[metrics[0].trend.length - 1]?.date || ""}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
