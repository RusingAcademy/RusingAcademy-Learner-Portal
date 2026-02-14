/**
 * Pronunciation Lab — Practice pronunciation with model audio and recording
 */
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

const EXERCISES_BY_LEVEL = {
  A1: [
    { phrase: "Bonjour, comment allez-vous?", translation: "Hello, how are you?", ipa: "/bɔ̃.ʒuʁ kɔ.mɑ̃ ta.le vu/" },
    { phrase: "Je m'appelle...", translation: "My name is...", ipa: "/ʒə ma.pɛl/" },
    { phrase: "Merci beaucoup", translation: "Thank you very much", ipa: "/mɛʁ.si bo.ku/" },
    { phrase: "S'il vous plaît", translation: "Please", ipa: "/sil vu plɛ/" },
    { phrase: "Excusez-moi", translation: "Excuse me", ipa: "/ɛk.sky.ze mwa/" },
  ],
  A2: [
    { phrase: "Je travaille au gouvernement fédéral", translation: "I work at the federal government", ipa: "/ʒə tʁa.vaj o ɡu.vɛʁ.nə.mɑ̃ fe.de.ʁal/" },
    { phrase: "Pourriez-vous répéter, s'il vous plaît?", translation: "Could you repeat, please?", ipa: "/pu.ʁje vu ʁe.pe.te sil vu plɛ/" },
    { phrase: "J'aimerais prendre rendez-vous", translation: "I would like to make an appointment", ipa: "/ʒɛ.mə.ʁɛ pʁɑ̃dʁ ʁɑ̃.de.vu/" },
    { phrase: "Quelle est votre disponibilité?", translation: "What is your availability?", ipa: "/kɛl ɛ vɔtʁ dis.pɔ.ni.bi.li.te/" },
  ],
  B1: [
    { phrase: "Je souhaiterais discuter de ce dossier avec vous", translation: "I would like to discuss this file with you", ipa: "/ʒə su.ɛ.tə.ʁɛ dis.ky.te də sə dɔ.sje a.vɛk vu/" },
    { phrase: "Nous devons respecter les échéances", translation: "We must respect the deadlines", ipa: "/nu də.vɔ̃ ʁɛs.pɛk.te lez‿e.ʃe.ɑ̃s/" },
    { phrase: "La réunion aura lieu mardi prochain", translation: "The meeting will take place next Tuesday", ipa: "/la ʁe.y.njɔ̃ o.ʁa ljø maʁ.di pʁɔ.ʃɛ̃/" },
  ],
  B2: [
    { phrase: "Il faudrait envisager une approche plus nuancée", translation: "We should consider a more nuanced approach", ipa: "/il fo.dʁɛ ɑ̃.vi.za.ʒe yn‿a.pʁɔʃ ply ny.ɑ̃.se/" },
    { phrase: "Les résultats de l'évaluation sont encourageants", translation: "The evaluation results are encouraging", ipa: "/le ʁe.zyl.ta də le.va.ly.a.sjɔ̃ sɔ̃t‿ɑ̃.ku.ʁa.ʒɑ̃/" },
    { phrase: "Conformément aux directives du Conseil du Trésor", translation: "In accordance with Treasury Board directives", ipa: "/kɔ̃.fɔʁ.me.mɑ̃ o di.ʁɛk.tiv dy kɔ̃.sɛj dy tʁe.zɔʁ/" },
  ],
  C1: [
    { phrase: "La mise en œuvre de cette politique nécessite une collaboration interministérielle", translation: "The implementation of this policy requires interdepartmental collaboration", ipa: "/la miz‿ɑ̃ œvʁ də sɛt pɔ.li.tik ne.sɛ.sit yn kɔ.la.bɔ.ʁa.sjɔ̃ ɛ̃.tɛʁ.mi.nis.te.ʁjɛl/" },
    { phrase: "Il conviendrait d'approfondir l'analyse des répercussions budgétaires", translation: "It would be appropriate to deepen the analysis of budgetary impacts", ipa: "/il kɔ̃.vjɛ̃.dʁɛ da.pʁɔ.fɔ̃.diʁ la.na.liz de ʁe.pɛʁ.ky.sjɔ̃ by.dʒe.tɛʁ/" },
  ],
};

