/**
 * Progress Report Page
 * Allows learners to generate and download their progress report as PDF
 */
import { useState, useRef, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Printer, Loader2, Calendar, Globe } from "lucide-react";
import { toast } from "sonner";

export default function ProgressReport() {
  const { user } = useAuth();
  const [periodDays, setPeriodDays] = useState(30);
  const [language, setLanguage] = useState<"fr" | "en">("en");
  const [reportHtml, setReportHtml] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const generateMutation = trpc.progressReport.generateMyReport.useMutation({
    onSuccess: (data) => {
      if (data.success && data.html) {
        setReportHtml(data.html);
        toast.success(language === "fr" ? "Rapport généré avec succès" : "Report generated successfully");
      } else {
        toast.error(data.error || "Failed to generate report");
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate({ periodDays, language });
  };

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

  const labels = useMemo(() => language === "fr" ? {
    title: "Rapport de progression",
    subtitle: "Générez un rapport PDF détaillé de votre progression",
    period: "Période",
    last30: "30 derniers jours",
    last90: "90 derniers jours",
    last180: "6 derniers mois",
    last365: "Dernière année",
    lang: "Langue du rapport",
    french: "Français",
    english: "English",
    generate: "Générer le rapport",
    generating: "Génération en cours...",
    print: "Imprimer / PDF",
    download: "Télécharger",
    preview: "Aperçu du rapport",
    noReport: "Aucun rapport généré",
    noReportDesc: "Cliquez sur « Générer le rapport » pour créer votre rapport de progression personnalisé.",
  } : {
    title: "Progress Report",
    subtitle: "Generate a detailed PDF report of your learning progress",
    period: "Period",
    last30: "Last 30 days",
    last90: "Last 90 days",
    last180: "Last 6 months",
    last365: "Last year",
    lang: "Report Language",
    french: "Français",
    english: "English",
    generate: "Generate Report",
    generating: "Generating...",
    print: "Print / PDF",
    download: "Download",
    preview: "Report Preview",
    noReport: "No report generated",
    noReportDesc: "Click \"Generate Report\" to create your personalized progress report.",
  }, [language]);

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          {labels.title}
        </h1>
        <p className="text-muted-foreground mt-2">{labels.subtitle}</p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[180px]">
              <label className="text-sm font-medium mb-1.5 block flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {labels.period}
              </label>
              <Select value={String(periodDays)} onValueChange={(v) => setPeriodDays(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">{labels.last30}</SelectItem>
                  <SelectItem value="90">{labels.last90}</SelectItem>
                  <SelectItem value="180">{labels.last180}</SelectItem>
                  <SelectItem value="365">{labels.last365}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[180px]">
              <label className="text-sm font-medium mb-1.5 block flex items-center gap-1.5">
                <Globe className="h-4 w-4" />
                {labels.lang}
              </label>
              <Select value={language} onValueChange={(v) => setLanguage(v as "fr" | "en")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">{labels.french}</SelectItem>
                  <SelectItem value="en">{labels.english}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="min-w-[180px]"
            >
              {generateMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{labels.generating}</>
              ) : (
                <><FileText className="h-4 w-4 mr-2" />{labels.generate}</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{labels.preview}</CardTitle>
          </div>
          {reportHtml && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                {labels.print}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {reportHtml ? (
            <iframe
              ref={iframeRef}
              srcDoc={reportHtml}
              className="w-full border rounded-lg"
              style={{ height: "800px" }}
              title="Progress Report"
            />
          ) : (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">{labels.noReport}</p>
              <p className="text-sm text-muted-foreground/70 mt-1">{labels.noReportDesc}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
