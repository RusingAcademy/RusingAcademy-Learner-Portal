/**
 * VoiceRecorder Component
 * Provides voice recording with playback for oral/speaking exercises.
 * Uses MediaRecorder API for recording and Web Speech API for transcription.
 */
import { useState, useRef, useCallback, useEffect } from "react";

interface VoiceRecorderProps {
  /** Prompt text the user should read/respond to */
  prompt?: string;
  /** Language for speech recognition (default: "en-US") */
  language?: string;
  /** Callback when recording is complete */
  onRecordingComplete?: (blob: Blob, transcript?: string) => void;
  /** Max recording duration in seconds (default: 120) */
  maxDuration?: number;
  /** Show transcription (default: true) */
  showTranscript?: boolean;
}

export function VoiceRecorder({
  prompt,
  language = "en-US",
  onRecordingComplete,
  maxDuration = 120,
  showTranscript = true,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [permissionDenied, setPermissionDenied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, [audioUrl]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((t) => t.stop());
        onRecordingComplete?.(blob, transcript);
      };

      mediaRecorder.start(100); // collect data every 100ms
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      setAudioUrl(null);
      setTranscript("");

      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxDuration - 1) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      // Start speech recognition if available
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition && showTranscript) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language;
        recognition.onresult = (event: any) => {
          let finalTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            finalTranscript += event.results[i][0].transcript;
          }
          setTranscript(finalTranscript);
        };
        recognition.onerror = () => {}; // Silently handle recognition errors
        recognition.start();
        recognitionRef.current = recognition;
      }

      setPermissionDenied(false);
    } catch {
      setPermissionDenied(true);
    }
  }, [language, maxDuration, onRecordingComplete, showTranscript, transcript]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsRecording(false);
    setIsPaused(false);
  }, []);

  const togglePause = useCallback(() => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) {
      mediaRecorderRef.current.resume();
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      mediaRecorderRef.current.pause();
      if (timerRef.current) clearInterval(timerRef.current);
    }
    setIsPaused(!isPaused);
  }, [isPaused]);

  const playRecording = useCallback(() => {
    if (!audioUrl) return;
    if (isPlaying && audioPlaybackRef.current) {
      audioPlaybackRef.current.pause();
      setIsPlaying(false);
      return;
    }
    const audio = new Audio(audioUrl);
    audioPlaybackRef.current = audio;
    audio.onended = () => setIsPlaying(false);
    audio.play();
    setIsPlaying(true);
  }, [audioUrl, isPlaying]);

  const resetRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecordingTime(0);
    setTranscript("");
    setIsPlaying(false);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const progress = (recordingTime / maxDuration) * 100;

  return (
    <div className="glass-card rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="material-icons text-[#008090] text-[20px]">mic</span>
        <h4 className="text-sm font-semibold text-gray-900">Voice Recording</h4>
        {isRecording && (
          <span className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-red-500 font-medium">REC</span>
          </span>
        )}
      </div>

      {/* Prompt */}
      {prompt && (
        <div className="bg-[rgba(0,128,144,0.05)] rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-500 mb-1 font-medium">Read aloud or respond to:</p>
          <p className="text-sm text-gray-800 italic">"{prompt}"</p>
        </div>
      )}

      {/* Permission Denied */}
      {permissionDenied && (
        <div className="bg-red-50 rounded-lg p-3 mb-4 flex items-start gap-2">
          <span className="material-icons text-red-500 text-[18px] mt-0.5">warning</span>
          <div>
            <p className="text-sm text-red-700 font-medium">Microphone access denied</p>
            <p className="text-xs text-red-600 mt-0.5">
              Please allow microphone access in your browser settings to use voice recording.
            </p>
          </div>
        </div>
      )}

      {/* Recording Progress */}
      {isRecording && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{formatTime(recordingTime)}</span>
            <span>{formatTime(maxDuration)}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#008090] to-[#00a0b0] rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Waveform visualization */}
          <div className="flex items-center justify-center gap-[2px] mt-3 h-8">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-[#008090] rounded-full transition-all duration-150"
                style={{
                  height: isPaused ? "4px" : `${4 + Math.random() * 24}px`,
                  opacity: isPaused ? 0.3 : 0.6 + Math.random() * 0.4,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recorded Audio Playback */}
      {audioUrl && !isRecording && (
        <div className="mb-4">
          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
            <button
              onClick={playRecording}
              className="w-10 h-10 rounded-full bg-[#008090] text-white flex items-center justify-center hover:bg-[#006070] transition-colors flex-shrink-0"
            >
              <span className="material-icons text-[20px]">{isPlaying ? "pause" : "play_arrow"}</span>
            </button>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Recording complete</p>
              <p className="text-xs text-gray-500">{formatTime(recordingTime)} recorded</p>
            </div>
            <button
              onClick={resetRecording}
              className="text-xs text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <span className="material-icons text-[14px]">delete</span>
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Transcript */}
      {showTranscript && transcript && (
        <div className="mb-4 bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1 font-medium flex items-center gap-1">
            <span className="material-icons text-[14px]">subtitles</span>
            Live Transcript
          </p>
          <p className="text-sm text-gray-800">{transcript}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {!isRecording && !audioUrl && (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 px-6 py-3 bg-[#008090] text-white rounded-xl font-semibold text-sm hover:bg-[#006070] transition-colors shadow-md"
          >
            <span className="material-icons text-[18px]">mic</span>
            Start Recording
          </button>
        )}
        {isRecording && (
          <>
            <button
              onClick={togglePause}
              className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <span className="material-icons text-[20px]">{isPaused ? "play_arrow" : "pause"}</span>
            </button>
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors shadow-md"
            >
              <span className="material-icons text-[18px]">stop</span>
              Stop Recording
            </button>
          </>
        )}
        {audioUrl && !isRecording && (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 px-6 py-3 bg-[#008090] text-white rounded-xl font-semibold text-sm hover:bg-[#006070] transition-colors"
          >
            <span className="material-icons text-[18px]">refresh</span>
            Record Again
          </button>
        )}
      </div>
    </div>
  );
}
