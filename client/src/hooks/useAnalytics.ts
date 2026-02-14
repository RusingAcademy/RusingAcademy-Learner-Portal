import { useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { 
  trackPageView, 
  trackEvent, 
  trackCTAClick,
  trackCourseView,
  trackBookingStart,
  trackSearch,
  trackLanguageSwitch,
} from '@/lib/analytics';

/**
 * Hook for automatic page view tracking on route changes
 */
export function usePageTracking() {
  const [location] = useLocation();

  useEffect(() => {
    // Track page view on route change
    trackPageView(location);
  }, [location]);
}

/**
 * Hook for tracking events with consistent patterns
 */
export function useAnalytics() {
  const trackCTA = useCallback((ctaName: string, location: string) => {
    trackCTAClick(ctaName, location);
  }, []);

  const trackCoach = useCallback((coachId: string, coachName: string) => {
    trackEvent('view_coach', {
      coach_id: coachId,
      coach_name: coachName,
    });
  }, []);

  const trackCourse = useCallback((courseId: string, courseName: string) => {
    trackCourseView(courseId, courseName);
  }, []);

  const trackBooking = useCallback((coachId: string, coachName: string) => {
    trackBookingStart(coachId, coachName);
  }, []);

  const trackSearchQuery = useCallback((query: string, category?: string) => {
    trackSearch(query, category);
  }, []);

  const trackLangSwitch = useCallback((from: string, to: string) => {
    trackLanguageSwitch(from, to);
  }, []);

  const trackCustomEvent = useCallback((name: string, params?: Record<string, any>) => {
    trackEvent(name, params);
  }, []);

  return {
    trackCTA,
    trackCoach,
    trackCourse,
    trackBooking,
    trackSearchQuery,
    trackLangSwitch,
    trackCustomEvent,
  };
}

/**
 * Hook for tracking scroll depth
 */
export function useScrollTracking(thresholds: number[] = [25, 50, 75, 100]) {
  const [location] = useLocation();

  useEffect(() => {
    const trackedThresholds = new Set<number>();

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);

      thresholds.forEach((threshold) => {
        if (scrollPercent >= threshold && !trackedThresholds.has(threshold)) {
          trackedThresholds.add(threshold);
          trackEvent('scroll_depth', {
            depth: threshold,
            page_path: location,
          });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location, thresholds]);
}

/**
 * Hook for tracking time on page
 */
export function useTimeOnPage() {
  const [location] = useLocation();

  useEffect(() => {
    const startTime = Date.now();

    return () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      if (timeSpent > 5) { // Only track if more than 5 seconds
        trackEvent('time_on_page', {
          seconds: timeSpent,
          page_path: location,
        });
      }
    };
  }, [location]);
}

export default useAnalytics;
