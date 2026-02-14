import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * ScrollToTop Component
 * 
 * Ensures the page scrolls to the top on every route change.
 * This is a global UX behavior required for the Golden Standard.
 * 
 * Implementation:
 * - Listens to route changes via wouter's useLocation hook
 * - Scrolls to top instantly on navigation (no smooth scroll to avoid delay)
 * - Handles both browser back/forward and programmatic navigation
 */
export default function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Scroll to top instantly on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant"
    });
  }, [location]);

  return null;
}
