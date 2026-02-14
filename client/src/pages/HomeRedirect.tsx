import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Redirect component for /home → /lingueefy
 * This ensures old /home links continue to work
 */
export default function HomeRedirect() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Perform client-side redirect to /lingueefy
    setLocation("/lingueefy", { replace: true });
  }, [setLocation]);

  return null;
}
