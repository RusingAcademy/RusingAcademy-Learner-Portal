import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, CheckCircle, Loader2, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";

type Language = "en" | "fr";
type Theme = "glass" | "light";
type Brand = "ecosystem" | "rusingacademy" | "lingueefy" | "barholex";

interface NewsletterSubscriptionProps {
  language: Language;
  theme: Theme;
  brand: Brand;
  variant?: "inline" | "card" | "minimal";
}

const labels = {
  title: {
    en: "Stay Updated",
    fr: "Restez informé",
  },
  subtitle: {
    ecosystem: {
      en: "Get the latest on bilingual excellence, training programs, and career advancement tips.",
      fr: "Recevez les dernières nouvelles sur l'excellence bilingue, les programmes de formation et les conseils de carrière.",
    },
    rusingacademy: {
      en: "Receive updates on new courses, learning resources, and SLE preparation tips.",
      fr: "Recevez des mises à jour sur les nouveaux cours, ressources d'apprentissage et conseils de préparation ELS.",
    },
    lingueefy: {
      en: "Get coaching tips, success stories, and exclusive offers for language learners.",
      fr: "Recevez des conseils de coaching, des histoires de réussite et des offres exclusives.",
    },
    barholex: {
      en: "Stay informed about media trends, executive presence tips, and production insights.",
      fr: "Restez informé des tendances média, conseils de présence exécutive et insights de production.",
    },
  },
  emailPlaceholder: {
    en: "Enter your email",
    fr: "Entrez votre courriel",
  },
  subscribe: {
    en: "Subscribe",
    fr: "S'abonner",
  },
  subscribing: {
    en: "Subscribing...",
    fr: "Inscription...",
  },
  success: {
    en: "You're subscribed! Check your inbox for confirmation.",
    fr: "Vous êtes inscrit! Vérifiez votre boîte de réception.",
  },
  error: {
    en: "Something went wrong. Please try again.",
    fr: "Une erreur s'est produite. Veuillez réessayer.",
  },
  privacy: {
    en: "We respect your privacy. Unsubscribe anytime.",
    fr: "Nous respectons votre vie privée. Désabonnez-vous à tout moment.",
  },
  interests: {
    ecosystem: {
      en: "I'm interested in:",
      fr: "Je suis intéressé par:",
    },
    options: {
      "sle-training": { en: "SLE Training", fr: "Formation ELS" },
      "coaching": { en: "1-on-1 Coaching", fr: "Coaching individuel" },
      "media-production": { en: "Media Production", fr: "Production média" },
      "executive-presence": { en: "Executive Presence", fr: "Présence exécutive" },
      "team-training": { en: "Team Training", fr: "Formation d'équipe" },
    },
  },
};

const brandColors = {
  ecosystem: "#FF6A2B",
  rusingacademy: "#FF6A2B",
  lingueefy: "#17E2C6",
  barholex: "#8B5CFF",
};

export function NewsletterSubscription({ 
  language, 
  theme, 
  brand,
  variant = "card" 
}: NewsletterSubscriptionProps) {
  const [email, setEmail] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribe = trpc.newsletter.subscribe.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      await subscribe.mutateAsync({
        email,
        brand,
        language,
        interests: interests.length > 0 ? interests : undefined,
        source: "landing_page",
      });
      setIsSuccess(true);
    } catch (err) {
      setError(labels.error[language]);
      console.error("Newsletter subscription error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const color = brandColors[brand];
  const t = theme === "glass" 
    ? { 
        bg: "bg-white/5 backdrop-blur-xl border border-white/10", 
        text: "text-white", 
        textSecondary: "text-white/70", 
        input: "bg-white/10 border-white/20 text-white placeholder:text-white/80",
        checkbox: "border-white/30 data-[state=checked]:bg-white/20"
      }
    : { 
        bg: "bg-white border border-gray-200 shadow-lg", 
        text: "text-gray-900", 
        textSecondary: "text-gray-600", 
        input: "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400",
        checkbox: "border-gray-300"
      };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${variant === "card" ? t.bg : ""} ${variant === "card" ? "rounded-2xl p-8" : "p-4"} text-center`}
      >
        <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color }} />
        <p className={`text-lg font-medium ${t.text}`}>{labels.success[language]}</p>
      </motion.div>
    );
  }

  // Minimal variant - just email input and button inline
  if (variant === "minimal") {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={labels.emailPlaceholder[language]}
          className={`flex-1 ${t.input}`}
        />
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="text-white font-bold px-6"
          style={{ background: color }}
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
        </Button>
      </form>
    );
  }

  // Inline variant - horizontal layout
  if (variant === "inline") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={labels.emailPlaceholder[language]}
              className={`w-full h-12 ${t.input}`}
            />
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="h-12 text-white font-bold px-8"
            style={{ background: color }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {labels.subscribing[language]}
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                {labels.subscribe[language]}
              </>
            )}
          </Button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <p className={`text-xs ${t.textSecondary} mt-2`}>{labels.privacy[language]}</p>
      </motion.div>
    );
  }

  // Card variant - full featured with interests
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${t.bg} rounded-2xl p-8`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: `${color}20` }}
        >
          <Sparkles className="w-6 h-6" style={{ color }} />
        </div>
        <div>
          <h3 className={`text-xl font-bold ${t.text}`}>{labels.title[language]}</h3>
          <p className={`text-sm ${t.textSecondary}`}>{labels.subtitle[brand][language]}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={labels.emailPlaceholder[language]}
            className={`w-full h-12 ${t.input}`}
          />
        </div>

        {brand === "ecosystem" && (
          <div className="mb-4">
            <p className={`text-sm font-medium ${t.text} mb-2`}>
              {labels.interests.ecosystem[language]}
            </p>
            <div className="flex flex-wrap gap-3">
              {Object.entries(labels.interests.options).map(([key, value]) => (
                <label 
                  key={key}
                  className={`flex items-center gap-2 cursor-pointer text-sm ${t.textSecondary}`}
                >
                  <Checkbox
                    checked={interests.includes(key)}
                    onCheckedChange={() => toggleInterest(key)}
                    className={t.checkbox}
                  />
                  {value[language]}
                </label>
              ))}
            </div>
          </div>
        )}

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full h-12 text-white font-bold"
          style={{ background: color }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              {labels.subscribing[language]}
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              {labels.subscribe[language]}
            </>
          )}
        </Button>

        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        <p className={`text-xs ${t.textSecondary} mt-3 text-center`}>{labels.privacy[language]}</p>
      </form>
    </motion.div>
  );
}
