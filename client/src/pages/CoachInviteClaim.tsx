import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, XCircle, Clock, Loader2, UserCheck, ArrowRight, FileText, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function CoachInviteClaim() {
  const { token } = useParams<{ token: string }>();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [claiming, setClaiming] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Fetch invitation details
  const { data: invitation, isLoading, error } = trpc.coachInvitation.getByToken.useQuery(
    { token: token || "" },
    { enabled: !!token }
  );

  // Claim mutation
  const claimMutation = trpc.coachInvitation.claim.useMutation({
    onSuccess: (data) => {
      toast.success("Profil réclamé avec succès!", {
        description: "Vous avez maintenant accès à votre tableau de bord coach.",
      });
      // Redirect to coach dashboard
      setLocation(`/coach/dashboard`);
    },
    onError: (error) => {
      toast.error("Échec de la réclamation", {
        description: error.message,
      });
      setClaiming(false);
    },
  });

  const handleClaim = async () => {
    if (!token) return;
    if (!termsAccepted) {
      toast.error("Veuillez accepter les termes et conditions");
      return;
    }
    setClaiming(true);
    claimMutation.mutate({ token, termsAccepted: true });
  };

  const handleLogin = () => {
    // Store the current URL to redirect back after login
    const currentUrl = window.location.pathname;
    localStorage.setItem("postLoginRedirect", currentUrl);
    window.location.href = getLoginUrl();
  };

  // Loading state
  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Chargement de l'invitation...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Invitation non trouvée</CardTitle>
            <CardDescription>
              Ce lien d'invitation est invalide ou a été supprimé.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => setLocation("/")} variant="outline">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Expired state
  if (invitation.isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Invitation expirée</CardTitle>
            <CardDescription>
              Cette invitation a expiré. Veuillez contacter l'administrateur pour un nouveau lien.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-slate-500">
              Expirée le: {new Date(invitation.expiresAt).toLocaleDateString('fr-CA')}
            </p>
            <Button onClick={() => setLocation("/")} variant="outline">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already claimed state
  if (invitation.isClaimed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Déjà réclamé</CardTitle>
            <CardDescription>
              Ce profil coach a déjà été réclamé.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {isAuthenticated ? (
              <Button onClick={() => setLocation("/coach/dashboard")}>
                Aller au tableau de bord
              </Button>
            ) : (
              <Button onClick={handleLogin}>
                Se connecter
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Valid invitation - show claim form
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Réclamez votre profil coach</CardTitle>
          <CardDescription className="text-base">
            Vous avez été invité(e) à prendre le contrôle de votre profil coach sur RusingAcademy
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Coach Profile Preview */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border">
            <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">
              {invitation.coachName}
            </h3>
            {invitation.coachHeadline && (
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                {invitation.coachHeadline}
              </p>
            )}
          </div>

          {/* What you'll get */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-800 dark:text-slate-200">
              En réclamant ce profil, vous pourrez :
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Gérer votre profil et vos disponibilités</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Accepter des réservations et conduire des sessions</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Suivre vos revenus et performances</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Communiquer avec les apprenants</span>
              </li>
            </ul>
          </div>

          {/* Commission Notice - Important */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-white text-sm">
                  Commission de la plateforme : 30%
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Une commission de 30% sera prélevée sur chaque paiement. Vous recevrez 70% directement sur votre compte Stripe.
                </p>
              </div>
            </div>
          </div>

          {/* Terms Acceptance Checkbox */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Checkbox 
                id="terms" 
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                className="mt-1"
              />
              <div className="flex-1">
                <label 
                  htmlFor="terms" 
                  className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  J'ai lu et j'accepte les{" "}
                  <Link href="/terms" className="text-teal-600 hover:underline font-medium">
                    Termes et Conditions pour les Coachs
                  </Link>
                  , incluant la commission de 30% sur tous les paiements.
                </label>
              </div>
            </div>
          </div>

          {/* Expiration notice */}
          <p className="text-xs text-slate-500 text-center">
            Cette invitation expire le {new Date(invitation.expiresAt).toLocaleDateString('fr-CA')}
          </p>

          {/* Action buttons */}
          <div className="space-y-3">
            {isAuthenticated ? (
              <Button 
                onClick={handleClaim} 
                className="w-full" 
                size="lg"
                disabled={claiming || !termsAccepted}
              >
                {claiming ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Réclamation en cours...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Accepter et réclamer ce profil
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleLogin} 
                  className="w-full" 
                  size="lg"
                >
                  Se connecter pour réclamer
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-xs text-slate-500 text-center">
                  Vous devrez vous connecter ou créer un compte pour réclamer ce profil
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
