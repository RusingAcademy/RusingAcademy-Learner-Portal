import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCircle2, XCircle, Mail, ArrowLeft } from "lucide-react";

export default function Unsubscribe() {
  const { token } = useParams<{ token: string }>();
  const { language } = useLanguage();
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const t = {
    en: {
      title: "Unsubscribe",
      subtitle: "We're sorry to see you go",
      description: "You're about to unsubscribe from our email communications. This will stop all automated sequence emails.",
      reasonLabel: "Help us improve by telling us why you're unsubscribing:",
      reasons: {
        tooMany: "Too many emails",
        notRelevant: "Content not relevant to me",
        neverSignedUp: "I never signed up for this",
        foundAlternative: "Found an alternative solution",
        other: "Other reason",
      },
      customReasonPlaceholder: "Please tell us more...",
      unsubscribeButton: "Unsubscribe",
      processing: "Processing...",
      successTitle: "Successfully Unsubscribed",
      successMessage: "You have been removed from our mailing list. You will no longer receive automated emails from us.",
      errorTitle: "Something Went Wrong",
      errorMessage: "We couldn't process your unsubscribe request. Please try again or contact support.",
      backToHome: "Back to Home",
      resubscribeNote: "Changed your mind? You can always re-subscribe by contacting us.",
    },
    fr: {
      title: "Se désabonner",
      subtitle: "Nous sommes désolés de vous voir partir",
      description: "Vous êtes sur le point de vous désabonner de nos communications par email. Cela arrêtera tous les emails automatisés.",
      reasonLabel: "Aidez-nous à nous améliorer en nous disant pourquoi vous vous désabonnez :",
      reasons: {
        tooMany: "Trop d'emails",
        notRelevant: "Contenu non pertinent pour moi",
        neverSignedUp: "Je ne me suis jamais inscrit",
        foundAlternative: "J'ai trouvé une solution alternative",
        other: "Autre raison",
      },
      customReasonPlaceholder: "Veuillez nous en dire plus...",
      unsubscribeButton: "Se désabonner",
      processing: "Traitement en cours...",
      successTitle: "Désabonnement réussi",
      successMessage: "Vous avez été retiré de notre liste de diffusion. Vous ne recevrez plus d'emails automatisés de notre part.",
      errorTitle: "Une erreur s'est produite",
      errorMessage: "Nous n'avons pas pu traiter votre demande de désabonnement. Veuillez réessayer ou contacter le support.",
      backToHome: "Retour à l'accueil",
      resubscribeNote: "Vous avez changé d'avis ? Vous pouvez toujours vous réabonner en nous contactant.",
    },
  };

  const l = t[language];

  const handleUnsubscribe = async () => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Invalid unsubscribe link");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const reason = selectedReason === "other" ? customReason : selectedReason;
      
      const response = await fetch(`/api/unsubscribe/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(data.message || l.errorMessage);
      }
    } catch (error) {
      console.error("Unsubscribe error:", error);
      setStatus("error");
      setErrorMessage(l.errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{l.successTitle}</h2>
            <p className="text-muted-foreground mb-6">{l.successMessage}</p>
            <p className="text-sm text-muted-foreground mb-6">{l.resubscribeNote}</p>
            <Button onClick={() => window.location.href = "/"}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {l.backToHome}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{l.errorTitle}</h2>
            <p className="text-muted-foreground mb-6">{errorMessage || l.errorMessage}</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setStatus("pending")}>
                Try Again
              </Button>
              <Button onClick={() => window.location.href = "/"}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {l.backToHome}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-slate-600 dark:text-slate-400" />
          </div>
          <CardTitle className="text-2xl">{l.title}</CardTitle>
          <CardDescription className="text-base">{l.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">{l.description}</p>
          
          <div className="space-y-3">
            <Label className="text-sm font-medium">{l.reasonLabel}</Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
              {Object.entries(l.reasons).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                  <RadioGroupItem value={key} id={key} />
                  <Label htmlFor={key} className="font-normal cursor-pointer">
                    {label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {selectedReason === "other" && (
            <Textarea
              placeholder={l.customReasonPlaceholder}
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="min-h-[80px]"
            />
          )}

          <Button 
            onClick={handleUnsubscribe} 
            className="w-full"
            variant="destructive"
            disabled={isSubmitting}
          >
            {isSubmitting ? l.processing : l.unsubscribeButton}
          </Button>

          <Button 
            variant="ghost" 
            className="w-full"
            onClick={() => window.location.href = "/"}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {l.backToHome}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
