import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Users,
  Calendar,
  DollarSign,
  RefreshCw,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  LineChart,
  PieChart,
} from "lucide-react";
import { toast } from "sonner";

interface RefundRequest {
  id: number;
  sessionId: number;
  learnerId: number;
  learnerName: string;
  coachName: string;
  amount: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: Date;
}

export default function AdminAnalytics() {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter" | "year">("month");
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);

  // Fetch analytics data
  const analyticsQuery = trpc.admin.getAnalytics.useQuery();
  const analytics = analyticsQuery.data || {
    totalUsers: 0,
    activeCoaches: 0,
    sessionsThisMonth: 0,
    revenue: 0,
    userGrowth: 0,
    sessionGrowth: 0,
    revenueGrowth: 0,
  };

  // Mock data for charts (in production, this would come from the API)
  const monthlyData = [
    { month: "Aug", users: 850, sessions: 180, revenue: 15200 },
    { month: "Sep", users: 920, sessions: 210, revenue: 18500 },
    { month: "Oct", users: 1050, sessions: 265, revenue: 22100 },
    { month: "Nov", users: 1150, sessions: 298, revenue: 25400 },
    { month: "Dec", users: 1200, sessions: 320, revenue: 27200 },
    { month: "Jan", users: analytics.totalUsers, sessions: analytics.sessionsThisMonth, revenue: analytics.revenue },
  ];

  // Mock refund requests
  const refundRequests: RefundRequest[] = [
    {
      id: 1,
      sessionId: 1234,
      learnerId: 45,
      learnerName: "Marie Dupont",
      coachName: "Jean-Pierre Martin",
      amount: 5500,
      reason: "Coach was 15 minutes late to the session",
      status: "pending",
      requestedAt: new Date("2026-01-08"),
    },
    {
      id: 2,
      sessionId: 1198,
      learnerId: 67,
      learnerName: "Robert Chen",
      coachName: "Sophie Tremblay",
      amount: 7500,
      reason: "Technical issues prevented the session from happening",
      status: "pending",
      requestedAt: new Date("2026-01-07"),
    },
  ];

  const handleApproveRefund = (refund: RefundRequest) => {
    toast.success(isEn ? "Refund approved" : "Remboursement approuvé");
    // In production: mutation to approve refund
  };

  const handleRejectRefund = (refund: RefundRequest) => {
    toast.success(isEn ? "Refund rejected" : "Remboursement rejeté");
    // In production: mutation to reject refund
  };

  const exportToCSV = () => {
    const headers = ["Month", "Users", "Sessions", "Revenue"];
    const rows = monthlyData.map(d => [d.month, d.users, d.sessions, d.revenue]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lingueefy-analytics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(isEn ? "Data exported" : "Données exportées");
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat(isEn ? "en-CA" : "fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(cents / 100);
  };

  const GrowthIndicator = ({ value }: { value: number }) => (
    <div className={`flex items-center gap-1 text-sm ${value >= 0 ? "text-emerald-600" : "text-red-600"}`}>
      {value >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
      <span>{value >= 0 ? "+" : ""}{value.toFixed(1)}%</span>
    </div>
  );

  // Simple bar chart component
  const SimpleBarChart = ({ data, dataKey, color }: { data: typeof monthlyData; dataKey: keyof typeof monthlyData[0]; color: string }) => {
    const maxValue = Math.max(...data.map(d => d[dataKey] as number));
    return (
      <div className="flex items-end gap-2 h-32">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div 
              className={`w-full rounded-t ${color}`}
              style={{ height: `${((item[dataKey] as number) / maxValue) * 100}%`, minHeight: "4px" }}
            />
            <span className="text-xs text-muted-foreground">{item.month}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {isEn ? "Platform Analytics" : "Analytiques de la plateforme"}
          </h2>
          <p className="text-muted-foreground">
            {isEn ? "Detailed metrics and performance data" : "Métriques détaillées et données de performance"}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">{isEn ? "This Week" : "Cette semaine"}</SelectItem>
              <SelectItem value="month">{isEn ? "This Month" : "Ce mois"}</SelectItem>
              <SelectItem value="quarter">{isEn ? "This Quarter" : "Ce trimestre"}</SelectItem>
              <SelectItem value="year">{isEn ? "This Year" : "Cette année"}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => analyticsQuery.refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            {isEn ? "Export" : "Exporter"}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isEn ? "Total Users" : "Utilisateurs totaux"}
                </p>
                <p className="text-3xl font-bold">{analytics.totalUsers.toLocaleString()}</p>
                <GrowthIndicator value={analytics.userGrowth} />
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isEn ? "Active Coaches" : "Coachs actifs"}
                </p>
                <p className="text-3xl font-bold">{analytics.activeCoaches}</p>
                <p className="text-sm text-muted-foreground">
                  {isEn ? "Approved & active" : "Approuvés et actifs"}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isEn ? "Sessions This Month" : "Sessions ce mois"}
                </p>
                <p className="text-3xl font-bold">{analytics.sessionsThisMonth}</p>
                <GrowthIndicator value={analytics.sessionGrowth} />
              </div>
              <div className="h-12 w-12 rounded-full bg-[#E7F2F2] flex items-center justify-center">
                <Calendar className="h-6 w-6 text-[#0F3D3E]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isEn ? "Revenue (MTD)" : "Revenus (MTD)"}
                </p>
                <p className="text-3xl font-bold">{formatCurrency(analytics.revenue)}</p>
                <GrowthIndicator value={analytics.revenueGrowth} />
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              {isEn ? "User Growth" : "Croissance des utilisateurs"}
            </CardTitle>
            <CardDescription>
              {isEn ? "Monthly user registration trend" : "Tendance mensuelle des inscriptions"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={monthlyData} dataKey="users" color="bg-blue-500" />
          </CardContent>
        </Card>

        {/* Session Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {isEn ? "Session Volume" : "Volume des sessions"}
            </CardTitle>
            <CardDescription>
              {isEn ? "Monthly completed sessions" : "Sessions complétées par mois"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={monthlyData} dataKey="sessions" color="bg-[#E7F2F2]" />
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {isEn ? "Revenue Trend" : "Tendance des revenus"}
            </CardTitle>
            <CardDescription>
              {isEn ? "Monthly revenue in CAD" : "Revenus mensuels en CAD"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={monthlyData} dataKey="revenue" color="bg-emerald-500" />
          </CardContent>
        </Card>

        {/* Coach Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              {isEn ? "Coach Performance" : "Performance des coachs"}
            </CardTitle>
            <CardDescription>
              {isEn ? "Top coaches by sessions" : "Meilleurs coachs par sessions"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Sophie Tremblay", sessions: 45, rating: 4.9 },
                { name: "Jean-Pierre Martin", sessions: 38, rating: 4.8 },
                { name: "Marie-Claire Dubois", sessions: 32, rating: 4.7 },
                { name: "François Leblanc", sessions: 28, rating: 4.9 },
              ].map((coach, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{coach.name}</p>
                      <p className="text-xs text-muted-foreground">⭐ {coach.rating}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{coach.sessions} sessions</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Refund Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {isEn ? "Refund Requests" : "Demandes de remboursement"}
          </CardTitle>
          <CardDescription>
            {isEn ? "Pending refund requests requiring review" : "Demandes de remboursement en attente"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {refundRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{isEn ? "No pending refund requests" : "Aucune demande de remboursement en attente"}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isEn ? "Learner" : "Apprenant"}</TableHead>
                  <TableHead>{isEn ? "Coach" : "Coach"}</TableHead>
                  <TableHead>{isEn ? "Amount" : "Montant"}</TableHead>
                  <TableHead>{isEn ? "Reason" : "Raison"}</TableHead>
                  <TableHead>{isEn ? "Requested" : "Demandé"}</TableHead>
                  <TableHead>{isEn ? "Status" : "Statut"}</TableHead>
                  <TableHead>{isEn ? "Actions" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refundRequests.map((refund) => (
                  <TableRow key={refund.id}>
                    <TableCell className="font-medium">{refund.learnerName}</TableCell>
                    <TableCell>{refund.coachName}</TableCell>
                    <TableCell>{formatCurrency(refund.amount)}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={refund.reason}>
                      {refund.reason}
                    </TableCell>
                    <TableCell>{new Date(refund.requestedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={
                        refund.status === "approved" ? "default" :
                        refund.status === "rejected" ? "destructive" : "secondary"
                      }>
                        <Clock className="h-3 w-3 mr-1" />
                        {refund.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {refund.status === "pending" && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-emerald-600"
                            onClick={() => handleApproveRefund(refund)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-destructive"
                            onClick={() => handleRejectRefund(refund)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Learner Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>{isEn ? "Learner Engagement" : "Engagement des apprenants"}</CardTitle>
          <CardDescription>
            {isEn ? "Key engagement metrics" : "Métriques clés d'engagement"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold text-primary">78%</p>
              <p className="text-sm text-muted-foreground">
                {isEn ? "Retention Rate" : "Taux de rétention"}
              </p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold text-primary">3.2</p>
              <p className="text-sm text-muted-foreground">
                {isEn ? "Avg Sessions/User" : "Sessions moy./utilisateur"}
              </p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold text-primary">4.7</p>
              <p className="text-sm text-muted-foreground">
                {isEn ? "Avg Rating" : "Note moyenne"}
              </p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold text-primary">92%</p>
              <p className="text-sm text-muted-foreground">
                {isEn ? "Completion Rate" : "Taux de complétion"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
