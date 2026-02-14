import { Star, Quote } from "lucide-react";

interface PremiumTestimonialCardProps {
  quote: string;
  author: string;
  role?: string;
  organization?: string;
  avatar?: string;
  rating?: number;
  variant?: "default" | "glass" | "dark";
}

/**
 * PremiumTestimonialCard - Reusable premium testimonial component
 * 
 * Features:
 * - Quote icon decoration
 * - Star rating display
 * - Avatar support
 * - Multiple variants
 * - WCAG AA accessible
 */
export default function PremiumTestimonialCard({
  quote,
  author,
  role,
  organization,
  avatar,
  rating = 5,
  variant = "default",
}: PremiumTestimonialCardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "glass":
        return "glass-card";
      case "dark":
        return "bg-slate-900 text-white";
      default:
        return "bg-white shadow-lg hover:shadow-xl";
    }
  };

  return (
    <div 
      className={`relative p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 ${getVariantClasses()}`}
    >
      {/* Decorative quote icon */}
      <div className="absolute top-6 right-6" aria-hidden="true">
        <Quote 
          className={`h-12 w-12 ${variant === "dark" ? "text-teal-500/20" : "text-teal-500/15"}`}
          fill="currentColor"
        />
      </div>

      {/* Rating stars */}
      {rating > 0 && (
        <div className="flex gap-1 mb-4" aria-label={`${rating} out of 5 stars`}>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${
                i < rating 
                  ? "text-amber-400 fill-amber-400" 
                  : variant === "dark" 
                    ? "text-slate-600" 
                    : "text-slate-200"
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
      )}

      {/* Quote text */}
      <blockquote className={`text-lg leading-relaxed mb-6 ${variant === "dark" ? "text-slate-200" : "text-slate-700"}`}>
        "{quote}"
      </blockquote>

      {/* Author info */}
      <div className="flex items-center gap-4">
        {avatar ? (
          <img
            loading="lazy" src={avatar}
            alt={author}
            className="h-12 w-12 rounded-full object-cover ring-2 ring-teal-500/20"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {author.charAt(0)}
            </span>
          </div>
        )}
        <div>
          <p className={`font-semibold ${variant === "dark" ? "text-white" : "text-slate-900"}`}>
            {author}
          </p>
          {(role || organization) && (
            <p className={`text-sm ${variant === "dark" ? "text-slate-400" : "text-slate-500"}`}>
              {role && <span>{role}</span>}
              {role && organization && <span> • </span>}
              {organization && <span>{organization}</span>}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
