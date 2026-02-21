/**
 * AdminMedia — Media Library for Admin Control System
 * Drag-and-drop upload to S3, browse, filter by category, delete
 */
import AdminControlLayout from "@/components/AdminControlLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useState, useCallback, useRef } from "react";

const ACCENT = "#dc2626";

type Category = "cover" | "badge" | "lesson_image" | "audio" | "video" | "document" | "other";

const CATEGORIES: { value: Category | "all"; labelEn: string; labelFr: string; icon: string }[] = [
  { value: "all", labelEn: "All Files", labelFr: "Tous les fichiers", icon: "folder" },
  { value: "cover", labelEn: "Covers", labelFr: "Couvertures", icon: "image" },
  { value: "badge", labelEn: "Badges", labelFr: "Badges", icon: "military_tech" },
  { value: "lesson_image", labelEn: "Lesson Images", labelFr: "Images de leçon", icon: "photo_library" },
  { value: "audio", labelEn: "Audio", labelFr: "Audio", icon: "audiotrack" },
  { value: "video", labelEn: "Video", labelFr: "Vidéo", icon: "videocam" },
  { value: "document", labelEn: "Documents", labelFr: "Documents", icon: "description" },
  { value: "other", labelEn: "Other", labelFr: "Autre", icon: "attachment" },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getMimeIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("audio/")) return "audiotrack";
  if (mimeType.startsWith("video/")) return "videocam";
  if (mimeType.includes("pdf")) return "picture_as_pdf";
  return "insert_drive_file";
}

