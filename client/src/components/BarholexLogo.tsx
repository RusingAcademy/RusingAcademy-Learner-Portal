import { motion } from "framer-motion";

interface BarholexLogoProps {
  size?: number;
  showText?: boolean;
  theme?: "glass" | "light";
  className?: string;
  variant?: "full" | "icon" | "square";
}

/**
 * Barholex Media Official Logo Component
 * Uses the official brand logo images
 */
export default function BarholexLogo({ 
  size = 60, 
  showText = true, 
  theme = "glass",
  className = "",
  variant = "full"
}: BarholexLogoProps) {
  
  // Select the appropriate logo based on variant and theme
  const getLogoSrc = () => {
    if (variant === "icon") {
      return "https://rusingacademy-cdn.b-cdn.net/images/logos/barholex_icon.png";
    }
    if (variant === "square") {
      return "https://rusingacademy-cdn.b-cdn.net/images/logos/barholex_logo_variant_square.png";
    }
    // Full logo - use appropriate version based on theme
    return theme === "glass" 
      ? "https://rusingacademy-cdn.b-cdn.net/images/logos/barholex_logo_variant_square.png"
      : "https://rusingacademy-cdn.b-cdn.net/images/logos/barholex_logo_variant_white_background.webp";
  };
  
  return (
    <motion.div 
      className={`flex items-center gap-3 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Official Logo Image */}
      <img 
        loading="lazy" src={getLogoSrc()}
        alt="Barholex Media Logo"
        style={{ 
          height: size,
          width: "auto",
          objectFit: "contain",
          filter: theme === "glass" ? "drop-shadow(0 4px 20px rgba(212, 168, 83, 0.4))" : "none"
        }}
      />
      
      {/* Text with premium styling - only show if using icon variant */}
      {showText && variant === "icon" && (
        <div className="flex flex-col">
          <span 
            className="font-bold tracking-wider text-lg leading-tight"
            style={{ 
              background: "linear-gradient(135deg, #F5D78E 0%, #D4A853 30%, #B8860B 70%, #8B6914 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: theme === "glass" ? "0 2px 10px rgba(212, 168, 83, 0.3)" : "none",
            }}
          >
            BARHOLEX
          </span>
          <span 
            className="text-xs tracking-[0.3em] font-medium"
            style={{ 
              color: theme === "glass" ? "rgba(212, 168, 83, 0.7)" : "#B8860B",
            }}
          >
            MEDIA
          </span>
        </div>
      )}
    </motion.div>
  );
}
