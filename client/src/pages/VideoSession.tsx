import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { JitsiVideoRoom, SessionWaitingRoom } from "@/components/JitsiVideoRoom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Star,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppLayout } from "@/contexts/AppLayoutContext";

export default function VideoSession() {
  const { isInsideAppLayout } = useAppLayout();
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;
  const [, navigate] = useLocation();
  const { language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const isEn = language === "en";

  const [hasJoined, setHasJoined] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  // For now, use mock session data until we add the session router
  const isLoading = false;
  const session = {
    id: Number(sessionId) || 1,
    coachId: 1,
    coachProfileId: 1,
    coachName: "Steven Barholere",
    coachPhoto: "https://rusingacademy-cdn.b-cdn.net/images/coaches/steven-barholere.jpg",
    learnerName: user?.name || "Learner",
    scheduledAt: new Date(),
    duration: 60,
  };

  // Submit review mutation
  const submitReviewMutation = trpc.coach.submitReview.useMutation({
    onSuccess: () => {
      navigate("/dashboard");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {isEn ? "Authentication Required" : "Authentification requise"}
            </h2>
            <p className="text-slate-900 dark:text-slate-100 mb-4">
              {isEn 
                ? "Please sign in to access your session"
                : "Veuillez vous connecter pour accéder à votre session"}
            </p>
            <Button onClick={() => navigate("/")}>
              {isEn ? "Go to Home" : "Aller à l'accueil"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-900 dark:text-slate-100">
            {isEn ? "Loading session..." : "Chargement de la session..."}
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {isEn ? "Session Not Found" : "Session non trouvée"}
            </h2>
            <p className="text-slate-900 dark:text-slate-100 mb-4">
              {isEn 
                ? "This session doesn't exist or you don't have access to it"
                : "Cette session n'existe pas ou vous n'y avez pas accès"}
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              {isEn ? "Go to Dashboard" : "Aller au tableau de bord"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCoach = session.coachId === user?.id;
  const scheduledAt = new Date(session.scheduledAt);

  // Post-session feedback form
  if (sessionEnded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
        <div className="container max-w-2xl mx-auto px-4">
          <Card>
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">
                {isEn ? "Session Complete!" : "Session terminée!"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {!isCoach && (
                <>
                  <p className="text-center text-slate-900 dark:text-slate-100 mb-6">
                    {isEn 
                      ? "How was your session? Your feedback helps coaches improve."
                      : "Comment s'est passée votre session? Vos commentaires aident les coachs à s'améliorer."}
                  </p>

                  {/* Star Rating */}
                  <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={cn(
                            "h-10 w-10",
                            star <= rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          )}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Feedback Text */}
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder={isEn 
                      ? "Share your experience (optional)..."
                      : "Partagez votre expérience (optionnel)..."}
                    className="w-full p-4 border rounded-lg resize-none h-32 mb-6"
                  />

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate("/dashboard")}
                    >
                      {isEn ? "Skip" : "Passer"}
                    </Button>
                    <Button
                      className="flex-1"
                      disabled={rating === 0}
                      onClick={() => {
                        submitReviewMutation.mutate({
                          coachId: session.coachProfileId || 0,
                          rating,
                          comment: feedback || undefined,
                        });
                      }}
                    >
                      {isEn ? "Submit Review" : "Soumettre l'avis"}
                    </Button>
                  </div>
                </>
              )}

              {isCoach && (
                <div className="text-center">
                  <p className="text-slate-900 dark:text-slate-100 mb-6">
                    {isEn 
                      ? "Great session! Your earnings will be updated shortly."
                      : "Super session! Vos gains seront mis à jour sous peu."}
                  </p>
                  <Button onClick={() => navigate("/dashboard")}>
                    {isEn ? "Go to Dashboard" : "Aller au tableau de bord"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 py-3 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-slate-700"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isEn ? "Back" : "Retour"}
          </Button>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-white border-white/30">
              <Calendar className="h-3 w-3 mr-1" />
              {scheduledAt.toLocaleDateString()}
            </Badge>
            <Badge variant="outline" className="text-white border-white/30">
              <Clock className="h-3 w-3 mr-1" />
              {scheduledAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Badge>
            <Badge variant="outline" className="text-white border-white/30">
              <User className="h-3 w-3 mr-1" />
              {isCoach ? session.learnerName : session.coachName}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        {!hasJoined ? (
          <SessionWaitingRoom
            sessionId={sessionId || ""}
            coachName={session.coachName || "Coach"}
            coachPhoto={session.coachPhoto}
            scheduledAt={scheduledAt}
            onJoin={() => setHasJoined(true)}
          />
        ) : (
          <JitsiVideoRoom
            sessionId={sessionId || ""}
            roomName={`session-${session.id}`}
            coachName={session.coachName || "Coach"}
            learnerName={session.learnerName || "Learner"}
            scheduledDuration={session.duration || 60}
            isCoach={isCoach}
            onEnd={() => setSessionEnded(true)}
          />
        )}
      </main>
    </div>
  );
}
