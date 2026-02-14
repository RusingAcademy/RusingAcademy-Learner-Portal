/**
 * ExamReadinessMode.tsx
 * Sprint 18 - P2: Exam Readiness Mode
 * Purpose: Simulate real SLE exam conditions with timer, rubrics, and scoring
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SLE_CONFIG = {
  levels: ['A', 'B', 'C'] as const,
  sections: {
    oral: { name: 'Expression Orale', duration: 20, parts: [
      { name: 'Présentation personnelle', duration: 3, weight: 15 },
      { name: 'Description d\'image', duration: 5, weight: 25 },
      { name: 'Situation de travail', duration: 7, weight: 35 },
      { name: 'Discussion approfondie', duration: 5, weight: 25 }
    ]},
    reading: { name: 'Compréhension Écrite', duration: 90, questionCount: 65 },
    writing: { name: 'Expression Écrite', duration: 60, tasks: [
      { name: 'Courriel professionnel', wordCount: 150, weight: 40 },
      { name: 'Note d\'information', wordCount: 250, weight: 60 }
    ]}
  },
  rubrics: {
    B: {
      fluency: 'Peut s\'exprimer avec aisance sur la plupart des sujets professionnels',
      vocabulary: 'Vocabulaire varié et approprié au contexte professionnel',
      grammar: 'Bonne maîtrise des structures, erreurs occasionnelles',
      pronunciation: 'Prononciation claire et naturelle'
    }
  }
};

interface ExamSession { id: string; userId: string; targetLevel: 'A' | 'B' | 'C'; section: string; status: string; score?: { overall: number; level: string; }; }

export function ExamReadinessDashboard({ userId }: { userId: string }) {
  const [selectedLevel, setSelectedLevel] = useState<'A' | 'B' | 'C'>('B');
  const [selectedSection, setSelectedSection] = useState<'oral' | 'reading' | 'writing'>('oral');
  const [examHistory, setExamHistory] = useState<ExamSession[]>([]);
  const [showExam, setShowExam] = useState(false);

  useEffect(() => { fetchExamHistory(); }, [userId]);
  const fetchExamHistory = async () => { const res = await fetch(`/api/users/${userId}/exam-history`); setExamHistory(await res.json()); };
  const readinessScore = examHistory.filter(e => e.status === 'completed' && e.targetLevel === selectedLevel).reduce((sum, e) => sum + (e.score?.overall || 0), 0) / (examHistory.length || 1);

  if (showExam) return <ExamSimulator level={selectedLevel} section={selectedSection} onComplete={() => { setShowExam(false); fetchExamHistory(); }} />;

  return (
    <div className="p-6 bg-[#0D0D1A] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Mode Préparation Examen</h1>
          <p className="text-white/60">Simulez les conditions réelles de l'ELS</p>
        </div>
        
        {/* Level Selector */}
        <div className="flex justify-center gap-4 mb-8">
          {(['A', 'B', 'C'] as const).map((level) => (
            <button key={level} onClick={() => setSelectedLevel(level)}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${selectedLevel === level ? 'bg-[#E7F2F2] text-white scale-105' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
              Niveau {level}
            </button>
          ))}
        </div>

        {/* Readiness Score */}
        <div className="bg-gradient-to-br from-[#0F3D3E]/20 to-[#145A5B]/20 rounded-2xl p-8 mb-8 text-center border border-[#0F3D3E]/30">
          <p className="text-white/60 mb-2">Score de préparation - Niveau {selectedLevel}</p>
          <div className="text-6xl font-bold text-white mb-4">{Math.round(readinessScore) || '--'}%</div>
          <div className="w-full bg-white/10 rounded-full h-3"><div className="bg-gradient-to-r from-[#0F3D3E] to-[#145A5B] h-3 rounded-full" style={{ width: `${readinessScore || 0}%` }} /></div>
        </div>

        {/* Section Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {Object.entries(SLE_CONFIG.sections).map(([key, section]) => (
            <button key={key} onClick={() => setSelectedSection(key as any)}
              className={`p-6 rounded-xl text-left transition-all ${selectedSection === key ? 'bg-[#E7F2F2]/20 border-[#0F3D3E]' : 'bg-white/5 border-white/10'} border`}>
              <h3 className="font-bold text-white mb-1">{section.name}</h3>
              <p className="text-sm text-white/75">{section.duration} minutes</p>
            </button>
          ))}
        </div>

        {/* Start Button */}
        <button onClick={() => setShowExam(true)} className="w-full py-4 bg-gradient-to-r from-[#0F3D3E] to-[#145A5B] rounded-xl text-white font-bold text-lg hover:opacity-90 transition-opacity">
          Commencer la simulation
        </button>
      </div>
    </div>
  );
}

function ExamSimulator({ level, section, onComplete }: { level: string; section: string; onComplete: () => void; }) {
  const [timeLeft, setTimeLeft] = useState(SLE_CONFIG.sections[section as keyof typeof SLE_CONFIG.sections].duration * 60);
  const [currentPart, setCurrentPart] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [responses, setResponses] = useState<string[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(t => t > 0 ? t - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

  const handleSubmit = async () => {
    await fetch('/api/exam/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ level, section, responses }) });
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-[#0D0D1A] z-50 flex flex-col">
      {/* Timer Header */}
      <div className="bg-black/50 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-white/60">Niveau {level}</span>
          <span className="text-white font-medium">{SLE_CONFIG.sections[section as keyof typeof SLE_CONFIG.sections].name}</span>
        </div>
        <div className={`text-2xl font-mono font-bold ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{formatTime(timeLeft)}</div>
        <button onClick={handleSubmit} className="px-4 py-2 bg-[#E7F2F2] rounded-lg text-white">Terminer</button>
      </div>

      {/* Exam Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-3xl mx-auto">
          {section === 'oral' && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Partie {currentPart + 1}: {(SLE_CONFIG.sections.oral.parts[currentPart] || {}).name}</h2>
              <button onClick={() => setIsRecording(!isRecording)} className={`w-24 h-24 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-[#E7F2F2]'} flex items-center justify-center mx-auto`}>
                <span className="text-3xl">{isRecording ? '⏹' : '🎤'}</span>
              </button>
              <p className="text-white/60 mt-4">{isRecording ? 'Enregistrement en cours...' : 'Cliquez pour commencer'}</p>
            </div>
          )}
          {section === 'writing' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Rédigez un courriel professionnel</h2>
              <textarea className="w-full h-64 bg-white/5 border border-white/10 rounded-xl p-4 text-white resize-none" placeholder="Commencez à écrire..." onChange={(e) => setResponses([e.target.value])} />
              <p className="text-white/75 text-sm mt-2">Minimum 150 mots</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
