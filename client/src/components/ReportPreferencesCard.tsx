import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function ReportPreferencesCard() {
  const { language } = useLanguage();
  const [isEnabled, setIsEnabled] = useState(true);
  const [deliveryDay, setDeliveryDay] = useState("0");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: preferences, isLoading } = trpc.learner.getReportPreferences.useQuery();
  const updateMutation = trpc.learner.updateReportPreferences.useMutation({
    onSuccess: () => {
      toast.success(
        language === "fr"
          ? "Préférences mises à jour !"
          : "Preferences updated!"
      );
      setIsSaving(false);
      setHasChanges(false);
    },
    onError: (error) => {
      toast.error(error.message || (language === "fr" ? "Erreur de sauvegarde" : "Failed to save"));
      setIsSaving(false);
    },
  });

  // Sync state with fetched preferences
  useEffect(() => {
    if (preferences) {
      setIsEnabled(preferences.weeklyReportEnabled);
      setDeliveryDay(String(preferences.weeklyReportDay));
    }
  }, [preferences]);

  const handleSave = async () => {
    setIsSaving(true);
    await updateMutation.mutateAsync({
      weeklyReportEnabled: isEnabled,
      weeklyReportDay: parseInt(deliveryDay),
    });
  };

  const handleEnabledChange = (checked: boolean) => {
    setIsEnabled(checked);
    setHasChanges(true);
  };

  const handleDayChange = (value: string) => {
    setDeliveryDay(value);
    setHasChanges(true);
  };

  const labels = language === "fr" ? {
    title: "Rapports de progression",
    description: "Recevez un résumé hebdomadaire de votre activité",
    enableLabel: "Activer les rapports hebdomadaires",
    enableDescription: "Recevez un email chaque semaine avec vos statistiques",
    deliveryDayLabel: "Jour de livraison",
    sunday: "Dimanche",
    monday: "Lundi",
    save: "Enregistrer",
    saving: "Enregistrement...",
    saved: "Enregistré",
  } : {
    title: "Progress Reports",
    description: "Receive a weekly summary of your activity",
    enableLabel: "Enable weekly reports",
    enableDescription: "Get an email each week with your learning stats",
    deliveryDayLabel: "Delivery day",
    sunday: "Sunday",
    monday: "Monday",
    save: "Save",
    saving: "Saving...",
    saved: "Saved",
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          {labels.title}
        </CardTitle>
        <CardDescription>{labels.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="weekly-reports">{labels.enableLabel}</Label>
            <p className="text-sm text-muted-foreground">
              {labels.enableDescription}
            </p>
          </div>
          <Switch
            id="weekly-reports"
            checked={isEnabled}
            onCheckedChange={handleEnabledChange}
          />
        </div>

        {/* Delivery Day Selection */}
        <div className="space-y-2">
          <Label htmlFor="delivery-day">{labels.deliveryDayLabel}</Label>
          <Select
            value={deliveryDay}
            onValueChange={handleDayChange}
            disabled={!isEnabled}
          >
            <SelectTrigger id="delivery-day" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">{labels.sunday}</SelectItem>
              <SelectItem value="1">{labels.monday}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="w-full"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {labels.saving}
            </>
          ) : hasChanges ? (
            labels.save
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {labels.saved}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
