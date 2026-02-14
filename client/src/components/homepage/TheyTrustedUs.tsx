import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

interface TrustedOrg {
  nameEn: string;
  nameFr: string;
  logo: string;
  altEn: string;
  altFr: string;
}

const trustedOrganizations: TrustedOrg[] = [
  {
    nameEn: "Canadian Digital Service",
    nameFr: "Service numérique canadien",
    logo: "/images/logos/01_SVG/GC_CDS_SNC_EN_logo_20260112.svg",
    altEn: "Official logo of the Canadian Digital Service (CDS)",
    altFr: "Logo officiel du Service numérique canadien (SNC)",
  },
  {
    nameEn: "Department of National Defence",
    nameFr: "Ministère de la Défense nationale",
    logo: "/images/logos/02_PNG/GC_DND_MDN_FR-EN_logo_20260112.png",
    altEn: "Official logo of the Department of National Defence (DND)",
    altFr: "Logo officiel du Ministère de la Défense nationale (MDN)",
  },
  {
    nameEn: "Correctional Service of Canada",
    nameFr: "Service correctionnel du Canada",
    logo: "/images/logos/02_PNG/GC_CSC_SCC_EN_logo_20260112.png",
    altEn: "Official logo of the Correctional Service of Canada (CSC)",
    altFr: "Logo officiel du Service correctionnel du Canada (SCC)",
  },
  {
    nameEn: "Innovation, Science and Economic Development Canada",
    nameFr: "Innovation, Sciences et Développement économique Canada",
    logo: "/images/logos/02_PNG/GC_ISED_ISDE_EN_logo_20260112.jpg",
    altEn: "Official logo of Innovation, Science and Economic Development Canada (ISED)",
    altFr: "Logo officiel d'Innovation, Sciences et Développement économique Canada (ISDE)",
  },
  {
    nameEn: "Employment and Social Development Canada",
    nameFr: "Emploi et Développement social Canada",
    logo: "/images/logos/02_PNG/GC_ESDC_EDSC_EN_logo_20260112.png",
    altEn: "Official logo of Employment and Social Development Canada (ESDC)",
    altFr: "Logo officiel d'Emploi et Développement social Canada (EDSC)",
  },
  {
    nameEn: "Treasury Board of Canada Secretariat",
    nameFr: "Secrétariat du Conseil du Trésor du Canada",
    logo: "/images/logos/02_PNG/GC_TBS_SCT_EN_logo_20260112.png",
    altEn: "Official logo of the Treasury Board of Canada Secretariat (TBS)",
    altFr: "Logo officiel du Secrétariat du Conseil du Trésor du Canada (SCT)",
  },
];

export default function TheyTrustedUs() {
  const { language } = useLanguage();

  return (
    <section 
      className="py-20 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden"
      aria-labelledby="they-trusted-us-heading"
    >
      {/* Decorative wave top */}
      <div className="absolute top-0 left-0 right-0 h-16 overflow-hidden" aria-hidden="true">
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="absolute bottom-0 w-full h-full"
          fill="currentColor"
        >
          <path 
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" 
            className="text-white"
          />
        </svg>
      </div>

      <div className="container relative z-10 px-6 md:px-8 lg:px-12 lg:px-8 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 
            id="they-trusted-us-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-4 font-serif italic"
          >
            {language === 'fr' ? 'Ils nous ont fait confiance' : 'They Trusted Us'}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            {language === 'fr' 
              ? 'Des fonctionnaires de toutes les institutions canadiennes nous font confiance'
              : 'Civil servants from all Canadian institutions trust us'}
          </p>
        </motion.div>

        {/* Logos Grid - 6 institutions */}
        <motion.div 
          className="relative overflow-hidden py-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 items-stretch justify-items-center"
            role="list"
            aria-label={language === 'fr' ? 'Logos des institutions partenaires' : 'Partner institution logos'}
          >
            {trustedOrganizations.map((org, index) => (
              <motion.div 
                key={index}
                role="listitem"
                className="flex flex-col items-center justify-center p-4 sm:p-6 bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 w-full max-w-[180px] sm:max-w-[200px] min-h-[120px] sm:min-h-[140px] group border border-slate-100 hover:border-slate-200"
                title={language === 'fr' ? org.nameFr : org.nameEn}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -4 }}
              >
                <img 
                  src={org.logo}
                  alt={language === 'fr' ? org.altFr : org.altEn}
                  className="h-10 sm:h-12 md:h-14 w-auto max-w-full object-contain grayscale-[50%] group-hover:grayscale-0 transition-all duration-300 contrast-125"
                  loading="lazy"                   decoding="async"
                />
                <span 
                  className="text-[10px] sm:text-xs text-slate-500 mt-3 text-center line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium"
                  aria-hidden="true"
                >
                  {language === 'fr' ? org.nameFr : org.nameEn}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.p 
          className="text-center text-xs sm:text-sm text-slate-500 mt-8 italic max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {language === 'fr' 
            ? '*Logos officiels des institutions fédérales canadiennes. RusingAcademy est une initiative entrepreneuriale privée.'
            : '*Official logos of Canadian federal institutions. RusingAcademy is a private entrepreneurial initiative.'}
        </motion.p>
      </div>

      {/* Decorative wave bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden rotate-180" aria-hidden="true">
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="absolute bottom-0 w-full h-full"
          fill="currentColor"
        >
          <path 
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" 
            className="text-white"
          />
        </svg>
      </div>
    </section>
  );
}
