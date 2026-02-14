import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  DollarSign, Users, TrendingUp, Activity, RefreshCw,
  ArrowUpRight, ArrowDownRight, BarChart3, Brain, Target,
  Zap, Clock, BookOpen, Shield, Webhook, Cpu, AlertTriangle,
  CheckCircle2, XCircle, Gauge, Mic, MessageSquare, Volume2,
} from "lucide-react";

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

function MetricCard({ icon: Icon, label, value, change, changeLabel, color }: {
  icon: any; label: string; value: string; change?: number; changeLabel?: string; color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1">
                {change >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                )}
                <span className={`text-xs font-medium ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {Math.abs(change)}%
                </span>
                <span className="text-xs text-muted-foreground">{changeLabel ?? "vs last period"}</span>
              </div>
            )}
          </div>
          <div className={`p-2 rounded-lg ${color}`}><Icon className="h-5 w-5" /></div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProgressBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{pct}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StatusIndicator({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: any; label: string }> = {
    healthy: { color: "text-green-500", icon: CheckCircle2, label: "Healthy" },
    degraded: { color: "text-amber-500", icon: AlertTriangle, label: "Degraded" },
    critical: { color: "text-red-500", icon: XCircle, label: "Critical" },
  };
  const c = config[status] || config.healthy;
  const StatusIcon = c.icon;
  return (
    <div className={`flex items-center gap-1.5 ${c.color}`}>
      <StatusIcon className="h-4 w-4" />
      <span className="text-sm font-medium">{c.label}</span>
    </div>
  );
}

const STAGE_ICONS: Record<string, any> = {
  transcription: Mic,
  evaluation: Brain,
  coaching_response: MessageSquare,
  tts_synthesis: Volume2,
};

const STAGE_LABELS: Record<string, string> = {
  transcription: "Audio → Text (ASR)",
  evaluation: "LLM Evaluation",
  coaching_response: "Coaching Response",
  tts_synthesis: "Text → Speech (TTS)",
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LiveKPIDashboard() {
  const [period, setPeriod] = useState("7d");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(60);

  // Existing KPI queries
  // @ts-ignore - TS2345: auto-suppressed during TS cleanup
  const { data: revenue, isLoading: revLoading, refetch: refetchRevenue } = trpc.liveKPI.getRevenueMetrics.useQuery({ period });
  const { data: engagement, isLoading: engLoading, refetch: refetchEngagement } = trpc.liveKPI.getEngagementMetrics.useQuery({ period });
  const { data: conversion, isLoading: convLoading, refetch: refetchConversion } = trpc.liveKPI.getConversionMetrics.useQuery({ period });

  // NEW: Real Stripe + DB data
  const { data: stripeRevenue, isLoading: stripeLoading, refetch: refetchStripe } = trpc.stripeKPI.getStripeRevenue.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const { data: userAnalytics, isLoading: uaLoading, refetch: refetchUA } = trpc.stripeKPI.getUserAnalytics.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const { data: aiMetrics, isLoading: aiLoading, refetch: refetchAI } = trpc.stripeKPI.getAIMetrics.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Stability endpoints
  const { data: webhookStats, isLoading: whLoading, refetch: refetchWebhook } = trpc.adminStability.getWebhookStats.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const { data: pipelineHealth, isLoading: phLoading, refetch: refetchPipeline } = trpc.adminStability.getPipelineHealth.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const refreshAll = () => {
    refetchRevenue();
    refetchEngagement();
    refetchConversion();
    refetchWebhook();
    refetchPipeline();
    refetchStripe();
    refetchUA();
    refetchAI();
    toast.success("Dashboard refreshed");
  };

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(refreshAll, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const fmt = (n: number | undefined) => n !== undefined ? `$${n.toLocaleString()}` : "—";
  const num = (n: number | undefined) => n !== undefined ? n.toLocaleString() : "—";
  const pct = (n: number | undefined) => n !== undefined ? `${(n * 100).toFixed(1)}%` : "—";
  const ms = (n: number | undefined) => n !== undefined ? `${Math.round(n)}ms` : "—";

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6" /> Live KPI Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time revenue, stability, AI pipeline, and engagement metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={String(refreshInterval)} onValueChange={(v) => setRefreshInterval(Number(v))}>
            <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30s</SelectItem>
              <SelectItem value="60">60s</SelectItem>
              <SelectItem value="120">2min</SelectItem>
              <SelectItem value="300">5min</SelectItem>
            </SelectContent>
          </Select>
          <Button variant={autoRefresh ? "default" : "outline"} size="sm" onClick={() => setAutoRefresh(!autoRefresh)}>
            <Zap className={`h-4 w-4 mr-1.5 ${autoRefresh ? "animate-pulse" : ""}`} />
            {autoRefresh ? "Live" : "Paused"}
          </Button>
          <Button variant="outline" size="sm" onClick={refreshAll}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ================================================================== */}
      {/* SYSTEM HEALTH OVERVIEW (NEW) */}
      {/* ================================================================== */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4" /> System Health
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Webhook Health Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Webhook className="h-4 w-4" /> Stripe Webhooks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {whLoading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              ) : !webhookStats ? (
                <div className="text-center py-6">
                  <Webhook className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No webhook data available</p>
                  <p className="text-xs text-muted-foreground mt-1">Webhook events will appear after Stripe integration is active</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="text-center p-2 bg-muted/30 rounded-lg">
                      <p className="text-lg font-bold">{webhookStats.total}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <div className="text-center p-2 bg-green-500/10 rounded-lg">
                      <p className="text-lg font-bold text-green-600">{webhookStats.processed}</p>
                      <p className="text-xs text-muted-foreground">Processed</p>
                    </div>
                    <div className="text-center p-2 bg-amber-500/10 rounded-lg">
                      <p className="text-lg font-bold text-amber-600">{webhookStats.processing}</p>
                      <p className="text-xs text-muted-foreground">Processing</p>
                    </div>
                    <div className="text-center p-2 bg-red-500/10 rounded-lg">
                      <p className="text-lg font-bold text-red-600">{webhookStats.failed}</p>
                      <p className="text-xs text-muted-foreground">Failed</p>
                    </div>
                  </div>
                  {webhookStats.total > 0 && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Success Rate</span>
                        <Badge variant={webhookStats.failed === 0 ? "default" : "destructive"}>
                          {((webhookStats.processed / webhookStats.total) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  )}
                  {/* Recent events */}
                  {webhookStats.recentEvents && (webhookStats.recentEvents as any[]).length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Recent Events</p>
                      <div className="space-y-1 max-h-[120px] overflow-y-auto">
                        {(webhookStats.recentEvents as any[]).slice(0, 5).map((evt: any, i: number) => (
                          <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded bg-muted/20">
                            <span className="font-mono truncate max-w-[200px]">{evt.eventType || evt.stripe_event_type}</span>
                            <Badge variant="outline" className="text-[10px]">{evt.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Pipeline Health Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Cpu className="h-4 w-4" /> AI Pipeline Health
                </CardTitle>
                {pipelineHealth && <StatusIndicator status={pipelineHealth.status} />}
              </div>
            </CardHeader>
            <CardContent>
              {phLoading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              ) : !pipelineHealth ? (
                <div className="text-center py-6">
                  <Brain className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No pipeline data available</p>
                  <p className="text-xs text-muted-foreground mt-1">AI pipeline metrics will appear after sessions are processed</p>
                </div>
              ) : (
                <TooltipProvider>
                  <div className="space-y-3">
                    {/* Summary metrics */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-2 bg-muted/30 rounded-lg">
                        <p className="text-lg font-bold">{pct(pipelineHealth.overallFailureRate)}</p>
                        <p className="text-xs text-muted-foreground">Failure Rate</p>
                      </div>
                      <div className="text-center p-2 bg-muted/30 rounded-lg">
                        <p className="text-lg font-bold">{ms(pipelineHealth.avgEndToEndLatencyMs)}</p>
                        <p className="text-xs text-muted-foreground">Avg Latency</p>
                      </div>
                      <div className="text-center p-2 bg-muted/30 rounded-lg">
                        <p className="text-lg font-bold">
                          {pipelineHealth.stageStats
                            ? (pipelineHealth.stageStats as any[]).reduce((sum: number, s: any) => sum + (s.totalCalls || 0), 0)
                            : 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Total Calls</p>
                      </div>
                    </div>

                    {/* Per-stage breakdown */}
                    {pipelineHealth.stageStats && (pipelineHealth.stageStats as any[]).length > 0 && (
                      <div className="pt-2 border-t space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Stage Breakdown</p>
                        {(pipelineHealth.stageStats as any[]).map((stage: any, i: number) => {
                          const StageIcon = STAGE_ICONS[stage.stage] || Gauge;
                          const stageLabel = STAGE_LABELS[stage.stage] || stage.stage;
                          const failRate = stage.failureRate || 0;
                          const barColor = failRate > 0.1 ? "bg-red-500" : failRate > 0.05 ? "bg-amber-500" : "bg-green-500";
                          return (
                            <Tooltip key={i}>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors cursor-default">
                                  <StageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                      <span className="font-medium truncate">{stageLabel}</span>
                                      <span className="text-muted-foreground">
                                        {stage.successCount}/{stage.totalCalls} ok
                                      </span>
                                    </div>
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all ${barColor}`}
                                        style={{ width: `${Math.max(5, (1 - failRate) * 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="text-xs">
                                <div className="space-y-1">
                                  <p>Avg: {ms(stage.avgLatencyMs)} · P95: {ms(stage.p95LatencyMs)}</p>
                                  <p>Failures: {stage.failureCount} ({pct(stage.failureRate)})</p>
                                  {stage.lastError && <p className="text-red-400 truncate max-w-[200px]">Last: {stage.lastError}</p>}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    )}

                    {/* Alerts */}
                    {pipelineHealth.alerts && (pipelineHealth.alerts as any[]).length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs font-medium text-red-500 mb-1">Active Alerts</p>
                        {(pipelineHealth.alerts as any[]).map((alert: any, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-xs p-1.5 bg-red-500/5 rounded">
                            <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                            <span>{typeof alert === "string" ? alert : alert.message || JSON.stringify(alert)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TooltipProvider>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ================================================================== */}
      {/* REAL REVENUE DATA (Stripe + DB) */}
      {/* ================================================================== */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <DollarSign className="h-4 w-4" /> Revenue
          {stripeRevenue?.source && (
            <Badge variant="outline" className="text-[10px] ml-2">
              Source: {stripeRevenue.source === 'stripe' ? 'Stripe API' : 'Database'}
            </Badge>
          )}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon={DollarSign} label="Today Revenue" value={stripeLoading ? '...' : fmt(stripeRevenue?.today?.revenue)} color="bg-green-500/10 text-green-500" />
          <MetricCard icon={TrendingUp} label="Week Revenue" value={stripeLoading ? '...' : fmt(stripeRevenue?.week?.revenue)} color="bg-blue-500/10 text-blue-500" />
          <MetricCard icon={Target} label="Month Revenue" value={stripeLoading ? '...' : fmt(stripeRevenue?.month?.revenue)} color="bg-purple-500/10 text-purple-500" />
          <MetricCard icon={BarChart3} label="Month Transactions" value={stripeLoading ? '...' : num(stripeRevenue?.month?.transactions)} color="bg-amber-500/10 text-amber-500" />
        </div>
        {/* Sparkline */}
        {stripeRevenue?.sparkline && (stripeRevenue.sparkline as any[]).length > 0 && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-2">Daily Revenue (last 30 days)</p>
              <div className="flex items-end gap-1 h-16">
                {(stripeRevenue.sparkline as any[]).map((d: any, i: number) => {
                  const maxRev = Math.max(...(stripeRevenue.sparkline as any[]).map((s: any) => Number(s.revenue) || 0), 1);
                  const h = Math.max(2, (Number(d.revenue) / maxRev) * 100);
                  return (
                    <div key={i} className="flex-1 bg-green-500/60 rounded-t hover:bg-green-500 transition-colors" style={{ height: `${h}%` }} title={`${d.date}: $${Number(d.revenue).toFixed(0)}`} />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ================================================================== */}
      {/* USER & ENROLLMENT ANALYTICS */}
      {/* ================================================================== */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Users className="h-4 w-4" /> Users & Enrollments
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon={Users} label="Total Users" value={uaLoading ? '...' : num(userAnalytics?.totalUsers)} color="bg-blue-500/10 text-blue-500" />
          <MetricCard icon={TrendingUp} label="New This Week" value={uaLoading ? '...' : num(userAnalytics?.newUsersWeek)} color="bg-cyan-500/10 text-cyan-500" />
          <MetricCard icon={BookOpen} label="Active Enrollments" value={uaLoading ? '...' : num(userAnalytics?.activeEnrollments)} color="bg-emerald-500/10 text-emerald-500" />
          <MetricCard icon={Target} label="Completion Rate" value={uaLoading ? '...' : `${userAnalytics?.completionRate ?? 0}%`} color="bg-purple-500/10 text-purple-500" />
        </div>
        {/* Role distribution */}
        {userAnalytics?.roleDistribution && (userAnalytics.roleDistribution as any[]).length > 0 && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-3">User Role Distribution</p>
              <div className="flex flex-wrap gap-3">
                {(userAnalytics.roleDistribution as any[]).map((r: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-full">
                    <span className="text-sm font-medium capitalize">{r.role || 'user'}</span>
                    <Badge variant="secondary" className="text-xs">{r.cnt}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ================================================================== */}
      {/* AI METRICS (Real Data) */}
      {/* ================================================================== */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Brain className="h-4 w-4" /> AI Pipeline Metrics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon={Brain} label="Pipeline Success Rate" value={aiLoading ? '...' : `${aiMetrics?.pipeline?.successRate ?? 100}%`} color="bg-violet-500/10 text-violet-500" />
          <MetricCard icon={Clock} label="Avg Latency" value={aiLoading ? '...' : ms(aiMetrics?.pipeline?.avgLatencyMs)} color="bg-orange-500/10 text-orange-500" />
          <MetricCard icon={Mic} label="Practice Sessions" value={aiLoading ? '...' : num(aiMetrics?.practice?.totalSessions)} color="bg-cyan-500/10 text-cyan-500" />
          <MetricCard icon={MessageSquare} label="SLE Companion" value={aiLoading ? '...' : num(aiMetrics?.companion?.totalSessions)} color="bg-emerald-500/10 text-emerald-500" />
        </div>
        {aiMetrics?.practice && (aiMetrics.practice.totalSessions > 0 || aiMetrics.companion.totalSessions > 0) && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Practice Sessions</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span>Avg Score</span><span className="font-bold">{aiMetrics.practice.avgScore}/100</span></div>
                    <div className="flex justify-between text-sm"><span>Unique Users</span><span className="font-bold">{aiMetrics.practice.uniqueUsers}</span></div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">SLE Companion</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span>Avg Score</span><span className="font-bold">{aiMetrics.companion.avgScore}/100</span></div>
                    <div className="flex justify-between text-sm"><span>Sessions (7d)</span><span className="font-bold">{aiMetrics.companion.totalSessions}</span></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ================================================================== */}
      {/* ENGAGEMENT METRICS (existing) */}
      {/* ================================================================== */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Brain className="h-4 w-4" /> AI & Learning Engagement
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon={Brain} label="AI Sessions" value={num(engagement?.aiSessions)} change={engagement?.aiSessionChange} color="bg-violet-500/10 text-violet-500" />
          <MetricCard icon={Users} label="Active Learners" value={num(engagement?.activeLearners)} change={engagement?.learnerChange} color="bg-cyan-500/10 text-cyan-500" />
          <MetricCard icon={Clock} label="Avg Session Duration" value={engagement?.avgSessionDuration ? `${Math.round(engagement.avgSessionDuration / 60)}m` : "—"} color="bg-orange-500/10 text-orange-500" />
          <MetricCard icon={BookOpen} label="Lessons Completed" value={num(engagement?.lessonsCompleted)} color="bg-emerald-500/10 text-emerald-500" />
        </div>
      </div>

      {/* ================================================================== */}
      {/* CONVERSION FUNNEL + REVENUE BY PRODUCT (existing) */}
      {/* ================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Target className="h-5 w-5" /> Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {convLoading ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>
            ) : (
              <>
                <ProgressBar label="Visitors → Signups" value={conversion?.signups ?? 0} max={conversion?.visitors ?? 1} color="bg-blue-500" />
                <ProgressBar label="Signups → Enrollments" value={conversion?.enrollments ?? 0} max={conversion?.signups ?? 1} color="bg-purple-500" />
                <ProgressBar label="Enrollments → Payments" value={conversion?.payments ?? 0} max={conversion?.enrollments ?? 1} color="bg-green-500" />
                <ProgressBar label="Payments → Completions" value={conversion?.completions ?? 0} max={conversion?.payments ?? 1} color="bg-emerald-500" />
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Overall Conversion</span>
                    <Badge variant="outline">
                      {conversion?.visitors && conversion.visitors > 0
                        ? `${((conversion.payments ?? 0) / conversion.visitors * 100).toFixed(1)}%`
                        : "N/A"}
                    </Badge>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Revenue by Product</CardTitle>
          </CardHeader>
          <CardContent>
            {revLoading ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>
            ) : !(revenue as any)?.byProduct || ((revenue as any)?.byProduct as any[]).length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No revenue data yet</p>
                <p className="text-xs text-muted-foreground mt-1">Complete a test payment to see data here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {((revenue as any)?.byProduct as any[]).map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.count} sales</p>
                    </div>
                    <p className="font-bold">${p.revenue?.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ================================================================== */}
      {/* LIVE ACTIVITY FEED (existing) */}
      {/* ================================================================== */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5" /> Live Activity
              {autoRefresh && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" /></span>}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {engLoading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>
          ) : !engagement?.recentActivity || (engagement.recentActivity as any[]).length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
              <p className="text-xs text-muted-foreground mt-1">User interactions will appear here in real-time</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {(engagement.recentActivity as any[]).map((a: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded hover:bg-muted/30 transition-colors">
                  <div className={`h-2 w-2 rounded-full ${a.type === "payment" ? "bg-green-500" : a.type === "enrollment" ? "bg-blue-500" : a.type === "ai_session" ? "bg-violet-500" : "bg-gray-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{a.description}</p>
                    <p className="text-xs text-muted-foreground">{a.timestamp ? new Date(a.timestamp).toLocaleString() : "—"}</p>
                  </div>
                  {a.amount && <Badge variant="outline" className="shrink-0">${a.amount}</Badge>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
