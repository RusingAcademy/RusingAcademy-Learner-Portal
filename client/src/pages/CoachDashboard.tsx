import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAppLayout } from "@/contexts/AppLayoutContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  Star,
  TrendingUp,
  Video,
  MessageSquare,
  Settings,
  ChevronRight,
  CheckCircle,
  XCircle,
  CreditCard,
  ExternalLink,
  AlertCircle,
  Loader2,
  BookOpen,
  BarChart3,
} from "lucide-react";
import { Link } from "wouter";
import { RoleSwitcherCompact } from "@/components/RoleSwitcher";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { AvailabilityManager } from "@/components/AvailabilityManager";
import { CoachSetupWizard } from "@/components/CoachSetupWizard";
import { CoachOnboardingChecklist } from "@/components/CoachOnboardingChecklist";
import { CalendarSettingsCard } from "@/components/CalendarSettingsCard";
import CoachPhotoGallery from "@/components/CoachPhotoGallery";
import { LearnerMetricsPanel } from "@/components/LearnerMetricsPanel";
import { CoachAnalytics } from "@/components/CoachAnalytics";
import { CoachCalendar } from "@/components/CoachCalendar";
import { StatCard, ProgressRing } from "@/components/dashboard";
import { Percent, Wallet } from "lucide-react";
import { StudentProgressWidget } from "@/components/StudentProgressWidget";
import { UpcomingSessionsWidget } from "@/components/UpcomingSessionsWidget";

