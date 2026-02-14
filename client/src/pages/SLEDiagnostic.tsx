import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import Footer from "@/components/Footer";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CheckCircle, Clock, Users, Award, ArrowRight, Star } from "lucide-react";

export default function SLEDiagnostic() {
  const { language } = useLanguage();

  const labels = {
    en: {
      title: "Your SLE Diagnostic Session",
      subtitle: "Discover your personalized path to bilingual success",
      description: "A 45-minute 1-on-1 assessment with an expert SLE coach to identify your strengths, gaps, and next steps.",
      
      // What is it section
      whatIsTitle: "What is the SLE Diagnostic?",
      whatIsDesc: "The SLE Diagnostic is a personalized assessment designed specifically for Canadian public servants preparing for the Standardized Lexical Exam (SLE). During this session, you'll work with an expert coach to evaluate your current level, identify areas for improvement, and receive a customized learning plan.",
      
      // Who is it for
      whoIsTitle: "Who is it for?",
      whoIsItems: [
        "Canadian public servants preparing for SLE oral exam",
        "Professionals seeking promotion that requires SLE certification",
        "Teams looking to improve bilingual communication",
        "Anyone wanting personalized guidance on language learning",
      ],
      
      // What you'll get
      whatYouGetTitle: "What You'll Get",
      whatYouGetItems: [
        "Comprehensive assessment of your current SLE level",
        "Personalized learning plan tailored to your goals",
        "Specific recommendations for improvement",
        "Clear next steps and timeline to success",
        "Access to exclusive learning resources",
      ],
      
      // Success stories
      successTitle: "Success Stories",
      
      // Pricing
      pricingTitle: "Investment",
      pricingDesc: "The SLE Diagnostic is an investment in your career and bilingual confidence.",
      pricingPrice: "$199",
      pricingIncludes: "Includes 45-minute session + personalized learning plan",
      
      // CTA
      ctaButton: "Schedule Your Diagnostic",
      ctaSecondary: "Have questions?",
      
      // FAQ
      faqTitle: "Frequently Asked Questions",
      faqItems: [
        {
          q: "How long is the diagnostic session?",
          a: "The session is 45 minutes long, conducted 1-on-1 with an expert SLE coach.",
        },
        {
          q: "What should I prepare?",
          a: "Come ready to speak French! We recommend having a quiet space and a microphone/headphones for the best experience.",
        },
        {
          q: "When will I get my results?",
          a: "You'll receive your personalized learning plan and recommendations immediately after the session.",
        },
        {
          q: "Can I reschedule if needed?",
          a: "Yes! We offer flexible rescheduling up to 24 hours before your session.",
        },
        {
          q: "What if I'm not ready?",
          a: "No problem! Our coaches will help you assess your readiness and suggest the best starting point for your journey.",
        },
      ],
    },
    fr: {
      title: "Votre session de diagnostic ELS",
      subtitle: "Découvrez votre chemin personnalisé vers le succès bilingue",
      description: "Une évaluation de 45 minutes en tête-à-tête avec un coach expert en ELS pour identifier vos forces, vos lacunes et vos prochaines étapes.",
      
      // What is it section
      whatIsTitle: "Qu'est-ce que le diagnostic ELS?",
      whatIsDesc: "Le diagnostic ELS est une évaluation personnalisée conçue spécifiquement pour les fonctionnaires canadiens se préparant à l'examen lexical normalisé (ELS). Au cours de cette séance, vous travaillerez avec un coach expert pour évaluer votre niveau actuel, identifier les domaines à améliorer et recevoir un plan d'apprentissage personnalisé.",
      
      // Who is it for
      whoIsTitle: "Pour qui est-ce?",
      whoIsItems: [
        "Fonctionnaires canadiens se préparant à l'examen oral ELS",
        "Professionnels cherchant une promotion nécessitant la certification ELS",
        "Équipes cherchant à améliorer la communication bilingue",
        "Quiconque souhaite des conseils personnalisés sur l'apprentissage des langues",
      ],
      
      // What you'll get
      whatYouGetTitle: "Ce que vous obtiendrez",
      whatYouGetItems: [
        "Évaluation complète de votre niveau ELS actuel",
        "Plan d'apprentissage personnalisé adapté à vos objectifs",
        "Recommandations spécifiques pour l'amélioration",
        "Prochaines étapes claires et calendrier de réussite",
        "Accès aux ressources d'apprentissage exclusives",
      ],
      
      // Success stories
      successTitle: "Histoires de réussite",
      
      // Pricing
      pricingTitle: "Investissement",
      pricingDesc: "Le diagnostic ELS est un investissement dans votre carrière et votre confiance bilingue.",
      pricingPrice: "199 $",
      pricingIncludes: "Comprend une séance de 45 minutes + plan d'apprentissage personnalisé",
      
      // CTA
      ctaButton: "Planifier votre diagnostic",
      ctaSecondary: "Des questions?",
      
      // FAQ
      faqTitle: "Questions fréquemment posées",
      faqItems: [
        {
          q: "Combien de temps dure la séance de diagnostic?",
          a: "La séance dure 45 minutes, menée en tête-à-tête avec un coach expert en ELS.",
        },
        {
          q: "Comment dois-je me préparer?",
          a: "Venez prêt à parler français! Nous recommandons d'avoir un espace calme et un microphone/des écouteurs pour la meilleure expérience.",
        },
        {
          q: "Quand recevrai-je mes résultats?",
          a: "Vous recevrez votre plan d'apprentissage personnalisé et vos recommandations immédiatement après la séance.",
        },
        {
          q: "Puis-je reporter si nécessaire?",
          a: "Oui! Nous offrons une reprogrammation flexible jusqu'à 24 heures avant votre séance.",
        },
        {
          q: "Et si je ne suis pas prêt?",
          a: "Pas de problème! Nos coaches vous aideront à évaluer votre préparation et à suggérer le meilleur point de départ pour votre parcours.",
        },
      ],
    },
  };

  const l = labels[language];
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const testimonials = [
    {
      en: "The diagnostic session gave me clarity on exactly what I needed to work on. I passed my CBC exam 3 months later!",
      fr: "La séance de diagnostic m'a donné de la clarté sur exactement ce sur quoi je devais travailler. J'ai réussi mon examen CBC 3 mois plus tard!",
      author: "Sarah M.",
      role: { en: "Policy Analyst", fr: "Analyste des politiques" },
      org: "Global Affairs Canada",
    },
    {
      en: "Best investment I made for my career. The personalized plan was exactly what I needed.",
      fr: "Le meilleur investissement que j'ai fait pour ma carrière. Le plan personnalisé était exactement ce dont j'avais besoin.",
      author: "Michael A.",
      role: { en: "HR Director", fr: "Directeur des RH" },
      org: "Treasury Board Secretariat",
    },
    {
      en: "I went from feeling lost to having a clear roadmap. Highly recommend!",
      fr: "Je suis passé de me sentir perdu à avoir une feuille de route claire. Fortement recommandé!",
      author: "Jennifer W.",
      role: { en: "Deputy Director", fr: "Directrice adjointe" },
      org: "Employment and Social Development Canada",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      

      <main id="main-content" className="flex-1">
        <Breadcrumb 
          items={[
            { label: "SLE Diagnostic", labelFr: "Diagnostic ELS" }
          ]} 
        />

        {/* Hero Section */}
        <section className="py-16 lg:py-24 hero-gradient">
          <div className="container text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                {l.title}
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                {l.subtitle}
              </p>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
                {l.description}
              </p>
              <Link href="/booking">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-[#FF6A2B] to-[#ff8f5e] text-white border-0 px-8 py-6 text-base font-bold rounded-xl shadow-lg hover:-translate-y-1 transition-transform"
                  style={{ boxShadow: "0 10px 25px -5px rgba(255, 106, 43, 0.5)" }}
                >
                  {l.ctaButton}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* What is it section */}
        <section className="py-16 lg:py-24">
          <div className="container max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{l.whatIsTitle}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {l.whatIsDesc}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Who is it for section */}
        <section className="py-16 lg:py-24 bg-muted/50">
          <div className="container max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-8">{l.whoIsTitle}</h2>
              <div className="grid gap-4">
                {l.whoIsItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-primary shrink-0 mt-1" />
                    <p className="text-lg">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* What you'll get section */}
        <section className="py-16 lg:py-24">
          <div className="container max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-8">{l.whatYouGetTitle}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {l.whatYouGetItems.map((item, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Award className="w-6 h-6 text-primary shrink-0 mt-1" />
                        <p className="text-base">{item}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials section */}
        <section className="py-16 lg:py-24 bg-muted/50">
          <div className="container max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">{l.successTitle}</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {testimonials.map((testimonial, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-6">
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                        ))}
                      </div>
                      <p className="text-sm mb-4 italic">
                        "{testimonial[language]}"
                      </p>
                      <div className="border-t pt-4">
                        <p className="font-semibold text-sm">{testimonial.author}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role[language]}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.org}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing section */}
        <section className="py-16 lg:py-24">
          <div className="container max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{l.pricingTitle}</h2>
              <p className="text-lg text-muted-foreground mb-8">{l.pricingDesc}</p>
              <Card className="max-w-md mx-auto">
                <CardContent className="pt-8">
                  <div className="text-5xl font-bold mb-2">{l.pricingPrice}</div>
                  <p className="text-muted-foreground mb-6">{l.pricingIncludes}</p>
                  <Link href="/booking">
                    <Button 
                      size="lg" 
                      className="w-full bg-gradient-to-r from-[#FF6A2B] to-[#ff8f5e] text-white border-0 px-8 py-6 text-base font-bold rounded-xl"
                    >
                      {l.ctaButton}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* FAQ section */}
        <section className="py-16 lg:py-24 bg-muted/50">
          <div className="container max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">{l.faqTitle}</h2>
              <div className="space-y-4">
                {l.faqItems.map((item, idx) => (
                  <Card 
                    key={idx}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>{item.q}</span>
                        <span className={`transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </CardTitle>
                    </CardHeader>
                    {expandedFaq === idx && (
                      <CardContent>
                        <p className="text-muted-foreground">{item.a}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Final CTA section */}
        <section className="py-16 lg:py-24">
          <div className="container max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {language === 'en' ? 'Ready to get started?' : 'Prêt à commencer?'}
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {language === 'en' 
                  ? 'Schedule your SLE Diagnostic today and take the first step towards bilingual success.'
                  : 'Planifiez votre diagnostic ELS dès aujourd\'hui et faites le premier pas vers le succès bilingue.'}
              </p>
              <Link href="/booking">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-[#FF6A2B] to-[#ff8f5e] text-white border-0 px-8 py-6 text-base font-bold rounded-xl shadow-lg hover:-translate-y-1 transition-transform"
                  style={{ boxShadow: "0 10px 25px -5px rgba(255, 106, 43, 0.5)" }}
                >
                  {l.ctaButton}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
