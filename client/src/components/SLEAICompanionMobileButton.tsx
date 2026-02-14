/**
 * SLEAICompanionMobileButton - Floating Fixed Button for Mobile
 * 
 * This component renders a floating button in the bottom-right corner
 * on mobile devices (< 1024px) to access the SLE AI Companion.
 * It reuses the same widget modal from SLEAICompanionWidgetMultiCoach.
 */

import { useState, useEffect } from "react";

// Coach Data (same as main widget)
const coaches = [
  {
    id: "steven",
    name: "Prof. Steven",
    image: "https://rusingacademy-cdn.b-cdn.net/images/coaches/Steven(2).webp",
  },
  {
    id: "sue-anne",
    name: "Coach Sue-Anne",
    image: "https://rusingacademy-cdn.b-cdn.net/images/coaches/Sue-Anne.webp",
  },
  {
    id: "erica",
    name: "Coach Erica",
    image: "https://rusingacademy-cdn.b-cdn.net/images/coaches/ErikaFrank.webp",
  },
  {
    id: "preciosa",
    name: "Coach Preciosa",
    image: "https://rusingacademy-cdn.b-cdn.net/images/coaches/Preciosa2.webp",
  }
];

export default function SLEAICompanionMobileButton() {
  const [currentCoachIndex, setCurrentCoachIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Cross-fade animation for coaches
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCoachIndex((prev) => (prev + 1) % coaches.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Hide button when scrolling down, show when scrolling up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Open the main widget modal by dispatching a custom event
  const handleClick = () => {
    // Dispatch custom event to open the main widget
    window.dispatchEvent(new CustomEvent("openSLEAICompanion"));
  };

  return (
    <>
      {/* Mobile Floating Button - Only visible on screens < 1024px */}
      <div
        className={`fixed bottom-6 right-6 z-40 lg:hidden transition-all duration-300 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
        }`}
      >
        <button
          onClick={handleClick}
          className="relative group focus:outline-none"
          aria-label="Open SLE AI Companion - Chat with our AI coaches"
          title="Chat with our AI coaches for SLE preparation help"
        >
          {/* Outer Breathing Glow - Violet/Teal */}
          <div 
            className="absolute rounded-full"
            style={{
              inset: '-10px',
              background: 'conic-gradient(from 0deg, #6D28D9, #8B5CF6, #0891B2, #06B6D4, #0891B2, #8B5CF6, #6D28D9)',
              filter: 'blur(8px)',
              opacity: 0.8,
              animation: 'mobileBreathe 3s ease-in-out infinite'
            }}
          />
          
          {/* Main Violet/Teal Gradient Ring - 64px for mobile */}
          <div 
            className="relative rounded-full"
            style={{
              width: '64px',
              height: '64px',
              padding: '3px',
              background: 'conic-gradient(from 0deg, #6D28D9, #8B5CF6, #0891B2, #06B6D4, #0891B2, #8B5CF6, #6D28D9)',
              boxShadow: '0 0 20px rgba(109, 40, 217, 0.6), 0 0 40px rgba(8, 145, 178, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'
            }}
          >
            {/* Inner Container with Glassmorphism */}
            <div className="w-full h-full rounded-full bg-slate-900/90 backdrop-blur-sm p-[2px] overflow-hidden">
              {/* Photo Container with Cross-Fade */}
              <div className="relative w-full h-full rounded-full overflow-hidden">
                {coaches.map((coach, index) => (
                  <img
                    loading="lazy" key={coach.id}
                    src={coach.image}
                    alt={coach.name}
                    className="absolute inset-0 w-full h-full object-cover rounded-full"
                    style={{
                      opacity: index === currentCoachIndex ? 1 : 0,
                      transition: 'opacity 1s ease-in-out'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Online Indicator - Bottom Right */}
          <div 
            className="absolute flex items-center justify-center z-10"
            style={{
              bottom: '2px',
              right: '2px'
            }}
          >
            <span 
              className="absolute rounded-full"
              style={{
                width: '14px',
                height: '14px',
                backgroundColor: '#10B981',
                opacity: 0.6,
                animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
              }}
            />
            <span 
              className="relative rounded-full"
              style={{ 
                width: '10px',
                height: '10px',
                backgroundColor: '#10B981',
                border: '2px solid #1e1b4b',
                boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)'
              }}
            />
          </div>
        </button>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes mobileBreathe {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.6; 
          }
          50% { 
            transform: scale(1.08); 
            opacity: 0.9; 
          }
        }
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
