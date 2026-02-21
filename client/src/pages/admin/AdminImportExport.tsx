/**
 * AdminImportExport — Bulk content import/export for CMS
 * Supports JSON and CSV formats for programs, paths, modules, lessons
 */
import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import AdminControlLayout from "@/components/AdminControlLayout";

const ACCENT = "#dc2626";

type ExportFormat = "json" | "csv";
type EntityType = "programs" | "paths" | "modules" | "lessons";

interface ExportConfig {
  entityType: EntityType;
  format: ExportFormat;
  programId?: number;
  pathId?: number;
  moduleId?: number;
}

export default function AdminImportExport() {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<"export" | "import">("export");
  const [exportConfig, setExportConfig] = useState<ExportConfig>({ entityType: "programs", format: "json" });
  const [importFormat, setImportFormat] = useState<ExportFormat>("json");
  const [importEntityType, setImportEntityType] = useState<EntityType>("lessons");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[] | null>(null);
  const [importStatus, setImportStatus] = useState<{ type: "idle" | "loading" | "success" | "error"; message: string }>({ type: "idle", message: "" });
  const [exportStatus, setExportStatus] = useState<{ type: "idle" | "loading" | "success" | "error"; message: string }>({ type: "idle", message: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries for export
  const programsQuery = trpc.cms.programs.list.useQuery();
  const pathsQuery = trpc.cms.paths.list.useQuery(exportConfig.programId ? { programId: exportConfig.programId } : undefined);
  const modulesQuery = trpc.cms.modules.list.useQuery(
    exportConfig.pathId ? { pathId: exportConfig.pathId } : { pathId: 0 },
    { enabled: !!exportConfig.pathId }
  );
  const lessonsQuery = trpc.cms.lessons.list.useQuery(
    exportConfig.moduleId ? { moduleId: exportConfig.moduleId } : { moduleId: 0 },
    { enabled: !!exportConfig.moduleId }
  );

  // Import mutations
  const createProgram = trpc.cms.programs.create.useMutation();
  const createPath = trpc.cms.paths.create.useMutation();
  const createModule = trpc.cms.modules.create.useMutation();
  const createLesson = trpc.cms.lessons.create.useMutation();
  const updateProgram = trpc.cms.programs.update.useMutation();
  const updatePath = trpc.cms.paths.update.useMutation();
  const updateModule = trpc.cms.modules.update.useMutation();
  const updateLesson = trpc.cms.lessons.update.useMutation();

  const utils = trpc.useUtils();

  // ─── EXPORT ───
  const getExportData = (): any[] => {
    switch (exportConfig.entityType) {
      case "programs": return programsQuery.data ?? [];
      case "paths": return pathsQuery.data ?? [];
      case "modules": return modulesQuery.data ?? [];
      case "lessons": return lessonsQuery.data ?? [];
    }
  };

  const convertToCSV = (data: any[]): string => {
    if (!data.length) return "";
    const headers = Object.keys(data[0]);
    const rows = data.map((row: any) =>
      headers.map((h: string) => {
        const val = row[h];
        if (val === null || val === undefined) return "";
        const str = typeof val === "object" ? JSON.stringify(val) : String(val);
        return str.includes(",") || str.includes('"') || str.includes("\n")
          ? `"${str.replace(/"/g, '""')}"` : str;
      }).join(",")
    );
    return [headers.join(","), ...rows].join("\n");
  };

  const handleExport = () => {
    setExportStatus({ type: "loading", message: lang === "fr" ? "Exportation en cours..." : "Exporting..." });
    try {
      const data = getExportData();
      if (!data.length) {
        setExportStatus({ type: "error", message: lang === "fr" ? "Aucune donnée à exporter" : "No data to export" });
        return;
      }

      let content: string;
      let mimeType: string;
      let extension: string;

      if (exportConfig.format === "json") {
        content = JSON.stringify(data, null, 2);
        mimeType = "application/json";
        extension = "json";
      } else {
        content = convertToCSV(data);
        mimeType = "text/csv";
        extension = "csv";
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cms-${exportConfig.entityType}-${new Date().toISOString().slice(0, 10)}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportStatus({ type: "success", message: `${data.length} ${exportConfig.entityType} ${lang === "fr" ? "exporté(s)" : "exported"}` });
    } catch (err: any) {
      setExportStatus({ type: "error", message: err.message || "Export failed" });
    }
  };

  // ─── IMPORT ───
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    setImportStatus({ type: "idle", message: "" });

    try {
      const text = await file.text();
      let parsed: any[];

      if (importFormat === "json") {
        const raw = JSON.parse(text);
        parsed = Array.isArray(raw) ? raw : [raw];
      } else {
        parsed = parseCSV(text);
      }

      setImportPreview(parsed.slice(0, 5));
      setImportStatus({ type: "idle", message: `${parsed.length} ${lang === "fr" ? "enregistrements trouvés" : "records found"}` });
    } catch (err: any) {
      setImportPreview(null);
      setImportStatus({ type: "error", message: `${lang === "fr" ? "Erreur de lecture" : "Parse error"}: ${err.message}` });
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split("\n").filter((l: string) => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h: string) => h.trim().replace(/^"|"$/g, ""));
    return lines.slice(1).map((line: string) => {
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      for (const char of line) {
        if (char === '"') { inQuotes = !inQuotes; continue; }
        if (char === "," && !inQuotes) { values.push(current.trim()); current = ""; continue; }
        current += char;
      }
      values.push(current.trim());
      const obj: any = {};
      headers.forEach((h: string, i: number) => {
        let val: any = values[i] ?? "";
        if (val === "true") val = true;
        else if (val === "false") val = false;
        else if (val !== "" && !isNaN(Number(val)) && h !== "slug" && h !== "title" && h !== "titleFr" && h !== "lessonNumber" && h !== "number") val = Number(val);
        obj[h] = val;
      });
      return obj;
    });
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImportStatus({ type: "loading", message: lang === "fr" ? "Importation en cours..." : "Importing..." });

    try {
      const text = await importFile.text();
      let records: any[];

      if (importFormat === "json") {
        const raw = JSON.parse(text);
        records = Array.isArray(raw) ? raw : [raw];
      } else {
        records = parseCSV(text);
      }

      let created = 0;
      let updated = 0;
      let errors = 0;

      for (const record of records) {
        try {
          const { id, createdAt, updatedAt, ...data } = record;

          if (id && typeof id === "number") {
            // Update existing
            switch (importEntityType) {
              case "programs": await updateProgram.mutateAsync({ id, ...data }); break;
              case "paths": await updatePath.mutateAsync({ id, ...data }); break;
              case "modules": await updateModule.mutateAsync({ id, ...data }); break;
              case "lessons": await updateLesson.mutateAsync({ id, ...data }); break;
            }
            updated++;
          } else {
            // Create new
            switch (importEntityType) {
              case "programs": await createProgram.mutateAsync(data); break;
              case "paths": await createPath.mutateAsync(data); break;
              case "modules": await createModule.mutateAsync(data); break;
              case "lessons": await createLesson.mutateAsync(data); break;
            }
            created++;
          }
        } catch (err: any) {
          console.error("Import record error:", err);
          errors++;
        }
      }

      // Invalidate all CMS queries
      utils.cms.programs.list.invalidate();
      utils.cms.paths.list.invalidate();
      utils.cms.modules.list.invalidate();
      utils.cms.lessons.list.invalidate();
      utils.cms.stats.overview.invalidate();

      setImportStatus({
        type: errors > 0 ? "error" : "success",
        message: `${created} ${lang === "fr" ? "créé(s)" : "created"}, ${updated} ${lang === "fr" ? "mis à jour" : "updated"}${errors > 0 ? `, ${errors} ${lang === "fr" ? "erreur(s)" : "error(s)"}` : ""}`,
      });
      setImportPreview(null);
      setImportFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setImportStatus({ type: "error", message: err.message || "Import failed" });
    }
  };

  return (
    <AdminControlLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            {lang === "fr" ? "Import / Export" : "Import / Export"}
          </h1>
          <p className="text-sm text-gray-500">
            {lang === "fr"
              ? "Exportez ou importez du contenu CMS en masse au format JSON ou CSV"
              : "Bulk export or import CMS content in JSON or CSV format"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
          {(["export", "import"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === tab
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="material-icons text-base mr-1.5 align-text-bottom">
                {tab === "export" ? "file_download" : "file_upload"}
              </span>
              {tab === "export"
                ? (lang === "fr" ? "Exporter" : "Export")
                : (lang === "fr" ? "Importer" : "Import")}
            </button>
          ))}
        </div>

        {/* Export Panel */}
        {activeTab === "export" && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="material-icons" style={{ color: ACCENT }}>file_download</span>
              {lang === "fr" ? "Exporter le contenu" : "Export Content"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Entity Type */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  {lang === "fr" ? "Type de contenu" : "Content Type"}
                </label>
                <select
                  value={exportConfig.entityType}
                  onChange={(e) => setExportConfig({ ...exportConfig, entityType: e.target.value as EntityType })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-300 outline-none"
                >
                  <option value="programs">{lang === "fr" ? "Programmes" : "Programs"}</option>
                  <option value="paths">{lang === "fr" ? "Parcours" : "Paths"}</option>
                  <option value="modules">Modules</option>
                  <option value="lessons">{lang === "fr" ? "Leçons" : "Lessons"}</option>
                </select>
              </div>

              {/* Format */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Format</label>
                <div className="flex gap-2">
                  {(["json", "csv"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setExportConfig({ ...exportConfig, format: fmt })}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
                        exportConfig.format === fmt
                          ? "border-red-300 bg-red-50 text-red-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scope filters */}
              {(exportConfig.entityType === "paths" || exportConfig.entityType === "modules" || exportConfig.entityType === "lessons") && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    {lang === "fr" ? "Programme" : "Program"}
                  </label>
                  <select
                    value={exportConfig.programId ?? ""}
                    onChange={(e) => setExportConfig({ ...exportConfig, programId: e.target.value ? Number(e.target.value) : undefined, pathId: undefined, moduleId: undefined })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-300 outline-none"
                  >
                    <option value="">{lang === "fr" ? "Tous les programmes" : "All Programs"}</option>
                    {(programsQuery.data ?? []).map((p: any) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              )}

              {(exportConfig.entityType === "modules" || exportConfig.entityType === "lessons") && exportConfig.programId && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    {lang === "fr" ? "Parcours" : "Path"}
                  </label>
                  <select
                    value={exportConfig.pathId ?? ""}
                    onChange={(e) => setExportConfig({ ...exportConfig, pathId: e.target.value ? Number(e.target.value) : undefined, moduleId: undefined })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-300 outline-none"
                  >
                    <option value="">{lang === "fr" ? "Tous les parcours" : "All Paths"}</option>
                    {(pathsQuery.data ?? []).map((p: any) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              )}

              {exportConfig.entityType === "lessons" && exportConfig.pathId && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Module</label>
                  <select
                    value={exportConfig.moduleId ?? ""}
                    onChange={(e) => setExportConfig({ ...exportConfig, moduleId: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-300 outline-none"
                  >
                    <option value="">{lang === "fr" ? "Tous les modules" : "All Modules"}</option>
                    {(modulesQuery.data ?? []).map((m: any) => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Export Preview */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-xs text-gray-500 mb-2">
                {lang === "fr" ? "Aperçu" : "Preview"}: {getExportData().length} {lang === "fr" ? "enregistrements" : "records"}
              </p>
              <div className="max-h-48 overflow-auto">
                <pre className="text-[11px] text-gray-600 font-mono">
                  {exportConfig.format === "json"
                    ? JSON.stringify(getExportData().slice(0, 2), null, 2)
                    : convertToCSV(getExportData().slice(0, 3))}
                </pre>
              </div>
            </div>

            {/* Export Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                disabled={!getExportData().length}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: ACCENT }}
              >
                <span className="material-icons text-lg">file_download</span>
                {lang === "fr" ? "Télécharger" : "Download"} {exportConfig.format.toUpperCase()}
              </button>
              {exportStatus.type !== "idle" && (
                <span className={`text-xs font-medium ${
                  exportStatus.type === "success" ? "text-green-600" :
                  exportStatus.type === "error" ? "text-red-600" : "text-gray-500"
                }`}>
                  {exportStatus.type === "success" && <span className="material-icons text-sm mr-0.5 align-text-bottom">check_circle</span>}
                  {exportStatus.type === "error" && <span className="material-icons text-sm mr-0.5 align-text-bottom">error</span>}
                  {exportStatus.message}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Import Panel */}
        {activeTab === "import" && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="material-icons" style={{ color: ACCENT }}>file_upload</span>
              {lang === "fr" ? "Importer du contenu" : "Import Content"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Entity Type */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  {lang === "fr" ? "Type de contenu" : "Content Type"}
                </label>
                <select
                  value={importEntityType}
                  onChange={(e) => setImportEntityType(e.target.value as EntityType)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-300 outline-none"
                >
                  <option value="programs">{lang === "fr" ? "Programmes" : "Programs"}</option>
                  <option value="paths">{lang === "fr" ? "Parcours" : "Paths"}</option>
                  <option value="modules">Modules</option>
                  <option value="lessons">{lang === "fr" ? "Leçons" : "Lessons"}</option>
                </select>
              </div>

              {/* Format */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Format</label>
                <div className="flex gap-2">
                  {(["json", "csv"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => { setImportFormat(fmt); setImportFile(null); setImportPreview(null); }}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
                        importFormat === fmt
                          ? "border-red-300 bg-red-50 text-red-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-red-300 hover:bg-red-50/30 transition-all mb-4"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={importFormat === "json" ? ".json" : ".csv"}
                onChange={handleFileSelect}
                className="hidden"
              />
              <span className="material-icons text-4xl text-gray-300 mb-2">cloud_upload</span>
              <p className="text-sm text-gray-600 font-medium">
                {importFile
                  ? importFile.name
                  : (lang === "fr"
                    ? `Cliquez pour sélectionner un fichier ${importFormat.toUpperCase()}`
                    : `Click to select a ${importFormat.toUpperCase()} file`)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {lang === "fr"
                  ? "Les enregistrements avec un ID seront mis à jour, les autres seront créés"
                  : "Records with an ID will be updated, others will be created"}
              </p>
            </div>

            {/* Import Preview */}
            {importPreview && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-xs text-gray-500 mb-2">
                  {lang === "fr" ? "Aperçu (5 premiers)" : "Preview (first 5)"}:
                </p>
                <div className="max-h-48 overflow-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-gray-200">
                        {Object.keys(importPreview[0] || {}).slice(0, 6).map((key: string) => (
                          <th key={key} className="text-left py-1 px-2 font-semibold text-gray-600">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.map((row: any, i: number) => (
                        <tr key={i} className="border-b border-gray-100">
                          {Object.keys(row).slice(0, 6).map((key: string) => (
                            <td key={key} className="py-1 px-2 text-gray-500 truncate max-w-[120px]">
                              {String(row[key] ?? "").slice(0, 50)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Import Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleImport}
                disabled={!importFile || importStatus.type === "loading"}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: ACCENT }}
              >
                {importStatus.type === "loading" ? (
                  <span className="material-icons text-lg animate-spin">sync</span>
                ) : (
                  <span className="material-icons text-lg">file_upload</span>
                )}
                {importStatus.type === "loading"
                  ? (lang === "fr" ? "Importation..." : "Importing...")
                  : (lang === "fr" ? "Importer" : "Import")}
              </button>
              {importStatus.message && (
                <span className={`text-xs font-medium ${
                  importStatus.type === "success" ? "text-green-600" :
                  importStatus.type === "error" ? "text-red-600" : "text-gray-500"
                }`}>
                  {importStatus.type === "success" && <span className="material-icons text-sm mr-0.5 align-text-bottom">check_circle</span>}
                  {importStatus.type === "error" && <span className="material-icons text-sm mr-0.5 align-text-bottom">error</span>}
                  {importStatus.message}
                </span>
              )}
            </div>

            {/* Import Guide */}
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-1.5">
                <span className="material-icons text-base">info</span>
                {lang === "fr" ? "Guide d'importation" : "Import Guide"}
              </h3>
              <div className="text-xs text-blue-800 space-y-1.5">
                <p>
                  <strong>{lang === "fr" ? "Création" : "Create"}:</strong>{" "}
                  {lang === "fr"
                    ? "Omettez le champ 'id' pour créer de nouveaux enregistrements."
                    : "Omit the 'id' field to create new records."}
                </p>
                <p>
                  <strong>{lang === "fr" ? "Mise à jour" : "Update"}:</strong>{" "}
                  {lang === "fr"
                    ? "Incluez le champ 'id' pour mettre à jour des enregistrements existants."
                    : "Include the 'id' field to update existing records."}
                </p>
                <p>
                  <strong>{lang === "fr" ? "Champs requis" : "Required fields"}:</strong>{" "}
                  {importEntityType === "programs" && "slug, title, titleFr"}
                  {importEntityType === "paths" && "programId, slug, number, title, titleFr, cefrLevel"}
                  {importEntityType === "modules" && "pathId, title, titleFr"}
                  {importEntityType === "lessons" && "moduleId, lessonNumber, title, titleFr"}
                </p>
                <p>
                  <strong>{lang === "fr" ? "Astuce" : "Tip"}:</strong>{" "}
                  {lang === "fr"
                    ? "Exportez d'abord les données existantes pour voir le format attendu."
                    : "Export existing data first to see the expected format."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminControlLayout>
  );
}
