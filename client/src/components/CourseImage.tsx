import { useState } from "react";
import { BookOpen, Mic, PenTool, FileText, Award, Package } from "lucide-react";

interface CourseImageProps {
  src?: string | null;
  alt: string;
  category?: string;
  className?: string;
}

// Map categories to icons and colors
const categoryConfig: Record<string, { icon: typeof BookOpen; color: string; bgColor: string }> = {
  oral_expression: { icon: Mic, color: "text-primary", bgColor: "bg-primary/10" },
  written_expression: { icon: PenTool, color: "text-blue-600", bgColor: "bg-blue-50" },
  reading_comprehension: { icon: BookOpen, color: "text-emerald-600", bgColor: "bg-emerald-50" },
  general_french: { icon: FileText, color: "text-[#0F3D3E]", bgColor: "bg-[#E7F2F2]" },
  level_c: { icon: Award, color: "text-amber-600", bgColor: "bg-amber-50" },
  bundle: { icon: Package, color: "text-orange-600", bgColor: "bg-orange-50" },
};

export function CourseImage({ src, alt, category = "general_french", className = "" }: CourseImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const config = categoryConfig[category] || categoryConfig.general_french;
  const Icon = config.icon;

  // Show fallback if no src or error loading
  if (!src || hasError) {
    return (
      <div 
        className={`relative flex items-center justify-center ${config.bgColor} ${className}`}
        role="img"
        aria-label={alt}
      >
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Icon */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className={`p-4 rounded-full ${config.bgColor} border-2 border-current ${config.color}`}>
            <Icon className={`w-8 h-8 ${config.color}`} />
          </div>
          <span className={`text-sm font-medium ${config.color} opacity-70 text-center px-4`}>
            {alt}
          </span>
        </div>

        {/* Decorative corner accents */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-primary/20 rounded-tl-lg" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-primary/20 rounded-br-lg" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      <img
        loading="lazy" src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
}

export default CourseImage;
