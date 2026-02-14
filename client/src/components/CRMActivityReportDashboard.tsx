import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Mail,
  Calendar,
  ArrowRight,
  Download,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface ReportData {
  newLeads: number;
  convertedLeads: number;
  lostLeads: number;
  totalDealValue: number;
  avgDealSize: number;
  emailsSent: number;
  emailsOpened: number;
  emailsClicked: number;
  meetingsScheduled: number;
  meetingsCompleted: number;
  pipelineMovements: { from: string; to: string; count: number }[];
}

interface Report {
  id: number;
  reportType: "weekly" | "monthly" | "quarterly";
  periodStart: Date;
  periodEnd: Date;
  data: ReportData;
  generatedAt: Date;
}

export default function CRMActivityReportDashboard() {
  const { language } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState<"weekly" | "monthly">("weekly");
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data for demonstration - in production this would come from the API
  const mockReport: Report = {
    id: 1,
    reportType: "weekly",
    periodStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    periodEnd: new Date(),
    data: {
      newLeads: 24,
      convertedLeads: 8,
      lostLeads: 3,
      totalDealValue: 45000,
      avgDealSize: 5625,
      emailsSent: 156,
      emailsOpened: 89,
      emailsClicked: 34,
      meetingsScheduled: 15,
      meetingsCompleted: 12,
      pipelineMovements: [
        { from: "new", to: "contacted", count: 18 },
        { from: "contacted", to: "qualified", count: 12 },
        { from: "qualified", to: "proposal", count: 6 },
        { from: "proposal", to: "won", count: 8 },
        { from: "proposal", to: "lost", count: 3 },
      ],
    },
    generatedAt: new Date(),
  };

  const labels = {
    en: {
      title: "CRM Activity Report",
      subtitle: "Weekly and monthly performance metrics",
      period: "Report Period",
      weekly: "Weekly",
      monthly: "Monthly",
      generateReport: "Generate Report",
      downloadReport: "Download PDF",
      lastGenerated: "Last generated",
      leadSummary: "Lead Summary",
      newLeads: "New Leads",
      converted: "Converted",
      lost: "Lost",
      conversionRate: "Conversion Rate",
      revenue: "Revenue",
      totalDealValue: "Total Deal Value",
      avgDealSize: "Avg Deal Size",
      emailEngagement: "Email Engagement",
      emailsSent: "Emails Sent",
      openRate: "Open Rate",
      clickRate: "Click Rate",
      meetings: "Meetings",
      scheduled: "Scheduled",
      completed: "Completed",
      completionRate: "Completion Rate",
      pipelineMovement: "Pipeline Movement",
    },
    fr: {
      title: "Rapport d'activité CRM",
      subtitle: "Métriques de performance hebdomadaires et mensuelles",
      period: "Période du rapport",
      weekly: "Hebdomadaire",
      monthly: "Mensuel",
      generateReport: "Générer le rapport",
      downloadReport: "Télécharger PDF",
      lastGenerated: "Dernière génération",
      leadSummary: "Résumé des leads",
      newLeads: "Nouveaux leads",
      converted: "Convertis",
      lost: "Perdus",
      conversionRate: "Taux de conversion",
      revenue: "Revenus",
      totalDealValue: "Valeur totale",
      avgDealSize: "Valeur moyenne",
      emailEngagement: "Engagement email",
      emailsSent: "Emails envoyés",
      openRate: "Taux d'ouverture",
      clickRate: "Taux de clic",
      meetings: "Réunions",
      scheduled: "Planifiées",
      completed: "Complétées",
      completionRate: "Taux de complétion",
      pipelineMovement: "Mouvement du pipeline",
    },
  };

  const l = labels[language];

  const report = mockReport;
  const data = report.data;

  const conversionRate = data.newLeads > 0 
    ? ((data.convertedLeads / data.newLeads) * 100).toFixed(1) 
    : "0";
  const openRate = data.emailsSent > 0 
    ? ((data.emailsOpened / data.emailsSent) * 100).toFixed(1) 
    : "0";
  const clickRate = data.emailsOpened > 0 
    ? ((data.emailsClicked / data.emailsOpened) * 100).toFixed(1) 
    : "0";
  const meetingCompletionRate = data.meetingsScheduled > 0 
    ? ((data.meetingsCompleted / data.meetingsScheduled) * 100).toFixed(1) 
    : "0";

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    toast.success(language === "fr" ? "Rapport généré" : "Report generated");
  };

  const stageLabels: Record<string, string> = {
    new: language === "fr" ? "Nouveau" : "New",
    contacted: language === "fr" ? "Contacté" : "Contacted",
    qualified: language === "fr" ? "Qualifié" : "Qualified",
    proposal: language === "fr" ? "Proposition" : "Proposal",
    won: language === "fr" ? "Gagné" : "Won",
    lost: language === "fr" ? "Perdu" : "Lost",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{l.title}</h2>
          <p className="text-muted-foreground">{l.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as "weekly" | "monthly")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">{l.weekly}</SelectItem>
              <SelectItem value="monthly">{l.monthly}</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateReport} disabled={isGenerating}>
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <BarChart3 className="h-4 w-4 mr-2" />
            )}
            {l.generateReport}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Lead Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              {l.leadSummary}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">{l.newLeads}</span>
                <span className="font-semibold">{data.newLeads}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">{l.converted}</span>
                <span className="font-semibold text-green-600">{data.convertedLeads}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">{l.lost}</span>
                <span className="font-semibold text-red-600">{data.lostLeads}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">{l.conversionRate}</span>
                  <Badge variant={parseFloat(conversionRate) >= 30 ? "default" : "secondary"}>
                    {conversionRate}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              {l.revenue}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">{l.totalDealValue}</span>
                <span className="font-semibold">${data.totalDealValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">{l.avgDealSize}</span>
                <span className="font-semibold">${data.avgDealSize.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">+12% vs last period</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Engagement */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#0F3D3E]" />
              {l.emailEngagement}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">{l.emailsSent}</span>
                <span className="font-semibold">{data.emailsSent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">{l.openRate}</span>
                <Badge variant={parseFloat(openRate) >= 25 ? "default" : "secondary"}>
                  {openRate}%
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">{l.clickRate}</span>
                <Badge variant={parseFloat(clickRate) >= 5 ? "default" : "secondary"}>
                  {clickRate}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meetings */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-500" />
              {l.meetings}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">{l.scheduled}</span>
                <span className="font-semibold">{data.meetingsScheduled}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">{l.completed}</span>
                <span className="font-semibold">{data.meetingsCompleted}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">{l.completionRate}</span>
                  <Badge variant={parseFloat(meetingCompletionRate) >= 80 ? "default" : "secondary"}>
                    {meetingCompletionRate}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Movement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            {l.pipelineMovement}
          </CardTitle>
          <CardDescription>
            {language === "fr" 
              ? "Mouvements des leads entre les étapes du pipeline"
              : "Lead movements between pipeline stages"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.pipelineMovements.map((movement, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{stageLabels[movement.from] || movement.from}</Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Badge 
                    variant={movement.to === "won" ? "default" : movement.to === "lost" ? "destructive" : "secondary"}
                  >
                    {stageLabels[movement.to] || movement.to}
                  </Badge>
                </div>
                <span className="font-semibold">{movement.count} leads</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Info */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>
          {l.lastGenerated}: {report.generatedAt.toLocaleString(language === "fr" ? "fr-CA" : "en-CA")}
        </span>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          {l.downloadReport}
        </Button>
      </div>
    </div>
  );
}
