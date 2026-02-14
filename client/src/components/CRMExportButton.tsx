import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface ExportFilters {
  startDate: string;
  endDate: string;
  sources: string[];
  statuses: string[];
  format: "csv" | "summary" | "html";
}

const translations = {
  en: {
    exportData: "Export Data",
    exportLeads: "Export Leads",
    dateRange: "Date Range",
    startDate: "Start Date",
    endDate: "End Date",
    sources: "Sources",
    statuses: "Statuses",
    format: "Format",
    csvDetailed: "CSV (Detailed)",
    csvSummary: "CSV (Summary)",
    htmlReport: "HTML Report",
    allSources: "All Sources",
    allStatuses: "All Statuses",
    export: "Export",
    cancel: "Cancel",
    exporting: "Exporting...",
    lingueefy: "Lingueefy",
    rusingacademy: "RusingAcademy",
    barholex: "Barholex Media",
    ecosystem_hub: "Ecosystem Hub",
    new: "New",
    contacted: "Contacted",
    qualified: "Qualified",
    proposal_sent: "Proposal Sent",
    negotiating: "Negotiating",
    won: "Won",
    lost: "Lost",
    nurturing: "Nurturing",
  },
  fr: {
    exportData: "Exporter les données",
    exportLeads: "Exporter les prospects",
    dateRange: "Période",
    startDate: "Date de début",
    endDate: "Date de fin",
    sources: "Sources",
    statuses: "Statuts",
    format: "Format",
    csvDetailed: "CSV (Détaillé)",
    csvSummary: "CSV (Résumé)",
    htmlReport: "Rapport HTML",
    allSources: "Toutes les sources",
    allStatuses: "Tous les statuts",
    export: "Exporter",
    cancel: "Annuler",
    exporting: "Exportation...",
    lingueefy: "Lingueefy",
    rusingacademy: "RusingAcademy",
    barholex: "Barholex Media",
    ecosystem_hub: "Hub Écosystème",
    new: "Nouveau",
    contacted: "Contacté",
    qualified: "Qualifié",
    proposal_sent: "Proposition envoyée",
    negotiating: "En négociation",
    won: "Gagné",
    lost: "Perdu",
    nurturing: "En nurturing",
  },
};

const sourceOptions = ["lingueefy", "rusingacademy", "barholex", "ecosystem_hub"];
const statusOptions = ["new", "contacted", "qualified", "proposal_sent", "negotiating", "won", "lost", "nurturing"];

export default function CRMExportButton() {
  const { language } = useLanguage();
  const t = translations[language];
  
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState<ExportFilters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    sources: [],
    statuses: [],
    format: "csv",
  });

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Build query params
      const params = new URLSearchParams();
      params.set("startDate", filters.startDate);
      params.set("endDate", filters.endDate);
      params.set("format", filters.format);
      if (filters.sources.length > 0) {
        params.set("sources", filters.sources.join(","));
      }
      if (filters.statuses.length > 0) {
        params.set("statuses", filters.statuses.join(","));
      }
      
      // For demo, generate mock CSV data
      const mockData = generateMockExport(filters);
      
      // Create download
      const blob = new Blob([mockData], { 
        type: filters.format === "html" ? "text/html" : "text/csv" 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `crm-export-${filters.startDate}-to-${filters.endDate}.${filters.format === "html" ? "html" : "csv"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setIsOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleSource = (source: string) => {
    setFilters(prev => ({
      ...prev,
      sources: prev.sources.includes(source)
        ? prev.sources.filter(s => s !== source)
        : [...prev.sources, source],
    }));
  };

  const toggleStatus = (status: string) => {
    setFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter(s => s !== status)
        : [...prev.statuses, status],
    }));
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {t.exportData}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-6">{t.exportLeads}</h2>

              {/* Date Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">{t.dateRange}</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">{t.startDate}</label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 rounded-lg border border-white/10 text-white focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">{t.endDate}</label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 rounded-lg border border-white/10 text-white focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Sources */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">{t.sources}</label>
                <div className="flex flex-wrap gap-2">
                  {sourceOptions.map(source => (
                    <button
                      key={source}
                      onClick={() => toggleSource(source)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        filters.sources.includes(source)
                          ? "bg-teal-500 text-white"
                          : "bg-white/10 text-slate-300 hover:bg-white/20"
                      }`}
                    >
                      {t[source as keyof typeof t] || source}
                    </button>
                  ))}
                </div>
                {filters.sources.length === 0 && (
                  <p className="text-xs text-slate-400 mt-1">{t.allSources}</p>
                )}
              </div>

              {/* Statuses */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">{t.statuses}</label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map(status => (
                    <button
                      key={status}
                      onClick={() => toggleStatus(status)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        filters.statuses.includes(status)
                          ? "bg-cyan-500 text-white"
                          : "bg-white/10 text-slate-300 hover:bg-white/20"
                      }`}
                    >
                      {t[status as keyof typeof t] || status}
                    </button>
                  ))}
                </div>
                {filters.statuses.length === 0 && (
                  <p className="text-xs text-slate-400 mt-1">{t.allStatuses}</p>
                )}
              </div>

              {/* Format */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">{t.format}</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, format: "csv" }))}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      filters.format === "csv"
                        ? "bg-teal-500 text-white"
                        : "bg-white/10 text-slate-300 hover:bg-white/20"
                    }`}
                  >
                    {t.csvDetailed}
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, format: "summary" }))}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      filters.format === "summary"
                        ? "bg-teal-500 text-white"
                        : "bg-white/10 text-slate-300 hover:bg-white/20"
                    }`}
                  >
                    {t.csvSummary}
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, format: "html" }))}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      filters.format === "html"
                        ? "bg-teal-500 text-white"
                        : "bg-white/10 text-slate-300 hover:bg-white/20"
                    }`}
                  >
                    {t.htmlReport}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all disabled:opacity-50"
                >
                  {isExporting ? t.exporting : t.export}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Mock export generator for demo
