import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { XPNotification, LevelUpCelebration, BadgeUnlockModal } from "@/components/gamification";

interface Badge {
  code: string;
  name: string;
  nameFr?: string;
  description?: string;
  descriptionFr?: string;
  points: number;
  rarity?: "common" | "uncommon" | "rare" | "epic" | "legendary";
}

interface GamificationContextType {
  // XP notifications
  showXPGain: (amount: number, reason?: string) => void;
  
  // Level up celebration
  showLevelUp: (newLevel: number) => void;
  
  // Badge unlock
  showBadgeUnlock: (badge: Badge) => void;
  
  // Current state
  currentStreak: number;
  setCurrentStreak: (streak: number) => void;
  
  // Sound settings
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

interface GamificationProviderProps {
  children: ReactNode;
  language?: "en" | "fr";
}

export function GamificationProvider({ children, language = "en" }: GamificationProviderProps) {
  // XP notification state
  const [xpNotification, setXpNotification] = useState<{
    amount: number;
    reason?: string;
    isVisible: boolean;
  }>({ amount: 0, isVisible: false });

  // Level up state
  const [levelUp, setLevelUp] = useState<{
    newLevel: number;
    isOpen: boolean;
  }>({ newLevel: 0, isOpen: false });

  // Badge unlock state
  const [badgeUnlock, setBadgeUnlock] = useState<{
    badge: Badge | null;
    isOpen: boolean;
  }>({ badge: null, isOpen: false });

  // Streak state
  const [currentStreak, setCurrentStreak] = useState(0);

  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Show XP gain notification
  const showXPGain = useCallback((amount: number, reason?: string) => {
    setXpNotification({ amount, reason, isVisible: true });
  }, []);

  // Hide XP notification
  const hideXPNotification = useCallback(() => {
    setXpNotification(prev => ({ ...prev, isVisible: false }));
  }, []);

  // Show level up celebration
  const showLevelUp = useCallback((newLevel: number) => {
    setLevelUp({ newLevel, isOpen: true });
  }, []);

  // Hide level up
  const hideLevelUp = useCallback(() => {
    setLevelUp(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Show badge unlock
  const showBadgeUnlock = useCallback((badge: Badge) => {
    setBadgeUnlock({ badge, isOpen: true });
  }, []);

  // Hide badge unlock
  const hideBadgeUnlock = useCallback(() => {
    setBadgeUnlock(prev => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <GamificationContext.Provider
      value={{
        showXPGain,
        showLevelUp,
        showBadgeUnlock,
        currentStreak,
        setCurrentStreak,
        soundEnabled,
        setSoundEnabled,
      }}
    >
      {children}

      {/* XP Notification */}
      <XPNotification
        amount={xpNotification.amount}
        reason={xpNotification.reason}
        isVisible={xpNotification.isVisible}
        onComplete={hideXPNotification}
        position="top-right"
      />

      {/* Level Up Celebration */}
      <LevelUpCelebration
        isOpen={levelUp.isOpen}
        onClose={hideLevelUp}
        newLevel={levelUp.newLevel}
        language={language}
      />

      {/* Badge Unlock Modal */}
      <BadgeUnlockModal
        isOpen={badgeUnlock.isOpen}
        onClose={hideBadgeUnlock}
        badge={badgeUnlock.badge}
        language={language}
      />
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error("useGamification must be used within a GamificationProvider");
  }
  return context;
}

export default GamificationContext;
