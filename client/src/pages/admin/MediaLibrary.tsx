import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Image, Upload, Search, FolderOpen, Trash2, Edit2, Copy,
  Loader2, Grid, List, FileImage, FileVideo, FileAudio, File,
  Plus, X, Tag, Link2, Eye
} from "lucide-react";

type ViewMode = "grid" | "list";

export default function MediaLibrary() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editForm, setEditForm] = useState({ altText: "", tags: "", folder: "general" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const listQuery = trpc.mediaLibrary.list.useQuery({
    folder: selectedFolder || undefined,
    search: searchQuery || undefined,
    limit: 100,
  });
  const foldersQuery = trpc.mediaLibrary.getFolders.useQuery();
  const createMut = trpc.mediaLibrary.create.useMutation({ onSuccess: () => { listQuery.refetch(); foldersQuery.refetch(); toast.success("Media uploaded"); } });
  const updateMut = trpc.mediaLibrary.update.useMutation({ onSuccess: () => { listQuery.refetch(); toast.success("Media updated"); } });
  const deleteMut = trpc.mediaLibrary.delete.useMutation({ onSuccess: () => { listQuery.refetch(); foldersQuery.refetch(); toast.success("Media deleted"); } });

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/upload", { method: "POST", body: formData, credentials: "include" });
        if (!response.ok) throw new Error("Upload failed");
        const result = await response.json();
        await createMut.mutateAsync({
          fileName: file.name,
          fileKey: result.key || result.fileKey || file.name,
          url: result.url,
          mimeType: file.type,
          fileSize: file.size,
          folder: selectedFolder || "general",
        });
      }
      setShowUploadDialog(false);
    } catch (err) {
      toast.error("Upload failed. Make sure the upload endpoint is configured.");
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.startsWith("image/")) return FileImage;
    if (mimeType?.startsWith("video/")) return FileVideo;
    if (mimeType?.startsWith("audio/")) return FileAudio;
    return File;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const items = (listQuery.data as any)?.items || [];
  const total = (listQuery.data as any)?.total || 0;
  const folders = (foldersQuery.data as any[] || []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1"><Image className="h-6 w-6 text-blue-600" /><h1 className="text-2xl font-bold">Media Library</h1></div>
            <p className="text-sm text-muted-foreground">Centralized media management — upload, organize, and reuse assets across CMS and courses.</p>
          </div>
          <Button onClick={() => setShowUploadDialog(true)}><Upload className="h-4 w-4 mr-2" /> Upload Media</Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search files..." className="pl-9" />
        </div>
        <Select value={selectedFolder} onValueChange={setSelectedFolder}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Folders" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all-folders">All Folders</SelectItem>
            {folders.map((f: any) => (
              <SelectItem key={f.folder} value={f.folder}>{f.folder} ({f.count})</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex border rounded-md">
          <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" className="h-9 w-9 rounded-r-none" onClick={() => setViewMode("grid")}><Grid className="h-4 w-4" /></Button>
          <Button variant={viewMode === "list" ? "default" : "ghost"} size="icon" className="h-9 w-9 rounded-l-none" onClick={() => setViewMode("list")}><List className="h-4 w-4" /></Button>
        </div>
        <Badge variant="outline" className="text-xs">{total} files</Badge>
      </div>

      {/* Grid / List View */}
      {listQuery.isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center"><Loader2 className="h-5 w-5 animate-spin" /> Loading media...</div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="font-semibold mb-1">No media files yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Upload images, videos, and documents to get started.</p>
            <Button onClick={() => setShowUploadDialog(true)}><Upload className="h-4 w-4 mr-2" /> Upload First File</Button>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item: any) => {
            const Icon = getFileIcon(item.mimeType);
            return (
              <div key={item.id} className="group relative border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => { setSelectedMedia(item); setShowPreviewDialog(true); }}>
                {item.mimeType?.startsWith("image/") ? (
                  <div className="aspect-square bg-muted"><img src={item.url} alt={item.altText || item.fileName} className="w-full h-full object-cover" /></div>
                ) : (
                  <div className="aspect-square bg-muted flex items-center justify-center"><Icon className="h-10 w-10 text-muted-foreground/50" /></div>
                )}
                <div className="p-2">
                  <p className="text-xs font-medium truncate">{item.fileName}</p>
                  <p className="text-xs text-muted-foreground">{formatSize(item.fileSize || 0)}</p>
                </div>
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button variant="secondary" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(item.url); toast.success("URL copied"); }}>
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button variant="secondary" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setSelectedMedia(item); setEditForm({ altText: item.altText || "", tags: item.tags || "", folder: item.folder || "general" }); setShowEditDialog(true); }}>
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              <div className="grid grid-cols-12 gap-3 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/50">
                <span className="col-span-1"></span>
                <span className="col-span-4">File Name</span>
                <span className="col-span-2">Type</span>
                <span className="col-span-1">Size</span>
                <span className="col-span-2">Folder</span>
                <span className="col-span-2">Actions</span>
              </div>
              {items.map((item: any) => {
                const Icon = getFileIcon(item.mimeType);
                return (
                  <div key={item.id} className="grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-muted/30 text-sm">
                    <span className="col-span-1">
                      {item.mimeType?.startsWith("image/") ? (
                        <img src={item.url} alt="" className="w-8 h-8 rounded object-cover" />
                      ) : (
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </span>
                    <span className="col-span-4 truncate font-medium">{item.fileName}</span>
                    <span className="col-span-2"><Badge variant="outline" className="text-xs">{item.mimeType?.split("/")[1] || "file"}</Badge></span>
                    <span className="col-span-1 text-muted-foreground text-xs">{formatSize(item.fileSize || 0)}</span>
                    <span className="col-span-2"><Badge variant="secondary" className="text-xs">{item.folder}</Badge></span>
                    <span className="col-span-2 flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSelectedMedia(item); setShowPreviewDialog(true); }}><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { navigator.clipboard.writeText(item.url); toast.success("URL copied"); }}><Link2 className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSelectedMedia(item); setEditForm({ altText: item.altText || "", tags: item.tags || "", folder: item.folder || "general" }); setShowEditDialog(true); }}><Edit2 className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { if (confirm("Delete this file?")) deleteMut.mutate({ id: item.id }); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload Media</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}>
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground mt-1">Images, videos, PDFs, documents</p>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} accept="image/*,video/*,audio/*,.pdf,.doc,.docx" />
            </div>
            {uploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</div>
            )}
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Close</Button></DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Media Details</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Alt Text</Label><Input value={editForm.altText} onChange={(e) => setEditForm(p => ({ ...p, altText: e.target.value }))} placeholder="Describe this image..." /></div>
            <div className="space-y-1.5"><Label>Tags (comma-separated)</Label><Input value={editForm.tags} onChange={(e) => setEditForm(p => ({ ...p, tags: e.target.value }))} placeholder="e.g. hero, course, banner" /></div>
            <div className="space-y-1.5"><Label>Folder</Label><Input value={editForm.folder} onChange={(e) => setEditForm(p => ({ ...p, folder: e.target.value }))} placeholder="general" /></div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={() => {
              if (!selectedMedia) return;
              updateMut.mutate({ id: selectedMedia.id, ...editForm });
              setShowEditDialog(false);
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{selectedMedia?.fileName}</DialogTitle></DialogHeader>
          {selectedMedia && (
            <div className="space-y-4">
              {selectedMedia.mimeType?.startsWith("image/") ? (
                <img src={selectedMedia.url} alt={selectedMedia.altText || ""} className="w-full rounded-lg max-h-[500px] object-contain bg-muted" />
              ) : selectedMedia.mimeType?.startsWith("video/") ? (
                <video src={selectedMedia.url} controls className="w-full rounded-lg max-h-[500px]" />
              ) : (
                <div className="p-12 bg-muted rounded-lg text-center">
                  <File className="h-16 w-16 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm">{selectedMedia.mimeType}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Size:</span> <span className="font-medium">{formatSize(selectedMedia.fileSize || 0)}</span></div>
                <div><span className="text-muted-foreground">Type:</span> <span className="font-medium">{selectedMedia.mimeType}</span></div>
                <div><span className="text-muted-foreground">Folder:</span> <Badge variant="secondary" className="text-xs">{selectedMedia.folder}</Badge></div>
                <div><span className="text-muted-foreground">Uploaded:</span> <span className="font-medium">{selectedMedia.createdAt ? new Date(selectedMedia.createdAt).toLocaleDateString() : "—"}</span></div>
                {selectedMedia.altText && <div className="col-span-2"><span className="text-muted-foreground">Alt:</span> <span className="font-medium">{selectedMedia.altText}</span></div>}
                {selectedMedia.tags && <div className="col-span-2"><span className="text-muted-foreground">Tags:</span> {selectedMedia.tags.split(",").map((t: string) => <Badge key={t} variant="outline" className="text-xs mr-1">{t.trim()}</Badge>)}</div>}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(selectedMedia.url); toast.success("URL copied"); }}><Link2 className="h-3.5 w-3.5 mr-1" /> Copy URL</Button>
                <Button variant="outline" size="sm" onClick={() => { window.open(selectedMedia.url, "_blank"); }}><Eye className="h-3.5 w-3.5 mr-1" /> Open Full Size</Button>
                <Button variant="destructive" size="sm" className="ml-auto" onClick={() => { if (confirm("Delete?")) { deleteMut.mutate({ id: selectedMedia.id }); setShowPreviewDialog(false); } }}><Trash2 className="h-3.5 w-3.5 mr-1" /> Delete</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
