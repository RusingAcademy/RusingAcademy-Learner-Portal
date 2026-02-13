import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLevelFromXP, getXPForLevel, levelTitles } from "@/data/courseData";

/* ── Types ── */
export interface Badge {
  badgeId: string;
  badgeName: string;
  badgeDescription: string;
  badgeIcon: string;
  badgeColor: string;
  earnedAt: Date | null;
}

interface GamificationState {
  totalXP: number;
  level: number;
  levelTitle: string;
  streak: number;
  longestStreak: number;
  lessonsCompleted: number;
  quizzesPassed: number;
  perfectQuizzes: number;
  badges: Badge[];
  weeklyGoal: number;
  weeklyProgress: number;
  completedLessons: Set<string>;
  completedSlots: Map<string, number[]>;
  isLoading: boolean;
}

interface GamificationContextType extends GamificationState {
  addXP: (amount: number) => void;
  completeLesson: (lessonKey: string, programId: string, pathId: string, moduleIndex: number) => void;
  completeSlot: (lessonKey: string, slotIndex: number, programId: string, pathId: string, moduleIndex: number) => void;
  passQuiz: (quizKey: string, score: number, total: number, correct: number, programId: string, pathId: string, lessonId?: string, quizType?: "formative" | "summative" | "final_exam") => void;
  xpToNextLevel: number;
  xpProgress: number;
  refetchProfile: () => void;
}

const GamificationContext = createContext<GamificationContextType | null>(null);

/* ── Default state for unauthenticated or loading ── */
const defaultState: GamificationState = {
  totalXP: 0, level: 1, levelTitle: "Beginner", streak: 0, longestStreak: 0,
  lessonsCompleted: 0, quizzesPassed: 0, perfectQuizzes: 0, badges: [],
  weeklyGoal: 5, weeklyProgress: 0, completedLessons: new Set(),
  completedSlots: new Map(), isLoading: true,
};

