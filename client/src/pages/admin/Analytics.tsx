import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, BookOpen, DollarSign, GraduationCap, BarChart3, Activity, TrendingUp, Calendar } from "lucide-react";

export default function Analytics() {
  const { data: analytics, isLoading } = trpc.admin.getAnalytics.useQuery();
  const { data: orgStats } = trpc.admin.getOrgStats.useQuery();
  const { data: courseStats } = trpc.admin.getCourseStats.useQuery();

  if (isLoading) return <div className="p-6 max-w-7xl mx-auto space-y-6"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}</div></div>;

  const a = analytics as any ?? {};
  const o = orgStats as any ?? {};
  const totalUsers = a.totalUsers ?? o.totalLearners ?? 0;
  const activeCoaches = a.activeCoaches ?? 0;
  const sessionsThisMonth = a.sessionsThisMonth ?? 0;
  const revenue = a.revenue ?? 0;
  const totalLearners = a.totalLearners ?? o.totalLearners ?? 0;
  const pendingCoaches = a.pendingCoaches ?? 0;
  const monthlyRevenue = a.monthlyRevenue ?? [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold">Analytics & Reports</h1><p className="text-sm text-muted-foreground">Track performance, engagement, and revenue across your ecosystem.</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: totalUsers, icon: Users, color: "#2563eb", sub: `${totalLearners} learners` },
          { label: "Active Coaches", value: activeCoaches, icon: GraduationCap, color: "#059669", sub: `${pendingCoaches} pending` },
          { label: "Sessions (Month)", value: sessionsThisMonth, icon: Calendar, color: "#7c3aed", sub: a.sessionGrowth ? `${a.sessionGrowth > 0 ? "+" : ""}${a.sessionGrowth}%` : "" },
          { label: "Revenue", value: `$${(revenue / 100).toLocaleString()}`, icon: DollarSign, color: "#dc2626", sub: a.revenueGrowth ? `${a.revenueGrowth > 0 ? "+" : ""}${a.revenueGrowth}%` : "" },
        ].map((s) => (
          <Card key={s.label}><CardContent className="p-4"><div className="flex items-center gap-3"><s.icon className="h-5 w-5" style={{ color: s.color }} /><div><p className="text-xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p>{s.sub && <p className="text-xs text-muted-foreground">{s.sub}</p>}</div></div></CardContent></Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Course Performance</CardTitle></CardHeader>
          <CardContent>{courseStats && Array.isArray(courseStats) && courseStats.length > 0 ? (
            <div className="space-y-3">{(courseStats as any[]).slice(0, 8).map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between"><span className="text-sm truncate max-w-[200px]">{c.title || c.name}</span><div className="flex items-center gap-3 text-sm"><span className="text-muted-foreground">{c.enrollmentCount ?? 0} enrolled</span><div className="w-24 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(5, ((c.enrollmentCount ?? 0) / Math.max(totalUsers, 1)) * 100))}%`, backgroundColor: "#2563eb" }} /></div></div></div>
            ))}</div>
          ) : <p className="text-sm text-muted-foreground text-center py-4">No course data yet</p>}</CardContent>
        </Card>
        <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Monthly Revenue</CardTitle></CardHeader>
          <CardContent>{monthlyRevenue.length > 0 ? (
            <div className="space-y-2">{monthlyRevenue.map((m: any, i: number) => (
              <div key={i} className="flex items-center justify-between"><span className="text-sm">{m.month}</span><div className="flex items-center gap-3"><div className="w-32 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full bg-green-500" style={{ width: `${Math.min(100, Math.max(3, (m.revenue / Math.max(revenue, 1)) * 100))}%` }} /></div><span className="text-sm font-medium w-20 text-right">${(m.revenue / 100).toFixed(0)}</span></div></div>
            ))}</div>
          ) : <p className="text-sm text-muted-foreground text-center py-4">No revenue data yet</p>}</CardContent>
        </Card>
      </div>
      <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" /> Platform Health</CardTitle></CardHeader>
        <CardContent><div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active This Week", value: o.activeThisWeek ?? 0 },
            { label: "Completions", value: o.completions ?? 0 },
            { label: "Coaches w/ Stripe", value: a.coachesWithStripe ?? 0 },
            { label: "Coaches w/o Stripe", value: a.coachesWithoutStripe ?? 0 },
          ].map(s => (
            <div key={s.label} className="text-center p-3 bg-muted/50 rounded-lg"><p className="text-lg font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
          ))}
        </div></CardContent>
      </Card>
    </div>
  );
}
