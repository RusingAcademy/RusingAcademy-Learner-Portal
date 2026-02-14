import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// Header is now global via EcosystemLayout
import FooterInstitutional from "@/components/FooterInstitutional";
import CrossEcosystemSection from "@/components/CrossEcosystemSection";
import FeaturedCoaches from "@/components/FeaturedCoaches";
// ProfStevenChatbot removed - replaced by SLE AI Companion widget in header
// Removed duplicate sections that exist on hub (/)
// TrustedByPublicServants, TheyTrustedUs, MeetOurExperts, LearningCapsules
// These sections are now only on the Ecosystem Landing page
import YouTubeVideos from "@/components/homepage/YouTubeVideos";
import EcosystemBrands from "@/components/homepage/EcosystemBrands";
import { YouTubeModal } from "@/components/YouTubeModal";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  GraduationCap,
  Users,
  Bot,
  Calendar,
  Star,
  ArrowRight,
  CheckCircle2,
  Globe,
  Clock,
  Award,
  MessageSquare,
  Play,
  Sparkles,
  Quote,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Trophy,
  ChevronDown,
  HelpCircle,
  Shield,
  Zap,
  Building2,
  UserCircle,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { COACHING_PLAN_PRICES } from "@shared/pricing";

// Typewriter Component with Sound
function TypewriterTitle({ 
  text, 
  highlightText, 
  onComplete 
}: { 
  text: string; 
  highlightText: string; 
  onComplete?: () => void;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [cycleKey, setCycleKey] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const prefersReducedMotion = useRef(false);
  const lastSoundTime = useRef(0);
  const prevTextRef = useRef("");
  const fullText = `${text} ${highlightText}`;
  
  useEffect(() => {
    if (prevTextRef.current && prevTextRef.current !== fullText) {
      setCycleKey(prev => prev + 1);
    }
    prevTextRef.current = fullText;
  }, [fullText]);
  
  const CHAR_SPEED = 120;
  const START_DELAY = 1000;
  const REPEAT_INTERVAL = 6000;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mediaQuery.matches;

    if (mediaQuery.matches) {
      setDisplayedText(fullText);
      setIsComplete(true);
      onComplete?.();
    }

    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [fullText, onComplete]);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {}
    }
    return audioContextRef.current;
  }, []);

  const playTypeSound = useCallback(() => {
    if (prefersReducedMotion.current) return;

    try {
      const now = Date.now();
      if (now - lastSoundTime.current < 60) return;
      lastSoundTime.current = now;

      const audioContext = getAudioContext();
      if (!audioContext) return;
      
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      const currentTime = audioContext.currentTime;
      const pitchVar = Math.random() * 0.3 + 0.85;
      const volumeVar = Math.random() * 0.2 + 0.9;

      const clackOsc = audioContext.createOscillator();
      const clackGain = audioContext.createGain();
      const clackFilter = audioContext.createBiquadFilter();
      clackOsc.connect(clackFilter);
      clackFilter.connect(clackGain);
      clackGain.connect(audioContext.destination);
      clackOsc.type = "sawtooth";
      clackFilter.type = "bandpass";
      clackFilter.frequency.setValueAtTime(2500 * pitchVar, currentTime);
      clackFilter.Q.setValueAtTime(2, currentTime);
      clackOsc.frequency.setValueAtTime(800 * pitchVar, currentTime);
      clackOsc.frequency.exponentialRampToValueAtTime(200, currentTime + 0.015);
      clackGain.gain.setValueAtTime(0.25 * volumeVar, currentTime);
      clackGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.04);
      clackOsc.start(currentTime);
      clackOsc.stop(currentTime + 0.04);

      const clickOsc = audioContext.createOscillator();
      const clickGain = audioContext.createGain();
      clickOsc.connect(clickGain);
      clickGain.connect(audioContext.destination);
      clickOsc.type = "square";
      clickOsc.frequency.setValueAtTime(3500 * pitchVar, currentTime);
      clickOsc.frequency.exponentialRampToValueAtTime(1500, currentTime + 0.008);
      clickGain.gain.setValueAtTime(0.08 * volumeVar, currentTime);
      clickGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.012);
      clickOsc.start(currentTime);
      clickOsc.stop(currentTime + 0.012);

      const thunkOsc = audioContext.createOscillator();
      const thunkGain = audioContext.createGain();
      thunkOsc.connect(thunkGain);
      thunkGain.connect(audioContext.destination);
      thunkOsc.type = "sine";
      thunkOsc.frequency.setValueAtTime(180 * pitchVar, currentTime + 0.01);
      thunkOsc.frequency.exponentialRampToValueAtTime(60, currentTime + 0.05);
      thunkGain.gain.setValueAtTime(0, currentTime);
      thunkGain.gain.linearRampToValueAtTime(0.15 * volumeVar, currentTime + 0.012);
      thunkGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.08);
      thunkOsc.start(currentTime);
      thunkOsc.stop(currentTime + 0.08);

      const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.02, audioContext.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseData.length; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseData.length * 0.1));
      }
      const noiseSource = audioContext.createBufferSource();
      const noiseGain = audioContext.createGain();
      const noiseFilter = audioContext.createBiquadFilter();
      noiseSource.buffer = noiseBuffer;
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(audioContext.destination);
      noiseFilter.type = "highpass";
      noiseFilter.frequency.setValueAtTime(4000, currentTime);
      noiseGain.gain.setValueAtTime(0.06 * volumeVar, currentTime);
      noiseSource.start(currentTime);

      const bellOsc = audioContext.createOscillator();
      const bellGain = audioContext.createGain();
      bellOsc.connect(bellGain);
      bellGain.connect(audioContext.destination);
      bellOsc.type = "sine";
      bellOsc.frequency.setValueAtTime(1200 * pitchVar, currentTime);
      bellGain.gain.setValueAtTime(0.02 * volumeVar, currentTime);
      bellGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.1);
      bellOsc.start(currentTime);
      bellOsc.stop(currentTime + 0.1);

    } catch (e) {}
  }, [getAudioContext]);

  useEffect(() => {
    if (prefersReducedMotion.current) return;

    setDisplayedText("");
    setIsComplete(false);
    setIsTyping(false);

    const startTimeout = setTimeout(() => {
      setIsTyping(true);
    }, START_DELAY);

    return () => clearTimeout(startTimeout);
  }, [cycleKey]);

  useEffect(() => {
    if (!isTyping || isComplete || prefersReducedMotion.current) return;

    if (displayedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(fullText.slice(0, displayedText.length + 1));
        playTypeSound();
      }, CHAR_SPEED);

      return () => clearTimeout(timeout);
    } else {
      setIsComplete(true);
      setIsTyping(false);
      onComplete?.();
      
      const repeatTimeout = setTimeout(() => {
        setCycleKey(prev => prev + 1);
      }, REPEAT_INTERVAL);
      
      return () => clearTimeout(repeatTimeout);
    }
  }, [displayedText, fullText, isTyping, isComplete, playTypeSound, onComplete]);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const mainTextLength = text.length;
  const displayedMainText = displayedText.slice(0, mainTextLength);
  const displayedHighlight = displayedText.slice(mainTextLength + 1);
  const isTypingHighlight = displayedText.length > mainTextLength;
  
  const cursorColorClass = isTypingHighlight 
    ? "bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.8)]"
    : "bg-gray-800 dark:bg-gray-200";

  return (
    <span>
      {displayedMainText}
      {displayedText.length > mainTextLength && " "}
      {displayedHighlight && (
        <span className="text-teal-600">{displayedHighlight}</span>
      )}
      {!isComplete && (
        <span 
          className={`inline-block w-[3px] h-[1em] ml-1 align-middle transition-all duration-300 ${cursorColorClass} ${isTypingHighlight ? 'animate-pulse-glow' : 'animate-blink'}`}
          aria-hidden="true"
        />
      )}
    </span>
  );
}

