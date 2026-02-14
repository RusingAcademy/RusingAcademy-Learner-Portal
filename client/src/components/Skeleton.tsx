import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'glass' | 'card' | 'avatar' | 'text' | 'button';
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  animate?: boolean;
}

// Base skeleton with glassmorphism shimmer effect
export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'default',
  width,
  height,
  rounded = 'md',
  animate = true,
}) => {
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  };

  const baseClasses = cn(
    'relative overflow-hidden',
    'bg-gradient-to-r from-gray-200/60 via-gray-100/40 to-gray-200/60',
    'dark:from-gray-700/40 dark:via-gray-600/20 dark:to-gray-700/40',
    'backdrop-blur-sm',
    roundedClasses[rounded],
    animate && 'animate-shimmer',
    className
  );

  const variantClasses = {
    default: '',
    glass: 'border border-white/20 dark:border-white/10 shadow-sm',
    card: 'border border-white/30 dark:border-white/10 shadow-lg',
    avatar: 'rounded-full',
    text: 'h-4',
    button: 'h-10 rounded-full',
  };

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : variant === 'avatar' ? '3rem' : '100%'),
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant])}
      style={style}
      aria-hidden="true"
      role="presentation"
    >
      {/* Shimmer overlay */}
      {animate && (
        <div className="absolute inset-0 -translate-x-full animate-shimmer-slide bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" />
      )}
    </div>
  );
};

// Skeleton for text lines
interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  className,
  lastLineWidth = '60%',
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          height={16}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          rounded="sm"
        />
      ))}
    </div>
  );
};

// Skeleton for avatar/profile images
interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <Skeleton
      variant="avatar"
      className={cn(sizeClasses[size], className)}
      rounded="full"
    />
  );
};

// Skeleton for coach cards
export const SkeletonCoachCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-white/60 dark:bg-gray-800/60',
        'backdrop-blur-xl',
        'border border-white/30 dark:border-white/10',
        'shadow-lg',
        'p-6',
        className
      )}
    >
      {/* Video/Image placeholder */}
      <Skeleton
        variant="glass"
        height={200}
        rounded="xl"
        className="mb-4"
      />
      
      {/* Avatar and name */}
      <div className="flex items-center gap-3 mb-4">
        <SkeletonAvatar size="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="70%" height={20} />
          <Skeleton variant="text" width="50%" height={14} />
        </div>
      </div>
      
      {/* Badges */}
      <div className="flex gap-2 mb-4">
        <Skeleton variant="button" width={60} height={24} rounded="full" />
        <Skeleton variant="button" width={80} height={24} rounded="full" />
        <Skeleton variant="button" width={50} height={24} rounded="full" />
      </div>
      
      {/* Description */}
      <SkeletonText lines={2} className="mb-4" />
      
      {/* Price and button */}
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width={80} height={24} />
        <Skeleton variant="button" width={120} height={40} />
      </div>
    </div>
  );
};

// Skeleton for pricing cards
export const SkeletonPricingCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-white/70 dark:bg-gray-800/70',
        'backdrop-blur-xl',
        'border border-white/30 dark:border-white/10',
        'shadow-lg',
        'p-8',
        className
      )}
    >
      {/* Plan name */}
      <Skeleton variant="text" width="40%" height={24} className="mb-2" />
      
      {/* Price */}
      <Skeleton variant="text" width="60%" height={48} className="mb-4" />
      
      {/* Description */}
      <Skeleton variant="text" width="80%" height={16} className="mb-6" />
      
      {/* Features list */}
      <div className="space-y-3 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton variant="avatar" className="w-5 h-5" />
            <Skeleton variant="text" width={`${70 + Math.random() * 20}%`} height={14} />
          </div>
        ))}
      </div>
      
      {/* CTA Button */}
      <Skeleton variant="button" height={48} rounded="xl" />
    </div>
  );
};

// Skeleton for testimonial cards
export const SkeletonTestimonialCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-white/60 dark:bg-gray-800/60',
        'backdrop-blur-xl',
        'border border-white/30 dark:border-white/10',
        'shadow-lg',
        'p-6',
        className
      )}
    >
      {/* Quote icon placeholder */}
      <Skeleton variant="avatar" className="w-8 h-8 mb-4" />
      
      {/* Quote text */}
      <SkeletonText lines={3} className="mb-6" />
      
      {/* Author */}
      <div className="flex items-center gap-3">
        <SkeletonAvatar size="md" />
        <div className="space-y-2">
          <Skeleton variant="text" width={120} height={16} />
          <Skeleton variant="text" width={80} height={12} />
        </div>
      </div>
    </div>
  );
};

// Grid of skeleton cards
interface SkeletonGridProps {
  count?: number;
  type?: 'coach' | 'pricing' | 'testimonial';
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export const SkeletonGrid: React.FC<SkeletonGridProps> = ({
  count = 6,
  type = 'coach',
  columns = 3,
  className,
}) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const CardComponent = {
    coach: SkeletonCoachCard,
    pricing: SkeletonPricingCard,
    testimonial: SkeletonTestimonialCard,
  }[type];

  return (
    <div className={cn('grid gap-6', gridClasses[columns], className)}>
      {Array.from({ length: count }).map((_, index) => (
        <CardComponent key={index} />
      ))}
    </div>
  );
};

export default Skeleton;
