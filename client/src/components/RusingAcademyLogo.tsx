import { motion } from "framer-motion";

interface RusingAcademyLogoProps {
  size?: number;
  showText?: boolean;
  theme?: "glass" | "light";
  className?: string;
  variant?: "icon" | "full" | "text-only";
}

/**
 * RusingAcademy Logo Component
 * Uses the official logo images
 * Brand colors: Teal (#1E9B8A) and Orange (#F7941D)
 */
export default function RusingAcademyLogo({ 
  size = 48, 
  showText = true, 
  theme = "glass",
  className = "",
  variant = "icon"
}: RusingAcademyLogoProps) {
  const glowColor = "rgba(30, 155, 138, 0.4)";
  
  // Use the official RusingAcademy logo
  const logoSrc = "https://rusingacademy-cdn.b-cdn.net/images/logos/rusingacademy-official.png";
  
  if (variant === "text-only") {
    return (
      <motion.div 
        className={`flex flex-col ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <span 
          className="font-bold tracking-wide text-lg leading-tight"
          style={{ 
            background: "linear-gradient(135deg, #2BB5A3 0%, #1E9B8A 30%, #0D8A7C 70%, #077A6D 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: theme === "glass" ? "0 2px 10px rgba(30, 155, 138, 0.3)" : "none",
          }}
        >
          RusingAcademy
        </span>
        <span 
          className="text-xs tracking-[0.2em] font-medium"
          style={{ 
            color: theme === "glass" ? "rgba(247, 148, 29, 0.9)" : "#F7941D",
          }}
        >
          PATH SERIES™
        </span>
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      className={`flex items-center gap-3 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Official Logo Image with glow effect */}
      <div 
        className="relative flex-shrink-0"
        style={{ 
          filter: theme === "glass" ? `drop-shadow(0 4px 20px ${glowColor})` : "none",
        }}
      >
        <img
          loading="lazy" src={logoSrc}
          alt="RusingAcademy Logo"
          width={size}
          height={size}
          className="object-contain"
          style={{
            borderRadius: "8px",
          }}
        />
      </div>
      
      {/* Text with premium styling */}
      {showText && (
        <div className="flex flex-col">
          <span 
            className="font-bold tracking-wide leading-tight"
            style={{ 
              fontSize: size > 40 ? "1.125rem" : "0.875rem",
              background: "linear-gradient(135deg, #2BB5A3 0%, #1E9B8A 30%, #0D8A7C 70%, #077A6D 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: theme === "glass" ? "0 2px 10px rgba(30, 155, 138, 0.3)" : "none",
            }}
          >
            RusingAcademy
          </span>
          <span 
            className="tracking-[0.15em] font-medium"
            style={{ 
              fontSize: size > 40 ? "0.7rem" : "0.6rem",
              color: theme === "glass" ? "rgba(247, 148, 29, 0.9)" : "#F7941D",
            }}
          >
            PATH SERIES™
          </span>
        </div>
      )}
    </motion.div>
  );
}
