import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface HRExportButtonProps {
  organizationId: number;
  cohortId?: number;
}

export function HRExportButton({ organizationId, cohortId }: HRExportButtonProps) {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [isExporting, setIsExporting] = useState(false);

  const exportMutation = trpc.hr.exportReport.useMutation();

  const downloadCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast.error(isEn ? "No data to export" : "Aucune donnée à exporter");
      return;
    }

    // Get headers from first row
    const headers = Object.keys(data[0]);
    
    // Build CSV content
    const csvContent = [
      headers.join(","),
      ...data.map(row => 
        headers.map(h => {
          const val = row[h];
          if (val === null || val === undefined) return "";
          if (typeof val === "string" && (val.includes(",") || val.includes('"') || val.includes("\n"))) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        }).join(",")
      )
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generatePDFHTML = (data: any[]): string => {
    if (!data || data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const title = isEn ? "Learner Progress Report" : "Rapport de Progression des Apprenants";
    const date = new Date().toLocaleDateString(isEn ? "en-CA" : "fr-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10pt; color: #333; }
    .header { background: #0F3D3E; color: white; padding: 30px 40px; margin-bottom: 30px; }
    .header h1 { font-size: 24pt; margin-bottom: 5px; }
    .header p { opacity: 0.9; }
    .container { padding: 0 40px 40px; }
    table { width: 100%; border-collapse: collapse; font-size: 9pt; }
    th { background: #0F3D3E; color: white; padding: 12px 8px; text-align: left; }
    td { padding: 10px 8px; border-bottom: 1px solid #eee; }
    tr:nth-child(even) { background: #f9f9f9; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 8pt; color: #999; }
    @media print { .header, th { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <p>${isEn ? "Generated on" : "Généré le"} ${date} | Rusinga International Consulting Ltd.</p>
  </div>
  <div class="container">
    <table>
      <thead>
        <tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${data.map(row => `
          <tr>${headers.map(h => `<td>${row[h] ?? "-"}</td>`).join("")}</tr>
        `).join("")}
      </tbody>
    </table>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Rusinga International Consulting Ltd. | ${isEn ? "Commercially known as" : "Commercialement connu sous"} RusingÂcademy</p>
    </div>
  </div>
</body>
</html>`;
  };

  const downloadPDF = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast.error(isEn ? "No data to export" : "Aucune donnée à exporter");
      return;
    }

    const html = generatePDFHTML(data);
    
    // Open print dialog with the HTML content
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleExport = async (format: "csv" | "pdf") => {
    setIsExporting(true);
    try {
      const result = await exportMutation.mutateAsync({
        organizationId,
        format: "csv", // Always get data as CSV, we'll convert client-side
        cohortId,
      });

      const filename = `progress-report-${new Date().toISOString().split("T")[0]}`;

      if (format === "csv") {
        downloadCSV(result.data, `${filename}.csv`);
        toast.success(isEn ? "CSV exported successfully" : "CSV exporté avec succès");
      } else {
        downloadPDF(result.data, `${filename}.pdf`);
        toast.success(isEn ? "PDF ready for printing" : "PDF prêt pour l'impression");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error(isEn ? "Export failed" : "Échec de l'exportation");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {isEn ? "Export" : "Exporter"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          {isEn ? "Export as CSV" : "Exporter en CSV"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("pdf")}>
          <FileText className="h-4 w-4 mr-2" />
          {isEn ? "Export as PDF" : "Exporter en PDF"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default HRExportButton;
