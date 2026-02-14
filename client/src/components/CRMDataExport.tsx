import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

interface ExportOptions {
  format: "csv" | "excel";
  includeFields: string[];
  statusFilter: string;
  sourceFilter: string;
  dateRange: string;
}

const EXPORT_FIELDS = [
  { id: "firstName", labelEn: "First Name", labelFr: "Prénom" },
  { id: "lastName", labelEn: "Last Name", labelFr: "Nom" },
  { id: "email", labelEn: "Email", labelFr: "Email" },
  { id: "phone", labelEn: "Phone", labelFr: "Téléphone" },
  { id: "company", labelEn: "Company", labelFr: "Entreprise" },
  { id: "jobTitle", labelEn: "Job Title", labelFr: "Poste" },
  { id: "status", labelEn: "Status", labelFr: "Statut" },
  { id: "source", labelEn: "Source", labelFr: "Source" },
  { id: "leadType", labelEn: "Lead Type", labelFr: "Type de lead" },
  { id: "leadScore", labelEn: "Lead Score", labelFr: "Score" },
  { id: "budget", labelEn: "Budget", labelFr: "Budget" },
  { id: "createdAt", labelEn: "Created Date", labelFr: "Date de création" },
  { id: "lastContactedAt", labelEn: "Last Contact", labelFr: "Dernier contact" },
  { id: "notes", labelEn: "Notes", labelFr: "Notes" },
];

const STATUS_OPTIONS = [
  { value: "all", labelEn: "All Statuses", labelFr: "Tous les statuts" },
  { value: "new", labelEn: "New", labelFr: "Nouveau" },
  { value: "contacted", labelEn: "Contacted", labelFr: "Contacté" },
  { value: "qualified", labelEn: "Qualified", labelFr: "Qualifié" },
  { value: "proposal", labelEn: "Proposal", labelFr: "Proposition" },
  { value: "converted", labelEn: "Won", labelFr: "Gagné" },
  { value: "lost", labelEn: "Lost", labelFr: "Perdu" },
];

const SOURCE_OPTIONS = [
  { value: "all", labelEn: "All Sources", labelFr: "Toutes les sources" },
  { value: "lingueefy", labelEn: "Lingueefy", labelFr: "Lingueefy" },
  { value: "rusingacademy", labelEn: "RusingAcademy", labelFr: "RusingAcademy" },
  { value: "barholex", labelEn: "Barholex", labelFr: "Barholex" },
  { value: "ecosystem_hub", labelEn: "Ecosystem Hub", labelFr: "Ecosystem Hub" },
  { value: "external", labelEn: "External", labelFr: "Externe" },
];

const DATE_RANGE_OPTIONS = [
  { value: "all", labelEn: "All Time", labelFr: "Tout le temps" },
  { value: "7days", labelEn: "Last 7 days", labelFr: "7 derniers jours" },
  { value: "30days", labelEn: "Last 30 days", labelFr: "30 derniers jours" },
  { value: "90days", labelEn: "Last 90 days", labelFr: "90 derniers jours" },
  { value: "year", labelEn: "This year", labelFr: "Cette année" },
];

