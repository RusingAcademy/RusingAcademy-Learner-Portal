import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Video,
  MessageSquare,
  Star,
  ChevronRight,
  CalendarClock,
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  History,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import RescheduleModal from "@/components/RescheduleModal";
import { CancellationModal } from "@/components/CancellationModal";
import { useAppLayout } from "@/contexts/AppLayoutContext";

export default function MySessions() {
  const { isInsideAppLayout } = useAppLayout();
  const { language } = useLanguage();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [rescheduleSession, setRescheduleSession] = useState<{
    id: number;
    coachId: number;
    coachName: string;
    date: Date;
  } | null>(null);
  const [cancelSession, setCancelSession] = useState<{
    id: number;
    coachName: string;
    date: string;
    time: string;
    price: number;
  } | null>(null);

  // Fetch upcoming sessions
  const { data: upcomingSessions, isLoading: loadingUpcoming, refetch: refetchUpcoming } = 
    trpc.learner.upcomingSessions.useQuery(undefined, { enabled: isAuthenticated });

  // Fetch past sessions
  const { data: pastSessions, isLoading: loadingPast } = 
    trpc.learner.pastSessions.useQuery(undefined, { enabled: isAuthenticated });

  // Fetch cancelled sessions
  const { data: cancelledSessions, isLoading: loadingCancelled } = 
    trpc.learner.cancelledSessions.useQuery(undefined, { enabled: isAuthenticated });

  const labels = {
    en: {
      title: "My Sessions",
      subtitle: "Manage your coaching sessions",
      upcoming: "Upcoming",
      past: "Past",
      cancelled: "Cancelled",
      noUpcoming: "No upcoming sessions",
      noPast: "No past sessions",
      noCancelled: "No cancelled sessions",
      bookSession: "Book a Session",
      findCoach: "Find a Coach",
      join: "Join",
      reschedule: "Reschedule",
      cancel: "Cancel",
      viewProfile: "View Profile",
      leaveReview: "Leave Review",
      minutes: "min",
      trial: "Trial",
      regular: "Regular",
      completed: "Completed",
      noShow: "No Show",
      sessionWith: "Session with",
      loginRequired: "Please log in to view your sessions",
      login: "Log In",
    },
    fr: {
      title: "Mes séances",
      subtitle: "Gérez vos séances de coaching",
      upcoming: "À venir",
      past: "Passées",
      cancelled: "Annulées",
      noUpcoming: "Aucune séance à venir",
      noPast: "Aucune séance passée",
      noCancelled: "Aucune séance annulée",
      bookSession: "Réserver une séance",
      findCoach: "Trouver un coach",
      join: "Rejoindre",
      reschedule: "Reporter",
      cancel: "Annuler",
      viewProfile: "Voir le profil",
      leaveReview: "Laisser un avis",
      minutes: "min",
      trial: "Essai",
      regular: "Régulière",
      completed: "Terminée",
      noShow: "Absent",
      sessionWith: "Séance avec",
      loginRequired: "Veuillez vous connecter pour voir vos séances",
      login: "Connexion",
    },
  };

  const l = labels[language];

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {!isInsideAppLayout && <Header />}
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        {!isInsideAppLayout && <Footer />}
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {!isInsideAppLayout && <Header />}
        <main className="flex-1 flex items-center justify-center py-12">
          <Card className="max-w-md w-full mx-4 text-center">
            <CardContent className="pt-8 pb-8">
              <AlertCircle className="h-12 w-12 mx-auto text-slate-900 dark:text-slate-100 mb-4" />
              <h2 className="text-xl font-semibold mb-2">{l.loginRequired}</h2>
              <Button className="mt-4" onClick={() => window.location.href = getLoginUrl()}>
                {l.login}
              </Button>
            </CardContent>
          </Card>
        </main>
        {!isInsideAppLayout && <Footer />}
      </div>
    );
  }

  const formatSessionDate = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatSessionTime = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString(language === "fr" ? "fr-CA" : "en-CA", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-emerald-100 text-emerald-800">Confirmed</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">{l.completed}</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case "no_show":
        return <Badge className="bg-amber-100 text-amber-800">{l.noShow}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!isInsideAppLayout && <Header />}

      <main className="flex-1 py-8">
        <div className="container max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">{l.title}</h1>
              <p className="text-slate-900 dark:text-slate-100">{l.subtitle}</p>
            </div>
            <Link href="/coaches">
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                {l.bookSession}
              </Button>
            </Link>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="upcoming" className="gap-2">
                <Calendar className="h-4 w-4" />
                {l.upcoming}
              </TabsTrigger>
              <TabsTrigger value="past" className="gap-2">
                <History className="h-4 w-4" />
                {l.past}
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="gap-2">
                <XCircle className="h-4 w-4" />
                {l.cancelled}
              </TabsTrigger>
            </TabsList>

            {/* Upcoming Sessions */}
            <TabsContent value="upcoming">
              {loadingUpcoming ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : upcomingSessions && upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.map((item: any) => {
                    const session = item.session;
                    const coach = item.coach;
                    return (
                      <Card key={session.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex flex-col sm:flex-row">
                            {/* Date Column */}
                            <div className="bg-primary/5 p-4 sm:w-32 flex flex-col items-center justify-center text-center border-b sm:border-b-0 sm:border-r">
                              <p className="text-2xl font-bold text-primary">
                                {new Date(session.scheduledAt).getDate()}
                              </p>
                              <p className="text-sm text-slate-900 dark:text-slate-100">
                                {new Date(session.scheduledAt).toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA", { month: "short" })}
                              </p>
                              <p className="text-xs text-slate-900 dark:text-slate-100 mt-1">
                                {formatSessionTime(session.scheduledAt)}
                              </p>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-12 w-12">
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                      {coach?.name?.split(" ").map((n: string) => n[0]).join("") || "C"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-semibold">{coach?.name || "Coach"}</p>
                                    <div className="flex items-center gap-2 text-sm text-slate-900 dark:text-slate-100">
                                      <Clock className="h-3 w-3" />
                                      {session.duration || 60} {l.minutes}
                                      <span className="mx-1">•</span>
                                      <Badge variant="outline" className="text-xs">
                                        {session.sessionType === "trial" ? l.trial : l.regular}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                {getStatusBadge(session.status)}
                              </div>

                              {/* Actions */}
                              <div className="flex flex-wrap gap-2 mt-4">
                                <Button
                                  size="sm"
                                  onClick={() => session.meetingUrl && window.open(session.meetingUrl, '_blank')}
                                  disabled={!session.meetingUrl}
                                >
                                  <Video className="h-4 w-4 mr-2" />
                                  {l.join}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setRescheduleSession({
                                    id: session.id,
                                    coachId: session.coachId,
                                    coachName: coach?.name || "Coach",
                                    date: new Date(session.scheduledAt),
                                  })}
                                >
                                  <CalendarClock className="h-4 w-4 mr-2" />
                                  {l.reschedule}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-destructive hover:bg-destructive/10"
                                  onClick={() => setCancelSession({
                                    id: session.id,
                                    coachName: coach?.name || "Coach",
                                    date: formatSessionDate(session.scheduledAt),
                                    time: formatSessionTime(session.scheduledAt),
                                    price: session.price || 5500,
                                  })}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  {l.cancel}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="h-12 w-12 mx-auto text-slate-900 dark:text-slate-100 mb-4" />
                    <p className="text-slate-900 dark:text-slate-100 mb-4">{l.noUpcoming}</p>
                    <Link href="/coaches">
                      <Button>{l.findCoach}</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Past Sessions */}
            <TabsContent value="past">
              {loadingPast ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : pastSessions && pastSessions.length > 0 ? (
                <div className="space-y-4">
                  {pastSessions.map((item: any) => {
                    const session = item.session;
                    const coach = item.coach;
                    return (
                      <Card key={session.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex flex-col sm:flex-row">
                            <div className="bg-muted/50 p-4 sm:w-32 flex flex-col items-center justify-center text-center border-b sm:border-b-0 sm:border-r">
                              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {new Date(session.scheduledAt).getDate()}
                              </p>
                              <p className="text-sm text-slate-900 dark:text-slate-100">
                                {new Date(session.scheduledAt).toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA", { month: "short", year: "numeric" })}
                              </p>
                            </div>
                            <div className="flex-1 p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-12 w-12">
                                    {coach?.photoUrl ? (
                                      <AvatarImage src={coach.photoUrl} />
                                    ) : (
                                      <AvatarFallback className="bg-muted text-slate-900 dark:text-slate-100">
                                        {coach?.name?.split(" ").map((n: string) => n[0]).join("") || "C"}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                  <div>
                                    <p className="font-semibold">{coach?.name || "Coach"}</p>
                                    <div className="flex items-center gap-2 text-sm text-slate-900 dark:text-slate-100">
                                      <Clock className="h-3 w-3" />
                                      {session.duration || 60} {l.minutes}
                                      <span className="mx-1">•</span>
                                      <Badge variant="secondary" className="text-xs">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        {l.completed}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-4">
                                <Link href={`/coach/${coach?.slug}`}>
                                  <Button size="sm" variant="outline">
                                    {l.viewProfile}
                                  </Button>
                                </Link>
                                <Link href={`/coach/${coach?.slug}#reviews`}>
                                  <Button size="sm" variant="outline">
                                    <Star className="h-4 w-4 mr-2" />
                                    {l.leaveReview}
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <History className="h-12 w-12 mx-auto text-slate-900 dark:text-slate-100 mb-4" />
                    <p className="text-slate-900 dark:text-slate-100">{l.noPast}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Cancelled Sessions */}
            <TabsContent value="cancelled">
              {loadingCancelled ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : cancelledSessions && cancelledSessions.length > 0 ? (
                <div className="space-y-4">
                  {cancelledSessions.map((item: any) => {
                    const session = item.session;
                    const coach = item.coach;
                    return (
                      <Card key={session.id} className="overflow-hidden opacity-75">
                        <CardContent className="p-0">
                          <div className="flex flex-col sm:flex-row">
                            <div className="bg-destructive/10 p-4 sm:w-32 flex flex-col items-center justify-center text-center border-b sm:border-b-0 sm:border-r">
                              <p className="text-2xl font-bold text-destructive/70">
                                {new Date(session.scheduledAt).getDate()}
                              </p>
                              <p className="text-sm text-slate-900 dark:text-slate-100">
                                {new Date(session.scheduledAt).toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA", { month: "short", year: "numeric" })}
                              </p>
                            </div>
                            <div className="flex-1 p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-12 w-12 opacity-50">
                                    {coach?.photoUrl ? (
                                      <AvatarImage src={coach.photoUrl} />
                                    ) : (
                                      <AvatarFallback className="bg-muted text-slate-900 dark:text-slate-100">
                                        {coach?.name?.split(" ").map((n: string) => n[0]).join("") || "C"}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                  <div>
                                    <p className="font-semibold text-slate-900 dark:text-slate-100">{coach?.name || "Coach"}</p>
                                    <div className="flex items-center gap-2 text-sm text-slate-900 dark:text-slate-100">
                                      <Clock className="h-3 w-3" />
                                      {session.duration || 60} {l.minutes}
                                      <span className="mx-1">•</span>
                                      <Badge variant="destructive" className="text-xs">
                                        <XCircle className="h-3 w-3 mr-1" />
                                        {l.cancelled}
                                      </Badge>
                                    </div>
                                    {session.cancellationReason && (
                                      <p className="text-xs text-slate-900 dark:text-slate-100 mt-1">
                                        {session.cancellationReason}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-4">
                                <Link href={`/coach/${coach?.slug}`}>
                                  <Button size="sm" variant="outline">
                                    {l.bookSession}
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <XCircle className="h-12 w-12 mx-auto text-slate-900 dark:text-slate-100 mb-4" />
                    <p className="text-slate-900 dark:text-slate-100">{l.noCancelled}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {!isInsideAppLayout && <Footer />}

      {/* Reschedule Modal */}
      {rescheduleSession && (
        <RescheduleModal
          isOpen={!!rescheduleSession}
          onClose={() => setRescheduleSession(null)}
          sessionId={rescheduleSession.id}
          coachId={rescheduleSession.coachId}
          coachName={rescheduleSession.coachName}
          currentDate={rescheduleSession.date}
          onSuccess={() => {
            setRescheduleSession(null);
            refetchUpcoming();
            toast.success(language === "fr" ? "Séance reportée avec succès" : "Session rescheduled successfully");
          }}
        />
      )}

      {/* Cancellation Modal */}
      {cancelSession && (
        <CancellationModal
          isOpen={!!cancelSession}
          onClose={() => setCancelSession(null)}
          session={{
            id: cancelSession.id,
            coachName: cancelSession.coachName,
            date: cancelSession.date,
            time: cancelSession.time,
            price: cancelSession.price,
          }}
          onCancelled={() => {
            setCancelSession(null);
            refetchUpcoming();
            toast.success(language === "fr" ? "Séance annulée" : "Session cancelled");
          }}
        />
      )}
    </div>
  );
}
