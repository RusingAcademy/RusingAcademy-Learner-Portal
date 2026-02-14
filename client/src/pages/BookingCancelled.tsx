import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle, ArrowLeft, HelpCircle, MessageSquare } from "lucide-react";

export default function BookingCancelled() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const labels = {
    en: {
      title: "Booking Cancelled",
      subtitle: "Your booking was not completed",
      description: "Don't worry - no payment was processed. You can try again whenever you're ready.",
      tryAgain: "Try Again",
      browseCoaches: "Browse Coaches",
      needHelp: "Need Help?",
      helpText: "If you experienced any issues during the booking process, please contact our support team.",
      contactSupport: "Contact Support",
    },
    fr: {
      title: "Réservation annulée",
      subtitle: "Votre réservation n'a pas été complétée",
      description: "Ne vous inquiétez pas - aucun paiement n'a été effectué. Vous pouvez réessayer quand vous le souhaitez.",
      tryAgain: "Réessayer",
      browseCoaches: "Parcourir les coachs",
      needHelp: "Besoin d'aide?",
      helpText: "Si vous avez rencontré des problèmes lors du processus de réservation, veuillez contacter notre équipe de support.",
      contactSupport: "Contacter le support",
    },
  };

  const l = labels[language];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="container max-w-lg mx-auto px-4">
          <Card className="text-center">
            <CardContent className="pt-8 pb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-6">
                <XCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              
              <h1 className="text-2xl font-bold mb-2">{l.title}</h1>
              <p className="text-lg text-slate-900 dark:text-slate-100 mb-2">{l.subtitle}</p>
              <p className="text-slate-900 dark:text-slate-100 mb-8">{l.description}</p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                <Link href="/coaches">
                  <Button size="lg" className="w-full sm:w-auto">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {l.browseCoaches}
                  </Button>
                </Link>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-center gap-2 text-slate-900 dark:text-slate-100 mb-3">
                  <HelpCircle className="h-4 w-4" />
                  <span className="font-medium">{l.needHelp}</span>
                </div>
                <p className="text-sm text-slate-900 dark:text-slate-100 mb-4">{l.helpText}</p>
                <Link href="/contact">
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {l.contactSupport}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
