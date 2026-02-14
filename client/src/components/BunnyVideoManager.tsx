/**
 * BunnyVideoManager
 *
 * A comprehensive video management component for the Course Builder.
 * Provides two modes:
 * 1. Browse & select from existing Bunny Stream library videos
 * 2. Upload new videos with TUS resumable upload + progress tracking
 *
 * Used within the CourseBuilder when creating/editing video-type activities.
 */

import { useState, useRef, useCallback } from "react";
import * as tus from "tus-js-client";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Video,
  Upload,
  Search,
  Check,
  Loader2,
  Film,
  Clock,
  HardDrive,
  Eye,
  X,
  Play,
  AlertCircle,
} from "lucide-react";

interface BunnyVideoManagerProps {
  /** Currently selected video ID */
  selectedVideoId?: string | null;
  /** Callback when a video is selected */
  onSelect: (video: {
    videoId: string;
    title: string;
    embedUrl: string;
    thumbnailUrl: string;
    duration: number;
  }) => void;
  /** Callback when selection is cleared */
  onClear?: () => void;
  /** Whether the component is in compact mode (inline) */
  compact?: boolean;
}

export function BunnyVideoManager({
  selectedVideoId,
  onSelect,
  onClear,
  compact = false,
}: BunnyVideoManagerProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<string>("browse");

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<tus.Upload | null>(null);

  // tRPC queries
  const videosQuery = trpc.bunnyStream.list.useQuery(
    { page, itemsPerPage: 20, search: searchQuery || undefined },
    { enabled: open }
  );

  const selectedVideoQuery = trpc.bunnyStream.get.useQuery(
    { videoId: selectedVideoId! },
    { enabled: !!selectedVideoId }
  );

  const createVideoMutation = trpc.bunnyStream.create.useMutation();

  // ─── Upload Logic ─────────────────────────────────────────────────────────

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      const validTypes = [
        "video/mp4",
        "video/webm",
        "video/quicktime",
        "video/x-msvideo",
        "video/x-matroska",
        "video/x-flv",
        "video/ogg",
      ];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|webm|mov|avi|mkv|flv|ogg|m4v|wmv|mpeg|mpg)$/i)) {
        setUploadError("Unsupported file format. Please use MP4, WebM, MOV, AVI, MKV, or similar.");
        return;
      }

      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
      setUploadError(null);
    },
    []
  );

  const startUpload = useCallback(async () => {
    if (!uploadFile || !uploadTitle.trim()) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Step 1: Create video placeholder in Bunny Stream
      const result = await createVideoMutation.mutateAsync({
        title: uploadTitle.trim(),
      });

      const { tusCredentials } = result;

      // Step 2: Start TUS resumable upload
      const upload = new tus.Upload(uploadFile, {
        endpoint: tusCredentials.tusEndpoint,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          AuthorizationSignature: tusCredentials.authorizationSignature,
          AuthorizationExpire: String(tusCredentials.authorizationExpire),
          VideoId: tusCredentials.videoId,
          LibraryId: tusCredentials.libraryId,
        },
        metadata: {
          filetype: uploadFile.type,
          title: uploadTitle.trim(),
        },
        onError: (error) => {
          console.error("TUS upload error:", error);
          setUploadError(
            error.message || "Upload failed. Please try again."
          );
          setIsUploading(false);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
          setUploadProgress(percentage);
        },
        onSuccess: () => {
          setIsUploading(false);
          setUploadProgress(100);

          // Select the newly uploaded video
          onSelect({
            videoId: result.video.guid,
            title: uploadTitle.trim(),
            embedUrl: result.video.embedUrl,
            thumbnailUrl: result.video.thumbnailUrl,
            duration: 0, // Will be available after encoding
          });

          // Reset upload state
          setUploadFile(null);
          setUploadTitle("");
          setUploadProgress(0);

          // Refresh the video list
          videosQuery.refetch();

          // Close dialog
          setOpen(false);
        },
      });

      uploadRef.current = upload;

      // Check for previous uploads to resume
      upload.findPreviousUploads().then((previousUploads) => {
        if (previousUploads.length) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }
        upload.start();
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create video";
      setUploadError(message);
      setIsUploading(false);
    }
  }, [uploadFile, uploadTitle, createVideoMutation, onSelect, videosQuery]);

  const cancelUpload = useCallback(() => {
    if (uploadRef.current) {
      uploadRef.current.abort();
    }
    setIsUploading(false);
    setUploadProgress(0);
    setUploadFile(null);
    setUploadTitle("");
    setUploadError(null);
  }, []);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function formatDuration(seconds: number): string {
    if (!seconds) return "—";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function formatSize(bytes: number): string {
    if (!bytes) return "—";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  function getStatusColor(status: number): string {
    switch (status) {
      case 4:
        return "bg-green-500/10 text-green-700 border-green-200";
      case 2:
      case 3:
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      case 5:
      case 6:
        return "bg-red-500/10 text-red-700 border-red-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  }

  // ─── Selected Video Preview ───────────────────────────────────────────────

  const selectedVideo = selectedVideoQuery.data;

  if (compact && selectedVideoId && selectedVideo) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
        <div className="relative w-24 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
          <img
            src={selectedVideo.thumbnailUrl}
            alt={selectedVideo.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Play className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{selectedVideo.title}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <Clock className="w-3 h-3" />
            <span>{formatDuration(selectedVideo.length)}</span>
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 ${getStatusColor(selectedVideo.status)}`}
            >
              {selectedVideo.statusLabel}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(true)}
            className="h-8 px-2"
          >
            Change
          </Button>
          {onClear && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Dialog for changing video */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Film className="w-5 h-5" />
                Select Video
              </DialogTitle>
            </DialogHeader>
            <VideoManagerContent
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              page={page}
              setPage={setPage}
              videosQuery={videosQuery}
              selectedVideoId={selectedVideoId}
              onSelect={(v) => {
                onSelect(v);
                setOpen(false);
              }}
              uploadFile={uploadFile}
              uploadTitle={uploadTitle}
              setUploadTitle={setUploadTitle}
              uploadProgress={uploadProgress}
              isUploading={isUploading}
              uploadError={uploadError}
              handleFileSelect={handleFileSelect}
              startUpload={startUpload}
              cancelUpload={cancelUpload}
              fileInputRef={fileInputRef}
              formatDuration={formatDuration}
              formatSize={formatSize}
              getStatusColor={getStatusColor}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ─── Full Mode (Button + Dialog) ─────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 w-full justify-start">
          {selectedVideoId ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              <span className="truncate">
                {selectedVideo?.title || "Video selected"}
              </span>
            </>
          ) : (
            <>
              <Video className="w-4 h-4" />
              Select or Upload Video
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Film className="w-5 h-5" />
            Video Library
          </DialogTitle>
        </DialogHeader>
        <VideoManagerContent
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          page={page}
          setPage={setPage}
          videosQuery={videosQuery}
          selectedVideoId={selectedVideoId}
          onSelect={(v) => {
            onSelect(v);
            setOpen(false);
          }}
          uploadFile={uploadFile}
          uploadTitle={uploadTitle}
          setUploadTitle={setUploadTitle}
          uploadProgress={uploadProgress}
          isUploading={isUploading}
          uploadError={uploadError}
          handleFileSelect={handleFileSelect}
          startUpload={startUpload}
          cancelUpload={cancelUpload}
          fileInputRef={fileInputRef}
          formatDuration={formatDuration}
          formatSize={formatSize}
          getStatusColor={getStatusColor}
        />
      </DialogContent>
    </Dialog>
  );
}

// ─── Inner Content Component ──────────────────────────────────────────────

interface VideoManagerContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  page: number;
  setPage: (p: number) => void;
  videosQuery: ReturnType<typeof trpc.bunnyStream.list.useQuery>;
  selectedVideoId?: string | null;
  onSelect: (video: {
    videoId: string;
    title: string;
    embedUrl: string;
    thumbnailUrl: string;
    duration: number;
  }) => void;
  uploadFile: File | null;
  uploadTitle: string;
  setUploadTitle: (t: string) => void;
  uploadProgress: number;
  isUploading: boolean;
  uploadError: string | null;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  startUpload: () => void;
  cancelUpload: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  formatDuration: (s: number) => string;
  formatSize: (b: number) => string;
  getStatusColor: (s: number) => string;
}

function VideoManagerContent({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  page,
  setPage,
  videosQuery,
  selectedVideoId,
  onSelect,
  uploadFile,
  uploadTitle,
  setUploadTitle,
  uploadProgress,
  isUploading,
  uploadError,
  handleFileSelect,
  startUpload,
  cancelUpload,
  fileInputRef,
  formatDuration,
  formatSize,
  getStatusColor,
}: VideoManagerContentProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="browse" className="gap-2">
          <Search className="w-4 h-4" />
          Browse Library
        </TabsTrigger>
        <TabsTrigger value="upload" className="gap-2">
          <Upload className="w-4 h-4" />
          Upload New
        </TabsTrigger>
      </TabsList>

      {/* Browse Tab */}
      <TabsContent value="browse" className="mt-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>

        {/* Video Grid */}
        <ScrollArea className="h-[400px]">
          {videosQuery.isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : videosQuery.data?.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Film className="w-10 h-10 mb-2 opacity-50" />
              <p>No videos found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {videosQuery.data?.items.map((video) => (
                <button
                  key={video.guid}
                  onClick={() =>
                    onSelect({
                      videoId: video.guid,
                      title: video.title,
                      embedUrl: video.embedUrl,
                      thumbnailUrl: video.thumbnailUrl,
                      duration: video.length,
                    })
                  }
                  className={`group relative rounded-lg border overflow-hidden text-left transition-all hover:ring-2 hover:ring-primary/50 ${
                    selectedVideoId === video.guid
                      ? "ring-2 ring-primary border-primary"
                      : "border-border"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-muted">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {/* Duration badge */}
                    {video.length > 0 && (
                      <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                        {formatDuration(video.length)}
                      </span>
                    )}
                    {/* Selected check */}
                    {selectedVideoId === video.guid && (
                      <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-2">
                    <p className="text-xs font-medium line-clamp-2 leading-tight">
                      {video.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={`text-[9px] px-1 py-0 ${getStatusColor(video.status)}`}
                      >
                        {video.statusLabel}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Eye className="w-2.5 h-2.5" />
                        {video.views}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <HardDrive className="w-2.5 h-2.5" />
                        {formatSize(video.storageSize)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Pagination */}
        {videosQuery.data && videosQuery.data.totalItems > 20 && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            <span className="text-xs text-muted-foreground">
              {videosQuery.data.totalItems} videos total
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={
                  page * 20 >= (videosQuery.data?.totalItems || 0)
                }
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </TabsContent>

      {/* Upload Tab */}
      <TabsContent value="upload" className="mt-4">
        <div className="space-y-4">
          {/* File selection */}
          {!uploadFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-colors"
            >
              <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium">
                Click to select a video file
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                MP4, WebM, MOV, AVI, MKV — up to 5 GB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,.mp4,.webm,.mov,.avi,.mkv,.flv,.ogg,.m4v,.wmv,.mpeg,.mpg"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* File info */}
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <Film className="w-8 h-8 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {uploadFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(uploadFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
                {!isUploading && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setUploadFile(null);
                      setUploadTitle("");
                    }}
                    className="h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Title input */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Video Title
                </label>
                <Input
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Enter video title..."
                  disabled={isUploading}
                />
              </div>

              {/* Progress bar */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Uploading...</span>
                    <span className="font-medium">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error message */}
              {uploadError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>{uploadError}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                {isUploading ? (
                  <Button
                    variant="destructive"
                    onClick={cancelUpload}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel Upload
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={startUpload}
                      disabled={!uploadTitle.trim()}
                      className="gap-2 flex-1"
                    >
                      <Upload className="w-4 h-4" />
                      Start Upload
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setUploadFile(null);
                        setUploadTitle("");
                        setUploadError(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}

export default BunnyVideoManager;