function generateMockExport(filters: ExportFilters): string {
  if (filters.format === "html") {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>CRM Analytics Report</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; }
    h1 { color: #009688; border-bottom: 3px solid #009688; padding-bottom: 10px; }
    .card { background: #f8fafc; border-radius: 8px; padding: 15px; margin: 10px 0; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f1f5f9; }
  </style>
</head>
<body>
  <h1>CRM Analytics Report</h1>
  <p>Period: ${filters.startDate} to ${filters.endDate}</p>
  <div class="card">
    <h3>Summary</h3>
    <p>Total Leads: 156</p>
    <p>Conversion Rate: 14.7%</p>
    <p>Average Score: 52</p>
  </div>
  <h2>Top Leads</h2>
  <table>
    <tr><th>Name</th><th>Company</th><th>Score</th><th>Status</th></tr>
    <tr><td>Marie Dubois</td><td>Treasury Board</td><td>85</td><td>Qualified</td></tr>
    <tr><td>Sarah Thompson</td><td>TechStartup Inc.</td><td>78</td><td>Proposal Sent</td></tr>
    <tr><td>Jean-Pierre Martin</td><td>-</td><td>65</td><td>New</td></tr>
  </table>
  <p style="color: #64748b; font-size: 12px; margin-top: 40px;">© 2026 Rusinga International Consulting Ltd.</p>
</body>
</html>
    `;
  }
  
  if (filters.format === "summary") {
    return `CRM Analytics Summary Report
Date Range,${filters.startDate} to ${filters.endDate}

Overview
Total Leads,156
Average Score,52
Conversion Rate,14.7%

Score Distribution
Hot (70+),23
Warm (40-69),78
Cold (<40),55

Leads by Source
Lingueefy,78
RusingAcademy,45
Barholex Media,28
Ecosystem Hub,5

Leads by Status
New,42
Contacted,35
Qualified,28
Proposal Sent,18
Negotiating,10
Won,23
`;
  }
  
  // Default CSV
  return `ID,First Name,Last Name,Email,Phone,Company,Job Title,Source,Form Type,Lead Type,Status,Lead Score,Budget,Timeline,Created At
1,Marie,Dubois,marie.dubois@canada.ca,+1 613-555-0123,Treasury Board of Canada,HR Director,rusingacademy,proposal,government,qualified,85,"$50,000-$100,000",Q2 2026,2026-01-08T10:30:00Z
2,Jean-Pierre,Martin,jp.martin@example.com,,,,,lingueefy,coaching,individual,new,65,,,2026-01-09T14:15:00Z
3,Sarah,Thompson,sarah@techstartup.io,,TechStartup Inc.,CEO,barholex,project,enterprise,proposal_sent,78,"$15,000-$25,000",March 2026,2026-01-07T09:00:00Z
`;
}
