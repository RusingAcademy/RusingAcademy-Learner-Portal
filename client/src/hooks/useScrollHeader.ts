import { useState, useEffect, useCallback, useRef } from "react";

interface UseScrollHeaderOptions {
  /** Threshold in pixels before header starts hiding (default: 100) */
  threshold?: number;
  /** Minimum scroll delta to trigger hide/show (default: 10) */
  minDelta?: number;
}

interface UseScrollHeaderReturn {
  /** Whether the header should be visible */
  isVisible: boolean;
  /** Whether the page is at the top (for styling purposes) */
  isAtTop: boolean;
}

/**
 * useScrollHeader Hook
 * 
 * Implements the "hide on scroll down / show on scroll up" behavior
 * for the header. This is a Golden Standard UX requirement.
 * 
 * Behavior:
 * - Header is always visible when at the top of the page
 * - Header hides when scrolling down (after threshold)
 * - Header shows immediately when scrolling up
 * - Handles rapid scrolling without jitter
 * - Works on mobile with safe-area considerations
 */
export function useScrollHeader(options: UseScrollHeaderOptions = {}): UseScrollHeaderReturn {
  const { threshold = 100, minDelta = 10 } = options;
  
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const updateHeader = useCallback(() => {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - lastScrollY.current;
    
    // Always show header when at top
    if (currentScrollY <= threshold) {
      setIsVisible(true);
      setIsAtTop(currentScrollY < 10);
      lastScrollY.current = currentScrollY;
      ticking.current = false;
      return;
    }
    
    setIsAtTop(false);
    
    // Only trigger if scroll delta is significant (prevents jitter)
    if (Math.abs(delta) < minDelta) {
      ticking.current = false;
      return;
    }
    
    // Scrolling down - hide header
    if (delta > 0) {
      setIsVisible(false);
    }
    // Scrolling up - show header
    else if (delta < 0) {
      setIsVisible(true);
    }
    
    lastScrollY.current = currentScrollY;
    ticking.current = false;
  }, [threshold, minDelta]);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateHeader);
        ticking.current = true;
      }
    };

    // Set initial state
    lastScrollY.current = window.scrollY;
    setIsAtTop(window.scrollY < 10);
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [updateHeader]);

  return { isVisible, isAtTop };
}

export default useScrollHeader;
