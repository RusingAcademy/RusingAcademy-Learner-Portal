import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { getLevelFromXP, getXPForLevel, levelTitles } from "@/data/courseData";

interface GamificationState {
  totalXP: number;
  level: number;
  levelTitle: string;
  streak: number;
  longestStreak: number;
  lessonsCompleted: number;
  quizzesPassed: number;
  badges: string[];
  weeklyGoal: number;
  weeklyProgress: number;
  completedLessons: Set<string>;
  completedQuizzes: Set<string>;
}

interface GamificationContextType extends GamificationState {
  addXP: (amount: number) => void;
  completeLesson: (lessonKey: string) => void;
  passQuiz: (quizKey: string) => void;
  earnBadge: (badge: string) => void;
  incrementStreak: () => void;
  xpToNextLevel: number;
  xpProgress: number;
}

const GamificationContext = createContext<GamificationContextType | null>(null);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GamificationState>({
    totalXP: 2450,
    level: 5,
    levelTitle: "Dedicated Learner",
    streak: 7,
    longestStreak: 14,
    lessonsCompleted: 18,
    quizzesPassed: 12,
    badges: ["first-lesson", "first-quiz", "week-streak", "module-complete"],
    weeklyGoal: 5,
    weeklyProgress: 3,
    completedLessons: new Set(["fsl-1.1", "fsl-1.2", "fsl-1.3", "fsl-1.4", "fsl-2.1", "fsl-2.2", "fsl-2.3", "fsl-2.4", "fsl-3.1", "fsl-3.2", "fsl-3.3", "fsl-3.4", "fsl-4.1", "fsl-4.2", "fsl-4.3", "fsl-4.4", "fsl-5.1", "fsl-5.2"]),
    completedQuizzes: new Set(["fsl-mod-1", "fsl-mod-2", "fsl-mod-3", "fsl-mod-4", "fsl-mod-5-partial"]),
  });

  const addXP = useCallback((amount: number) => {
    setState((prev) => {
      const newXP = prev.totalXP + amount;
      const newLevel = getLevelFromXP(newXP);
      return {
        ...prev,
        totalXP: newXP,
        level: newLevel,
        levelTitle: levelTitles[newLevel] || "Champion",
      };
    });
  }, []);

  const completeLesson = useCallback((lessonKey: string) => {
    setState((prev) => {
      if (prev.completedLessons.has(lessonKey)) return prev;
      const newSet = new Set(prev.completedLessons);
      newSet.add(lessonKey);
      return {
        ...prev,
        completedLessons: newSet,
        lessonsCompleted: prev.lessonsCompleted + 1,
        weeklyProgress: Math.min(prev.weeklyGoal, prev.weeklyProgress + 1),
      };
    });
  }, []);

  const passQuiz = useCallback((quizKey: string) => {
    setState((prev) => {
      if (prev.completedQuizzes.has(quizKey)) return prev;
      const newSet = new Set(prev.completedQuizzes);
      newSet.add(quizKey);
      return { ...prev, completedQuizzes: newSet, quizzesPassed: prev.quizzesPassed + 1 };
    });
  }, []);

  const earnBadge = useCallback((badge: string) => {
    setState((prev) => {
      if (prev.badges.includes(badge)) return prev;
      return { ...prev, badges: [...prev.badges, badge] };
    });
  }, []);

  const incrementStreak = useCallback(() => {
    setState((prev) => {
      const newStreak = prev.streak + 1;
      return {
        ...prev,
        streak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
      };
    });
  }, []);

  const currentLevelXP = getXPForLevel(state.level);
  const nextLevelXP = getXPForLevel(state.level + 1);
  const xpToNextLevel = nextLevelXP - state.totalXP;
  const xpProgress = ((state.totalXP - currentLevelXP + 500) / 500) * 100;

  return (
    <GamificationContext.Provider
      value={{ ...state, addXP, completeLesson, passQuiz, earnBadge, incrementStreak, xpToNextLevel, xpProgress }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error("useGamification must be used within GamificationProvider");
  return ctx;
}
