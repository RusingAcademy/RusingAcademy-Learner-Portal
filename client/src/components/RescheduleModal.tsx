import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Clock, AlertCircle } from "lucide-react";
import { format, addDays, isBefore, startOfDay } from "date-fns";

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: number;
  coachId: number;
  coachName: string;
  currentDate: Date;
  onSuccess?: () => void;
}

export default function RescheduleModal({
  isOpen,
  onClose,
  sessionId,
  coachId,
  coachName,
  currentDate,
  onSuccess,
}: RescheduleModalProps) {
  const { language } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  // Fetch coach availability for selected date
  const availabilityQuery = trpc.coach.availableSlots.useQuery(
    { coachId, date: selectedDate?.toISOString().split("T")[0] || "" },
    { enabled: !!selectedDate }
  );

  const rescheduleMutation = trpc.learner.reschedule.useMutation({
    onSuccess: () => {
      toast.success(
        language === "fr"
          ? "Session reprogrammée avec succès"
          : "Session rescheduled successfully"
      );
      onSuccess?.();
      onClose();
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || (language === "fr" ? "Erreur lors de la reprogrammation" : "Error rescheduling session"));
    },
  });

  const labels = {
    en: {
      title: "Reschedule Session",
      description: "Select a new date and time for your session with",
      selectDate: "Select a New Date",
      selectTime: "Select a Time",
      minNotice: "Sessions must be rescheduled at least 24 hours in advance",
      currentSession: "Current session",
      newSession: "New session",
      noSlots: "No available time slots for this date",
      back: "Back",
      confirm: "Confirm Reschedule",
      cancel: "Cancel",
      loading: "Loading available times...",
    },
    fr: {
      title: "Reprogrammer la session",
      description: "Sélectionnez une nouvelle date et heure pour votre session avec",
      selectDate: "Sélectionner une nouvelle date",
      selectTime: "Sélectionner une heure",
      minNotice: "Les sessions doivent être reprogrammées au moins 24 heures à l'avance",
      currentSession: "Session actuelle",
      newSession: "Nouvelle session",
      noSlots: "Aucun créneau disponible pour cette date",
      back: "Retour",
      confirm: "Confirmer la reprogrammation",
      cancel: "Annuler",
      loading: "Chargement des heures disponibles...",
    },
  };

  const l = labels[language];

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(undefined);
      setSelectedTime(null);
      setStep(1);
    }
  }, [isOpen]);

  // Minimum date is 24 hours from now
  const minDate = addDays(new Date(), 1);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(null);
    if (date) {
      setStep(2);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) return;

    const [hours, minutes] = selectedTime.split(":").map(Number);
    const newDateTime = new Date(selectedDate);
    newDateTime.setHours(hours, minutes, 0, 0);

    rescheduleMutation.mutate({
      sessionId,
      newDateTime: newDateTime.toISOString(),
    });
  };

  const isDateDisabled = (date: Date) => {
    return isBefore(startOfDay(date), startOfDay(minDate));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            {l.title}
          </DialogTitle>
          <DialogDescription>
            {l.description} {coachName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Policy Notice */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-[#FFE4D6] dark:border-amber-800">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-200">{l.minNotice}</p>
          </div>

          {/* Current Session Info */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">{l.currentSession}</p>
            <p className="font-medium">
              {format(currentDate, "EEEE, MMMM d, yyyy")} at {format(currentDate, "h:mm a")}
            </p>
          </div>

          {/* Step 1: Date Selection */}
          {step === 1 && (
            <div>
              <h3 className="font-medium mb-3">{l.selectDate}</h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={isDateDisabled}
                className="rounded-md border mx-auto"
              />
            </div>
          )}

          {/* Step 2: Time Selection */}
          {step === 2 && selectedDate && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">{l.selectTime}</h3>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  {l.back}
                </Button>
              </div>

              <div className="p-3 bg-primary/5 rounded-lg mb-3">
                <p className="text-sm text-muted-foreground">{l.newSession}</p>
                <p className="font-medium">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
              </div>

              {availabilityQuery.isLoading ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Clock className="h-5 w-5 animate-spin mx-auto mb-2" />
                  {l.loading}
                </div>
              ) : availabilityQuery.data?.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">{l.noSlots}</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {(availabilityQuery.data || []).map((slot: string) => (
                    <Button
                      key={slot}
                      variant={selectedTime === slot ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTimeSelect(slot)}
                      className="text-sm"
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {l.cancel}
          </Button>
          {step === 2 && selectedTime && (
            <Button
              onClick={handleConfirm}
              disabled={rescheduleMutation.isPending}
            >
              {rescheduleMutation.isPending ? "..." : l.confirm}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
