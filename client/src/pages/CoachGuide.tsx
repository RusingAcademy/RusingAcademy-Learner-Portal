import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BookOpen,
  Video,
  Calendar,
  CreditCard,
  Users,
  MessageSquare,
  Settings,
  HelpCircle,
  ChevronRight,
  CheckCircle2,
  PlayCircle,
  FileText,
  Shield,
  TrendingUp,
  Clock,
  DollarSign,
  Star,
  Zap,
  Award,
} from "lucide-react";
import { Link } from "wouter";
import { useAppLayout } from "@/contexts/AppLayoutContext";

export default function CoachGuide() {
  const { isInsideAppLayout } = useAppLayout();
  const { language } = useLanguage();
  const isEn = language === "en";
  const [activeTab, setActiveTab] = useState("getting-started");

  const content = {
    en: {
      title: "Coach Guide",
      subtitle: "Everything you need to succeed as a Lingueefy coach",
      tabs: {
        gettingStarted: "Getting Started",
        profile: "Your Profile",
        sessions: "Sessions",
        payments: "Payments",
        bestPractices: "Best Practices",
        faq: "FAQ",
      },
      gettingStarted: {
        title: "Welcome to Lingueefy!",
        intro: "Congratulations on becoming a Lingueefy coach! This guide will help you set up your profile and start accepting sessions.",
        steps: [
          {
            title: "Complete Your Profile",
            description: "Add a professional photo, write a compelling bio, and highlight your SLE expertise.",
            icon: Users,
            link: "/coach/dashboard",
          },
          {
            title: "Set Your Availability",
            description: "Configure your weekly schedule so learners can book sessions with you.",
            icon: Calendar,
            link: "/coach/dashboard",
          },
          {
            title: "Connect Stripe",
            description: "Set up your payment account to receive earnings directly to your bank.",
            icon: CreditCard,
            link: "/coach/payments",
          },
          {
            title: "Add an Introduction Video",
            description: "Upload a YouTube video to introduce yourself and showcase your teaching style.",
            icon: Video,
            link: "/coach/dashboard",
          },
        ],
        checklist: {
          title: "Profile Completion Checklist",
          items: [
            "Professional profile photo",
            "Compelling headline (under 200 characters)",
            "Detailed biography",
            "SLE specializations selected",
            "Hourly and trial rates set",
            "Weekly availability configured",
            "Stripe account connected",
            "Introduction video (optional but recommended)",
          ],
        },
      },
      profile: {
        title: "Optimizing Your Profile",
        sections: [
          {
            title: "Profile Photo",
            content: "Use a professional, high-quality photo with good lighting. Smile and look approachable. Avoid casual selfies or group photos.",
          },
          {
            title: "Headline",
            content: "Your headline is the first thing learners see. Make it specific and compelling. Example: 'Bilingual SLE Coach | 10+ Years Helping Public Servants Achieve CBC'",
          },
          {
            title: "Biography",
            content: "Tell your story! Include your background, teaching philosophy, and what makes you unique. Mention specific SLE levels you specialize in and your success rate.",
          },
          {
            title: "Specializations",
            content: "Select all SLE levels and areas where you have expertise. Being specific helps learners find the right coach for their needs.",
          },
          {
            title: "Introduction Video",
            content: "A 1-2 minute video dramatically increases booking rates. Introduce yourself, explain your approach, and give learners a sense of your personality.",
          },
        ],
      },
      sessions: {
        title: "Managing Sessions",
        topics: [
          {
            title: "Before the Session",
            items: [
              "Review the learner's profile and goals",
              "Prepare relevant materials and exercises",
              "Test your audio/video equipment",
              "Join the meeting room 2-3 minutes early",
            ],
          },
          {
            title: "During the Session",
            items: [
              "Start with a brief warm-up conversation",
              "Focus on the learner's specific goals",
              "Provide constructive, actionable feedback",
              "Use screen sharing for visual aids",
              "Keep track of time and end on schedule",
            ],
          },
          {
            title: "After the Session",
            items: [
              "Add session notes (visible only to you)",
              "Send a follow-up message with key takeaways",
              "Encourage the learner to book their next session",
              "Request a review after a few sessions",
            ],
          },
        ],
        cancellation: {
          title: "Cancellation Policy",
          content: "Learners can cancel up to 24 hours before a session for a full refund. If you need to cancel, provide as much notice as possible. Frequent cancellations may affect your profile visibility.",
        },
      },
      payments: {
        title: "Earnings & Payments",
        commission: {
          title: "Commission Structure",
          description: "Lingueefy uses a volume-based commission structure that rewards active coaches:",
          tiers: [
            { tier: "Trial Sessions", rate: "0%", note: "You keep 100% of trial session earnings" },
            { tier: "Verified SLE Coach", rate: "15%", note: "Flat rate for verified coaches" },
            { tier: "0-10 hours/month", rate: "26%", note: "Starting rate" },
            { tier: "10-30 hours/month", rate: "22%", note: "" },
            { tier: "30-60 hours/month", rate: "19%", note: "" },
            { tier: "60-100 hours/month", rate: "17%", note: "" },
            { tier: "100+ hours/month", rate: "15%", note: "Lowest rate" },
          ],
        },
        payouts: {
          title: "Payout Schedule",
          content: "Payouts are processed weekly via Stripe. Funds typically arrive in your bank account within 2-3 business days after processing.",
        },
        referral: {
          title: "Referral Program",
          content: "Earn reduced commission on learners you refer! Share your unique referral link and pay only 5% commission on sessions with referred learners.",
        },
      },
      bestPractices: {
        title: "Best Practices for Success",
        tips: [
          {
            title: "Respond Quickly",
            description: "Aim to respond to messages within 24 hours. Quick responses lead to more bookings.",
            icon: Clock,
          },
          {
            title: "Be Consistent",
            description: "Keep your availability up-to-date and honor all scheduled sessions.",
            icon: Calendar,
          },
          {
            title: "Personalize Your Approach",
            description: "Tailor your sessions to each learner's specific SLE goals and learning style.",
            icon: Users,
          },
          {
            title: "Encourage Reviews",
            description: "Positive reviews build trust. Ask satisfied learners to share their experience.",
            icon: Star,
          },
          {
            title: "Track Progress",
            description: "Help learners see their improvement. Celebrate milestones and achievements.",
            icon: TrendingUp,
          },
          {
            title: "Stay Professional",
            description: "Maintain professional boundaries and follow Lingueefy's code of conduct.",
            icon: Shield,
          },
        ],
      },
      faq: {
        title: "Frequently Asked Questions",
        questions: [
          {
            q: "How do I get more bookings?",
            a: "Complete your profile 100%, add an introduction video, maintain competitive rates, respond quickly to messages, and encourage reviews from satisfied learners.",
          },
          {
            q: "Can I set different rates for different session types?",
            a: "Yes! You can set separate rates for trial sessions (30 min) and regular sessions (60 min). Many coaches offer discounted trial rates to attract new learners.",
          },
          {
            q: "What if a learner doesn't show up?",
            a: "Wait 10 minutes, then mark the session as a no-show. The learner will still be charged, and you'll receive payment.",
          },
          {
            q: "How do I become a Verified SLE Coach?",
            a: "Upload your SLE certification documents in your profile settings. Our team will review and verify your credentials within 2-3 business days.",
          },
          {
            q: "Can I offer package deals?",
            a: "Yes! Learners can purchase 5-session or 10-session packages at a discount. This encourages commitment and provides you with recurring income.",
          },
          {
            q: "What video platform do you use?",
            a: "We use Jitsi Meet, a free, secure video platform. No downloads required - sessions run directly in the browser.",
          },
          {
            q: "How do I handle difficult learners?",
            a: "Stay professional and patient. If issues persist, contact our support team. You can also block learners who violate our terms of service.",
          },
          {
            q: "Can I teach from anywhere?",
            a: "Yes! As long as you have a stable internet connection and quiet environment, you can teach from anywhere in the world.",
          },
        ],
      },
    },
    fr: {
      title: "Guide du Coach",
      subtitle: "Tout ce dont vous avez besoin pour réussir en tant que coach Lingueefy",
      tabs: {
        gettingStarted: "Démarrage",
        profile: "Votre Profil",
        sessions: "Séances",
        payments: "Paiements",
        bestPractices: "Bonnes Pratiques",
        faq: "FAQ",
      },
      gettingStarted: {
        title: "Bienvenue chez Lingueefy!",
        intro: "Félicitations pour être devenu coach Lingueefy! Ce guide vous aidera à configurer votre profil et à commencer à accepter des séances.",
        steps: [
          {
            title: "Complétez votre profil",
            description: "Ajoutez une photo professionnelle, rédigez une biographie convaincante et mettez en valeur votre expertise ELS.",
            icon: Users,
            link: "/coach/dashboard",
          },
          {
            title: "Définissez vos disponibilités",
            description: "Configurez votre horaire hebdomadaire pour que les apprenants puissent réserver des séances.",
            icon: Calendar,
            link: "/coach/dashboard",
          },
          {
            title: "Connectez Stripe",
            description: "Configurez votre compte de paiement pour recevoir vos gains directement sur votre compte bancaire.",
            icon: CreditCard,
            link: "/coach/payments",
          },
          {
            title: "Ajoutez une vidéo d'introduction",
            description: "Téléchargez une vidéo YouTube pour vous présenter et montrer votre style d'enseignement.",
            icon: Video,
            link: "/coach/dashboard",
          },
        ],
        checklist: {
          title: "Liste de vérification du profil",
          items: [
            "Photo de profil professionnelle",
            "Titre accrocheur (moins de 200 caractères)",
            "Biographie détaillée",
            "Spécialisations ELS sélectionnées",
            "Tarifs horaires et d'essai définis",
            "Disponibilités hebdomadaires configurées",
            "Compte Stripe connecté",
            "Vidéo d'introduction (optionnel mais recommandé)",
          ],
        },
      },
      profile: {
        title: "Optimiser votre profil",
        sections: [
          {
            title: "Photo de profil",
            content: "Utilisez une photo professionnelle de haute qualité avec un bon éclairage. Souriez et ayez l'air accessible. Évitez les selfies décontractés ou les photos de groupe.",
          },
          {
            title: "Titre",
            content: "Votre titre est la première chose que les apprenants voient. Rendez-le spécifique et convaincant. Exemple: 'Coach ELS bilingue | 10+ ans à aider les fonctionnaires à atteindre CBC'",
          },
          {
            title: "Biographie",
            content: "Racontez votre histoire! Incluez votre parcours, votre philosophie d'enseignement et ce qui vous rend unique. Mentionnez les niveaux ELS spécifiques dans lesquels vous vous spécialisez.",
          },
          {
            title: "Spécialisations",
            content: "Sélectionnez tous les niveaux ELS et domaines où vous avez une expertise. Être spécifique aide les apprenants à trouver le bon coach.",
          },
          {
            title: "Vidéo d'introduction",
            content: "Une vidéo de 1-2 minutes augmente considérablement les réservations. Présentez-vous, expliquez votre approche et donnez aux apprenants un aperçu de votre personnalité.",
          },
        ],
      },
      sessions: {
        title: "Gestion des séances",
        topics: [
          {
            title: "Avant la séance",
            items: [
              "Consultez le profil et les objectifs de l'apprenant",
              "Préparez des exercices et du matériel pertinents",
              "Testez votre équipement audio/vidéo",
              "Rejoignez la salle de réunion 2-3 minutes à l'avance",
            ],
          },
          {
            title: "Pendant la séance",
            items: [
              "Commencez par une brève conversation d'échauffement",
              "Concentrez-vous sur les objectifs spécifiques de l'apprenant",
              "Fournissez des commentaires constructifs et actionnables",
              "Utilisez le partage d'écran pour les aides visuelles",
              "Gardez une trace du temps et terminez à l'heure",
            ],
          },
          {
            title: "Après la séance",
            items: [
              "Ajoutez des notes de séance (visibles uniquement par vous)",
              "Envoyez un message de suivi avec les points clés",
              "Encouragez l'apprenant à réserver sa prochaine séance",
              "Demandez un avis après quelques séances",
            ],
          },
        ],
        cancellation: {
          title: "Politique d'annulation",
          content: "Les apprenants peuvent annuler jusqu'à 24 heures avant une séance pour un remboursement complet. Si vous devez annuler, prévenez le plus tôt possible. Les annulations fréquentes peuvent affecter la visibilité de votre profil.",
        },
      },
      payments: {
        title: "Revenus et paiements",
        commission: {
          title: "Structure de commission",
          description: "Lingueefy utilise une structure de commission basée sur le volume qui récompense les coachs actifs:",
          tiers: [
            { tier: "Séances d'essai", rate: "0%", note: "Vous gardez 100% des revenus d'essai" },
            { tier: "Coach ELS vérifié", rate: "15%", note: "Taux fixe pour les coachs vérifiés" },
            { tier: "0-10 heures/mois", rate: "26%", note: "Taux de départ" },
            { tier: "10-30 heures/mois", rate: "22%", note: "" },
            { tier: "30-60 heures/mois", rate: "19%", note: "" },
            { tier: "60-100 heures/mois", rate: "17%", note: "" },
            { tier: "100+ heures/mois", rate: "15%", note: "Taux le plus bas" },
          ],
        },
        payouts: {
          title: "Calendrier des paiements",
          content: "Les paiements sont traités chaque semaine via Stripe. Les fonds arrivent généralement sur votre compte bancaire dans les 2-3 jours ouvrables suivant le traitement.",
        },
        referral: {
          title: "Programme de parrainage",
          content: "Gagnez une commission réduite sur les apprenants que vous référez! Partagez votre lien de parrainage unique et ne payez que 5% de commission sur les séances avec les apprenants référés.",
        },
      },
      bestPractices: {
        title: "Bonnes pratiques pour réussir",
        tips: [
          {
            title: "Répondez rapidement",
            description: "Visez à répondre aux messages dans les 24 heures. Les réponses rapides mènent à plus de réservations.",
            icon: Clock,
          },
          {
            title: "Soyez constant",
            description: "Gardez vos disponibilités à jour et honorez toutes les séances programmées.",
            icon: Calendar,
          },
          {
            title: "Personnalisez votre approche",
            description: "Adaptez vos séances aux objectifs ELS spécifiques et au style d'apprentissage de chaque apprenant.",
            icon: Users,
          },
          {
            title: "Encouragez les avis",
            description: "Les avis positifs renforcent la confiance. Demandez aux apprenants satisfaits de partager leur expérience.",
            icon: Star,
          },
          {
            title: "Suivez les progrès",
            description: "Aidez les apprenants à voir leur amélioration. Célébrez les étapes et les réalisations.",
            icon: TrendingUp,
          },
          {
            title: "Restez professionnel",
            description: "Maintenez des limites professionnelles et suivez le code de conduite de Lingueefy.",
            icon: Shield,
          },
        ],
      },
      faq: {
        title: "Questions fréquemment posées",
        questions: [
          {
            q: "Comment obtenir plus de réservations?",
            a: "Complétez votre profil à 100%, ajoutez une vidéo d'introduction, maintenez des tarifs compétitifs, répondez rapidement aux messages et encouragez les avis des apprenants satisfaits.",
          },
          {
            q: "Puis-je définir des tarifs différents pour différents types de séances?",
            a: "Oui! Vous pouvez définir des tarifs séparés pour les séances d'essai (30 min) et les séances régulières (60 min). Beaucoup de coachs offrent des tarifs d'essai réduits pour attirer de nouveaux apprenants.",
          },
          {
            q: "Que faire si un apprenant ne se présente pas?",
            a: "Attendez 10 minutes, puis marquez la séance comme absence. L'apprenant sera quand même facturé et vous recevrez le paiement.",
          },
          {
            q: "Comment devenir un Coach ELS vérifié?",
            a: "Téléchargez vos documents de certification ELS dans les paramètres de votre profil. Notre équipe examinera et vérifiera vos références dans les 2-3 jours ouvrables.",
          },
          {
            q: "Puis-je offrir des forfaits?",
            a: "Oui! Les apprenants peuvent acheter des forfaits de 5 ou 10 séances à prix réduit. Cela encourage l'engagement et vous fournit un revenu récurrent.",
          },
          {
            q: "Quelle plateforme vidéo utilisez-vous?",
            a: "Nous utilisons Jitsi Meet, une plateforme vidéo gratuite et sécurisée. Aucun téléchargement requis - les séances se déroulent directement dans le navigateur.",
          },
          {
            q: "Comment gérer les apprenants difficiles?",
            a: "Restez professionnel et patient. Si les problèmes persistent, contactez notre équipe de support. Vous pouvez également bloquer les apprenants qui violent nos conditions d'utilisation.",
          },
          {
            q: "Puis-je enseigner de n'importe où?",
            a: "Oui! Tant que vous avez une connexion Internet stable et un environnement calme, vous pouvez enseigner de n'importe où dans le monde.",
          },
        ],
      },
    },
  };

  const c = content[language];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-12 border-b">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{c.title}</h1>
                <p className="text-slate-900 dark:text-slate-100">{c.subtitle}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-8">
          <div className="container max-w-6xl mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="grid grid-cols-3 lg:grid-cols-6 gap-2 h-auto p-1">
                <TabsTrigger value="getting-started" className="text-xs sm:text-sm">
                  {c.tabs.gettingStarted}
                </TabsTrigger>
                <TabsTrigger value="profile" className="text-xs sm:text-sm">
                  {c.tabs.profile}
                </TabsTrigger>
                <TabsTrigger value="sessions" className="text-xs sm:text-sm">
                  {c.tabs.sessions}
                </TabsTrigger>
                <TabsTrigger value="payments" className="text-xs sm:text-sm">
                  {c.tabs.payments}
                </TabsTrigger>
                <TabsTrigger value="best-practices" className="text-xs sm:text-sm">
                  {c.tabs.bestPractices}
                </TabsTrigger>
                <TabsTrigger value="faq" className="text-xs sm:text-sm">
                  {c.tabs.faq}
                </TabsTrigger>
              </TabsList>

              {/* Getting Started */}
              <TabsContent value="getting-started" className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      {c.gettingStarted.title}
                    </CardTitle>
                    <CardDescription>{c.gettingStarted.intro}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {c.gettingStarted.steps.map((step, index) => (
                        <Link key={index} href={step.link}>
                          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  <step.icon className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {isEn ? "Step" : "Étape"} {index + 1}
                                    </Badge>
                                  </div>
                                  <h3 className="font-semibold mt-2">{step.title}</h3>
                                  <p className="text-sm text-slate-900 dark:text-slate-100 mt-1">
                                    {step.description}
                                  </p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-slate-900 dark:text-slate-100" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{c.gettingStarted.checklist.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {c.gettingStarted.checklist.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Profile */}
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{c.profile.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {c.profile.sections.map((section, index) => (
                      <div key={index} className="border-b pb-6 last:border-0 last:pb-0">
                        <h3 className="font-semibold mb-2">{section.title}</h3>
                        <p className="text-slate-900 dark:text-slate-100">{section.content}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sessions */}
              <TabsContent value="sessions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{c.sessions.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {c.sessions.topics.map((topic, index) => (
                      <div key={index}>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Badge variant="outline">{index + 1}</Badge>
                          {topic.title}
                        </h3>
                        <ul className="space-y-2">
                          {topic.items.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-slate-900 dark:text-slate-100">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-[#FFE4D6] bg-amber-50/50 dark:bg-amber-950/20">
                  <CardHeader>
                    <CardTitle className="text-amber-800 dark:text-amber-200">
                      {c.sessions.cancellation.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-amber-700 dark:text-amber-300">
                      {c.sessions.cancellation.content}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payments */}
              <TabsContent value="payments" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      {c.payments.commission.title}
                    </CardTitle>
                    <CardDescription>{c.payments.commission.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium">
                              {isEn ? "Tier" : "Niveau"}
                            </th>
                            <th className="text-right py-3 px-4 font-medium">
                              {isEn ? "Commission" : "Commission"}
                            </th>
                            <th className="text-left py-3 px-4 font-medium">
                              {isEn ? "Note" : "Note"}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {c.payments.commission.tiers.map((tier, index) => (
                            <tr key={index} className="border-b last:border-0">
                              <td className="py-3 px-4">{tier.tier}</td>
                              <td className="py-3 px-4 text-right font-semibold text-primary">
                                {tier.rate}
                              </td>
                              <td className="py-3 px-4 text-sm text-slate-900 dark:text-slate-100">
                                {tier.note}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid sm:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{c.payments.payouts.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-900 dark:text-slate-100">{c.payments.payouts.content}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20">
                    <CardHeader>
                      <CardTitle className="text-lg text-emerald-800 dark:text-emerald-200">
                        {c.payments.referral.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-emerald-700 dark:text-emerald-300">
                        {c.payments.referral.content}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Best Practices */}
              <TabsContent value="best-practices" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{c.bestPractices.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {c.bestPractices.tips.map((tip, index) => (
                        <Card key={index} className="bg-muted/30">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <tip.icon className="h-5 w-5 text-primary" />
                              </div>
                              <h3 className="font-semibold">{tip.title}</h3>
                            </div>
                            <p className="text-sm text-slate-900 dark:text-slate-100">{tip.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* FAQ */}
              <TabsContent value="faq" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-primary" />
                      {c.faq.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {c.faq.questions.map((item, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger className="text-left">
                            {item.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-slate-900 dark:text-slate-100">
                            {item.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* CTA */}
            <Card className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {isEn ? "Ready to start coaching?" : "Prêt à commencer à coacher?"}
                    </h3>
                    <p className="text-slate-900 dark:text-slate-100">
                      {isEn 
                        ? "Complete your profile setup and start accepting sessions today."
                        : "Complétez la configuration de votre profil et commencez à accepter des séances dès aujourd'hui."}
                    </p>
                  </div>
                  <Link href="/coach/dashboard">
                    <Button size="lg">
                      {isEn ? "Go to Dashboard" : "Aller au tableau de bord"}
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {!isInsideAppLayout && <Footer />}
    </div>
  );
}
