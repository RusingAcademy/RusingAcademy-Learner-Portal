import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Calendar,
  Clock,
  Video,
  Download,
  Mail,
  ArrowRight,
  Copy,
  ExternalLink,
  Sparkles,
  User,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function BookingSuccess() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const isEn = language === "en";
  
  // Get session_id from URL
  const searchParams = new URLSearchParams(window.location.search);
  const stripeSessionId = searchParams.get("session_id");
  
  // Fetch latest session from API
  const { data: latestSession, isLoading } = trpc.learner.latestSession.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  // Transform session data for display
  const sessionData = latestSession ? {
    coachName: latestSession.coach?.name || "Your Coach",
    sessionType: latestSession.session?.sessionType || "trial",
    date: latestSession.session?.scheduledAt 
      ? new Date(latestSession.session.scheduledAt).toLocaleDateString(isEn ? "en-CA" : "fr-CA", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : new Date().toLocaleDateString(isEn ? "en-CA" : "fr-CA"),
    time: latestSession.session?.scheduledAt
      ? new Date(latestSession.session.scheduledAt).toLocaleTimeString(isEn ? "en-CA" : "fr-CA", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "10:00 AM",
    duration: latestSession.session?.duration || 30,
    price: (latestSession.session?.price || 3500) / 100,
    meetingUrl: latestSession.session?.meetingUrl || `https://meet.jit.si/lingueefy-session-${Date.now()}`,
  } : null;

  const handleCopyLink = () => {
    if (sessionData?.meetingUrl) {
      navigator.clipboard.writeText(sessionData.meetingUrl);
      toast.success(isEn ? "Meeting link copied!" : "Lien copié!");
    }
  };

  const handleDownloadCalendar = () => {
    if (!sessionData || !latestSession?.session?.scheduledAt) return;
    
    // Create ICS file content using actual session date
    const startDate = new Date(latestSession.session.scheduledAt);
    
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + sessionData.duration);
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Lingueefy//Session Booking//EN
BEGIN:VEVENT
UID:${Date.now()}@lingueefy.ca
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:Lingueefy Session with ${sessionData.coachName}
DESCRIPTION:Join your coaching session at: ${sessionData.meetingUrl}
LOCATION:${sessionData.meetingUrl}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
    
    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lingueefy-session.ics";
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(isEn ? "Calendar event downloaded!" : "Événement téléchargé!");
  };

  const labels = {
    en: {
      title: "Booking Confirmed!",
      subtitle: "Your session has been successfully booked",
      sessionDetails: "Session Details",
      coach: "Coach",
      date: "Date",
      time: "Time",
      duration: "Duration",
      type: "Session Type",
      price: "Amount Paid",
      meetingLink: "Meeting Link",
      copyLink: "Copy Link",
      joinSession: "Join Session",
      downloadCalendar: "Add to Calendar",
      emailSent: "Confirmation email sent to",
      nextSteps: "Next Steps",
      step1: "Check your email for confirmation details",
      step2: "Add the session to your calendar",
      step3: "Join the meeting link at your scheduled time",
      step4: "Prepare any questions or topics you'd like to discuss",
      viewDashboard: "View My Sessions",
      browseCoaches: "Browse More Coaches",
      trial: "Trial Session",
      single: "Regular Session",
      package: "Package Session",
      minutes: "minutes",
    },
    fr: {
      title: "Réservation confirmée!",
      subtitle: "Votre séance a été réservée avec succès",
      sessionDetails: "Détails de la séance",
      coach: "Coach",
      date: "Date",
      time: "Heure",
      duration: "Durée",
      type: "Type de séance",
      price: "Montant payé",
      meetingLink: "Lien de réunion",
      copyLink: "Copier le lien",
      joinSession: "Rejoindre la séance",
      downloadCalendar: "Ajouter au calendrier",
      emailSent: "Email de confirmation envoyé à",
      nextSteps: "Prochaines étapes",
      step1: "Vérifiez votre email pour les détails de confirmation",
      step2: "Ajoutez la séance à votre calendrier",
      step3: "Rejoignez le lien de réunion à l'heure prévue",
      step4: "Préparez vos questions ou sujets à discuter",
      viewDashboard: "Voir mes séances",
      browseCoaches: "Parcourir les coachs",
      trial: "Séance d'essai",
      single: "Séance régulière",
      package: "Forfait",
      minutes: "minutes",
    },
  };

  const l = labels[language];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50/50 to-background dark:from-emerald-950/20">
      

      <main className="flex-1 py-12">
        <div className="container max-w-3xl mx-auto px-4">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-6">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold mb-2">{l.title}</h1>
            <p className="text-slate-900 dark:text-slate-100 text-lg">{l.subtitle}</p>
            
            {user?.email && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/30 rounded-full text-sm text-blue-700 dark:text-blue-300">
                <Mail className="h-4 w-4" />
                {l.emailSent} <strong>{user.email}</strong>
              </div>
            )}
          </div>

          {/* Session Details Card */}
          <Card className="mb-8 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {l.sessionDetails}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {sessionData ? (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <User className="h-5 w-5 text-slate-900 dark:text-slate-100" />
                      <div>
                        <p className="text-sm text-slate-900 dark:text-slate-100">{l.coach}</p>
                        <p className="font-medium">{sessionData.coachName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Calendar className="h-5 w-5 text-slate-900 dark:text-slate-100" />
                      <div>
                        <p className="text-sm text-slate-900 dark:text-slate-100">{l.date}</p>
                        <p className="font-medium">{sessionData.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Clock className="h-5 w-5 text-slate-900 dark:text-slate-100" />
                      <div>
                        <p className="text-sm text-slate-900 dark:text-slate-100">{l.time}</p>
                        <p className="font-medium">{sessionData.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <DollarSign className="h-5 w-5 text-slate-900 dark:text-slate-100" />
                      <div>
                        <p className="text-sm text-slate-900 dark:text-slate-100">{l.price}</p>
                        <p className="font-medium">${sessionData.price.toFixed(2)} CAD</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Badge variant="secondary">
                      {sessionData.sessionType === "trial" ? l.trial : 
                       sessionData.sessionType === "single" ? l.single : l.package}
                    </Badge>
                    <Badge variant="outline">
                      {sessionData.duration} {l.minutes}
                    </Badge>
                  </div>

                  {/* Meeting Link Section */}
                  <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Video className="h-5 w-5 text-primary" />
                      <span className="font-medium">{l.meetingLink}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <code className="flex-1 p-2 bg-background rounded text-sm truncate">
                        {sessionData.meetingUrl}
                      </code>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopyLink}>
                          <Copy className="h-4 w-4 mr-1" />
                          {l.copyLink}
                        </Button>
                        <Button size="sm" asChild>
                          <a href={sessionData.meetingUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            {l.joinSession}
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Download Calendar Button */}
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={handleDownloadCalendar}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {l.downloadCalendar}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-900 dark:text-slate-100">
                  {isEn ? "Loading session details..." : "Chargement des détails..."}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{l.nextSteps}</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {[l.step1, l.step2, l.step3, l.step4].map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-slate-900 dark:text-slate-100">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                {l.viewDashboard}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/coaches">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                {l.browseCoaches}
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
