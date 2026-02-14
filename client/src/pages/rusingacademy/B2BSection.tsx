import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Building2, Users, TrendingUp, CheckCircle2, Target, BarChart3, ArrowRight, Star, Shield, Clock } from "lucide-react";

export default function B2BSection() {
  const { language } = useLanguage();

  const content = {
    en: {
      badge: "B2B Solutions",
      title: "Corporate Language Training",
      highlight: "For Private Sector",
      subtitle: "Empower your workforce with professional language training. RusingAcademy helps Canadian businesses develop bilingual talent and expand into new markets.",
      cta: "Request a Consultation",
      stats: [
        { value: "200+", label: "Corporate Clients" },
        { value: "15,000+", label: "Employees Trained" },
        { value: "92%", label: "Completion Rate" },
        { value: "4.9/5", label: "Client Satisfaction" }
      ],
      benefitsTitle: "Why Businesses Choose RusingAcademy",
      benefits: [
        { icon: Target, title: "Industry-Specific Training", desc: "Customized curricula for finance, healthcare, legal, tech sectors." },
        { icon: Clock, title: "Flexible Learning", desc: "On-site, virtual, or hybrid. Self-paced and live sessions." },
        { icon: BarChart3, title: "ROI Tracking", desc: "Analytics showing progress, engagement, and business impact." },
        { icon: Shield, title: "Enterprise Security", desc: "SOC 2 compliant with SSO and Canadian data residency." }
      ],
      packagesTitle: "Corporate Training Packages",
      packages: [
        { name: "Startup", size: "10-50 Employees", price: "$5,000/year", features: ["50 user licenses", "Self-paced modules", "Quarterly reports", "Email support"] },
        { name: "Business", size: "51-200 Employees", price: "$15,000/year", features: ["200 user licenses", "Live sessions", "Account manager", "SSO integration"], popular: true },
        { name: "Enterprise", size: "200+ Employees", price: "Custom", features: ["Unlimited licenses", "On-site training", "LMS integration", "Dedicated team"] }
      ],
      testimonialsTitle: "Trusted by Leading Canadian Businesses",
      testimonials: [
        { quote: "RusingAcademy transformed our customer service team. French client satisfaction increased by 40%.", author: "VP Customer Experience", company: "National Insurance Co." },
        { quote: "The industry-specific curriculum opened new market opportunities for our consultants.", author: "Managing Partner", company: "Top-10 Consulting Firm" }
      ],
      ctaTitle: "Ready to Transform Your Workforce?",
      ctaSubtitle: "Join 200+ Canadian businesses that have achieved bilingual excellence."
    },
    fr: {
      badge: "Solutions B2B",
      title: "Formation linguistique corporative",
      highlight: "Pour le secteur privé",
      subtitle: "Donnez à votre équipe les moyens de réussir avec une formation linguistique professionnelle. RusingAcademy aide les entreprises canadiennes à développer des talents bilingues.",
      cta: "Demander une consultation",
      stats: [
        { value: "200+", label: "Clients corporatifs" },
        { value: "15 000+", label: "Employés formés" },
        { value: "92%", label: "Taux de complétion" },
        { value: "4.9/5", label: "Satisfaction client" }
      ],
      benefitsTitle: "Pourquoi les entreprises choisissent RusingAcademy",
      benefits: [
        { icon: Target, title: "Formation par industrie", desc: "Programmes personnalisés pour finance, santé, juridique, tech." },
        { icon: Clock, title: "Apprentissage flexible", desc: "Sur site, virtuel ou hybride. Auto-formation et sessions en direct." },
        { icon: BarChart3, title: "Suivi du ROI", desc: "Analytiques montrant progrès, engagement et impact business." },
        { icon: Shield, title: "Sécurité entreprise", desc: "Conforme SOC 2 avec SSO et résidence des données au Canada." }
      ],
      packagesTitle: "Forfaits de formation corporative",
      packages: [
        { name: "Startup", size: "10-50 employés", price: "5 000$/an", features: ["50 licences", "Modules auto-formation", "Rapports trimestriels", "Support courriel"] },
        { name: "Business", size: "51-200 employés", price: "15 000$/an", features: ["200 licences", "Sessions en direct", "Gestionnaire de compte", "Intégration SSO"], popular: true },
        { name: "Entreprise", size: "200+ employés", price: "Sur mesure", features: ["Licences illimitées", "Formation sur site", "Intégration LMS", "Équipe dédiée"] }
      ],
      testimonialsTitle: "La confiance des grandes entreprises canadiennes",
      testimonials: [
        { quote: "RusingAcademy a transformé notre équipe de service client. La satisfaction des clients francophones a augmenté de 40%.", author: "VP Expérience client", company: "Compagnie d'assurance nationale" },
        { quote: "Le curriculum spécifique à notre industrie a ouvert de nouvelles opportunités de marché.", author: "Associé directeur", company: "Cabinet de conseil Top-10" }
      ],
      ctaTitle: "Prêt à transformer votre équipe?",
      ctaSubtitle: "Rejoignez plus de 200 entreprises canadiennes qui ont atteint l'excellence bilingue."
    }
  };

  const t = content[language as keyof typeof content] || content.en;

  return (
    <section id="b2b" className="scroll-mt-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0F3D3E] to-[#1a5a5c] py-20">
        <div className="container mx-auto px-6 text-center">
          <Badge className="mb-6 bg-[#C65A1E]/20 text-[#C65A1E] border-[#C65A1E]/30">
            <Building2 className="w-4 h-4 mr-2" aria-hidden="true" />{t.badge}
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

      {/* Benefits */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-bold text-[#0F3D3E] text-center mb-12">{t.benefitsTitle}</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.benefits.map((benefit, i) => (
              <Card key={i} className="border-gray-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-[#0F3D3E]/10 flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-[#0F3D3E]" aria-hidden="true" />
                  </div>
                  <h4 className="text-lg font-semibold text-[#0F3D3E] mb-2">{benefit.title}</h4>
                  <p className="text-gray-600 text-sm">{benefit.desc}</p>
                </CardContent>
              </Card>
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
                  <p className="text-sm text-[#C65A1E]">{testimonial.company}</p>
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
