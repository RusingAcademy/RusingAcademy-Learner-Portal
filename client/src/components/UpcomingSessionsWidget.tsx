import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, Video, MessageSquare, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isTomorrow, differenceInMinutes } from "date-fns";
import { fr, enUS } from "date-fns/locale";

interface UpcomingSession {
  id: number;
  studentName: string;
  studentAvatar?: string;
  sessionType: "video" | "chat" | "ai";
  startTime: Date;
  duration: number; // minutes
  topic?: string;
  meetingUrl?: string;
}

interface UpcomingSessionsWidgetProps {
  sessions: UpcomingSession[];
  language?: "en" | "fr";
  className?: string;
  onJoinSession?: (sessionId: number, meetingUrl?: string) => void;
  onViewAll?: () => void;
}

export function UpcomingSessionsWidget({ 
  sessions, 
  language = "en", 
  className,
  onJoinSession,
  onViewAll
}: UpcomingSessionsWidgetProps) {
  const labels = {
    en: {
      title: "Upcoming Sessions",
      subtitle: "Your scheduled coaching sessions",
      today: "Today",
      tomorrow: "Tomorrow",
      join: "Join",
      viewAll: "View All",
      noSessions: "No upcoming sessions",
      minutes: "min",
      startsIn: "Starts in",
      starting: "Starting now",
    },
    fr: {
      title: "Sessions à Venir",
      subtitle: "Vos sessions de coaching planifiées",
      today: "Aujourd'hui",
      tomorrow: "Demain",
      join: "Rejoindre",
      viewAll: "Voir Tout",
      noSessions: "Aucune session à venir",
      minutes: "min",
      startsIn: "Commence dans",
      starting: "Commence maintenant",
    },
  };

  const l = labels[language];
  const locale = language === "fr" ? fr : enUS;

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getSessionIcon = (type: "video" | "chat" | "ai") => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "chat":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return l.today;
    if (isTomorrow(date)) return l.tomorrow;
    return format(date, "EEE, MMM d", { locale });
  };

  const getTimeUntil = (date: Date) => {
    const minutesUntil = differenceInMinutes(date, new Date());
    if (minutesUntil <= 0) return l.starting;
    if (minutesUntil < 60) return `${l.startsIn} ${minutesUntil} ${l.minutes}`;
    const hours = Math.floor(minutesUntil / 60);
    const mins = minutesUntil % 60;
    return `${l.startsIn} ${hours}h ${mins > 0 ? `${mins}m` : ""}`;
  };

  const isSessionSoon = (date: Date) => {
    const minutesUntil = differenceInMinutes(date, new Date());
    return minutesUntil <= 15 && minutesUntil >= -5;
  };

  // Sort sessions by start time
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 border-b border-emerald-200/50 dark:border-emerald-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 dark:bg-emerald-500/30">
              <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-900 dark:text-white">{l.title}</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">{l.subtitle}</p>
            </div>
          </div>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll} className="text-emerald-600 hover:text-emerald-700">
              {l.viewAll}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-3">
        {sortedSessions.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>{l.noSessions}</p>
          </div>
        ) : (
          sortedSessions.slice(0, 5).map((session) => {
            const sessionDate = new Date(session.startTime);
            const isSoon = isSessionSoon(sessionDate);
            
            return (
              <div
                key={session.id}
                className={cn(
                  "p-4 rounded-xl border transition-all",
                  isSoon
                    ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 animate-pulse"
                    : "bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700"
                )}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-sm">
                      {getInitials(session.studentName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                        {session.studentName}
                      </h4>
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        {getSessionIcon(session.sessionType)}
                        {session.duration} {l.minutes}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>{getDateLabel(sessionDate)}</span>
                      <span>•</span>
                      <span>{format(sessionDate, "HH:mm", { locale })}</span>
                      {isSoon && (
                        <Badge className="bg-emerald-500 text-white text-xs ml-2">
                          {getTimeUntil(sessionDate)}
                        </Badge>
                      )}
                    </div>
                    
                    {session.topic && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                        {session.topic}
                      </p>
                    )}
                  </div>
                  
                  {isSoon && session.meetingUrl && (
                    <Button
                      size="sm"
                      onClick={() => onJoinSession?.(session.id, session.meetingUrl)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      <Video className="h-4 w-4 mr-1" />
                      {l.join}
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

export default UpcomingSessionsWidget;
