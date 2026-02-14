import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  CreditCard,
  Wallet,
  BarChart3,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

interface Transaction {
  id: number;
  date: Date;
  type: "session_payment" | "platform_fee" | "coach_payout" | "refund" | "refund_reversal";
  description: string;
  learnerName: string;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  commissionRate: number;
  status: "pending" | "processing" | "completed" | "failed" | "reversed";
  stripePaymentId?: string;
}

export default function CoachEarningsHistory() {
  const { language } = useLanguage();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // tRPC queries
  const earningsQuery = trpc.coach.getEarningsSummary.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const ledgerQuery = trpc.coach.getPayoutLedger.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const labels = {
    en: {
      title: "Earnings History",
      subtitle: "View your complete transaction history and payouts",
      overview: "Overview",
      totalEarnings: "Total Earnings",
      pendingPayouts: "Pending Payouts",
      completedPayouts: "Completed Payouts",
      thisMonth: "This Month",
      transactions: "Transactions",
      date: "Date",
      type: "Type",
      description: "Description",
      learner: "Learner",
      gross: "Gross",
      fee: "Platform Fee",
      net: "Net Amount",
      status: "Status",
      sessionPayment: "Session Payment",
      platformFee: "Platform Fee",
      coachPayout: "Payout",
      refund: "Refund",
      pending: "Pending",
      processing: "Processing",
      completed: "Completed",
      failed: "Failed",
      reversed: "Reversed",
      filterByDate: "Filter by date",
      filterByType: "Filter by type",
      allTime: "All Time",
      thisWeek: "This Week",
      lastMonth: "Last Month",
      last3Months: "Last 3 Months",
      allTypes: "All Types",
      payments: "Payments",
      payouts: "Payouts",
      refunds: "Refunds",
      exportCSV: "Export CSV",
      noTransactions: "No transactions found",
      noTransactionsDesc: "Your earnings will appear here once you complete sessions",
      signInRequired: "Sign in to view your earnings",
      signIn: "Sign In",
      viewDashboard: "Back to Dashboard",
      commissionRate: "Commission Rate",
      stripeId: "Stripe ID",
    },
    fr: {
      title: "Historique des revenus",
      subtitle: "Consultez l'historique complet de vos transactions et paiements",
      overview: "Aperçu",
      totalEarnings: "Revenus totaux",
      pendingPayouts: "Paiements en attente",
      completedPayouts: "Paiements effectués",
      thisMonth: "Ce mois-ci",
      transactions: "Transactions",
      date: "Date",
      type: "Type",
      description: "Description",
      learner: "Apprenant",
      gross: "Brut",
      fee: "Frais de plateforme",
      net: "Montant net",
      status: "Statut",
      sessionPayment: "Paiement de session",
      platformFee: "Frais de plateforme",
      coachPayout: "Versement",
      refund: "Remboursement",
      pending: "En attente",
      processing: "En traitement",
      completed: "Terminé",
      failed: "Échoué",
      reversed: "Annulé",
      filterByDate: "Filtrer par date",
      filterByType: "Filtrer par type",
      allTime: "Tout le temps",
      thisWeek: "Cette semaine",
      lastMonth: "Le mois dernier",
      last3Months: "3 derniers mois",
      allTypes: "Tous les types",
      payments: "Paiements",
      payouts: "Versements",
      refunds: "Remboursements",
      exportCSV: "Exporter CSV",
      noTransactions: "Aucune transaction trouvée",
      noTransactionsDesc: "Vos revenus apparaîtront ici une fois que vous aurez terminé des sessions",
      signInRequired: "Connectez-vous pour voir vos revenus",
      signIn: "Se connecter",
      viewDashboard: "Retour au tableau de bord",
      commissionRate: "Taux de commission",
      stripeId: "ID Stripe",
    },
  };

  const l = labels[language];

  // Use real data from queries, mapping to expected field names
  const rawEarnings = earningsQuery.data as {
    totalGross?: number;
    totalFees?: number;
    totalNet?: number;
    pendingPayout?: number;
    sessionCount?: number;
    totalEarnings?: number;
    pendingPayouts?: number;
    completedPayouts?: number;
    thisMonthEarnings?: number;
    sessionsCompleted?: number;
    averageSessionValue?: number;
  } | undefined;
  const earnings = {
    totalEarnings: rawEarnings?.totalNet || rawEarnings?.totalEarnings || 0,
    pendingPayouts: rawEarnings?.pendingPayout || rawEarnings?.pendingPayouts || 0,
    completedPayouts: (rawEarnings?.totalNet || 0) - (rawEarnings?.pendingPayout || 0),
    thisMonthEarnings: rawEarnings?.totalNet || rawEarnings?.thisMonthEarnings || 0,
    sessionsCompleted: rawEarnings?.sessionCount || rawEarnings?.sessionsCompleted || 0,
    averageSessionValue: rawEarnings?.sessionCount ? Math.round((rawEarnings?.totalNet || 0) / rawEarnings.sessionCount) : 0,
  };

  // @ts-expect-error - TS2345: auto-suppressed during TS cleanup
  const transactions: Transaction[] = (ledgerQuery.data || []).map((t: {
    id: number;
    createdAt: Date;
    transactionType: string;
    learnerName?: string | null;
    grossAmount: number;
    platformFee: number;
    netAmount: number;
    commissionBps: number;
    status: string | null;
    stripePaymentIntentId?: string | null;
  }) => ({
    id: t.id,
    date: new Date(t.createdAt),
    type: t.transactionType as Transaction["type"],
    description: t.transactionType === "session_payment" ? "Coaching Session" : t.transactionType,
    learnerName: t.learnerName || "Unknown",
    grossAmount: t.grossAmount,
    platformFee: t.platformFee,
    netAmount: t.netAmount,
    commissionRate: t.commissionBps / 100,
    status: (t.status || "pending") as Transaction["status"],
    stripePaymentId: t.stripePaymentIntentId || undefined,
  }));

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const transactionDate = new Date(t.date);
      if (dateFilter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (transactionDate < weekAgo) return false;
      } else if (dateFilter === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (transactionDate < monthAgo) return false;
      } else if (dateFilter === "3months") {
        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        if (transactionDate < threeMonthsAgo) return false;
      }
    }
    
    // Type filter
    if (typeFilter !== "all") {
      if (typeFilter === "payments" && t.type !== "session_payment") return false;
      if (typeFilter === "payouts" && t.type !== "coach_payout") return false;
      if (typeFilter === "refunds" && !t.type.includes("refund")) return false;
    }
    
    return true;
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "session_payment": return l.sessionPayment;
      case "platform_fee": return l.platformFee;
      case "coach_payout": return l.coachPayout;
      case "refund": return l.refund;
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />{l.pending}</Badge>;
      case "processing":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />{l.processing}</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />{l.completed}</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />{l.failed}</Badge>;
      case "reversed":
        return <Badge variant="secondary">{l.reversed}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const exportToCSV = () => {
    const headers = ["Date", "Type", "Description", "Learner", "Gross", "Platform Fee", "Net", "Status"];
    const rows = filteredTransactions.map(t => [
      new Date(t.date).toISOString().split("T")[0],
      t.type,
      t.description,
      t.learnerName,
      (t.grossAmount / 100).toFixed(2),
      (t.platformFee / 100).toFixed(2),
      (t.netAmount / 100).toFixed(2),
      t.status,
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `earnings-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Show sign in prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardHeader className="text-center">
              <Wallet className="w-12 h-12 mx-auto text-slate-900 dark:text-slate-100 mb-4" />
              <CardTitle>{l.signInRequired}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <a href={getLoginUrl()}>{l.signIn}</a>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">{l.title}</h1>
            <p className="text-slate-900 dark:text-slate-100">{l.subtitle}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/coach/dashboard">{l.viewDashboard}</Link>
            </Button>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              {l.exportCSV}
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{l.totalEarnings}</CardTitle>
              <DollarSign className="h-4 w-4 text-slate-900 dark:text-slate-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(earnings.totalEarnings)}</div>
              <p className="text-xs text-slate-900 dark:text-slate-100 flex items-center">
                <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
                {earnings.sessionsCompleted} sessions completed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{l.thisMonth}</CardTitle>
              <Calendar className="h-4 w-4 text-slate-900 dark:text-slate-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(earnings.thisMonthEarnings)}</div>
              <p className="text-xs text-slate-900 dark:text-slate-100">
                Avg: {formatCurrency(earnings.averageSessionValue)}/session
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{l.pendingPayouts}</CardTitle>
              <Clock className="h-4 w-4 text-slate-900 dark:text-slate-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{formatCurrency(earnings.pendingPayouts)}</div>
              <p className="text-xs text-slate-900 dark:text-slate-100">
                Processing in 2-3 business days
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{l.completedPayouts}</CardTitle>
              <CheckCircle className="h-4 w-4 text-slate-900 dark:text-slate-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(earnings.completedPayouts)}</div>
              <p className="text-xs text-slate-900 dark:text-slate-100">
                Transferred to your bank
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>{l.transactions}</CardTitle>
                <CardDescription>
                  {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder={l.filterByDate} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{l.allTime}</SelectItem>
                    <SelectItem value="week">{l.thisWeek}</SelectItem>
                    <SelectItem value="month">{l.lastMonth}</SelectItem>
                    <SelectItem value="3months">{l.last3Months}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder={l.filterByType} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{l.allTypes}</SelectItem>
                    <SelectItem value="payments">{l.payments}</SelectItem>
                    <SelectItem value="payouts">{l.payouts}</SelectItem>
                    <SelectItem value="refunds">{l.refunds}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 mx-auto text-slate-900 dark:text-slate-100 mb-4" />
                <h3 className="text-lg font-medium mb-2">{l.noTransactions}</h3>
                <p className="text-slate-900 dark:text-slate-100">{l.noTransactionsDesc}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{l.date}</TableHead>
                      <TableHead>{l.type}</TableHead>
                      <TableHead>{l.learner}</TableHead>
                      <TableHead className="text-right">{l.gross}</TableHead>
                      <TableHead className="text-right">{l.fee}</TableHead>
                      <TableHead className="text-right">{l.net}</TableHead>
                      <TableHead>{l.status}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          {new Date(transaction.date).toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {transaction.type === "session_payment" && <CreditCard className="w-4 h-4 text-green-500" />}
                            {transaction.type === "coach_payout" && <Wallet className="w-4 h-4 text-blue-500" />}
                            {transaction.type.includes("refund") && <ArrowDownRight className="w-4 h-4 text-red-500" />}
                            {getTypeLabel(transaction.type)}
                          </div>
                        </TableCell>
                        <TableCell>{transaction.learnerName}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(transaction.grossAmount)}
                        </TableCell>
                        <TableCell className="text-right text-slate-900 dark:text-slate-100">
                          -{formatCurrency(transaction.platformFee)}
                          <span className="text-xs ml-1">({transaction.commissionRate}%)</span>
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatCurrency(transaction.netAmount)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(transaction.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}
