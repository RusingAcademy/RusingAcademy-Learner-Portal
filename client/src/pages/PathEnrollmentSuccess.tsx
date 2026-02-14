import { useEffect, useState } from "react";
import { Link, useParams, useSearch } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Calendar,
  MessageSquare,
  Users,
  Sparkles,
  PartyPopper,
  Mail,
  Clock,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";
import { EcosystemFooter } from "@/components/EcosystemFooter";
import EcosystemHeaderGold from "@/components/EcosystemHeaderGold";
import confetti from "canvas-confetti";

export default function PathEnrollmentSuccess() {
  const { language } = useLanguage();
  const t = language === "fr";
  const params = useParams();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  
  const slug = (params as any).slug as string;
  const sessionId = searchParams.get("session_id");
  
  const [showConfetti, setShowConfetti] = useState(true);
  
  // Fetch path details
  const { data: path, isLoading } = trpc.paths.getBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );
  
  // Trigger confetti on mount
  useEffect(() => {
    if (showConfetti) {
      const duration = 3000;
      const end = Date.now() + duration;
      
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#f59e0b", "#f97316", "#10b981"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#f59e0b", "#f97316", "#10b981"],
        });
        
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
      setShowConfetti(false);
    }
  }, [showConfetti]);

  const nextSteps = [
    {
      icon: BookOpen,
      title: t ? "Accédez à Votre Contenu" : "Access Your Content",
      description: t
        ? "Votre parcours est maintenant disponible dans votre tableau de bord apprenant."
        : "Your path is now available in your learner dashboard.",
      action: t ? "Aller au Dashboard" : "Go to Dashboard",
      href: "/learner",
      primary: true,
    },
    {
      icon: Calendar,
      title: t ? "Planifiez Votre Apprentissage" : "Plan Your Learning",
      description: t
        ? "Réservez du temps chaque semaine pour progresser régulièrement."
        : "Schedule time each week to make consistent progress.",
      action: t ? "Voir le Calendrier" : "View Calendar",
      href: "/learner/calendar",
      primary: false,
    },
    {
      icon: Users,
      title: t ? "Réservez un Coach" : "Book a Coach",
      description: t
        ? "Maximisez votre apprentissage avec des sessions de coaching personnalisées."
        : "Maximize your learning with personalized coaching sessions.",
      action: t ? "Trouver un Coach" : "Find a Coach",
      href: "/coaches",
      primary: false,
    },
    {
      icon: MessageSquare,
      title: t ? "Rejoignez la Communauté" : "Join the Community",
      description: t
        ? "Connectez-vous avec d'autres apprenants et partagez vos progrès."
        : "Connect with other learners and share your progress.",
      action: t ? "Explorer" : "Explore",
      href: "/community",
      primary: false,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <EcosystemHeaderGold />
        <div className="container py-16 px-4">
          <div className="animate-pulse space-y-8 max-w-2xl mx-auto">
            <div className="h-16 bg-slate-200 rounded-full w-16 mx-auto" />
            <div className="h-8 bg-slate-200 rounded w-3/4 mx-auto" />
            <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-slate-50">
      <EcosystemHeaderGold />
      
      {/* Success Hero */}
      <section className="py-16 md:py-24">
        <div className="container px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Success Icon */}
            <div className="relative inline-block mb-8">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="absolute -top-2 -right-2"
              >
                <PartyPopper className="w-8 h-8 text-amber-500" />
              </motion.div>
            </div>
            
            {/* Success Message */}
            <Badge className="mb-4 bg-green-100 text-green-700 border-green-200">
              <Sparkles className="w-3 h-3 mr-1" />
              {t ? "Inscription Confirmée" : "Enrollment Confirmed"}
            </Badge>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              {t ? "Félicitations!" : "Congratulations!"}
            </h1>
            
            <p className="text-xl text-slate-600 mb-6">
              {t
                ? `Vous êtes maintenant inscrit à ${path?.title || "ce parcours"}.`
                : `You are now enrolled in ${path?.title || "this path"}.`}
            </p>
            
            {/* Path Summary Card */}
            {path && (
              <Card className="max-w-md mx-auto mb-8 border-green-200 bg-white/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {/* @ts-ignore - TS2339: auto-suppressed during TS cleanup */}
                    <span className="text-4xl">{path?.icon || "📚"}</span>
                    <div className="text-left">
                      <h3 className="font-semibold text-slate-900">
                        {t && path.titleFr ? path.titleFr : path.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-slate-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {path.durationWeeks || 4} {t ? "sem." : "wks"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {path.cefrLevel === "exam_prep" ? "SLE Prep" : path.cefrLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Email Confirmation Notice */}
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-8">
              <Mail className="w-4 h-4" />
              <span>
                {t
                  ? "Un courriel de confirmation a été envoyé à votre adresse."
                  : "A confirmation email has been sent to your address."}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Next Steps Section */}
      <section className="py-16 bg-white">
        <div className="container px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 text-center">
            {t ? "Prochaines Étapes" : "Next Steps"}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {nextSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className={`h-full ${step.primary ? "border-amber-300 bg-amber-50/50" : ""}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${step.primary ? "bg-amber-100" : "bg-slate-100"}`}>
                        {step.icon && <step.icon className={`w-5 h-5 ${step.primary ? "text-amber-600" : "text-slate-600"}`} />}
                      </div>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-4">{step.description}</p>
                    <Link href={step.href}>
                      <Button
                        variant={step.primary ? "default" : "outline"}
                        className={step.primary ? "bg-amber-600 hover:bg-amber-700" : ""}
                        size="sm"
                      >
                        {step.action}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-amber-600 to-orange-600">
        <div className="container px-4 sm:px-6 lg:px-8 text-center">
          <GraduationCap className="w-12 h-12 text-white/80 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {t ? "Prêt à Commencer Votre Parcours?" : "Ready to Start Your Journey?"}
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            {t
              ? "Votre transformation vers l'excellence bilingue commence maintenant. Accédez à votre contenu et commencez à apprendre dès aujourd'hui."
              : "Your transformation toward bilingual excellence starts now. Access your content and start learning today."}
          </p>
          <Link href="/app">
            <Button size="lg" variant="secondary" className="bg-white text-amber-700 hover:bg-amber-50">
              <BookOpen className="w-5 h-5 mr-2" />
              {t ? "Accéder à Mon Dashboard" : "Go to My Dashboard"}
            </Button>
          </Link>
        </div>
      </section>

      <EcosystemFooter lang={language === "fr" ? "fr" : "en"} theme="light" activeBrand="rusingacademy" />
    </div>
  );
}
