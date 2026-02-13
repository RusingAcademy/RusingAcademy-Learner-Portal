import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import AdminSectionShell from "@/components/AdminSectionShell";
import AdminStatsGrid from "@/components/AdminStatsGrid";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function AdminExecutiveSummary() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const kpis = trpc.admin.executiveKPIs.useQuery();
  const health = trpc.admin.platformHealth.useQuery();
  const revenue = trpc.admin.revenueTrend.useQuery();
  const performers = trpc.admin.topPerformers.useQuery();
  const activity = trpc.admin.recentActivity.useQuery();

  if (user?.role !== "admin") {
    return <div className="p-8 text-center text-muted-foreground">Access denied</div>;
  }

  const k = kpis.data;
  const h = health.data;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <AdminSectionShell
        title="Executive Summary"
        description="Platform-wide KPIs, health metrics, and performance insights"
      >
        {/* 8 KPI Cards — mapped to actual db-admin return fields */}
        {k && (
          <AdminStatsGrid
            stats={[
              { label: "Total Users", value: k.totalUsers?.toLocaleString() ?? "0" },
              { label: "Active Users (30d)", value: k.activeUsers?.toLocaleString() ?? "0", color: "text-[#008090]" },
              { label: "Lessons Completed", value: k.completedLessons?.toLocaleString() ?? "0", color: "text-green-600" },
              { label: "Retention Rate", value: `${k.retentionRate ?? 0}%`, color: (k.retentionRate ?? 0) >= 70 ? "text-green-600" : "text-amber-600" },
              { label: "Total Enrollments", value: k.totalEnrollments?.toLocaleString() ?? "0" },
              { label: "Active Coaches", value: k.activeCoaches?.toLocaleString() ?? "0", color: "text-blue-600" },
              { label: "Content Items", value: k.contentItems?.toLocaleString() ?? "0" },
              { label: "User Growth", value: k.totalUsers > 0 ? `${Math.round((k.activeUsers / k.totalUsers) * 100)}%` : "0%", color: "text-emerald-600" },
            ]}
            columns={4}
          />
        )}

        {/* Platform Health Card */}
        {h && (
          <Card className="border border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Platform Health
                <StatusBadge
                  variant={h.status === "healthy" ? "active" : h.status === "moderate" ? "pending" : "suspended"}
                  label={`${h.healthScore}/100`}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: "Daily Activity", value: h.dailyActivity },
                  { label: "Weekly Activity", value: h.weeklyActivity },
                  { label: "Health Score", value: h.healthScore },
                ].map((m, i) => (
                  <div key={i} className="text-center">
                    <div
                      className="text-2xl font-bold"
                      style={{
                        color: m.label === "Health Score"
                          ? (m.value >= 80 ? "#16a34a" : m.value >= 60 ? "#d97706" : "#dc2626")
                          : "#008090",
                      }}
                    >
                      {m.label === "Health Score" ? `${m.value}%` : m.value}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{m.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabbed Detail Sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Revenue Trend</TabsTrigger>
            <TabsTrigger value="performers">Top Performers</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          {/* Revenue Trend */}
          <TabsContent value="overview" className="space-y-4">
            <Card className="border border-gray-100">
              <CardHeader>
                <CardTitle className="text-base">Monthly Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {!revenue.data || revenue.data.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No revenue data available yet.</p>
                ) : (
                  <div className="space-y-2">
                    {revenue.data.map((r: any, i: number) => {
                      const maxRev = Math.max(...revenue.data!.map((x: any) => Number(x.revenue) || 1));
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground w-24">{r.label}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                            <div
                              className="bg-[#008090] h-full rounded-full transition-all"
                              style={{ width: `${Math.min(100, maxRev > 0 ? (Number(r.revenue) / maxRev) * 100 : 0)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-24 text-right">
                            ${Number(r.revenue ?? 0).toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground w-16 text-right">
                            {r.enrollments} enr.
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Performers */}
          <TabsContent value="performers" className="space-y-4">
            {!performers.data || performers.data.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No performer data available.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Activity Count (30d)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performers.data.map((p: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="font-bold text-[#008090]">#{i + 1}</TableCell>
                      <TableCell className="font-medium">User #{p.userId}</TableCell>
                      <TableCell>{p.activityCount ?? 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          {/* Recent Activity */}
          <TabsContent value="activity" className="space-y-4">
            {!activity.data || activity.data.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No recent activity.</p>
            ) : (
              <div className="space-y-3">
                {activity.data.map((a: any, i: number) => (
                  <Card key={i} className="border border-gray-50">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{a.activityType}</p>
                        <p className="text-xs text-muted-foreground">User #{a.userId}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(a.createdAt).toLocaleString()}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Export */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => {
              const csvData = [
                ["Metric", "Value"],
                ["Total Users", String(k?.totalUsers ?? 0)],
                ["Active Users", String(k?.activeUsers ?? 0)],
                ["Lessons Completed", String(k?.completedLessons ?? 0)],
                ["Retention Rate", `${k?.retentionRate ?? 0}%`],
                ["Health Score", String(h?.healthScore ?? 0)],
              ]
                .map((r) => r.join(","))
                .join("\n");
              const blob = new Blob([csvData], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const anchor = document.createElement("a");
              anchor.href = url;
              anchor.download = "executive-summary.csv";
              anchor.click();
            }}
          >
            Export CSV
          </Button>
        </div>
      </AdminSectionShell>
    </div>
  );
}
