import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Landmark, CheckCircle2, ArrowRight, Star, Shield, MapPin, Scale, FileCheck, Lock, BookOpen } from "lucide-react";

export default function B2GSection() {
  const { language } = useLanguage();

  const content = {
    en: {
      badge: "B2G Solutions",
      title: "Language Training for",
      highlight: "Government & Public Sector",
      subtitle: "Purpose-built language training for Canadian federal, provincial, and municipal governments. Meet official language requirements with a trusted, compliant platform.",
      cta: "Request a Government Demo",
      stats: [
        { value: "50+", label: "Government Departments" },
        { value: "94%", label: "SLE Pass Rate" },
        { value: "2,500+", label: "Public Servants Trained" },
        { value: "100%", label: "Canadian Data Residency" }
      ],
      complianceTitle: "Built for Government Compliance",
      compliance: [
        { icon: Shield, title: "Protected B Ready", desc: "Meets Protected B security requirements with encryption and audit logging." },
        { icon: MapPin, title: "Canadian Data Sovereignty", desc: "All data stored exclusively in Canadian data centers." },
        { icon: Scale, title: "Official Languages Act", desc: "Helps departments meet obligations under the Official Languages Act." },
        { icon: FileCheck, title: "Procurement Ready", desc: "Standing offers and supply arrangements available. GCpay compatible." }
      ],
      sleTitle: "SLE Preparation Excellence",
      sleLevels: [
        { level: "Level A", title: "Foundational", features: ["Basic vocabulary", "Simple sentences", "Workplace phrases"] },
        { level: "Level B", title: "Intermediate", features: ["Complex grammar", "Professional writing", "Meeting participation"] },
        { level: "Level C", title: "Advanced", features: ["Advanced argumentation", "Policy briefings", "Nuanced communication"] }
      ],
      packagesTitle: "Government Training Packages",
      packages: [
        { name: "Department Starter", size: "5-15 Employees", price: "$4,500/quarter", features: ["20 sessions/employee", "Progress dashboard", "Quarterly reports", "SLE assessments"] },
        { name: "Department Growth", size: "16-50 Employees", price: "$12,000/quarter", features: ["25 sessions/employee", "Account manager", "Monthly reports", "Custom curriculum"], popular: true },
        { name: "Enterprise Gov", size: "50+ Employees", price: "Custom", features: ["Unlimited sessions", "GCcampus integration", "ADM reporting", "Dedicated team"] }
      ],
      testimonialsTitle: "Success Stories from the Public Sector",
      testimonials: [
        { quote: "RusingAcademy helped our team of 15 analysts achieve bilingual requirements in just 6 months.", author: "Director, Policy Branch", dept: "Treasury Board Secretariat" },
        { quote: "The SLE-specific approach and coach quality are unmatched. Our pass rates have never been higher.", author: "HR Director", dept: "Health Canada" }
      ],
      trustedBy: "TRUSTED BY FEDERAL DEPARTMENTS",
      departments: ["Treasury Board", "Health Canada", "ESDC", "CRA", "IRCC", "Transport Canada"],
      ctaTitle: "Ready to Transform Your Department's Bilingual Capacity?",
      ctaSubtitle: "Join 50+ federal departments that have achieved their language training goals."
    },
    fr: {
      badge: "Solutions B2G",
      title: "Formation linguistique pour",
      highlight: "Gouvernement et secteur public",
      subtitle: "Solutions de formation linguistique conçues pour les gouvernements fédéral, provinciaux et municipaux canadiens.",
      cta: "Demander une démo gouvernementale",
      stats: [
        { value: "50+", label: "Ministères gouvernementaux" },
        { value: "94%", label: "Taux de réussite ELS" },
        { value: "2 500+", label: "Fonctionnaires formés" },
        { value: "100%", label: "Données au Canada" }
      ],
      complianceTitle: "Conçu pour la conformité gouvernementale",
      compliance: [
        { icon: Shield, title: "Prêt Protégé B", desc: "Répond aux exigences de sécurité Protégé B avec chiffrement et journalisation." },
        { icon: MapPin, title: "Souveraineté des données", desc: "Toutes les données stockées exclusivement dans des centres canadiens." },
        { icon: Scale, title: "Loi sur les langues officielles", desc: "Aide les ministères à respecter leurs obligations linguistiques." },
        { icon: FileCheck, title: "Prêt pour l'approvisionnement", desc: "Offres à commandes et arrangements disponibles. Compatible GCpay." }
      ],
      sleTitle: "Excellence en préparation ELS",
      sleLevels: [
        { level: "Niveau A", title: "Base", features: ["Vocabulaire de base", "Phrases simples", "Expressions de travail"] },
        { level: "Niveau B", title: "Intermédiaire", features: ["Grammaire complexe", "Rédaction professionnelle", "Participation aux réunions"] },
        { level: "Niveau C", title: "Avancé", features: ["Argumentation avancée", "Notes d'information", "Communication nuancée"] }
      ],
      packagesTitle: "Forfaits de formation gouvernementale",
      packages: [
        { name: "Démarrage", size: "5-15 employés", price: "4 500$/trimestre", features: ["20 sessions/employé", "Tableau de bord", "Rapports trimestriels", "Évaluations ELS"] },
        { name: "Croissance", size: "16-50 employés", price: "12 000$/trimestre", features: ["25 sessions/employé", "Gestionnaire de compte", "Rapports mensuels", "Curriculum personnalisé"], popular: true },
        { name: "Entreprise Gov", size: "50+ employés", price: "Sur mesure", features: ["Sessions illimitées", "Intégration GCcampus", "Rapports pour SMA", "Équipe dédiée"] }
      ],
      testimonialsTitle: "Histoires de réussite du secteur public",
      testimonials: [
        { quote: "RusingAcademy a aidé notre équipe de 15 analystes à atteindre les exigences bilingues en seulement 6 mois.", author: "Directeur, Direction des politiques", dept: "Secrétariat du Conseil du Trésor" },
        { quote: "L'approche spécifique à l'ELS et la qualité des coachs sont inégalées.", author: "Directrice RH", dept: "Santé Canada" }
      ],
      trustedBy: "LA CONFIANCE DES MINISTÈRES FÉDÉRAUX",
      departments: ["Conseil du Trésor", "Santé Canada", "EDSC", "ARC", "IRCC", "Transports Canada"],
      ctaTitle: "Prêt à transformer la capacité bilingue de votre ministère?",
      ctaSubtitle: "Rejoignez plus de 50 ministères fédéraux qui ont atteint leurs objectifs de formation."
    }
  };

  const t = content[language as keyof typeof content] || content.en;

  return (
    <section id="b2g" className="scroll-mt-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0F3D3E] to-[#1a5a5c] py-20">
        <div className="container mx-auto px-6 text-center">
          <Badge className="mb-6 bg-[#C65A1E]/20 text-[#C65A1E] border-[#C65A1E]/30">
            <Landmark className="w-4 h-4 mr-2" aria-hidden="true" />{t.badge}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t.title} <span className="text-[#C65A1E]">{t.highlight}</span>
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">{t.subtitle}</p>
          <Button size="lg" className="bg-[#C65A1E] hover:bg-[#A84A18]">
            {t.cta}<ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
          </Button>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-3xl mx-auto">
            {t.stats.map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-3xl font-bold text-[#C65A1E]">{stat.value}</div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-bold text-[#0F3D3E] text-center mb-12">{t.complianceTitle}</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.compliance.map((item, i) => (
              <Card key={i} className="border-gray-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-[#0F3D3E]/10 flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-[#0F3D3E]" aria-hidden="true" />
                  </div>
                  <h4 className="text-lg font-semibold text-[#0F3D3E] mb-2">{item.title}</h4>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* SLE Levels */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-bold text-[#0F3D3E] text-center mb-12">{t.sleTitle}</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {t.sleLevels.map((level, i) => (
              <Card key={i} className="border-gray-200">
                <CardContent className="p-6">
                  <Badge className={`mb-4 ${i === 0 ? 'bg-blue-100 text-blue-700' : i === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-[#C65A1E]/10 text-[#C65A1E]'}`}>
                    {level.level}
                  </Badge>
                  <h4 className="text-xl font-bold text-[#0F3D3E] mb-4">{level.title}</h4>
                  <ul className="space-y-2">
                    {level.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-[#0F3D3E]" aria-hidden="true" />{f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Trusted Departments */}
      <div className="py-8 bg-white">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-gray-500 tracking-wider mb-6">{t.trustedBy}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {t.departments.map((dept, i) => (
              <Badge key={i} variant="outline" className="px-4 py-2 text-gray-600 border-gray-300">{dept}</Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Packages */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-bold text-[#0F3D3E] text-center mb-12">{t.packagesTitle}</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {t.packages.map((pkg, i) => (
              <Card key={i} className={`border-2 ${pkg.popular ? 'border-[#C65A1E] shadow-xl' : 'border-gray-200'} relative`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[#C65A1E] text-white"><Star className="w-3 h-3 mr-1" />Popular</Badge>
                  </div>
                )}
                <CardContent className="p-6 pt-8">
                  <h4 className="text-xl font-bold text-[#0F3D3E]">{pkg.name}</h4>
                  <p className="text-sm text-gray-500 mb-4">{pkg.size}</p>
                  <div className="text-2xl font-bold text-[#0F3D3E] mb-4">{pkg.price}</div>
                  <ul className="space-y-2 mb-6">
                    {pkg.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-[#0F3D3E]" aria-hidden="true" />{f}
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full ${pkg.popular ? 'bg-[#C65A1E] hover:bg-[#A84A18]' : 'bg-[#0F3D3E] hover:bg-[#0a2a2b]'}`}>
                    {t.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-bold text-[#0F3D3E] text-center mb-12">{t.testimonialsTitle}</h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {t.testimonials.map((testimonial, i) => (
              <Card key={i} className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-[#C65A1E] text-[#C65A1E]" />)}
                  </div>
                  <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
                  <p className="font-semibold text-[#0F3D3E]">{testimonial.author}</p>
                  <p className="text-sm text-[#C65A1E]">{testimonial.dept}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-16 bg-gradient-to-br from-[#0F3D3E] to-[#1a5a5c]">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">{t.ctaTitle}</h3>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">{t.ctaSubtitle}</p>
          <Button size="lg" className="bg-[#C65A1E] hover:bg-[#A84A18]">
            {t.cta}<ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
                                                   }