export default function PronunciationLab() {
  const { user } = useAuth();
  const [level, setLevel] = useState<keyof typeof EXERCISES_BY_LEVEL>("A2");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [practiceCount, setPracticeCount] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const exercises = EXERCISES_BY_LEVEL[level];
  const current = exercises[currentIndex];

  const speakPhrase = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(current.phrase);
      utterance.lang = "fr-CA";
      utterance.rate = 0.85;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Text-to-speech not supported in this browser");
    }
  }, [current.phrase]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecordedUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
      setPracticeCount(c => c + 1);
    } catch {
      toast.error("Microphone access denied. Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const nextExercise = () => {
    setCurrentIndex((i) => (i + 1) % exercises.length);
    setRecordedUrl(null);
  };

  const prevExercise = () => {
    setCurrentIndex((i) => (i - 1 + exercises.length) % exercises.length);
    setRecordedUrl(null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pronunciation Lab</h1>
            <p className="text-sm text-gray-500 mt-1">Listen, practice, and perfect your French pronunciation</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#008090]/10 rounded-full">
            <span className="material-icons text-[#008090] text-[16px]">mic</span>
            <span className="text-xs font-semibold text-[#008090]">{practiceCount} practices</span>
          </div>
        </div>

        {/* Level Selector */}
        <div className="flex gap-2 mb-6">
          {(Object.keys(EXERCISES_BY_LEVEL) as Array<keyof typeof EXERCISES_BY_LEVEL>).map((l) => (
            <button
              key={l}
              onClick={() => { setLevel(l); setCurrentIndex(0); setRecordedUrl(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                level === l
                  ? "bg-[#008090] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Exercise Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Exercise {currentIndex + 1} of {exercises.length}</span>
            <span className="px-2 py-0.5 bg-[#008090]/10 text-[#008090] rounded-full text-[10px] font-semibold">Level {level}</span>
          </div>

          {/* Phrase */}
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{current.phrase}</h2>
            <p className="text-sm text-gray-500 mb-1">{current.translation}</p>
            <p className="text-xs text-[#008090] font-mono">{current.ipa}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={speakPhrase}
              disabled={isPlaying}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#008090] to-[#006d7a] text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
            >
              <span className="material-icons">{isPlaying ? "volume_up" : "play_arrow"}</span>
              {isPlaying ? "Playing..." : "Listen"}
            </button>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all shadow-sm ${
                isRecording
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-white border-2 border-[#008090] text-[#008090] hover:bg-[#008090]/5"
              }`}
            >
              <span className="material-icons">{isRecording ? "stop" : "mic"}</span>
              {isRecording ? "Stop" : "Record"}
            </button>
          </div>

          {/* Recorded Audio Playback */}
          {recordedUrl && (
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="material-icons text-[#008090]">headphones</span>
                <span className="text-sm text-gray-600 flex-1">Your recording</span>
                <audio src={recordedUrl} controls className="h-8" />
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={speakPhrase} className="flex-1 text-xs text-[#008090] bg-[#008090]/5 rounded-lg py-2 hover:bg-[#008090]/10 transition-colors">
                  <span className="material-icons text-[14px] align-middle mr-1">compare_arrows</span>Compare with model
                </button>
                <button onClick={startRecording} className="flex-1 text-xs text-gray-600 bg-gray-100 rounded-lg py-2 hover:bg-gray-200 transition-colors">
                  <span className="material-icons text-[14px] align-middle mr-1">replay</span>Try again
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button onClick={prevExercise} className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#008090] transition-colors">
              <span className="material-icons text-[18px]">chevron_left</span> Previous
            </button>
            <div className="flex gap-1">
              {exercises.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex ? "bg-[#008090]" : "bg-gray-200"}`} />
              ))}
            </div>
            <button onClick={nextExercise} className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#008090] transition-colors">
              Next <span className="material-icons text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-r from-[#008090]/5 to-[#006d7a]/5 border border-[#008090]/20 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[#008090] mb-2 flex items-center gap-1">
            <span className="material-icons text-[16px]">tips_and_updates</span> Pronunciation Tips
          </h3>
          <ul className="space-y-1 text-xs text-gray-600">
            <li>• Listen to the model pronunciation first, then try to imitate it</li>
            <li>• Pay attention to nasal vowels (on, an, in) — they are unique to French</li>
            <li>• Practice the French "r" sound (uvular fricative) — it comes from the back of the throat</li>
            <li>• Record yourself and compare with the model to identify areas for improvement</li>
            <li>• Slow down and focus on accuracy before building speed</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
