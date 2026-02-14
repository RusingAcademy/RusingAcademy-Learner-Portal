import { useEffect, useState } from "react";

interface XpToastProps {
  amount: number;
  reason: string;
  leveledUp?: boolean;
  newLevel?: {
    level: number;
    title: string;
    titleFr: string;
  } | null;
  onClose: () => void;
}

const REASON_LABELS: Record<string, { label: string; icon: string }> = {
  lesson_complete: { label: "Lesson Completed", icon: "📖" },
  quiz_pass: { label: "Quiz Passed", icon: "✅" },
  quiz_perfect: { label: "Perfect Quiz!", icon: "💯" },
  module_complete: { label: "Module Completed", icon: "📚" },
  course_complete: { label: "Course Completed!", icon: "🎓" },
  streak_bonus: { label: "Streak Bonus", icon: "🔥" },
  daily_login: { label: "Daily Login", icon: "👋" },
  first_lesson: { label: "First Lesson!", icon: "🎯" },
  challenge_complete: { label: "Challenge Complete", icon: "⚔️" },
  review_submitted: { label: "Review Submitted", icon: "⭐" },
  note_created: { label: "Note Created", icon: "📝" },
  exercise_complete: { label: "Exercise Done", icon: "💪" },
  speaking_practice: { label: "Speaking Practice", icon: "🎤" },
  writing_submitted: { label: "Writing Submitted", icon: "✍️" },
  milestone_bonus: { label: "Milestone Reached!", icon: "🏆" },
  level_up_bonus: { label: "Level Up!", icon: "⬆️" },
  referral_bonus: { label: "Referral Bonus", icon: "🤝" },
};

export function XpToast({ amount, reason, leveledUp, newLevel, onClose }: XpToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  
  const reasonInfo = REASON_LABELS[reason] || { label: "XP Earned", icon: "✨" };
  
  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 50);
    
    // Auto close after 4 seconds
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, leveledUp ? 6000 : 4000);
    
    return () => clearTimeout(timer);
  }, [onClose, leveledUp]);
  
  return (
    <div 
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible && !isExiting 
          ? "opacity-100 translate-x-0" 
          : "opacity-0 translate-x-full"
      }`}
    >
      <div className={`rounded-2xl shadow-2xl overflow-hidden ${
        leveledUp 
          ? "bg-gradient-to-r from-yellow-400 via-[#D97B3D] to-[#D97B3D]" 
          : "bg-gradient-to-r from-teal-500 to-teal-600"
      }`}>
        {/* Main XP notification */}
        <div className="p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="text-3xl animate-bounce">{reasonInfo.icon}</div>
            <div>
              <p className="text-sm opacity-90">{reasonInfo.label}</p>
              <p className="text-2xl font-bold">+{amount} XP</p>
            </div>
          </div>
        </div>
        
        {/* Level up celebration */}
        {leveledUp && newLevel && (
          <div className="bg-white/20 backdrop-blur p-4 border-t border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                <span className="text-2xl">🎉</span>
              </div>
              <div>
                <p className="text-white font-bold text-lg">Level Up!</p>
                <p className="text-white/90">
                  You're now Level {newLevel.level}: {newLevel.title}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Progress bar animation */}
        <div className="h-1 bg-white/20">
          <div 
            className="h-full bg-white transition-all duration-[4000ms] ease-linear"
            style={{ width: isVisible && !isExiting ? "0%" : "100%" }}
          />
        </div>
      </div>
    </div>
  );
}

// Hook to manage XP toasts
export function useXpToast() {
  const [toast, setToast] = useState<{
    amount: number;
    reason: string;
    leveledUp?: boolean;
    newLevel?: { level: number; title: string; titleFr: string } | null;
  } | null>(null);
  
  const showXpToast = (data: typeof toast) => {
    setToast(data);
  };
  
  const hideXpToast = () => {
    setToast(null);
  };
  
  return { toast, showXpToast, hideXpToast };
}

export default XpToast;
