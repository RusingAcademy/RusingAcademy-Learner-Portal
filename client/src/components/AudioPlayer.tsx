/**
 * AudioPlayer Component
 * Provides audio playback with controls for listening exercises.
 * Uses Web Speech API for text-to-speech when no audio file is available.
 */
import { useState, useRef, useEffect, useCallback } from "react";

interface AudioPlayerProps {
  /** URL of the audio file to play */
  audioUrl?: string;
  /** Text to read aloud via TTS if no audio URL */
  text?: string;
  /** Language for TTS (default: "en-US") */
  language?: string;
  /** Title displayed above the player */
  title?: string;
  /** Compact mode for inline usage */
  compact?: boolean;
}

export function AudioPlayer({ audioUrl, text, language = "en-US", title, compact = false }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isTTS, setIsTTS] = useState(false);

  useEffect(() => {
    if (!audioUrl && text) {
      setIsTTS(true);
    }
  }, [audioUrl, text]);

  // Audio element event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioUrl]);

  const togglePlay = useCallback(() => {
    if (isTTS && text) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.rate = playbackRate;
        utterance.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isTTS, text, language, playbackRate, isPlaying]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const changeSpeed = () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const idx = speeds.indexOf(playbackRate);
    const next = speeds[(idx + 1) % speeds.length];
    setPlaybackRate(next);
    if (audioRef.current) {
      audioRef.current.playbackRate = next;
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
        {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}
        <button
          onClick={togglePlay}
          className="w-9 h-9 rounded-full bg-[#008090] text-white flex items-center justify-center hover:bg-[#006070] transition-colors flex-shrink-0"
        >
          <span className="material-icons text-[18px]">{isPlaying ? "pause" : "play_arrow"}</span>
        </button>
        {!isTTS && (
          <div className="flex-1 flex items-center gap-2">
            <span className="text-[10px] text-gray-500 w-8 text-right">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 accent-[#008090] cursor-pointer"
            />
            <span className="text-[10px] text-gray-500 w-8">{formatTime(duration)}</span>
          </div>
        )}
        {isTTS && (
          <span className="text-xs text-gray-500 flex-1">
            {isPlaying ? "Speaking..." : "Click play to listen"}
          </span>
        )}
        <button
          onClick={changeSpeed}
          className="text-[10px] font-bold text-[#008090] bg-[rgba(0,128,144,0.1)] px-2 py-1 rounded-md hover:bg-[rgba(0,128,144,0.2)] transition-colors"
        >
          {playbackRate}x
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-4">
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}
      {title && (
        <div className="flex items-center gap-2 mb-3">
          <span className="material-icons text-[#008090] text-[20px]">headphones</span>
          <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
        </div>
      )}
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-[#008090] text-white flex items-center justify-center hover:bg-[#006070] transition-colors shadow-md flex-shrink-0"
        >
          <span className="material-icons text-[24px]">{isPlaying ? "pause" : "play_arrow"}</span>
        </button>
        <div className="flex-1">
          {!isTTS ? (
            <>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 accent-[#008090] cursor-pointer"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-gray-500">{formatTime(currentTime)}</span>
                <span className="text-[10px] text-gray-500">{formatTime(duration)}</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className={`flex gap-1 ${isPlaying ? "animate-pulse" : ""}`}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-1 bg-[#008090] rounded-full"
                    style={{
                      height: isPlaying ? `${8 + Math.random() * 16}px` : "4px",
                      transition: "height 0.2s ease",
                    }}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-2">
                {isPlaying ? "Reading aloud..." : "Text-to-Speech ready"}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={changeSpeed}
          className="text-xs font-bold text-[#008090] bg-[rgba(0,128,144,0.1)] px-3 py-1.5 rounded-lg hover:bg-[rgba(0,128,144,0.2)] transition-colors"
        >
          {playbackRate}x
        </button>
      </div>
    </div>
  );
}
