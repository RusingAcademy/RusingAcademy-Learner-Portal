import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Voice Activity Detection (VAD) Recorder
 * 
 * Always-on microphone that automatically detects when the user starts and stops speaking.
 * Uses Web Audio API AnalyserNode to monitor audio levels in real-time.
 * 
 * Flow:
 * 1. openMic() → starts listening (mic always on)
 * 2. User speaks → VAD detects voice → starts recording
 * 3. User stops speaking → silence detected → stops recording → returns audioBlob
 * 4. Loop: automatically resumes listening for next utterance
 */

interface UseVADRecorderOptions {
  /** RMS threshold above which speech is detected (0-1). Default: 0.015 */
  speechThreshold?: number;
  /** Duration of silence (ms) before considering speech ended. Default: 1500 */
  silenceTimeout?: number;
  /** Minimum speech duration (ms) to be considered valid. Default: 500 */
  minSpeechDuration?: number;
  /** Maximum recording duration (seconds). Default: 120 */
  maxDuration?: number;
  /** Called when a complete utterance is captured */
  onUtterance?: (blob: Blob) => void;
  /** Called on error */
  onError?: (error: Error) => void;
}

type VADState = "closed" | "listening" | "speaking" | "processing";

interface UseVADRecorderReturn {
  state: VADState;
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  audioLevel: number; // 0-1, current mic input level for visualization
  openMic: () => Promise<void>;
  closeMic: () => void;
  pauseMic: () => void;
  resumeMic: () => void;
  error: Error | null;
}

export function useVADRecorder(
  options: UseVADRecorderOptions = {}
): UseVADRecorderReturn {
  const {
    speechThreshold = 0.012,
    silenceTimeout = 800,
    minSpeechDuration = 300,
    maxDuration = 30,
    onUtterance,
    onError,
  } = options;

  const [state, setState] = useState<VADState>("closed");
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  // Refs for audio pipeline
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const rafRef = useRef<number | null>(null);

  // Refs for VAD timing
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speechStartRef = useRef<number>(0);
  const maxDurationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pausedRef = useRef(false);
  const stateRef = useRef<VADState>("closed");

  // Keep stateRef in sync
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Cleanup everything
  const cleanup = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (maxDurationTimerRef.current) {
      clearTimeout(maxDurationTimerRef.current);
      maxDurationTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try { audioContextRef.current.close(); } catch {}
    }
    audioContextRef.current = null;
    analyserRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  // Start recording an utterance
  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/webm")
      ? "audio/webm"
      : "audio/mp4";

    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      chunksRef.current = [];

      // Only emit if speech was long enough
      const speechDuration = Date.now() - speechStartRef.current;
      if (speechDuration >= minSpeechDuration && blob.size > 0) {
        setState("processing");
        onUtterance?.(blob);
      } else {
        // Too short — resume listening
        if (stateRef.current !== "closed") {
          setState("listening");
        }
      }
    };

    recorder.start(100); // collect chunks every 100ms for faster processing
    speechStartRef.current = Date.now();
    setState("speaking");

    // Max duration safety
    maxDurationTimerRef.current = setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    }, maxDuration * 1000);
  }, [minSpeechDuration, maxDuration, onUtterance]);

  // Stop current recording
  const stopRecording = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (maxDurationTimerRef.current) {
      clearTimeout(maxDurationTimerRef.current);
      maxDurationTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // Monitor audio levels with requestAnimationFrame
  const monitorAudio = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Float32Array(analyser.fftSize);

    const tick = () => {
      if (!analyserRef.current || pausedRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      analyser.getFloatTimeDomainData(dataArray);

      // Calculate RMS
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / dataArray.length);
      setAudioLevel(Math.min(rms * 5, 1)); // Scale for visualization

      const currentState = stateRef.current;

      if (currentState === "listening") {
        // Detect speech start
        if (rms > speechThreshold) {
          startRecording();
        }
      } else if (currentState === "speaking") {
        // Detect silence
        if (rms < speechThreshold) {
          if (!silenceTimerRef.current) {
            silenceTimerRef.current = setTimeout(() => {
              silenceTimerRef.current = null;
              stopRecording();
            }, silenceTimeout);
          }
        } else {
          // Speech resumed — cancel silence timer
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [speechThreshold, silenceTimeout, startRecording, stopRecording]);

  // Open microphone — start always-on listening
  const openMic = useCallback(async () => {
    try {
      setError(null);
      pausedRef.current = false;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });
      streamRef.current = stream;

      // Set up Web Audio API for level monitoring
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.2;
      source.connect(analyser);
      analyserRef.current = analyser;

      setState("listening");
      monitorAudio();
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Microphone access denied");
      setError(e);
      setState("closed");
      onError?.(e);
    }
  }, [monitorAudio, onError]);

  // Close microphone — stop everything
  const closeMic = useCallback(() => {
    cleanup();
    setState("closed");
    pausedRef.current = false;
  }, [cleanup]);

  // Pause listening (when coach is speaking)
  const pauseMic = useCallback(() => {
    pausedRef.current = true;
    // Stop any active recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (stateRef.current !== "closed" && stateRef.current !== "processing") {
      setState("listening");
    }
  }, []);

  // Resume listening (after coach finishes speaking)
  const resumeMic = useCallback(() => {
    pausedRef.current = false;
    if (stateRef.current !== "closed") {
      setState("listening");
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    state,
    isListening: state === "listening",
    isSpeaking: state === "speaking",
    isProcessing: state === "processing",
    audioLevel,
    openMic,
    closeMic,
    pauseMic,
    resumeMic,
    error,
  };
}
