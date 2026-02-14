import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain, TrendingUp, AlertTriangle, Users, Target,
  ChevronRight, ArrowUp, ArrowDown, Minus, Shield,
  Lightbulb, BarChart3, Clock, Star, RefreshCw
} from "lucide-react";

const riskColors: Record<string, { text: string; bg: string; border: string }> = {
  critical: { text: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
  high: { text: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
  medium: { text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  low: { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
};

export default function AIPredictive() {
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [sortBy, setSortBy] = useState<"risk" | "progress" | "name">("risk");

  const { data: predictions, refetch: refetchPredictions } = trpc.aiPredictive.getStudentPredictions.useQuery();
  const { data: cohorts } = trpc.aiPredictive.getCohortAnalysis.useQuery();
  const { data: trends } = trpc.aiPredictive.getEngagementTrends.useQuery();
  const { data: summary } = trpc.aiPredictive.getRecommendationsSummary.useQuery();

  const sortedStudents = useMemo(() => {
    if (!predictions) return [];
    const arr = [...(predictions as any[])];
    switch (sortBy) {
      case "risk": return arr.sort((a, b) => b.riskScore - a.riskScore);
      case "progress": return arr.sort((a, b) => (parseFloat(b.avgProgress) || 0) - (parseFloat(a.avgProgress) || 0));
      case "name": return arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      default: return arr;
    }
  }, [predictions, sortBy]);

  const riskDistribution = useMemo(() => {
    if (!predictions) return { critical: 0, high: 0, medium: 0, low: 0 };
    return (predictions as any[]).reduce((acc, s) => {
      acc[s.riskLevel as keyof typeof acc] = (acc[s.riskLevel as keyof typeof acc] || 0) + 1;
      return acc;
    }, { critical: 0, high: 0, medium: 0, low: 0 });
  }, [predictions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-7 h-7 text-violet-600" />
            AI Predictive Analytics
          </h1>
          <p className="text-gray-500 mt-1">
            Student success predictions, churn risk analysis, and actionable recommendations
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetchPredictions()}>
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">At Risk</p>
                <p className="text-3xl font-bold text-red-600">{summary?.atRiskCount || 0}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-200" />
            </div>
            <p className="text-xs text-gray-400 mt-1">Inactive 14+ days with enrollments</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Needs Attention</p>
                <p className="text-3xl font-bold text-amber-600">{summary?.needsAttentionCount || 0}</p>
              </div>
              <Target className="w-8 h-8 text-amber-200" />
            </div>
            <p className="text-xs text-gray-400 mt-1">Progress below 30%</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">High Performers</p>
                <p className="text-3xl font-bold text-emerald-600">{summary?.highPerformersCount || 0}</p>
              </div>
              <Star className="w-8 h-8 text-emerald-200" />
            </div>
            <p className="text-xs text-gray-400 mt-1">Progress 80%+</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-violet-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Tracked</p>
                <p className="text-3xl font-bold text-violet-600">{(predictions as any[])?.length || 0}</p>
              </div>
              <Users className="w-8 h-8 text-violet-200" />
            </div>
            <p className="text-xs text-gray-400 mt-1">Students with enrollments</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Risk Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 h-8">
            {Object.entries(riskDistribution).map(([level, count]) => {
              // @ts-expect-error - TS2365: auto-suppressed during TS cleanup
              const total = Object.values(riskDistribution).reduce((a, b) => a + b, 0) || 1;
              // @ts-expect-error - TS2362: auto-suppressed during TS cleanup
              const pct = Math.round((count / total) * 100);
              const colors: Record<string, string> = {
                critical: "bg-red-500",
                high: "bg-orange-500",
                medium: "bg-amber-400",
                low: "bg-emerald-500",
              };
              if (pct === 0) return null;
              return (
                <div
                  key={level}
                  className={`${colors[level]} h-full rounded-md flex items-center justify-center text-white text-xs font-medium transition-all`}
                  style={{ width: `${Math.max(pct, 5)}%` }}
                  title={`${level}: ${count} students (${pct}%)`}
                >
                  {pct >= 10 && `${count}`}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Critical ({riskDistribution.critical})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> High ({riskDistribution.high})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Medium ({riskDistribution.medium})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Low ({riskDistribution.low})</span>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      {summary?.recommendations && (
        <Card className="bg-violet-50/30 border-violet-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-violet-600" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.recommendations.map((rec: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                  <Badge
                    variant={rec.priority === "high" ? "destructive" : rec.priority === "medium" ? "default" : "secondary"}
                    className="mt-0.5 text-xs"
                  >
                    {rec.priority}
                  </Badge>
                  <div>
                    <h4 className="font-medium text-sm text-gray-900">{rec.action}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{rec.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Predictions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Student Predictions</CardTitle>
              <CardDescription>Individual risk scores and success predictions</CardDescription>
            </div>
            <div className="flex gap-1">
              {(["risk", "progress", "name"] as const).map((s) => (
                <Button key={s} variant={sortBy === s ? "default" : "outline"} size="sm" onClick={() => setSortBy(s)} className="capitalize">
                  {s === "risk" ? "Risk Score" : s === "progress" ? "Progress" : "Name"}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sortedStudents.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                <Users className="w-8 h-8 mx-auto mb-2" />
                <p>No student data available yet</p>
              </div>
            ) : (
              sortedStudents.map((s: any) => {
                const rc = riskColors[s.riskLevel] || riskColors.low;
                return (
                  <div
                    key={s.id}
                    className={`p-3 rounded-lg border ${rc.border} ${rc.bg} cursor-pointer hover:shadow-md transition-all ${selectedStudent?.id === s.id ? "ring-2 ring-violet-400" : ""}`}
                    onClick={() => setSelectedStudent(selectedStudent?.id === s.id ? null : s)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border">
                          <span className="text-sm font-bold">{(s.name || "?")[0]}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{s.name}</h4>
                          <p className="text-xs text-gray-500">{s.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Risk</div>
                          <div className={`text-lg font-bold ${rc.text}`}>{s.riskScore}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Success</div>
                          <div className="text-lg font-bold text-emerald-600">{s.successProbability}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Progress</div>
                          <div className="text-lg font-bold text-violet-600">{Math.round(parseFloat(s.avgProgress) || 0)}%</div>
                        </div>
                        <Badge variant="outline" className={`capitalize ${rc.text} ${rc.border}`}>
                          {s.riskLevel}
                        </Badge>
                        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${selectedStudent?.id === s.id ? "rotate-90" : ""}`} />
                      </div>
                    </div>
                    {selectedStudent?.id === s.id && (
                      <div className="mt-3 pt-3 border-t border-gray-200/50 grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-2 bg-white rounded-lg">
                          <div className="text-xs text-gray-500">Enrolled Courses</div>
                          <div className="font-bold">{s.enrolledCourses}</div>
                        </div>
                        <div className="p-2 bg-white rounded-lg">
                          <div className="text-xs text-gray-500">Practice Sessions</div>
                          <div className="font-bold">{s.practiceCount}</div>
                        </div>
                        <div className="p-2 bg-white rounded-lg">
                          <div className="text-xs text-gray-500">Days Since Practice</div>
                          <div className="font-bold">{s.daysSinceLastPractice === 999 ? "Never" : `${s.daysSinceLastPractice}d`}</div>
                        </div>
                        <div className="p-2 bg-white rounded-lg">
                          <div className="text-xs text-gray-500">Recommendation</div>
                          <div className="text-xs font-medium">{s.recommendation}</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cohort Analysis */}
      {cohorts && (cohorts as any[]).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Cohort Analysis</CardTitle>
            <CardDescription>Track how each enrollment cohort performs over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Cohort</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-500">Students</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-500">Avg Progress</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-500">Completions</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-500">Never Started</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-500">Completion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {(cohorts as any[]).map((c: any) => {
                    const completionRate = c.students > 0 ? Math.round((c.completions / c.students) * 100) : 0;
                    return (
                      <tr key={c.cohort} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium">{c.cohort}</td>
                        <td className="py-2 px-3 text-right">{c.students}</td>
                        <td className="py-2 px-3 text-right">{Math.round(parseFloat(c.avgProgress) || 0)}%</td>
                        <td className="py-2 px-3 text-right text-emerald-600">{c.completions}</td>
                        <td className="py-2 px-3 text-right text-red-600">{c.neverStarted}</td>
                        <td className="py-2 px-3 text-right">
                          <Badge variant={completionRate >= 50 ? "default" : completionRate >= 25 ? "secondary" : "destructive"}>
                            {completionRate}%
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Engagement Trends */}
      {trends && (trends as any[]).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">30-Day Engagement Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Date</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-500">Sessions</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-500">Unique Users</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-500">Avg Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {(trends as any[]).slice(0, 14).map((t: any) => (
                    <tr key={t.date} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3 font-medium">{new Date(t.date).toLocaleDateString()}</td>
                      <td className="py-2 px-3 text-right">{t.sessions}</td>
                      <td className="py-2 px-3 text-right">{t.uniqueUsers}</td>
                      <td className="py-2 px-3 text-right">{Math.round(parseFloat(t.avgDuration) || 0)} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
