import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { AlertTriangle, Brain, TrendingDown } from "lucide-react";

/**
 * TrilemmaSection - "The Bilingual Excellence Trilemma"
 * 
 * Section 2: Value Proposition - Placed immediately after Hero
 * Uses design tokens from tokens.css for colors and typography
 * Glassmorphism style aligned with Page 13 aesthetic
 */

interface TrilemmaCard {
  id: string;
  icon: React.ReactNode;
  title: { en: string; fr: string };
  description: { en: string; fr: string };
  color: string;
}

const trilemmaCards: TrilemmaCard[] = [
  {
    id: "wall-of-fluency",
    icon: <AlertTriangle className="w-8 h-8" />,
    title: {
      en: "The Wall of Fluency",
      fr: "Le Mur de la Fluidité",
    },
    description: {
      en: "Many professionals hit an invisible barrier where progress stalls despite years of study. Traditional methods fail to bridge the gap between classroom knowledge and real-world fluency.",
      fr: "De nombreux professionnels se heurtent à une barrière invisible où les progrès stagnent malgré des années d'études. Les méthodes traditionnelles ne parviennent pas à combler l'écart entre les connaissances théoriques et la fluidité réelle.",
    },
    color: "var(--brand-cta)", // Electric Copper
  },
  {
    id: "impostor-syndrome",
    icon: <Brain className="w-8 h-8" />,
    title: {
      en: "Impostor Syndrome",
      fr: "Le Syndrome de l'Imposteur",
    },
    description: {
      en: "Even competent bilingual speakers doubt their abilities in high-stakes situations. The fear of making mistakes in official settings creates anxiety that undermines performance.",
      fr: "Même les locuteurs bilingues compétents doutent de leurs capacités dans les situations à enjeux élevés. La peur de faire des erreurs dans des contextes officiels crée une anxiété qui nuit à la performance.",
    },
    color: "var(--brand-foundation)", // Deep Forest Teal
  },
  {
    id: "plateau-stagnation",
    icon: <TrendingDown className="w-8 h-8" />,
    title: {
      en: "Plateau Stagnation",
      fr: "La Stagnation du Plateau",
    },
    description: {
      en: "After initial progress, learners often plateau at intermediate levels. Without targeted intervention, they remain stuck, unable to reach the advanced proficiency required for career advancement.",
      fr: "Après des progrès initiaux, les apprenants plafonnent souvent à des niveaux intermédiaires. Sans intervention ciblée, ils restent bloqués, incapables d'atteindre la maîtrise avancée requise pour l'avancement de carrière.",
    },
    color: "var(--barholex-gold)", // Gold
  },
];

const sectionContent = {
  badge: {
    en: "The Challenge",
    fr: "Le Défi",
  },
  title: {
    en: "The Bilingual Excellence Trilemma",
    fr: "Le Trilemme de l'Excellence Bilingue",
  },
  subtitle: {
    en: "Three barriers that prevent Canadian public servants from achieving true bilingual confidence",
    fr: "Trois obstacles qui empêchent les fonctionnaires canadiens d'atteindre une véritable confiance bilingue",
  },
};

export default function TrilemmaSection() {
  const { language } = useLanguage();
  const lang = language as "en" | "fr";

  return (
    <section 
      id="trilemma" 
      className="relative z-10 py-16 sm:py-24"
      style={{ backgroundColor: "var(--bg)" }}
    >
      {/* Background gradient overlay */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          background: "linear-gradient(180deg, var(--brand-foundation-soft) 0%, transparent 100%)",
        }}
      />

      <div className="relative max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          {/* Badge */}
          <span 
            className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4"
            style={{
              backgroundColor: "var(--brand-cta-soft)",
              color: "var(--brand-cta)",
            }}
          >
            {sectionContent.badge[lang]}
          </span>

          {/* Title */}
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
            style={{ 
              fontFamily: "var(--font-display)",
              color: "var(--text)",
            }}
          >
            {sectionContent.title[lang]}
          </h2>

          {/* Subtitle */}
          <p 
            className="text-lg sm:text-xl max-w-3xl mx-auto"
            style={{ 
              fontFamily: "var(--font-ui)",
              color: "var(--muted)",
            }}
          >
            {sectionContent.subtitle[lang]}
          </p>
        </motion.div>

        {/* Trilemma Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {trilemmaCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group relative"
            >
              {/* Glassmorphism Card */}
              <div 
                className="relative h-full p-6 sm:p-8 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  borderColor: "var(--sand)",
                  boxShadow: "var(--shadow-md)",
                }}
              >
                {/* Icon Container */}
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: card.color,
                    color: "white",
                  }}
                >
                  {card.icon}
                </div>

                {/* Card Title */}
                <h3 
                  className="text-xl sm:text-2xl font-bold mb-3"
                  style={{ 
                    fontFamily: "var(--font-display)",
                    color: "var(--text)",
                  }}
                >
                  {card.title[lang]}
                </h3>

                {/* Card Description */}
                <p 
                  className="text-base leading-relaxed"
                  style={{ 
                    fontFamily: "var(--font-ui)",
                    color: "var(--muted)",
                  }}
                >
                  {card.description[lang]}
                </p>

                {/* Decorative accent line */}
                <div 
                  className="absolute bottom-0 left-6 right-6 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ backgroundColor: card.color }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
