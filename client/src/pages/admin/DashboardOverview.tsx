import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  Users, BookOpen, DollarSign, GraduationCap, TrendingUp,
  Plus, UserPlus, Tag, Eye, ArrowRight, Activity,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({ title, value, icon: Icon, subtitle }: {
  title: string; value: string | number; icon: React.ElementType; subtitle?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          <div className="p-2.5 rounded-lg" style={{ backgroundColor: "var(--brand-foundation)", opacity: 0.1 }}>
            <Icon className="h-5 w-5" style={{ color: "var(--brand-foundation)" }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardOverview() {
  const [, navigate] = useLocation();
  const { data: analytics, isLoading: analyticsLoading } = trpc.admin.getAnalytics.useQuery();
  const { data: orgStats, isLoading: orgLoading } = trpc.admin.getOrgStats.useQuery();
  const { data: recentActivity, isLoading: activityLoading } = trpc.admin.getRecentActivity.useQuery();

  const a = analytics as any ?? {};
  const o = orgStats as any ?? {};
  const totalUsers = a.totalUsers ?? o.totalLearners ?? 0;
  const totalCourses = o.totalLearners ?? 0;
  const totalCoaches = a.activeCoaches ?? 0;
  const totalRevenue = a.revenue ?? 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back. Here's your ecosystem overview.</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => navigate("/admin/preview")}>
          <Eye className="h-4 w-4 mr-1.5" /> Preview as Student
        </Button>
      </div>

      {/* Quick Actions */}
      <Card className="border-0" style={{ background: "linear-gradient(135deg, var(--brand-foundation), var(--brand-foundation-dark, #1a365d))" }}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-white text-sm font-medium mr-2">Quick Actions:</span>
            {[
              { label: "Create Course", icon: Plus, path: "/admin/courses?action=create" },
              { label: "Invite User", icon: UserPlus, path: "/admin/users?action=invite" },
              { label: "Create Coupon", icon: Tag, path: "/admin/coupons?action=create" },
              { label: "View Analytics", icon: TrendingUp, path: "/admin/analytics" },
            ].map((a) => (
              <Button key={a.label} size="sm" variant="secondary" className="gap-1.5 text-xs h-8"
                onClick={() => navigate(a.path)}>
                <a.icon className="h-3.5 w-3.5" /> {a.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      {analyticsLoading || orgLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Card key={i}><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={totalUsers} icon={Users} subtitle="Registered accounts" />
          <StatCard title="Active Courses" value={totalCourses} icon={BookOpen} subtitle="Published courses" />
          <StatCard title="Active Coaches" value={totalCoaches} icon={GraduationCap} subtitle="Approved coaches" />
          <StatCard title="Revenue" value={`$${(totalRevenue / 100).toLocaleString()}`} icon={DollarSign} subtitle="Total earned" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigate("/admin/activity")}>
                View All <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.slice(0, 6).map((item: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 text-sm">
                    <Activity className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm truncate">{item.description || item.action || "Activity recorded"}</p>
                      <p className="text-xs text-muted-foreground">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No recent activity</p>
            )}
          </CardContent>
        </Card>

        {/* Manage Ecosystem */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Manage Your Ecosystem</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Courses", desc: "Create & manage", icon: BookOpen, path: "/admin/courses" },
                { label: "Users", desc: "Manage roles", icon: Users, path: "/admin/users" },
                { label: "Coaching", desc: "Coach profiles", icon: GraduationCap, path: "/admin/coaches" },
                { label: "Pricing", desc: "Plans & checkout", icon: DollarSign, path: "/admin/pricing" },
                { label: "Coupons", desc: "Discounts", icon: Tag, path: "/admin/coupons" },
                { label: "Analytics", desc: "Reports", icon: TrendingUp, path: "/admin/analytics" },
              ].map((link) => (
                <button key={link.label} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors text-left"
                  onClick={() => navigate(link.path)}>
                  <link.icon className="h-5 w-5 shrink-0" style={{ color: "var(--brand-foundation)" }} />
                  <div><p className="text-sm font-medium">{link.label}</p><p className="text-xs text-muted-foreground">{link.desc}</p></div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
