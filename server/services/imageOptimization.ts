/**
 * Image Optimization Utilities
 * RusingÂcademy Learning Ecosystem
 * 
 * This module provides utilities for optimizing images to improve
 * Core Web Vitals scores (LCP, CLS) and reduce page load times.
 * 
 * @copyright Rusinga International Consulting Ltd.
 */

export const IMAGE_OPTIMIZATION_CONFIG = {
  maxDimensions: {
    hero: { width: 1920, height: 1080 },
    thumbnail: { width: 400, height: 300 },
    avatar: { width: 200, height: 200 },
    card: { width: 600, height: 400 }
  },
  quality: {
    webp: 85,
    avif: 80,
    jpeg: 85,
    png: 90
  },
  lazyLoadThreshold: 1.5,
  placeholderSize: 10
};

export const CRITICAL_IMAGES = [
  '/images/rusingacademy-hero.webp',
  '/images/lingueefy-hero.webp',
  '/images/barholex-hero.webp',
  '/images/logo-rusingacademy.webp'
];

export function generateSrcSet(basePath: string, widths: number[]): string {
  return widths.map(width => `${basePath}?w=${width} ${width}w`).join(', ');
}

export function generateSizes(breakpoints: { maxWidth: number; size: string }[]): string {
  return breakpoints.map(bp => `(max-width: ${bp.maxWidth}px) ${bp.size}`).concat(['100vw']).join(', ');
}

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export function getOptimizedImageUrl(src: string, width: number, quality: number = 85): string {
  return `${src}?w=${width}&q=${quality}&fm=webp`;
}

export function generatePreloadLinks(): string[] {
  return CRITICAL_IMAGES.map(src => 
    `<link rel="preload" as="image" href="${src}" fetchpriority="high">`
  );
}

export const LAZY_LOAD_OBSERVER_CONFIG: IntersectionObserverInit = {
  root: null,
  rootMargin: '50px 0px',
  threshold: 0.01
};

export function createLazyLoadObserver(callback: (entries: IntersectionObserverEntry[]) => void): IntersectionObserver {
  return new IntersectionObserver(callback, LAZY_LOAD_OBSERVER_CONFIG);
}

export default {
  IMAGE_OPTIMIZATION_CONFIG,
  CRITICAL_IMAGES,
  generateSrcSet,
  generateSizes,
  getOptimizedImageUrl,
  generatePreloadLinks,
  createLazyLoadObserver
};
