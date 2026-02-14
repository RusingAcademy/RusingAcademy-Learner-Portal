import { useState, useEffect } from "react";

interface NudgeData {
  type: "streak" | "progress" | "comeback" | "milestone" | "encouragement" | "tip";
  message: string;
  messageFr: string;
  icon: string;
  action?: {
    label: string;
    labelFr: string;
    href: string;
  };
}

// Nudge templates based on user state
const NUDGE_TEMPLATES: Record<string, NudgeData[]> = {
  streak_at_risk: [
    {
      type: "streak",
      message: "Your streak is at risk! Complete a lesson today to keep it going.",
      messageFr: "Votre série est en danger ! Complétez une leçon aujourd'hui pour la maintenir.",
      icon: "🔥",
      action: { label: "Continue Learning", labelFr: "Continuer l'apprentissage", href: "/courses" },
    },
  ],
  streak_milestone: [
    {
      type: "milestone",
      message: "Amazing! You've maintained a 7-day streak! Keep it up!",
      messageFr: "Incroyable ! Vous avez maintenu une série de 7 jours ! Continuez !",
      icon: "🎉",
    },
  ],
  comeback: [
    {
      type: "comeback",
      message: "Welcome back! We missed you. Ready to pick up where you left off?",
      messageFr: "Bon retour ! Vous nous avez manqué. Prêt à reprendre là où vous vous êtes arrêté ?",
      icon: "👋",
      action: { label: "Resume Course", labelFr: "Reprendre le cours", href: "/courses" },
    },
  ],
  progress_50: [
    {
      type: "progress",
      message: "You're halfway through! The finish line is in sight.",
      messageFr: "Vous êtes à mi-chemin ! La ligne d'arrivée est en vue.",
      icon: "🏃",
    },
  ],
  encouragement: [
    {
      type: "encouragement",
      message: "Every lesson brings you closer to bilingual mastery. You've got this!",
      messageFr: "Chaque leçon vous rapproche de la maîtrise bilingue. Vous pouvez le faire !",
      icon: "💪",
    },
    {
      type: "encouragement",
      message: "Small steps lead to big achievements. Keep going!",
      messageFr: "Les petits pas mènent aux grandes réalisations. Continuez !",
      icon: "⭐",
    },
    {
      type: "encouragement",
      message: "Your dedication to learning French is inspiring. Stay focused!",
      messageFr: "Votre dévouement à l'apprentissage du français est inspirant. Restez concentré !",
      icon: "🌟",
    },
  ],
  tips: [
    {
      type: "tip",
      message: "Pro tip: Practice speaking out loud, even when alone. It builds confidence!",
      messageFr: "Conseil pro : Pratiquez à voix haute, même seul. Ça renforce la confiance !",
      icon: "💡",
    },
    {
      type: "tip",
      message: "Try reviewing yesterday's lesson before starting a new one. Spaced repetition works!",
      messageFr: "Essayez de réviser la leçon d'hier avant d'en commencer une nouvelle. La répétition espacée fonctionne !",
      icon: "🧠",
    },
    {
      type: "tip",
      message: "Set a daily learning goal. Even 10 minutes a day makes a difference!",
      messageFr: "Fixez un objectif d'apprentissage quotidien. Même 10 minutes par jour font la différence !",
      icon: "📅",
    },
  ],
};

interface MotivationalNudgeProps {
  userState: {
    currentStreak: number;
    daysInactive?: number;
    courseProgress?: number;
    lastActivity?: Date;
  };
  language?: "en" | "fr";
  onDismiss?: () => void;
}

export function MotivationalNudge({ userState, language = "en", onDismiss }: MotivationalNudgeProps) {
  const [nudge, setNudge] = useState<NudgeData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Determine which nudge to show based on user state
    let selectedNudge: NudgeData | null = null;
    
    if (userState.daysInactive && userState.daysInactive >= 3) {
      // User has been away
      selectedNudge = NUDGE_TEMPLATES.comeback[0];
    } else if (userState.currentStreak > 0 && userState.currentStreak % 7 === 0) {
      // Streak milestone
      selectedNudge = NUDGE_TEMPLATES.streak_milestone[0];
    } else if (userState.courseProgress && userState.courseProgress >= 50 && userState.courseProgress < 55) {
      // Halfway through course
      selectedNudge = NUDGE_TEMPLATES.progress_50[0];
    } else {
      // Random encouragement or tip
      const pool = [...NUDGE_TEMPLATES.encouragement, ...NUDGE_TEMPLATES.tips];
      selectedNudge = pool[Math.floor(Math.random() * pool.length)];
    }
    
    if (selectedNudge) {
      setNudge(selectedNudge);
      setTimeout(() => setIsVisible(true), 100);
    }
  }, [userState]);
  
  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      setNudge(null);
      onDismiss?.();
    }, 300);
  };
  
  if (!nudge) return null;
  
  const message = language === "fr" ? nudge.messageFr : nudge.message;
  const actionLabel = nudge.action 
    ? (language === "fr" ? nudge.action.labelFr : nudge.action.label)
    : null;
  
  return (
    <div 
      className={`fixed bottom-4 right-4 max-w-sm z-40 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Colored top bar based on type */}
        <div className={`h-1 ${
          nudge.type === "streak" ? "bg-[#C65A1E]" :
          nudge.type === "milestone" ? "bg-yellow-500" :
          nudge.type === "progress" ? "bg-teal-500" :
          nudge.type === "comeback" ? "bg-[#E7F2F2]" :
          nudge.type === "tip" ? "bg-blue-500" :
          "bg-green-500"
        }`} />
        
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-3xl flex-shrink-0">{nudge.icon}</div>
            <div className="flex-1">
              <p className="text-gray-700 text-sm leading-relaxed">{message}</p>
              
              {nudge.action && (
                <a
                  href={nudge.action.href}
                  className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-teal-600 hover:text-teal-700"
                >
                  {actionLabel}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}
            </div>
            
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to manage nudge display
export function useMotivationalNudge() {
  const [showNudge, setShowNudge] = useState(false);
  const [userState, setUserState] = useState({
    currentStreak: 0,
    daysInactive: 0,
    courseProgress: 0,
  });
  
  const triggerNudge = (state: typeof userState) => {
    setUserState(state);
    setShowNudge(true);
  };
  
  const dismissNudge = () => {
    setShowNudge(false);
  };
  
  return { showNudge, userState, triggerNudge, dismissNudge };
}

export default MotivationalNudge;
