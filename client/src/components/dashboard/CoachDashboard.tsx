import { useState } from "react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Clock,
  Video,
  ChevronRight,
  Users,
  DollarSign,
  Star,
  MessageSquare,
  Settings,
  FileText,
  TrendingUp,
  CalendarDays,
  ExternalLink,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface User {
  id: number;
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  role?: string;
}

interface CoachDashboardProps {
  user: User;
}

export default function CoachDashboardContent({ user }: CoachDashboardProps) {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [selectedLearner, setSelectedLearner] = useState<number | null>(null);
  const [sessionNotes, setSessionNotes] = useState<Record<number, string>>({});

  // Fetch coach data
  const { data: coachProfile, isLoading: profileLoading } = trpc.coach.getMyProfile.useQuery();
  const { data: upcomingSessions, isLoading: sessionsLoading } = trpc.coach.getUpcomingSessions.useQuery();
  const { data: myLearners, isLoading: learnersLoading } = trpc.coach.getMyLearners.useQuery();
  const { data: earnings, isLoading: earningsLoading } = trpc.coach.getEarningsSummary.useQuery();

  const firstName = user.name?.split(" ")[0] || "Coach";

  // Labels
  const labels = {
    greeting: isEn ? `Welcome back, ${firstName}!` : `Bon retour, ${firstName}!`,
    subtitle: isEn ? "Manage your coaching sessions" : "Gérez vos sessions de coaching",
    todaySessions: isEn ? "Today's Sessions" : "Sessions d'aujourd'hui",
    thisWeek: isEn ? "This Week" : "Cette semaine",
    next7Days: isEn ? "Next 7 Days" : "7 prochains jours",
    myLearners: isEn ? "My Learners" : "Mes apprenants",
    sessionNotes: isEn ? "Session Notes" : "Notes de session",
    earnings: isEn ? "Earnings" : "Revenus",
    viewAll: isEn ? "View All" : "Voir tout",
    noSessions: isEn ? "No sessions scheduled" : "Aucune session prévue",
    noLearners: isEn ? "No learners yet" : "Aucun apprenant",
    join: isEn ? "Join" : "Rejoindre",
    viewProfile: isEn ? "View Profile" : "Voir le profil",
    addNote: isEn ? "Add Note" : "Ajouter une note",
    saveNote: isEn ? "Save" : "Enregistrer",
    totalEarnings: isEn ? "Total Earnings" : "Revenus totaux",
    pendingPayout: isEn ? "Pending Payout" : "Paiement en attente",
    sessionsCompleted: isEn ? "Sessions Completed" : "Sessions terminées",
    avgRating: isEn ? "Average Rating" : "Note moyenne",
    stripeConnected: isEn ? "Stripe Connected" : "Stripe connecté",
    stripeNotConnected: isEn ? "Connect Stripe to receive payments" : "Connectez Stripe pour recevoir des paiements",
    connectStripe: isEn ? "Connect Stripe" : "Connecter Stripe",
    viewEarnings: isEn ? "View Earnings" : "Voir les revenus",
    quickLinks: isEn ? "Quick Links" : "Liens rapides",
    availability: isEn ? "Set Availability" : "Définir disponibilité",
    guide: isEn ? "Coach Guide" : "Guide du coach",
  };

  // Get today's sessions
  const today = new Date().toDateString();
  const todaySessions = upcomingSessions?.filter((s: any) => 
    new Date(s.scheduledAt).toDateString() === today
  ) || [];

  // Get this week's sessions
  const weekFromNow = new Date();
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  const weekSessions = upcomingSessions?.filter((s: any) => {
    const sessionDate = new Date(s.scheduledAt);
    return sessionDate <= weekFromNow;
  }) || [];

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />

      <main id="main-content" className="flex-1" role="main" aria-label={isEn ? "Coach Dashboard" : "Tableau de bord coach"}>
        <div className="container py-8 max-w-7xl mx-auto px-4">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary/20">
                <AvatarImage src={user.avatarUrl || undefined} alt={user.name || "Coach"} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {firstName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{labels.greeting}</h1>
                <p className="text-muted-foreground">{labels.subtitle}</p>
              </div>
            </div>
            
            {/* Quick Links */}
            <div className="flex flex-wrap gap-2">
              <Link href="/coach/earnings">
                <Button variant="outline" size="sm" className="gap-2">
                  <DollarSign className="h-4 w-4" />
                  {labels.viewEarnings}
                </Button>
              </Link>
              <Link href="/app/coach-guide">
                <Button variant="outline" size="sm" className="gap-2">
                  <FileText className="h-4 w-4" />
                  {labels.guide}
                </Button>
              </Link>
              <Link href="/app/settings">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Today's Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    {labels.todaySessions}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sessionsLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : todaySessions.length > 0 ? (
                    <div className="space-y-3">
                      {todaySessions.map((session: any) => (
                        <div key={session.id} className="flex items-center gap-4 p-4 rounded-lg border bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {session.learnerName?.split(" ").map((n: string) => n[0]).join("") || "L"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{session.learnerName}</p>
                            <p className="text-sm text-muted-foreground">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {new Date(session.scheduledAt).toLocaleTimeString(language === "fr" ? "fr-CA" : "en-CA", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              {" • "}
                              {session.duration} min
                            </p>
                          </div>
                          {session.meetingUrl && (
                            <a href={session.meetingUrl} target="_blank" rel="noopener noreferrer">
                              <Button className="gap-2">
                                <Video className="h-4 w-4" />
                                {labels.join}
                              </Button>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{labels.noSessions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* This Week */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    {labels.next7Days}
                  </CardTitle>
                  <Badge variant="secondary">{weekSessions.length} sessions</Badge>
                </CardHeader>
                <CardContent>
                  {sessionsLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : weekSessions.length > 0 ? (
                    <div className="space-y-3">
                      {weekSessions.slice(0, 5).map((session: any) => (
                        <div key={session.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                          <div className="text-center min-w-[60px]">
                            <p className="text-xs text-muted-foreground uppercase">
                              {new Date(session.scheduledAt).toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA", { weekday: "short" })}
                            </p>
                            <p className="text-lg font-bold">
                              {new Date(session.scheduledAt).getDate()}
                            </p>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{session.learnerName}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(session.scheduledAt).toLocaleTimeString(language === "fr" ? "fr-CA" : "en-CA", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <Badge variant={session.status === "confirmed" ? "default" : "secondary"}>
                            {session.status}
                          </Badge>
                        </div>
                      ))}
                      {weekSessions.length > 5 && (
                        <Button variant="ghost" className="w-full gap-2">
                          {labels.viewAll} ({weekSessions.length - 5} more)
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <p>{labels.noSessions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* My Learners */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    {labels.myLearners}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {learnersLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : myLearners?.length ? (
                    <div className="space-y-3">
                      {myLearners.slice(0, 6).map((learner: any) => (
                        <div key={learner.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {learner.name?.split(" ").map((n: string) => n[0]).join("") || "L"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{learner.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {learner.sessionsCount} sessions • {learner.level || "N/A"}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedLearner(learner.id)}>
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{labels.noLearners}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-6">
              
              {/* Earnings Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    {labels.earnings}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {earningsLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : coachProfile?.stripeAccountId ? (
                    <div className="space-y-4">
                      {/* Total Earnings */}
                      <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                        <p className="text-sm text-muted-foreground">{labels.totalEarnings}</p>
                        <p className="text-2xl font-bold text-green-600">
                          ${(((earnings as any)?.totalEarnings || (earnings as any)?.totalNet || 0) / 100).toFixed(2)} CAD
                        </p>
                      </div>

                      {/* Pending Payout */}
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">{labels.pendingPayout}</p>
                        <p className="text-xl font-bold">
                          ${(((earnings as any)?.pendingPayout || (earnings as any)?.pendingPayouts || 0) / 100).toFixed(2)} CAD
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-muted/50 text-center">
                          <p className="text-2xl font-bold">{(earnings as any)?.sessionsCompleted || (earnings as any)?.sessionCount || 0}</p>
                          <p className="text-xs text-muted-foreground">{labels.sessionsCompleted}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50 text-center">
                          <p className="text-2xl font-bold flex items-center justify-center gap-1">
                            {(earnings as any)?.avgRating?.toFixed(1) || "N/A"}
                            <Star className="h-4 w-4 text-amber-500" />
                          </p>
                          <p className="text-xs text-muted-foreground">{labels.avgRating}</p>
                        </div>
                      </div>

                      <Link href="/coach/earnings">
                        <Button variant="outline" className="w-full gap-2">
                          {labels.viewEarnings}
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground mb-4">{labels.stripeNotConnected}</p>
                      <Link href="/coach/earnings">
                        <Button className="gap-2">
                          <DollarSign className="h-4 w-4" />
                          {labels.connectStripe}
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Session Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {labels.sessionNotes}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedLearner ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {isEn ? "Notes for learner" : "Notes pour l'apprenant"}
                      </p>
                      <Textarea
                        placeholder={isEn ? "Add session notes..." : "Ajouter des notes..."}
                        value={sessionNotes[selectedLearner] || ""}
                        onChange={(e) => setSessionNotes({ ...sessionNotes, [selectedLearner]: e.target.value })}
                        rows={4}
                      />
                      <Button size="sm" className="w-full">
                        {labels.saveNote}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">
                        {isEn ? "Select a learner to view/add notes" : "Sélectionnez un apprenant pour voir/ajouter des notes"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stripe Status */}
              {coachProfile?.stripeAccountId && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">{labels.stripeConnected}</p>
                        <p className="text-xs text-muted-foreground">
                          {isEn ? "Ready to receive payments" : "Prêt à recevoir des paiements"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
