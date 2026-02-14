import { useState, useEffect } from "react";
import { Link } from "wouter";
import { X, Mic, ClipboardCheck, GraduationCap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// Steven's photo URL
const STEVEN_IMAGE = "https://rusingacademy-cdn.b-cdn.net/images/coaches/steven-barholere.jpg";

export default function ProfStevenChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showHeaderChatbot, setShowHeaderChatbot] = useState(false);
  const { language } = useLanguage();

  // Cycle header chatbot visibility: 4s visible every 30s
  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setShowHeaderChatbot(true);
      return;
    }

    // Initial delay before first show
    const initialTimeout = setTimeout(() => {
      if (!isOpen) {
        setShowHeaderChatbot(true);
        setTimeout(() => setShowHeaderChatbot(false), 4000);
      }
    }, 6000);

    // Cycle every 30 seconds
    const interval = setInterval(() => {
      if (!isOpen) {
        setShowHeaderChatbot(true);
        setTimeout(() => setShowHeaderChatbot(false), 4000);
      }
    }, 30000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isOpen]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const popup = document.getElementById('prof-steven-popup');
      const widget = document.getElementById('prof-steven-widget');
      const headerBtn = document.getElementById('prof-steven-header');
      
      if (isOpen && popup && !popup.contains(e.target as Node) && 
          widget && !widget.contains(e.target as Node) &&
          (!headerBtn || !headerBtn.contains(e.target as Node))) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const togglePopup = () => setIsOpen(!isOpen);

  const content = {
    en: {
      welcome: "Welcome to Lingueefy!",
      welcomeDesc: "I'm here to help you pass your GC Second Language Exams.",
      voicePractice: "Voice Practice Sessions",
      voicePracticeDesc: "Practice speaking with AI-powered conversation",
      placementTest: "SLE Placement Tests",
      placementTestDesc: "Assess your current level (A, B, or C)",
      examSimulation: "Oral Exam Simulations",
      examSimulationDesc: "Realistic mock exams with feedback",
      poweredBy: "Powered by Lingueefy",
      chatWith: "Chat with Prof. Steven",
      onlineNow: "Online now",
    },
    fr: {
      welcome: "Bienvenue sur Lingueefy!",
      welcomeDesc: "Je suis là pour vous aider à réussir vos examens de langue seconde du GC.",
      voicePractice: "Sessions de pratique vocale",
      voicePracticeDesc: "Pratiquez l'oral avec une conversation IA",
      placementTest: "Tests de placement ELS",
      placementTestDesc: "Évaluez votre niveau actuel (A, B ou C)",
      examSimulation: "Simulations d'examen oral",
      examSimulationDesc: "Examens simulés réalistes avec rétroaction",
      poweredBy: "Propulsé par Lingueefy",
      chatWith: "Discuter avec Prof. Steven",
      onlineNow: "En ligne maintenant",
    }
  };

  const t = content[language];

  return (
    <>
      {/* Bottom Floating Widget */}
      <div 
        id="prof-steven-widget"
        onClick={togglePopup}
        className="fixed bottom-6 right-6 z-[9997] cursor-pointer animate-fadeInUp"
        role="button"
        tabIndex={0}
        aria-label="Open Prof. Steven AI chatbot"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            togglePopup();
          }
        }}
      >
        {/* Pulse Ring */}
        <div className="absolute -inset-1.5 border-[3px] border-teal-500 rounded-full animate-ringPulse pointer-events-none" />
        
        {/* Avatar */}
        <img 
          loading="lazy" src={STEVEN_IMAGE} 
          alt="Prof. Steven Barholere"
          className="w-[70px] h-[70px] rounded-full object-cover border-4 border-teal-500 shadow-lg shadow-teal-500/40 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-teal-500/50 animate-breatheGlow"
        />
        
        {/* AI Badge */}
        <span className="absolute -top-1 -right-1 z-10 bg-gradient-to-br from-teal-500 to-teal-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-lg">
          AI
        </span>
        
        {/* Online Status Dot */}
        <span className="absolute bottom-1 right-1 z-10 w-3.5 h-3.5 bg-teal-500 border-[3px] border-white rounded-full animate-pulseDot" />
      </div>

      {/* Chatbot Popup */}
      <div 
        id="prof-steven-popup"
        role="dialog"
        aria-modal="true"
        aria-label="Prof. Steven AI chatbot popup"
        className={`fixed bottom-[120px] right-6 w-[380px] max-w-[calc(100vw-40px)] bg-white rounded-2xl shadow-2xl z-[10000] overflow-hidden font-sans transition-all duration-300 ${
          isOpen ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-5 scale-95 pointer-events-none'
        }`}
        style={{ display: isOpen ? 'block' : 'none' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-teal-500 to-teal-700 p-5 flex items-center gap-3 relative">
          <img 
            loading="lazy" src={STEVEN_IMAGE} 
            alt="Prof. Steven Barholere"
            className="w-14 h-14 rounded-full object-cover border-[3px] border-white shadow-lg"
          />
          <div>
            <h3 className="text-white text-lg font-extrabold flex items-center gap-2">
              Prof. Steven 
              <span className="bg-white/25 text-[11px] px-2 py-0.5 rounded-md font-extrabold">
                AI Assistant
              </span>
            </h3>
            <p className="text-white/90 text-sm">Your Personal SLE Language Coach</p>
          </div>
          <button 
            onClick={togglePopup}
            className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/35 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:rotate-90"
            aria-label="Close chatbot"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Welcome */}
          <div className="text-center mb-4">
            <h4 className="text-base font-extrabold text-gray-900 mb-2">👋 {t.welcome}</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{t.welcomeDesc}</p>
          </div>

          {/* 3 Main Options */}
          <div className="flex flex-col gap-2.5">
            {/* Voice Practice Sessions */}
            <Link href="/ai-coach?mode=voice" onClick={() => setIsOpen(false)}>
              <div className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 rounded-xl transition-all duration-300 border-2 border-transparent hover:border-teal-500 hover:translate-x-1 cursor-pointer">
                <div className="w-11 h-11 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h5 className="text-sm font-extrabold text-gray-900">{t.voicePractice}</h5>
                  <p className="text-xs text-gray-500">{t.voicePracticeDesc}</p>
                </div>
              </div>
            </Link>

            {/* SLE Placement Tests */}
            <Link href="/ai-coach?mode=placement" onClick={() => setIsOpen(false)}>
              <div className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl transition-all duration-300 border-2 border-transparent hover:border-blue-500 hover:translate-x-1 cursor-pointer">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <ClipboardCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h5 className="text-sm font-extrabold text-gray-900">{t.placementTest}</h5>
                  <p className="text-xs text-gray-500">{t.placementTestDesc}</p>
                </div>
              </div>
            </Link>

            {/* Oral Exam Simulations */}
            <Link href="/ai-coach?mode=simulation" onClick={() => setIsOpen(false)}>
              <div className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-[#E7F2F2] to-[#FFFFFF] hover:from-[#0F3D3E] hover:to-[#E06B2D] rounded-xl transition-all duration-300 border-2 border-transparent hover:border-[#0F3D3E] hover:translate-x-1 cursor-pointer">
                <div className="w-11 h-11 bg-gradient-to-br from-[#0F3D3E] to-[#145A5B] rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h5 className="text-sm font-extrabold text-gray-900">{t.examSimulation}</h5>
                  <p className="text-xs text-gray-500">{t.examSimulationDesc}</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-white text-center border-t border-gray-100">
          <span className="text-xs text-gray-500">⚡ {t.poweredBy}</span>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes breatheGlow {
          0%, 100% {
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            transform: translateY(0);
          }
          50% {
            box-shadow: 0 10px 34px rgba(20, 184, 166, 0.22);
            transform: translateY(-1px);
          }
        }

        @keyframes ringPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.5;
          }
        }

        @keyframes pulseDot {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.7);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 8px rgba(20, 184, 166, 0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out 1.2s both;
        }

        .animate-breatheGlow {
          animation: breatheGlow 3.2s ease-in-out infinite;
        }

        .animate-ringPulse {
          animation: ringPulse 2.6s ease-in-out infinite;
        }

        .animate-pulseDot {
          animation: pulseDot 2s infinite;
        }

        /* Pause animations on hover */
        #prof-steven-widget:hover .animate-ringPulse,
        #prof-steven-widget:hover .animate-pulseDot {
          animation-play-state: paused;
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .animate-fadeInUp,
          .animate-breatheGlow,
          .animate-ringPulse,
          .animate-pulseDot {
            animation: none !important;
          }
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          #prof-steven-widget {
            bottom: 20px;
            right: 20px;
          }
          #prof-steven-widget img {
            width: 60px;
            height: 60px;
          }
          #prof-steven-popup {
            bottom: 100px;
            right: 15px;
            left: 15px;
            width: auto;
          }
        }
      `}</style>
    </>
  );
}
