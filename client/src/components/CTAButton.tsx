import { forwardRef } from 'react';
import { Link } from 'wouter';
// @ts-expect-error - TS2305: auto-suppressed during TS cleanup
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight, Sparkles, Calendar, MessageSquare } from 'lucide-react';

interface CTAButtonProps extends Omit<ButtonProps, 'asChild'> {
  href?: string;
  icon?: 'arrow' | 'sparkles' | 'calendar' | 'message' | 'none';
  pulse?: boolean;
  trackingId?: string;
}

const iconMap = {
  arrow: ArrowRight,
  sparkles: Sparkles,
  calendar: Calendar,
  message: MessageSquare,
  none: null,
};

/**
 * CTAButton - Optimized Call-to-Action button with:
 * - Optional pulse animation for attention
 * - Icon support
 * - Link or button mode
 * - Analytics tracking ready
 */
const CTAButton = forwardRef<HTMLButtonElement, CTAButtonProps>(
  ({ 
    children, 
    href, 
    icon = 'arrow', 
    pulse = false, 
    trackingId,
    className,
    onClick,
    ...props 
  }, ref) => {
    const IconComponent = iconMap[icon];

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Track CTA clicks for analytics
      if (trackingId && typeof window !== 'undefined') {
        // Send to analytics (Umami, GA, etc.)
        try {
          (window as any).umami?.track(trackingId);
        } catch (err) {
          // Analytics not available
        }
      }
      onClick?.(e);
    };

    const buttonContent = (
      <>
        {children}
        {IconComponent && (
          <IconComponent className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        )}
      </>
    );

    const buttonClasses = cn(
      'group relative',
      pulse && 'animate-pulse-subtle',
      className
    );

    if (href) {
      return (
        <Link href={href}>
          <Button 
            ref={ref} 
            className={buttonClasses} 
            onClick={handleClick}
            {...props}
          >
            {buttonContent}
          </Button>
        </Link>
      );
    }

    return (
      <Button 
        ref={ref} 
        className={buttonClasses} 
        onClick={handleClick}
        {...props}
      >
        {buttonContent}
      </Button>
    );
  }
);

CTAButton.displayName = 'CTAButton';

export default CTAButton;

// Pre-configured CTA variants
export function PrimaryCTA({ children, ...props }: CTAButtonProps) {
  return (
    <CTAButton
      size="lg"
      className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl transition-all"
      {...props}
    >
      {children}
    </CTAButton>
  );
}

export function SecondaryCTA({ children, ...props }: CTAButtonProps) {
  return (
    <CTAButton
      variant="outline"
      size="lg"
      className="border-teal-600 text-teal-600 hover:bg-teal-50"
      icon="none"
      {...props}
    >
      {children}
    </CTAButton>
  );
}

export function BookingCTA({ children = "Book a Session", ...props }: CTAButtonProps) {
  return (
    <CTAButton
      size="lg"
      icon="calendar"
      className="bg-teal-600 hover:bg-teal-700 text-white"
      trackingId="cta-book-session"
      {...props}
    >
      {children}
    </CTAButton>
  );
}

export function AIChatCTA({ children = "Try SLE AI Companion", ...props }: CTAButtonProps) {
  return (
    <CTAButton
      size="lg"
      icon="sparkles"
      className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
      trackingId="cta-prof-steven-ai"
      {...props}
    >
      {children}
    </CTAButton>
  );
}
