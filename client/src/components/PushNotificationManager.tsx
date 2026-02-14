import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Bell,
  BellOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  Smartphone,
} from "lucide-react";

interface PushNotificationManagerProps {
  userId?: number;
}

export default function PushNotificationManager({ userId }: PushNotificationManagerProps) {
  const { language } = useLanguage();
  const isEn = language === "en";
  
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Preferences
  const [enableBookings, setEnableBookings] = useState(true);
  const [enableMessages, setEnableMessages] = useState(true);
  const [enableReminders, setEnableReminders] = useState(true);
  const [enableMarketing, setEnableMarketing] = useState(false);
  
  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = async () => {
      const supported = "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
        
        // Check if already subscribed
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
        } catch (error) {
          console.error("Error checking push subscription:", error);
        }
      }
    };
    
    checkSupport();
  }, []);
  
  // Subscribe mutation
  const subscribeMutation = trpc.notifications.subscribePush.useMutation({
    onSuccess: () => {
      setIsSubscribed(true);
      toast.success(isEn ? "Notifications enabled" : "Notifications activées", {
        description: isEn 
          ? "You will now receive push notifications." 
          : "Vous recevrez maintenant des notifications push.",
      });
    },
    onError: (error) => {
      toast.error(isEn ? "Failed to enable notifications" : "Échec de l'activation des notifications", {
        description: error.message,
      });
    },
  });
  
  // Unsubscribe mutation
  const unsubscribeMutation = trpc.notifications.unsubscribePush.useMutation({
    onSuccess: () => {
      setIsSubscribed(false);
      toast.success(isEn ? "Notifications disabled" : "Notifications désactivées", {
        description: isEn 
          ? "You will no longer receive push notifications." 
          : "Vous ne recevrez plus de notifications push.",
      });
    },
    onError: (error) => {
      toast.error(isEn ? "Failed to disable notifications" : "Échec de la désactivation des notifications", {
        description: error.message,
      });
    },
  });
  
  // Update preferences mutation
  const updatePreferencesMutation = trpc.notifications.updatePushPreferences.useMutation({
    onSuccess: () => {
      toast.success(isEn ? "Preferences saved" : "Préférences enregistrées");
    },
    onError: (error) => {
      toast.error(isEn ? "Failed to save preferences" : "Échec de l'enregistrement des préférences", {
        description: error.message,
      });
    },
  });
  
  const handleSubscribe = async () => {
    if (!isSupported) return;
    
    setIsLoading(true);
    
    try {
      // Request permission
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);
      
      if (permissionResult !== "granted") {
        toast.error(isEn ? "Permission denied" : "Permission refusée", {
          description: isEn 
            ? "Please enable notifications in your browser settings." 
            : "Veuillez activer les notifications dans les paramètres de votre navigateur.",
        });
        setIsLoading(false);
        return;
      }
      
      // Register service worker if not already registered
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      
      // Get VAPID public key from server (would need to be implemented)
      // For now, we'll use a placeholder
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || "";
      
      if (!vapidPublicKey) {
        // Fallback: just save preferences without actual push subscription
        subscribeMutation.mutate({
          endpoint: "browser-notifications-enabled",
          p256dh: "placeholder",
          auth: "placeholder",
          userAgent: navigator.userAgent,
          enableBookings,
          enableMessages,
          enableReminders,
          enableMarketing,
        });
        setIsLoading(false);
        return;
      }
      
      // Subscribe to push
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });
      
      const subscriptionJson = subscription.toJSON();
      
      // Send subscription to server
      subscribeMutation.mutate({
        endpoint: subscriptionJson.endpoint || "",
        p256dh: subscriptionJson.keys?.p256dh || "",
        auth: subscriptionJson.keys?.auth || "",
        userAgent: navigator.userAgent,
        enableBookings,
        enableMessages,
        enableReminders,
        enableMarketing,
      });
    } catch (error) {
      console.error("Error subscribing to push:", error);
      toast.error(isEn ? "Failed to enable notifications" : "Échec de l'activation des notifications");
    }
    
    setIsLoading(false);
  };
  
  const handleUnsubscribe = async () => {
    setIsLoading(true);
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
      }
      
      unsubscribeMutation.mutate();
    } catch (error) {
      console.error("Error unsubscribing:", error);
      toast.error(isEn ? "Failed to disable notifications" : "Échec de la désactivation des notifications");
    }
    
    setIsLoading(false);
  };
  
  const handlePreferenceChange = (key: string, value: boolean) => {
    switch (key) {
      case "bookings":
        setEnableBookings(value);
        break;
      case "messages":
        setEnableMessages(value);
        break;
      case "reminders":
        setEnableReminders(value);
        break;
      case "marketing":
        setEnableMarketing(value);
        break;
    }
    
    if (isSubscribed) {
      updatePreferencesMutation.mutate({
        enableBookings: key === "bookings" ? value : enableBookings,
        enableMessages: key === "messages" ? value : enableMessages,
        enableReminders: key === "reminders" ? value : enableReminders,
        enableMarketing: key === "marketing" ? value : enableMarketing,
      });
    }
  };
  
  const content = {
    en: {
      title: "Push Notifications",
      description: "Get notified about new bookings, messages, and session reminders.",
      notSupported: "Push notifications are not supported in your browser.",
      permissionDenied: "Notifications are blocked. Please enable them in your browser settings.",
      enable: "Enable Notifications",
      disable: "Disable Notifications",
      enabled: "Notifications are enabled",
      disabled: "Notifications are disabled",
      preferences: "Notification Preferences",
      bookings: "New Bookings",
      bookingsDesc: "Get notified when someone books a session with you",
      messages: "Messages",
      messagesDesc: "Get notified when you receive a new message",
      reminders: "Session Reminders",
      remindersDesc: "Get reminded before your upcoming sessions",
      marketing: "Updates & Tips",
      marketingDesc: "Receive platform updates and coaching tips",
    },
    fr: {
      title: "Notifications Push",
      description: "Recevez des notifications pour les nouvelles réservations, messages et rappels de séances.",
      notSupported: "Les notifications push ne sont pas prises en charge par votre navigateur.",
      permissionDenied: "Les notifications sont bloquées. Veuillez les activer dans les paramètres de votre navigateur.",
      enable: "Activer les notifications",
      disable: "Désactiver les notifications",
      enabled: "Les notifications sont activées",
      disabled: "Les notifications sont désactivées",
      preferences: "Préférences de notification",
      bookings: "Nouvelles réservations",
      bookingsDesc: "Soyez averti lorsque quelqu'un réserve une séance avec vous",
      messages: "Messages",
      messagesDesc: "Soyez averti lorsque vous recevez un nouveau message",
      reminders: "Rappels de séance",
      remindersDesc: "Recevez un rappel avant vos prochaines séances",
      marketing: "Mises à jour et conseils",
      marketingDesc: "Recevez les mises à jour de la plateforme et des conseils de coaching",
    },
  };
  
  const t = isEn ? content.en : content.fr;
  
  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-muted-foreground">
            <AlertCircle className="h-5 w-5" />
            <p>{t.notSupported}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          {t.title}
        </CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status and Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
          <div className="flex items-center gap-3">
            {isSubscribed ? (
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <BellOff className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div>
              <p className="font-medium">
                {isSubscribed ? t.enabled : t.disabled}
              </p>
              {permission === "denied" && (
                <p className="text-sm text-destructive">{t.permissionDenied}</p>
              )}
            </div>
          </div>
          <Button
            variant={isSubscribed ? "outline" : "default"}
            onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
            disabled={isLoading || permission === "denied"}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSubscribed ? (
              t.disable
            ) : (
              t.enable
            )}
          </Button>
        </div>
        
        {/* Preferences */}
        {isSubscribed && (
          <div className="space-y-4">
            <h4 className="font-medium">{t.preferences}</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="bookings">{t.bookings}</Label>
                  <p className="text-sm text-muted-foreground">{t.bookingsDesc}</p>
                </div>
                <Switch
                  id="bookings"
                  checked={enableBookings}
                  onCheckedChange={(checked) => handlePreferenceChange("bookings", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="messages">{t.messages}</Label>
                  <p className="text-sm text-muted-foreground">{t.messagesDesc}</p>
                </div>
                <Switch
                  id="messages"
                  checked={enableMessages}
                  onCheckedChange={(checked) => handlePreferenceChange("messages", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reminders">{t.reminders}</Label>
                  <p className="text-sm text-muted-foreground">{t.remindersDesc}</p>
                </div>
                <Switch
                  id="reminders"
                  checked={enableReminders}
                  onCheckedChange={(checked) => handlePreferenceChange("reminders", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="marketing">{t.marketing}</Label>
                  <p className="text-sm text-muted-foreground">{t.marketingDesc}</p>
                </div>
                <Switch
                  id="marketing"
                  checked={enableMarketing}
                  onCheckedChange={(checked) => handlePreferenceChange("marketing", checked)}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
