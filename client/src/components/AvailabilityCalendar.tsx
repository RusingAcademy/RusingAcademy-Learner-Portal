import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  isBefore,
  startOfDay,
  getDay,
} from "date-fns";
import { fr, enUS } from "date-fns/locale";

interface AvailabilityCalendarProps {
  coachId: number;
  coachName: string;
  trialRate?: number;
  hourlyRate?: number;
  onSelectSlot?: (date: Date, time: string, sessionType: "trial" | "single") => void;
  selectedDate?: Date;
  selectedTime?: string;
  sessionType?: "trial" | "single";
  onSessionTypeChange?: (type: "trial" | "single") => void;
}

export function AvailabilityCalendar({
  coachId,
  coachName,
  trialRate = 3500,
  hourlyRate = 6700,
  onSelectSlot,
  selectedDate,
  selectedTime,
  sessionType = "trial",
  onSessionTypeChange,
}: AvailabilityCalendarProps) {
  const { language } = useLanguage();
  const isEn = language === "en";
  const locale = isEn ? enUS : fr;
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  // Fetch available time slots for selected date
  const { data: availableSlots, isLoading: slotsLoading } = trpc.coach.availableSlots.useQuery(
    { coachId, date: selectedDate?.toISOString() || "" },
    { enabled: !!selectedDate }
  );

  // Default time slots if none configured
  const defaultTimeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM", "6:00 PM"];
  const timeSlots = availableSlots && availableSlots.length > 0 ? availableSlots : defaultTimeSlots;

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Add padding days from previous month
    const startPadding = getDay(monthStart);
    const paddingDays: (Date | null)[] = Array(startPadding).fill(null);
    
    return [...paddingDays, ...days];
  }, [currentMonth]);

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (date: Date) => {
    if (isBefore(startOfDay(date), startOfDay(new Date()))) return;
    if (onSelectSlot && selectedTime) {
      onSelectSlot(date, selectedTime, sessionType);
    } else if (onSelectSlot) {
      // Just select the date, time will be selected next
      onSelectSlot(date, "", sessionType);
    }
  };

  const handleTimeClick = (time: string) => {
    if (selectedDate && onSelectSlot) {
      onSelectSlot(selectedDate, time, sessionType);
    }
  };

  const isDateAvailable = (date: Date) => {
    // For now, assume all future dates are potentially available
    // In a real app, this would check against coach's availability schedule
    return !isBefore(startOfDay(date), startOfDay(new Date()));
  };

  const weekDays = isEn 
    ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    : ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {isEn ? "Book a Session" : "Réserver une séance"}
          </CardTitle>
          <Badge variant="outline" className="bg-background">
            <CalendarIcon className="h-3 w-3 mr-1" />
            {isEn ? "Live Availability" : "Disponibilité en direct"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Session Type Selection */}
        <div className="p-4 border-b bg-muted/30">
          <p className="text-sm text-muted-foreground mb-3">
            {isEn ? "Select session type:" : "Sélectionnez le type de séance:"}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onSessionTypeChange?.("trial")}
              className={cn(
                "p-3 rounded-lg border-2 text-left transition-all",
                sessionType === "trial"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">
                  {isEn ? "Trial Session" : "Séance d'essai"}
                </span>
                {sessionType === "trial" && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">30 min</p>
              <p className="text-lg font-bold text-primary mt-1">
                ${(trialRate / 100).toFixed(0)}
              </p>
            </button>
            
            <button
              onClick={() => onSessionTypeChange?.("single")}
              className={cn(
                "p-3 rounded-lg border-2 text-left transition-all",
                sessionType === "single"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">
                  {isEn ? "Regular Session" : "Séance régulière"}
                </span>
                {sessionType === "single" && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">60 min</p>
              <p className="text-lg font-bold text-primary mt-1">
                ${(hourlyRate / 100).toFixed(0)}
              </p>
            </button>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreviousMonth}
              disabled={isSameMonth(currentMonth, new Date())}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="font-semibold capitalize">
              {format(currentMonth, "MMMM yyyy", { locale })}
            </h3>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isAvailable = isDateAvailable(day);
              const isPast = isBefore(startOfDay(day), startOfDay(new Date()));
              const isTodayDate = isToday(day);
              const isHovered = hoveredDate && isSameDay(day, hoveredDate);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDateClick(day)}
                  onMouseEnter={() => setHoveredDate(day)}
                  onMouseLeave={() => setHoveredDate(null)}
                  disabled={isPast}
                  className={cn(
                    "aspect-square rounded-lg text-sm font-medium transition-all relative",
                    "flex items-center justify-center",
                    isPast && "text-muted-foreground/40 cursor-not-allowed",
                    !isPast && isAvailable && "hover:bg-primary/10 cursor-pointer",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                    isTodayDate && !isSelected && "ring-2 ring-primary ring-offset-2",
                    isHovered && !isSelected && !isPast && "bg-primary/5"
                  )}
                >
                  {format(day, "d")}
                  {isAvailable && !isPast && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {isEn ? "Available times for" : "Heures disponibles pour"}{" "}
                {format(selectedDate, "EEEE, MMMM d", { locale })}
              </span>
            </div>

            {slotsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : timeSlots.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => handleTimeClick(time)}
                    className={cn(
                      "py-2 px-3 rounded-lg text-sm font-medium transition-all border",
                      selectedTime === time
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-primary hover:bg-primary/5"
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {isEn 
                  ? "No available times for this date"
                  : "Aucune disponibilité pour cette date"}
              </p>
            )}
          </div>
        )}

        {/* Selection Summary */}
        {selectedDate && selectedTime && (
          <div className="p-4 bg-primary/5 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isEn ? "Selected:" : "Sélectionné:"}
                </p>
                <p className="font-semibold">
                  {format(selectedDate, "EEEE, MMMM d", { locale })} {isEn ? "at" : "à"} {selectedTime}
                </p>
                <p className="text-sm text-muted-foreground">
                  {sessionType === "trial" 
                    ? (isEn ? "30 min trial session" : "Séance d'essai de 30 min")
                    : (isEn ? "60 min regular session" : "Séance régulière de 60 min")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  ${((sessionType === "trial" ? trialRate : hourlyRate) / 100).toFixed(0)}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
