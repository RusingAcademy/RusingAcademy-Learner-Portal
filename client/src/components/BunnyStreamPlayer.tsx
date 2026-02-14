/**
 * BunnyStreamPlayer
 *
 * Renders a Bunny Stream video using the official iframe embed player.
 * Supports responsive sizing, loading states, and error handling.
 *
 * The embed URL uses the Bunny mediadelivery.net CDN for optimal
 * global performance with adaptive bitrate streaming.
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Loader2, AlertCircle, Play } from "lucide-react";

interface BunnyStreamPlayerProps {
  /** The Bunny Stream video GUID */
  videoId: string;
  /** Title for accessibility */
  title?: string;
  /** Whether to autoplay (default: false) */
  autoplay?: boolean;
  /** Whether to show captions by default */
  captions?: boolean;
  /** Custom CSS class for the container */
  className?: string;
  /** Callback when video starts playing */
  onPlay?: () => void;
  /** Callback when video ends */
  onEnd?: () => void;
}

export function BunnyStreamPlayer({
  videoId,
  title = "Video",
  autoplay = false,
  captions = false,
  className = "",
}: BunnyStreamPlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Fetch video URLs from backend (which has the library ID)
  const { data: urls, isLoading } = trpc.bunnyStream.getUrls.useQuery(
    { videoId },
    { enabled: !!videoId }
  );

  if (isLoading) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-black/90 ${className}`}>
        <div className="flex flex-col items-center gap-2 text-white/70">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-xs">Loading video...</span>
        </div>
      </div>
    );
  }

  if (hasError || !urls) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-black/90 ${className}`}>
        <div className="flex flex-col items-center gap-2 text-white/70">
          <AlertCircle className="w-8 h-8" />
          <span className="text-sm">Video unavailable</span>
        </div>
      </div>
    );
  }

  // Build embed URL with parameters
  const embedParams = new URLSearchParams();
  if (autoplay) embedParams.set("autoplay", "true");
  if (captions) embedParams.set("captions", "true");
  embedParams.set("preload", "true");
  embedParams.set("responsive", "true");

  const embedSrc = `${urls.embedUrl}?${embedParams.toString()}`;

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
              <Play className="w-8 h-8 text-white/80 ml-1" />
            </div>
            <Loader2 className="w-5 h-5 animate-spin text-white/50" />
          </div>
        </div>
      )}

      {/* Bunny Stream iframe embed */}
      <iframe
        src={embedSrc}
        loading="lazy"
        className="w-full h-full border-0"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        title={title}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        style={{ border: "none" }}
      />
    </div>
  );
}

/**
 * BunnyStreamThumbnail
 *
 * Renders a clickable thumbnail for a Bunny Stream video.
 * Used in course cards, activity lists, etc.
 */
export function BunnyStreamThumbnail({
  videoId,
  title = "Video thumbnail",
  className = "",
  onClick,
}: {
  videoId: string;
  title?: string;
  className?: string;
  onClick?: () => void;
}) {
  const { data: urls } = trpc.bunnyStream.getUrls.useQuery(
    { videoId },
    { enabled: !!videoId }
  );

  if (!urls) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <Play className="w-6 h-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div
      className={`relative group cursor-pointer overflow-hidden ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
    >
      <img
        src={urls.thumbnailUrl}
        alt={title}
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
          <Play className="w-5 h-5 text-black ml-0.5" />
        </div>
      </div>
    </div>
  );
}

export default BunnyStreamPlayer;
