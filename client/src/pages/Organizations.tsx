import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Lock, Building2, TrendingUp, Users, Zap, BarChart3, CheckCircle2 } from "lucide-react";

export default function Organizations() {
  const { language, t } = useLanguage();

  const benefits = [
    {
      icon: Users,
      titleEn: "Team Management",
      titleFr: "Gestion d'équipe",
      descEn: "Manage multiple learners from your organization with a centralized dashboard",
      descFr: "Gérez plusieurs apprenants de votre organisation avec un tableau de bord centralisé",
    },
    {
      icon: Zap,
      titleEn: "Coaching Credits",
      titleFr: "Crédits de coaching",
      descEn: "Purchase coaching credits in bulk and distribute them to your team members",
      descFr: "Achetez des crédits de coaching en gros et distribuez-les aux membres de votre équipe",
    },
    {
      icon: BarChart3,
      titleEn: "Progress Tracking",
      titleFr: "Suivi des progrès",
      descEn: "Monitor your team's SLE progress and language learning outcomes",
      descFr: "Suivez les progrès SLE de votre équipe et les résultats d'apprentissage linguistique",
    },
    {
      icon: TrendingUp,
      titleEn: "Bulk Discounts",
      titleFr: "Réductions en gros",
      descEn: "Enjoy special pricing for organizations with 10+ team members",
      descFr: "Bénéficiez de tarifs spéciaux pour les organisations de 10+ membres",
    },
  ];

  const features = [
    { titleEn: "Dedicated account manager", titleFr: "Gestionnaire de compte dédié" },
    { titleEn: "Custom training programs", titleFr: "Programmes de formation personnalisés" },
    { titleEn: "API access for integration", titleFr: "Accès API pour l'intégration" },
    { titleEn: "Priority support", titleFr: "Support prioritaire" },
    { titleEn: "Customizable branding", titleFr: "Marque personnalisable" },
    { titleEn: "Advanced analytics", titleFr: "Analyse avancée" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      

      <main className="pt-20 pb-20">
        {/* Hero Section */}
        <section className="px-6 md:px-8 lg:px-12 lg:px-8 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100/50 dark:bg-teal-900/30 border border-teal-200/50 dark:border-teal-800/50 backdrop-blur-sm mb-6">
              <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="text-sm font-medium text-teal-700 dark:text-teal-300">
                {language === "fr" ? "Mode Organisationnel" : "Organizational Mode"}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              {language === "fr"
                ? "Lingueefy pour les Organisations"
                : "Lingueefy for Organizations"}
            </h1>

            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
              {language === "fr"
                ? "Gérez l'apprentissage des langues de votre équipe avec des outils d'entreprise puissants et des crédits de coaching en gros."
                : "Manage your team's language learning with powerful enterprise tools and bulk coaching credits."}
            </p>

            {/* Access Reserved Message */}
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-[#FFE4D6] dark:border-amber-800/50 backdrop-blur-sm mb-8">
              <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <p className="text-amber-800 dark:text-amber-200 font-medium">
                {language === "fr"
                  ? "Accès réservé aux organisations partenaires"
                  : "Access reserved for partner organizations"}
              </p>
            </div>

            {/* Sign In Button */}
            <Button
              disabled
              className="px-8 py-6 text-lg font-semibold rounded-lg bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {language === "fr"
                ? "Se connecter via RusingAcademy"
                : "Sign in via RusingAcademy"}
            </Button>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
              {language === "fr"
                ? "Intégration SSO à venir"
                : "SSO integration coming soon"}
            </p>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="px-6 md:px-8 lg:px-12 lg:px-8 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-12 text-center">
              {language === "fr" ? "Avantages du mode organisationnel" : "Organizational Mode Benefits"}
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                const title = language === "fr" ? benefit.titleFr : benefit.titleEn;
                const desc = language === "fr" ? benefit.descFr : benefit.descEn;

                return (
                  <div
                    key={index}
                    className="p-6 rounded-xl bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/60 dark:border-white/10 hover:border-teal-200/50 dark:hover:border-teal-800/50 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10"
                  >
                    <Icon className="w-8 h-8 text-teal-600 dark:text-teal-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">{desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 md:px-8 lg:px-12 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-12 text-center">
              {language === "fr" ? "Fonctionnalités incluses" : "Included Features"}
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {features.map((feature, index) => {
                const title = language === "fr" ? feature.titleFr : feature.titleEn;

                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-lg bg-white/30 dark:bg-white/5 backdrop-blur-sm border border-white/40 dark:border-white/10"
                  >
                    <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-200 font-medium">{title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="px-6 md:px-8 lg:px-12 lg:px-8 py-16">
          <div className="max-w-2xl mx-auto">
            <div className="p-8 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border border-teal-200/50 dark:border-teal-800/50 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 text-center">
                {language === "fr"
                  ? "Intéressé par le mode organisationnel?"
                  : "Interested in Organizational Mode?"}
              </h3>

              <p className="text-slate-700 dark:text-slate-300 text-center mb-6">
                {language === "fr"
                  ? "Contactez notre équipe pour discuter des plans d'entreprise personnalisés et des tarifs en gros."
                  : "Contact our team to discuss custom enterprise plans and bulk pricing."}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="px-6 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors duration-300 text-center"
                >
                  {language === "fr" ? "Nous contacter" : "Contact Us"}
                </a>

                <a
                  href="/for-departments"
                  className="px-6 py-3 rounded-lg bg-white/50 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 text-slate-900 dark:text-white font-semibold border border-slate-200 dark:border-white/20 transition-colors duration-300 text-center"
                >
                  {language === "fr" ? "Pour les ministères" : "For Departments"}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