// Animated Counter Component
function AnimatedCounter({ 
  end, 
  duration = 2000, 
  suffix = "",
  prefix = ""
}: { 
  end: number; 
  duration?: number; 
  suffix?: string;
  prefix?: string;
}) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isVisible, end, duration]);

  return (
    <div ref={counterRef} className="text-4xl md:text-5xl font-black text-teal-600">
      {prefix}{count.toLocaleString()}{suffix}
    </div>
  );
}

// Testimonials Carousel Component - Temporarily hidden until authentic testimonials are available
// TODO: Re-enable when real testimonials are collected
/*
function TestimonialsCarousel({ testimonials }: { testimonials: Array<{
  name: string;
  role: string;
  image: string;
  quote: string;
  rating: number;
  level: string;
}> }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, testimonials.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="w-full flex-shrink-0 px-4"
            >
              <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-slate-50 to-teal-50/30 rounded-3xl p-8 md:p-12 shadow-xl relative">
                  <div className="absolute top-8 right-8 text-teal-100">
                    <Quote className="h-20 w-20" aria-hidden="true" />
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <img 
                          loading="lazy" src={testimonial.image} 
                          alt={testimonial.name}
                          className="h-32 w-32 md:h-40 md:w-40 rounded-full object-cover border-4 border-teal-200 shadow-xl"
                        />
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-teal-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                          {testimonial.level}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-6 italic">
                        "{testimonial.quote}"
                      </p>
                      <div className="flex gap-1 justify-center md:justify-start mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-6 w-6 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <div>
                        <p className="font-bold text-xl text-foreground">{testimonial.name}</p>
                        <p className="text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button 
        onClick={goToPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:translate-x-0 h-12 w-12 rounded-full bg-white shadow-lg flex items-center justify-center text-teal-600 hover:bg-teal-50 transition-colors z-10"
        aria-label="Previous testimonial"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button 
        onClick={goToNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-0 h-12 w-12 rounded-full bg-white shadow-lg flex items-center justify-center text-teal-600 hover:bg-teal-50 transition-colors z-10"
        aria-label="Next testimonial"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
      <div className="flex justify-center gap-2 mt-8">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'w-8 bg-teal-500' 
                : 'w-3 bg-teal-200 hover:bg-teal-300'
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
*/

