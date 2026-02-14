/**
 * BadgeSystem.tsx
 * Sprint 15 - P1: Badge System
 * Purpose: Award and display achievement badges for learner milestones
 * Target: Gamification layer for 90% completion rate
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const BADGE_CATALOG = {
  pathCompletion: [
    { id: 'path-1-complete', name: 'Fondations Solides', icon: '🏛️', description: 'Path I complété', rarity: 'common' },
    { id: 'path-2-complete', name: 'Communicateur', icon: '💬', description: 'Path II complété', rarity: 'common' },
    { id: 'path-3-complete', name: 'Professionnel', icon: '💼', description: 'Path III complété', rarity: 'uncommon' },
    { id: 'path-4-complete', name: 'Niveau B Atteint', icon: '🎯', description: 'Path IV complété', rarity: 'uncommon' },
    { id: 'path-5-complete', name: 'Expert Avancé', icon: '🔥', description: 'Path V complété', rarity: 'rare' },
    { id: 'path-6-complete', name: 'Maître Bilingue', icon: '👑', description: 'Path VI complété', rarity: 'legendary' },
  ],
  streaks: [
    { id: 'streak-7', name: 'Semaine Parfaite', icon: '📅', description: '7 jours consécutifs', rarity: 'common' },
    { id: 'streak-30', name: 'Mois Complet', icon: '🏅', description: '30 jours consécutifs', rarity: 'rare' },
    { id: 'streak-100', name: 'Centurion', icon: '🎯', description: '100 jours consécutifs', rarity: 'legendary' },
  ],
  sle: [
    { id: 'sle-b-oral', name: 'SLE B - Oral', icon: '🅱️', description: 'Niveau B oral atteint', rarity: 'rare' },
    { id: 'sle-c-oral', name: 'SLE C - Oral', icon: '©️', description: 'Niveau C oral atteint', rarity: 'epic' },
    { id: 'sle-cbc', name: 'CBC Complet', icon: '🏛️', description: 'Niveau CBC atteint', rarity: 'legendary' },
  ]
};

const RARITY_CONFIG = {
  common: { color: 'from-gray-400 to-gray-500', label: 'Commun' },
  uncommon: { color: 'from-green-400 to-emerald-500', label: 'Peu commun' },
  rare: { color: 'from-blue-400 to-indigo-500', label: 'Rare' },
  epic: { color: 'from-[#0F3D3E] to-[#145A5B]', label: 'Épique' },
  legendary: { color: 'from-[#D97B3D] to-[#C65A1E]', label: 'Légendaire' }
};

export function BadgeCard({ badge, earned = false, size = 'default' }) {
  const rarity = RARITY_CONFIG[badge.rarity];
  return (
    <motion.div className={`p-4 rounded-xl bg-gradient-to-br ${rarity.color} ${earned ? 'opacity-100' : 'opacity-40'}`}>
      <span className="text-4xl">{badge.icon}</span>
      <h3 className="text-white font-bold">{badge.name}</h3>
      <p className="text-white/70 text-sm">{badge.description}</p>
      <span className="text-xs text-white/80">{rarity.label}</span>
    </motion.div>
  );
}

export function BadgeUnlockAnimation({ badge, onComplete }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => { setTimeout(() => { setVisible(false); onComplete?.(); }, 4000); }, []);
  return visible ? (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="text-center">
        <span className="text-8xl">{badge.icon}</span>
        <h2 className="text-2xl text-white mt-4">Badge Débloqué!</h2>
        <p className="text-xl text-[#0F3D3E]">{badge.name}</p>
      </div>
    </motion.div>
  ) : null;
}

export function BadgeGrid({ badges, earnedBadgeIds = [] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {badges.map(badge => (
        <BadgeCard key={badge.id} badge={badge} earned={earnedBadgeIds.includes(badge.id)} />
      ))}
    </div>
  );
}
