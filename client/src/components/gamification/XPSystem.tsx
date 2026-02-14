/**
 * XPSystem.tsx
 * Sprint 15 - P1: XP System
 * 
 * Purpose: Track and display learner XP, levels, and progress
 * Target: Gamification foundation for 90% completion rate
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const XP_CONFIG = {
  levels: [
    { level: 1, name: 'Débutant', minXP: 0, maxXP: 100, icon: '🌱' },
    { level: 2, name: 'Apprenti', minXP: 100, maxXP: 300, icon: '📚' },
    { level: 3, name: 'Intermédiaire', minXP: 300, maxXP: 600, icon: '⭐' },
    { level: 4, name: 'Avancé', minXP: 600, maxXP: 1000, icon: '🔥' },
    { level: 5, name: 'Expert', minXP: 1000, maxXP: 1500, icon: '💎' },
    { level: 6, name: 'Maître', minXP: 1500, maxXP: 2200, icon: '👑' },
    { level: 7, name: 'Champion', minXP: 2200, maxXP: 3000, icon: '🏆' },
    { level: 8, name: 'Légende', minXP: 3000, maxXP: 4000, icon: '🌟' },
    { level: 9, name: 'Virtuose', minXP: 4000, maxXP: 5500, icon: '🎯' },
    { level: 10, name: 'Bilingue Accompli', minXP: 5500, maxXP: Infinity, icon: '🇨🇦' }
  ],
  xpSources: {
    lessonComplete: { base: 50, name: 'Leçon complétée' },
    activityComplete: { base: 10, name: 'Activité complétée' },
    quizPassed: { base: 30, name: 'Quiz réussi' },
    moduleComplete: { base: 100, name: 'Module complété' },
    pathComplete: { base: 500, name: 'Parcours complété' },
    perfectScore: { base: 25, name: 'Score parfait' },
    streakBonus: { base: 10, name: 'Bonus de série' },
    firstAttempt: { base: 15, name: 'Premier essai réussi' },
    voicePractice: { base: 20, name: 'Pratique vocale' },
    coachSession: { base: 75, name: 'Session de coaching' }
  }
};

export function XPProgressBar({ currentXP, showDetails = true, size = 'default' }) {
  const currentLevel = XP_CONFIG.levels.find(l => currentXP >= l.minXP && currentXP < l.maxXP) || XP_CONFIG.levels[XP_CONFIG.levels.length - 1];
  const nextLevel = XP_CONFIG.levels.find(l => l.level === currentLevel.level + 1);
  const progressInLevel = currentXP - currentLevel.minXP;
  const xpNeededForLevel = (nextLevel?.minXP || currentLevel.maxXP) - currentLevel.minXP;
  const progressPercent = Math.min((progressInLevel / xpNeededForLevel) * 100, 100);

  return (
    <div className="w-full">
      {showDetails && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{currentLevel.icon}</span>
            <div>
              <p className="text-sm font-medium text-white">Niveau {currentLevel.level}: {currentLevel.name}</p>
              <p className="text-xs text-white/80">{currentXP.toLocaleString()} XP total</p>
            </div>
          </div>
        </div>
      )}
      <div className="w-full bg-white/10 rounded-full overflow-hidden h-3">
        <motion.div initial={{ width: 0 }} animate={{ width: progressPercent + '%' }} className="h-full bg-gradient-to-r from-[#0F3D3E] to-[#145A5B] rounded-full" />
      </div>
    </div>
  );
}

export function XPGainAnimation({ amount, source, onComplete }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => { const timer = setTimeout(() => { setVisible(false); onComplete?.(); }, 2500); return () => clearTimeout(timer); }, []);
  return visible ? <motion.div className="fixed bottom-24 right-6 z-50 px-4 py-3 rounded-xl bg-gradient-to-r from-[#C65A1E]/90 to-[#C65A1E]/90"><p className="text-white font-bold">+{amount} XP</p></motion.div> : null;
}

export function LevelUpAnimation({ newLevel, onComplete }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => { const timer = setTimeout(() => { setVisible(false); onComplete?.(); }, 4000); return () => clearTimeout(timer); }, []);
  return visible ? <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"><div className="text-8xl">{newLevel.icon}</div><h2 className="text-3xl text-white">Niveau {newLevel.level}!</h2></motion.div> : null;
}

export { XP_CONFIG };