// FAQ Accordion Component
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { language } = useLanguage();

  const faqs = [
    {
      question: language === 'fr' ? "Qu'est-ce que l'examen SLE ?" : "What is the SLE exam?",
      answer: language === 'fr' 
        ? "L'Évaluation de langue seconde (ELS) est un test standardisé utilisé par le gouvernement fédéral du Canada pour évaluer les compétences linguistiques des employés en français et en anglais. Il comprend trois composantes : compréhension de l'écrit, expression écrite et compétence orale."
        : "The Second Language Evaluation (SLE) is a standardized test used by the Canadian federal government to assess employees' language proficiency in French and English. It consists of three components: Reading Comprehension, Written Expression, and Oral Proficiency."
    },
    {
      question: language === 'fr' ? "Que signifient les niveaux BBB, CBC et CCC ?" : "What do BBB, CBC, and CCC levels mean?",
      answer: language === 'fr'
        ? "Ces codes représentent les niveaux de compétence linguistique : A (débutant), B (intermédiaire) et C (avancé). BBB signifie niveau intermédiaire dans les trois compétences. CBC signifie avancé en lecture, intermédiaire en écriture et avancé à l'oral. CCC représente le niveau avancé dans toutes les compétences."
        : "These codes represent language proficiency levels: A (beginner), B (intermediate), and C (advanced). BBB means intermediate level in all three skills. CBC means advanced in reading, intermediate in writing, and advanced in oral. CCC represents advanced level in all skills."
    },
    {
      question: language === 'fr' ? "Combien de temps faut-il pour se préparer à l'examen SLE ?" : "How long does it take to prepare for the SLE exam?",
      answer: language === 'fr'
        ? "Le temps de préparation varie selon votre niveau actuel et votre objectif. En moyenne, nos apprenants atteignent leur niveau cible en 3-4 mois avec des sessions régulières (2-3 par semaine). Notre méthodologie de coaching accélère l'apprentissage de 3-4× par rapport aux méthodes traditionnelles."
        : "Preparation time varies based on your current level and target. On average, our learners achieve their target level in 3-4 months with regular sessions (2-3 per week). Our coaching methodology accelerates learning 3-4× faster than traditional methods."
    },
    {
      question: language === 'fr' ? "Comment fonctionne SLE AI Companion AI ?" : "How does SLE AI Companion AI work?",
      answer: language === 'fr'
        ? "SLE AI Companion AI est notre assistant d'entraînement disponible 24/7 qui simule des conversations d'examen oral, fournit des commentaires instantanés sur votre prononciation et grammaire, et vous aide à pratiquer entre les sessions de coaching. Il complète vos sessions avec un coach humain pour une préparation optimale."
        : "SLE AI Companion AI is our 24/7 practice assistant that simulates oral exam conversations, provides instant feedback on your pronunciation and grammar, and helps you practice between coaching sessions. It complements your sessions with a human coach for optimal preparation."
    },
    {
      question: language === 'fr' ? "Puis-je choisir mon propre coach ?" : "Can I choose my own coach?",
      answer: language === 'fr'
        ? "Absolument ! Vous pouvez parcourir les profils de nos 7 coachs certifiés, voir leurs spécialités, disponibilités et avis des apprenants. Vous pouvez réserver une session d'essai gratuite pour trouver le coach qui correspond le mieux à votre style d'apprentissage."
        : "Absolutely! You can browse our 7 certified coaches' profiles, see their specialties, availability, and learner reviews. You can book a free trial session to find the coach that best matches your learning style."
    },
    {
      question: language === 'fr' ? "Offrez-vous des forfaits pour les ministères ?" : "Do you offer packages for departments?",
      answer: language === 'fr'
        ? "Oui, nous offrons des forfaits corporatifs pour les ministères et agences fédéraux. Ces forfaits incluent des tarifs préférentiels, des rapports de progression pour les gestionnaires, et des programmes de formation personnalisés. Contactez-nous pour une soumission."
        : "Yes, we offer corporate packages for federal departments and agencies. These packages include preferential rates, progress reports for managers, and customized training programs. Contact us for a quote."
    },
  ];

  return (
    <section 
      className="py-24 relative overflow-hidden bg-gradient-to-br from-slate-50 to-teal-50/30"
      aria-labelledby="faq-title"
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 rounded-full px-4 py-2 text-sm font-medium mb-6">
            <HelpCircle className="h-4 w-4" />
            {language === 'fr' ? 'Questions Fréquentes' : 'Frequently Asked Questions'}
          </div>
          <h2 id="faq-title" className="text-3xl md:text-4xl font-bold mb-4">
            {language === 'fr' ? 'Tout ce que vous devez savoir sur l\'ELS' : 'Everything You Need to Know About the SLE'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {language === 'fr' 
              ? 'Trouvez des réponses aux questions les plus courantes sur les examens SLE et notre plateforme de coaching.'
              : 'Find answers to the most common questions about SLE exams and our coaching platform.'}
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-md"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
                aria-expanded={openIndex === index}
              >
                <span className="font-semibold text-lg text-foreground pr-4">{faq.question}</span>
                <ChevronDown 
                  className={`h-5 w-5 text-teal-600 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-5 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            {language === 'fr' ? 'Vous avez d\'autres questions ?' : 'Still have questions?'}
          </p>
          <Link href="/contact">
            <Button variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50 rounded-full px-8">
              {language === 'fr' ? 'Contactez-nous' : 'Contact Us'}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { t, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [youtubeModalOpen, setYoutubeModalOpen] = useState(false);
  const [purchasingPlan, setPurchasingPlan] = useState<string | null>(null);

  // Stripe checkout mutation for coaching plans
  const checkoutMutation = trpc.stripe.createCoachingPlanCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.success(
          language === 'fr' ? "Redirection vers le paiement..." : "Redirecting to checkout...",
          { description: language === 'fr' ? "Vous allez être redirigé vers Stripe pour compléter votre achat." : "You will be redirected to Stripe to complete your purchase." }
        );
        window.open(data.url, '_blank');
      }
      setPurchasingPlan(null);
    },
    onError: (error) => {
      toast.error(
        language === 'fr' ? "Erreur" : "Error",
        { description: error.message || (language === 'fr' ? "Une erreur est survenue. Veuillez réessayer." : "An error occurred. Please try again.") }
      );
      setPurchasingPlan(null);
    },
  });

  // Handle plan purchase
  const handlePlanPurchase = (planId: string) => {
    if (!isAuthenticated) {
      toast.info(
        language === 'fr' ? "Connexion requise" : "Login Required",
        { description: language === 'fr' ? "Veuillez vous connecter pour acheter un plan." : "Please log in to purchase a plan." }
      );
      window.location.href = getLoginUrl();
      return;
    }
    setPurchasingPlan(planId);
    checkoutMutation.mutate({ planId, locale: language });
  };

  // Testimonials data - temporarily removed until authentic testimonials are available
  // TODO: Re-enable when real testimonials are collected

  // Statistics data
  const statistics = [
    {
      icon: Users,
      value: 500,
      suffix: "+",
      label: "Public Servants Trained",
      description: "Federal employees who achieved their SLE goals",
    },
    {
      icon: TrendingUp,
      value: 95,
      suffix: "%",
      label: "Success Rate",
      description: "Learners who passed their target SLE level",
    },
    {
      icon: UserCheck,
      value: 7,
      suffix: "",
      label: "Certified Coaches",
      description: "Expert SLE coaches ready to help you",
    },
    {
      icon: Trophy,
      value: 1200,
      suffix: "+",
      label: "Lessons Delivered",
      description: "Hours of personalized coaching sessions",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Lingueefy - Find Your SLE Coach"
        description="Connect with expert SLE coaches and practice 24/7 with SLE AI Companion AI. Achieve your BBB, CBC, or CCC goals faster with personalized coaching for Canadian public servants."
        canonical="https://www.rusingacademy.ca/lingueefy"
      />
      {/* Global Header is now rendered by EcosystemLayout wrapper */}

      <main id="main-content" className="flex-1">
        {/* Featured Coaches Section - Now the Hero */}
        <FeaturedCoaches />

        {/* Animated Statistics Section - Reduced vertical height */}
        <section className="py-10 bg-gradient-to-r from-teal-600 to-teal-700 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10" style={{backgroundColor: '#ffffff'}}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {statistics.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-white/20 mb-2">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl md:text-4xl font-black text-white mb-1">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-base font-semibold text-white/90">{stat.label}</p>
                  <p className="text-xs text-white/70 mt-0.5 hidden md:block">{stat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Video Presentation Section - MOVED TO END OF PAGE */}

        {/* Featured Coaches Section - MOVED RIGHT AFTER HERO */}

        {/* Ecosystem Brands Bar - REMOVED BY USER REQUEST */}
        {/* <EcosystemBrands /> */}

        {/* YouTube Videos & Podcasts - REMOVED BY USER REQUEST */}
        {/* <YouTubeVideos /> */}

        {/* Plans Maison Section - Coaching Packages */}
        <section 
          className="py-24 relative overflow-hidden bg-gradient-to-br from-slate-50 to-teal-50/30"
          aria-labelledby="plans-title"
        >
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 rounded-full px-4 py-2 text-sm font-medium mb-6">
                <Shield className="h-4 w-4" />
                {t("plans.badge")}
              </div>
              <h2 id="plans-title" className="text-3xl md:text-4xl font-bold mb-4">{t("plans.title")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                {t("plans.subtitle")}
              </p>
            </div>

            {/* Two Options: Marketplace vs Plans Maison */}
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
              {/* Marketplace Option */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#D97B3D] to-[#C65A1E] flex items-center justify-center shadow-lg">
                    <UserCircle className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">{t("plans.marketplace.title")}</h3>
                    <p className="text-sm text-muted-foreground">{t("plans.marketplace.subtitle")}</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-6">{t("plans.marketplace.description")}</p>
                <ul className="space-y-3 mb-8">
                  {[t("plans.marketplace.feature1"), t("plans.marketplace.feature2"), t("plans.marketplace.feature3")].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-amber-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/coaches">
                  <Button className="w-full bg-gradient-to-r from-[#C65A1E] to-[#C65A1E] hover:from-[#A84A15] hover:to-[#A84A15] text-white rounded-full">
                    {t("plans.marketplace.cta")} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Plans Maison Option */}
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-3xl p-8 shadow-lg border-2 border-teal-200 hover:shadow-xl transition-shadow relative">
                <div className="absolute -top-3 right-6 bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {t("plans.recommended")}
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg">
                    <Building2 className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">{t("plans.maison.title")}</h3>
                    <p className="text-sm text-muted-foreground">{t("plans.maison.subtitle")}</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-6">{t("plans.maison.description")}</p>
                <ul className="space-y-3 mb-8">
                  {[t("plans.maison.feature1"), t("plans.maison.feature2"), t("plans.maison.feature3"), t("plans.maison.feature4")].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-teal-600 flex-shrink-0" />
                      <span className="text-sm font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-full"
                  onClick={() => document.getElementById('pricing-plans')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {t("plans.maison.cta")} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Pricing Plans */}
            <div id="pricing-plans" className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Starter Plan */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="text-center mb-8">
                  <h3 className="font-bold text-xl mb-2">{t("plans.starter.name")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{t("plans.starter.description")}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-black text-teal-600">{COACHING_PLAN_PRICES.STARTER.priceDisplay}</span>
                    <span className="text-muted-foreground">/ 10h</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {["10 hours of coaching", "1 certified coach", "Flexible scheduling", "Progress tracking", "Email support"].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-teal-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full border-teal-600 text-teal-600 hover:bg-teal-50 rounded-full"
                  onClick={() => handlePlanPurchase('starter-plan')}
                  disabled={purchasingPlan === 'starter-plan'}
                >
                  {purchasingPlan === 'starter-plan' ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-teal-600 border-t-transparent rounded-full" />
                      {language === 'fr' ? 'Chargement...' : 'Loading...'}
                    </span>
                  ) : t("plans.getStarted")}
                </Button>
              </div>

              {/* Accelerator Plan - Featured */}
              <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-3xl p-8 shadow-2xl text-white relative transform md:-translate-y-4">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 text-xs font-bold px-4 py-1 rounded-full">
                  {t("plans.mostPopular")}
                </div>
                <div className="text-center mb-8">
                  <h3 className="font-bold text-xl mb-2">{t("plans.accelerator.name")}</h3>
                  <p className="text-sm text-teal-100 mb-4">{t("plans.accelerator.description")}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-black">{COACHING_PLAN_PRICES.ACCELERATOR.priceDisplay}</span>
                    <span className="text-teal-200">/ 20h</span>
                  </div>
                  <p className="text-xs text-amber-300 mt-2">{t("plans.accelerator.savings")}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {["20 hours of coaching", "Dedicated success manager", "SLE AI Companion access", "Mock exam simulations", "Priority scheduling", "24/7 support"].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-amber-300 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full bg-white text-teal-600 hover:bg-teal-50 rounded-full font-semibold"
                  onClick={() => handlePlanPurchase('accelerator-plan')}
                  disabled={purchasingPlan === 'accelerator-plan'}
                >
                  {purchasingPlan === 'accelerator-plan' ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      {language === 'fr' ? 'Chargement...' : 'Loading...'}
                    </span>
                  ) : t("plans.getStarted")}
                </Button>
              </div>

              {/* Immersion Plan */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="text-center mb-8">
                  <h3 className="font-bold text-xl mb-2">{t("plans.immersion.name")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{t("plans.immersion.description")}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-black text-teal-600">{COACHING_PLAN_PRICES.IMMERSION.priceDisplay}</span>
                    <span className="text-muted-foreground">/ 40h</span>
                  </div>
                  <p className="text-xs text-green-600 mt-2">{t("plans.immersion.savings")}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {["40 hours of coaching", "2 specialized coaches", "Full SLE AI access", "Unlimited simulations", "Guaranteed results", "VIP support"].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-teal-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full border-teal-600 text-teal-600 hover:bg-teal-50 rounded-full"
                  onClick={() => handlePlanPurchase('immersion-plan')}
                  disabled={purchasingPlan === 'immersion-plan'}
                >
                  {purchasingPlan === 'immersion-plan' ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-teal-600 border-t-transparent rounded-full" />
                      {language === 'fr' ? 'Chargement...' : 'Loading...'}
                    </span>
                  ) : t("plans.getStarted")}
                </Button>
              </div>
            </div>

            {/* Guarantees */}
            <div className="mt-16 text-center">
              <div className="inline-flex flex-wrap justify-center gap-6 bg-white rounded-2xl px-8 py-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-teal-600" />
                  <span className="text-sm font-medium">{t("plans.guarantee1")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  <span className="text-sm font-medium">{t("plans.guarantee2")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-teal-600" />
                  <span className="text-sm font-medium">{t("plans.guarantee3")}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Transformation Section - Before/After */}
        <section 
          className="py-24 relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-teal-50/20"
          aria-labelledby="transformation-title"
        >
          <div className="container mx-auto px-4 relative z-10">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 id="transformation-title" className="text-3xl md:text-4xl font-bold mb-4">
                {t("transformation.title")}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                {t("transformation.lead")}
              </p>
            </div>

            {/* Before/After Comparison */}
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* BEFORE Column */}
              <div className="bg-gradient-to-br from-[#FFF1E8] to-[#FFF8F3] rounded-3xl p-8 shadow-lg border border-[#C65A1E]">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-6 w-6 bg-[#FFF1E8] rounded" aria-hidden="true" />
                  <h3 className="text-xl font-bold text-[#C65A1E] tracking-wide">
                    {t("transformation.before")}
                  </h3>
                </div>
                <div className="space-y-6">
                  {[
                    { emoji: "😟", text: t("transformation.before1") },
                    { emoji: "💭", text: t("transformation.before2") },
                    { emoji: "📋", text: t("transformation.before3") },
                    { emoji: "🚫", text: t("transformation.before4") },
                    { emoji: "🤔", text: t("transformation.before5") },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4 pb-5 border-b border-[#C65A1E]/50 last:border-0 last:pb-0">
                      <span className="text-2xl" aria-hidden="true">{item.emoji}</span>
                      <span className="text-slate-700 font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AFTER Column */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 shadow-lg border border-emerald-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-6 w-6 bg-emerald-500 rounded" aria-hidden="true" />
                  <h3 className="text-xl font-bold text-emerald-600 tracking-wide">
                    {t("transformation.after")}
                  </h3>
                </div>
                <div className="space-y-6">
                  {[
                    { emoji: "😌", text: t("transformation.after1") },
                    { emoji: "🧠", text: t("transformation.after2") },
                    { emoji: "💬", text: t("transformation.after3") },
                    { emoji: "📊", text: t("transformation.after4") },
                    { emoji: "🌟", text: t("transformation.after5") },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4 pb-5 border-b border-emerald-200/50 last:border-0 last:pb-0">
                      <span className="text-2xl" aria-hidden="true">{item.emoji}</span>
                      <span className="text-slate-700 font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SLE Levels Section */}
        <section 
          className="py-20 relative overflow-hidden"
          aria-labelledby="sle-title"
        >
          <div className="absolute inset-0 gradient-bg" aria-hidden="true" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 id="sle-title" className="text-3xl md:text-4xl font-bold mb-4">{t("sle.title")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                {t("sle.description")}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  level: "A",
                  title: t("sle.levelA"),
                  description: t("sle.levelADesc"),
                  gradient: "from-[#D97B3D] via-[#C65A1E] to-[#C65A1E]",
                  shadow: "shadow-amber-500/40",
                  bgGlow: "bg-amber-50",
                  borderColor: "border-[#FFE4D6]",
                  icon: "🌟",
                },
                {
                  level: "B",
                  title: t("sle.levelB"),
                  description: t("sle.levelBDesc"),
                  gradient: "from-blue-400 via-blue-500 to-indigo-500",
                  shadow: "shadow-blue-500/40",
                  bgGlow: "bg-blue-50",
                  borderColor: "border-blue-200",
                  icon: "🏆",
                },
                {
                  level: "C",
                  title: t("sle.levelC"),
                  description: t("sle.levelCDesc"),
                  gradient: "from-emerald-400 via-emerald-500 to-teal-500",
                  shadow: "shadow-emerald-500/40",
                  bgGlow: "bg-emerald-50",
                  borderColor: "border-emerald-200",
                  icon: "👑",
                },
              ].map((item, index) => (
                <div 
                  key={item.level} 
                  className={`relative overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group ${item.bgGlow} border-2 ${item.borderColor}`}
                  style={{
                    background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)`,
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  {/* Decorative gradient orb */}
                  <div 
                    className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${item.gradient} opacity-20 blur-3xl group-hover:opacity-30 transition-opacity duration-500`}
                    aria-hidden="true"
                  />
                  
                  {/* Level badge with icon */}
                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div
                      className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-xl ${item.shadow} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                      aria-hidden="true"
                    >
                      <span className="text-3xl font-black text-white drop-shadow-lg">{item.level}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{item.icon}</span>
                        <h3 className="font-bold text-2xl text-slate-800">{item.title}</h3>
                      </div>
                      <Badge className="glass-badge text-xs mt-2 bg-white/80 backdrop-blur-sm border border-slate-200">{t("sle.skills")}</Badge>
                    </div>
                  </div>
                  
                  {/* Description with better typography */}
                  <p className="text-slate-700 leading-relaxed text-base relative z-10">{item.description}</p>
                  
                  {/* Bottom accent line */}
                  <div 
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${item.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
                    aria-hidden="true"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section 
          className="py-24 relative overflow-hidden bg-white"
          aria-labelledby="how-title"
        >
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-20">
              <h2 id="how-title" className="text-3xl md:text-4xl font-bold mb-4">{t("how.title")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                {t("how.description")}
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  image: "https://rusingacademy-cdn.b-cdn.net/images/how-it-works-1.jpg",
                  title: t("how.step1Title"),
                  description: t("how.step1Desc"),
                },
                {
                  image: "https://rusingacademy-cdn.b-cdn.net/images/how-it-works-2.jpg",
                  title: t("how.step2Title"),
                  description: t("how.step2Desc"),
                },
                {
                  image: "https://rusingacademy-cdn.b-cdn.net/images/how-it-works-3.jpg",
                  title: t("how.step3Title"),
                  description: t("how.step3Desc"),
                },
                {
                  image: "https://rusingacademy-cdn.b-cdn.net/images/how-it-works-4.jpg",
                  title: t("how.step4Title"),
                  description: t("how.step4Desc"),
                },
              ].map((step, index) => (
                <div key={index} className="relative group">
                  <div className="text-center">
                    <div className="relative mb-6 overflow-hidden rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <img 
                        loading="lazy" src={step.image} 
                        alt={step.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-all duration-500"
                        style={{ filter: 'blur(1.5px) saturate(0.9)', opacity: 0.85 }}
                      />
                      {/* Overlay for softer look */}
                      <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent" />
                      <div className="absolute top-3 left-3 h-10 w-10 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                        {index + 1}
                      </div>
                    </div>
                    <h3 className="font-bold text-lg mb-3">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-24 -right-4 transform z-10" aria-hidden="true">
                      <ArrowRight className="h-6 w-6 text-teal-500/50" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Lingueefy */}
        <section 
          className="py-24 relative overflow-hidden"
          aria-labelledby="features-title"
        >
          <div className="absolute inset-0 gradient-bg" aria-hidden="true" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-20">
              <h2 id="features-title" className="text-3xl md:text-4xl font-bold mb-4">{t("features.title")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                {t("features.description")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  image: "https://rusingacademy-cdn.b-cdn.net/images/why-choose-1.jpg",
                  title: t("features.sleCoaches"),
                  description: t("features.sleCoachesDesc"),
                },
                {
                  image: "https://rusingacademy-cdn.b-cdn.net/images/why-choose-2.jpg",
                  title: t("features.ai"),
                  description: t("features.aiDesc"),
                },
                {
                  image: "https://rusingacademy-cdn.b-cdn.net/images/why-choose-3.jpg",
                  title: t("features.flexible"),
                  description: t("features.flexibleDesc"),
                },
                {
                  image: "https://rusingacademy-cdn.b-cdn.net/images/why-choose-4.jpg",
                  title: t("features.bilingual"),
                  description: t("features.bilingualDesc"),
                },
              ].map((feature, index) => (
                <div key={index} className="glass-card group hover:shadow-2xl overflow-hidden">
                  <div className="relative -mx-6 -mt-6 mb-6 overflow-hidden">
                    <img 
                      loading="lazy" src={feature.image} 
                      alt={feature.title}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-all duration-500"
                      style={{ filter: 'blur(1.5px) saturate(0.9)', opacity: 0.85 }}
                    />
                    {/* Overlay for softer look */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-12">
              {[
                {
                  icon: Star,
                  title: t("features.results"),
                  description: t("features.resultsDesc"),
                },
                {
                  icon: MessageSquare,
                  title: t("features.federal"),
                  description: t("features.federalDesc"),
                },
              ].map((feature, index) => (
                <div key={index} className="glass-card group hover:shadow-2xl">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section - Temporarily hidden until authentic testimonials are available */}
        {/* TODO: Re-enable when real testimonials are collected */}

        {/* FAQ Section */}
        <FAQSection />

        {/* Video Presentation Section - Moved here from after statistics */}
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Meet Prof. Steven Barholere
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Discover how Lingueefy can help you achieve your bilingual goals in the Canadian federal public service
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              {/* Premium Video Frame with Glassmorphism */}
              <div className="relative p-1 rounded-[2rem] bg-gradient-to-br from-[#D97B3D] via-teal-400 to-[#C65A1E] shadow-2xl">
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#D97B3D]/20 via-teal-400/20 to-[#C65A1E]/20 blur-xl" />
                <div className="relative rounded-[1.75rem] overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 aspect-video">
                {!isVideoPlaying ? (
                  <>
                    {/* Video Thumbnail with Photo Carousel */}
                    <div className="relative w-full h-full">
                      <img 
                        loading="lazy" src="https://rusingacademy-cdn.b-cdn.net/images/coaches/steven-barholere.jpg" 
                        alt="Prof. Steven Barholere - Lingueefy Founder"
                        className="w-full h-full object-cover object-top opacity-90"
                      />
                      {/* Floating Coach Photos Carousel */}
                      <div className="absolute top-4 right-4 flex flex-col gap-3">
                        {[
                          { src: "https://rusingacademy-cdn.b-cdn.net/images/coaches/sue-anne-richer.jpg", name: "Sue-Anne" },
                          { src: "https://rusingacademy-cdn.b-cdn.net/images/coaches/erika-seguin.jpg", name: "Erika" },
                          { src: "https://rusingacademy-cdn.b-cdn.net/images/coaches/soukaina-haidar.jpg", name: "Soukaina" },
                        ].map((coach, i) => (
                          <div key={i} className="h-16 w-16 rounded-full border-3 border-white shadow-lg overflow-hidden animate-pulse" style={{ animationDelay: `${i * 0.5}s` }}>
                            <img loading="lazy" src={coach.src} alt={coach.name} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                    
                    {/* Play Button */}
                    <button 
                      onClick={() => setYoutubeModalOpen(true)}
                      className="absolute inset-0 flex items-center justify-center group"
                      aria-label="Play Prof. Steven's introduction video"
                    >
                      <div className="h-24 w-24 rounded-full bg-teal-500 flex items-center justify-center shadow-2xl shadow-teal-500/50 group-hover:scale-110 transition-transform duration-300">
                        <Play className="h-10 w-10 text-white ml-1" fill="white" />
                      </div>
                    </button>

                    {/* Video Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="flex items-center gap-4" style={{backgroundColor: 'transparent'}}>
                        <img 
                          loading="lazy" src="https://rusingacademy-cdn.b-cdn.net/images/coaches/steven-barholere.jpg" 
                          alt="Steven Barholere"
                          className="h-20 w-20 rounded-full border-3 border-white object-cover shadow-xl"
                        />
                        <div className="text-white">
                          <p className="font-bold text-xl">Prof. Steven Barholere</p>
                          <p className="text-white/80">Founder & Lead SLE Coach</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-slate-900 relative group">
                    {/* HTML5 Video Player with Steven's MP4 */}
                    <video
                      className="w-full h-full object-contain"
                      src="/videos/steven-barholere.mp4"
                      autoPlay
                      controls
                      playsInline
                    >
                      <track kind="subtitles" src="/subtitles/steven-barholere-en.vtt" srcLang="en" label="English" />
                      <track kind="subtitles" src="/subtitles/steven-barholere-fr.vtt" srcLang="fr" label="Français" />
                      Your browser does not support the video tag.
                    </video>
                    {/* Close Button */}
                    <button
                      onClick={() => setIsVideoPlaying(false)}
                      className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-all"
                      aria-label="Close video"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                </div>
              </div>

              {/* Video Features */}
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                {[
                  { icon: GraduationCap, title: "10+ Years Experience", desc: "Helping federal employees succeed" },
                  { icon: Award, title: "SLE Expert", desc: "Deep knowledge of exam criteria" },
                  { icon: Users, title: "2,500+ Public Servants", desc: "Achieved their bilingual goals" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-xl">
                    <div className="h-12 w-12 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section 
          className="py-24 relative overflow-hidden mesh-gradient"
          aria-labelledby="cta-title"
        >
          <div className="container mx-auto px-4 relative z-10">
            <div className="glass-card max-w-4xl mx-auto text-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 glass-badge rounded-full px-5 py-2 text-sm font-medium text-teal-700">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  {t("hero.badge")}
                </div>
                
                <h2 id="cta-title" className="text-3xl md:text-4xl font-bold">{t("cta.title")}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                  {t("cta.description")}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Link href="/coaches">
                    <Button size="lg" className="w-full sm:w-auto gap-2 glass-btn text-white rounded-full px-8 h-14 text-base font-semibold">
                      {t("cta.findCoach")} <ArrowRight className="h-5 w-5" aria-hidden="true" />
                    </Button>
                  </Link>
                  <Link href="/become-a-coach">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 glass-btn-outline rounded-full px-8 h-14 text-base font-medium">
                      {t("cta.becomeCoach")}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Cross-Ecosystem Section - Take learning beyond the session */}
      <CrossEcosystemSection variant="hub" />

      <FooterInstitutional />
      
      {/* ProfStevenChatbot removed - replaced by SLE AI Companion widget in header */}

      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 0.8s infinite;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .animate-blink {
            animation: none;
            opacity: 1;
          }
        }
      `}</style>

      {/* YouTube Modal - Prof. Steven's Introduction Video */}
      {/* Using YouTube for better playback (avoids VFR issues with Bunny Stream) */}
      {youtubeModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Prof. Steven Barholere - Video"
        >
          {/* Premium Backdrop with blur and gradient */}
          <div 
            className="absolute inset-0 animate-in fade-in duration-300"
            onClick={() => setYoutubeModalOpen(false)}
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.95) 100%)',
              backdropFilter: 'blur(12px)',
            }}
          />
          
          {/* Decorative ambient glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div 
              className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
              style={{ background: 'radial-gradient(circle, rgba(20, 184, 166, 0.6) 0%, transparent 70%)' }}
            />
            <div 
              className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15"
              style={{ background: 'radial-gradient(circle, rgba(212, 175, 55, 0.5) 0%, transparent 70%)' }}
            />
          </div>
          
          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-5xl animate-in zoom-in-95 fade-in duration-300">
            {/* Close Button */}
            <button
              onClick={() => setYoutubeModalOpen(false)}
              className="absolute -top-12 right-0 md:-right-12 md:top-0 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200 group"
              aria-label="Close video"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Video Title */}
            <div className="mb-4 text-center">
              <h3 className="text-white text-xl md:text-2xl font-bold mb-1">
                Prof. Steven Barholere
              </h3>
              <p className="text-white/70 text-sm md:text-base">
                Founder & Lead SLE Coach
              </p>
            </div>

            {/* Video Container with Glassmorphism Frame */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
              {/* Glassmorphism border effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none z-10" />
              
              {/* 16:9 Aspect Ratio Container - YouTube Embed with minimal branding */}
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src="https://www.youtube-nocookie.com/embed/80-ms8AlDTU?autoplay=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&color=white"
                  title="Prof. Steven Barholere - Introduction"
                  className="absolute inset-0 w-full h-full"
                  loading="lazy"                   style={{ border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Keyboard hint */}
            <p className="text-center text-white/75 text-xs mt-4">
              Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/60">ESC</kbd> to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
