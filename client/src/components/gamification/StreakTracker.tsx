/**
 * StreakTracker.tsx
 * Sprint 16 - P1: Streak Tracking System
 * Purpose: Track and display daily learning streaks for 90% completion
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  weeklyActivity: boolean[];
  streakFreezeAvailable: boolean;
}

const STREAK_MILESTONES = [
  { days: 7, reward: 50, badge: 'streak-7', label: 'Semaine Parfaite' },
  { days: 14, reward: 100, badge: 'streak-14', label: 'Deux Semaines' },
  { days: 30, reward: 250, badge: 'streak-30', label: 'Mois Complet' },
  { days: 60, reward: 500, badge: 'streak-60', label: 'Engagement Total' },
  { days: 100, reward: 1000, badge: 'streak-100', label: 'Centurion' },
];

export function StreakDisplay({ streak, size = 'default' }: { streak: StreakData; size?: string }) {
  const flameSize = size === 'compact' ? 'text-2xl' : 'text-4xl';
  const isActive = new Date(streak.lastActivityDate).toDateString() === new Date().toDateString();
  
  return (
    <motion.div 
      className={`flex items-center gap-2 p-3 rounded-xl ${isActive ? 'bg-[#C65A1E]/20' : 'bg-white0/20'}`}
      animate={{ scale: isActive ? [1, 1.05, 1] : 1 }}
      transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
    >
      <span className={flameSize}>{isActive ? '🔥' : '❄️'}</span>
      <div>
        <p className="text-2xl font-bold text-white">{streak.currentStreak}</p>
        <p className="text-xs text-gray-400">jours consécutifs</p>
      </div>
    </motion.div>
  );
}

export function WeeklyCalendar({ weeklyActivity }: { weeklyActivity: boolean[] }) {
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  return (
    <div className="flex gap-1">
      {days.map((day, i) => (
        <div key={i} className={`w-8 h-8 rounded flex items-center justify-center text-xs ${weeklyActivity[i] ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
          {day}
        </div>
      ))}
    </div>
  );
}

export function StreakMilestoneProgress({ currentStreak }: { currentStreak: number }) {
  const nextMilestone = STREAK_MILESTONES.find(m => m.days > currentStreak) || STREAK_MILESTONES[STREAK_MILESTONES.length - 1];
  const progress = (currentStreak / nextMilestone.days) * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">Prochain objectif</span>
        <span className="text-[#0F3D3E]">{nextMilestone.label} ({nextMilestone.days}j)</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-[#C65A1E] to-red-500" initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }} />
      </div>
      <p className="text-xs text-gray-500">+{nextMilestone.reward} XP à débloquer</p>
    </div>
  );
}

export function StreakFreezeButton({ available, onUse }: { available: boolean; onUse: () => void }) {
  return (
    <button onClick={onUse} disabled={!available} className={`px-4 py-2 rounded-lg flex items-center gap-2 ${available ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-700 cursor-not-allowed'}`}>
      <span>❄️</span>
      <span>{available ? 'Utiliser Streak Freeze' : 'Aucun freeze disponible'}</span>
    </button>
  );
}
