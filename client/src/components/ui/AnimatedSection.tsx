import React from 'react';
import { motion, Variants } from 'framer-motion';
import { 
  scrollReveal, 
  scrollRevealLeft, 
  scrollRevealRight, 
  staggerContainer,
  staggerItem,
  fadeInUp,
  viewportSettings 
} from '@/lib/animations';

interface AnimatedSectionProps {
  children: React.ReactNode;
  animation?: 'fade' | 'left' | 'right' | 'stagger';
  className?: string;
  delay?: number;
}

export function AnimatedSection({
  children,
  animation = 'fade',
  className = '',
  delay = 0,
}: AnimatedSectionProps) {
  const getVariants = (): Variants => {
    switch (animation) {
      case 'left':
        return scrollRevealLeft;
      case 'right':
        return scrollRevealRight;
      case 'stagger':
        return staggerContainer;
      default:
        return scrollReveal;
    }
  };

  return (
    <motion.section
      variants={getVariants()}
      initial="hidden"
      whileInView="visible"
      viewport={viewportSettings}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

interface AnimatedItemProps {
  children: React.ReactNode;
  className?: string;
  index?: number;
}

export function AnimatedItem({ children, className = '', index = 0 }: AnimatedItemProps) {
  return (
    <motion.div
      variants={staggerItem}
      custom={index}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedTextProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  className?: string;
  gradient?: boolean;
}

export function AnimatedText({
  children,
  as: Component = 'p',
  className = '',
  gradient = false,
}: AnimatedTextProps) {
  const MotionComponent = motion[Component];
  
  return (
    <MotionComponent
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportSettings}
      className={`${gradient ? 'bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent' : ''} ${className}`}
    >
      {children}
    </MotionComponent>
  );
}

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 2,
  className = '',
}: AnimatedCounterProps) {
  const [count, setCount] = React.useState(0);
  const [isInView, setIsInView] = React.useState(false);

  React.useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, value, duration]);

  return (
    <motion.span
      className={className}
      onViewportEnter={() => setIsInView(true)}
      viewport={{ once: true }}
    >
      {prefix}{count.toLocaleString()}{suffix}
    </motion.span>
  );
}

interface AnimatedImageProps {
  src: string;
  alt: string;
  className?: string;
  hoverZoom?: boolean;
}

export function AnimatedImage({
  src,
  alt,
  className = '',
  hoverZoom = true,
}: AnimatedImageProps) {
  return (
    <motion.div
      variants={scrollReveal}
      initial="hidden"
      whileInView="visible"
      viewport={viewportSettings}
      className={`overflow-hidden rounded-2xl ${className}`}
    >
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        whileHover={hoverZoom ? { scale: 1.05 } : undefined}
        transition={{ duration: 0.4 }}
      />
    </motion.div>
  );
}

export default AnimatedSection;
