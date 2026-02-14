import { motion } from "framer-motion";

interface LingeefyLogoProps {
  size?: number;
  showText?: boolean;
  theme?: "glass" | "light";
  className?: string;
  variant?: "full" | "icon" | "monochrome";
}

/**
 * Lingueefy Official Logo Component
 * Uses the official brand logo images
 */
export default function LingeefyLogo({ 
  size = 60, 
  showText = true, 
  theme = "glass",
  className = "",
  variant = "full"
}: LingeefyLogoProps) {
  
  // Select the appropriate logo based on variant and theme
  const getLogoSrc = () => {
    if (variant === "icon") {
      return "https://rusingacademy-cdn.b-cdn.net/images/logos/lingueefy_variant_icon_only.png";
    }
    if (variant === "monochrome") {
      return "https://rusingacademy-cdn.b-cdn.net/images/logos/lingueefy_variant_monochrome_dark.png";
    }
    // Full logo - use glass version for dark theme, corrected for light
    return theme === "glass" 
      ? "https://rusingacademy-cdn.b-cdn.net/images/logos/lingueefy-glass-v2.png"
      : "https://rusingacademy-cdn.b-cdn.net/images/logos/lingueefy_logo_design_3_corrected.png";
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
        alt="Lingueefy Logo"
        style={{ 
          height: size,
          width: "auto",
          objectFit: "contain",
          filter: theme === "glass" ? "drop-shadow(0 4px 20px rgba(23, 226, 198, 0.4))" : "none"
        }}
      />
      
      {/* Text with premium styling - only show if not using full logo which includes text */}
      {showText && variant === "icon" && (
        <div className="flex flex-col">
          <span 
            className="font-black tracking-wide text-lg leading-tight"
            style={{ 
              background: "linear-gradient(135deg, #2DD4BF 0%, #17E2C6 50%, #0d9488 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: theme === "glass" ? "0 2px 10px rgba(23, 226, 198, 0.3)" : "none",
            }}
          >
            Lingueefy
          </span>
          <span 
            className="text-xs tracking-wider font-medium"
            style={{ 
              color: theme === "glass" ? "rgba(45, 212, 191, 0.8)" : "#0d9488",
            }}
          >
            1-on-1 Coaching
          </span>
        </div>
      )}
    </motion.div>
  );
}
