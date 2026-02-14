import { useState, useRef, useCallback } from "react";

export type RecordingState = "idle" | "recording" | "processing" | "error";

interface UseAudioRecorderOptions {
  onRecordingComplete?: (audioBlob: Blob, audioUrl: string) => void;
  onError?: (error: Error) => void;
  maxDuration?: number; // Maximum recording duration in seconds
}

interface UseAudioRecorderReturn {
  state: RecordingState;
  isRecording: boolean;
  isProcessing: boolean;
  duration: number;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  cancelRecording: () => void;
  audioUrl: string | null;
  audioBlob: Blob | null;
  error: Error | null;
}

export function useAudioRecorder(
  options: UseAudioRecorderOptions = {}
): UseAudioRecorderReturn {
  const { onRecordingComplete, onError, maxDuration = 120 } = options;

  const [state, setState] = useState<RecordingState>("idle");
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const cleanup = useCallback(() => {
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;

    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Clear chunks
    chunksRef.current = [];
  }, []);

  const startRecording = useCallback(async () => {
    try {
      // Reset state
      setError(null);
      setAudioUrl(null);
      setAudioBlob(null);
      setDuration(0);
      chunksRef.current = [];

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });
      streamRef.current = stream;

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        setState("processing");

        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);

        setAudioBlob(blob);
        setAudioUrl(url);
        setState("idle");

        if (onRecordingComplete) {
          onRecordingComplete(blob, url);
        }

        cleanup();
      };

      // Handle errors
      mediaRecorder.onerror = (event) => {
        const err = new Error("Recording failed");
        setError(err);
        setState("error");
        if (onError) {
          onError(err);
        }
        cleanup();
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setState("recording");
      startTimeRef.current = Date.now();

      // Start duration timer
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);

        // Auto-stop at max duration
        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 1000);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to start recording");
      setError(error);
      setState("error");
      if (onError) {
        onError(error);
      }
    }
  }, [cleanup, maxDuration, onError, onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const cancelRecording = useCallback(() => {
    cleanup();
    setState("idle");
    setDuration(0);
    setAudioUrl(null);
    setAudioBlob(null);
  }, [cleanup]);

  return {
    state,
    isRecording: state === "recording",
    isProcessing: state === "processing",
    duration,
    startRecording,
    stopRecording,
    cancelRecording,
    audioUrl,
    audioBlob,
    error,
  };
}

/**
 * Format duration in seconds to MM:SS format
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
