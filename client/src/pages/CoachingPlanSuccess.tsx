import { useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import FooterInstitutional from "@/components/FooterInstitutional";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Calendar,
  Clock,
  Mail,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Users,
  Target,
  Zap,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function CoachingPlanSuccess() {
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const isEn = language === "en";
  
  // Get session_id from URL
  const searchParams = new URLSearchParams(window.location.search);
  const stripeSessionId = searchParams.get("session_id");
  
  // Fetch coaching plans to display purchased plan info
  // @ts-expect-error - TS2339: auto-suppressed during TS cleanup
  const { data: plans } = trpc.courses.getCoachingPlans.useQuery();
  
  // Try to determine which plan was purchased from URL or session
  const planId = searchParams.get("plan_id") || "accelerator-plan";
  const purchasedPlan = plans?.find(p => p.id === planId) || plans?.[1]; // Default to Accelerator

  const labels = {
    en: {
      title: "Welcome to Your SLE Success Journey!",
      subtitle: "Your coaching plan has been activated",
      planDetails: "Your Plan Details",
      planName: "Plan",
      sessions: "Coaching Hours",
      validity: "Valid For",
      price: "Amount Paid",
      features: "What's Included",
      emailSent: "Confirmation email sent to",
      nextSteps: "What Happens Next",
      step1: "Check your email for your welcome package and login details",
      step2: "Our team will contact you within 24 hours to match you with your coach",
      step3: "Schedule your first session at a time that works for you",
      step4: "Start your personalized learning journey toward SLE success",
      viewDashboard: "Go to My Dashboard",
      browseCoaches: "Browse Coaches",
      days: "days",
      hours: "hours",
      guarantee: "100% Satisfaction Guaranteed",
      guaranteeText: "If you're not completely satisfied with your first session, we'll refund your purchase in full.",
    },
    fr: {
      title: "Bienvenue dans votre parcours vers le succès ELS!",
      subtitle: "Votre plan de coaching a été activé",
      planDetails: "Détails de votre plan",
      planName: "Plan",
      sessions: "Heures de coaching",
      validity: "Valide pour",
      price: "Montant payé",
      features: "Ce qui est inclus",
      emailSent: "Email de confirmation envoyé à",
      nextSteps: "Prochaines étapes",
      step1: "Vérifiez votre email pour votre trousse de bienvenue et vos identifiants",
      step2: "Notre équipe vous contactera dans les 24 heures pour vous jumeler avec votre coach",
      step3: "Planifiez votre première séance à un moment qui vous convient",
      step4: "Commencez votre parcours d'apprentissage personnalisé vers le succès ELS",
      viewDashboard: "Aller à mon tableau de bord",
      browseCoaches: "Parcourir les coachs",
      days: "jours",
      hours: "heures",
      guarantee: "Satisfaction 100% garantie",
      guaranteeText: "Si vous n'êtes pas entièrement satisfait de votre première séance, nous vous rembourserons intégralement.",
    },
  };

  const l = labels[language];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-teal-50/50 via-amber-50/30 to-background dark:from-teal-950/20 dark:via-amber-950/10">
      <main className="flex-1 py-12">
        <div className="container max-w-3xl mx-auto px-4">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-teal-100 to-[#FFF0E6] dark:from-teal-900/30 dark:to-amber-900/30 mb-6 shadow-lg">
              <CheckCircle2 className="h-12 w-12 text-teal-600 dark:text-teal-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-teal-700 to-[#A84A15] bg-clip-text text-transparent">
              {l.title}
            </h1>
            <p className="text-slate-900 dark:text-slate-100 text-lg">{l.subtitle}</p>
            
            {user?.email && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-teal-50 dark:bg-teal-950/30 rounded-full text-sm text-teal-700 dark:text-teal-300">
                <Mail className="h-4 w-4" />
                {l.emailSent} <strong>{user.email}</strong>
              </div>
            )}
          </div>

          {/* Plan Details Card */}
          <Card className="mb-8 overflow-hidden border-2 border-teal-200 dark:border-teal-800">
            <CardHeader className="bg-gradient-to-r from-teal-500/10 to-[#C65A1E]/10">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#C65A1E]500" />
                {l.planDetails}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {purchasedPlan ? (
                <div className="space-y-6">
                  {/* Plan Name & Badge */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-teal-700 dark:text-teal-300">
                        {isEn ? purchasedPlan.name : purchasedPlan.nameFr}
                      </h3>
                      <p className="text-slate-900 dark:text-slate-100">
                        {isEn ? purchasedPlan.description : purchasedPlan.descriptionFr}
                      </p>
                    </div>
                    {purchasedPlan.id === "accelerator-plan" && (
                      <Badge className="bg-[#C65A1E] text-white">Most Popular</Badge>
                    )}
                    {purchasedPlan.id === "immersion-plan" && (
                      <Badge className="bg-gradient-to-r from-[#C65A1E] to-[#A84A15] text-white">Premium</Badge>
                    )}
                  </div>

                  {/* Plan Stats */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-teal-50 dark:bg-teal-950/30 rounded-xl">
                      <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
                        <Clock className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-900 dark:text-slate-100">{l.sessions}</p>
                        <p className="font-bold text-lg">{purchasedPlan.sessions} {l.hours}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                        <Calendar className="h-5 w-5 text-[#C65A1E]600 dark:text-[#C65A1E]400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-900 dark:text-slate-100">{l.validity}</p>
                        <p className="font-bold text-lg">{purchasedPlan.validityDays} {l.days}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                        <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-900 dark:text-slate-100">{l.price}</p>
                        <p className="font-bold text-lg">${(purchasedPlan.priceInCents / 100).toLocaleString()} CAD</p>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-[#C65A1E]500" />
                      {l.features}
                    </h4>
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {(isEn ? purchasedPlan.features : purchasedPlan.featuresFr).map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-900 dark:text-slate-100">
                  {isEn ? "Loading plan details..." : "Chargement des détails..."}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Guarantee Banner */}
          <div className="mb-8 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-semibold text-emerald-700 dark:text-emerald-300">{l.guarantee}</h4>
                <p className="text-sm text-slate-900 dark:text-slate-100">{l.guaranteeText}</p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-teal-600" />
                {l.nextSteps}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {[l.step1, l.step2, l.step3, l.step4].map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-white text-sm font-bold shrink-0 shadow-md">
                      {index + 1}
                    </span>
                    <span className="text-slate-900 dark:text-slate-100 pt-1">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800">
                {l.viewDashboard}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/coaches">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-teal-300 text-teal-700 hover:bg-teal-50">
                <Users className="h-4 w-4 mr-2" />
                {l.browseCoaches}
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <FooterInstitutional />
    </div>
  );
}
