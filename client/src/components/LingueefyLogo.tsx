import React from 'react';

interface LingueefyLogoProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  variant?: 'full' | 'icon' | 'text';
  glassEffect?: boolean;
}

export const LingueefyLogo: React.FC<LingueefyLogoProps> = ({
  className = '',
  width = 'auto',
  height = 60,
  variant = 'full',
  glassEffect = true,
}) => {
  // Premium color palette
  const tealDark = '#0d9488';
  const tealPrimary = '#14b8a6';
  const tealLight = '#2dd4bf';
  const tealGlow = '#5eead4';
  
  // Icon only - Premium speech bubble with detailed maple leaf
  if (variant === 'icon') {
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 56 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Lingueefy Icon"
      >
        <defs>
          {/* Premium gradient for icon */}
          <linearGradient id="icon-premium-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={tealPrimary} />
            <stop offset="50%" stopColor={tealDark} />
            <stop offset="100%" stopColor={tealPrimary} />
          </linearGradient>
          {/* Glass fill */}
          <linearGradient id="icon-glass-fill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.3" />
            <stop offset="100%" stopColor="white" stopOpacity="0.1" />
          </linearGradient>
          {/* Soft shadow */}
          <filter id="icon-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={tealDark} floodOpacity="0.2" />
          </filter>
        </defs>
        
        <g filter="url(#icon-shadow)">
          {/* Speech bubble - elegant rounded shape */}
          <path
            d="M28 3C13 3 2 12.5 2 24C2 31.5 6.5 38 13 42L7 50L20 45C22.5 45.5 25.2 46 28 46C43 46 54 36.5 54 25C54 13.5 43 3 28 3Z"
            fill={glassEffect ? "url(#icon-glass-fill)" : "white"}
            stroke="url(#icon-premium-gradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Detailed Canadian Maple Leaf */}
          <g transform="translate(16, 12)">
            <path
              d="M12 0L13.5 4.5L17 3.5L15 7L19 9L15 11L17 14.5L13.5 13L12 18L10.5 13L7 14.5L9 11L5 9L9 7L7 3.5L10.5 4.5L12 0Z"
              fill="url(#icon-premium-gradient)"
            />
            {/* Maple leaf stem */}
            <path
              d="M12 18L12 22"
              stroke="url(#icon-premium-gradient)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        </g>
      </svg>
    );
  }

  // Text only variant
  if (variant === 'text') {
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 180 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Lingueefy"
      >
        <defs>
          <linearGradient id="text-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={tealDark} />
            <stop offset="50%" stopColor={tealPrimary} />
            <stop offset="100%" stopColor={tealDark} />
          </linearGradient>
        </defs>
        <text
          x="90"
          y="35"
          textAnchor="middle"
          fontFamily="'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif"
          fontSize="32"
          fontWeight="600"
          letterSpacing="-0.02em"
          fill="url(#text-gradient)"
        >
          Lingueefy
        </text>
        {/* Small maple leaf accent */}
        <g transform="translate(122, 8)">
          <path
            d="M5 0L5.8 2.5L8 2L7 4L9 5L7 6L8 8L5.8 7L5 10L4.2 7L2 8L3 6L1 5L3 4L2 2L4.2 2.5L5 0Z"
            fill={tealPrimary}
          />
        </g>
      </svg>
    );
  }

  // Full logo - Premium speech bubble with elegant typography
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 280 78"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Lingueefy Logo"
    >
      <defs>
        {/* Premium stroke gradient */}
        <linearGradient id="stroke-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={tealPrimary} />
          <stop offset="25%" stopColor={tealDark} />
          <stop offset="50%" stopColor={tealPrimary} />
          <stop offset="75%" stopColor={tealDark} />
          <stop offset="100%" stopColor={tealPrimary} />
        </linearGradient>
        
        {/* Glassmorphism fill - frosted glass effect */}
        <linearGradient id="glass-fill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.35" />
          <stop offset="50%" stopColor="white" stopOpacity="0.15" />
          <stop offset="100%" stopColor="white" stopOpacity="0.25" />
        </linearGradient>
        
        {/* Inner highlight for 3D depth */}
        <linearGradient id="inner-highlight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.5" />
          <stop offset="30%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        
        {/* Text gradient */}
        <linearGradient id="text-fill" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={tealDark} />
          <stop offset="50%" stopColor={tealPrimary} />
          <stop offset="100%" stopColor={tealDark} />
        </linearGradient>
        
        {/* Maple leaf gradient */}
        <linearGradient id="leaf-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={tealLight} />
          <stop offset="50%" stopColor={tealPrimary} />
          <stop offset="100%" stopColor={tealDark} />
        </linearGradient>
        
        {/* Premium drop shadow */}
        <filter id="premium-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor={tealDark} floodOpacity="0.15" />
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor={tealDark} floodOpacity="0.1" />
        </filter>
        
        {/* Glow effect for premium feel */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        {/* Clip path for inner highlight */}
        <clipPath id="bubble-clip">
          <ellipse cx="148" cy="36" rx="120" ry="32" />
        </clipPath>
      </defs>
      
      {/* Main logo group with shadow */}
      <g filter="url(#premium-shadow)">
        
        {/* Speech bubble - elegant elliptical shape */}
        {/* Glass fill layer */}
        {glassEffect && (
          <ellipse
            cx="148"
            cy="36"
            rx="120"
            ry="32"
            fill="url(#glass-fill)"
          />
        )}
        
        {/* Inner highlight for 3D glass effect */}
        {glassEffect && (
          <ellipse
            cx="148"
            cy="28"
            rx="100"
            ry="18"
            fill="url(#inner-highlight)"
            clipPath="url(#bubble-clip)"
          />
        )}
        
        {/* Main bubble outline - smooth elegant stroke */}
        <ellipse
          cx="148"
          cy="36"
          rx="120"
          ry="32"
          fill="none"
          stroke="url(#stroke-gradient)"
          strokeWidth="3"
        />
        
        {/* Speech bubble tail - elegant curved pointer */}
        <path
          d="M50 58 Q35 68 28 75 Q38 65 52 60"
          fill={glassEffect ? "url(#glass-fill)" : "white"}
          stroke="url(#stroke-gradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Cover junction between tail and bubble */}
        <ellipse
          cx="51"
          cy="59"
          rx="8"
          ry="4"
          fill={glassEffect ? "rgba(255,255,255,0.25)" : "white"}
        />
      </g>
      
      {/* Lingueefy text - premium typography */}
      <text
        x="148"
        y="45"
        textAnchor="middle"
        fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="34"
        fontWeight="600"
        letterSpacing="-0.03em"
        fill="url(#text-fill)"
      >
        Lingueefy
      </text>
      
      {/* Detailed Canadian Maple Leaf - positioned above "ee" */}
      <g transform="translate(175, 6)" filter={glassEffect ? "url(#glow)" : undefined}>
        {/* Main maple leaf shape - more detailed and recognizable */}
        <path
          d="M8 0
             L9.2 3.2 L12 2.2 L10.5 5 L14 6.5 L10.8 8 L12 11 L9.2 9.5 L8 13 L6.8 9.5 L4 11 L5.2 8 L2 6.5 L5.5 5 L4 2.2 L6.8 3.2 L8 0Z"
          fill="url(#leaf-gradient)"
        />
        {/* Leaf stem */}
        <path
          d="M8 13 L8 16"
          stroke={tealDark}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Subtle leaf vein detail */}
        <path
          d="M8 4 L8 10"
          stroke="white"
          strokeWidth="0.5"
          strokeOpacity="0.3"
          strokeLinecap="round"
        />
      </g>
      
      {/* Subtle shine accent on bubble (premium detail) */}
      {glassEffect && (
        <ellipse
          cx="100"
          cy="22"
          rx="40"
          ry="3"
          fill="white"
          fillOpacity="0.2"
        />
      )}
    </svg>
  );
};

// Animated version with smooth hover effects
export const LingueefyLogoAnimated: React.FC<LingueefyLogoProps> = (props) => {
  return (
    <div className="group transition-all duration-500 ease-out hover:scale-[1.03] hover:drop-shadow-lg">
      <LingueefyLogo {...props} />
    </div>
  );
};

export default LingueefyLogo;
