/**
 * CalendlyWidget — Shared Calendly embed component
 * Reusable across Learner Portal (TutoringSessions) and Client Portal (HR pages).
 * Opens a modal overlay with an inline Calendly scheduling widget.
 */
import { useEffect, useRef } from "react";

interface CalendlyWidgetProps {
  url: string;
  onClose: () => void;
  title?: string;
}

export default function CalendlyWidget({ url, onClose, title = "Schedule Your Session" }: CalendlyWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      try { document.head.removeChild(script); } catch { /* already removed */ }
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[900px] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="material-icons text-[#008090]">calendar_month</span>
            <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <span className="material-icons text-gray-500">close</span>
          </button>
        </div>
        {/* Calendly Inline Widget */}
        <div ref={containerRef} className="h-[650px]">
          <div
            className="calendly-inline-widget"
            data-url={url}
            style={{ minWidth: "320px", height: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}