export default function CRMDataExport() {
  const { language } = useLanguage();
  const [isExporting, setIsExporting] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    format: "csv",
    includeFields: ["firstName", "lastName", "email", "phone", "company", "status", "leadScore"],
    statusFilter: "all",
    sourceFilter: "all",
    dateRange: "all",
  });

  const leadsQuery = trpc.crm.getLeadsWithScores.useQuery({ limit: 1000 });

  const labels = {
    en: {
      title: "Export CRM Data",
      subtitle: "Download your leads data in CSV or Excel format",
      format: "Export Format",
      csv: "CSV (Comma Separated)",
      excel: "Excel (XLSX)",
      fields: "Fields to Include",
      selectAll: "Select All",
      deselectAll: "Deselect All",
      filters: "Filters",
      status: "Status",
      source: "Source",
      dateRange: "Date Range",
      export: "Export Data",
      exporting: "Exporting...",
      preview: "Preview",
      recordsFound: "records found",
      noRecords: "No records match your filters",
    },
    fr: {
      title: "Exporter les données CRM",
      subtitle: "Téléchargez vos données de leads au format CSV ou Excel",
      format: "Format d'export",
      csv: "CSV (Séparé par virgules)",
      excel: "Excel (XLSX)",
      fields: "Champs à inclure",
      selectAll: "Tout sélectionner",
      deselectAll: "Tout désélectionner",
      filters: "Filtres",
      status: "Statut",
      source: "Source",
      dateRange: "Période",
      export: "Exporter les données",
      exporting: "Exportation...",
      preview: "Aperçu",
      recordsFound: "enregistrements trouvés",
      noRecords: "Aucun enregistrement ne correspond à vos filtres",
    },
  };

  const l = labels[language];

  const toggleField = (fieldId: string) => {
    setOptions((prev) => ({
      ...prev,
      includeFields: prev.includeFields.includes(fieldId)
        ? prev.includeFields.filter((f) => f !== fieldId)
        : [...prev.includeFields, fieldId],
    }));
  };

  const selectAllFields = () => {
    setOptions((prev) => ({
      ...prev,
      includeFields: EXPORT_FIELDS.map((f) => f.id),
    }));
  };

  const deselectAllFields = () => {
    setOptions((prev) => ({
      ...prev,
      includeFields: [],
    }));
  };

  const getFilteredLeads = () => {
    if (!leadsQuery.data?.leads) return [];

    return leadsQuery.data.leads.filter((lead) => {
      // Status filter
      if (options.statusFilter !== "all" && lead.status !== options.statusFilter) {
        return false;
      }

      // Source filter
      if (options.sourceFilter !== "all" && lead.source !== options.sourceFilter) {
        return false;
      }

      // Date range filter
      if (options.dateRange !== "all") {
        const createdAt = new Date(lead.createdAt);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

        switch (options.dateRange) {
          case "7days":
            if (daysDiff > 7) return false;
            break;
          case "30days":
            if (daysDiff > 30) return false;
            break;
          case "90days":
            if (daysDiff > 90) return false;
            break;
          case "year":
            if (createdAt.getFullYear() !== now.getFullYear()) return false;
            break;
        }
      }

      return true;
    });
  };

  const formatValue = (value: unknown, fieldId: string): string => {
    if (value === null || value === undefined) return "";

    if (fieldId === "createdAt" || fieldId === "lastContactedAt") {
      return new Date(value as string).toLocaleDateString();
    }

    return String(value);
  };

  const exportToCSV = (leads: Record<string, unknown>[]) => {
    const headers = options.includeFields.map((fieldId) => {
      const field = EXPORT_FIELDS.find((f) => f.id === fieldId);
      return language === "fr" ? field?.labelFr : field?.labelEn;
    });

    const rows = leads.map((lead) =>
      options.includeFields.map((fieldId) => {
        const value = formatValue(lead[fieldId], fieldId);
        // Escape quotes and wrap in quotes if contains comma
        if (value.includes(",") || value.includes('"') || value.includes("\n")) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
    );

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `crm-leads-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const exportToExcel = (leads: Record<string, unknown>[]) => {
    // Create a simple XML-based Excel file (works without external libraries)
    const headers = options.includeFields.map((fieldId) => {
      const field = EXPORT_FIELDS.find((f) => f.id === fieldId);
      return language === "fr" ? field?.labelFr : field?.labelEn;
    });

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<?mso-application progid="Excel.Sheet"?>\n';
    xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
    xml += '  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
    xml += "  <Worksheet ss:Name=\"Leads\">\n";
    xml += "    <Table>\n";

    // Header row
    xml += "      <Row>\n";
    headers.forEach((header) => {
      xml += `        <Cell><Data ss:Type="String">${escapeXml(header || "")}</Data></Cell>\n`;
    });
    xml += "      </Row>\n";

    // Data rows
    leads.forEach((lead) => {
      xml += "      <Row>\n";
      options.includeFields.forEach((fieldId) => {
        const value = formatValue(lead[fieldId], fieldId);
        const type = fieldId === "leadScore" || fieldId === "budget" ? "Number" : "String";
        xml += `        <Cell><Data ss:Type="${type}">${escapeXml(value)}</Data></Cell>\n`;
      });
      xml += "      </Row>\n";
    });

    xml += "    </Table>\n";
    xml += "  </Worksheet>\n";
    xml += "</Workbook>";

    const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `crm-leads-${new Date().toISOString().split("T")[0]}.xls`;
    link.click();
  };

  const escapeXml = (str: string): string => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  const handleExport = async () => {
    if (options.includeFields.length === 0) {
      toast.error(language === "fr" ? "Sélectionnez au moins un champ" : "Select at least one field");
      return;
    }

    const filteredLeads = getFilteredLeads();
    if (filteredLeads.length === 0) {
      toast.error(l.noRecords);
      return;
    }

    setIsExporting(true);

    try {
      if (options.format === "csv") {
        exportToCSV(filteredLeads as Record<string, unknown>[]);
      } else {
        exportToExcel(filteredLeads as Record<string, unknown>[]);
      }

      toast.success(
        language === "fr"
          ? `${filteredLeads.length} leads exportés avec succès`
          : `${filteredLeads.length} leads exported successfully`
      );
    } catch (error) {
      toast.error(language === "fr" ? "Erreur d'exportation" : "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const filteredCount = getFilteredLeads().length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Download className="h-6 w-6 text-blue-500" />
          {l.title}
        </h2>
        <p className="text-muted-foreground">{l.subtitle}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Format Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{l.format}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setOptions({ ...options, format: "csv" })}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  options.format === "csv"
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-muted-foreground/50"
                }`}
              >
                <FileText className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="font-medium text-sm">{l.csv}</p>
              </button>
              <button
                onClick={() => setOptions({ ...options, format: "excel" })}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  options.format === "excel"
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-muted-foreground/50"
                }`}
              >
                <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-emerald-600" />
                <p className="font-medium text-sm">{l.excel}</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {l.filters}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{l.status}</Label>
              <Select
                value={options.statusFilter}
                onValueChange={(value) => setOptions({ ...options, statusFilter: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {language === "fr" ? opt.labelFr : opt.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{l.source}</Label>
              <Select
                value={options.sourceFilter}
                onValueChange={(value) => setOptions({ ...options, sourceFilter: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {language === "fr" ? opt.labelFr : opt.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{l.dateRange}</Label>
              <Select
                value={options.dateRange}
                onValueChange={(value) => setOptions({ ...options, dateRange: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_RANGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {language === "fr" ? opt.labelFr : opt.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fields Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{l.fields}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAllFields}>
                {l.selectAll}
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAllFields}>
                {l.deselectAll}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {EXPORT_FIELDS.map((field) => (
              <div key={field.id} className="flex items-center space-x-2">
                <Checkbox
                  id={field.id}
                  checked={options.includeFields.includes(field.id)}
                  onCheckedChange={() => toggleField(field.id)}
                />
                <label
                  htmlFor={field.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {language === "fr" ? field.labelFr : field.labelEn}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {filteredCount} {l.recordsFound}
              </Badge>
              {filteredCount > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {language === "fr" ? "Prêt à exporter" : "Ready to export"}
                </div>
              )}
            </div>
            <Button
              size="lg"
              onClick={handleExport}
              disabled={isExporting || filteredCount === 0 || options.includeFields.length === 0}
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {l.exporting}
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  {l.export}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
