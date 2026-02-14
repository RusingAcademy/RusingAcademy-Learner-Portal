import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { buttonVariants } from '@/lib/animations';

interface AnimatedButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  pulse?: boolean;
  href?: string;
  className?: string;
}

const variantClasses = {
  primary: 'bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30',
  secondary: 'bg-slate-800 hover:bg-slate-700 text-white shadow-lg',
  outline: 'border-2 border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white',
  ghost: 'text-slate-600 hover:text-teal-500 hover:bg-teal-50 dark:text-slate-300 dark:hover:bg-slate-800',
  gradient: 'bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/40 bg-size-200 hover:bg-right',
};

const sizeClasses = {
  sm: 'px-4 py-2 text-sm rounded-lg gap-1.5',
  md: 'px-6 py-3 text-base rounded-xl gap-2',
  lg: 'px-8 py-4 text-lg rounded-2xl gap-3',
};

export function AnimatedButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  loading = false,
  pulse = false,
  href,
  className = '',
  disabled,
  ...props
}: AnimatedButtonProps) {
  const Component = href ? motion.a : motion.button;

  const content = (
    <>
      {loading && (
        <motion.svg
          className="w-5 h-5 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </motion.svg>
      )}
      {icon && iconPosition === 'left' && !loading && (
        <motion.span
          initial={{ x: 0 }}
          whileHover={{ x: -2 }}
          transition={{ duration: 0.2 }}
        >
          {icon}
        </motion.span>
      )}
      <span>{children}</span>
      {icon && iconPosition === 'right' && !loading && (
        <motion.span
          initial={{ x: 0 }}
          whileHover={{ x: 4 }}
          transition={{ duration: 0.2 }}
        >
          {icon}
        </motion.span>
      )}
    </>
  );

  return (
    // @ts-expect-error - TS2322: auto-suppressed during TS cleanup
    <Component
      href={href}
      variants={buttonVariants}
      initial="idle"
      whileHover={!disabled ? "hover" : undefined}
      whileTap={!disabled ? "tap" : undefined}
      disabled={disabled || loading}
      className={`
        relative inline-flex items-center justify-center font-semibold
        transition-all duration-300 ease-out
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${pulse ? 'animate-pulse-subtle' : ''}
        ${className}
      `}
      style={variant === 'gradient' ? { backgroundSize: '200% auto' } : undefined}
      {...props}
    >
      {content}
      
      {/* Shine effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-inherit overflow-hidden pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
          animate={{ translateX: ['−100%', '200%'] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
        />
      </motion.div>
    </Component>
  );
}

// Arrow icon component for convenience
export function ArrowIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

// Sparkle icon for AI features
export function SparkleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
    </svg>
  );
}

export default AnimatedButton;
