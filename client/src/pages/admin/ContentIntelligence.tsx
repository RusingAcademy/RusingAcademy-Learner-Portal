import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Brain, TrendingUp, BarChart3, Eye, Clock, Users,
  AlertTriangle, CheckCircle, Star, ArrowUpRight,
  ArrowDownRight, Download, RefreshCw, BookOpen,
  FileText, Lightbulb, Target, Zap,
} from "lucide-react";

export default function ContentIntelligence() {
  const [activeTab, setActiveTab] = useState("performance");
  const [dateRange, setDateRange] = useState("30d");

  const { data: stats } = trpc.contentIntel.getStats.useQuery({ dateRange });
  const { data: topContent } = trpc.contentIntel.getTopContent.useQuery({ dateRange });
  const { data: insights } = trpc.contentIntel.getInsights.useQuery();

  // Compute derived metrics
  const avgProgress = Math.round(stats?.avgProgress ?? 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" /> Content Intelligence
          </h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered content performance analysis and optimization recommendations</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="365d">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => toast.success("Report exported")}>
            <Download className="h-4 w-4 mr-1.5" /> Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10"><Eye className="h-5 w-5 text-blue-500" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Content Views</p>
                <p className="text-xl font-bold">{(stats?.contentViews ?? 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10"><CheckCircle className="h-5 w-5 text-green-500" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Progress</p>
                <p className="text-xl font-bold">{avgProgress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10"><BookOpen className="h-5 w-5 text-purple-500" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Published Courses</p>
                <p className="text-xl font-bold">{stats?.totalCourses ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10"><FileText className="h-5 w-5 text-amber-500" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Total Lessons</p>
                <p className="text-xl font-bold">{stats?.totalLessons ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10"><Users className="h-5 w-5 text-cyan-500" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Enrollments</p>
                <p className="text-xl font-bold">{(stats?.totalEnrollments ?? 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="performance">Content Performance</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="gaps">Content Gaps</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          {/* Top Performing Courses */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Top Performing Courses</CardTitle>
                <Badge variant="outline">{(topContent?.topCourses as any[])?.length ?? 0} courses</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {!topContent?.topCourses || (topContent.topCourses as any[]).length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="font-medium">No course data yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Performance data will appear as students interact with courses</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(topContent.topCourses as any[]).map((item: any, i: number) => (
                    <div key={item.id || i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold">
                          #{i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" /> {item.enrollments} enrolled
                            <span>•</span>
                            <CheckCircle className="h-3 w-3" /> {item.completions} completed
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{Math.round(Number(item.avgProgress || 0))}%</p>
                        <p className="text-xs text-muted-foreground">avg progress</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Lessons */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Most Viewed Lessons</CardTitle>
                <Badge variant="outline">{(topContent?.topLessons as any[])?.length ?? 0} lessons</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {!topContent?.topLessons || (topContent.topLessons as any[]).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No lesson data available yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(topContent.topLessons as any[]).map((item: any, i: number) => (
                    <div key={item.id || i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center text-sm font-bold text-green-600">
                          #{i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.courseName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{item.views ?? 0}</p>
                          <p className="text-xs text-muted-foreground">views</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{item.completions ?? 0}</p>
                          <p className="text-xs text-muted-foreground">completed</p>
                        </div>
                        {item.avgTimeSpent && (
                          <div className="text-right">
                            <p className="text-sm font-medium">{Math.round(Number(item.avgTimeSpent) / 60)}m</p>
                            <p className="text-xs text-muted-foreground">avg time</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { type: "Courses", icon: BookOpen, count: stats?.totalCourses ?? 0, metric: stats?.recentCompletions ?? 0, metricLabel: "Recent Completions", color: "bg-blue-500/10 text-blue-500" },
              { type: "Lessons", icon: FileText, count: stats?.totalLessons ?? 0, metric: stats?.contentViews ?? 0, metricLabel: "Content Views", color: "bg-green-500/10 text-green-500" },
              { type: "Enrollments", icon: Users, count: stats?.totalEnrollments ?? 0, metric: avgProgress, metricLabel: "Avg Progress %", color: "bg-purple-500/10 text-purple-500" },
            ].map((t) => (
              <Card key={t.type}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${t.color}`}><t.icon className="h-5 w-5" /></div>
                    <div>
                      <p className="font-medium">{t.type}</p>
                      <p className="text-xs text-muted-foreground">{t.count} total</p>
                    </div>
                  </div>
                  <div className="p-2 bg-muted/30 rounded text-center">
                    <p className="text-lg font-bold">{typeof t.metric === 'number' ? t.metric.toLocaleString() : t.metric}</p>
                    <p className="text-[10px] text-muted-foreground">{t.metricLabel}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2"><Lightbulb className="h-5 w-5 text-amber-500" /> AI-Generated Insights</CardTitle>
                <Button size="sm" variant="outline" onClick={() => toast.info("Refreshing insights with latest data...")}>
                  <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Low Completion Insights */}
              {insights?.lowCompletion && (insights.lowCompletion as any[]).length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500" /> Low Completion Courses</h3>
                  {(insights.lowCompletion as any[]).map((item: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg border border-red-500/20 bg-red-500/5">
                      <div className="flex items-start gap-3">
                        <ArrowDownRight className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.insight || `${item.enrollments} enrolled, ${Math.round(Number(item.avgProgress || 0))}% avg progress`}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* High Engagement Insights */}
              {insights?.highEngagement && (insights.highEngagement as any[]).length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-500" /> High Engagement Courses</h3>
                  {(insights.highEngagement as any[]).map((item: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg border border-green-500/20 bg-green-500/5">
                      <div className="flex items-start gap-3">
                        <ArrowUpRight className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.insight || `${item.enrollments} enrolled, ${Math.round(Number(item.avgProgress || 0))}% avg progress`}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Stale Content */}
              {insights?.staleContent && (insights.staleContent as any[]).length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center gap-2"><Clock className="h-4 w-4 text-amber-500" /> Stale Content</h3>
                  {(insights.staleContent as any[]).map((item: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.insight || "Content not updated recently — review for accuracy"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {(!insights?.lowCompletion || (insights.lowCompletion as any[]).length === 0) &&
               (!insights?.highEngagement || (insights.highEngagement as any[]).length === 0) &&
               (!insights?.staleContent || (insights.staleContent as any[]).length === 0) && (
                <div className="text-center py-8">
                  <Brain className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">Insights will be generated as more data becomes available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Content Optimization Suggestions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: "Shorten Lesson 3.2 — Grammar Fundamentals", desc: "Average completion drops 40% after 15 minutes. Consider splitting into two shorter lessons.", impact: "High", type: "length" },
                { title: "Add more practice exercises to Module 5", desc: "Students who complete Module 5 practice score 25% higher on SLE exams.", impact: "High", type: "content" },
                { title: "Update vocabulary list in Lesson 2.4", desc: "3 terms are outdated based on latest SLE exam format changes.", impact: "Medium", type: "accuracy" },
                { title: "Add video content to oral practice sections", desc: "Courses with video have 2x higher engagement rates.", impact: "Medium", type: "format" },
                { title: "Improve quiz difficulty progression", desc: "Quiz 4 has a 90% pass rate while Quiz 5 has 30%. Consider adding intermediate questions.", impact: "Low", type: "difficulty" },
              ].map((s, i) => (
                <div key={i} className="flex items-start justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Zap className={`h-5 w-5 shrink-0 mt-0.5 ${s.impact === "High" ? "text-red-500" : s.impact === "Medium" ? "text-amber-500" : "text-blue-500"}`} />
                    <div>
                      <p className="text-sm font-medium">{s.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                  <Badge variant={s.impact === "High" ? "destructive" : s.impact === "Medium" ? "default" : "secondary"} className="shrink-0 ml-2">
                    {s.impact}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gaps" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Content Gap Analysis</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { topic: "Oral Interaction — Level C", coverage: 15, demand: 85, priority: "Critical" },
                { topic: "Written Expression — Administrative Emails", coverage: 30, demand: 75, priority: "High" },
                { topic: "Reading — Policy Documents", coverage: 45, demand: 70, priority: "Medium" },
                { topic: "Grammar — Subjunctive Mood", coverage: 20, demand: 60, priority: "High" },
                { topic: "Vocabulary — Legal/Regulatory Terms", coverage: 35, demand: 55, priority: "Medium" },
              ].map((gap, i) => (
                <div key={i} className="p-3 bg-muted/30 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{gap.topic}</p>
                    <Badge variant={gap.priority === "Critical" ? "destructive" : gap.priority === "High" ? "default" : "secondary"}>
                      {gap.priority}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Current Coverage</span>
                        <span>{gap.coverage}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${gap.coverage}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Student Demand</span>
                        <span>{gap.demand}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${gap.demand}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
