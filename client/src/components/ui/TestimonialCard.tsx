import React from 'react';
import { motion } from 'framer-motion';
import { cardVariants } from '@/lib/animations';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  organization: string;
  image?: string;
  rating?: number;
  index?: number;
}

export function TestimonialCard({
  quote,
  author,
  role,
  organization,
  image,
  rating = 5,
  index = 0,
}: TestimonialCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.1 }}
      className="relative p-6 rounded-2xl bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      {/* Quote icon */}
      <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
      </div>

      {/* Rating stars */}
      {rating > 0 && (
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <motion.svg
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={`w-5 h-5 ${i < rating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </motion.svg>
          ))}
        </div>
      )}

      {/* Quote text */}
      <blockquote className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 italic">
        "{quote}"
      </blockquote>

      {/* Author info */}
      <div className="flex items-center gap-4">
        {image ? (
          <motion.img
            src={image}
            alt={author}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-teal-500/20"
            whileHover={{ scale: 1.1 }}
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
            {author.charAt(0)}
          </div>
        )}
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">{author}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{role}</div>
          <div className="text-xs text-teal-500">{organization}</div>
        </div>
      </div>

      {/* Decorative gradient */}
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-teal-500/10 to-transparent rounded-tl-full pointer-events-none" />
    </motion.div>
  );
}

export default TestimonialCard;
