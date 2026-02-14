/**
 * MediaLibraryPicker — Modal component for browsing and selecting images
 * from the existing Media Library within the Visual Editor.
 * 
 * Features:
 * - Grid view of all media assets with thumbnails
 * - Search by filename, alt text, or tags
 * - Filter by folder
 * - Filter by MIME type (images only, all media)
 * - Pagination with infinite scroll feel
 * - Click to select, double-click to confirm
 * - Preview selected image with metadata
 * - Direct URL input fallback
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, Image as ImageIcon, FolderOpen, Check, X, ExternalLink,
  FileImage, FileVideo, FileAudio, File, Link as LinkIcon, Upload,
  ChevronLeft, ChevronRight, Grid3X3, LayoutList,
} from "lucide-react";

interface MediaLibraryPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string, metadata?: { fileName?: string; altText?: string; mimeType?: string }) => void;
  /** Filter to show only specific MIME types */
  mimeFilter?: string;
  /** Dialog title */
  title?: string;
}

function getFileIcon(mimeType: string) {
  if (mimeType?.startsWith("image/")) return <FileImage className="h-4 w-4 text-blue-500" />;
  if (mimeType?.startsWith("video/")) return <FileVideo className="h-4 w-4 text-purple-500" />;
  if (mimeType?.startsWith("audio/")) return <FileAudio className="h-4 w-4 text-green-500" />;
  return <File className="h-4 w-4 text-gray-500" />;
}

