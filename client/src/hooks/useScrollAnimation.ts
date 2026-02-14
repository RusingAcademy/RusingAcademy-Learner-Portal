import { useEffect, useRef, useState } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollAnimationOptions = {}
) {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}

// Hook for parallax effect based on scroll position
export function useParallax(speed: number = 0.5) {
  const [offset, setOffset] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      const scrolled = window.scrollY;
      const elementTop = rect.top + scrolled;
      const relativeScroll = scrolled - elementTop + window.innerHeight;
      
      if (relativeScroll > 0 && rect.bottom > 0) {
        setOffset(relativeScroll * speed);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed]);

  return { ref, offset };
}

// Enhanced parallax hook with multiple transform options
interface ParallaxOptions {
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  scale?: boolean;
  rotate?: boolean;
  opacity?: boolean;
}

export function useEnhancedParallax(options: ParallaxOptions = {}) {
  const {
    speed = 0.3,
    direction = 'up',
    scale = false,
    rotate = false,
    opacity = false,
  } = options;

  const [transforms, setTransforms] = useState({
    translateX: 0,
    translateY: 0,
    scale: 1,
    rotate: 0,
    opacity: 1,
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;
    
    const handleScroll = () => {
      if (!ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementCenter = rect.top + rect.height / 2;
      const distanceFromCenter = elementCenter - windowHeight / 2;
      const progress = distanceFromCenter / windowHeight;
      
      // Calculate transforms based on scroll progress
      const offset = progress * speed * 100;
      
      let translateX = 0;
      let translateY = 0;
      
      switch (direction) {
        case 'up':
          translateY = offset;
          break;
        case 'down':
          translateY = -offset;
          break;
        case 'left':
          translateX = offset;
          break;
        case 'right':
          translateX = -offset;
          break;
      }
      
      setTransforms({
        translateX,
        translateY,
        scale: scale ? 1 + Math.abs(progress) * 0.1 : 1,
        rotate: rotate ? progress * 10 : 0,
        opacity: opacity ? Math.max(0.3, 1 - Math.abs(progress) * 0.5) : 1,
      });
    };

    const throttledScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [speed, direction, scale, rotate, opacity]);

  const style: React.CSSProperties = {
    transform: `translate3d(${transforms.translateX}px, ${transforms.translateY}px, 0) scale(${transforms.scale}) rotate(${transforms.rotate}deg)`,
    opacity: transforms.opacity,
    willChange: 'transform, opacity',
    transition: 'transform 0.1s ease-out, opacity 0.1s ease-out',
  };

  return { ref, style, transforms };
}

// Hook for floating orbs with independent parallax
export function useFloatingOrbs(count: number = 3) {
  const [orbStyles, setOrbStyles] = useState<React.CSSProperties[]>(
    Array(count).fill({}).map(() => ({ transform: 'translate3d(0, 0, 0)' }))
  );

  useEffect(() => {
    let rafId: number;
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      const newStyles = Array(count).fill(null).map((_, index) => {
        const speed = 0.1 + (index * 0.05);
        const direction = index % 2 === 0 ? 1 : -1;
        const offset = scrollY * speed * direction;
        const rotation = scrollY * 0.02 * direction;
        
        return {
          transform: `translate3d(${offset * 0.5}px, ${offset}px, 0) rotate(${rotation}deg)`,
          transition: 'transform 0.3s ease-out',
        } as React.CSSProperties;
      });
      
      setOrbStyles(newStyles);
    };

    const throttledScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [count]);

  return orbStyles;
}

// Component wrapper for animated sections
export function useStaggeredAnimation(itemCount: number, baseDelay: number = 100) {
  const [visibleItems, setVisibleItems] = useState<boolean[]>(
    new Array(itemCount).fill(false)
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Stagger the visibility of each item
          visibleItems.forEach((_, index) => {
            setTimeout(() => {
              setVisibleItems(prev => {
                const newState = [...prev];
                newState[index] = true;
                return newState;
              });
            }, index * baseDelay);
          });
          observer.unobserve(container);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(container);

    return () => {
      observer.unobserve(container);
    };
  }, [itemCount, baseDelay]);

  return { containerRef, visibleItems };
}
