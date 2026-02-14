import { useEffect, useState } from "react";

interface CelebrationData {
  type: "lesson" | "module" | "course" | "streak" | "level" | "badge";
  title: string;
  titleFr: string;
  subtitle?: string;
  subtitleFr?: string;
  icon: string;
  xpAwarded?: number;
  badgeAwarded?: {
    name: string;
    nameFr: string;
    icon: string;
  };
}

interface ProgressCelebrationProps {
  celebration: CelebrationData;
  language?: "en" | "fr";
  onComplete: () => void;
}

export function ProgressCelebration({ celebration, language = "en", onComplete }: ProgressCelebrationProps) {
  const [phase, setPhase] = useState<"enter" | "show" | "exit">("enter");
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; color: string }>>([]);
  
  const title = language === "fr" ? celebration.titleFr : celebration.title;
  const subtitle = language === "fr" ? celebration.subtitleFr : celebration.subtitle;
  
  useEffect(() => {
    // Generate confetti
    const colors = ["#009688", "#FF6B35", "#FFD700", "#4CAF50", "#2196F3", "#9C27B0"];
    const newConfetti = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setConfetti(newConfetti);
    
    // Animation phases
    setTimeout(() => setPhase("show"), 100);
    
    const exitTimer = setTimeout(() => {
      setPhase("exit");
      setTimeout(onComplete, 500);
    }, 4000);
    
    return () => clearTimeout(exitTimer);
  }, [onComplete]);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          phase === "show" ? "opacity-60" : "opacity-0"
        }`}
      />
      
      {/* Confetti */}
      {phase === "show" && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {confetti.map((piece) => (
            <div
              key={piece.id}
              className="absolute w-3 h-3 animate-confetti"
              style={{
                left: `${piece.left}%`,
                top: "-20px",
                backgroundColor: piece.color,
                animationDelay: `${piece.delay}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Celebration Card */}
      <div 
        className={`relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 text-center transition-all duration-500 ${
          phase === "enter" ? "opacity-0 scale-75" :
          phase === "show" ? "opacity-100 scale-100" :
          "opacity-0 scale-110"
        }`}
      >
        {/* Icon with glow effect */}
        <div className="relative inline-block mb-4">
          <div className="absolute inset-0 animate-ping opacity-20">
            <div className="w-24 h-24 rounded-full bg-teal-500" />
          </div>
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg">
            <span className="text-5xl">{celebration.icon}</span>
          </div>
        </div>
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        
        {/* Subtitle */}
        {subtitle && (
          <p className="text-gray-600 mb-4">{subtitle}</p>
        )}
        
        {/* XP Award */}
        {celebration.xpAwarded && (
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-2 rounded-full mb-4">
            <span className="text-xl">✨</span>
            <span className="font-bold">+{celebration.xpAwarded} XP</span>
          </div>
        )}
        
        {/* Badge Award */}
        {celebration.badgeAwarded && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-yellow-700 mb-2">
              {language === "fr" ? "Nouveau badge débloqué !" : "New badge unlocked!"}
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl">{celebration.badgeAwarded.icon}</span>
              <span className="font-medium text-yellow-800">
                {language === "fr" ? celebration.badgeAwarded.nameFr : celebration.badgeAwarded.name}
              </span>
            </div>
          </div>
        )}
        
        {/* Continue Button */}
        <button
          onClick={() => {
            setPhase("exit");
            setTimeout(onComplete, 500);
          }}
          className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-medium hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
        >
          {language === "fr" ? "Continuer" : "Continue"}
        </button>
      </div>
      
      {/* CSS for confetti animation */}
      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

// Pre-built celebration configs
export const CELEBRATIONS = {
  lessonComplete: (lessonTitle: string, xp: number): CelebrationData => ({
    type: "lesson",
    title: "Lesson Complete!",
    titleFr: "Leçon terminée !",
    subtitle: `You've completed "${lessonTitle}"`,
    subtitleFr: `Vous avez terminé "${lessonTitle}"`,
    icon: "📖",
    xpAwarded: xp,
  }),
  
  moduleComplete: (moduleName: string, xp: number): CelebrationData => ({
    type: "module",
    title: "Module Complete!",
    titleFr: "Module terminé !",
    subtitle: `You've mastered "${moduleName}"`,
    subtitleFr: `Vous avez maîtrisé "${moduleName}"`,
    icon: "📚",
    xpAwarded: xp,
    badgeAwarded: {
      name: "Module Master",
      nameFr: "Maître du module",
      icon: "🏅",
    },
  }),
  
  courseComplete: (courseName: string, xp: number): CelebrationData => ({
    type: "course",
    title: "Course Complete!",
    titleFr: "Cours terminé !",
    subtitle: `Congratulations! You've completed "${courseName}"`,
    subtitleFr: `Félicitations ! Vous avez terminé "${courseName}"`,
    icon: "🎓",
    xpAwarded: xp,
    badgeAwarded: {
      name: "Course Graduate",
      nameFr: "Diplômé du cours",
      icon: "🏆",
    },
  }),
  
  streakMilestone: (days: number): CelebrationData => ({
    type: "streak",
    title: `${days}-Day Streak!`,
    titleFr: `Série de ${days} jours !`,
    subtitle: "Your dedication is paying off!",
    subtitleFr: "Votre dévouement porte ses fruits !",
    icon: "🔥",
    badgeAwarded: {
      name: `${days}-Day Streak`,
      nameFr: `Série de ${days} jours`,
      icon: "🔥",
    },
  }),
  
  levelUp: (newLevel: number, levelTitle: string): CelebrationData => ({
    type: "level",
    title: "Level Up!",
    titleFr: "Niveau supérieur !",
    subtitle: `You're now Level ${newLevel}: ${levelTitle}`,
    subtitleFr: `Vous êtes maintenant Niveau ${newLevel}: ${levelTitle}`,
    icon: "⬆️",
    xpAwarded: 50,
  }),
};

export default ProgressCelebration;
