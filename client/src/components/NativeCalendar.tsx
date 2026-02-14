/**
 * NativeCalendar Component
 * RusingÂcademy Native Booking Calendar System
 */

import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ChevronLeft, ChevronRight, Check, X, Loader2, Video, User } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
  coachId: string;
}

interface NativeCalendarProps {
  coachId: string;
  coachName: string;
  sessionDuration: number;
  onBookingComplete?: (bookingId: string) => void;
}

const DAYS_OF_WEEK = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  fr: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
};

const MONTHS = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  fr: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
};

export function NativeCalendar({ coachId, coachName, sessionDuration, onBookingComplete }: NativeCalendarProps) {
  const { language } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  const { data: availableSlots, isLoading: slotsLoading } = (trpc as any).calendar.getAvailableSlots.useQuery(
    { coachId, date: selectedDate?.toISOString().split('T')[0] || '' },
    { enabled: !!selectedDate }
  );

  const bookSessionMutation = (trpc as any).calendar.bookSession.useMutation({
    onSuccess: (data) => {
      toast.success(language === "fr" ? "Session réservée avec succès!" : "Session booked successfully!");
      setSelectedSlot(null);
      setIsBooking(false);
      onBookingComplete?.(data.bookingId);
    },
    onError: (error) => {
      toast.error(error.message || (language === "fr" ? "Erreur lors de la réservation" : "Booking failed"));
      setIsBooking(false);
    },
  });

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    return days;
  }, [currentDate]);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  const handleDateSelect = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return;
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleBookSession = async () => {
    if (!selectedSlot || !selectedDate) return;
    setIsBooking(true);
    await bookSessionMutation.mutateAsync({
      coachId,
      slotId: selectedSlot.id,
      date: selectedDate.toISOString().split('T')[0],
      duration: sessionDuration,
    });
  };

  const isDateSelected = (date: Date | null) => date && selectedDate && date.toDateString() === selectedDate.toDateString();
  const isDatePast = (date: Date | null) => { if (!date) return false; const today = new Date(); today.setHours(0,0,0,0); return date < today; };
  const isToday = (date: Date | null) => date && date.toDateString() === new Date().toDateString();

  return (
    <div className="space-y-6">
      <Card className="border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              {language === "fr" ? "Réserver une session" : "Book a Session"}
            </CardTitle>
            <Badge variant="outline"><User className="h-3 w-3 mr-1" />{coachName}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigateMonth("prev")}><ChevronLeft className="h-4 w-4" /></Button>
            <h3 className="font-semibold text-lg">{MONTHS[language as keyof typeof MONTHS][currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
            <Button variant="ghost" size="sm" onClick={() => navigateMonth("next")}><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_OF_WEEK[language as keyof typeof DAYS_OF_WEEK].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => (
              <button key={index} disabled={!date || isDatePast(date)} onClick={() => date && handleDateSelect(date)}
                className={cn("aspect-square p-2 text-sm rounded-lg transition-all hover:bg-primary/10",
                  !date && "invisible", isDatePast(date) && "text-muted-foreground/50 cursor-not-allowed",
                  isToday(date) && "border-2 border-primary", isDateSelected(date) && "bg-primary text-primary-foreground"
                )}>{date?.getDate()}</button>
            ))}
          </div>
        </CardContent>
      </Card>
      {selectedDate && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />{language === "fr" ? "Créneaux disponibles" : "Available Slots"}</CardTitle></CardHeader>
          <CardContent>
            {slotsLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div> :
             availableSlots?.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {availableSlots.map((slot: TimeSlot) => (
                  <button key={slot.id} disabled={!slot.available} onClick={() => setSelectedSlot(slot)}
                    className={cn("px-3 py-2 text-sm rounded-lg border", !slot.available && "bg-muted cursor-not-allowed",
                      selectedSlot?.id === slot.id && "bg-primary text-primary-foreground")}>{slot.startTime}</button>
                ))}
              </div>
            ) : <div className="text-center py-8 text-muted-foreground"><X className="h-8 w-8 mx-auto mb-2" />{language === "fr" ? "Aucun créneau" : "No slots"}</div>}
          </CardContent>
        </Card>
      )}
      {selectedSlot && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="pt-6 flex justify-between items-center">
            <div>
              <h4 className="font-semibold">{language === "fr" ? "Confirmer" : "Confirm"}</h4>
              <p className="text-sm text-muted-foreground"><Video className="h-4 w-4 inline mr-1" />{selectedSlot.startTime} • {sessionDuration}min</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedSlot(null)}>{language === "fr" ? "Annuler" : "Cancel"}</Button>
              <Button size="sm" onClick={handleBookSession} disabled={isBooking}>
                {isBooking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                {language === "fr" ? "Confirmer" : "Confirm"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default NativeCalendar;
