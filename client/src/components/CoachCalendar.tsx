import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  User,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  CalendarX,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Session {
  id: number;
  scheduledAt: Date;
  duration: number;
  status: string;
  sessionType: string;
  learnerName?: string;
  learnerEmail?: string;
  currentLevel?: string;
  targetLevel?: string;
  meetingLink?: string;
}

interface CoachCalendarProps {
  language?: "en" | "fr";
}

export function CoachCalendar({ language = "en" }: CoachCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // Fetch sessions for the current month
  const { data: sessionsData, isLoading, refetch } = trpc.coach.getMonthSessions.useQuery({
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
  });

  // Mutations
  const confirmMutation = trpc.coach.confirmSession.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Session confirmée" : "Session confirmed");
      refetch();
      setSelectedSession(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const declineMutation = trpc.coach.declineSession.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Session refusée" : "Session declined");
      refetch();
      setSelectedSession(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // @ts-expect-error - TS2339: auto-suppressed during TS cleanup
  const cancelMutation = trpc.coach.cancelSession.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Session annulée" : "Session cancelled");
      refetch();
      setSelectedSession(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showReschedule, setShowReschedule] = useState(false);
  const [newDateTime, setNewDateTime] = useState("");

  const rescheduleMutation = (trpc as any).session.reschedule.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Session reprogrammée" : "Session rescheduled");
      refetch();
      setSelectedSession(null);
      setShowReschedule(false);
      setNewDateTime("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Calendar calculations
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthNames = language === "fr" 
    ? ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
    : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const dayNames = language === "fr"
    ? ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Group sessions by date
  const sessionsByDate = useMemo(() => {
    if (!sessionsData?.sessions) return {};
    const grouped: Record<string, Session[]> = {};
    sessionsData.sessions.forEach((session: any) => {
      const dateKey = new Date(session.scheduledAt).toDateString();
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(session);
    });
    return grouped;
  }, [sessionsData]);

  // Get sessions for selected date
  const selectedDateSessions = useMemo(() => {
    if (!selectedDate) return [];
    return sessionsByDate[selectedDate.toDateString()] || [];
  }, [selectedDate, sessionsByDate]);

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
    setSelectedDate(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "cancelled": return "bg-red-500";
      case "completed": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      confirmed: { variant: "default", label: language === "fr" ? "Confirmée" : "Confirmed" },
      pending: { variant: "secondary", label: language === "fr" ? "En attente" : "Pending" },
      cancelled: { variant: "destructive", label: language === "fr" ? "Annulée" : "Cancelled" },
      completed: { variant: "outline", label: language === "fr" ? "Terminée" : "Completed" },
    };
    const config = variants[status] || { variant: "outline" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString(language === "fr" ? "fr-CA" : "en-CA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Grid */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-teal-600" />
            {language === "fr" ? "Calendrier des Sessions" : "Session Calendar"}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-semibold min-w-[150px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
          ) : (
            <>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before first day of month */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-24 bg-muted/30 rounded-lg" />
                ))}
                
                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateKey = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                  const daySessions = sessionsByDate[dateKey] || [];
                  const isSelected = selectedDate?.toDateString() === dateKey;
                  
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                      className={cn(
                        "h-24 p-1 rounded-lg border transition-all text-left flex flex-col",
                        isToday(day) && "ring-2 ring-teal-500",
                        isSelected && "bg-teal-50 border-teal-500",
                        !isSelected && "hover:bg-muted/50 border-transparent",
                        daySessions.length > 0 && !isSelected && "bg-blue-50/50"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-medium",
                        isToday(day) && "text-teal-600"
                      )}>
                        {day}
                      </span>
                      <div className="flex-1 overflow-hidden space-y-0.5 mt-1">
                        {daySessions.slice(0, 3).map((session, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "text-xs px-1 py-0.5 rounded truncate text-white",
                              getStatusColor(session.status)
                            )}
                          >
                            {formatTime(session.scheduledAt)}
                          </div>
                        ))}
                        {daySessions.length > 3 && (
                          <div className="text-xs text-muted-foreground px-1">
                            +{daySessions.length - 3} {language === "fr" ? "autres" : "more"}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Selected Date Sessions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            {selectedDate 
              ? selectedDate.toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA", { 
                  weekday: "long", 
                  month: "long", 
                  day: "numeric" 
                })
              : (language === "fr" ? "Sélectionnez une date" : "Select a date")
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedDate ? (
            <p className="text-muted-foreground text-sm">
              {language === "fr" 
                ? "Cliquez sur une date pour voir les sessions" 
                : "Click on a date to view sessions"}
            </p>
          ) : selectedDateSessions.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground">
                {language === "fr" ? "Aucune session ce jour" : "No sessions this day"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className="w-full p-3 rounded-lg border hover:bg-muted/50 transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{formatTime(session.scheduledAt)}</span>
                    </div>
                    {getStatusBadge(session.status)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>{session.learnerName || "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Video className="w-4 h-4" />
                    <span>{session.sessionType} • {session.duration} min</span>
                  </div>
                  {session.currentLevel && session.targetLevel && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {session.currentLevel} → {session.targetLevel}
                      </Badge>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Detail Dialog */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-teal-600" />
              {language === "fr" ? "Détails de la Session" : "Session Details"}
            </DialogTitle>
            <DialogDescription>
              {selectedSession && formatTime(selectedSession.scheduledAt)} • {selectedSession?.duration} min
            </DialogDescription>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                {getStatusBadge(selectedSession.status)}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{selectedSession.learnerName}</span>
                </div>
                {selectedSession.learnerEmail && (
                  <div className="text-sm text-muted-foreground ml-6">
                    {selectedSession.learnerEmail}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {selectedSession.sessionType}
                </Badge>
                {selectedSession.currentLevel && selectedSession.targetLevel && (
                  <Badge variant="secondary">
                    {selectedSession.currentLevel} → {selectedSession.targetLevel}
                  </Badge>
                )}
              </div>

              {selectedSession.meetingLink && selectedSession.status === "confirmed" && (
                <Button className="w-full" asChild>
                  <a href={selectedSession.meetingLink} target="_blank" rel="noopener noreferrer">
                    <Video className="w-4 h-4 mr-2" />
                    {language === "fr" ? "Rejoindre la Session" : "Join Session"}
                  </a>
                </Button>
              )}

              {selectedSession.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => confirmMutation.mutate({ sessionId: selectedSession.id })}
                    disabled={confirmMutation.isPending}
                  >
                    {confirmMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    {language === "fr" ? "Confirmer" : "Confirm"}
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => declineMutation.mutate({ sessionId: selectedSession.id })}
                    disabled={declineMutation.isPending}
                  >
                    {declineMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    {language === "fr" ? "Refuser" : "Decline"}
                  </Button>
                </div>
              )}

              {/* Action buttons for confirmed sessions */}
              {selectedSession.status === "confirmed" && !showCancelConfirm && !showReschedule && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowReschedule(true)}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {language === "fr" ? "Reprogrammer" : "Reschedule"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setShowCancelConfirm(true)}
                  >
                    <CalendarX className="w-4 h-4 mr-2" />
                    {language === "fr" ? "Annuler" : "Cancel"}
                  </Button>
                </div>
              )}

              {/* Reschedule form */}
              {selectedSession.status === "confirmed" && showReschedule && (
                <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 font-medium">
                    {language === "fr" 
                      ? "Sélectionnez une nouvelle date et heure" 
                      : "Select a new date and time"}
                  </p>
                  <input
                    type="datetime-local"
                    value={newDateTime}
                    onChange={(e) => setNewDateTime(e.target.value)}
                    min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                    className="w-full px-3 py-2 text-sm border rounded-md"
                  />
                  <p className="text-xs text-blue-600">
                    {language === "fr" 
                      ? "Note: La reprogrammation doit être faite au moins 24h à l'avance" 
                      : "Note: Rescheduling must be done at least 24h in advance"}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setShowReschedule(false);
                        setNewDateTime("");
                      }}
                    >
                      {language === "fr" ? "Annuler" : "Cancel"}
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        if (newDateTime) {
                          rescheduleMutation.mutate({ 
                            sessionId: selectedSession.id,
                            newDateTime: new Date(newDateTime).toISOString()
                          });
                        }
                      }}
                      disabled={rescheduleMutation.isPending || !newDateTime}
                    >
                      {rescheduleMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      {language === "fr" ? "Confirmer" : "Confirm"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Cancel confirmation */}
              {selectedSession.status === "confirmed" && showCancelConfirm && (
                <div className="space-y-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700 font-medium">
                    {language === "fr" 
                      ? "Êtes-vous sûr de vouloir annuler cette session?" 
                      : "Are you sure you want to cancel this session?"}
                  </p>
                  <input
                    type="text"
                    placeholder={language === "fr" ? "Raison (optionnel)" : "Reason (optional)"}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-md"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setShowCancelConfirm(false);
                        setCancelReason("");
                      }}
                    >
                      {language === "fr" ? "Non, garder" : "No, keep it"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        cancelMutation.mutate({ 
                          sessionId: selectedSession.id,
                          reason: cancelReason || undefined
                        });
                      }}
                      disabled={cancelMutation.isPending}
                    >
                      {cancelMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <CalendarX className="w-4 h-4 mr-2" />
                      )}
                      {language === "fr" ? "Oui, annuler" : "Yes, cancel"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
