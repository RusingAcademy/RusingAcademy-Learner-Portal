import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Loader2, Volume2, VolumeX, Play, Pause, RotateCcw } from "lucide-react";

interface SpeakingExerciseProps {
  prompt: string;
  promptFr?: string;
  targetPhrase?: string;
  audioExample?: string;
  tips?: string[];
  tipsFr?: string[];
  language?: "en" | "fr";
  onComplete: (data: { audioBlob?: Blob; duration: number; attempts: number }) => void;
  onSkip?: () => void;
}

export function SpeakingExercise({
  prompt,
  promptFr,
  targetPhrase,
  audioExample,
  tips,
  tipsFr,
  language = "en",
  onComplete,
  onSkip,
}: SpeakingExerciseProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showTips, setShowTips] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Audio generation states
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlayingGenerated, setIsPlayingGenerated] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const generatedAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const displayPrompt = language === "fr" && promptFr ? promptFr : prompt;
  const displayTips = language === "fr" && tipsFr ? tipsFr : tips;
  
  // tRPC mutation for generating pronunciation audio
  const generatePronunciationMutation = trpc.audio.generatePronunciation.useMutation({
    onSuccess: (data) => {
      if (data.audioUrl) {
        setGeneratedAudioUrl(data.audioUrl);
      }
      setIsGeneratingAudio(false);
    },
    onError: (error) => {
      console.error("Error generating audio:", error);
      setIsGeneratingAudio(false);
    },
  });
  
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);
  
  // Generate pronunciation audio for target phrase
  const handleGeneratePronunciation = async () => {
    if (!targetPhrase || isGeneratingAudio) return;
    
    setIsGeneratingAudio(true);
    generatePronunciationMutation.mutate({
      text: targetPhrase,
      voiceGender: "male", // Default to male narrator
      speed: 0.85, // Slightly slower for learning
    });
  };
  
  // Play generated pronunciation audio
  const playGeneratedAudio = () => {
    if (generatedAudioUrl && generatedAudioRef.current) {
      generatedAudioRef.current.play();
      setIsPlayingGenerated(true);
    }
  };
  
  // Pause generated audio
  const pauseGeneratedAudio = () => {
    if (generatedAudioRef.current) {
      generatedAudioRef.current.pause();
      setIsPlayingGenerated(false);
    }
  };
  
  // Replay generated audio from beginning
  const replayGeneratedAudio = () => {
    if (generatedAudioRef.current) {
      generatedAudioRef.current.currentTime = 0;
      generatedAudioRef.current.play();
      setIsPlayingGenerated(true);
    }
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setAttempts(prev => prev + 1);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert(language === "fr" 
        ? "Impossible d'accéder au microphone. Veuillez vérifier vos permissions."
        : "Unable to access microphone. Please check your permissions.");
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };
  
  const handleSubmit = () => {
    if (audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      onComplete({
        audioBlob,
        duration: recordingTime,
        attempts,
      });
    } else {
      onComplete({
        duration: 0,
        attempts,
      });
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0F3D3E] to-[#145A5B] p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🎤</span>
          <h2 className="text-xl font-bold">
            {language === "fr" ? "Exercice oral" : "Speaking Exercise"}
          </h2>
        </div>
        <p className="text-white/80 text-sm">
          {language === "fr" 
            ? "Pratiquez votre prononciation et votre fluidité"
            : "Practice your pronunciation and fluency"}
        </p>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {/* Prompt */}
        <div className="bg-[#E7F2F2] rounded-xl p-4 mb-6">
          <p className="text-sm text-[#0F3D3E] mb-1">
            {language === "fr" ? "Consigne :" : "Prompt:"}
          </p>
          <p className="text-gray-800 font-medium">{displayPrompt}</p>
        </div>
        
        {/* Target Phrase with AI Pronunciation */}
        {targetPhrase && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">
              {language === "fr" ? "Phrase à pratiquer :" : "Phrase to practice:"}
            </p>
            <p className="text-xl font-medium text-gray-900 italic mb-4">"{targetPhrase}"</p>
            
            {/* AI Pronunciation Button */}
            <div className="flex items-center gap-3">
              {!generatedAudioUrl ? (
                <button
                  onClick={handleGeneratePronunciation}
                  disabled={isGeneratingAudio}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#0F3D3E] to-[#145A5B] text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {isGeneratingAudio ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{language === "fr" ? "Génération..." : "Generating..."}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span>{language === "fr" ? "Écouter la prononciation" : "Listen to pronunciation"}</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  {/* Hidden audio element for generated pronunciation */}
                  <audio
                    ref={generatedAudioRef}
                    src={generatedAudioUrl}
                    onEnded={() => setIsPlayingGenerated(false)}
                    className="hidden"
                  />
                  
                  {/* Play/Pause Button */}
                  <button
                    onClick={isPlayingGenerated ? pauseGeneratedAudio : playGeneratedAudio}
                    className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-[#0F3D3E] to-[#145A5B] text-white rounded-full hover:opacity-90 transition-all shadow-md"
                  >
                    {isPlayingGenerated ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5" />
                    )}
                  </button>
                  
                  {/* Replay Button */}
                  <button
                    onClick={replayGeneratedAudio}
                    className="flex items-center justify-center w-10 h-10 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-all"
                    title={language === "fr" ? "Rejouer" : "Replay"}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  
                  <span className="text-sm text-gray-600 ml-2">
                    {language === "fr" ? "Prononciation AI" : "AI Pronunciation"}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Audio Example (if provided externally) */}
        {audioExample && (
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => {
                const audio = new Audio(audioExample);
                audio.play();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span>🔊</span>
              <span>{language === "fr" ? "Écouter l'exemple" : "Listen to example"}</span>
            </button>
          </div>
        )}
        
        {/* Recording Interface */}
        <div className="text-center py-6">
          {!audioUrl ? (
            <>
              {/* Recording Button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                  isRecording 
                    ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                    : "bg-gradient-to-r from-[#0F3D3E] to-[#145A5B] hover:opacity-90"
                } text-white shadow-lg`}
              >
                {isRecording ? (
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                )}
              </button>
              
              {/* Recording Status */}
              <p className="mt-4 text-gray-600">
                {isRecording ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                    {language === "fr" ? "Enregistrement..." : "Recording..."} {formatTime(recordingTime)}
                  </span>
                ) : (
                  language === "fr" ? "Appuyez pour enregistrer" : "Tap to record"
                )}
              </p>
            </>
          ) : (
            <>
              {/* Playback */}
              <div className="bg-gray-100 rounded-xl p-4 mb-4">
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={playRecording}
                    disabled={isPlaying}
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-[#0F3D3E] to-[#145A5B] text-white flex items-center justify-center hover:opacity-90 disabled:opacity-50"
                  >
                    {isPlaying ? (
                      <svg className="w-6 h-6 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                  </button>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">
                      {language === "fr" ? "Votre enregistrement" : "Your recording"}
                    </p>
                    <p className="text-sm text-gray-500">{formatTime(recordingTime)}</p>
                  </div>
                </div>
              </div>
              
              {/* Re-record */}
              <button
                onClick={() => {
                  if (audioUrl) URL.revokeObjectURL(audioUrl);
                  setAudioUrl(null);
                  setRecordingTime(0);
                }}
                className="text-[#0F3D3E] hover:text-[#145A5B] text-sm font-medium"
              >
                🔄 {language === "fr" ? "Réenregistrer" : "Re-record"}
              </button>
            </>
          )}
        </div>
        
        {/* Tips */}
        {displayTips && displayTips.length > 0 && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <button
              onClick={() => setShowTips(!showTips)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
            >
              <span>💡</span>
              <span>{language === "fr" ? "Conseils" : "Tips"}</span>
              <svg 
                className={`w-4 h-4 transition-transform ${showTips ? "rotate-180" : ""}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showTips && (
              <ul className="mt-3 space-y-2">
                {displayTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-[#0F3D3E]">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="border-t border-gray-200 p-4 flex justify-between">
        <button
          onClick={onSkip}
          className="px-4 py-2 text-gray-500 hover:text-gray-700"
        >
          {language === "fr" ? "Passer" : "Skip"}
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={!audioUrl}
          className="px-6 py-2 bg-gradient-to-r from-[#0F3D3E] to-[#145A5B] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {language === "fr" ? "Soumettre" : "Submit"}
        </button>
      </div>
    </div>
  );
}

export default SpeakingExercise;
