import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import Footer from "@/components/Footer";
import { CheckCircle, Mail, Clock, Phone, ArrowRight, Home } from "lucide-react";

export default function BookingConfirmation() {
  const { language } = useLanguage();

  const labels = {
    en: {
      title: "Thank You!",
      subtitle: "Your session has been scheduled",
      confirmationMessage: "We've received your booking request and will send a confirmation email shortly.",
      nextSteps: "What Happens Next",
      step1Title: "Confirmation Email",
      step1Desc: "Check your email within 1 hour for confirmation and session details.",
      step2Title: "Coach Contact",
      step2Desc: "A coach will reach out within 24 hours to finalize your session.",
      step3Title: "Session Reminder",
      step3Desc: "You'll receive a reminder 24 hours before your scheduled session.",
      contactInfo: "Questions?",
      contactEmail: "Email us at admin@rusingacademy.ca",
      contactPhone: "Or call us during business hours",
      ctaHome: "Return to Home",
      ctaExplore: "Explore Our Programs",
      emailNotReceived: "Didn't receive an email?",
      checkSpam: "Check your spam folder or contact us directly.",
    },
    fr: {
      title: "Merci!",
      subtitle: "Votre séance a été planifiée",
      confirmationMessage: "Nous avons reçu votre demande de réservation et vous enverrons une confirmation par courriel très bientôt.",
      nextSteps: "Prochaines étapes",
      step1Title: "Courriel de confirmation",
      step1Desc: "Vérifiez votre courriel dans l'heure suivante pour la confirmation et les détails de la séance.",
      step2Title: "Contact du coach",
      step2Desc: "Un coach vous contactera dans les 24 heures pour finaliser votre séance.",
      step3Title: "Rappel de séance",
      step3Desc: "Vous recevrez un rappel 24 heures avant votre séance prévue.",
      contactInfo: "Des questions?",
      contactEmail: "Envoyez-nous un courriel à admin@rusingacademy.ca",
      contactPhone: "Ou appelez-nous pendant les heures d'affaires",
      ctaHome: "Retour à l'accueil",
      ctaExplore: "Découvrir nos programmes",
      emailNotReceived: "N'avez-vous pas reçu de courriel?",
      checkSpam: "Vérifiez votre dossier de courrier indésirable ou contactez-nous directement.",
    },
  };

  const l = labels[language];

  const nextSteps = [
    {
      icon: Mail,
      title: l.step1Title,
      desc: l.step1Desc,
    },
    {
      icon: Phone,
      title: l.step2Title,
      desc: l.step2Desc,
    },
    {
      icon: Clock,
      title: l.step3Title,
      desc: l.step3Desc,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      

      <main id="main-content" className="flex-1">
        {/* Success Section */}
        <section className="py-16 lg:py-24">
          <div className="container max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
                className="mb-6 flex justify-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl" />
                  <CheckCircle className="w-20 h-20 text-green-500 relative" />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold mb-2"
              >
                {l.title}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-xl text-slate-900 dark:text-slate-100 mb-6"
              >
                {l.subtitle}
              </motion.p>

              {/* Confirmation Message */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-lg text-slate-900 dark:text-slate-100 mb-8"
              >
                {l.confirmationMessage}
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Next Steps Section */}
        <section className="py-16 lg:py-24 bg-muted/50">
          <div className="container max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
                {l.nextSteps}
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                {nextSteps.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: idx * 0.1 }}
                    >
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex flex-col items-center text-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                              <Icon className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-semibold text-lg">{step.title}</h3>
                            <p className="text-sm text-slate-900 dark:text-slate-100">{step.desc}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 lg:py-24">
          <div className="container max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-6">{l.contactInfo}</h2>

              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="w-5 h-5 text-primary" />
                      <a 
                        href="mailto:admin@rusingacademy.ca"
                        className="text-primary hover:underline font-medium"
                      >
                        {l.contactEmail}
                      </a>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Phone className="w-5 h-5 text-primary" />
                      <p className="font-medium">{l.contactPhone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Email Not Received */}
              <Card className="bg-amber-50 border-[#FFE4D6] mb-8">
                <CardContent className="pt-6">
                  <p className="font-semibold text-amber-900 mb-2">{l.emailNotReceived}</p>
                  <p className="text-sm text-amber-800">{l.checkSpam}</p>
                </CardContent>
              </Card>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button 
                    variant="outline"
                    size="lg"
                    className="px-8"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    {l.ctaHome}
                  </Button>
                </Link>
                <Link href="/rusingacademy">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-[#FF6A2B] to-[#ff8f5e] text-white border-0 px-8 font-bold rounded-xl"
                  >
                    {l.ctaExplore}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
