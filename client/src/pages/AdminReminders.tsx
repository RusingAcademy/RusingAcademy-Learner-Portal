import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bell,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  Users,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  Eye,
  MousePointer,
} from "lucide-react";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { motion } from "framer-motion";

// Mock data for demonstration
const mockReminders = [
  {
    id: 1,
    sessionId: 101,
    learnerName: "Marie Dupont",
    coachName: "Jean Martin",
    type: "24h" as const,
    channel: "email" as const,
    status: "sent" as const,
    sentAt: new Date("2026-01-29T10:00:00"),
    sessionDate: new Date("2026-01-30T10:00:00"),
    opened: true,
    clicked: true,
  },
  {
    id: 2,
    sessionId: 102,
    learnerName: "Pierre Bernard",
    coachName: "Sophie Lefebvre",
    type: "1h" as const,
    channel: "in_app" as const,
    status: "sent" as const,
    sentAt: new Date("2026-01-30T09:00:00"),
    sessionDate: new Date("2026-01-30T10:00:00"),
    opened: true,
    clicked: false,
  },
  {
    id: 3,
    sessionId: 103,
    learnerName: "Claire Moreau",
    coachName: "Jean Martin",
    type: "24h" as const,
    channel: "email" as const,
    status: "failed" as const,
    sentAt: new Date("2026-01-29T14:00:00"),
    sessionDate: new Date("2026-01-30T14:00:00"),
    opened: false,
    clicked: false,
    error: "Invalid email address",
  },
  {
    id: 4,
    sessionId: 104,
    learnerName: "Lucas Petit",
    coachName: "Marie Claire",
    type: "24h" as const,
    channel: "email" as const,
    status: "sent" as const,
    sentAt: new Date("2026-01-28T16:00:00"),
    sessionDate: new Date("2026-01-29T16:00:00"),
    opened: true,
    clicked: true,
  },
  {
    id: 5,
    sessionId: 105,
    learnerName: "Emma Dubois",
    coachName: "Sophie Lefebvre",
    type: "1h" as const,
    channel: "in_app" as const,
    status: "pending" as const,
    sentAt: null,
    sessionDate: new Date("2026-01-30T15:00:00"),
    opened: false,
    clicked: false,
  },
];

