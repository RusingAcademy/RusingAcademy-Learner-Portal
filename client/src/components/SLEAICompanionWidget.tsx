import { useState, useEffect } from "react";

// Types
interface Coach {
  id: string;
  name: string;
  specialty: string;
  specialtyIcon: string;
  image: string;
}

// Coach data — only active coaches: Steven (FR) and Preciosa (EN)
const coaches: Coach[] = [
  {
    id: "steven",
    name: "Coach Steven",
    specialty: "Oral French (FSL)",
    specialtyIcon: "🇫🇷",
    image: "https://rusingacademy-cdn.b-cdn.net/images/coaches/Steven(2).webp"
  },
  {
    id: "preciosa",
    name: "Coach Preciosa",
    specialty: "Oral English (ESL)",
    specialtyIcon: "🇬🇧",
    image: "https://rusingacademy-cdn.b-cdn.net/images/coaches/Preciosa2.webp"
  }
];

// Menu options
const menuOptions = [
  {
    id: "flash",
    icon: "⚡",
    iconBg: "bg-gradient-to-br from-[#D97B3D] to-[#C65A1E]",
    title: "Flash Challenge (5 min)",
    subtitle: "Activate your vocabulary before a meeting."
  },
  {
    id: "scenarios",
    icon: "🏛️",
    iconBg: "bg-gradient-to-br from-slate-600 to-slate-800",
    title: "Government Scenarios",
    subtitle: "Realistic simulations: HR, Briefings, Policies."
  },
  {
    id: "simulator",
    icon: "🎯",
    iconBg: "bg-gradient-to-br from-[#C65A1E] to-red-600",
    title: "Oral Simulator (Levels B/C)",
    subtitle: "Test yourself against official criteria."
  },
  {
    id: "coaching",
    icon: "💚",
    iconBg: "bg-gradient-to-br from-emerald-400 to-green-600",
    title: "Strategic Coaching & Diagnosis",
    subtitle: "Stuck? Unlock your potential with a human expert."
  }
];