function formatFileSize(bytes: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibraryPicker({
  open,
  onClose,
  onSelect,
  mimeFilter = "image/",
  title = "Select Media",
}: MediaLibraryPickerProps) {
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [urlInput, setUrlInput] = useState("");
  const [activeTab, setActiveTab] = useState<string>("library");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const ITEMS_PER_PAGE = 24;

  // Fetch media items
  const mediaQuery = trpc.mediaLibrary.list.useQuery(
    {
      search: search || undefined,
      folder: folder !== "all" ? folder : undefined,
      mimeType: mimeFilter || undefined,
      limit: ITEMS_PER_PAGE,
      offset: page * ITEMS_PER_PAGE,
    },
    { enabled: open }
  );

  // Fetch folders for filter
  const foldersQuery = trpc.mediaLibrary.getFolders.useQuery(undefined, { enabled: open });

  const items = mediaQuery.data?.items || [];
  const total = mediaQuery.data?.total || 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const folders = (foldersQuery.data || []) as Array<{ folder: string; count: number }>;

  const handleSelect = (item: any) => {
    setSelectedItem(item);
  };

  const handleConfirm = () => {
    if (activeTab === "url") {
      if (urlInput.trim()) {
        onSelect(urlInput.trim());
        handleClose();
      }
    } else if (selectedItem) {
      onSelect(selectedItem.url, {
        fileName: selectedItem.fileName,
        altText: selectedItem.altText,
        mimeType: selectedItem.mimeType,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedItem(null);
    setSearch("");
    setFolder("all");
    setPage(0);
    setUrlInput("");
    setActiveTab("library");
    onClose();
  };

  const isImage = (mimeType: string) => mimeType?.startsWith("image/");

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-indigo-600" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-3 shrink-0">
            <TabsList className="h-9">
              <TabsTrigger value="library" className="text-xs gap-1.5">
                <FolderOpen className="h-3.5 w-3.5" /> Media Library
              </TabsTrigger>
              <TabsTrigger value="url" className="text-xs gap-1.5">
                <LinkIcon className="h-3.5 w-3.5" /> URL
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="library" className="flex-1 flex flex-col overflow-hidden mt-0 px-6 pb-0">
            {/* Search & Filters */}
            <div className="flex items-center gap-3 py-3 shrink-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                  placeholder="Search by name, alt text, or tags..."
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <Select value={folder} onValueChange={(v) => { setFolder(v); setPage(0); }}>
                <SelectTrigger className="w-40 h-9 text-sm">
                  <SelectValue placeholder="All folders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Folders</SelectItem>
                  {folders.map((f) => (
                    <SelectItem key={f.folder} value={f.folder}>
                      {f.folder} ({f.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 ${viewMode === "grid" ? "bg-gray-100 text-gray-900" : "text-gray-400"}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 ${viewMode === "list" ? "bg-gray-100 text-gray-900" : "text-gray-400"}`}
                >
                  <LayoutList className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Media Grid/List */}
            <div className="flex-1 flex gap-4 overflow-hidden pb-3">
              {/* Items */}
              <ScrollArea className="flex-1">
                {mediaQuery.isLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
                  </div>
                ) : items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                    <ImageIcon className="h-10 w-10 mb-2" />
                    <p className="text-sm">No media found</p>
                    <p className="text-xs mt-1">Try adjusting your search or filters</p>
                  </div>
                ) : viewMode === "grid" ? (
                  <div className="grid grid-cols-4 gap-3">
                    {items.map((item: any) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        onDoubleClick={() => { handleSelect(item); setTimeout(handleConfirm, 50); }}
                        className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedItem?.id === item.id
                            ? "border-indigo-500 ring-2 ring-indigo-200"
                            : "border-transparent hover:border-gray-300"
                        }`}
                      >
                        {isImage(item.mimeType) ? (
                          <img
                            src={item.url}
                            alt={item.altText || item.fileName}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
                            {getFileIcon(item.mimeType)}
                            <span className="text-xs text-gray-500 mt-1 px-2 truncate w-full text-center">{item.fileName}</span>
                          </div>
                        )}
                        {selectedItem?.id === item.id && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                            <Check className="h-3.5 w-3.5 text-white" />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-xs text-white truncate">{item.fileName}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {items.map((item: any) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        onDoubleClick={() => { handleSelect(item); setTimeout(handleConfirm, 50); }}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                          selectedItem?.id === item.id
                            ? "bg-indigo-50 border border-indigo-200"
                            : "hover:bg-gray-50 border border-transparent"
                        }`}
                      >
                        {isImage(item.mimeType) ? (
                          <img src={item.url} alt={item.altText || item.fileName} className="w-10 h-10 rounded object-cover" loading="lazy" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                            {getFileIcon(item.mimeType)}
                          </div>
                        )}
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium truncate">{item.fileName}</p>
                          <p className="text-xs text-gray-400">{item.mimeType} · {formatFileSize(item.fileSize)}</p>
                        </div>
                        {selectedItem?.id === item.id && (
                          <Check className="h-4 w-4 text-indigo-500" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Preview Panel */}
              {selectedItem && (
                <div className="w-56 shrink-0 border-l pl-4 flex flex-col">
                  <div className="space-y-3">
                    {isImage(selectedItem.mimeType) ? (
                      <div className="aspect-square rounded-lg overflow-hidden border bg-gray-50">
                        <img src={selectedItem.url} alt={selectedItem.altText || selectedItem.fileName} className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="aspect-square rounded-lg border bg-gray-50 flex items-center justify-center">
                        {getFileIcon(selectedItem.mimeType)}
                      </div>
                    )}
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs text-gray-500">Filename</Label>
                        <p className="text-sm font-medium truncate">{selectedItem.fileName}</p>
                      </div>
                      {selectedItem.altText && (
                        <div>
                          <Label className="text-xs text-gray-500">Alt Text</Label>
                          <p className="text-xs text-gray-600">{selectedItem.altText}</p>
                        </div>
                      )}
                      <div className="flex gap-3">
                        <div>
                          <Label className="text-xs text-gray-500">Type</Label>
                          <p className="text-xs">{selectedItem.mimeType}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Size</Label>
                          <p className="text-xs">{formatFileSize(selectedItem.fileSize)}</p>
                        </div>
                      </div>
                      {selectedItem.folder && (
                        <div>
                          <Label className="text-xs text-gray-500">Folder</Label>
                          <Badge variant="outline" className="text-xs">{selectedItem.folder}</Badge>
                        </div>
                      )}
                      {selectedItem.tags && (
                        <div>
                          <Label className="text-xs text-gray-500">Tags</Label>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {selectedItem.tags.split(",").map((tag: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">{tag.trim()}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between py-2 border-t shrink-0">
                <p className="text-xs text-gray-500">
                  Showing {page * ITEMS_PER_PAGE + 1}–{Math.min((page + 1) * ITEMS_PER_PAGE, total)} of {total}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0"
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <span className="text-xs text-gray-500 px-2">
                    {page + 1} / {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="url" className="flex-1 flex flex-col mt-0 px-6 py-6">
            <div className="space-y-4 max-w-lg">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Image URL</Label>
                <Input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="text-sm"
                />
                <p className="text-xs text-gray-500">
                  Enter a direct URL to an image. Supports JPEG, PNG, WebP, GIF, and SVG formats.
                </p>
              </div>
              {urlInput && (
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Preview</Label>
                  <div className="w-48 h-48 rounded-lg border overflow-hidden bg-gray-50">
                    <img
                      src={urlInput}
                      alt="Preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="px-6 py-3 border-t shrink-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={activeTab === "library" ? !selectedItem : !urlInput.trim()}
            className="gap-1.5"
          >
            <Check className="h-4 w-4" />
            {activeTab === "url" ? "Use URL" : "Select"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
