import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  BarChart3,
  Users,
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Percent,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

interface FilterCondition {
  field: string;
  operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "in";
  value: string | number | string[];
}

interface Segment {
  id: number;
  name: string;
  description: string | null;
  filters: FilterCondition[];
  filterLogic: "and" | "or";
  isActive: boolean;
  createdAt: Date;
}

interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  company: string | null;
  status: string | null;
  leadScore: number | null;
  budget: number | null;
  source: string | null;
  leadType: string | null;
}

export default function SegmentComparisonDashboard() {
  const { language } = useLanguage();
  const [selectedSegments, setSelectedSegments] = useState<number[]>([]);
  const [comparisonMetric, setComparisonMetric] = useState<"size" | "score" | "value" | "conversion">("size");

  const segmentsQuery = trpc.crm.getSegments.useQuery();
  const leadsQuery = trpc.crm.getLeadsWithScores.useQuery({});

  const labels = {
    en: {
      title: "Segment Comparison Dashboard",
      subtitle: "Compare segment performance and metrics",
      selectSegments: "Select Segments to Compare",
      comparisonMetric: "Comparison Metric",
      size: "Segment Size",
      score: "Average Score",
      value: "Total Value",
      conversion: "Conversion Rate",
      noSegments: "No segments available",
      selectAtLeast: "Select at least 2 segments to compare",
      leads: "leads",
      avgScore: "Avg Score",
      totalValue: "Total Value",
      conversionRate: "Conversion Rate",
      topPerformer: "Top Performer",
      segmentOverview: "Segment Overview",
      comparison: "Comparison",
      refresh: "Refresh",
      growth: "Growth",
      hotLeads: "Hot Leads",
      warmLeads: "Warm Leads",
      coldLeads: "Cold Leads",
      qualified: "Qualified",
      contacted: "Contacted",
      new: "New",
    },
    fr: {
      title: "Tableau de Bord de Comparaison",
      subtitle: "Comparez les performances et métriques des segments",
      selectSegments: "Sélectionner les Segments à Comparer",
      comparisonMetric: "Métrique de Comparaison",
      size: "Taille du Segment",
      score: "Score Moyen",
      value: "Valeur Totale",
      conversion: "Taux de Conversion",
      noSegments: "Aucun segment disponible",
      selectAtLeast: "Sélectionnez au moins 2 segments à comparer",
      leads: "leads",
      avgScore: "Score Moy.",
      totalValue: "Valeur Totale",
      conversionRate: "Taux de Conversion",
      topPerformer: "Meilleur Performeur",
      segmentOverview: "Aperçu des Segments",
      comparison: "Comparaison",
      refresh: "Actualiser",
      growth: "Croissance",
      hotLeads: "Leads Chauds",
      warmLeads: "Leads Tièdes",
      coldLeads: "Leads Froids",
      qualified: "Qualifiés",
      contacted: "Contactés",
      new: "Nouveaux",
    },
  };

  const l = labels[language];

  // Filter matching logic
  const matchesFilter = (lead: Lead, filter: FilterCondition): boolean => {
    const leadValue = (lead as Record<string, any>)[filter.field];
    const filterValue = filter.value;

    switch (filter.operator) {
      case "equals":
        return String(leadValue).toLowerCase() === String(filterValue).toLowerCase();
      case "not_equals":
        return String(leadValue).toLowerCase() !== String(filterValue).toLowerCase();
      case "greater_than":
        return Number(leadValue) > Number(filterValue);
      case "less_than":
        return Number(leadValue) < Number(filterValue);
      case "contains":
        return String(leadValue).toLowerCase().includes(String(filterValue).toLowerCase());
      case "in":
        if (Array.isArray(filterValue)) {
          return filterValue.map(v => String(v).toLowerCase()).includes(String(leadValue).toLowerCase());
        }
        return false;
      default:
        return false;
    }
  };

  const leadMatchesSegment = (lead: Lead, segment: Segment): boolean => {
    const validFilters = segment.filters.filter(f => f.field && f.operator && f.value !== undefined);
    if (validFilters.length === 0) return false;

    if (segment.filterLogic === "and") {
      return validFilters.every((filter) => matchesFilter(lead, filter));
    } else {
      return validFilters.some((filter) => matchesFilter(lead, filter));
    }
  };

  // Calculate segment metrics
  const segmentMetrics = useMemo(() => {
    const segments = segmentsQuery.data?.segments || [];
    const leads = leadsQuery.data?.leads || [];

    return segments.map((segment) => {
      const segmentLeads = leads.filter((lead) => leadMatchesSegment(lead as Lead, segment as unknown as Segment));
      
      const totalLeads = segmentLeads.length;
      const avgScore = totalLeads > 0
        ? segmentLeads.reduce((sum, lead) => sum + (Number(lead.leadScore) || 0), 0) / totalLeads
        : 0;
      const totalValue = segmentLeads.reduce((sum, lead) => sum + (Number(lead.budget) || 0), 0);
      const convertedLeads = segmentLeads.filter(lead => lead.status === "won").length;
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

      const hotLeads = segmentLeads.filter(lead => (lead.leadScore || 0) >= 70).length;
      const warmLeads = segmentLeads.filter(lead => (lead.leadScore || 0) >= 40 && (lead.leadScore || 0) < 70).length;
      const coldLeads = segmentLeads.filter(lead => (lead.leadScore || 0) < 40).length;

      const qualifiedLeads = segmentLeads.filter(lead => lead.status === "qualified").length;
      const contactedLeads = segmentLeads.filter(lead => lead.status === "contacted").length;
      const newLeads = segmentLeads.filter(lead => lead.status === "new").length;

      return {
        id: segment.id,
        name: segment.name,
        description: segment.description,
        totalLeads,
        avgScore: Math.round(avgScore),
        totalValue,
        conversionRate: Math.round(conversionRate * 10) / 10,
        hotLeads,
        warmLeads,
        coldLeads,
        qualifiedLeads,
        contactedLeads,
        newLeads,
      };
    });
  }, [segmentsQuery.data, leadsQuery.data]);

  // Get selected segment metrics
  const selectedMetrics = segmentMetrics.filter(m => selectedSegments.includes(m.id));

  // Find top performer
  const topPerformer = useMemo(() => {
    if (selectedMetrics.length === 0) return null;
    
    switch (comparisonMetric) {
      case "size":
        return selectedMetrics.reduce((max, m) => m.totalLeads > max.totalLeads ? m : max, selectedMetrics[0]);
      case "score":
        return selectedMetrics.reduce((max, m) => m.avgScore > max.avgScore ? m : max, selectedMetrics[0]);
      case "value":
        return selectedMetrics.reduce((max, m) => m.totalValue > max.totalValue ? m : max, selectedMetrics[0]);
      case "conversion":
        return selectedMetrics.reduce((max, m) => m.conversionRate > max.conversionRate ? m : max, selectedMetrics[0]);
      default:
        return selectedMetrics[0];
    }
  }, [selectedMetrics, comparisonMetric]);

  // Get max value for bar chart scaling
  const maxValue = useMemo(() => {
    if (selectedMetrics.length === 0) return 100;
    
    switch (comparisonMetric) {
      case "size":
        return Math.max(...selectedMetrics.map(m => m.totalLeads), 1);
      case "score":
        return 100;
      case "value":
        return Math.max(...selectedMetrics.map(m => m.totalValue), 1);
      case "conversion":
        return 100;
      default:
        return 100;
    }
  }, [selectedMetrics, comparisonMetric]);

  const getMetricValue = (metric: typeof segmentMetrics[0]) => {
    switch (comparisonMetric) {
      case "size":
        return metric.totalLeads;
      case "score":
        return metric.avgScore;
      case "value":
        return metric.totalValue;
      case "conversion":
        return metric.conversionRate;
      default:
        return 0;
    }
  };

  const formatMetricValue = (value: number) => {
    switch (comparisonMetric) {
      case "size":
        return `${value} ${l.leads}`;
      case "score":
        return `${value}/100`;
      case "value":
        return new Intl.NumberFormat(language === "fr" ? "fr-CA" : "en-CA", {
          style: "currency",
          currency: "CAD",
          minimumFractionDigits: 0,
        }).format(value);
      case "conversion":
        return `${value}%`;
      default:
        return value.toString();
    }
  };

  const toggleSegment = (segmentId: number) => {
    setSelectedSegments(prev => 
      prev.includes(segmentId)
        ? prev.filter(id => id !== segmentId)
        : [...prev, segmentId]
    );
  };

  const segments = segmentsQuery.data?.segments || [];

  const getBarColor = (index: number) => {
    const colors = [
      "bg-primary",
      "bg-blue-500",
      "bg-green-500",
      "bg-[#C65A1E]",
      "bg-[#E7F2F2]",
      "bg-[#FFF1E8]",
      "bg-cyan-500",
      "bg-[#C65A1E]",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            {l.title}
          </h2>
          <p className="text-muted-foreground">{l.subtitle}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            segmentsQuery.refetch();
            leadsQuery.refetch();
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {l.refresh}
        </Button>
      </div>

      {/* Segment Selection */}
      <Card>
        <CardHeader>
          <CardTitle>{l.selectSegments}</CardTitle>
        </CardHeader>
        <CardContent>
          {segments.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">{l.noSegments}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {segments.map((segment, index) => (
                <Button
                  key={segment.id}
                  variant={selectedSegments.includes(segment.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSegment(segment.id)}
                  className="gap-2"
                >
                  <div className={`w-3 h-3 rounded-full ${getBarColor(index)}`} />
                  {segment.name}
                  <Badge variant="secondary" className="ml-1">
                    {segmentMetrics.find(m => m.id === segment.id)?.totalLeads || 0}
                  </Badge>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedSegments.length >= 2 ? (
        <>
          {/* Comparison Metric Selector */}
          <div className="flex items-center gap-4">
            <span className="font-medium">{l.comparisonMetric}:</span>
            <Select value={comparisonMetric} onValueChange={(v) => setComparisonMetric(v as typeof comparisonMetric)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="size">{l.size}</SelectItem>
                <SelectItem value="score">{l.score}</SelectItem>
                <SelectItem value="value">{l.value}</SelectItem>
                <SelectItem value="conversion">{l.conversion}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Top Performer Card */}
          {topPerformer && (
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{l.topPerformer}</p>
                    <h3 className="text-2xl font-bold">{topPerformer.name}</h3>
                    <p className="text-lg text-primary font-semibold">
                      {formatMetricValue(getMetricValue(topPerformer))}
                    </p>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bar Chart Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>{l.comparison}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedMetrics.map((metric, index) => {
                  const value = getMetricValue(metric);
                  const percentage = (value / maxValue) * 100;
                  const isTopPerformer = topPerformer?.id === metric.id;

                  return (
                    <div key={metric.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getBarColor(index)}`} />
                          <span className="font-medium">{metric.name}</span>
                          {isTopPerformer && (
                            <Badge variant="default" className="text-xs">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {l.topPerformer}
                            </Badge>
                          )}
                        </div>
                        <span className="font-semibold">{formatMetricValue(value)}</span>
                      </div>
                      <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getBarColor(index)} rounded-full transition-all duration-500`}
                          style={{ width: `${Math.max(percentage, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedMetrics.map((metric, index) => (
              <Card key={metric.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getBarColor(index)}`} />
                    {metric.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {l.size}
                      </p>
                      <p className="text-xl font-bold">{metric.totalLeads}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {l.avgScore}
                      </p>
                      <p className="text-xl font-bold">{metric.avgScore}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {l.totalValue}
                      </p>
                      <p className="text-xl font-bold">
                        {new Intl.NumberFormat(language === "fr" ? "fr-CA" : "en-CA", {
                          style: "currency",
                          currency: "CAD",
                          notation: "compact",
                        }).format(metric.totalValue)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Percent className="h-3 w-3" />
                        {l.conversionRate}
                      </p>
                      <p className="text-xl font-bold">{metric.conversionRate}%</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <div className="text-center">
                        <p className="text-red-500 font-semibold">{metric.hotLeads}</p>
                        <p className="text-xs text-muted-foreground">{l.hotLeads}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-amber-500 font-semibold">{metric.warmLeads}</p>
                        <p className="text-xs text-muted-foreground">{l.warmLeads}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-blue-500 font-semibold">{metric.coldLeads}</p>
                        <p className="text-xs text-muted-foreground">{l.coldLeads}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <div className="text-center">
                        <p className="text-green-500 font-semibold">{metric.qualifiedLeads}</p>
                        <p className="text-xs text-muted-foreground">{l.qualified}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[#0F3D3E] font-semibold">{metric.contactedLeads}</p>
                        <p className="text-xs text-muted-foreground">{l.contacted}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-slate-500 font-semibold">{metric.newLeads}</p>
                        <p className="text-xs text-muted-foreground">{l.new}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">{l.selectAtLeast}</p>
          </CardContent>
        </Card>
      )}

      {/* Segment Overview (all segments) */}
      <Card>
        <CardHeader>
          <CardTitle>{l.segmentOverview}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium">Segment</th>
                  <th className="text-right py-2 px-3 font-medium">{l.size}</th>
                  <th className="text-right py-2 px-3 font-medium">{l.avgScore}</th>
                  <th className="text-right py-2 px-3 font-medium">{l.totalValue}</th>
                  <th className="text-right py-2 px-3 font-medium">{l.conversionRate}</th>
                </tr>
              </thead>
              <tbody>
                {segmentMetrics.map((metric, index) => (
                  <tr key={metric.id} className="border-b hover:bg-white dark:hover:bg-slate-800">
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getBarColor(index)}`} />
                        <span className="font-medium">{metric.name}</span>
                      </div>
                    </td>
                    <td className="text-right py-2 px-3">{metric.totalLeads}</td>
                    <td className="text-right py-2 px-3">{metric.avgScore}</td>
                    <td className="text-right py-2 px-3">
                      {new Intl.NumberFormat(language === "fr" ? "fr-CA" : "en-CA", {
                        style: "currency",
                        currency: "CAD",
                        notation: "compact",
                      }).format(metric.totalValue)}
                    </td>
                    <td className="text-right py-2 px-3">{metric.conversionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
