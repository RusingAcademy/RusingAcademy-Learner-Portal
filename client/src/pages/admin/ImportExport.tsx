import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download, Upload, FileSpreadsheet, Users, BookOpen,
  FileText, BarChart3, GraduationCap, RefreshCw, Check,
  AlertTriangle, ArrowRight, Loader2
} from "lucide-react";

function downloadCSV(data: any[], filename: string) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((h) => {
        const val = row[h];
        if (val === null || val === undefined) return "";
        const str = String(val);
        return str.includes(",") || str.includes('"') || str.includes("\n")
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSV(text: string): { name: string; email: string; role?: string }[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
  const nameIdx = headers.findIndex((h) => h === "name" || h === "nom");
  const emailIdx = headers.findIndex((h) => h === "email" || h === "courriel");
  const roleIdx = headers.findIndex((h) => h === "role" || h === "rôle");
  if (nameIdx === -1 || emailIdx === -1) return [];
  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    return {
      name: cols[nameIdx] || "",
      email: cols[emailIdx] || "",
      role: roleIdx >= 0 ? cols[roleIdx] : undefined,
    };
  }).filter((c) => c.name && c.email);
}

export default function ImportExport() {
  
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; total: number } | null>(null);
  const [exportLoading, setExportLoading] = useState<string | null>(null);

  const exportContacts = trpc.importExport.exportContacts.useQuery(undefined, { enabled: false });
  const exportCourses = trpc.importExport.exportCourses.useQuery(undefined, { enabled: false });
  const exportPages = trpc.importExport.exportPages.useQuery(undefined, { enabled: false });
  const exportEnrollments = trpc.importExport.exportEnrollments.useQuery(undefined, { enabled: false });
  const exportEvents = trpc.importExport.exportAnalyticsEvents.useQuery(undefined, { enabled: false });

  const importContacts = trpc.importExport.importContacts.useMutation({
    onSuccess: (result) => {
      setImportResult(result);
      setImporting(false);
      toast.success(`Imported ${result.imported} contacts (${result.skipped} skipped)`);
    },
    onError: () => {
      setImporting(false);
      toast.error("Import failed");
    },
  });

  const handleExport = async (type: string) => {
    setExportLoading(type);
    try {
      let result: any;
      switch (type) {
        case "contacts": result = await exportContacts.refetch(); break;
        case "courses": result = await exportCourses.refetch(); break;
        case "pages": result = await exportPages.refetch(); break;
        case "enrollments": result = await exportEnrollments.refetch(); break;
        case "events": result = await exportEvents.refetch(); break;
      }
      if (result?.data) {
        downloadCSV(result.data as any[], type);
        toast.success(`${type} exported successfully`);
      }
    } catch {
      toast.error("Export failed");
    }
    setExportLoading(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const contacts = parseCSV(text);
      if (contacts.length === 0) {
        toast.error("No valid contacts found. CSV must have 'name' and 'email' columns.");
        setImporting(false);
        return;
      }
      importContacts.mutate({ contacts });
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const exportCards = [
    {
      id: "contacts",
      title: "Contacts & Users",
      description: "All users with name, email, role, profile type, and registration date",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      id: "courses",
      title: "Courses Catalog",
      description: "All courses with title, category, level, price, enrollment count, modules, and lessons",
      icon: BookOpen,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      id: "enrollments",
      title: "Enrollments",
      description: "Student enrollments with name, email, course, status, progress, and dates",
      icon: GraduationCap,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      id: "pages",
      title: "CMS Pages",
      description: "All CMS pages with title, slug, status, template, and dates",
      icon: FileText,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      id: "events",
      title: "Analytics Events",
      description: "Stripe events and funnel data with type, source, product, amount, and date",
      icon: BarChart3,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import / Export</h1>
        <p className="text-gray-500 mt-1">
          Backup your data, migrate contacts, and export reports — all in CSV format
        </p>
      </div>

      {/* Import Section */}
      <Card className="border-2 border-dashed border-violet-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-violet-600" />
            Import Contacts
          </CardTitle>
          <CardDescription>
            Upload a CSV file with <code className="bg-gray-100 px-1 rounded">name</code> and <code className="bg-gray-100 px-1 rounded">email</code> columns. Optional: <code className="bg-gray-100 px-1 rounded">role</code> column.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileRef.current?.click()}
              disabled={importing}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {importing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing...</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" /> Choose CSV File</>
              )}
            </Button>
            {importResult && (
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                  <Check className="w-3 h-3 mr-1" /> {importResult.imported} imported
                </Badge>
                {importResult.skipped > 0 && (
                  <Badge variant="secondary" className="bg-amber-50 text-amber-700">
                    <AlertTriangle className="w-3 h-3 mr-1" /> {importResult.skipped} skipped (duplicates)
                  </Badge>
                )}
              </div>
            )}
          </div>
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 font-medium mb-1">CSV Format Example:</p>
            <code className="text-xs text-gray-600 block">
              name,email,role<br />
              John Doe,john@example.com,user<br />
              Jane Smith,jane@example.com,coach
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Export Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Download className="w-5 h-5 text-gray-600" />
          Export Data
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exportCards.map((card) => {
            const Icon = card.icon;
            const isLoading = exportLoading === card.id;
            return (
              <Card key={card.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-lg ${card.bg}`}>
                      <Icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{card.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-4"
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => handleExport(card.id)}
                  >
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Exporting...</>
                    ) : (
                      <><FileSpreadsheet className="w-4 h-4 mr-2" /> Export CSV</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="py-4">
          <h3 className="font-medium text-gray-700 text-sm mb-2">Tips</h3>
          <ul className="text-xs text-gray-500 space-y-1">
            <li className="flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Exports include all records — use date filters in Sales Analytics for time-specific data</li>
            <li className="flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Imported contacts with existing emails are automatically skipped (no duplicates)</li>
            <li className="flex items-center gap-2"><ArrowRight className="w-3 h-3" /> CSV files can be opened in Excel, Google Sheets, or any spreadsheet application</li>
            <li className="flex items-center gap-2"><ArrowRight className="w-3 h-3" /> For large exports (10,000+ records), the download may take a few seconds</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
