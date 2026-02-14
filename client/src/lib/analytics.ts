/**
 * RusingAcademy Analytics Module
 * 
 * Unified analytics interface for:
 * - Google Analytics 4 (GA4)
 * - Umami Analytics (privacy-focused, self-hosted)
 * 
 * Environment Variables:
 * - VITE_GA4_MEASUREMENT_ID: Google Analytics 4 Measurement ID (G-XXXXXXXXXX)
 * - VITE_UMAMI_WEBSITE_ID: Umami Website ID
 * - VITE_UMAMI_ENDPOINT: Umami tracking endpoint URL
 */

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
    umami?: {
      track: (eventName: string, data?: Record<string, any>) => void;
    };
  }
}

const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;
const UMAMI_WEBSITE_ID = import.meta.env.VITE_UMAMI_WEBSITE_ID;
const UMAMI_ENDPOINT = import.meta.env.VITE_UMAMI_ENDPOINT;

// Check if analytics are available
const isUmamiAvailable = () => typeof window !== 'undefined' && window.umami;
const isGA4Available = () => typeof window !== 'undefined' && window.gtag;

// Initialize Umami Analytics
export function initUmami() {
  if (!UMAMI_WEBSITE_ID || !UMAMI_ENDPOINT) {
    console.debug('[Analytics] Umami not configured');
    return;
  }

  // Check if script already loaded
  if (document.querySelector(`script[data-website-id="${UMAMI_WEBSITE_ID}"]`)) {
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.defer = true;
  script.src = `${UMAMI_ENDPOINT}/script.js`;
  script.setAttribute('data-website-id', UMAMI_WEBSITE_ID);
  document.head.appendChild(script);
  
  console.debug('[Analytics] Umami initialized');
}

// Initialize GA4
export function initGA4() {
  if (!GA4_MEASUREMENT_ID) {
    console.warn('GA4 Measurement ID not configured');
    return;
  }

  // Load gtag.js script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA4_MEASUREMENT_ID, {
    send_page_view: false, // We'll handle page views manually
  });
}

// Initialize all analytics
export function initAnalytics() {
  initGA4();
  initUmami();
  console.debug('[Analytics] All analytics initialized');
}

// Track page views (both GA4 and Umami)
export function trackPageView(path: string, title?: string) {
  const pagePath = path || window.location.pathname;
  const pageTitle = title || document.title;

  // GA4
  if (isGA4Available()) {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle,
      page_location: window.location.href,
    });
  }

  // Umami tracks page views automatically, but we can manually trigger
  if (isUmamiAvailable()) {
    window.umami?.track('pageview', { url: pagePath, title: pageTitle });
  }
}

// Track custom events (both GA4 and Umami)
export function trackEvent(
  eventName: string,
  params?: Record<string, any>
) {
  // GA4
  if (isGA4Available()) {
    window.gtag('event', eventName, params);
  }

  // Umami
  if (isUmamiAvailable()) {
    window.umami?.track(eventName, params);
  }
}

// ============================================
// Pre-defined Event Tracking Functions
// ============================================

// CTA Clicks
export function trackCTAClick(ctaName: string, location: string) {
  trackEvent('cta_click', {
    cta_name: ctaName,
    cta_location: location,
  });
}

// Signup Events
export function trackSignupStart() {
  trackEvent('sign_up_start', {
    method: 'email',
  });
}

export function trackSignupComplete(userId?: string) {
  trackEvent('sign_up', {
    method: 'email',
    user_id: userId,
  });
}

// Login Events
export function trackLogin(method: string = 'email') {
  trackEvent('login', {
    method,
  });
}

// Course Events
export function trackCourseView(courseId: string, courseName: string) {
  trackEvent('view_item', {
    item_id: courseId,
    item_name: courseName,
    item_category: 'course',
  });
}

export function trackCourseEnroll(courseId: string, courseName: string, price?: number) {
  trackEvent('begin_checkout', {
    currency: 'CAD',
    value: price || 0,
    items: [{
      item_id: courseId,
      item_name: courseName,
      item_category: 'course',
      price: price || 0,
      quantity: 1,
    }],
  });
}

export function trackCoursePurchase(
  courseId: string,
  courseName: string,
  price: number,
  transactionId: string
) {
  trackEvent('purchase', {
    transaction_id: transactionId,
    currency: 'CAD',
    value: price,
    items: [{
      item_id: courseId,
      item_name: courseName,
      item_category: 'course',
      price,
      quantity: 1,
    }],
  });
}

// Lesson Progress
export function trackLessonStart(lessonId: string, lessonName: string, courseId: string) {
  trackEvent('lesson_start', {
    lesson_id: lessonId,
    lesson_name: lessonName,
    course_id: courseId,
  });
}

export function trackLessonComplete(lessonId: string, lessonName: string, courseId: string) {
  trackEvent('lesson_complete', {
    lesson_id: lessonId,
    lesson_name: lessonName,
    course_id: courseId,
  });
}

// Quiz Events
export function trackQuizStart(quizId: string, lessonId: string) {
  trackEvent('quiz_start', {
    quiz_id: quizId,
    lesson_id: lessonId,
  });
}

export function trackQuizComplete(quizId: string, lessonId: string, score: number) {
  trackEvent('quiz_complete', {
    quiz_id: quizId,
    lesson_id: lessonId,
    score,
  });
}

// Booking Events
export function trackBookingStart(coachId: string, coachName: string) {
  trackEvent('booking_start', {
    coach_id: coachId,
    coach_name: coachName,
  });
}

export function trackBookingComplete(
  coachId: string,
  coachName: string,
  sessionType: string,
  price: number
) {
  trackEvent('booking_complete', {
    coach_id: coachId,
    coach_name: coachName,
    session_type: sessionType,
    value: price,
    currency: 'CAD',
  });
}

// Certificate Events
export function trackCertificateEarned(courseId: string, courseName: string) {
  trackEvent('certificate_earned', {
    course_id: courseId,
    course_name: courseName,
  });
}

export function trackCertificateVerified(certificateId: string) {
  trackEvent('certificate_verified', {
    certificate_id: certificateId,
  });
}

// Search Events
export function trackSearch(searchTerm: string, category?: string) {
  trackEvent('search', {
    search_term: searchTerm,
    search_category: category,
  });
}

// Language Switch
export function trackLanguageSwitch(fromLang: string, toLang: string) {
  trackEvent('language_switch', {
    from_language: fromLang,
    to_language: toLang,
  });
}

// Contact Form
export function trackContactFormSubmit(formType: string) {
  trackEvent('generate_lead', {
    form_type: formType,
  });
}

// Video Events
export function trackVideoStart(videoId: string, videoTitle: string) {
  trackEvent('video_start', {
    video_id: videoId,
    video_title: videoTitle,
  });
}

export function trackVideoComplete(videoId: string, videoTitle: string, watchTime: number) {
  trackEvent('video_complete', {
    video_id: videoId,
    video_title: videoTitle,
    watch_time_seconds: watchTime,
  });
}

// Scroll Depth
export function trackScrollDepth(depth: number, pagePath: string) {
  trackEvent('scroll', {
    percent_scrolled: depth,
    page_path: pagePath,
  });
}

// Error Tracking
export function trackError(errorMessage: string, errorLocation: string) {
  trackEvent('exception', {
    description: errorMessage,
    fatal: false,
    error_location: errorLocation,
  });
}
