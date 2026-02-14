import { useLanguage } from "@/contexts/LanguageContext";
import { ExternalLink } from "lucide-react";

interface Brand {
  name: string;
  logo: string;
  description: string;
  descriptionFr: string;
  url: string;
  bgColor: string;
  textColor: string;
}

const brands: Brand[] = [
  {
    name: "RusingAcademy",
    logo: "/images/rusingacademy-logo.png",
    description: "Expert SLE coaching and structured learning paths for federal public servants",
    descriptionFr: "Coaching SLE expert et parcours d'apprentissage structurés pour les fonctionnaires fédéraux",
    url: "https://www.rusingacademy.com",
    bgColor: "bg-[#C65A1E]",
    textColor: "text-white",
  },
  {
    name: "Lingueefy",
    logo: "/images/lingueefy-logo.png",
    description: "AI-powered language learning platform with personalized coaching",
    descriptionFr: "Plateforme d'apprentissage linguistique alimentée par l'IA avec coaching personnalisé",
    url: "/",
    bgColor: "bg-white",
    textColor: "text-slate-900",
  },
  {
    name: "Barholex Media",
    logo: "/images/barholex-logo.png",
    description: "Bilingual content creation and professional development media",
    descriptionFr: "Création de contenu bilingue et médias de développement professionnel",
    url: "https://www.barholexmedia.com",
    bgColor: "bg-slate-900",
    textColor: "text-white",
  },
];

export default function EcosystemBrands() {
  const { language } = useLanguage();

  return (
    <section className="py-16 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-white/80 text-sm uppercase tracking-wider mb-2">
            Rusinga International Consulting Ltd. Learning Ecosystem
          </p>
        </div>

        {/* Brands Row */}
        <div className="flex flex-wrap items-center justify-center gap-6">
          {brands.map((brand, index) => (
            <a
              key={index}
              href={brand.url}
              target={brand.url.startsWith('http') ? '_blank' : undefined}
              rel={brand.url.startsWith('http') ? 'noopener noreferrer' : undefined}
              className={`group flex items-center gap-3 px-6 py-3 ${brand.bgColor} ${brand.textColor} rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
            >
              {/* Logo placeholder - using text for now */}
              <div className="h-8 w-8 rounded-md bg-current/10 flex items-center justify-center font-bold text-lg">
                {brand.name[0]}
              </div>
              <span className="font-semibold text-lg">{brand.name}</span>
            </a>
          ))}
        </div>

        {/* Powered by footer */}
        <div className="text-center mt-8">
          <p className="text-white/60 text-xs">
            {language === 'fr' 
              ? 'Propulsé par Rusinga International Consulting Ltd.'
              : 'Powered by Rusinga International Consulting Ltd.'}
          </p>
        </div>
      </div>
    </section>
  );
}
