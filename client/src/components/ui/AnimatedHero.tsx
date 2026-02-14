import React from 'react';
import { motion } from 'framer-motion';
import { heroTextVariants, heroImageVariants, staggerContainer, fadeInUp, buttonVariants } from '@/lib/animations';

interface AnimatedHeroProps {
  badge?: string;
  title: string;
  highlightedWord?: string;
  subtitle: string;
  primaryCTA?: {
    text: string;
    href: string;
    icon?: React.ReactNode;
  };
  secondaryCTA?: {
    text: string;
    href: string;
    icon?: React.ReactNode;
  };
  image?: string;
  imageAlt?: string;
  stats?: Array<{
    value: string;
    label: string;
  }>;
  variant?: 'default' | 'gradient' | 'dark';
  className?: string;
}

export function AnimatedHero({
  badge,
  title,
  highlightedWord,
  subtitle,
  primaryCTA,
  secondaryCTA,
  image,
  imageAlt = 'Hero image',
  stats,
  variant = 'default',
  className = '',
}: AnimatedHeroProps) {
  const getBackgroundClass = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900';
      case 'dark':
        return 'bg-slate-900';
      default:
        return 'bg-white dark:bg-slate-900';
    }
  };

  const renderTitle = () => {
    if (!highlightedWord) {
      return <span>{title}</span>;
    }

    const parts = title.split(highlightedWord);
    return (
      <>
        {parts[0]}
        <span className="relative">
          <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            {highlightedWord}
          </span>
          <motion.span
            className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
          />
        </span>
        {parts[1]}
      </>
    );
  };

  return (
    <section className={`relative overflow-hidden ${getBackgroundClass()} ${className}`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {badge && (
              <motion.div variants={fadeInUp}>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-medium">
                  <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                  {badge}
                </span>
              </motion.div>
            )}

            <motion.h1
              variants={heroTextVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-slate-900 dark:text-white"
            >
              {renderTitle()}
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-xl"
            >
              {subtitle}
            </motion.p>

            {(primaryCTA || secondaryCTA) && (
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 pt-4">
                {primaryCTA && (
                  <motion.a
                    href={primaryCTA.href}
                    variants={buttonVariants}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition-shadow"
                  >
                    {primaryCTA.icon}
                    {primaryCTA.text}
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </motion.a>
                )}
                {secondaryCTA && (
                  <motion.a
                    href={secondaryCTA.href}
                    variants={buttonVariants}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                    className="inline-flex items-center gap-2 px-6 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:border-teal-500 hover:text-teal-500 transition-colors"
                  >
                    {secondaryCTA.icon}
                    {secondaryCTA.text}
                  </motion.a>
                )}
              </motion.div>
            )}

            {stats && stats.length > 0 && (
              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap gap-8 pt-8 border-t border-slate-200 dark:border-slate-700"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-3xl font-bold text-teal-500">{stat.value}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Image */}
          {image && (
            <motion.div
              variants={heroImageVariants}
              initial="hidden"
              animate="visible"
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <motion.img
                  src={image}
                  alt={imageAlt}
                  className="w-full h-auto object-cover"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>

              {/* Floating decorative elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-2xl -z-10"
                animate={{
                  rotate: [0, 5, 0, -5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.div
                className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-[#D97B3D] to-[#D97B3D] rounded-xl -z-10"
                animate={{
                  rotate: [0, -5, 0, 5, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AnimatedHero;