export default function SLEAICompanionWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<"select" | "menu" | "voice">("select");
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [currentCoachIndex, setCurrentCoachIndex] = useState(0);

  // Cross-fade animation - change coach every 4 seconds
  useEffect(() => {
    if (!isOpen) {
      const interval = setInterval(() => {
        setCurrentCoachIndex((prev) => (prev + 1) % coaches.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleWidgetClick = () => {
    setIsOpen(true);
    setCurrentScreen("select");
  };

  const handleCoachSelect = (coach: Coach) => {
    setSelectedCoach(coach);
    setCurrentScreen("menu");
  };

  const handleMenuSelect = (option: typeof menuOptions[0]) => {
    setSelectedTopic(option.title);
    setCurrentScreen("voice");
  };

  const handleBack = () => {
    if (currentScreen === "voice") {
      setCurrentScreen("menu");
    } else if (currentScreen === "menu") {
      setCurrentScreen("select");
      setSelectedCoach(null);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setCurrentScreen("select");
    setSelectedCoach(null);
    setSelectedTopic("");
  };

  return (
    <div className="relative">
      {/* Widget Button - Page 6 Style with Cross-Fade Animation */}
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={handleWidgetClick}
          className="relative group"
          aria-label="Open SLE AI Companion"
        >
          {/* Outer Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#0F3D3E] via-cyan-400 to-[#145A5B] rounded-full opacity-50 group-hover:opacity-75 blur-md transition-all duration-500 animate-pulse" />
          
          {/* Premium Violet/Cyan Ring - Page 6 Signature Style */}
          <div className="relative w-16 h-16 rounded-full p-[3px] bg-gradient-to-br from-[#0F3D3E] via-cyan-400 to-[#145A5B] shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-all duration-300">
            
            {/* Inner Glassmorphism Container */}
            <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm p-[2px] overflow-hidden">
              
              {/* Photo Container with Cross-Fade */}
              <div className="relative w-full h-full rounded-full overflow-hidden">
                {coaches.map((coach, index) => (
                  <img
                    loading="lazy" key={coach.id}
                    src={coach.image}
                    alt={coach.name}
                    className={`absolute inset-0 w-full h-full object-cover rounded-full transition-opacity duration-1000 ease-in-out ${
                      index === currentCoachIndex ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Golden Star Badge - Top Right (Page 6 Style) */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-[#E8A76B] via-yellow-400 to-[#C65A1E] rounded-full flex items-center justify-center shadow-lg shadow-amber-500/40 border border-[#FFE4D6]/50">
            <span className="text-[10px]">✨</span>
          </div>

          {/* Online Indicator - Bottom Right */}
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-lg">
            <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75" />
          </div>
        </button>

        {/* Label */}
        <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
          SLE AI Companion
        </span>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          {/* Modal Container */}
          <div 
            className={`relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-[#0F3D3E]/20 overflow-hidden transition-all duration-500 ${
              currentScreen === "voice" 
                ? "w-full max-w-lg h-[600px]" 
                : "w-full max-w-md"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative gradient border */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0F3D3E]/10 via-transparent to-cyan-500/10 pointer-events-none" />
            
            {/* Rainbow top border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0F3D3E] via-cyan-400 to-[#145A5B]" />

            {/* Screen 1: Coach Selector */}
            {currentScreen === "select" && (
              <div className="relative p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Choose Your Partner</h2>
                    <p className="text-sm text-cyan-400">Select your practice partner today</p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-8 h-8 rounded-full bg-slate-700/50 hover:bg-slate-600/50 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Coach Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {coaches.map((coach) => (
                    <button
                      key={coach.id}
                      onClick={() => handleCoachSelect(coach)}
                      className="group relative p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-[#0F3D3E]/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-violet-500/20"
                    >
                      {/* Coach Photo with Violet/Cyan Ring */}
                      <div className="relative w-20 h-20 mx-auto mb-3">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#0F3D3E] via-cyan-400 to-[#145A5B] rounded-full p-[2px] group-hover:shadow-lg group-hover:shadow-violet-500/40 transition-all">
                          <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
                            <img
                              loading="lazy" src={coach.image}
                              alt={coach.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Coach Info */}
                      <h3 className="text-white font-semibold text-sm mb-1">{coach.name}</h3>
                      <p className="text-cyan-400 text-xs flex items-center justify-center gap-1">
                        <span>{coach.specialtyIcon}</span>
                        <span>{coach.specialty}</span>
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Screen 2: Menu */}
            {currentScreen === "menu" && selectedCoach && (
              <div className="relative p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleBack}
                      className="w-8 h-8 rounded-full bg-slate-700/50 hover:bg-slate-600/50 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                    >
                      ‹
                    </button>
                    <div>
                      <h2 className="text-lg font-bold text-white">{selectedCoach.name}</h2>
                      <p className="text-sm text-cyan-400">{selectedCoach.specialty}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-8 h-8 rounded-full bg-slate-700/50 hover:bg-slate-600/50 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Selected Coach Card */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0F3D3E] via-cyan-400 to-[#145A5B] p-[2px]">
                    <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
                      <img
                        loading="lazy" src={selectedCoach.image}
                        alt={selectedCoach.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{selectedCoach.name}</h3>
                    <p className="text-cyan-400 text-sm">{selectedCoach.specialty}</p>
                  </div>
                </div>

                {/* Menu Options */}
                <div className="space-y-3">
                  {menuOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleMenuSelect(option)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 hover:bg-slate-700/50 border border-slate-700/30 hover:border-[#0F3D3E]/30 transition-all duration-300 group"
                    >
                      <div className={`w-12 h-12 rounded-xl ${option.iconBg} flex items-center justify-center text-xl shadow-lg`}>
                        {option.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="text-white font-semibold text-sm">{option.title}</h4>
                        <p className="text-slate-400 text-xs">{option.subtitle}</p>
                      </div>
                      <span className="text-slate-500 group-hover:text-[#0F3D3E] transition-colors">›</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Screen 3: Voice Mode (Gemini Style) */}
            {currentScreen === "voice" && selectedCoach && (
              <div className="relative h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleBack}
                      className="w-8 h-8 rounded-full bg-slate-700/50 hover:bg-slate-600/50 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                    >
                      ‹
                    </button>
                    <div>
                      <h2 className="text-sm font-semibold text-white">Session in Progress</h2>
                      <p className="text-xs text-cyan-400">{selectedTopic}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-8 h-8 rounded-full bg-slate-700/50 hover:bg-slate-600/50 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                  {/* Coach Avatar with Animated Ring */}
                  <div className="relative mb-6">
                    {/* Outer Glow */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-[#0F3D3E] via-cyan-400 to-[#145A5B] rounded-full opacity-30 blur-xl animate-pulse" />
                    
                    {/* Avatar Ring */}
                    <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-[#0F3D3E] via-cyan-400 to-[#145A5B] p-[3px] shadow-2xl shadow-violet-500/30">
                      <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
                        <img
                          loading="lazy" src={selectedCoach.image}
                          alt={selectedCoach.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Speaking Indicator */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500/90 rounded-full flex items-center gap-1.5 shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span className="text-white text-xs font-medium">Speaking...</span>
                    </div>
                  </div>

                  {/* Coach Name */}
                  <h3 className="text-xl font-bold text-white mb-1">{selectedCoach.name}</h3>
                  <p className="text-cyan-400 text-sm mb-6">{selectedTopic}</p>

                  {/* Waveform Animation */}
                  <div className="flex items-center justify-center gap-1 h-12 mb-6">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-gradient-to-t from-[#0F3D3E] to-cyan-400 rounded-full animate-pulse"
                        style={{
                          height: `${Math.random() * 100}%`,
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: `${0.5 + Math.random() * 0.5}s`
                        }}
                      />
                    ))}
                  </div>

                  {/* AI Message */}
                  <div className="w-full max-w-sm p-4 rounded-xl bg-slate-800/50 border border-slate-700/30 mb-6">
                    <p className="text-slate-300 text-sm italic text-center">
                      "Hello! I'm {selectedCoach.name.split(' ')[1] || selectedCoach.name}. Ready to work on your {selectedCoach.specialty.toLowerCase()} today. Let's begin when you're ready."
                    </p>
                  </div>
                </div>

                {/* Microphone Button */}
                <div className="p-6 flex flex-col items-center">
                  <button className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
                    </svg>
                  </button>
                  <span className="text-slate-400 text-xs mt-2">Tap to speak</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
