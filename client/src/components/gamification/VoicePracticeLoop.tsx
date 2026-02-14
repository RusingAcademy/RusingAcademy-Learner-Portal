/**
 * VoicePracticeLoop.tsx
 * Sprint 16 - P1: Voice Practice with AI Feedback
 * Purpose: Enable learners to practice speaking with immediate AI feedback
 * Target: Qualitative pronunciation and fluency feedback in <10 seconds
 */

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VOICE_CONFIG = {
  maxRecordingDuration: 60,
  minRecordingDuration: 3,
  feedbackDelay: 2000,
  retryLimit: 3,
  xpPerAttempt: 5,
  xpPerPass: 25,
  passingScore: 70
};

interface VoiceFeedback {
  overallScore: number;
  pronunciation: { score: number; issues: { word: string; expected: string; heard: string; }[]; };
  fluency: { score: number; wordsPerMinute: number; pauseCount: number; fillerWords: string[]; };
  grammar: { score: number; corrections: { original: string; corrected: string; explanation: string; }[]; };
  suggestions: string[];
  transcript: string;
}

type RecordingState = 'idle' | 'countdown' | 'recording' | 'processing' | 'feedback';

export function VoicePracticeLoop({ promptText, promptAudio, targetLevel, lessonId, onComplete, evaluationCriteria }: {
  promptText: string; promptAudio?: string; targetLevel: 'A' | 'B' | 'C'; lessonId: string;
  onComplete: (passed: boolean, score: number) => void; evaluationCriteria: string[];
}) {
  const [state, setState] = useState<RecordingState>('idle');
  const [countdown, setCountdown] = useState(3);
  const [recordingTime, setRecordingTime] = useState(0);
  const [feedback, setFeedback] = useState<VoiceFeedback | null>(null);
  const [attempts, setAttempts] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(t => t.stop());
        processRecording(blob);
      };
      setState('countdown');
      setCountdown(3);
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { clearInterval(interval); mediaRecorder.start(); setState('recording'); startTimer(); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (e) { alert('Veuillez autoriser l\'accès au microphone.'); }
  };

  const startTimer = () => {
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => { if (prev >= VOICE_CONFIG.maxRecordingDuration) { stopRecording(); return prev; } return prev + 1; });
    }, 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    setState('processing');
  };

  const processRecording = async (blob: Blob) => {
    setAttempts(prev => prev + 1);
    const formData = new FormData();
    formData.append('audio', blob);
    formData.append('promptText', promptText);
    formData.append('targetLevel', targetLevel);
    const response = await fetch('/api/voice/analyze', { method: 'POST', body: formData });
    const result: VoiceFeedback = await response.json();
    await new Promise(r => setTimeout(r, VOICE_CONFIG.feedbackDelay));
    setFeedback(result);
    setState('feedback');
    if (result.overallScore >= VOICE_CONFIG.passingScore) onComplete(true, result.overallScore);
  };

  const retry = () => { setFeedback(null); setState('idle'); };
  const formatTime = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  return (
    <div className="bg-[#1A1A2E] rounded-2xl p-6 border border-white/10">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Exercice Oral</h3>
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-white/80">{promptText}</p>
          {promptAudio && <button className="mt-3 flex items-center gap-2 text-[#0F3D3E] text-sm">🔊 Écouter l'exemple</button>}
        </div>
      </div>
      <div className="flex flex-col items-center">
        <AnimatePresence mode="wait">
          {state === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startRecording}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-[#E06B2D] flex items-center justify-center shadow-lg">
                <span className="text-4xl">🎤</span>
              </motion.button>
              <p className="mt-4 text-white/60 text-sm">Cliquez pour commencer</p>
            </motion.div>
          )}
          {state === 'countdown' && (
            <motion.div key="countdown" className="text-center">
              <div className="w-24 h-24 rounded-full bg-[#C65A1E]/20 flex items-center justify-center">
                <span className="text-5xl font-bold text-amber-400">{countdown}</span>
              </div>
              <p className="mt-4 text-amber-400">Préparez-vous...</p>
            </motion.div>
          )}
          {state === 'recording' && (
            <motion.div key="recording" className="text-center">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                  <span className="text-4xl">🎤</span>
                </div>
              </motion.div>
              <p className="mt-4 text-red-400 font-mono text-xl">{formatTime(recordingTime)}</p>
              <button onClick={stopRecording} className="mt-4 px-6 py-2 bg-white/10 rounded-lg text-white">Terminer</button>
            </motion.div>
          )}
          {state === 'processing' && (
            <motion.div key="processing" className="text-center">
              <div className="w-24 h-24 rounded-full bg-[#E7F2F2]/20 flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>⏳</motion.div>
              </div>
              <p className="mt-4 text-[#0F3D3E]">Analyse en cours...</p>
            </motion.div>
          )}
          {state === 'feedback' && feedback && (
            <motion.div key="feedback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
              <div className="text-center mb-6">
                <div className={`text-6xl font-bold ${feedback.overallScore >= 70 ? 'text-green-400' : 'text-amber-400'}`}>
                  {feedback.overallScore}%
                </div>
                <p className="text-white/60">{feedback.overallScore >= 70 ? 'Excellent travail!' : 'Continuez vos efforts!'}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-400">{feedback.pronunciation.score}%</p>
                  <p className="text-xs text-white/75">Prononciation</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-400">{feedback.fluency.score}%</p>
                  <p className="text-xs text-white/75">Fluidité</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-[#0F3D3E]">{feedback.grammar.score}%</p>
                  <p className="text-xs text-white/75">Grammaire</p>
                </div>
              </div>
              {feedback.suggestions.length > 0 && (
                <div className="bg-white/5 rounded-xl p-4 mb-4">
                  <h4 className="text-sm font-medium text-white mb-2">Suggestions</h4>
                  <ul className="space-y-1">{feedback.suggestions.map((s, i) => <li key={i} className="text-sm text-white/60">• {s}</li>)}</ul>
                </div>
              )}
              <div className="flex gap-3">
                {attempts < VOICE_CONFIG.retryLimit && feedback.overallScore < VOICE_CONFIG.passingScore && (
                  <button onClick={retry} className="flex-1 py-3 bg-white/10 rounded-xl text-white">Réessayer</button>
                )}
                <button onClick={() => onComplete(feedback.overallScore >= VOICE_CONFIG.passingScore, feedback.overallScore)}
                  className="flex-1 py-3 bg-[#E7F2F2] rounded-xl text-white">Continuer</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