const labels = {
  en: {
    title: "Session Reminders",
    subtitle: "Monitor automated reminders and engagement metrics",
    stats: {
      totalSent: "Total Sent",
      openRate: "Open Rate",
      clickRate: "Click Rate",
      failedReminders: "Failed",
    },
    filters: {
      type: "Type",
      channel: "Channel",
      status: "Status",
      all: "All",
      type24h: "24h Before",
      type1h: "1h Before",
      email: "Email",
      inApp: "In-App",
      sent: "Sent",
      pending: "Pending",
      failed: "Failed",
    },
    table: {
      learner: "Learner",
      coach: "Coach",
      session: "Session",
      type: "Type",
      channel: "Channel",
      status: "Status",
      sentAt: "Sent",
      engagement: "Engagement",
    },
    actions: {
      refresh: "Refresh",
      export: "Export",
    },
    engagement: {
      opened: "Opened",
      clicked: "Clicked",
      notOpened: "Not Opened",
    },
    empty: "No reminders found matching your filters",
  },
  fr: {
    title: "Rappels de Sessions",
    subtitle: "Surveillez les rappels automatisés et les métriques d'engagement",
    stats: {
      totalSent: "Total Envoyés",
      openRate: "Taux d'Ouverture",
      clickRate: "Taux de Clic",
      failedReminders: "Échoués",
    },
    filters: {
      type: "Type",
      channel: "Canal",
      status: "Statut",
      all: "Tous",
      type24h: "24h Avant",
      type1h: "1h Avant",
      email: "Email",
      inApp: "In-App",
      sent: "Envoyé",
      pending: "En Attente",
      failed: "Échoué",
    },
    table: {
      learner: "Apprenant",
      coach: "Coach",
      session: "Session",
      type: "Type",
      channel: "Canal",
      status: "Statut",
      sentAt: "Envoyé",
      engagement: "Engagement",
    },
    actions: {
      refresh: "Actualiser",
      export: "Exporter",
    },
    engagement: {
      opened: "Ouvert",
      clicked: "Cliqué",
      notOpened: "Non Ouvert",
    },
    empty: "Aucun rappel trouvé correspondant à vos filtres",
  },
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function AdminReminders() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const { language } = useLanguage();

  // Auth Guard
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-foundation)]"></div>
      </div>
    );
  }
  if (!user) return null;
  const isEn = language === "en";
  const t = isEn ? labels.en : labels.fr;
  const dateLocale = isEn ? enUS : fr;

  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter reminders
  const filteredReminders = mockReminders.filter((reminder) => {
    if (typeFilter !== "all" && reminder.type !== typeFilter) return false;
    if (channelFilter !== "all" && reminder.channel !== channelFilter) return false;
    if (statusFilter !== "all" && reminder.status !== statusFilter) return false;
    return true;
  });

  // Calculate stats
  const totalSent = mockReminders.filter((r) => r.status === "sent").length;
  const totalOpened = mockReminders.filter((r) => r.opened).length;
  const totalClicked = mockReminders.filter((r) => r.clicked).length;
  const totalFailed = mockReminders.filter((r) => r.status === "failed").length;
  const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
  const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleExport = () => {
    const headers = ["Learner", "Coach", "Type", "Channel", "Status", "Sent At", "Session Date"];
    const rows = filteredReminders.map((r) => [
      r.learnerName,
      r.coachName,
      r.type,
      r.channel,
      r.status,
      r.sentAt ? format(r.sentAt, "yyyy-MM-dd HH:mm") : "-",
      format(r.sessionDate, "yyyy-MM-dd HH:mm"),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reminders-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {t.filters.sent}
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20 transition-colors">
            <Clock className="h-3 w-3 mr-1" />
            {t.filters.pending}
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20 transition-colors">
            <XCircle className="h-3 w-3 mr-1" />
            {t.filters.failed}
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Subtle decorative background - accessibility compliant */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-slate-200/30 dark:bg-slate-800/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 w-80 h-80 bg-slate-200/20 dark:bg-slate-800/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 xl:px-12 py-8 max-w-[1600px] mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <Bell className="h-7 w-7 text-slate-700 dark:text-slate-300" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
                    {t.title}
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">{t.subtitle}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={handleRefresh} 
                disabled={isRefreshing}
                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                {t.actions.refresh}
              </Button>
              <Button 
                onClick={handleExport}
                className="bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 transition-all duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                {t.actions.export}
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards - Glassmorphism Style */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Total Sent */}
            <Card className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.stats.totalSent}</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalSent}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <ArrowUpRight className="h-3 w-3" />
                      <span>+12% vs last week</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                    <Mail className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Open Rate */}
            <Card className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.stats.openRate}</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{openRate}%</p>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-slate-600 dark:bg-slate-400 rounded-full transition-all duration-500"
                        style={{ width: `${openRate}%` }}
                      />
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                    <Eye className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Click Rate */}
            <Card className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.stats.clickRate}</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{clickRate}%</p>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-slate-600 dark:bg-slate-400 rounded-full transition-all duration-500"
                        style={{ width: `${clickRate}%` }}
                      />
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                    <MousePointer className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Failed */}
            <Card className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.stats.failedReminders}</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalFailed}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{isEn ? "Needs attention" : "Nécessite attention"}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                    <XCircle className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Filters */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                  <Filter className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  {isEn ? "Filters" : "Filtres"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.filters.type}</label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-primary/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.filters.all}</SelectItem>
                        <SelectItem value="24h">{t.filters.type24h}</SelectItem>
                        <SelectItem value="1h">{t.filters.type1h}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.filters.channel}</label>
                    <Select value={channelFilter} onValueChange={setChannelFilter}>
                      <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-primary/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.filters.all}</SelectItem>
                        <SelectItem value="email">{t.filters.email}</SelectItem>
                        <SelectItem value="in_app">{t.filters.inApp}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.filters.status}</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-primary/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.filters.all}</SelectItem>
                        <SelectItem value="sent">{t.filters.sent}</SelectItem>
                        <SelectItem value="pending">{t.filters.pending}</SelectItem>
                        <SelectItem value="failed">{t.filters.failed}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Reminders Table */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-white/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 dark:bg-slate-900/80 hover:bg-slate-50/80 dark:hover:bg-slate-900/80">
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">{t.table.learner}</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">{t.table.coach}</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">{t.table.session}</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">{t.table.type}</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">{t.table.channel}</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">{t.table.status}</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">{t.table.sentAt}</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">{t.table.engagement}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReminders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32 text-center">
                          <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400">
                            <Sparkles className="h-8 w-8 opacity-50" />
                            <p>{t.empty}</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReminders.map((reminder, index) => (
                        <motion.tr
                          key={reminder.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <TableCell className="font-medium text-slate-900 dark:text-white">
                            {reminder.learnerName}
                          </TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-300">
                            {reminder.coachName}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                              <Calendar className="h-4 w-4 text-slate-400" />
                              <span className="text-sm">
                                {format(reminder.sessionDate, "PP", { locale: dateLocale })}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                              <Clock className="h-3 w-3 mr-1" />
                              {reminder.type === "24h" ? t.filters.type24h : t.filters.type1h}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800">
                              {reminder.channel === "email" ? (
                                <>
                                  <Mail className="h-3 w-3 mr-1" />
                                  {t.filters.email}
                                </>
                              ) : (
                                <>
                                  <Bell className="h-3 w-3 mr-1" />
                                  {t.filters.inApp}
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(reminder.status)}</TableCell>
                          <TableCell className="text-sm text-slate-600 dark:text-slate-300">
                            {reminder.sentAt
                              ? format(reminder.sentAt, "Pp", { locale: dateLocale })
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {reminder.status === "sent" && (
                              <div className="flex items-center gap-2">
                                {reminder.opened ? (
                                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
                                    <Eye className="h-3 w-3 mr-1" />
                                    {t.engagement.opened}
                                  </Badge>
                                ) : (
                                  <Badge className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 text-xs">
                                    {t.engagement.notOpened}
                                  </Badge>
                                )}
                                {reminder.clicked && (
                                  <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-xs">
                                    <MousePointer className="h-3 w-3 mr-1" />
                                    {t.engagement.clicked}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
