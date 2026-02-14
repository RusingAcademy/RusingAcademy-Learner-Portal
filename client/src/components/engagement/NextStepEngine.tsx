/**
 * NextStepEngine.tsx
 * Sprint 14 - P0: Next-Step Engine
 * Purpose: Intelligent routing at the end of each lesson - never a dead end
 * Target: 100% next best action clarity, 0 dead ends
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface LessonPerformance {
  lessonId: string;
  score: number;
  timeSpent: number;
  completedActivities: number;
  totalActivities: number;
  struggledWith: string[];
}

interface Recommendation {
  type: 'next-lesson' | 'remedial' | 'practice' | 'break' | 'achievement';
  title: string;
  description: string;
  path: string;
  priority: number;
  reason: string;
  estimatedTime: string;
  icon: string;
}

interface NextStepEngineProps {
  currentLessonId: string;
  currentModuleId: string;
  currentPathId: string;
  performance: LessonPerformance;
  userProfile: { timePreference: 'limited' | 'moderate' | 'intensive' | 'immersive'; anxietyLevel: number; streak: number; };
}

export function NextStepEngine({ currentLessonId, currentModuleId, currentPathId, performance, userProfile }: NextStepEngineProps) {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedReco, setSelectedReco] = useState<Recommendation | null>(null);
  const [showAllOptions, setShowAllOptions] = useState(false);

  useEffect(() => {
    const recos = generateRecommendations(currentLessonId, currentModuleId, currentPathId, performance, userProfile);
    setRecommendations(recos);
    setSelectedReco(recos[0]);
  }, [currentLessonId, performance, userProfile]);

  const handleAcceptRecommendation = (reco: Recommendation) => {
    trackEvent('next_step_clicked', { lessonId: currentLessonId, recommendationType: reco.type, accepted: true });
    navigate(reco.path);
  };

  const handleOverride = () => {
    setShowAllOptions(true);
    trackEvent('recommendation_overridden', { lessonId: currentLessonId, originalRecommendation: selectedReco?.type });
  };

  const primaryReco = recommendations[0];
  const alternativeRecos = recommendations.slice(1);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-[#0F3D3E]/10 to-[#145A5B]/10 border border-[#0F3D3E]/20">
      <div className="text-center mb-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-3xl mb-4">
          {performance.score >= 80 ? '🎉' : performance.score >= 60 ? '👍' : '💪'}
        </motion.div>
        <h3 className="text-xl font-bold text-white">{performance.score >= 80 ? 'Excellent travail!' : performance.score >= 60 ? 'Bien joué!' : 'Continue comme ça!'}</h3>
        <p className="text-white/60 text-sm mt-1">Score: {performance.score}% • Temps: {formatTime(performance.timeSpent)}</p>
      </div>
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="flex justify-center gap-4 mb-6">
        <div className="px-4 py-2 rounded-xl bg-[#C65A1E]/20 border border-amber-500/30"><span className="text-amber-400 font-bold">+{calculateXP(performance)} XP</span></div>
        {performance.score >= 90 && <div className="px-4 py-2 rounded-xl bg-[#E7F2F2]/20 border border-[#0F3D3E]/30"><span className="text-[#0F3D3E] font-bold">🏆 Perfection Bonus!</span></div>}
      </motion.div>
      {primaryReco && !showAllOptions && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="space-y-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-start gap-4">
              <div className="text-3xl">{primaryReco.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#E7F2F2]/30 text-[#0F3D3E]">Recommandé</span>
                  <span className="text-xs text-white/75">{primaryReco.estimatedTime}</span>
                </div>
                <h4 className="text-lg font-semibold text-white">{primaryReco.title}</h4>
                <p className="text-white/60 text-sm">{primaryReco.description}</p>
                <p className="text-white/75 text-xs mt-2 italic">{primaryReco.reason}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => handleAcceptRecommendation(primaryReco)} className="flex-1 px-6 py-3 bg-gradient-to-r from-[#0F3D3E] to-[#145A5B] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-300 flex items-center justify-center gap-2">
              <span>Continuer</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
            <button onClick={handleOverride} className="px-6 py-3 bg-white/5 text-white/70 font-medium rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">Autres options</button>
          </div>
        </motion.div>
      )}
      {showAllOptions && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <h4 className="text-sm font-medium text-white/80 mb-4">Choisissez votre prochaine étape :</h4>
          {recommendations.map((reco, index) => (
            <motion.button key={reco.path} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} onClick={() => handleAcceptRecommendation(reco)} className={`w-full p-4 text-left rounded-xl border transition-all duration-200 ${index === 0 ? 'bg-[#E7F2F2]/20 border-[#0F3D3E]/30 hover:bg-[#E7F2F2]/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{reco.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{reco.title}</span>
                    {index === 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-[#E7F2F2]/30 text-[#0F3D3E]">Recommandé</span>}
                  </div>
                  <p className="text-white/80 text-sm">{reco.description}</p>
                </div>
                <span className="text-white/75 text-sm">{reco.estimatedTime}</span>
              </div>
            </motion.button>
          ))}
          <button onClick={() => setShowAllOptions(false)} className="w-full mt-2 text-center text-white/80 text-sm hover:text-white/70 transition-colors">← Retour à la recommandation principale</button>
        </motion.div>
      )}
    </motion.div>
  );
}

function generateRecommendations(lessonId: string, moduleId: string, pathId: string, performance: LessonPerformance, userProfile: { timePreference: string; anxietyLevel: number; streak: number }): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const lessonParts = lessonId.split('-');
  const moduleNum = parseInt(lessonParts[1]) || 1;
  const lessonNum = parseInt(lessonParts[2]) || 1;
  const isStruggling = performance.score < 60 || performance.struggledWith.length > 0;
  if (isStruggling && performance.struggledWith.length > 0) {
    recommendations.push({ type: 'remedial', title: 'Exercice de renforcement', description: `Consolider: ${performance.struggledWith.join(', ')}`, path: `/lms/paths/${pathId}/remedial?focus=${performance.struggledWith.join(',')}`, priority: 1, reason: 'Basé sur les zones où vous avez eu des difficultés', estimatedTime: '10 min', icon: '🔄' });
  }
  const nextLessonNum = lessonNum + 1;
  const isEndOfModule = lessonNum >= 4;
  if (!isEndOfModule) {
    recommendations.push({ type: 'next-lesson', title: `Leçon ${moduleNum}.${nextLessonNum}`, description: 'Continuer votre progression', path: `/lms/paths/${pathId}/modules/${moduleId}/lessons/lesson-${moduleNum}-${nextLessonNum}`, priority: isStruggling ? 2 : 1, reason: 'Prochaine étape logique de votre parcours', estimatedTime: '20 min', icon: '📚' });
  } else {
    recommendations.push({ type: 'next-lesson', title: `Quiz du Module ${moduleNum}`, description: 'Validez vos acquis avant de passer au module suivant', path: `/lms/paths/${pathId}/modules/${moduleId}/quiz`, priority: 1, reason: 'Vous avez terminé toutes les leçons de ce module', estimatedTime: '15 min', icon: '📝' });
  }
  recommendations.push({ type: 'practice', title: 'Pratique libre', description: 'Exercices supplémentaires sur ce thème', path: `/lms/paths/${pathId}/practice?lesson=${lessonId}`, priority: 3, reason: "Pour renforcer ce que vous venez d'apprendre", estimatedTime: '15 min', icon: '🎯' });
  if (userProfile.anxietyLevel >= 4 || userProfile.timePreference === 'limited') {
    recommendations.push({ type: 'break', title: 'Pause méritée', description: 'Revenez demain pour maintenir votre streak', path: '/lms/dashboard', priority: 4, reason: "Vous avez bien travaillé aujourd'hui", estimatedTime: '—', icon: '☕' });
  }
  if (performance.score >= 90) {
    recommendations.push({ type: 'achievement', title: 'Voir vos badges', description: 'Vous avez peut-être débloqué un nouveau badge!', path: '/lms/achievements', priority: 5, reason: 'Score parfait - vérifiez vos récompenses', estimatedTime: '2 min', icon: '🏆' });
  }
  return recommendations.sort((a, b) => a.priority - b.priority);
}

function calculateXP(performance: LessonPerformance): number {
  let xp = 50;
  if (performance.score >= 90) xp += 30;
  else if (performance.score >= 80) xp += 20;
  else if (performance.score >= 70) xp += 10;
  if (performance.completedActivities === performance.totalActivities) xp += 15;
  if (performance.timeSpent < 600 && performance.score >= 80) xp += 10;
  return xp;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function trackEvent(eventName: string, properties: Record<string, any>) {
  console.log(`[Analytics] ${eventName}`, properties);
  fetch('/api/analytics/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: eventName, properties, timestamp: new Date().toISOString() }) }).catch(console.error);
}
