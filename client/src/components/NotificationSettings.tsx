import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import {
  Bell,
  BellOff,
  MessageSquare,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationPreferences {
  messages: boolean;
  sessionReminders: boolean;
  bookingConfirmations: boolean;
  promotions: boolean;
}

export function NotificationSettings() {
  const { language } = useLanguage();
  const isEn = language === "en";
  
  const {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification,
  } = usePushNotifications();

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    messages: true,
    sessionReminders: true,
    bookingConfirmations: true,
    promotions: false,
  });

  const handleToggleSubscription = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      const success = await subscribe();
      if (success) {
        // Show a test notification
        await showNotification(
          isEn ? "Notifications Enabled!" : "Notifications activées!",
          {
            body: isEn 
              ? "You'll now receive updates from Lingueefy"
              : "Vous recevrez maintenant des mises à jour de Lingueefy",
          }
        );
      }
    }
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    // In a real app, save to server here
  };

  const handleTestNotification = async () => {
    await showNotification(
      isEn ? "Test Notification" : "Notification de test",
      {
        body: isEn 
          ? "This is a test notification from Lingueefy"
          : "Ceci est une notification de test de Lingueefy",
      }
    );
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5 text-muted-foreground" />
            {isEn ? "Push Notifications" : "Notifications push"}
          </CardTitle>
          <CardDescription>
            {isEn 
              ? "Push notifications are not supported in your browser"
              : "Les notifications push ne sont pas supportées dans votre navigateur"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">
              {isEn 
                ? "Try using Chrome, Firefox, or Edge for push notification support"
                : "Essayez Chrome, Firefox ou Edge pour le support des notifications push"}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-teal-600" />
              {isEn ? "Push Notifications" : "Notifications push"}
            </CardTitle>
            <CardDescription>
              {isEn 
                ? "Receive alerts even when you're not on the site"
                : "Recevez des alertes même quand vous n'êtes pas sur le site"}
            </CardDescription>
          </div>
          <Badge 
            variant={isSubscribed ? "default" : "secondary"}
            className={cn(
              isSubscribed && "bg-green-500"
            )}
          >
            {isSubscribed 
              ? (isEn ? "Enabled" : "Activé")
              : (isEn ? "Disabled" : "Désactivé")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Toggle */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-full",
              isSubscribed ? "bg-teal-100" : "bg-slate-200"
            )}>
              <Smartphone className={cn(
                "h-5 w-5",
                isSubscribed ? "text-teal-600" : "text-slate-500"
              )} />
            </div>
            <div>
              <p className="font-medium">
                {isEn ? "Browser Notifications" : "Notifications navigateur"}
              </p>
              <p className="text-sm text-muted-foreground">
                {permission === "denied" 
                  ? (isEn ? "Blocked by browser" : "Bloqué par le navigateur")
                  : isSubscribed
                    ? (isEn ? "You'll receive push notifications" : "Vous recevrez des notifications push")
                    : (isEn ? "Enable to receive alerts" : "Activez pour recevoir des alertes")}
              </p>
            </div>
          </div>
          <Button
            variant={isSubscribed ? "outline" : "default"}
            size="sm"
            onClick={handleToggleSubscription}
            disabled={isLoading || permission === "denied"}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSubscribed ? (
              isEn ? "Disable" : "Désactiver"
            ) : (
              isEn ? "Enable" : "Activer"
            )}
          </Button>
        </div>

        {permission === "denied" && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">
              {isEn 
                ? "Notifications are blocked. Please enable them in your browser settings."
                : "Les notifications sont bloquées. Veuillez les activer dans les paramètres de votre navigateur."}
            </span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Notification Preferences */}
        {isSubscribed && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              {isEn ? "Notification Types" : "Types de notifications"}
            </h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  <Label htmlFor="messages" className="cursor-pointer">
                    {isEn ? "New Messages" : "Nouveaux messages"}
                  </Label>
                </div>
                <Switch
                  id="messages"
                  checked={preferences.messages}
                  onCheckedChange={() => handlePreferenceChange("messages")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-[#0F3D3E]" />
                  <Label htmlFor="reminders" className="cursor-pointer">
                    {isEn ? "Session Reminders" : "Rappels de session"}
                  </Label>
                </div>
                <Switch
                  id="reminders"
                  checked={preferences.sessionReminders}
                  onCheckedChange={() => handlePreferenceChange("sessionReminders")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <Label htmlFor="bookings" className="cursor-pointer">
                    {isEn ? "Booking Confirmations" : "Confirmations de réservation"}
                  </Label>
                </div>
                <Switch
                  id="bookings"
                  checked={preferences.bookingConfirmations}
                  onCheckedChange={() => handlePreferenceChange("bookingConfirmations")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-amber-500" />
                  <Label htmlFor="promotions" className="cursor-pointer">
                    {isEn ? "Promotions & Updates" : "Promotions et mises à jour"}
                  </Label>
                </div>
                <Switch
                  id="promotions"
                  checked={preferences.promotions}
                  onCheckedChange={() => handlePreferenceChange("promotions")}
                />
              </div>
            </div>

            {/* Test Button */}
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestNotification}
                className="w-full"
              >
                <Bell className="h-4 w-4 mr-2" />
                {isEn ? "Send Test Notification" : "Envoyer une notification de test"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
