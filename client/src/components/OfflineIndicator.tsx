import { useEffect, useState } from "react";
import { WifiOff, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import useServiceWorker from "@/hooks/useServiceWorker";

export function OfflineIndicator() {
  const { language } = useLanguage();
  const isEn = language === "en";
  const { isOnline, updateAvailable, applyUpdate } = useServiceWorker();
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isOnline && !dismissed) {
      setShowBanner(true);
    } else if (isOnline) {
      setShowBanner(false);
      setDismissed(false);
    }
  }, [isOnline, dismissed]);

  // Update available banner
  if (updateAvailable) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
        <div className="bg-primary text-primary-foreground p-4 rounded-lg shadow-lg flex items-center gap-3">
          <RefreshCw className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-sm">
              {isEn ? "Update Available" : "Mise à jour disponible"}
            </p>
            <p className="text-xs opacity-90">
              {isEn
                ? "A new version is ready. Refresh to update."
                : "Une nouvelle version est prête. Actualisez pour mettre à jour."}
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={applyUpdate}
            className="flex-shrink-0"
          >
            {isEn ? "Update" : "Mettre à jour"}
          </Button>
        </div>
      </div>
    );
  }

  // Offline banner
  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-amber-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-3">
        <WifiOff className="h-5 w-5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-sm">
            {isEn ? "You're Offline" : "Vous êtes hors ligne"}
          </p>
          <p className="text-xs opacity-90">
            {isEn
              ? "Some features may be limited. Downloaded content is still available."
              : "Certaines fonctionnalités peuvent être limitées. Le contenu téléchargé est toujours disponible."}
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
          aria-label={isEn ? "Dismiss" : "Fermer"}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default OfflineIndicator;
