import { X } from "lucide-react";
import { useEffect, useCallback } from "react";

interface YouTubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  youtubeUrl: string;
  title?: string;
  subtitle?: string;
}

/**
 * Premium YouTube Modal Component
 * 
 * Technical Method: YouTube iframe embed with privacy-enhanced mode
 * - Uses youtube-nocookie.com domain to prevent tracking cookies
 * - Embedded directly in modal, no external redirection
 * - Autoplay enabled when modal opens
 * - Responsive 16:9 aspect ratio maintained
 * - Keyboard accessible (Escape to close)
 */
export function YouTubeModal({ 
  isOpen, 
  onClose, 
  youtubeUrl, 
  title,
  subtitle 
}: YouTubeModalProps) {
  
  // Extract video ID from various YouTube URL formats
  const getYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const videoId = getYouTubeVideoId(youtubeUrl);
  
  // Privacy-enhanced embed URL with autoplay and minimal branding
  // Parameters:
  // - youtube-nocookie.com: Privacy-enhanced mode (no tracking cookies)
  // - autoplay=1: Start playing immediately
  // - rel=0: Don't show related videos at the end
  // - modestbranding=1: Minimal YouTube logo
  // - playsinline=1: Play inline on mobile (not fullscreen)
  // - iv_load_policy=3: Disable video annotations
  // - color=white: White progress bar (less YouTube branding)
  // - controls=1: Show minimal controls
  const embedUrl = videoId 
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&color=white&controls=1`
    : null;

  // Handle escape key
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen || !embedUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title || "Video player"}
    >
      {/* Premium Backdrop with blur and gradient */}
      <div 
        className="absolute inset-0 animate-in fade-in duration-300"
        onClick={onClose}
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.95) 100%)',
          backdropFilter: 'blur(12px)',
        }}
      />
      
      {/* Decorative ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(20, 184, 166, 0.6) 0%, transparent 70%)' }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(212, 175, 55, 0.5) 0%, transparent 70%)' }}
        />
      </div>
      
      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-5xl animate-in zoom-in-95 fade-in duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 md:-right-12 md:top-0 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200 group"
          aria-label="Close video"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
        </button>

        {/* Video Title */}
        {(title || subtitle) && (
          <div className="mb-4 text-center">
            {title && (
              <h3 className="text-white text-xl md:text-2xl font-bold mb-1">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-white/70 text-sm md:text-base">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Video Container with Glassmorphism Frame */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
          {/* Glassmorphism border effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none z-10" />
          
          {/* 16:9 Aspect Ratio Container */}
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={embedUrl}
              title={title || "YouTube video player"}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>

        {/* Keyboard hint */}
        <p className="text-center text-white/75 text-xs mt-4">
          Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/60">ESC</kbd> to close
        </p>
      </div>
    </div>
  );
}

export default YouTubeModal;
