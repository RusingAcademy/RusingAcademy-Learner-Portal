import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { glassCardVariants, hoverLift } from '@/lib/animations';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  variant?: 'light' | 'dark' | 'teal' | 'gold' | 'turquoise';
  hover?: boolean;
  glow?: boolean;
  className?: string;
}

export function GlassCard({
  children,
  variant = 'light',
  hover = true,
  glow = false,
  className = '',
  ...props
}: GlassCardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'dark':
        return 'bg-slate-900/80 border-slate-700/50 text-white';
      case 'teal':
        return 'bg-teal-900/30 border-teal-500/30 text-white';
      case 'gold':
        return 'bg-amber-900/30 border-amber-500/30 text-white';
      case 'turquoise':
        return 'bg-cyan-900/30 border-cyan-500/30 text-white';
      default:
        return 'bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/50 text-slate-900 dark:text-white';
    }
  };

  const getGlowClasses = () => {
    if (!glow) return '';
    switch (variant) {
      case 'teal':
        return 'shadow-teal-500/20';
      case 'gold':
        return 'shadow-amber-500/20';
      case 'turquoise':
        return 'shadow-cyan-500/20';
      default:
        return 'shadow-slate-500/10';
    }
  };

  return (
    <motion.div
      variants={glassCardVariants}
      initial="hidden"
      whileInView="visible"
      whileHover={hover ? "hover" : undefined}
      viewport={{ once: true, amount: 0.2 }}
      className={`
        relative rounded-2xl border backdrop-blur-xl
        ${getVariantClasses()}
        ${glow ? `shadow-2xl ${getGlowClasses()}` : 'shadow-lg'}
        transition-all duration-300
        ${className}
      `}
      {...props}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

interface GlassCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCardHeader({ children, className = '' }: GlassCardHeaderProps) {
  return (
    <div className={`p-6 pb-0 ${className}`}>
      {children}
    </div>
  );
}

interface GlassCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCardContent({ children, className = '' }: GlassCardContentProps) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}

interface GlassCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCardFooter({ children, className = '' }: GlassCardFooterProps) {
  return (
    <div className={`p-6 pt-0 ${className}`}>
      {children}
    </div>
  );
}

export default GlassCard;
