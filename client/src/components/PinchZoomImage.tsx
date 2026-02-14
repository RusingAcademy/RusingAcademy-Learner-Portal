import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface PinchZoomImageProps {
  src: string;
  alt: string;
  onClose: () => void;
  language?: string;
}

interface TouchPoint {
  x: number;
  y: number;
}

export default function PinchZoomImage({ src, alt, onClose, language = "en" }: PinchZoomImageProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Touch tracking
  const lastTouchDistance = useRef<number | null>(null);
  const lastTouchCenter = useRef<TouchPoint | null>(null);
  const lastPosition = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const lastMoveTime = useRef<number>(0);

  const MIN_SCALE = 1;
  const MAX_SCALE = 5;

  // Calculate distance between two touch points
  const getTouchDistance = (touches: React.TouchList): number => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Calculate center point between two touches
  const getTouchCenter = (touches: React.TouchList): TouchPoint => {
    if (touches.length < 2) {
      return { x: touches[0].clientX, y: touches[0].clientY };
    }
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  };

  // Clamp position to keep image in bounds
  const clampPosition = useCallback((pos: { x: number; y: number }, currentScale: number) => {
    if (!containerRef.current || !imageRef.current) return pos;
    
    const container = containerRef.current.getBoundingClientRect();
    const imgWidth = imageRef.current.naturalWidth;
    const imgHeight = imageRef.current.naturalHeight;
    
    // Calculate displayed image dimensions
    const aspectRatio = imgWidth / imgHeight;
    let displayWidth, displayHeight;
    
    if (container.width / container.height > aspectRatio) {
      displayHeight = container.height;
      displayWidth = displayHeight * aspectRatio;
    } else {
      displayWidth = container.width;
      displayHeight = displayWidth / aspectRatio;
    }
    
    const scaledWidth = displayWidth * currentScale;
    const scaledHeight = displayHeight * currentScale;
    
    const maxX = Math.max(0, (scaledWidth - container.width) / 2);
    const maxY = Math.max(0, (scaledHeight - container.height) / 2);
    
    return {
      x: Math.max(-maxX, Math.min(maxX, pos.x)),
      y: Math.max(-maxY, Math.min(maxY, pos.y)),
    };
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 2) {
      // Pinch zoom start
      lastTouchDistance.current = getTouchDistance(e.touches);
      lastTouchCenter.current = getTouchCenter(e.touches);
    } else if (e.touches.length === 1) {
      // Pan start
      setIsDragging(true);
      lastTouchCenter.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastPosition.current = { ...position };
      velocity.current = { x: 0, y: 0 };
      lastMoveTime.current = Date.now();
    }
  }, [position]);

  // Handle touch move
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 2 && lastTouchDistance.current !== null) {
      // Pinch zoom
      const newDistance = getTouchDistance(e.touches);
      const newCenter = getTouchCenter(e.touches);
      
      const scaleFactor = newDistance / lastTouchDistance.current;
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * scaleFactor));
      
      // Adjust position to zoom toward pinch center
      if (lastTouchCenter.current && containerRef.current) {
        const container = containerRef.current.getBoundingClientRect();
        const centerX = newCenter.x - container.left - container.width / 2;
        const centerY = newCenter.y - container.top - container.height / 2;
        
        const scaleChange = newScale / scale;
        const newPosition = {
          x: position.x * scaleChange + centerX * (1 - scaleChange),
          y: position.y * scaleChange + centerY * (1 - scaleChange),
        };
        
        setPosition(clampPosition(newPosition, newScale));
      }
      
      setScale(newScale);
      lastTouchDistance.current = newDistance;
      lastTouchCenter.current = newCenter;
    } else if (e.touches.length === 1 && isDragging && lastTouchCenter.current) {
      // Pan
      const currentTime = Date.now();
      const deltaTime = currentTime - lastMoveTime.current;
      
      const deltaX = e.touches[0].clientX - lastTouchCenter.current.x;
      const deltaY = e.touches[0].clientY - lastTouchCenter.current.y;
      
      if (deltaTime > 0) {
        velocity.current = {
          x: deltaX / deltaTime * 16,
          y: deltaY / deltaTime * 16,
        };
      }
      
      const newPosition = {
        x: lastPosition.current.x + deltaX,
        y: lastPosition.current.y + deltaY,
      };
      
      setPosition(clampPosition(newPosition, scale));
      lastMoveTime.current = currentTime;
    }
  }, [scale, position, isDragging, clampPosition]);

  // Handle touch end
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      setIsDragging(false);
      lastTouchDistance.current = null;
      lastTouchCenter.current = null;
      
      // Apply momentum scrolling
      if (Math.abs(velocity.current.x) > 0.5 || Math.abs(velocity.current.y) > 0.5) {
        const applyMomentum = () => {
          velocity.current.x *= 0.95;
          velocity.current.y *= 0.95;
          
          if (Math.abs(velocity.current.x) > 0.1 || Math.abs(velocity.current.y) > 0.1) {
            setPosition(prev => clampPosition({
              x: prev.x + velocity.current.x,
              y: prev.y + velocity.current.y,
            }, scale));
            requestAnimationFrame(applyMomentum);
          }
        };
        requestAnimationFrame(applyMomentum);
      }
    } else if (e.touches.length === 1) {
      // Switched from pinch to pan
      lastTouchCenter.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastPosition.current = { ...position };
      setIsDragging(true);
    }
  }, [position, scale, clampPosition]);

  // Handle double tap to reset or zoom
  const lastTapTime = useRef<number>(0);
  const handleDoubleTap = useCallback((e: React.TouchEvent) => {
    const currentTime = Date.now();
    const tapLength = currentTime - lastTapTime.current;
    
    if (tapLength < 300 && tapLength > 0) {
      e.preventDefault();
      
      if (scale > 1.5) {
        // Reset to original
        setScale(1);
        setPosition({ x: 0, y: 0 });
      } else {
        // Zoom to 2.5x at tap point
        if (containerRef.current) {
          const container = containerRef.current.getBoundingClientRect();
          const tapX = e.changedTouches[0].clientX - container.left - container.width / 2;
          const tapY = e.changedTouches[0].clientY - container.top - container.height / 2;
          
          const newScale = 2.5;
          const scaleChange = newScale / scale;
          
          setScale(newScale);
          setPosition(clampPosition({
            x: position.x * scaleChange - tapX * (scaleChange - 1),
            y: position.y * scaleChange - tapY * (scaleChange - 1),
          }, newScale));
        }
      }
    }
    
    lastTapTime.current = currentTime;
  }, [scale, position, clampPosition]);

  // Handle mouse wheel zoom for desktop
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    const delta = -e.deltaY * 0.001;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * (1 + delta)));
    
    if (containerRef.current) {
      const container = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - container.left - container.width / 2;
      const mouseY = e.clientY - container.top - container.height / 2;
      
      const scaleChange = newScale / scale;
      const newPosition = {
        x: position.x * scaleChange + mouseX * (1 - scaleChange),
        y: position.y * scaleChange + mouseY * (1 - scaleChange),
      };
      
      setPosition(clampPosition(newPosition, newScale));
    }
    
    setScale(newScale);
  }, [scale, position, clampPosition]);

  // Reset on image change
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [src]);

  // Prevent default touch behavior on container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const preventDefault = (e: TouchEvent) => e.preventDefault();
    container.addEventListener('touchmove', preventDefault, { passive: false });
    
    return () => {
      container.removeEventListener('touchmove', preventDefault);
    };
  }, []);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-xl touch-none"
      onClick={(e) => {
        if (e.target === containerRef.current) onClose();
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={(e) => {
        handleTouchEnd(e);
        handleDoubleTap(e);
      }}
      onWheel={handleWheel}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-20"
        aria-label="Close"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Instructions - Desktop */}
      <div className="hidden md:flex absolute top-6 left-6 items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm z-20">
        <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
        <span className="text-sm text-white/80">
          {language === "en" ? "Scroll to zoom • Drag to pan • Click outside to close" : "Défilez pour zoomer • Glissez pour déplacer • Cliquez dehors pour fermer"}
        </span>
      </div>

      {/* Instructions - Mobile */}
      <div className="flex md:hidden absolute top-4 left-4 items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm z-20">
        <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
        <span className="text-xs text-white/80">
          {language === "en" ? "Pinch to zoom • Double-tap to reset" : "Pincez pour zoomer • Double-tap pour réinitialiser"}
        </span>
      </div>

      {/* Zoom Level Indicator */}
      {scale > 1.1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm z-20">
          <span className="text-sm font-medium text-white">{Math.round(scale * 100)}%</span>
        </div>
      )}

      {/* Image Container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        style={{ cursor: scale > 1 ? 'grab' : 'default' }}
      >
        <img
          loading="lazy" ref={imageRef}
          src={src}
          alt={alt}
          className="max-w-full max-h-full object-contain select-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          draggable={false}
        />
      </motion.div>

      {/* Reset Button - Visible when zoomed */}
      {scale > 1.1 && (
        <button
          onClick={() => {
            setScale(1);
            setPosition({ x: 0, y: 0 });
          }}
          className="absolute bottom-4 right-4 md:bottom-6 md:right-6 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 flex items-center gap-2 transition-colors z-20"
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-sm text-white">
            {language === "en" ? "Reset" : "Réinitialiser"}
          </span>
        </button>
      )}
    </motion.div>
  );
}