export function GamificationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = useState<GamificationState>(defaultState);

  /* ── tRPC queries (only fire when authenticated) ── */
  const profileQuery = trpc.gamification.getProfile.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const progressQuery = trpc.progress.getLessonProgress.useQuery({}, {
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  /* ── tRPC mutations ── */
  const addXpMutation = trpc.gamification.addXp.useMutation();
  const updateProgressMutation = trpc.progress.updateLessonProgress.useMutation();
  const submitQuizMutation = trpc.quiz.submitAttempt.useMutation();
  const utils = trpc.useUtils();

  /* ── Sync server state to local state ── */
  useEffect(() => {
    if (!profileQuery.data) return;
    const { profile, badges } = profileQuery.data;
    if (!profile) return;

    const completedLessons = new Set<string>();
    const completedSlots = new Map<string, number[]>();

    if (progressQuery.data) {
      for (const p of progressQuery.data) {
        const key = `${p.programId}-${p.lessonId}`;
        if (p.isCompleted) completedLessons.add(key);
        if (p.slotsCompleted) {
          try {
            const slots = typeof p.slotsCompleted === "string" ? JSON.parse(p.slotsCompleted) : p.slotsCompleted;
            if (Array.isArray(slots)) completedSlots.set(key, slots);
          } catch { /* ignore parse errors */ }
        }
      }
    }

    setState({
      totalXP: profile.totalXp,
      level: profile.level,
      levelTitle: levelTitles[profile.level] || "Champion",
      streak: profile.currentStreak,
      longestStreak: profile.longestStreak,
      lessonsCompleted: profile.lessonsCompleted,
      quizzesPassed: profile.quizzesCompleted,
      perfectQuizzes: profile.perfectQuizzes,
      badges: badges.map((b: any) => ({
        badgeId: b.badgeId, badgeName: b.badgeName,
        badgeDescription: b.badgeDescription, badgeIcon: b.badgeIcon,
        badgeColor: b.badgeColor, earnedAt: b.earnedAt,
      })),
      weeklyGoal: 5,
      weeklyProgress: Math.min(5, profile.lessonsCompleted % 5),
      completedLessons,
      completedSlots,
      isLoading: false,
    });
  }, [profileQuery.data, progressQuery.data]);

  /* ── Set loading false if not authenticated ── */
  useEffect(() => {
    if (!isAuthenticated && !profileQuery.isLoading) {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [isAuthenticated, profileQuery.isLoading]);

  /* ── Actions ── */
  const addXP = useCallback((amount: number) => {
    setState(prev => {
      const newXP = prev.totalXP + amount;
      const newLevel = getLevelFromXP(newXP);
      return { ...prev, totalXP: newXP, level: newLevel, levelTitle: levelTitles[newLevel] || "Champion" };
    });
    if (isAuthenticated) {
      addXpMutation.mutate({ amount }, {
        onSuccess: () => utils.gamification.getProfile.invalidate(),
      });
    }
  }, [isAuthenticated, addXpMutation, utils]);

  const completeSlot = useCallback((lessonKey: string, slotIndex: number, programId: string, pathId: string, moduleIndex: number) => {
    setState(prev => {
      const existing = prev.completedSlots.get(lessonKey) || [];
      if (existing.includes(slotIndex)) return prev;
      const newSlots = [...existing, slotIndex];
      const newMap = new Map(prev.completedSlots);
      newMap.set(lessonKey, newSlots);
      return { ...prev, completedSlots: newMap };
    });
    if (isAuthenticated) {
      const lessonId = lessonKey.split("-").slice(-1)[0] || lessonKey;
      const currentSlots = state.completedSlots.get(lessonKey) || [];
      const allSlots = Array.from(new Set([...currentSlots, slotIndex]));
      updateProgressMutation.mutate({
        programId, pathId, moduleIndex, lessonId,
        slotsCompleted: allSlots, isCompleted: false,
      }, {
        onSuccess: () => utils.gamification.getProfile.invalidate(),
      });
    }
  }, [isAuthenticated, state.completedSlots, updateProgressMutation, utils]);

  const completeLesson = useCallback((lessonKey: string, programId: string, pathId: string, moduleIndex: number) => {
    setState(prev => {
      if (prev.completedLessons.has(lessonKey)) return prev;
      const newSet = new Set(prev.completedLessons);
      newSet.add(lessonKey);
      return {
        ...prev, completedLessons: newSet,
        lessonsCompleted: prev.lessonsCompleted + 1,
        weeklyProgress: Math.min(prev.weeklyGoal, prev.weeklyProgress + 1),
      };
    });
    if (isAuthenticated) {
      const lessonId = lessonKey.split("-").slice(-1)[0] || lessonKey;
      updateProgressMutation.mutate({
        programId, pathId, moduleIndex, lessonId,
        slotsCompleted: [0, 1, 2, 3, 4, 5, 6], isCompleted: true,
      }, {
        onSuccess: () => {
          utils.gamification.getProfile.invalidate();
          utils.progress.getLessonProgress.invalidate();
        },
      });
    }
  }, [isAuthenticated, updateProgressMutation, utils]);

  const passQuiz = useCallback((
    quizKey: string, score: number, total: number, correct: number,
    programId: string, pathId: string, lessonId?: string,
    quizType: "formative" | "summative" | "final_exam" = "formative"
  ) => {
    setState(prev => ({
      ...prev,
      quizzesPassed: prev.quizzesPassed + 1,
      perfectQuizzes: score === 100 ? prev.perfectQuizzes + 1 : prev.perfectQuizzes,
    }));
    if (isAuthenticated) {
      submitQuizMutation.mutate({
        programId, pathId, lessonId, quizType,
        totalQuestions: total, correctAnswers: correct, score,
      }, {
        onSuccess: () => {
          utils.gamification.getProfile.invalidate();
          utils.quiz.getAttempts.invalidate();
        },
      });
    }
  }, [isAuthenticated, submitQuizMutation, utils]);

  const refetchProfile = useCallback(() => {
    utils.gamification.getProfile.invalidate();
    utils.progress.getLessonProgress.invalidate();
  }, [utils]);

  /* ── Computed values ── */
  const currentLevelXP = getXPForLevel(state.level);
  const nextLevelXP = getXPForLevel(state.level + 1);
  const xpToNextLevel = nextLevelXP - state.totalXP;
  const xpProgress = Math.min(100, ((state.totalXP - currentLevelXP + 500) / 500) * 100);

  return (
    <GamificationContext.Provider
      value={{
        ...state, addXP, completeLesson, completeSlot, passQuiz,
        xpToNextLevel, xpProgress, refetchProfile,
      }}
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
