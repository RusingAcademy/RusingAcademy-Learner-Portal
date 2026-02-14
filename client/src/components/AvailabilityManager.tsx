import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Clock, Plus, Trash2, Loader2, Calendar, Save } from "lucide-react";

interface TimeSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
  isActive: boolean;
}

const DAYS = [
  { value: 0, en: "Sunday", fr: "Dimanche" },
  { value: 1, en: "Monday", fr: "Lundi" },
  { value: 2, en: "Tuesday", fr: "Mardi" },
  { value: 3, en: "Wednesday", fr: "Mercredi" },
  { value: 4, en: "Thursday", fr: "Jeudi" },
  { value: 5, en: "Friday", fr: "Vendredi" },
  { value: 6, en: "Saturday", fr: "Samedi" },
];

const TIME_OPTIONS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"
];

const labels = {
  en: {
    title: "Availability Schedule",
    description: "Set your weekly availability for coaching sessions",
    addSlot: "Add Time Slot",
    save: "Save Changes",
    saving: "Saving...",
    day: "Day",
    startTime: "Start Time",
    endTime: "End Time",
    active: "Active",
    noSlots: "No availability slots configured. Add your first time slot to start accepting bookings.",
    saveSuccess: "Availability saved successfully",
    saveError: "Failed to save availability",
    timezone: "Timezone",
    timezoneNote: "All times are in Eastern Time (America/Toronto)",
  },
  fr: {
    title: "Horaire de disponibilité",
    description: "Définissez votre disponibilité hebdomadaire pour les séances de coaching",
    addSlot: "Ajouter un créneau",
    save: "Enregistrer",
    saving: "Enregistrement...",
    day: "Jour",
    startTime: "Heure de début",
    endTime: "Heure de fin",
    active: "Actif",
    noSlots: "Aucun créneau configuré. Ajoutez votre premier créneau pour commencer à accepter des réservations.",
    saveSuccess: "Disponibilité enregistrée avec succès",
    saveError: "Échec de l'enregistrement de la disponibilité",
    timezone: "Fuseau horaire",
    timezoneNote: "Toutes les heures sont en heure de l'Est (America/Toronto)",
  },
};

export function AvailabilityManager() {
  const { language } = useLanguage();
  const t = labels[language];
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch existing availability
  const { data: existingAvailability, isLoading } = trpc.coach.getAvailability.useQuery();

  // Save availability mutation
  const saveMutation = trpc.coach.setAvailability.useMutation({
    onSuccess: () => {
      toast.success(t.saveSuccess);
      setHasChanges(false);
    },
    onError: () => {
      toast.error(t.saveError);
    },
  });

  // Initialize slots from existing data
  useEffect(() => {
    if (existingAvailability && existingAvailability.length > 0) {
      setSlots(
        existingAvailability.map((slot) => ({
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          timezone: slot.timezone || "America/Toronto",
          isActive: slot.isActive ?? true,
        }))
      );
    }
  }, [existingAvailability]);

  const addSlot = () => {
    setSlots([
      ...slots,
      {
        dayOfWeek: 1, // Monday
        startTime: "09:00",
        endTime: "17:00",
        timezone: "America/Toronto",
        isActive: true,
      },
    ]);
    setHasChanges(true);
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const updateSlot = (index: number, field: keyof TimeSlot, value: string | number | boolean) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSlots(newSlots);
    setHasChanges(true);
  };

  const handleSave = () => {
    saveMutation.mutate(slots);
  };

  const formatTime = (time: string) => {
    const [hours] = time.split(":");
    const hour = parseInt(hours);
    if (hour === 0) return "12:00 AM";
    if (hour === 12) return "12:00 PM";
    if (hour > 12) return `${hour - 12}:00 PM`;
    return `${hour}:00 AM`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
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
              <Calendar className="h-5 w-5" />
              {t.title}
            </CardTitle>
            <CardDescription>{t.description}</CardDescription>
          </div>
          <Button onClick={addSlot} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            {t.addSlot}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {t.timezoneNote}
        </p>

        {slots.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t.noSlots}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {slots.map((slot, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
              >
                <div className="flex-1 grid grid-cols-4 gap-3 items-center">
                  {/* Day selector */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">{t.day}</Label>
                    <Select
                      value={slot.dayOfWeek.toString()}
                      onValueChange={(v) => updateSlot(index, "dayOfWeek", parseInt(v))}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS.map((day) => (
                          <SelectItem key={day.value} value={day.value.toString()}>
                            {language === "fr" ? day.fr : day.en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Start time */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">{t.startTime}</Label>
                    <Select
                      value={slot.startTime}
                      onValueChange={(v) => updateSlot(index, "startTime", v)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue>{formatTime(slot.startTime)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {formatTime(time)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* End time */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">{t.endTime}</Label>
                    <Select
                      value={slot.endTime}
                      onValueChange={(v) => updateSlot(index, "endTime", v)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue>{formatTime(slot.endTime)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {formatTime(time)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Active toggle */}
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={slot.isActive}
                      onCheckedChange={(checked) => updateSlot(index, "isActive", checked)}
                    />
                    <Label className="text-sm">{t.active}</Label>
                  </div>
                </div>

                {/* Delete button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSlot(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Save button */}
        {(slots.length > 0 || hasChanges) && (
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending || !hasChanges}
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t.saving}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t.save}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
