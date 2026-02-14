/**
 * AntiDropOffSystem.tsx
 * Sprint 17 - P1: Anti-Drop-Off System
 * Purpose: Detect at-risk learners and trigger interventions to prevent abandonment
 * Target: 90% completion rate through proactive engagement
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RISK_CONFIG = {
  inactivityThresholds: { warning: 24, atRisk: 48, critical: 72, abandoned: 168 },
  interventions: { level1: 'nudge_notification', level2: 'ai_outreach', level3: 'coach_alert', level4: 'admin_escalation' },
  recoveryIncentives: { streakProtection: true, bonusXP: 50, coachSession: true }
};

interface LearnerRiskProfile {
  userId: string; riskLevel: 'low' | 'medium' | 'high' | 'critical'; riskScore: number;
  lastActivity: string; hoursSinceActivity: number; signals: { type: string; severity: string; details: string; }[];
  currentPath: string; progressPercent: number; interventionHistory: { id: string; type: string; status: string; }[];
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors = { red: 'bg-red-500/20 text-red-400', orange: 'bg-[#C65A1E]/20 text-orange-400', amber: 'bg-[#C65A1E]/20 text-amber-400' };
  return <div className={`px-4 py-2 rounded-lg ${colors[color as keyof typeof colors]}`}><span className="text-2xl font-bold">{value}</span><span className="text-xs ml-1">{label}</span></div>;
}

export function RiskDashboard({ role }: { role: 'admin' | 'coach' }) {
  const [atRiskLearners, setAtRiskLearners] = useState<LearnerRiskProfile[]>([]);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAtRiskLearners(); }, [filter]);

  const fetchAtRiskLearners = async () => {
    try { const response = await fetch(`/api/admin/at-risk-learners?filter=${filter}`); setAtRiskLearners(await response.json()); }
    catch (e) { console.error('Failed to fetch:', e); } finally { setLoading(false); }
  };

  const triggerIntervention = async (userId: string, type: string) => {
    await fetch('/api/admin/trigger-intervention', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, interventionType: type }) });
    fetchAtRiskLearners();
  };

  const getRiskColor = (level: string) => ({ critical: 'from-red-500 to-[#E06B2D]', high: 'from-[#C65A1E] to-red-500', medium: 'from-[#C65A1E] to-[#C65A1E]' }[level] || 'from-green-500');

  return (
    <div className="p-6 bg-[#0D0D1A] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-2xl font-bold text-white">Système Anti-Abandon</h1><p className="text-white/60">Surveillance proactive des apprenants à risque</p></div>
          <div className="flex gap-4">
            <StatCard label="Critiques" value={atRiskLearners.filter(l => l.riskLevel === 'critical').length} color="red" />
            <StatCard label="Élevés" value={atRiskLearners.filter(l => l.riskLevel === 'high').length} color="orange" />
            <StatCard label="Moyens" value={atRiskLearners.filter(l => l.riskLevel === 'medium').length} color="amber" />
          </div>
        </div>
        <div className="flex gap-2 mb-6">
          {['all', 'critical', 'high', 'medium'].map((f) => (
            <button key={f} onClick={() => setFilter(f as any)} className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === f ? 'bg-[#E7F2F2] text-white' : 'bg-white/5 text-white/60'}`}>
              {f === 'all' ? 'Tous' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          {loading ? <div className="text-center py-12 text-white/75">Chargement...</div> :
           atRiskLearners.length === 0 ? <div className="text-center py-12"><span className="text-4xl mb-4 block">🎉</span><p className="text-white/60">Aucun apprenant à risque!</p></div> :
           atRiskLearners.map((learner) => (
            <LearnerRiskCard key={learner.userId} learner={learner} onIntervene={(type) => triggerIntervention(learner.userId, type)} getRiskColor={getRiskColor} />
          ))}
        </div>
      </div>
    </div>
  );
}

function LearnerRiskCard({ learner, onIntervene, getRiskColor }: { learner: LearnerRiskProfile; onIntervene: (type: string) => void; getRiskColor: (level: string) => string; }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div layout className={`rounded-xl border overflow-hidden ${learner.riskLevel === 'critical' ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-white/5'}`}>
      <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getRiskColor(learner.riskLevel)}`} />
          <div><p className="font-medium text-white">{learner.userId}</p><p className="text-sm text-white/75">{learner.currentPath} • {learner.progressPercent}%</p></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right"><p className="text-sm text-white/60">{learner.hoursSinceActivity}h inactif</p><p className="text-xs text-white/75">Score: {learner.riskScore}/100</p></div>
          <span className="text-white/75">{expanded ? '▼' : '▶'}</span>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="border-t border-white/10">
            <div className="p-4 space-y-4">
              <div><h4 className="text-sm font-medium text-white mb-2">Signaux de risque</h4>
                <div className="space-y-1">{learner.signals.map((s, i) => <div key={i} className="text-sm text-white/60">• {s.details}</div>)}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onIntervene('nudge')} className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm">Nudge</button>
                <button onClick={() => onIntervene('ai_outreach')} className="px-3 py-1.5 bg-[#E7F2F2]/20 text-[#0F3D3E] rounded-lg text-sm">Steven AI</button>
                <button onClick={() => onIntervene('coach_alert')} className="px-3 py-1.5 bg-[#C65A1E]/20 text-amber-400 rounded-lg text-sm">Alerter Coach</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Nudge Modal for Learner
export function NudgeModal({ isOpen, onClose, message, incentive }: { isOpen: boolean; onClose: () => void; message: string; incentive?: { type: string; value: number; }; }) {
  if (!isOpen) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#1A1A2E] rounded-2xl p-6 max-w-md w-full border border-white/10">
        <div className="text-center"><span className="text-5xl mb-4 block">👋</span><h2 className="text-xl font-bold text-white mb-2">On vous attend!</h2><p className="text-white/60 mb-6">{message}</p></div>
        {incentive && <div className="bg-[#E7F2F2]/10 rounded-xl p-4 mb-6 text-center"><p className="text-[#0F3D3E] font-medium">🎁 Bonus de retour: +{incentive.value} XP</p></div>}
        <div className="flex gap-3"><button onClick={onClose} className="flex-1 py-3 bg-white/10 rounded-xl text-white">Plus tard</button><button onClick={onClose} className="flex-1 py-3 bg-[#E7F2F2] rounded-xl text-white font-medium">Reprendre</button></div>
      </motion.div>
    </motion.div>
  );
          }
