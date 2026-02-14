import { useState, useEffect } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

interface NotificationPermissionProps {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
}

export function NotificationPermission({
  onPermissionGranted,
  onPermissionDenied,
}: NotificationPermissionProps) {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [permission, setPermission] = useState<NotificationPermission | "default">("default");
  const [showBanner, setShowBanner] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
      // Show banner only if permission hasn't been decided yet
      if (Notification.permission === "default") {
        // Delay showing banner for better UX
        const timer = setTimeout(() => setShowBanner(true), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      console.warn("Notifications not supported");
      return;
    }

    setIsRequesting(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setShowBanner(false);

      if (result === "granted") {
        onPermissionGranted?.();
        // Show a test notification
        new Notification(
          isEn ? "Notifications Enabled!" : "Notifications Activées !",
          {
            body: isEn
              ? "You'll receive reminders for your sessions and badge achievements."
              : "Vous recevrez des rappels pour vos sessions et vos badges gagnés.",
            icon: "/favicon.ico",
            tag: "permission-granted",
          }
        );
      } else {
        onPermissionDenied?.();
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    } finally {
      setIsRequesting(false);
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
    // Store dismissal in localStorage to not show again for a while
    localStorage.setItem("notification-banner-dismissed", Date.now().toString());
  };

  // Don't render if notifications aren't supported or permission already decided
  if (!("Notification" in window) || permission !== "default" || !showBanner) {
    return null;
  }

  // Check if user dismissed recently (within 7 days)
  const dismissedAt = localStorage.getItem("notification-banner-dismissed");
  if (dismissedAt && Date.now() - parseInt(dismissedAt) < 7 * 24 * 60 * 60 * 1000) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up max-w-sm">
      <Card className="border-primary/20 shadow-lg bg-card/95 backdrop-blur">
        <CardContent className="p-4">
          <button
            onClick={dismissBanner}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
            aria-label={isEn ? "Dismiss" : "Fermer"}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 pr-4">
              <h4 className="font-semibold text-sm mb-1">
                {isEn ? "Stay Updated" : "Restez Informé"}
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                {isEn
                  ? "Get notified about session reminders and badge achievements."
                  : "Recevez des rappels de sessions et des notifications de badges."}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={requestPermission}
                  disabled={isRequesting}
                  className="text-xs"
                >
                  {isRequesting
                    ? isEn
                      ? "Enabling..."
                      : "Activation..."
                    : isEn
                    ? "Enable"
                    : "Activer"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={dismissBanner}
                  className="text-xs"
                >
                  {isEn ? "Not now" : "Plus tard"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook to send notifications
export function useNotifications() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const sendNotification = (
    title: string,
    options?: NotificationOptions
  ): boolean => {
    if (!("Notification" in window)) {
      console.warn("Notifications not supported");
      return false;
    }

    if (Notification.permission !== "granted") {
      console.warn("Notification permission not granted");
      return false;
    }

    try {
      new Notification(title, {
        icon: "/favicon.ico",
        ...options,
      });
      return true;
    } catch (error) {
      console.error("Error sending notification:", error);
      return false;
    }
  };

  const notifySessionReminder = (
    sessionTitle: string,
    timeUntil: "24h" | "1h"
  ) => {
    const title =
      timeUntil === "24h"
        ? isEn
          ? "Session Tomorrow"
          : "Session Demain"
        : isEn
        ? "Session in 1 Hour"
        : "Session dans 1 Heure";

    const body =
      timeUntil === "24h"
        ? isEn
          ? `Don't forget: "${sessionTitle}" is scheduled for tomorrow.`
          : `N'oubliez pas : "${sessionTitle}" est prévu pour demain.`
        : isEn
        ? `Your session "${sessionTitle}" starts in 1 hour.`
        : `Votre session "${sessionTitle}" commence dans 1 heure.`;

    return sendNotification(title, {
      body,
      tag: `session-reminder-${timeUntil}`,
      requireInteraction: timeUntil === "1h",
    });
  };

  const notifyBadgeEarned = (badgeName: string, xpEarned: number) => {
    const title = isEn ? "🏆 Badge Earned!" : "🏆 Badge Gagné !";
    const body = isEn
      ? `Congratulations! You earned the "${badgeName}" badge and ${xpEarned} XP!`
      : `Félicitations ! Vous avez gagné le badge "${badgeName}" et ${xpEarned} XP !`;

    return sendNotification(title, {
      body,
      tag: `badge-${badgeName}`,
    });
  };

  const notifyNewMessage = (senderName: string) => {
    const title = isEn ? "New Message" : "Nouveau Message";
    const body = isEn
      ? `You have a new message from ${senderName}.`
      : `Vous avez un nouveau message de ${senderName}.`;

    return sendNotification(title, {
      body,
      tag: "new-message",
    });
  };

  return {
    sendNotification,
    notifySessionReminder,
    notifyBadgeEarned,
    notifyNewMessage,
    isSupported: "Notification" in window,
    permission:
      "Notification" in window ? Notification.permission : "denied",
  };
}

export default NotificationPermission;
