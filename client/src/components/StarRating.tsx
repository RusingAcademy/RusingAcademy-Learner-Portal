import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  reviewCount?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

const sizeClasses = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

const textSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  showValue = true,
  reviewCount,
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  
  const displayRating = hoverRating !== null ? hoverRating : rating;
  
  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };
  
  const handleMouseEnter = (index: number) => {
    if (interactive) {
      setHoverRating(index + 1);
    }
  };
  
  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {[...Array(maxRating)].map((_, index) => {
          const isFilled = index < Math.floor(displayRating);
          const isPartial = index === Math.floor(displayRating) && displayRating % 1 > 0;
          const fillPercentage = isPartial ? (displayRating % 1) * 100 : 0;
          
          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(index)}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              className={cn(
                "relative focus:outline-none",
                interactive && "cursor-pointer hover:scale-110 transition-transform"
              )}
              aria-label={`${index + 1} star${index + 1 !== 1 ? "s" : ""}`}
            >
              {/* Background star (empty) */}
              <Star
                className={cn(
                  sizeClasses[size],
                  "text-gray-300 dark:text-gray-600"
                )}
              />
              
              {/* Filled star overlay */}
              {(isFilled || isPartial) && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: isFilled ? "100%" : `${fillPercentage}%` }}
                >
                  <Star
                    className={cn(
                      sizeClasses[size],
                      "fill-amber-400 text-amber-400"
                    )}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {showValue && (
        <span className={cn("font-semibold text-gray-800 dark:text-gray-200", textSizeClasses[size])}>
          {rating > 0 ? rating.toFixed(1) : "New"}
        </span>
      )}
      
      {reviewCount !== undefined && reviewCount > 0 && (
        <span className={cn("text-muted-foreground", textSizeClasses[size])}>
          ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
        </span>
      )}
    </div>
  );
}

// Interactive star rating for review forms
export function StarRatingInput({
  value,
  onChange,
  size = "lg",
  className,
}: {
  value: number;
  onChange: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <StarRating
      rating={value}
      size={size}
      showValue={false}
      interactive
      onChange={onChange}
      className={className}
    />
  );
}