export default function CoachDashboard() {
  const { isInsideAppLayout } = useAppLayout();
  const { language } = useLanguage();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Helper: conditionally wrap content with Header/Footer when standalone
  const Wrap = ({ children, className = "bg-background" }: { children: React.ReactNode; className?: string }) => {
    if (isInsideAppLayout) return <>{children}</>;
    return (
      <div className={`min-h-screen flex flex-col ${className}`}>
        <Header />
        {children}
        <Footer />
      </div>
    );
  };
  const [activeTab, setActiveTab] = useState("overview");
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);

  // Fetch coach profile
  const { data: coachProfile, isLoading: profileLoading } = trpc.coach.myProfile.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Fetch Stripe account status
  const { data: stripeStatus, isLoading: stripeLoading, refetch: refetchStripeStatus } = trpc.stripe.accountStatus.useQuery(
    undefined,
    { enabled: isAuthenticated && !!coachProfile }
  );

  // Fetch coach earnings summary
  const { data: earningsSummary } = trpc.coach.getEarningsSummaryV2.useQuery(
    undefined,
    { enabled: isAuthenticated && !!coachProfile }
  );

  // Fetch today's sessions
  const { data: todaysSessionsData, refetch: refetchTodaysSessions } = trpc.coach.getTodaysSessions.useQuery(
    undefined,
    { enabled: isAuthenticated && !!coachProfile }
  );

  // Fetch pending requests
  const { data: pendingRequestsData, refetch: refetchPendingRequests } = trpc.coach.getPendingRequests.useQuery(
    undefined,
    { enabled: isAuthenticated && !!coachProfile }
  );

  // Confirm session mutation
  const confirmSessionMutation = trpc.coach.confirmSession.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Session confirmée" : "Session confirmed");
      refetchPendingRequests();
      refetchTodaysSessions();
    },
    onError: (error) => {
      toast.error(error.message || (language === "fr" ? "Échec de la confirmation" : "Failed to confirm session"));
    },
  });

  // Decline session mutation
  const declineSessionMutation = trpc.coach.declineSession.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Session refusée" : "Session declined");
      refetchPendingRequests();
    },
    onError: (error) => {
      toast.error(error.message || (language === "fr" ? "Échec du refus" : "Failed to decline session"));
    },
  });

  const handleConfirmSession = (sessionId: number) => {
    confirmSessionMutation.mutate({ sessionId });
  };

  const handleDeclineSession = (sessionId: number) => {
    declineSessionMutation.mutate({ sessionId });
  };

  const handleJoinSession = (meetingUrl: string | null) => {
    if (meetingUrl) {
      window.open(meetingUrl, "_blank");
    } else {
      toast.error(language === "fr" ? "Lien de réunion non disponible" : "Meeting link not available");
    }
  };

  // Stripe Connect onboarding mutation
  const startOnboardingMutation = trpc.stripe.startOnboarding.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to start Stripe onboarding");
      setIsConnectingStripe(false);
    },
  });

  // Stripe dashboard link mutation
  const dashboardLinkMutation = trpc.stripe.dashboardLink.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to open Stripe dashboard");
    },
  });

  const handleConnectStripe = async () => {
    setIsConnectingStripe(true);
    await startOnboardingMutation.mutateAsync();
  };

  const handleOpenStripeDashboard = async () => {
    await dashboardLinkMutation.mutateAsync();
  };

  // Use real data from queries
  const todaysSessions = todaysSessionsData || [];
  const pendingRequests = pendingRequestsData || [];

  const labels = {
    en: {
      dashboard: "Coach Dashboard",
      welcome: "Welcome back",
      overview: "Overview",
      availability: "Availability",
      schedule: "Schedule",
      students: "Students",
      earnings: "Earnings",
      todaysSessions: "Today's Sessions",
      noSessionsToday: "No sessions scheduled for today",
      pendingRequests: "Pending Requests",
      noPendingRequests: "No pending booking requests",
      accept: "Accept",
      decline: "Decline",
      join: "Join",
      viewAll: "View All",
      totalStudents: "Total Students",
      thisMonth: "This Month",
      rating: "Rating",
      completedSessions: "Completed Sessions",
      monthlyEarnings: "Monthly Earnings",
      responseRate: "Response Rate",
      quickActions: "Quick Actions",
      manageAvailability: "Manage Availability",
      viewMessages: "View Messages",
      editProfile: "Edit Profile",
      loginRequired: "Please sign in to access your coach dashboard",
      signIn: "Sign In",
      becomeCoach: "Become a Coach",
      notACoach: "You don't have a coach profile yet",
      stripeConnect: "Payment Setup",
      stripeConnected: "Stripe Connected",
      stripeNotConnected: "Connect Stripe to Receive Payments",
      connectStripe: "Connect with Stripe",
      viewStripeDashboard: "View Stripe Dashboard",
      stripeOnboarding: "Complete your Stripe setup to start receiving payments from students.",
      stripeComplete: "Your Stripe account is connected and ready to receive payments.",
      stripePending: "Your Stripe account setup is incomplete. Please complete the onboarding process.",
    },
    fr: {
      dashboard: "Tableau de bord coach",
      welcome: "Bon retour",
      overview: "Aperçu",
      availability: "Disponibilité",
      schedule: "Horaire",
      students: "Étudiants",
      earnings: "Revenus",
      todaysSessions: "Sessions d'aujourd'hui",
      noSessionsToday: "Aucune session prévue aujourd'hui",
      pendingRequests: "Demandes en attente",
      noPendingRequests: "Aucune demande de réservation en attente",
      accept: "Accepter",
      decline: "Refuser",
      join: "Rejoindre",
      viewAll: "Voir tout",
      totalStudents: "Étudiants totaux",
      thisMonth: "Ce mois",
      rating: "Évaluation",
      completedSessions: "Sessions complétées",
      monthlyEarnings: "Revenus mensuels",
      responseRate: "Taux de réponse",
      quickActions: "Actions rapides",
      manageAvailability: "Gérer la disponibilité",
      viewMessages: "Voir les messages",
      editProfile: "Modifier le profil",
      loginRequired: "Veuillez vous connecter pour accéder à votre tableau de bord coach",
      signIn: "Se connecter",
      becomeCoach: "Devenir coach",
      notACoach: "Vous n'avez pas encore de profil coach",
      stripeConnect: "Configuration des paiements",
      stripeConnected: "Stripe connecté",
      stripeNotConnected: "Connectez Stripe pour recevoir des paiements",
      connectStripe: "Connecter avec Stripe",
      viewStripeDashboard: "Voir le tableau de bord Stripe",
      stripeOnboarding: "Complétez votre configuration Stripe pour commencer à recevoir des paiements des étudiants.",
      stripeComplete: "Votre compte Stripe est connecté et prêt à recevoir des paiements.",
      stripePending: "La configuration de votre compte Stripe est incomplète. Veuillez terminer le processus d'intégration.",
    },
  };

  const l = labels[language];

  // Show loading state while fetching profile
  if (authLoading || (isAuthenticated && profileLoading)) {
    return (
      <Wrap>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-slate-900 dark:text-slate-100">
              {language === "fr" ? "Chargement du profil coach..." : "Loading coach profile..."}
            </p>
          </div>
        </main>
      </Wrap>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <Wrap>
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardHeader className="text-center">
              <CardTitle>{l.dashboard}</CardTitle>
              <CardDescription>{l.loginRequired}</CardDescription>
            </CardHeader>
            <CardContent>
              <a href={getLoginUrl()} className="block">
                <Button className="w-full" size="lg">
                  {l.signIn}
                </Button>
              </a>
            </CardContent>
          </Card>
        </main>
      </Wrap>
    );
  }

  // Show "not a coach" state if authenticated but no coach profile
  if (isAuthenticated && !profileLoading && !coachProfile) {
    return (
      <Wrap>
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4 text-center border-0 shadow-xl">
            <CardContent className="pt-8 pb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {language === "fr" ? "Profil coach non trouvé" : "Coach Profile Not Found"}
              </h2>
              <p className="text-slate-900 dark:text-slate-100 mb-6">
                {language === "fr" 
                  ? "Vous n'avez pas encore de profil coach lié à votre compte."
                  : "You don't have a coach profile linked to your account yet."}
              </p>
              <div className="flex flex-col gap-3">
                <Link href="/become-a-coach">
                  <Button className="w-full">
                    {language === "fr" ? "Devenir coach" : "Become a Coach"}
                  </Button>
                </Link>
                <Link href="/coaches">
                  <Button variant="outline" className="w-full">
                    {language === "fr" ? "Voir tous les coachs" : "Browse All Coaches"}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </Wrap>
    );
  }
  // Check if profile needs setupp (newly approved coach without complete profile)
  const needsSetup = coachProfile && 
    coachProfile.status === "approved" && 
    (!coachProfile.headline || !coachProfile.hourlyRate || coachProfile.hourlyRate === 0);

  // Show setup wizard if needed or manually triggered
  if (showSetupWizard || needsSetup) {
    return (
      <Wrap className="bg-muted/30">
        <main className="flex-1 py-8">
          <div className="container">
            <CoachSetupWizard 
              onComplete={() => {
                setShowSetupWizard(false);
                window.location.reload();
              }}
              initialData={{
                headline: coachProfile?.headline || "",
                bio: coachProfile?.bio || "",
                specializations: coachProfile?.specializations as Record<string, boolean> || {},
                hourlyRate: coachProfile?.hourlyRate || 0,
                trialRate: coachProfile?.trialRate || 0,
                videoUrl: coachProfile?.videoUrl || "",
              }}
            />
          </div>
        </main>
      </Wrap>
    );
  }

  return (
    <Wrap className="bg-slate-50 dark:bg-slate-950">

      {/* Subtle decorative background - accessibility compliant */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-slate-200/30 dark:bg-slate-800/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 w-80 h-80 bg-slate-200/20 dark:bg-slate-800/10 rounded-full blur-3xl" />
      </div>

      <main id="main-content" className="flex-1 relative">
        <div className="px-4 sm:px-6 lg:px-8 xl:px-12 py-8 max-w-[1600px] mx-auto">
          {/* Hero Banner - Professional & Accessible */}
          <div className="relative mb-8 overflow-hidden rounded-2xl bg-slate-800 dark:bg-slate-900 p-8 md:p-10 border border-slate-700/50">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700/50 to-slate-900/50" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-slate-300 text-sm font-medium">
                    {new Date().toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA", { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                  <Badge className="bg-white/20 text-white border-0 hover:bg-white/30">
                    <Star className="h-3 w-3 mr-1" />
                    {coachProfile?.averageRating ? Number(coachProfile.averageRating).toFixed(1) : "N/A"}
                  </Badge>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {l.welcome}, {user?.name?.split(" ")[0] || "Coach"}! 👋
                </h1>
                <p className="text-slate-300 text-lg max-w-xl">
                  {language === "fr"
                    ? "Voici votre aperçu pour aujourd'hui"
                    : "Here's your overview for today"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <RoleSwitcherCompact />
                <Button 
                  size="lg" 
                  className="bg-white text-slate-800 hover:bg-slate-100 shadow-lg"
                  onClick={() => setShowSetupWizard(true)}
                >
                  <Settings className="h-5 w-5 mr-2" />
                  {language === "fr" ? "Modifier le profil" : "Edit Profile"}
                </Button>
              </div>
            </div>
          </div>

          {/* Profile Summary Card - Clean & Accessible */}
          {coachProfile && (
            <div className="relative mb-8 overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex flex-col md:flex-row">
                {/* Profile Photo */}
                <div className="md:w-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-6">
                  {coachProfile.photoUrl ? (
                    <img 
                      loading="lazy" src={coachProfile.photoUrl} 
                      alt={user?.name || "Coach"}
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                      <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                        {user?.name?.split(" ").map(n => n[0]).join("") || "C"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                {/* Profile Info */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
                      <p className="text-primary font-medium mt-1">{coachProfile.headline}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {coachProfile.specializations && Object.entries(coachProfile.specializations as Record<string, boolean>)
                          .filter(([_, active]) => active)
                          .slice(0, 4)
                          .map(([key]) => (
                            <Badge key={key} variant="secondary" className="text-xs">
                              {key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                          ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 text-sm text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{language === "fr" ? "Temps de réponse" : "Response time"}: {coachProfile.responseTimeHours || 24}h</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>{language === "fr" ? "Taux de réussite" : "Success rate"}: {coachProfile.successRate || 0}%</span>
                      </div>
                    </div>
                  </div>
                  {coachProfile.bio && (
                    <p className="text-sm text-slate-900 dark:text-slate-100 mt-4 line-clamp-2">
                      {coachProfile.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats - Row 1: Performance */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <StatCard
              title={l.totalStudents}
              value={coachProfile?.totalStudents || 0}
              icon={Users}
              iconColor="text-primary"
              iconBgColor="bg-primary/10"
            />
            <StatCard
              title={l.rating}
              value={coachProfile?.averageRating ? Number(coachProfile.averageRating).toFixed(1) : "N/A"}
              icon={Star}
              iconColor="text-amber-600"
              iconBgColor="bg-amber-100"
              subtitle={`${coachProfile?.totalReviews || 0} ${language === "fr" ? "avis" : "reviews"}`}
            />
            <StatCard
              title={l.completedSessions}
              value={earningsSummary?.sessionsCompleted || coachProfile?.totalSessions || 0}
              icon={CheckCircle}
              iconColor="text-emerald-600"
              iconBgColor="bg-emerald-100"
            />
            <StatCard
              title={language === "fr" ? "Tarif horaire" : "Hourly Rate"}
              value={`$${coachProfile?.hourlyRate ? (coachProfile.hourlyRate / 100).toFixed(0) : 0}/hr`}
              icon={DollarSign}
              iconColor="text-blue-600"
              iconBgColor="bg-blue-100"
            />
          </div>

          {/* Quick Stats - Row 2: Earnings (Net after 30% commission) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              title={language === "fr" ? "Revenus totaux (net)" : "Total Earnings (net)"}
              value={`$${((earningsSummary?.totalEarnings || 0) / 100).toLocaleString()}`}
              icon={Wallet}
              iconColor="text-emerald-600"
              iconBgColor="bg-emerald-100"
              subtitle={language === "fr" ? "Après commission 30%" : "After 30% commission"}
            />
            <StatCard
              title={language === "fr" ? "Paiement en attente" : "Pending Payout"}
              value={`$${((earningsSummary?.pendingPayout || 0) / 100).toLocaleString()}`}
              icon={Clock}
              iconColor="text-amber-600"
              iconBgColor="bg-amber-100"
            />
            <StatCard
              title={language === "fr" ? "Commission plateforme" : "Platform Commission"}
              value="30%"
              icon={Percent}
              iconColor="text-slate-900 dark:text-slate-100"
              iconBgColor="bg-muted"
              subtitle={language === "fr" ? "Frais de service" : "Service fee"}
            />
            <StatCard
              title={language === "fr" ? "Taux de réussite" : "Success Rate"}
              value={`${coachProfile?.successRate || 0}%`}
              icon={TrendingUp}
              iconColor="text-indigo-600"
              iconBgColor="bg-indigo-100"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Today's Sessions */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">{l.todaysSessions}</CardTitle>
                  <Link href="/app/availability">
                    <Button variant="outline" size="sm">
                      {l.viewAll}
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {todaysSessions.length > 0 ? (
                    <div className="space-y-4">
                      {todaysSessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-4 rounded-lg border bg-card"
                        >
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {(session.learnerName || "??")
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{session.learnerName || "Unknown Learner"}</p>
                              <p className="text-sm text-slate-900 dark:text-slate-100">
                                {session.sessionType || "Session"} • {session.duration || 30} min
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {session.status}
                                </Badge>
                                <span className="text-sm text-slate-900 dark:text-slate-100">
                                  {new Date(session.scheduledAt).toLocaleTimeString(language === "fr" ? "fr-CA" : "en-CA", { hour: "numeric", minute: "2-digit" })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            className="gap-2"
                            onClick={() => handleJoinSession(session.meetingUrl)}
                          >
                            <Video className="h-4 w-4" />
                            {l.join}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 mx-auto text-slate-900 dark:text-slate-100 mb-4" />
                      <p className="text-slate-900 dark:text-slate-100">{l.noSessionsToday}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Student Progress Widget */}
              {/* Real Learner Performance Metrics */}
              <LearnerMetricsPanel language={language} className="mb-6" />

              {/* Pending Requests */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">{l.pendingRequests}</CardTitle>
                  <Badge variant="secondary">{pendingRequests.length}</Badge>
                </CardHeader>
                <CardContent>
                  {pendingRequests.length > 0 ? (
                    <div className="space-y-4">
                      {pendingRequests.map((request) => (
                        <div
                          key={request.id}
                          className="flex items-center justify-between p-4 rounded-lg border"
                        >
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {(request.learnerName || "??")
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{request.learnerName || "Unknown Learner"}</p>
                              <p className="text-sm text-slate-900 dark:text-slate-100">
                                {request.sessionType || "Session"} • {new Date(request.scheduledAt).toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA")} {language === "fr" ? "à" : "at"} {new Date(request.scheduledAt).toLocaleTimeString(language === "fr" ? "fr-CA" : "en-CA", { hour: "numeric", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-destructive"
                              onClick={() => handleDeclineSession(request.id)}
                              disabled={declineSessionMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              {l.decline}
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleConfirmSession(request.id)}
                              disabled={confirmSessionMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              {l.accept}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 mx-auto text-slate-900 dark:text-slate-100 mb-4" />
                      <p className="text-slate-900 dark:text-slate-100">{l.noPendingRequests}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Upcoming Sessions Widget */}
              <UpcomingSessionsWidget
                sessions={todaysSessions.map((session, index) => ({
                  id: session.id,
                  studentName: session.learnerName || "Unknown Learner",
                  sessionType: "video" as const,
                  startTime: new Date(session.scheduledAt),
                  duration: session.duration || 30,
                  topic: session.sessionType,
                  meetingUrl: session.meetingUrl || undefined,
                }))}
                language={language}
                onJoinSession={(sessionId, meetingUrl) => handleJoinSession(meetingUrl || null)}
                onViewAll={() => setActiveTab("schedule")}
              />

              {/* Stripe Connect Card */}
              {coachProfile && (
                <Card className={stripeStatus?.isOnboarded ? "border-emerald-200 bg-emerald-50/50" : "border-[#FFE4D6] bg-amber-50/50"}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      {l.stripeConnect}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stripeLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-900 dark:text-slate-100" />
                      </div>
                    ) : stripeStatus?.isOnboarded ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-emerald-700">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">{l.stripeConnected}</span>
                        </div>
                        <p className="text-sm text-slate-900 dark:text-slate-100">{l.stripeComplete}</p>
                        <Button
                          variant="outline"
                          className="w-full gap-2"
                          onClick={handleOpenStripeDashboard}
                          disabled={dashboardLinkMutation.isPending}
                        >
                          {dashboardLinkMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ExternalLink className="h-4 w-4" />
                          )}
                          {l.viewStripeDashboard}
                        </Button>
                      </div>
                    ) : stripeStatus?.hasAccount ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-amber-700">
                          <AlertCircle className="h-5 w-5" />
                          <span className="font-medium">Setup Incomplete</span>
                        </div>
                        <p className="text-sm text-slate-900 dark:text-slate-100">{l.stripePending}</p>
                        <Button
                          className="w-full gap-2"
                          onClick={handleConnectStripe}
                          disabled={isConnectingStripe}
                        >
                          {isConnectingStripe ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CreditCard className="h-4 w-4" />
                          )}
                          Complete Setup
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-amber-700">
                          <AlertCircle className="h-5 w-5" />
                          <span className="font-medium">{l.stripeNotConnected}</span>
                        </div>
                        <p className="text-sm text-slate-900 dark:text-slate-100">{l.stripeOnboarding}</p>
                        <Button
                          className="w-full gap-2"
                          onClick={handleConnectStripe}
                          disabled={isConnectingStripe}
                        >
                          {isConnectingStripe ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CreditCard className="h-4 w-4" />
                          )}
                          {l.connectStripe}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Photo Gallery */}
              {coachProfile && (
                <CoachPhotoGallery coachId={coachProfile.id} isEditable={true} />
              )}

              {/* Availability Manager */}
              <AvailabilityManager />

              {/* Calendar Settings */}
              {coachProfile && (
                <CalendarSettingsCard
                  coachId={coachProfile.id}
                  currentCalendarType={(coachProfile as any).calendarType || 'internal'}
                  currentCalendlyUrl={(coachProfile as any).calendlyUrl}
                />
              )}

              {/* Onboarding Checklist */}
              {coachProfile && (
                <CoachOnboardingChecklist
                  coachProfile={{
                    bio: coachProfile.bio,
                    headline: coachProfile.headline,
                    photoUrl: coachProfile.photoUrl,
                    videoUrl: coachProfile.videoUrl,
                    hourlyRate: coachProfile.hourlyRate,
                    trialRate: coachProfile.trialRate,
                    specializations: coachProfile.specializations as Record<string, boolean> | null,
                    stripeOnboarded: stripeStatus?.isOnboarded,
                  }}
                  hasAvailability={true} // TODO: Check from availability query
                  onEditProfile={() => setShowSetupWizard(true)}
                  onSetAvailability={() => setActiveTab("availability")}
                  onConnectStripe={handleConnectStripe}
                />
              )}

              {/* Session Calendar */}
              <CoachCalendar language={language} />

              {/* Analytics Dashboard */}
              <CoachAnalytics />

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{l.quickActions}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/coach/availability" className="block">
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {l.manageAvailability}
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/messages" className="block">
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        {l.viewMessages}
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/coach/profile" className="block">
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        {l.editProfile}
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/app/coach-guide" className="block">
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {language === "fr" ? "Guide du coach" : "Coach Guide"}
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/coach/earnings" className="block">
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        {language === "fr" ? "Revenus" : "Earnings"}
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
       </main>
    </Wrap>
  );
}
