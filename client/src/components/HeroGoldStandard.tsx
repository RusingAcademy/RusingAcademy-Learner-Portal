import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, Calendar, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

/**
 * HeroGoldStandard Component - Premium High-End Design
 * 
 * Inspired by "Banana" reference images:
 * - Professional typewriter effect for headline
 * - Full-bleed background image (Steven + Ottawa Parliament)
 * - Premium glassmorphism with refined gold accents
 * - Harmonized shadows and spacing
 * - Smooth micro-interactions
 */

// Typewriter Hook - Professional typing animation
function useTypewriter(text: string, speed: number = 80, delay: number = 0) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setIsComplete(false);
    setHasStarted(false);

    const startTimeout = setTimeout(() => {
      setHasStarted(true);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, delay]);

  useEffect(() => {
    if (!hasStarted) return;

    if (displayedText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      setIsComplete(true);
    }
  }, [displayedText, text, speed, hasStarted]);

  return { displayedText, isComplete, hasStarted };
}

export default function HeroGoldStandard() {
  const { language } = useLanguage();
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

  const labels = {
    line1: { en: "CHOOSE", fr: "CHOISISSEZ" },
    line2: { en: "YOUR PATH", fr: "VOTRE PARCOURS" },
    line3: { en: "To Bilingual", fr: "Vers l'" },
    line4: { en: "Excellence", fr: "Excellence Bilingue" },
    subtitle: {
      en: "Built for Canadian public servants: SLE-focused learning, expert coaching, and premium media—so teams perform confidently in both official languages.",
      fr: "Conçu pour les fonctionnaires canadiens : apprentissage axé ELS, coaching d'experts et médias premium — pour des équipes confiantes dans les deux langues officielles.",
    },
    cta1: { en: "Explore Ecosystem", fr: "Explorer l'écosystème" },
    cta2: { en: "Book a Diagnostic", fr: "Réserver un diagnostic" },
    tagline: {
      en: "Secure your C level. Propel your federal career.",
      fr: "Sécurisez votre niveau C. Propulsez votre carrière fédérale."
    },
  };

  // Typewriter animations with staggered delays
  const line1 = useTypewriter(labels.line1[language], 90, 400);
  const line2 = useTypewriter(labels.line2[language], 80, 400 + labels.line1[language].length * 90 + 200);
  
  // Show italic text after typewriter completes
  useEffect(() => {
    if (line2.isComplete) {
      const timeout = setTimeout(() => setShowSubtitle(true), 300);
      return () => clearTimeout(timeout);
    }
  }, [line2.isComplete]);

  // Show CTA after subtitle
  useEffect(() => {
    if (showSubtitle) {
      const timeout = setTimeout(() => setShowCTA(true), 600);
      return () => clearTimeout(timeout);
    }
  }, [showSubtitle]);

  return (
    <section className="relative z-10 w-full">
      {/* Hero Container */}
      <div className="relative w-full min-h-[580px] md:min-h-[620px] lg:min-h-[680px] xl:min-h-[720px] overflow-hidden">
        
        {/* Background Image Layer */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: "url('https://rusingacademy-cdn.b-cdn.net/images/hero/hero-background-v4.png')",
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Subtle gradient overlay for depth */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(
                90deg,
                rgba(0, 0, 0, 0.06) 0%,
                rgba(0, 0, 0, 0.02) 25%,
                transparent 45%,
                transparent 100%
              )
            `,
          }}
        />

        {/* Content Container */}
        <div className="relative z-10 container mx-auto px-6 md:px-8 lg:px-12 lg:px-8 h-full min-h-[580px] md:min-h-[620px] lg:min-h-[680px] xl:min-h-[720px]">
          <div className="flex items-center h-full py-10 lg:py-14">
            
            {/* Left Side: Glass Panel - Shifted right to reveal Canada flag */}
            <motion.div
              initial={{ opacity: 0, x: -30, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full max-w-[440px] lg:max-w-[470px] xl:max-w-[500px] ml-8 sm:ml-12 lg:ml-20 xl:ml-28"
            >
              {/* Premium Gold border container */}
              <div 
                className="relative rounded-[24px] p-[2.5px]"
                style={{
                  background: `
                    linear-gradient(
                      145deg,
                      rgba(212, 175, 105, 0.55) 0%,
                      rgba(232, 200, 120, 0.35) 25%,
                      rgba(212, 175, 105, 0.45) 50%,
                      rgba(184, 150, 74, 0.35) 75%,
                      rgba(212, 175, 105, 0.55) 100%
                    )
                  `,
                  boxShadow: `
                    0 30px 60px -15px rgba(0, 0, 0, 0.12),
                    0 15px 30px -10px rgba(0, 0, 0, 0.08),
                    0 0 0 1px rgba(212, 175, 105, 0.1)
                  `,
                }}
              >
                {/* Glass Panel - Premium Glassmorphism */}
                <div 
                  className="relative rounded-[22px] p-7 sm:p-9 lg:p-10 overflow-hidden"
                  style={{
                    background: `
                      linear-gradient(
                        160deg,
                        rgba(255, 254, 252, 0.94) 0%,
                        rgba(255, 253, 250, 0.90) 30%,
                        rgba(253, 251, 248, 0.87) 60%,
                        rgba(251, 249, 246, 0.85) 100%
                      )
                    `,
                    backdropFilter: "blur(24px) saturate(1.3)",
                    WebkitBackdropFilter: "blur(24px) saturate(1.3)",
                    boxShadow: `
                      inset 0 1px 3px rgba(255, 255, 255, 0.9),
                      inset 0 -1px 2px rgba(0, 0, 0, 0.02)
                    `,
                  }}
                >
                  {/* Inner highlight shimmer */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-28 rounded-t-[22px] pointer-events-none"
                    style={{
                      background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.6) 0%, transparent 100%)",
                    }}
                  />

                  {/* === ALL CONTENT INSIDE === */}
                  <div className="relative z-10">
                    
                    {/* Headline with Typewriter Effect */}
                    <div className="space-y-0 min-h-[170px] sm:min-h-[190px] lg:min-h-[210px]">
                      
                      {/* Line 1: CHOOSE - Typewriter */}
                      <div className="relative">
                        <h1
                          className="text-[1.85rem] sm:text-4xl lg:text-[2.6rem] xl:text-[2.85rem] font-black uppercase tracking-tight leading-[0.95]"
                          style={{ 
                            color: "#B8293D",
                            letterSpacing: "-0.02em",
                            textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                          }}
                        >
                          {line1.displayedText}
                          {/* Blinking cursor */}
                          {line1.hasStarted && !line1.isComplete && (
                            <motion.span
                              animate={{ opacity: [1, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
                              className="inline-block w-[3px] h-[0.85em] ml-1 align-middle rounded-sm"
                              style={{ backgroundColor: "#B8293D" }}
                            />
                          )}
                        </h1>
                      </div>

                      {/* Line 2: YOUR PATH - Typewriter */}
                      <div className="relative">
                        <h1
                          className="text-[1.85rem] sm:text-4xl lg:text-[2.6rem] xl:text-[2.85rem] font-black uppercase tracking-tight leading-[0.95]"
                          style={{ 
                            color: "#B8293D",
                            letterSpacing: "-0.02em",
                            textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                          }}
                        >
                          {line2.displayedText}
                          {/* Blinking cursor */}
                          {line2.hasStarted && !line2.isComplete && (
                            <motion.span
                              animate={{ opacity: [1, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
                              className="inline-block w-[3px] h-[0.85em] ml-1 align-middle rounded-sm"
                              style={{ backgroundColor: "#B8293D" }}
                            />
                          )}
                        </h1>
                      </div>

                      {/* Lines 3-4: To Bilingual Excellence - Elegant fade in */}
                      <AnimatePresence>
                        {showSubtitle && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          >
                            <h2
                              className="text-xl sm:text-2xl lg:text-[1.65rem] xl:text-[1.85rem] font-normal text-slate-700 italic leading-[1.2] pt-1"
                              style={{ 
                                fontFamily: "'Playfair Display', Georgia, serif",
                              }}
                            >
                              {labels.line3[language]}
                            </h2>
                            <h2
                              className="text-xl sm:text-2xl lg:text-[1.65rem] xl:text-[1.85rem] font-normal text-slate-700 italic leading-[1.2]"
                              style={{ 
                                fontFamily: "'Playfair Display', Georgia, serif",
                              }}
                            >
                              {labels.line4[language]}
                            </h2>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      {/* Tagline - French accent phrase */}
                      <AnimatePresence>
                        {showSubtitle && (
                          <motion.p
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.15 }}
                            className="text-sm sm:text-base lg:text-[15px] font-medium text-amber-700 mt-3 tracking-wide"
                            style={{ 
                              fontFamily: "'Inter', sans-serif",
                              letterSpacing: "0.01em",
                            }}
                          >
                            {labels.tagline[language]}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Gold decorative line */}
                    <AnimatePresence>
                      {showSubtitle && (
                        <motion.div
                          initial={{ opacity: 0, scaleX: 0 }}
                          animate={{ opacity: 1, scaleX: 1 }}
                          transition={{ duration: 0.7, delay: 0.1 }}
                          className="my-5 h-[2px] w-24 origin-left rounded-full"
                          style={{
                            background: "linear-gradient(90deg, #D4AF69 0%, #E8C878 50%, rgba(212, 175, 105, 0.15) 100%)",
                          }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Subtitle */}
                    <AnimatePresence>
                      {showSubtitle && (
                        <motion.p
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                          className="text-[13px] sm:text-sm lg:text-[13.5px] text-slate-600 leading-[1.75] max-w-[380px]"
                        >
                          {labels.subtitle[language]}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {/* CTA Buttons */}
                    <AnimatePresence>
                      {showCTA && (
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6 }}
                          className="mt-7 flex flex-col sm:flex-row gap-3"
                        >
                          {/* Primary CTA - Orange Gradient */}
                          <a href="#ecosystem">
                            <Button
                              size="default"
                              className="group w-full sm:w-auto px-6 py-5 text-sm font-bold rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                              style={{ 
                                background: "linear-gradient(135deg, #FF6A2B 0%, #FF8142 50%, #FF9A5C 100%)",
                                color: "white",
                                boxShadow: `
                                  0 10px 25px -5px rgba(255, 106, 43, 0.45),
                                  0 4px 8px rgba(0, 0, 0, 0.06),
                                  inset 0 1px 0 rgba(255, 255, 255, 0.2)
                                `,
                              }}
                            >
                              <Sparkles className="mr-2 w-4 h-4" />
                              {labels.cta1[language]}
                              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                          </a>

                          {/* Secondary CTA - Premium Gold border */}
                          <a 
                            href="https://calendly.com/steven-barholere/30min" 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Button
                              size="default"
                              variant="outline"
                              className="group w-full sm:w-auto px-5 py-5 text-sm font-semibold rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                              style={{
                                background: "rgba(255, 255, 255, 0.9)",
                                border: "2px solid rgba(212, 175, 105, 0.5)",
                                color: "#5a5a5a",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
                              }}
                            >
                              <Calendar className="mr-2 w-4 h-4 text-amber-600" />
                              {labels.cta2[language]}
                            </Button>
                          </a>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Side: Empty - Steven in background */}
            <div className="hidden lg:block flex-1" />
          </div>
        </div>

        {/* Bottom fade - seamless transition */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.5) 50%, transparent 100%)",
          }}
        />
      </div>

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&display=swap');
      `}</style>
    </section>
  );
}
