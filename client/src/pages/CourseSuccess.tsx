import { useEffect, useState } from "react";
import { Link, useSearch } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
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
  Download,
  Play,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";
import { EcosystemFooter } from "@/components/EcosystemFooter";
import EcosystemHeaderGold from "@/components/EcosystemHeaderGold";
import confetti from "canvas-confetti";

export default function CourseSuccess() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = language === "fr";
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  
  const sessionId = searchParams.get("session_id");
  const courseId = searchParams.get("course_id");
  
  const [showConfetti, setShowConfetti] = useState(true);
  
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
          colors: ["#f59e0b", "#f97316", "#10b981", "#0d9488"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#f59e0b", "#f97316", "#10b981", "#0d9488"],
        });
        
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
      setShowConfetti(false);
    }
  }, [showConfetti]);

  const labels = {
    en: {
      badge: "Purchase Confirmed",
      title: "Welcome to Your Learning Journey!",
      subtitle: "Your Path Series™ course has been activated",
      emailSent: "Confirmation email sent to",
      nextStepsTitle: "What Happens Next",
      steps: [
        {
          icon: Mail,
          title: "Check Your Email",
          description: "You'll receive a welcome email with your login credentials and getting started guide.",
        },
        {
          icon: BookOpen,
          title: "Access Your Course",
          description: "Your course materials are now available in your learner dashboard.",
        },
        {
          icon: Calendar,
          title: "Schedule Your Learning",
          description: "Set aside dedicated time each week for structured learning and practice.",
        },
        {
          icon: Users,
          title: "Book a Coach (Optional)",
          description: "Accelerate your progress with personalized coaching sessions.",
        },
      ],
      whatIncluded: "What's Included in Your Course",
      features: [
        { icon: Play, text: "30+ hours of structured video lessons" },
        { icon: FileText, text: "Comprehensive workbooks and exercises" },
        { icon: Target, text: "Progress tracking and assessments" },
        { icon: MessageSquare, text: "Community forum access" },
        { icon: Download, text: "Downloadable resources" },
        { icon: GraduationCap, text: "Certificate of completion" },
      ],
      ctaDashboard: "Go to My Dashboard",
      ctaCoaches: "Browse Coaches",
      ctaCurriculum: "View All Courses",
      guarantee: "100% Satisfaction Guaranteed",
      guaranteeText: "If you're not satisfied within 14 days, we'll provide a full refund—no questions asked.",
    },
    fr: {
      badge: "Achat Confirmé",
      title: "Bienvenue dans Votre Parcours d'Apprentissage!",
      subtitle: "Votre cours Path Series™ a été activé",
      emailSent: "Courriel de confirmation envoyé à",
      nextStepsTitle: "Prochaines Étapes",
      steps: [
        {
          icon: Mail,
          title: "Vérifiez Votre Courriel",
          description: "Vous recevrez un courriel de bienvenue avec vos identifiants et un guide de démarrage.",
        },
        {
          icon: BookOpen,
          title: "Accédez à Votre Cours",
          description: "Vos documents de cours sont maintenant disponibles dans votre tableau de bord apprenant.",
        },
        {
          icon: Calendar,
          title: "Planifiez Votre Apprentissage",
          description: "Réservez du temps chaque semaine pour l'apprentissage structuré et la pratique.",
        },
        {
          icon: Users,
          title: "Réservez un Coach (Optionnel)",
          description: "Accélérez vos progrès avec des séances de coaching personnalisées.",
        },
      ],
      whatIncluded: "Ce Qui Est Inclus dans Votre Cours",
      features: [
        { icon: Play, text: "30+ heures de leçons vidéo structurées" },
        { icon: FileText, text: "Cahiers d'exercices complets" },
        { icon: Target, text: "Suivi des progrès et évaluations" },
        { icon: MessageSquare, text: "Accès au forum communautaire" },
        { icon: Download, text: "Ressources téléchargeables" },
        { icon: GraduationCap, text: "Certificat de réussite" },
      ],
      ctaDashboard: "Aller à Mon Tableau de Bord",
      ctaCoaches: "Parcourir les Coachs",
      ctaCurriculum: "Voir Tous les Cours",
      guarantee: "Satisfaction 100% Garantie",
      guaranteeText: "Si vous n'êtes pas satisfait dans les 14 jours, nous vous rembourserons intégralement—sans questions.",
    },
  };

  const l = labels[language];

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-amber-50/30 to-white">
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
              <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-amber-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle className="w-12 h-12 text-teal-600" />
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
            <Badge className="mb-4 bg-teal-100 text-teal-700 border-teal-200">
              <Sparkles className="w-3 h-3 mr-1" />
              {l.badge}
            </Badge>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              {l.title}
            </h1>
            
            <p className="text-xl text-slate-600 mb-6">
              {l.subtitle}
            </p>
            
            {/* Email Confirmation Notice */}
            {user?.email && (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-8">
                <Mail className="w-4 h-4" />
                <span>
                  {l.emailSent} <strong className="text-slate-700">{user.email}</strong>
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Next Steps Section */}
      <section className="py-12 bg-white">
        <div className="container px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 text-center">
            {l.nextStepsTitle}
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {l.steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className={`h-full ${index === 0 ? "border-teal-300 bg-teal-50/50" : ""}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                        index === 0 ? "bg-teal-100" : "bg-slate-100"
                      }`}>
                        <span className="text-lg font-bold text-teal-600">{index + 1}</span>
                      </div>
                      <div className={`p-2 rounded-lg mb-3 ${index === 0 ? "bg-teal-100" : "bg-slate-100"}`}>
                        <step.icon className={`w-5 h-5 ${index === 0 ? "text-teal-600" : "text-slate-600"}`} />
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-2">{step.title}</h3>
                      <p className="text-sm text-slate-600">{step.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-12 bg-gradient-to-b from-slate-50 to-white">
        <div className="container px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 text-center">
            {l.whatIncluded}
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {l.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center gap-3 p-4 bg-white rounded-lg border border-slate-200 shadow-sm"
              >
                <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                  <feature.icon className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-slate-700">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee Banner */}
      <section className="py-8">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-100 rounded-full shrink-0">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-700 text-lg mb-1">{l.guarantee}</h3>
                <p className="text-slate-600">{l.guaranteeText}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-teal-600 to-teal-700">
        <div className="container px-4 sm:px-6 lg:px-8 text-center">
          <GraduationCap className="w-12 h-12 text-white/80 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {t ? "Prêt à Commencer?" : "Ready to Begin?"}
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            {t
              ? "Votre transformation vers l'excellence bilingue commence maintenant. Accédez à votre contenu et commencez à apprendre dès aujourd'hui."
              : "Your transformation toward bilingual excellence starts now. Access your content and start learning today."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/app">
              <Button size="lg" variant="secondary" className="bg-white text-teal-700 hover:bg-teal-50">
                <BookOpen className="w-5 h-5 mr-2" />
                {l.ctaDashboard}
              </Button>
            </Link>
            <Link href="/coaches">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Users className="w-5 h-5 mr-2" />
                {l.ctaCoaches}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <EcosystemFooter lang={language === "fr" ? "fr" : "en"} theme="light" activeBrand="rusingacademy" />
    </div>
  );
}
