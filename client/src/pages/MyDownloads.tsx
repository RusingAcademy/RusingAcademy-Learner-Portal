import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  Trash2,
  HardDrive,
  WifiOff,
  BookOpen,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

interface DownloadedCourse {
  id: string;
  name: string;
  downloadedAt: number;
  size?: number;
}

const DOWNLOAD_STORAGE_KEY = "downloaded-courses";
const DOWNLOAD_META_KEY = "downloaded-courses-meta";

export default function MyDownloads() {
  const { language } = useLanguage();
  const isEn = language === "en";
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [downloads, setDownloads] = useState<DownloadedCourse[]>([]);
  const [totalSize, setTotalSize] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(true);

  const labels = {
    en: {
      title: "My Downloads",
      subtitle: "Manage your offline content",
      noDownloads: "No downloads yet",
      noDownloadsDesc:
        "Download courses to access them offline. Look for the download button on course pages.",
      browseCourses: "Browse Courses",
      storage: "Storage Used",
      remove: "Remove",
      removeAll: "Remove All",
      downloadedOn: "Downloaded on",
      offlineReady: "Ready for offline use",
      onlineOnly: "Online access only",
      storageInfo: "Storage information",
      estimatedSize: "Estimated size",
      loginRequired: "Please log in to view your downloads",
      login: "Log In",
    },
    fr: {
      title: "Mes Téléchargements",
      subtitle: "Gérer votre contenu hors-ligne",
      noDownloads: "Aucun téléchargement",
      noDownloadsDesc:
        "Téléchargez des cours pour y accéder hors-ligne. Cherchez le bouton de téléchargement sur les pages de cours.",
      browseCourses: "Parcourir les Cours",
      storage: "Stockage Utilisé",
      remove: "Supprimer",
      removeAll: "Tout Supprimer",
      downloadedOn: "Téléchargé le",
      offlineReady: "Prêt pour utilisation hors-ligne",
      onlineOnly: "Accès en ligne uniquement",
      storageInfo: "Information de stockage",
      estimatedSize: "Taille estimée",
      loginRequired: "Veuillez vous connecter pour voir vos téléchargements",
      login: "Se Connecter",
    },
  };

  const t = labels[isEn ? "en" : "fr"];

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    setIsLoading(true);
    try {
      // Get downloaded course IDs
      const courseIds: string[] = JSON.parse(
        localStorage.getItem(DOWNLOAD_STORAGE_KEY) || "[]"
      );

      // Get metadata
      const meta: Record<string, DownloadedCourse> = JSON.parse(
        localStorage.getItem(DOWNLOAD_META_KEY) || "{}"
      );

      // Calculate cache sizes
      let total = 0;
      const coursesWithSize: DownloadedCourse[] = [];

      for (const id of courseIds) {
        const cacheName = `course-${id}`;
        let size = 0;

        try {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();

          for (const request of keys) {
            const response = await cache.match(request);
            if (response) {
              const blob = await response.clone().blob();
              size += blob.size;
            }
          }
        } catch (e) {
          console.warn(`Could not calculate size for ${cacheName}`);
        }

        total += size;
        coursesWithSize.push({
          id,
          name: meta[id]?.name || `Course ${id}`,
          downloadedAt: meta[id]?.downloadedAt || Date.now(),
          size,
        });
      }

      setDownloads(coursesWithSize);
      setTotalSize(total);
    } catch (error) {
      console.error("Error loading downloads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeCourse = async (courseId: string) => {
    try {
      // Delete cache
      await caches.delete(`course-${courseId}`);

      // Update localStorage
      const courseIds: string[] = JSON.parse(
        localStorage.getItem(DOWNLOAD_STORAGE_KEY) || "[]"
      );
      const filtered = courseIds.filter((id) => id !== courseId);
      localStorage.setItem(DOWNLOAD_STORAGE_KEY, JSON.stringify(filtered));

      // Update meta
      const meta = JSON.parse(localStorage.getItem(DOWNLOAD_META_KEY) || "{}");
      delete meta[courseId];
      localStorage.setItem(DOWNLOAD_META_KEY, JSON.stringify(meta));

      // Reload
      await loadDownloads();

      toast.success(isEn ? "Course removed" : "Cours supprimé");
    } catch (error) {
      console.error("Error removing course:", error);
      toast.error(isEn ? "Failed to remove" : "Échec de la suppression");
    }
  };

  const removeAllCourses = async () => {
    try {
      const courseIds: string[] = JSON.parse(
        localStorage.getItem(DOWNLOAD_STORAGE_KEY) || "[]"
      );

      for (const id of courseIds) {
        await caches.delete(`course-${id}`);
      }

      localStorage.setItem(DOWNLOAD_STORAGE_KEY, "[]");
      localStorage.setItem(DOWNLOAD_META_KEY, "{}");

      setDownloads([]);
      setTotalSize(0);

      toast.success(
        isEn ? "All downloads removed" : "Tous les téléchargements supprimés"
      );
    } catch (error) {
      console.error("Error removing all courses:", error);
      toast.error(isEn ? "Failed to remove" : "Échec de la suppression");
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString(isEn ? "en-US" : "fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">{t.loginRequired}</h2>
              <Button asChild className="mt-4">
                <a href={getLoginUrl()}>{t.login}</a>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>

          {/* Connection Status */}
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm ${
              isOnline
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            }`}
          >
            {isOnline ? (
              <>
                <div className="w-2 h-2 rounded-full bg-green-500" />
                {isEn ? "Online" : "En ligne"}
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4" />
                {isEn ? "Offline" : "Hors-ligne"}
              </>
            )}
          </div>
        </div>

        {/* Storage Info */}
        {downloads.length > 0 && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <HardDrive className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{t.storage}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatSize(totalSize)} • {downloads.length}{" "}
                      {isEn ? "courses" : "cours"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={removeAllCourses}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t.removeAll}
                </Button>
              </div>
              <Progress value={Math.min((totalSize / (500 * 1024 * 1024)) * 100, 100)} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {formatSize(totalSize)} / 500 MB {isEn ? "estimated limit" : "limite estimée"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Downloads List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : downloads.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Download className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">{t.noDownloads}</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {t.noDownloadsDesc}
              </p>
              <Button asChild>
                <Link href="/courses">
                  <BookOpen className="h-4 w-4 mr-2" />
                  {t.browseCourses}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {downloads.map((course) => (
              <Card key={course.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{course.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>
                            {t.downloadedOn} {formatDate(course.downloadedAt)}
                          </span>
                          {course.size && (
                            <>
                              <span>•</span>
                              <span>{formatSize(course.size)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="hidden sm:flex items-center gap-1 text-green-600 text-sm">
                        <WifiOff className="h-4 w-4" />
                        {t.offlineReady}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCourse(course.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
