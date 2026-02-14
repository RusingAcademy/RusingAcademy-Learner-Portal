import React from 'react';
import { motion } from 'framer-motion';
import { cardVariants, buttonVariants } from '@/lib/animations';

interface BrandCardProps {
  brand: 'rusingacademy' | 'lingueefy' | 'barholex';
  title: string;
  description: string;
  features: string[];
  image: string;
  ctaText: string;
  ctaHref: string;
  index?: number;
}

const brandColors = {
  rusingacademy: {
    primary: '#1E9B8A',
    gradient: 'from-teal-500 to-emerald-600',
    glow: 'shadow-teal-500/30',
    border: 'border-teal-500/30',
    bg: 'bg-teal-500/10',
    text: 'text-teal-400',
  },
  lingueefy: {
    primary: '#17E2C6',
    gradient: 'from-cyan-400 to-teal-500',
    glow: 'shadow-cyan-500/30',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
  },
  barholex: {
    primary: '#D4A853',
    gradient: 'from-[#D97B3D] to-yellow-600',
    glow: 'shadow-amber-500/30',
    border: 'border-amber-500/30',
    bg: 'bg-[#C65A1E]/10',
    text: 'text-amber-400',
  },
};

export function BrandCard({
  brand,
  title,
  description,
  features,
  image,
  ctaText,
  ctaHref,
  index = 0,
}: BrandCardProps) {
  const colors = brandColors[brand];

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.15 }}
      className={`
        relative group rounded-3xl overflow-hidden
        bg-slate-900/90 backdrop-blur-xl
        border ${colors.border}
        shadow-xl hover:${colors.glow}
        transition-all duration-500
      `}
    >
      {/* Animated gradient border */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} opacity-20`} />
      </div>

      {/* Image section */}
      <div className="relative h-48 overflow-hidden">
        <motion.img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        
        {/* Brand badge */}
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full ${colors.bg} ${colors.text} text-xs font-semibold backdrop-blur-sm border ${colors.border}`}>
          {brand === 'rusingacademy' ? 'RusingAcademy' : brand === 'lingueefy' ? 'Lingueefy' : 'Barholex Media'}
        </div>
      </div>

      {/* Content section */}
      <div className="relative p-6 space-y-4">
        {/* Title with gradient */}
        <h3 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all duration-300">
          {title}
        </h3>

        {/* Description */}
        <p className="text-slate-400 text-sm leading-relaxed">
          {description}
        </p>

        {/* Features list */}
        <ul className="space-y-2">
          {features.map((feature, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 text-sm text-slate-300"
            >
              <svg className={`w-4 h-4 ${colors.text} flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {feature}
            </motion.li>
          ))}
        </ul>

        {/* CTA Button */}
        <motion.a
          href={ctaHref}
          variants={buttonVariants}
          initial="idle"
          whileHover="hover"
          whileTap="tap"
          className={`
            inline-flex items-center gap-2 w-full justify-center
            px-6 py-3 mt-4 rounded-xl font-semibold
            bg-gradient-to-r ${colors.gradient}
            text-white shadow-lg hover:shadow-xl
            transition-shadow duration-300
          `}
        >
          {ctaText}
          <motion.svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </motion.svg>
        </motion.a>
      </div>

      {/* Decorative corner accent */}
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl ${colors.gradient} opacity-10 rounded-bl-full`} />
    </motion.div>
  );
}

export default BrandCard;
