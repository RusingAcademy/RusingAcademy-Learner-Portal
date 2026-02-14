import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  TrendingUp, TrendingDown, DollarSign, Users, BarChart3,
  Download, Loader2, Target, ArrowRight, Percent, UserMinus,
  Calendar, Filter, Package, Layers
} from "lucide-react";

type SalesTab = "funnel" | "ltv" | "churn" | "revenue" | "products" | "export";

export default function SalesAnalytics() {
  const [activeTab, setActiveTab] = useState<SalesTab>("funnel");
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 6);
    return d.toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [exportType, setExportType] = useState<"enrollments" | "coaching" | "all">("all");
  const [exporting, setExporting] = useState(false);

  const funnelQuery = trpc.salesAnalytics.getConversionFunnel.useQuery();
  const ltvQuery = trpc.salesAnalytics.getStudentLTV.useQuery();
  const churnQuery = trpc.salesAnalytics.getChurn.useQuery();
  const revenueQuery = trpc.salesAnalytics.getMonthlyRevenue.useQuery({ months: 12 });
  const productRevenueQuery = trpc.salesAnalytics.getRevenueByProduct.useQuery();
  const cohortRevenueQuery = trpc.salesAnalytics.getRevenueByCohort.useQuery();

  const handleExport = async (type: "enrollments" | "coaching" | "all") => {
    setExporting(true);
    try {
      const result = await trpc.useUtils().client.salesAnalytics.getExportData.query({
        type,
        dateFrom,
        dateTo,
      });
      const data = result as any[];
      if (!data || data.length === 0) { toast.info("No data to export for this period"); setExporting(false); return; }
      const headers = Object.keys(data[0]);
      const csv = [
        headers.join(","),
        ...data.map(row => headers.map(h => {
          const val = (row as any)[h];
          return `"${val != null ? String(val).replace(/"/g, '""') : ""}"`;
        }).join(","))
      ].join("\n");
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sales-${type}-${dateFrom}-to-${dateTo}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${data.length} rows as CSV`);
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  // ─── DATE RANGE SELECTOR ───
  const DateRangeBar = () => (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-muted/50 rounded-lg mb-6">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground">From</Label>
        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-8 w-36 text-xs" />
      </div>
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground">To</Label>
        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-8 w-36 text-xs" />
      </div>
      <div className="flex gap-1 ml-auto">
        {[
          { label: "7D", days: 7 },
          { label: "30D", days: 30 },
          { label: "90D", days: 90 },
          { label: "6M", days: 180 },
          { label: "1Y", days: 365 },
        ].map((preset) => (
          <Button key={preset.label} variant="outline" size="sm" className="h-7 text-xs px-2"
            onClick={() => {
              const to = new Date();
              const from = new Date(); from.setDate(from.getDate() - preset.days);
              setDateFrom(from.toISOString().slice(0, 10));
              setDateTo(to.toISOString().slice(0, 10));
            }}>
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  );

  // ─── FUNNEL TAB ───
  const renderFunnel = () => {
    const stages = funnelQuery.data?.stages || [];
    const maxCount = Math.max(...stages.map(s => s.count), 1);

    const funnelEvents = [
      { name: "Page Visit", description: "Visitors who landed on a course or coaching page", color: "oklch(0.65 0.15 220)" },
      { name: "Opt-In / Sign Up", description: "Users who created an account or opted in", color: "oklch(0.65 0.15 250)" },
      { name: "Checkout Started", description: "Users who initiated a checkout session", color: "oklch(0.65 0.15 280)" },
      { name: "Purchase Completed", description: "Users who completed payment", color: "oklch(0.65 0.15 310)" },
      { name: "Active Learner", description: "Users who started their first lesson", color: "oklch(0.65 0.15 340)" },
    ];

    return (
      <div className="space-y-6">
        <DateRangeBar />
        <Card>
          <CardHeader>
            <CardTitle>Event-Driven Conversion Funnel</CardTitle>
            <CardDescription>Track how visitors progress through your sales pipeline — from page visit to active learner.</CardDescription>
          </CardHeader>
          <CardContent>
            {funnelQuery.isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center"><Loader2 className="h-5 w-5 animate-spin" /> Loading...</div>
            ) : (
              <div className="space-y-4">
                {stages.length > 0 ? stages.map((stage, i) => {
                  const event = funnelEvents[i] || funnelEvents[0];
                  const dropoff = i > 0 && stages[i - 1].count > 0
                    ? Math.round((1 - stage.count / stages[i - 1].count) * 100)
                    : 0;
                  return (
                    <div key={stage.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: event.color }}>{i + 1}</div>
                          <div>
                            <span className="text-sm font-medium">{stage.name}</span>
                            <p className="text-xs text-muted-foreground">{event.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs font-mono">{stage.count.toLocaleString()}</Badge>
                          <span className="text-sm font-medium">{stage.rate}%</span>
                          {i > 0 && dropoff > 0 && (
                            <Badge variant="destructive" className="text-xs">-{dropoff}% drop</Badge>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-8 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700 flex items-center px-3"
                          style={{ width: `${Math.max(5, (stage.count / maxCount) * 100)}%`, backgroundColor: event.color }}>
                          <span className="text-xs font-medium text-white">{stage.count.toLocaleString()}</span>
                        </div>
                      </div>
                      {i < stages.length - 1 && (
                        <div className="flex justify-center py-1">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <ArrowRight className="h-4 w-4 rotate-90" />
                            {dropoff > 0 && <span className="text-xs">{dropoff}% lost at this step</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  funnelEvents.map((event, i) => (
                    <div key={event.name} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: event.color }}>{i + 1}</div>
                        <div><span className="text-sm font-medium">{event.name}</span><p className="text-xs text-muted-foreground">{event.description}</p></div>
                        <Badge variant="outline" className="ml-auto text-xs">0</Badge>
                      </div>
                      <div className="w-full bg-muted rounded-full h-8 overflow-hidden">
                        <div className="h-full rounded-full bg-muted-foreground/10" style={{ width: "5%" }} />
                      </div>
                      {i < funnelEvents.length - 1 && <div className="flex justify-center"><ArrowRight className="h-4 w-4 rotate-90 text-muted-foreground" /></div>}
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // ─── LTV TAB ───
  const renderLTV = () => {
    const ltv = ltvQuery.data;
    return (
      <div className="space-y-6">
        <DateRangeBar />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-5"><div className="flex items-center justify-between mb-3"><DollarSign className="h-5 w-5 text-emerald-600" /><TrendingUp className="h-4 w-4 text-muted-foreground" /></div><p className="text-2xl font-bold">${ltv?.averageLTV ?? 0}</p><p className="text-sm text-muted-foreground">Average LTV</p></CardContent></Card>
          <Card><CardContent className="p-5"><div className="flex items-center justify-between mb-3"><DollarSign className="h-5 w-5 text-blue-600" /><TrendingUp className="h-4 w-4 text-muted-foreground" /></div><p className="text-2xl font-bold">${ltv?.totalRevenue ?? 0}</p><p className="text-sm text-muted-foreground">Total Revenue</p></CardContent></Card>
          <Card><CardContent className="p-5"><div className="flex items-center justify-between mb-3"><Users className="h-5 w-5 text-violet-600" /><TrendingUp className="h-4 w-4 text-muted-foreground" /></div><p className="text-2xl font-bold">{ltv?.totalCustomers ?? 0}</p><p className="text-sm text-muted-foreground">Total Customers</p></CardContent></Card>
        </div>

        {/* Cohort Revenue */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Layers className="h-4 w-4" /> Revenue by Cohort</CardTitle><CardDescription>Understand revenue distribution across student cohorts.</CardDescription></CardHeader>
          <CardContent>
            {(cohortRevenueQuery.data as any[] || []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No cohort data yet.</p>
            ) : (
              <div className="space-y-3">
                {(cohortRevenueQuery.data as any[]).map((cohort: any) => (
                  <div key={cohort.cohort} className="flex items-center gap-4 p-3 border rounded-lg">
                    <Badge variant="outline" className="text-xs min-w-[100px] justify-center">{cohort.cohort}</Badge>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{cohort.enrollments} enrollments</span>
                        <span className="text-sm font-bold text-emerald-600">${Number(cohort.revenue || 0).toFixed(0)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, Number(cohort.revenue) / Math.max(1, ...(cohortRevenueQuery.data as any[]).map((c: any) => Number(c.revenue))) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card><CardHeader><CardTitle>LTV Methodology</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">LTV is calculated from total enrollment revenue + coaching plan purchases divided by unique customers. Cohort analysis groups students by enrollment date to identify trends in customer value over time.</p></CardContent></Card>
      </div>
    );
  };

  // ─── CHURN TAB ───
  const renderChurn = () => {
    const churn = churnQuery.data;
    return (
      <div className="space-y-6">
        <DateRangeBar />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-5"><div className="flex items-center justify-between mb-3"><Percent className="h-5 w-5 text-red-500" /><TrendingDown className="h-4 w-4 text-red-400" /></div><p className="text-2xl font-bold">{churn?.churnRate ?? 0}%</p><p className="text-sm text-muted-foreground">Churn Rate</p></CardContent></Card>
          <Card><CardContent className="p-5"><div className="flex items-center justify-between mb-3"><Users className="h-5 w-5 text-emerald-600" /><TrendingUp className="h-4 w-4 text-emerald-400" /></div><p className="text-2xl font-bold">{churn?.activeStudents ?? 0}</p><p className="text-sm text-muted-foreground">Active Students</p></CardContent></Card>
          <Card><CardContent className="p-5"><div className="flex items-center justify-between mb-3"><UserMinus className="h-5 w-5 text-amber-600" /><TrendingDown className="h-4 w-4 text-amber-400" /></div><p className="text-2xl font-bold">{churn?.inactiveStudents ?? 0}</p><p className="text-sm text-muted-foreground">Inactive Students</p></CardContent></Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Churn Analysis</CardTitle><CardDescription>Track student retention and identify at-risk learners.</CardDescription></CardHeader>
          <CardContent>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Churn rate is calculated as inactive enrollments divided by total enrollments. Lower is better.</p>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-xs">Excellent: &lt;10%</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-xs">Warning: 10-20%</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-xs">Critical: &gt;20%</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ─── REVENUE TAB ───
  const renderRevenue = () => {
    const months = revenueQuery.data as any[] || [];
    const maxRevenue = Math.max(...months.map(m => Number(m.revenue || 0)), 1);
    return (
      <div className="space-y-6">
        <DateRangeBar />
        <Card>
          <CardHeader><CardTitle>Monthly Revenue</CardTitle><CardDescription>Revenue trend over the last 12 months.</CardDescription></CardHeader>
          <CardContent>
            {revenueQuery.isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center"><Loader2 className="h-5 w-5 animate-spin" /> Loading...</div>
            ) : months.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No revenue data yet.</p>
            ) : (
              <div className="space-y-2">
                {months.map((m: any) => (
                  <div key={m.month} className="flex items-center gap-3 text-sm">
                    <span className="w-20 text-muted-foreground font-mono">{m.month}</span>
                    <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                      <div className="bg-emerald-500/70 h-full rounded-full flex items-center px-2" style={{ width: `${Math.max(5, (Number(m.revenue) / maxRevenue) * 100)}%` }}>
                        <span className="text-xs font-medium text-white">${Number(m.revenue || 0).toFixed(0)}</span>
                      </div>
                    </div>
                    <span className="w-16 text-right text-muted-foreground">{m.transactions} txn</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // ─── PRODUCTS TAB ───
  const renderProducts = () => {
    const products = productRevenueQuery.data as any[] || [];
    const maxRev = Math.max(...products.map(p => Number(p.revenue || 0)), 1);
    return (
      <div className="space-y-6">
        <DateRangeBar />
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-4 w-4" /> Revenue by Product</CardTitle><CardDescription>See which courses and programs generate the most revenue.</CardDescription></CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No product revenue data yet.</p>
            ) : (
              <div className="space-y-3">
                {products.map((p: any, i: number) => (
                  <div key={p.product || i} className="flex items-center gap-4 p-3 border rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground w-6">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.product || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{p.category || "Uncategorized"} · {p.sales} sales</p>
                    </div>
                    <div className="w-32">
                      <div className="bg-muted rounded-full h-3 overflow-hidden">
                        <div className="bg-primary/60 h-full rounded-full" style={{ width: `${(Number(p.revenue) / maxRev) * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-emerald-600 w-20 text-right">${Number(p.revenue || 0).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // ─── EXPORT TAB ───
  const renderExport = () => (
    <div className="space-y-6">
      <DateRangeBar />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" /> Rich Data Export</CardTitle>
          <CardDescription>Download sales and enrollment data as CSV with date, source, product, and cohort information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <h3 className="text-sm font-semibold">Export includes:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Student Name & Email</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-violet-500" /> Product / Course Title</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Amount Paid</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /> Enrollment Date</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /> Status</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-pink-500" /> Product Category</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-500" /> Cohort (New/Recent/Established)</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500" /> Plan Name (coaching)</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/30" onClick={() => handleExport("enrollments")}>
              <CardContent className="p-5 text-center">
                <Download className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                <h3 className="font-semibold mb-1">Course Enrollments</h3>
                <p className="text-xs text-muted-foreground mb-3">Student, course, category, status, amount, date, cohort</p>
                {exporting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : <Badge variant="outline" className="text-xs">CSV</Badge>}
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/30" onClick={() => handleExport("coaching")}>
              <CardContent className="p-5 text-center">
                <Download className="h-8 w-8 mx-auto mb-3 text-violet-600" />
                <h3 className="font-semibold mb-1">Coaching Purchases</h3>
                <p className="text-xs text-muted-foreground mb-3">Student, plan, status, amount, date, cohort</p>
                {exporting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : <Badge variant="outline" className="text-xs">CSV</Badge>}
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/30" onClick={() => handleExport("all")}>
              <CardContent className="p-5 text-center">
                <Download className="h-8 w-8 mx-auto mb-3 text-emerald-600" />
                <h3 className="font-semibold mb-1">All Transactions</h3>
                <p className="text-xs text-muted-foreground mb-3">Complete export with all fields and cohort tags</p>
                {exporting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : <Badge variant="outline" className="text-xs">CSV</Badge>}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const tabItems: { key: SalesTab; label: string; icon: any }[] = [
    { key: "funnel", label: "Conversion Funnel", icon: Target },
    { key: "ltv", label: "Student LTV", icon: DollarSign },
    { key: "churn", label: "Churn Analysis", icon: UserMinus },
    { key: "revenue", label: "Revenue", icon: BarChart3 },
    { key: "products", label: "By Product", icon: Package },
    { key: "export", label: "Export", icon: Download },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1"><BarChart3 className="h-6 w-6 text-emerald-600" /><h1 className="text-2xl font-bold">Advanced Sales Analytics</h1></div>
        <p className="text-sm text-muted-foreground">Event-driven conversion funnel, student LTV, churn analysis, revenue by product/cohort, and rich CSV exports.</p>
      </div>
      <div className="flex gap-1 mb-6 border-b overflow-x-auto">
        {tabItems.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <tab.icon className="h-4 w-4" /> {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "funnel" && renderFunnel()}
      {activeTab === "ltv" && renderLTV()}
      {activeTab === "churn" && renderChurn()}
      {activeTab === "revenue" && renderRevenue()}
      {activeTab === "products" && renderProducts()}
      {activeTab === "export" && renderExport()}
    </div>
  );
}
