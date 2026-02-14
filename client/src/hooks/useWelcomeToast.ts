import { useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

const WELCOME_SHOWN_KEY = "welcome-toast-shown";

export function useWelcomeToast() {
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const hasShown = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user || hasShown.current) return;

    // Check if we've already shown the welcome toast for this user
    const shownUsers = JSON.parse(localStorage.getItem(WELCOME_SHOWN_KEY) || "[]");
    if (shownUsers.includes(user.id)) return;

    hasShown.current = true;

    // Delay to let the page load
    const timer = setTimeout(() => {
      const isEn = language === "en";
      const firstName = user.name?.split(" ")[0] || (isEn ? "there" : "");

      // Check if this is a new user (created within last 5 minutes)
      const isNewUser = user.createdAt && 
        (Date.now() - new Date(user.createdAt).getTime()) < 5 * 60 * 1000;

      if (isNewUser) {
        // First time user
        toast.success(
          isEn 
            ? `Welcome to RusingAcademy, ${firstName}! 🎉`
            : `Bienvenue sur RusingAcademy, ${firstName} ! 🎉`,
          {
            description: isEn
              ? "Your journey to bilingual excellence starts now. Explore our courses and book your first coaching session!"
              : "Votre parcours vers l'excellence bilingue commence maintenant. Explorez nos cours et réservez votre première session de coaching !",
            duration: 8000,
          }
        );
      } else {
        // Returning user
        const hour = new Date().getHours();
        let greeting = isEn ? "Welcome back" : "Bon retour";
        
        if (hour < 12) {
          greeting = isEn ? "Good morning" : "Bonjour";
        } else if (hour < 18) {
          greeting = isEn ? "Good afternoon" : "Bon après-midi";
        } else {
          greeting = isEn ? "Good evening" : "Bonsoir";
        }

        toast(
          `${greeting}, ${firstName}! 👋`,
          {
            description: isEn
              ? "Ready to continue your learning journey?"
              : "Prêt à continuer votre parcours d'apprentissage ?",
            duration: 5000,
          }
        );
      }

      // Mark as shown for this user
      shownUsers.push(user.id);
      localStorage.setItem(WELCOME_SHOWN_KEY, JSON.stringify(shownUsers));
    }, 1500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, language]);
}

export default useWelcomeToast;
