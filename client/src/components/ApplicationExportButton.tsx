import React, { useState } from "react";
import { Download, Calendar } from "lucide-react";
import { trpc } from "../lib/trpc";
import { useLanguage } from "../contexts/LanguageContext";

interface ApplicationExportButtonProps {
  status?: "all" | "submitted" | "under_review" | "approved" | "rejected";
  onExportStart?: () => void;
  onExportComplete?: () => void;
}

export function ApplicationExportButton({
  status = "all",
  onExportStart,
  onExportComplete,
}: ApplicationExportButtonProps) {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [isExporting, setIsExporting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const exportMutation = (trpc.admin as any).exportApplicationsCSV.useQuery(
    {
      status: status as any,
      startDate,
      endDate,
    },
    {
      enabled: false,
    }
  );

  const handleExport = async () => {
    setIsExporting(true);
    onExportStart?.();

    try {
      const result = await exportMutation.refetch();
      if (result.data) {
        const { csvContent, filename } = result.data;

        // Create blob and download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setShowDatePicker(false);
        setStartDate(undefined);
        setEndDate(undefined);
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
      onExportComplete?.();
    }
  };

  return (
    <div className="relative">
      {showDatePicker && (
        <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 w-80">
          <h3 className="font-semibold mb-4 text-gray-900">
            {isEn ? "Filter by Date Range" : "Filtrer par plage de dates"}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isEn ? "Start Date" : "Date de début"}
              </label>
              <input
                type="date"
                value={startDate ? startDate.toISOString().split("T")[0] : ""}
                onChange={(e) =>
                  setStartDate(e.target.value ? new Date(e.target.value) : undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isEn ? "End Date" : "Date de fin"}
              </label>
              <input
                type="date"
                value={endDate ? endDate.toISOString().split("T")[0] : ""}
                onChange={(e) =>
                  setEndDate(e.target.value ? new Date(e.target.value) : undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
              >
                {isExporting ? (isEn ? "Exporting..." : "Exportation...") : isEn ? "Export" : "Exporter"}
              </button>
              <button
                onClick={() => setShowDatePicker(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {isEn ? "Cancel" : "Annuler"}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowDatePicker(!showDatePicker)}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        <Download size={18} />
        {isExporting ? (isEn ? "Exporting..." : "Exportation...") : isEn ? "Export CSV" : "Exporter CSV"}
      </button>
    </div>
  );
}
