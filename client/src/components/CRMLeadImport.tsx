import { useState, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
  Upload,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Download,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface ParsedRow {
  [key: string]: string;
}

interface ColumnMapping {
  csvColumn: string;
  dbField: string;
}

const DB_FIELDS = [
  { id: "firstName", labelEn: "First Name", labelFr: "Prénom", required: true },
  { id: "lastName", labelEn: "Last Name", labelFr: "Nom", required: true },
  { id: "email", labelEn: "Email", labelFr: "Email", required: true },
  { id: "phone", labelEn: "Phone", labelFr: "Téléphone", required: false },
  { id: "company", labelEn: "Company", labelFr: "Entreprise", required: false },
  { id: "jobTitle", labelEn: "Job Title", labelFr: "Poste", required: false },
  { id: "source", labelEn: "Source", labelFr: "Source", required: false },
  { id: "leadType", labelEn: "Lead Type", labelFr: "Type de lead", required: false },
  { id: "budget", labelEn: "Budget", labelFr: "Budget", required: false },
  { id: "notes", labelEn: "Notes", labelFr: "Notes", required: false },
];

export default function CRMLeadImport() {
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"upload" | "mapping" | "preview" | "importing" | "complete">("upload");
  const [csvData, setCsvData] = useState<ParsedRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  }>({ success: 0, failed: 0, errors: [] });

  const importMutation = trpc.crm.importLeads.useMutation({
    onSuccess: (data) => {
      setImportResults({
        success: data.imported,
        failed: data.failed,
        errors: data.errors,
      });
      setStep("complete");
      toast.success(
        language === "fr"
          ? `${data.imported} leads importés avec succès`
          : `${data.imported} leads imported successfully`
      );
    },
    onError: () => {
      toast.error(language === "fr" ? "Erreur d'importation" : "Import failed");
    },
  });

  const labels = {
    en: {
      title: "Import Leads",
      subtitle: "Upload a CSV file to import leads into your CRM",
      uploadFile: "Upload CSV File",
      dragDrop: "Drag and drop your CSV file here, or click to browse",
      supportedFormats: "Supported formats: CSV, UTF-8 encoded",
      mapColumns: "Map Columns",
      mapColumnsDesc: "Match your CSV columns to the database fields",
      csvColumn: "CSV Column",
      dbField: "Database Field",
      skip: "Skip this column",
      preview: "Preview Import",
      previewDesc: "Review the data before importing",
      startImport: "Start Import",
      importing: "Importing...",
      importComplete: "Import Complete",
      leadsImported: "leads imported successfully",
      leadsFailed: "leads failed to import",
      errors: "Errors",
      back: "Back",
      next: "Next",
      reset: "Import Another File",
      downloadTemplate: "Download Template",
      required: "Required",
      rowsFound: "rows found",
      sampleData: "Sample Data",
    },
    fr: {
      title: "Importer des leads",
      subtitle: "Téléchargez un fichier CSV pour importer des leads dans votre CRM",
      uploadFile: "Télécharger un fichier CSV",
      dragDrop: "Glissez-déposez votre fichier CSV ici, ou cliquez pour parcourir",
      supportedFormats: "Formats supportés: CSV, encodage UTF-8",
      mapColumns: "Mapper les colonnes",
      mapColumnsDesc: "Associez vos colonnes CSV aux champs de la base de données",
      csvColumn: "Colonne CSV",
      dbField: "Champ base de données",
      skip: "Ignorer cette colonne",
      preview: "Aperçu de l'import",
      previewDesc: "Vérifiez les données avant l'importation",
      startImport: "Démarrer l'import",
      importing: "Importation...",
      importComplete: "Import terminé",
      leadsImported: "leads importés avec succès",
      leadsFailed: "leads n'ont pas pu être importés",
      errors: "Erreurs",
      back: "Retour",
      next: "Suivant",
      reset: "Importer un autre fichier",
      downloadTemplate: "Télécharger le modèle",
      required: "Requis",
      rowsFound: "lignes trouvées",
      sampleData: "Données exemple",
    },
  };

  const l = labels[language];

  const parseCSV = (text: string): { headers: string[]; rows: ParsedRow[] } => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim());
    if (lines.length === 0) return { headers: [], rows: [] };

    // Parse header
    const headers = parseCSVLine(lines[0]);

    // Parse rows
    const rows: ParsedRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length === headers.length) {
        const row: ParsedRow = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        rows.push(row);
      }
    }

    return { headers, rows };
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (inQuotes) {
        if (char === '"' && nextChar === '"') {
          current += '"';
          i++;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ",") {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
    }
    result.push(current.trim());

    return result;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers, rows } = parseCSV(text);

      setCsvHeaders(headers);
      setCsvData(rows);

      // Auto-map columns based on name similarity
      const autoMappings: ColumnMapping[] = headers.map((header) => {
        const normalizedHeader = header.toLowerCase().replace(/[^a-z]/g, "");
        const matchedField = DB_FIELDS.find((field) => {
          const normalizedField = field.id.toLowerCase();
          const normalizedLabelEn = field.labelEn.toLowerCase().replace(/[^a-z]/g, "");
          const normalizedLabelFr = field.labelFr.toLowerCase().replace(/[^a-z]/g, "");
          return (
            normalizedHeader.includes(normalizedField) ||
            normalizedHeader.includes(normalizedLabelEn) ||
            normalizedHeader.includes(normalizedLabelFr) ||
            normalizedField.includes(normalizedHeader)
          );
        });
        return {
          csvColumn: header,
          dbField: matchedField?.id || "",
        };
      });

      setColumnMappings(autoMappings);
      setStep("mapping");
    };
    reader.readAsText(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.name.endsWith(".csv")) {
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        handleFileUpload({ target: input } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  const updateMapping = (csvColumn: string, dbField: string) => {
    setColumnMappings((prev) =>
      prev.map((m) => (m.csvColumn === csvColumn ? { ...m, dbField } : m))
    );
  };

  const getMappedData = (): Record<string, string>[] => {
    return csvData.map((row) => {
      const mappedRow: Record<string, string> = {};
      columnMappings.forEach((mapping) => {
        if (mapping.dbField && mapping.dbField !== "skip") {
          mappedRow[mapping.dbField] = row[mapping.csvColumn] || "";
        }
      });
      return mappedRow;
    });
  };

  const validateMappings = (): boolean => {
    const requiredFields = DB_FIELDS.filter((f) => f.required).map((f) => f.id);
    const mappedFields = columnMappings.filter((m) => m.dbField).map((m) => m.dbField);
    return requiredFields.every((field) => mappedFields.includes(field));
  };

  const handleImport = () => {
    const mappedData = getMappedData();
    setStep("importing");
    setImportProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setImportProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    importMutation.mutate(
      { leads: mappedData },
      {
        onSettled: () => {
          clearInterval(progressInterval);
          setImportProgress(100);
        },
      }
    );
  };

  const downloadTemplate = () => {
    const headers = DB_FIELDS.map((f) => (language === "fr" ? f.labelFr : f.labelEn));
    const sampleRow = [
      "John",
      "Doe",
      "john.doe@example.com",
      "+1234567890",
      "Acme Inc",
      "Manager",
      "lingueefy",
      "corporate",
      "50000",
      "Interested in premium plan",
    ];

    const csvContent = [headers.join(","), sampleRow.join(",")].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "leads-import-template.csv";
    link.click();
  };

  const reset = () => {
    setStep("upload");
    setCsvData([]);
    setCsvHeaders([]);
    setColumnMappings([]);
    setImportProgress(0);
    setImportResults({ success: 0, failed: 0, errors: [] });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Upload className="h-6 w-6 text-blue-500" />
            {l.title}
          </h2>
          <p className="text-muted-foreground">{l.subtitle}</p>
        </div>
        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="h-4 w-4 mr-2" />
          {l.downloadTemplate}
        </Button>
      </div>

      {/* Step 1: Upload */}
      {step === "upload" && (
        <Card>
          <CardContent className="pt-6">
            <div
              className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <FileSpreadsheet className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">{l.dragDrop}</p>
              <p className="text-sm text-muted-foreground">{l.supportedFormats}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Column Mapping */}
      {step === "mapping" && (
        <Card>
          <CardHeader>
            <CardTitle>{l.mapColumns}</CardTitle>
            <CardDescription>
              {l.mapColumnsDesc} • {csvData.length} {l.rowsFound}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{l.csvColumn}</TableHead>
                  <TableHead></TableHead>
                  <TableHead>{l.dbField}</TableHead>
                  <TableHead>{l.sampleData}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {columnMappings.map((mapping) => (
                  <TableRow key={mapping.csvColumn}>
                    <TableCell className="font-medium">{mapping.csvColumn}</TableCell>
                    <TableCell>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={mapping.dbField || "skip"}
                        onValueChange={(value) => updateMapping(mapping.csvColumn, value)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="skip">{l.skip}</SelectItem>
                          {DB_FIELDS.map((field) => (
                            <SelectItem key={field.id} value={field.id}>
                              {language === "fr" ? field.labelFr : field.labelEn}
                              {field.required && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {csvData[0]?.[mapping.csvColumn]?.substring(0, 30)}
                      {(csvData[0]?.[mapping.csvColumn]?.length || 0) > 30 && "..."}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={reset}>
                {l.back}
              </Button>
              <Button onClick={() => setStep("preview")} disabled={!validateMappings()}>
                {l.next}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {!validateMappings() && (
              <p className="text-sm text-amber-600 mt-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {language === "fr"
                  ? "Veuillez mapper tous les champs requis (Prénom, Nom, Email)"
                  : "Please map all required fields (First Name, Last Name, Email)"}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Preview */}
      {step === "preview" && (
        <Card>
          <CardHeader>
            <CardTitle>{l.preview}</CardTitle>
            <CardDescription>
              {l.previewDesc} • {csvData.length} {l.rowsFound}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columnMappings
                      .filter((m) => m.dbField && m.dbField !== "skip")
                      .map((m) => {
                        const field = DB_FIELDS.find((f) => f.id === m.dbField);
                        return (
                          <TableHead key={m.dbField}>
                            {language === "fr" ? field?.labelFr : field?.labelEn}
                          </TableHead>
                        );
                      })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getMappedData()
                    .slice(0, 5)
                    .map((row, index) => (
                      <TableRow key={index}>
                        {columnMappings
                          .filter((m) => m.dbField && m.dbField !== "skip")
                          .map((m) => (
                            <TableCell key={m.dbField}>{row[m.dbField]}</TableCell>
                          ))}
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>

            {csvData.length > 5 && (
              <p className="text-sm text-muted-foreground mt-4 text-center">
                {language === "fr"
                  ? `... et ${csvData.length - 5} autres lignes`
                  : `... and ${csvData.length - 5} more rows`}
              </p>
            )}

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep("mapping")}>
                {l.back}
              </Button>
              <Button onClick={handleImport}>
                {l.startImport}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Importing */}
      {step === "importing" && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-lg font-medium mb-4">{l.importing}</p>
              <Progress value={importProgress} className="max-w-md mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">{importProgress}%</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Complete */}
      {step === "complete" && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-2xl font-bold mb-4">{l.importComplete}</h3>

              <div className="flex justify-center gap-8 mb-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{importResults.success}</p>
                  <p className="text-sm text-muted-foreground">{l.leadsImported}</p>
                </div>
                {importResults.failed > 0 && (
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-600">{importResults.failed}</p>
                    <p className="text-sm text-muted-foreground">{l.leadsFailed}</p>
                  </div>
                )}
              </div>

              {importResults.errors.length > 0 && (
                <div className="text-left max-w-md mx-auto mb-6">
                  <p className="font-medium mb-2 flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    {l.errors}:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {importResults.errors.slice(0, 5).map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                    {importResults.errors.length > 5 && (
                      <li>
                        ... {language === "fr" ? "et" : "and"} {importResults.errors.length - 5}{" "}
                        {language === "fr" ? "autres erreurs" : "more errors"}
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <Button onClick={reset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {l.reset}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
