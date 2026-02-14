import { useState, useEffect, useRef, useCallback } from "react";

interface TypewriterTextProps {
  text: string;
  highlightText?: string;
  highlightClassName?: string;
  className?: string;
  speed?: number;
  delay?: number;
  repeatInterval?: number; // Time in ms before restarting animation
  onComplete?: () => void;
}

export default function TypewriterText({
  text,
  highlightText,
  highlightClassName = "text-teal-600",
  className = "",
  speed = 50,
  delay = 500,
  repeatInterval = 4000, // Default 4 seconds
  onComplete,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [cycleKey, setCycleKey] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const prefersReducedMotion = useRef(false);
  const lastSoundTime = useRef(0);

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mediaQuery.matches;

    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Initialize AudioContext lazily
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Play cinematic typewriter sound - more pronounced and realistic
  const playTypeSound = useCallback(() => {
    if (prefersReducedMotion.current) return;

    // Throttle sounds to prevent audio overload
    const now = Date.now();
    if (now - lastSoundTime.current < 30) return;
    lastSoundTime.current = now;

    try {
      const audioContext = getAudioContext();
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      const currentTime = audioContext.currentTime;

      // Create a more cinematic typewriter sound with multiple layers
      
      // Layer 1: Main click/strike sound
      const osc1 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      osc1.connect(gain1);
      gain1.connect(audioContext.destination);
      osc1.type = "square";
      osc1.frequency.setValueAtTime(1200 + Math.random() * 300, currentTime);
      osc1.frequency.exponentialRampToValueAtTime(400, currentTime + 0.02);
      gain1.gain.setValueAtTime(0.15, currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.08);
      osc1.start(currentTime);
      osc1.stop(currentTime + 0.08);

      // Layer 2: Mechanical click
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(2000 + Math.random() * 500, currentTime);
      gain2.gain.setValueAtTime(0.08, currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.03);
      osc2.start(currentTime);
      osc2.stop(currentTime + 0.03);

      // Layer 3: Low thud for impact
      const osc3 = audioContext.createOscillator();
      const gain3 = audioContext.createGain();
      osc3.connect(gain3);
      gain3.connect(audioContext.destination);
      osc3.type = "sine";
      osc3.frequency.setValueAtTime(150 + Math.random() * 50, currentTime);
      gain3.gain.setValueAtTime(0.1, currentTime);
      gain3.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.05);
      osc3.start(currentTime);
      osc3.stop(currentTime + 0.05);

      // Occasional carriage return sound (random chance)
      if (Math.random() < 0.05) {
        const oscReturn = audioContext.createOscillator();
        const gainReturn = audioContext.createGain();
        oscReturn.connect(gainReturn);
        gainReturn.connect(audioContext.destination);
        oscReturn.type = "sawtooth";
        oscReturn.frequency.setValueAtTime(800, currentTime + 0.01);
        oscReturn.frequency.exponentialRampToValueAtTime(200, currentTime + 0.15);
        gainReturn.gain.setValueAtTime(0.05, currentTime + 0.01);
        gainReturn.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.15);
        oscReturn.start(currentTime + 0.01);
        oscReturn.stop(currentTime + 0.15);
      }

    } catch (e) {
      // Silently fail if audio is not available
    }
  }, [getAudioContext]);

  // Full text including highlight
  const fullText = highlightText ? `${text} ${highlightText}` : text;

  // Start typing cycle
  useEffect(() => {
    // If user prefers reduced motion, show full text immediately without animation
    if (prefersReducedMotion.current) {
      setDisplayedText(fullText);
      return;
    }

    // Reset and start typing
    setDisplayedText("");
    setIsTyping(false);

    const startTimeout = setTimeout(() => {
      setIsTyping(true);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [fullText, delay, cycleKey]);

  // Typing animation
  useEffect(() => {
    if (!isTyping || prefersReducedMotion.current) return;

    if (displayedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(fullText.slice(0, displayedText.length + 1));
        playTypeSound();
      }, speed);

      return () => clearTimeout(timeout);
    } else {
      // Typing complete
      setIsTyping(false);
      onComplete?.();

      // Schedule next cycle after repeatInterval
      const repeatTimeout = setTimeout(() => {
        setCycleKey(prev => prev + 1);
      }, repeatInterval);

      return () => clearTimeout(repeatTimeout);
    }
  }, [displayedText, fullText, isTyping, speed, playTypeSound, onComplete, repeatInterval]);

  // Cleanup AudioContext on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Render the text with highlight
  const renderText = () => {
    const isComplete = displayedText.length >= fullText.length;
    
    if (!highlightText) {
      return (
        <>
          {displayedText}
          {!isComplete && <span className="animate-pulse text-teal-500">|</span>}
        </>
      );
    }

    const mainTextLength = text.length;
    const displayedMainText = displayedText.slice(0, mainTextLength);
    const displayedHighlight = displayedText.slice(mainTextLength + 1); // +1 for space

    return (
      <>
        {displayedMainText}
        {displayedText.length > mainTextLength && " "}
        {displayedHighlight && (
          <span className={highlightClassName}>{displayedHighlight}</span>
        )}
        {!isComplete && <span className="animate-pulse text-teal-500">|</span>}
      </>
    );
  };

  return <span className={className}>{renderText()}</span>;
}
