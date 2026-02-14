import Footer from "@/components/Footer";
import FeaturedCoaches from "@/components/FeaturedCoaches";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  UserPlus,
  Search,
  Calendar,
  Video,
  Star,
  Award,
  Bot,
  Target,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Link } from "wouter";
import { COACH_RATES } from "@shared/pricing";

export default function HowItWorks() {
  const { language } = useLanguage();

  const labels = {
    en: {
      title: "How Lingueefy Works",
      subtitle: "Your path to SLE success in 4 simple steps",
      forLearners: "For Learners",
      forCoaches: "For Coaches",
      step1Title: "Create Your Profile",
      step1Desc: "Sign up and tell us about your current SLE level, target goals (BBB, CBC, CCC), and preferred learning schedule.",
      step2Title: "Find Your Coach",
      step2Desc: "Browse our vetted coaches who specialize in federal SLE preparation. Filter by language, level, availability, and price.",
      step3Title: "Book Sessions",
      step3Desc: "Schedule sessions that fit your calendar. Choose from trial sessions, regular coaching, or exam simulation packages.",
      step4Title: "Achieve Your Goals",
      step4Desc: "Practice with your coach and SLE AI Companion. Track your progress and get ready to pass your SLE exam.",
      coachStep1Title: "Apply to Join",
      coachStep1Desc: "Submit your application with your teaching experience, credentials, and SLE expertise.",
      coachStep2Title: "Get Approved",
      coachStep2Desc: "Our team reviews your application to ensure quality for our learners. Most applications are reviewed within 48 hours.",
      coachStep3Title: "Set Your Schedule",
      coachStep3Desc: "Create your profile, set your availability, and define your rates. You're in control of your coaching business.",
      coachStep4Title: "Start Coaching",
      coachStep4Desc: "Connect with motivated public servants, conduct sessions, and earn competitive rates while making a difference.",
      aiSection: "Practice 24/7 with SLE AI Companion",
      aiDesc: "Between coaching sessions, continue your practice with our AI-powered language partner.",
      aiFeature1: "Voice Practice Sessions",
      aiFeature1Desc: "Conversational practice in French or English, adapted to your level",
      aiFeature2: "SLE Placement Tests",
      aiFeature2Desc: "Assess your current level and track your progress over time",
      aiFeature3: "Oral Exam Simulations",
      aiFeature3Desc: "Practice with realistic exam scenarios for Level A, B, or C",
      tryAI: "Try SLE AI Companion",
      getStarted: "Get Started",
      becomeCoach: "Become a Coach",
      faqTitle: "Frequently Asked Questions",
      faq1Q: "How much does it cost?",
      faq1A: `Coach rates vary from ${COACH_RATES.FULL_RANGE_DISPLAY} per hour. Trial sessions are typically discounted. SLE AI Companion practice is included with your account.`,
      faq2Q: "How do I know which coach is right for me?",
      faq2A: "Each coach profile shows their specializations, success rates, and reviews from other public servants. You can also book a trial session to find the right fit.",
      faq3Q: "Can I use Lingueefy on my government computer?",
      faq3A: "Yes! Lingueefy is a web application that works in any browser. No software installation required.",
      faq4Q: "How is SLE AI Companion different from ChatGPT?",
      faq4A: "SLE AI Companion is specifically trained for Canadian federal SLE preparation. It understands the exam format, scoring criteria, and provides feedback calibrated to Treasury Board standards.",
    },
    fr: {
      title: "Comment fonctionne Lingueefy",
      subtitle: "Votre chemin vers le succès ELS en 4 étapes simples",
      forLearners: "Pour les apprenants",
      forCoaches: "Pour les coachs",
      step1Title: "Créez votre profil",
      step1Desc: "Inscrivez-vous et parlez-nous de votre niveau ELS actuel, vos objectifs (BBB, CBC, CCC) et votre horaire préféré.",
      step2Title: "Trouvez votre coach",
      step2Desc: "Parcourez nos coachs vérifiés spécialisés dans la préparation ELS fédérale. Filtrez par langue, niveau, disponibilité et prix.",
      step3Title: "Réservez des sessions",
      step3Desc: "Planifiez des sessions qui correspondent à votre calendrier. Choisissez parmi les sessions d'essai, le coaching régulier ou les forfaits de simulation d'examen.",
      step4Title: "Atteignez vos objectifs",
      step4Desc: "Pratiquez avec votre coach et SLE AI Companion. Suivez vos progrès et préparez-vous à réussir votre examen ELS.",
      coachStep1Title: "Postulez pour rejoindre",
      coachStep1Desc: "Soumettez votre candidature avec votre expérience d'enseignement, vos diplômes et votre expertise ELS.",
      coachStep2Title: "Obtenez l'approbation",
      coachStep2Desc: "Notre équipe examine votre candidature pour assurer la qualité pour nos apprenants. La plupart des candidatures sont examinées dans les 48 heures.",
      coachStep3Title: "Définissez votre horaire",
      coachStep3Desc: "Créez votre profil, définissez votre disponibilité et vos tarifs. Vous contrôlez votre activité de coaching.",
      coachStep4Title: "Commencez à coacher",
      coachStep4Desc: "Connectez-vous avec des fonctionnaires motivés, donnez des sessions et gagnez des tarifs compétitifs tout en faisant une différence.",
      aiSection: "Pratiquez 24/7 avec SLE AI Companion",
      aiDesc: "Entre les sessions de coaching, continuez votre pratique avec notre partenaire linguistique alimenté par l'IA.",
      aiFeature1: "Sessions de pratique vocale",
      aiFeature1Desc: "Pratique conversationnelle en français ou en anglais, adaptée à votre niveau",
      aiFeature2: "Tests de classement ELS",
      aiFeature2Desc: "Évaluez votre niveau actuel et suivez vos progrès au fil du temps",
      aiFeature3: "Simulations d'examen oral",
      aiFeature3Desc: "Pratiquez avec des scénarios d'examen réalistes pour les niveaux A, B ou C",
      tryAI: "Essayer SLE AI Companion",
      getStarted: "Commencer",
      becomeCoach: "Devenir coach",
      faqTitle: "Questions fréquemment posées",
      faq1Q: "Combien ça coûte?",
      faq1A: "Les tarifs des coachs varient de 40$ à 100$+ par heure. Les sessions d'essai sont généralement à prix réduit. La pratique avec SLE AI Companion est incluse avec votre compte.",
      faq2Q: "Comment savoir quel coach me convient?",
      faq2A: "Chaque profil de coach montre ses spécialisations, taux de réussite et avis d'autres fonctionnaires. Vous pouvez aussi réserver une session d'essai pour trouver le bon match.",
      faq3Q: "Puis-je utiliser Lingueefy sur mon ordinateur gouvernemental?",
      faq3A: "Oui! Lingueefy est une application web qui fonctionne dans n'importe quel navigateur. Aucune installation de logiciel requise.",
      faq4Q: "En quoi SLE AI Companion est-il différent de ChatGPT?",
      faq4A: "SLE AI Companion est spécifiquement formé pour la préparation ELS fédérale canadienne. Il comprend le format d'examen, les critères de notation et fournit des commentaires calibrés selon les normes du Conseil du Trésor.",
    },
  };

  const l = labels[language];

  const learnerSteps = [
    { icon: UserPlus, title: l.step1Title, desc: l.step1Desc },
    { icon: Search, title: l.step2Title, desc: l.step2Desc },
    { icon: Calendar, title: l.step3Title, desc: l.step3Desc },
    { icon: Award, title: l.step4Title, desc: l.step4Desc },
  ];

  const coachSteps = [
    { icon: UserPlus, title: l.coachStep1Title, desc: l.coachStep1Desc },
    { icon: CheckCircle, title: l.coachStep2Title, desc: l.coachStep2Desc },
    { icon: Calendar, title: l.coachStep3Title, desc: l.coachStep3Desc },
    { icon: Video, title: l.coachStep4Title, desc: l.coachStep4Desc },
  ];

  const faqs = [
    { q: l.faq1Q, a: l.faq1A },
    { q: l.faq2Q, a: l.faq2A },
    { q: l.faq3Q, a: l.faq3A },
    { q: l.faq4Q, a: l.faq4A },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      

      <main id="main-content" className="flex-1">
        {/* Hero */}
        <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
          <div className="container text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{l.title}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{l.subtitle}</p>
          </div>
        </section>

        {/* Featured Coaches Section - Find Your Perfect Language Tutor */}
        <FeaturedCoaches />

        {/* For Learners */}
        <section className="py-16">
          <div className="container">
            <h2 className="text-2xl font-bold text-center mb-12">{l.forLearners}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {learnerSteps.map((step, i) => (
                <Card key={i} className="relative">
                  <CardContent className="pt-8 pb-6">
                    <div className="absolute -top-4 left-6 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {i + 1}
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/coaches">
                <Button size="lg" className="gap-2">
                  {l.getStarted}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* SLE AI Companion Section */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-4">{l.aiSection}</h2>
                <p className="text-muted-foreground">{l.aiDesc}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <Target className="h-8 w-8 text-primary mb-4" />
                    <h3 className="font-semibold mb-2">{l.aiFeature1}</h3>
                    <p className="text-sm text-muted-foreground">{l.aiFeature1Desc}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <Star className="h-8 w-8 text-primary mb-4" />
                    <h3 className="font-semibold mb-2">{l.aiFeature2}</h3>
                    <p className="text-sm text-muted-foreground">{l.aiFeature2Desc}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <Video className="h-8 w-8 text-primary mb-4" />
                    <h3 className="font-semibold mb-2">{l.aiFeature3}</h3>
                    <p className="text-sm text-muted-foreground">{l.aiFeature3Desc}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center mt-8">
                <Link href="/prof-steven-ai">
                  <Button variant="outline" size="lg" className="gap-2">
                    <Bot className="h-4 w-4" />
                    {l.tryAI}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* For Coaches */}
        <section className="py-16">
          <div className="container">
            <h2 className="text-2xl font-bold text-center mb-12">{l.forCoaches}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {coachSteps.map((step, i) => (
                <Card key={i} className="relative">
                  <CardContent className="pt-8 pb-6">
                    <div className="absolute -top-4 left-6 h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                      {i + 1}
                    </div>
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                      <step.icon className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/become-a-coach">
                <Button variant="outline" size="lg" className="gap-2">
                  {l.becomeCoach}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-2xl font-bold text-center mb-12">{l.faqTitle}</h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">{faq.q}</h3>
                    <p className="text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
