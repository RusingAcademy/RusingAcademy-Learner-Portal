import { useState, useEffect } from "react";
import { Download, Check, Loader2, Trash2, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface CourseAsset {
  url: string;
  type: "video" | "audio" | "document" | "image";
  title?: string;
}

interface DownloadCourseButtonProps {
  courseId: string;
  courseName: string;
  assets: CourseAsset[];
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const DOWNLOAD_STORAGE_KEY = "downloaded-courses";

export function DownloadCourseButton({
  courseId,
  courseName,
  assets,
  variant = "outline",
  size = "default",
  className,
}: DownloadCourseButtonProps) {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [progress, setProgress] = useState(0);

  // Check if course is already downloaded
  useEffect(() => {
    const downloaded = getDownloadedCourses();
    setIsDownloaded(downloaded.includes(courseId));
  }, [courseId]);

  const getDownloadedCourses = (): string[] => {
    try {
      return JSON.parse(localStorage.getItem(DOWNLOAD_STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  };

  const saveDownloadedCourse = (id: string) => {
    const downloaded = getDownloadedCourses();
    if (!downloaded.includes(id)) {
      downloaded.push(id);
      localStorage.setItem(DOWNLOAD_STORAGE_KEY, JSON.stringify(downloaded));
    }
  };

  const removeDownloadedCourse = (id: string) => {
    const downloaded = getDownloadedCourses().filter((c) => c !== id);
    localStorage.setItem(DOWNLOAD_STORAGE_KEY, JSON.stringify(downloaded));
  };

  const downloadCourse = async () => {
    if (!("serviceWorker" in navigator) || !navigator.serviceWorker.controller) {
      toast.error(
        isEn
          ? "Offline download is not available. Please refresh the page."
          : "Le téléchargement hors-ligne n'est pas disponible. Veuillez rafraîchir la page."
      );
      return;
    }

    setIsDownloading(true);
    setProgress(0);

    try {
      // Get all asset URLs
      const urls = assets.map((a) => a.url);
      const totalAssets = urls.length;
      let downloadedCount = 0;

      // Open cache for this course
      const cache = await caches.open(`course-${courseId}`);

      // Download each asset
      for (const url of urls) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response);
          }
        } catch (err) {
          console.warn(`Failed to cache: ${url}`, err);
        }
        downloadedCount++;
        setProgress(Math.round((downloadedCount / totalAssets) * 100));
      }

      // Mark as downloaded
      saveDownloadedCourse(courseId);
      setIsDownloaded(true);

      toast.success(
        isEn
          ? `"${courseName}" is now available offline!`
          : `"${courseName}" est maintenant disponible hors-ligne !`,
        {
          description: isEn
            ? `${totalAssets} files cached successfully.`
            : `${totalAssets} fichiers mis en cache avec succès.`,
        }
      );
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(
        isEn
          ? "Download failed. Please try again."
          : "Échec du téléchargement. Veuillez réessayer."
      );
    } finally {
      setIsDownloading(false);
      setProgress(0);
    }
  };

  const removeCourse = async () => {
    try {
      // Delete the course cache
      await caches.delete(`course-${courseId}`);
      removeDownloadedCourse(courseId);
      setIsDownloaded(false);

      toast.success(
        isEn
          ? `"${courseName}" removed from offline storage.`
          : `"${courseName}" supprimé du stockage hors-ligne.`
      );
    } catch (error) {
      console.error("Remove failed:", error);
      toast.error(
        isEn
          ? "Failed to remove. Please try again."
          : "Échec de la suppression. Veuillez réessayer."
      );
    }
  };

  if (isDownloading) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <Button variant={variant} size={size} disabled>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {isEn ? "Downloading..." : "Téléchargement..."}
        </Button>
        <Progress value={progress} className="h-1" />
      </div>
    );
  }

  if (isDownloaded) {
    return (
      <div className={`flex gap-2 ${className}`}>
        <Button variant="ghost" size={size} className="text-green-600" disabled>
          <Check className="h-4 w-4 mr-2" />
          {isEn ? "Available Offline" : "Disponible hors-ligne"}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={removeCourse}
          className="text-muted-foreground hover:text-destructive"
          title={isEn ? "Remove from offline" : "Supprimer du hors-ligne"}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={downloadCourse}
      className={className}
    >
      <Download className="h-4 w-4 mr-2" />
      {isEn ? "Download for Offline" : "Télécharger hors-ligne"}
    </Button>
  );
}

// Hook to check if a course is downloaded
export function useOfflineCourse(courseId: string) {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const downloaded = JSON.parse(
      localStorage.getItem(DOWNLOAD_STORAGE_KEY) || "[]"
    );
    setIsDownloaded(downloaded.includes(courseId));

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [courseId]);

  return { isDownloaded, isOnline, canAccess: isOnline || isDownloaded };
}

// Component to show offline badge on course cards
export function OfflineBadge({ courseId }: { courseId: string }) {
  const { isDownloaded } = useOfflineCourse(courseId);
  const { language } = useLanguage();
  const isEn = language === "en";

  if (!isDownloaded) return null;

  return (
    <div className="absolute top-2 right-2 bg-green-500/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
      <WifiOff className="h-3 w-3" />
      {isEn ? "Offline" : "Hors-ligne"}
    </div>
  );
}

export default DownloadCourseButton;