export default function AdminMedia() {
  const { lang } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<Category>("lesson_image");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const mediaQuery = trpc.cms.media.list.useQuery(
    selectedCategory === "all" ? undefined : { category: selectedCategory }
  );
  const uploadMutation = trpc.cms.media.upload.useMutation({
    onSuccess: () => utils.cms.media.list.invalidate(),
  });
  const deleteMutation = trpc.cms.media.delete.useMutation({
    onSuccess: () => {
      utils.cms.media.list.invalidate();
      setShowDeleteConfirm(null);
      setSelectedAsset(null);
    },
  });

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setUploading(true);
    setUploadProgress([]);

    for (const file of fileArray) {
      try {
        setUploadProgress((prev) => [...prev, `Uploading ${file.name}...`]);
        const buffer = await file.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
        );
        await uploadMutation.mutateAsync({
          filename: file.name,
          base64Data: base64,
          mimeType: file.type || "application/octet-stream",
          category: uploadCategory,
        });
        setUploadProgress((prev) => [
          ...prev.slice(0, -1),
          `✓ ${file.name} uploaded successfully`,
        ]);
      } catch (err: any) {
        setUploadProgress((prev) => [
          ...prev.slice(0, -1),
          `✗ ${file.name} failed: ${err.message}`,
        ]);
      }
    }
    setUploading(false);
  }, [uploadCategory, uploadMutation]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const assets = mediaQuery.data ?? [];

  return (
    <AdminControlLayout>
      <div className="p-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              {lang === "fr" ? "Médiathèque" : "Media Library"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {lang === "fr"
                ? `${assets.length} fichier${assets.length !== 1 ? "s" : ""} • Glissez-déposez pour téléverser`
                : `${assets.length} file${assets.length !== 1 ? "s" : ""} • Drag & drop to upload`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
            >
              <span className="material-icons text-lg">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
            >
              <span className="material-icons text-lg">view_list</span>
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Left: Category Filter */}
          <div className="w-[200px] flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
                {lang === "fr" ? "CATÉGORIES" : "CATEGORIES"}
              </p>
              <div className="space-y-0.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all ${
                      selectedCategory === cat.value
                        ? "text-white font-semibold"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                    style={selectedCategory === cat.value ? { backgroundColor: ACCENT } : {}}
                  >
                    <span className="material-icons text-base">{cat.icon}</span>
                    {lang === "fr" ? cat.labelFr : cat.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Category Selector */}
            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm mt-4">
              <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
                {lang === "fr" ? "CATÉGORIE D'UPLOAD" : "UPLOAD CATEGORY"}
              </p>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value as Category)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                {CATEGORIES.filter((c) => c.value !== "all").map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {lang === "fr" ? cat.labelFr : cat.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Content Area */}
          <div className="flex-1 min-w-0">
            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all mb-6 ${
                isDragging
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
              <span className="material-icons text-3xl mb-2" style={{ color: isDragging ? ACCENT : "#9ca3af" }}>
                cloud_upload
              </span>
              <p className={`text-sm font-medium ${isDragging ? "text-red-600" : "text-gray-600"}`}>
                {isDragging
                  ? lang === "fr" ? "Déposez les fichiers ici" : "Drop files here"
                  : lang === "fr" ? "Glissez-déposez ou cliquez pour sélectionner" : "Drag & drop or click to select files"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {lang === "fr" ? "Images, audio, vidéo, documents (max 10 MB)" : "Images, audio, video, documents (max 10 MB)"}
              </p>
            </div>

            {/* Upload Progress */}
            {uploadProgress.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 shadow-sm">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {uploading ? (lang === "fr" ? "Téléversement en cours..." : "Uploading...") : (lang === "fr" ? "Terminé" : "Complete")}
                </p>
                <div className="space-y-1">
                  {uploadProgress.map((msg, i) => (
                    <p key={i} className={`text-sm ${msg.startsWith("✓") ? "text-green-600" : msg.startsWith("✗") ? "text-red-600" : "text-gray-600"}`}>
                      {msg}
                    </p>
                  ))}
                </div>
                {!uploading && (
                  <button
                    onClick={() => setUploadProgress([])}
                    className="text-xs text-gray-400 hover:text-gray-600 mt-2 transition-colors"
                  >
                    {lang === "fr" ? "Fermer" : "Dismiss"}
                  </button>
                )}
              </div>
            )}

            {/* Loading */}
            {mediaQuery.isLoading && (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-red-500 rounded-full animate-spin" />
              </div>
            )}

            {/* Empty State */}
            {!mediaQuery.isLoading && assets.length === 0 && (
              <div className="text-center py-20">
                <span className="material-icons text-5xl text-gray-200 mb-3">perm_media</span>
                <p className="text-gray-500 font-medium">
                  {lang === "fr" ? "Aucun fichier trouvé" : "No files found"}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {lang === "fr" ? "Téléversez des fichiers pour commencer" : "Upload files to get started"}
                </p>
              </div>
            )}

            {/* Grid View */}
            {!mediaQuery.isLoading && assets.length > 0 && viewMode === "grid" && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {assets.map((asset: any) => (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className={`bg-white rounded-xl border overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                      selectedAsset?.id === asset.id ? "ring-2 ring-red-400 border-red-200" : "border-gray-100"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                      {asset.mimeType?.startsWith("image/") ? (
                        <img src={asset.fileUrl} alt={asset.altText || asset.filename} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-icons text-4xl text-gray-300">{getMimeIcon(asset.mimeType || "")}</span>
                      )}
                    </div>
                    {/* Info */}
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900 truncate">{asset.filename}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-400">{formatFileSize(asset.fileSizeBytes || 0)}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{asset.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {!mediaQuery.isLoading && assets.length > 0 && viewMode === "list" && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                        {lang === "fr" ? "Fichier" : "File"}
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                        {lang === "fr" ? "Type" : "Type"}
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                        {lang === "fr" ? "Catégorie" : "Category"}
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                        {lang === "fr" ? "Taille" : "Size"}
                      </th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map((asset: any) => (
                      <tr
                        key={asset.id}
                        onClick={() => setSelectedAsset(asset)}
                        className={`border-b border-gray-50 cursor-pointer transition-colors ${
                          selectedAsset?.id === asset.id ? "bg-red-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {asset.mimeType?.startsWith("image/") ? (
                                <img src={asset.fileUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="material-icons text-lg text-gray-400">{getMimeIcon(asset.mimeType || "")}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{asset.filename}</p>
                              {asset.altText && <p className="text-xs text-gray-400 truncate">{asset.altText}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{asset.mimeType?.split("/")[1] || "—"}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{asset.category}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatFileSize(asset.fileSizeBytes || 0)}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(asset.id); }}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <span className="material-icons text-lg">delete_outline</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right: Asset Detail Panel */}
          {selectedAsset && (
            <div className="w-[280px] flex-shrink-0">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden sticky top-6">
                {/* Preview */}
                <div className="aspect-video bg-gray-50 flex items-center justify-center overflow-hidden">
                  {selectedAsset.mimeType?.startsWith("image/") ? (
                    <img src={selectedAsset.fileUrl} alt="" className="w-full h-full object-contain" />
                  ) : selectedAsset.mimeType?.startsWith("audio/") ? (
                    <div className="p-4 w-full">
                      <audio controls className="w-full" src={selectedAsset.fileUrl} />
                    </div>
                  ) : selectedAsset.mimeType?.startsWith("video/") ? (
                    <video controls className="w-full h-full" src={selectedAsset.fileUrl} />
                  ) : (
                    <span className="material-icons text-5xl text-gray-300">{getMimeIcon(selectedAsset.mimeType || "")}</span>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 space-y-3">
                  <h3 className="text-sm font-bold text-gray-900 break-all">{selectedAsset.filename}</h3>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">{lang === "fr" ? "Type" : "Type"}</span>
                      <span className="text-gray-700">{selectedAsset.mimeType || "—"}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">{lang === "fr" ? "Taille" : "Size"}</span>
                      <span className="text-gray-700">{formatFileSize(selectedAsset.fileSizeBytes || 0)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">{lang === "fr" ? "Catégorie" : "Category"}</span>
                      <span className="text-gray-700">{selectedAsset.category}</span>
                    </div>
                    {selectedAsset.altText && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Alt text</span>
                        <span className="text-gray-700 text-right max-w-[150px] truncate">{selectedAsset.altText}</span>
                      </div>
                    )}
                  </div>

                  {/* Copy URL */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedAsset.fileUrl);
                    }}
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg py-2 transition-colors"
                  >
                    <span className="material-icons text-base">content_copy</span>
                    {lang === "fr" ? "Copier l'URL" : "Copy URL"}
                  </button>

                  {/* Open in new tab */}
                  <a
                    href={selectedAsset.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg py-2 transition-colors no-underline"
                  >
                    <span className="material-icons text-base">open_in_new</span>
                    {lang === "fr" ? "Ouvrir" : "Open"}
                  </a>

                  {/* Delete */}
                  <button
                    onClick={() => setShowDeleteConfirm(selectedAsset.id)}
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg py-2 transition-colors"
                  >
                    <span className="material-icons text-base">delete</span>
                    {lang === "fr" ? "Supprimer" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm !== null && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowDeleteConfirm(null)}>
            <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="material-icons text-red-600">warning</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {lang === "fr" ? "Confirmer la suppression" : "Confirm Delete"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {lang === "fr" ? "Cette action est irréversible." : "This action cannot be undone."}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {lang === "fr" ? "Annuler" : "Cancel"}
                </button>
                <button
                  onClick={() => deleteMutation.mutate({ id: showDeleteConfirm })}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
                  style={{ backgroundColor: ACCENT }}
                >
                  {deleteMutation.isPending
                    ? lang === "fr" ? "Suppression..." : "Deleting..."
                    : lang === "fr" ? "Supprimer" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminControlLayout>
  );
}
