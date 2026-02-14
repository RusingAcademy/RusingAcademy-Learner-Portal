import { useLanguage } from "@/contexts/LanguageContext";
import { Play, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";

interface Capsule {
  number: number;
  titleFr: string;
  titleEn: string;
  subtitleFr: string;
  subtitleEn: string;
  color: string;
  image: string;
}

const capsules: Capsule[] = [
  {
    number: 1,
    titleFr: "LE BEHAVIORISME",
    titleEn: "BEHAVIORISM",
    subtitleFr: "Le jour où la répétition a libéré le français de Sarah",
    subtitleEn: "The day repetition freed Sarah's French",
    color: "from-teal-600 to-teal-700",
    image: "/images/capsules/behaviorism.jpg",
  },
  {
    number: 2,
    titleFr: "LE COGNITIVISME",
    titleEn: "COGNITIVISM",
    subtitleFr: "Le jour où Mark a arrêté de perdre ses mots",
    subtitleEn: "The day Mark stopped losing his words",
    color: "from-blue-600 to-blue-700",
    image: "/images/capsules/cognitivism.jpg",
  },
  {
    number: 3,
    titleFr: "LE CONSTRUCTIVISME",
    titleEn: "CONSTRUCTIVISM",
    subtitleFr: "Le jour où Julie a découvert la règle par elle-même",
    subtitleEn: "The day Julie discovered the rule herself",
    color: "from-emerald-600 to-emerald-700",
    image: "/images/capsules/constructivism.jpg",
  },
  {
    number: 4,
    titleFr: "LE SOCIO-CONSTRUCTIVISME",
    titleEn: "SOCIO-CONSTRUCTIVISM",
    subtitleFr: "Le jour où le groupe a libéré la voix de Karim",
    subtitleEn: "The day the group freed Karim's voice",
    color: "from-[#C65A1E] to-[#A84A15]",
    image: "/images/capsules/socio-constructivism.jpg",
  },
  {
    number: 5,
    titleFr: "L'HUMANISME",
    titleEn: "HUMANISM",
    subtitleFr: "Le jour où Amélie a arrêté d'avoir peur d'être jugée",
    subtitleEn: "The day Amélie stopped fearing judgment",
    color: "from-slate-600 to-slate-700",
    image: "/images/capsules/humanism.jpg",
  },
  {
    number: 6,
    titleFr: "LE CONNECTIVISME",
    titleEn: "CONNECTIVISM",
    subtitleFr: "Le jour où Marie a découvert qu'elle n'était plus seule à apprendre",
    subtitleEn: "The day Marie discovered she wasn't learning alone",
    color: "from-teal-500 to-teal-600",
    image: "/images/capsules/connectivism.jpg",
  },
  {
    number: 7,
    titleFr: "L'APPRENTISSAGE EXPÉRIENTIEL",
    titleEn: "EXPERIENTIAL LEARNING",
    subtitleFr: "Le jour où Sam a appris le français en commandant un café",
    subtitleEn: "The day Sam learned French ordering coffee",
    color: "from-[#C65A1E] to-[#A84A15]",
    image: "/images/capsules/experiential.jpg",
  },
];

export default function LearningCapsules() {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Auto-scroll every 4 seconds
  useEffect(() => {
    if (!isAutoPlaying || isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % capsules.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, isPaused]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + capsules.length) % capsules.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % capsules.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="py-24 bg-slate-100 relative overflow-hidden">
      <div className="container relative z-10">
        {/* Section Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            {language === 'fr' ? 'Trucs et astuces d\'apprentissage :' : 'Learning Tips & Tricks:'}
          </h2>
          <h3 className="text-xl md:text-2xl font-semibold text-slate-700 mb-4">
            {language === 'fr' 
              ? '40 micro-leçons fondées sur des données probantes pour les apprenants adultes'
              : '40 Evidence-Based Micro-Lessons for Adult Learners'}
          </h3>
          <p className="text-slate-600 max-w-4xl mx-auto leading-relaxed">
            {language === 'fr' 
              ? 'Des leçons vidéo courtes et ciblées, fondées sur les sciences de l\'apprentissage et les principes de l\'éducation des adultes, conçues spécifiquement pour les professionnels occupés.'
              : 'Short, focused video lessons grounded in learning science and adult education principles, designed specifically for busy professionals.'}
          </p>
        </div>

        {/* Carousel Container */}
        <div 
          className="relative mt-12"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300 -translate-x-4 md:translate-x-0"
            aria-label="Previous capsule"
          >
            <ChevronLeft className="h-6 w-6 text-slate-700" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300 translate-x-4 md:translate-x-0"
            aria-label="Next capsule"
          >
            <ChevronRight className="h-6 w-6 text-slate-700" />
          </button>

          {/* Carousel Track */}
          <div 
            ref={carouselRef}
            className="overflow-hidden mx-8 md:mx-16"
          >
            <div 
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {capsules.map((capsule, index) => (
                <div 
                  key={index}
                  className="w-full flex-shrink-0 px-4"
                >
                  <div 
                    className={`group relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer mx-auto max-w-2xl transition-all duration-500 ${
                      index === currentIndex ? 'scale-100 opacity-100' : 'scale-95 opacity-70'
                    }`}
                  >
                    {/* Background with gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${capsule.color}`} />
                    
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-24 -translate-x-24" />
                    
                    {/* Content */}
                    <div className="relative p-8 md:p-12 min-h-[350px] flex flex-col justify-between">
                      {/* Capsule Badge */}
                      <div className="flex items-center justify-between">
                        <span className="px-4 py-2 bg-[#C65A1E] text-white text-sm font-bold rounded-full shadow-lg">
                          Capsule {capsule.number} / {capsules.length}
                        </span>
                        <div className="flex items-center gap-2 text-white/80 text-sm">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          {language === 'fr' ? 'Vidéo disponible' : 'Video available'}
                        </div>
                      </div>

                      {/* Title and Subtitle */}
                      <div className="mt-8">
                        <h4 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-wide">
                          {language === 'fr' ? capsule.titleFr : capsule.titleEn}
                        </h4>
                        <p className="text-sm text-white/70 uppercase tracking-widest mb-4">
                          {language === 'fr' ? capsule.titleEn : capsule.titleFr}
                        </p>
                        <p className="text-lg text-white/90 leading-relaxed max-w-md">
                          {language === 'fr' ? capsule.subtitleFr : capsule.subtitleEn}
                        </p>
                      </div>

                      {/* Play Button */}
                      <div className="flex items-center gap-4 mt-8">
                        <button className="h-16 w-16 rounded-full bg-[#C65A1E] flex items-center justify-center shadow-xl hover:scale-110 hover:bg-orange-400 transition-all duration-300 group-hover:animate-pulse">
                          <Play className="h-7 w-7 text-white ml-1" fill="white" />
                        </button>
                        <span className="text-white font-medium">
                          {language === 'fr' ? 'Regarder la capsule' : 'Watch capsule'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dot Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {capsules.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex 
                    ? 'w-8 h-3 bg-teal-600' 
                    : 'w-3 h-3 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to capsule ${index + 1}`}
              />
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-4 max-w-md mx-auto">
            <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-teal-500 to-teal-600 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / capsules.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-12">
          <a 
            href="https://www.rusingacademy.com/products/communities/v2/slecommunity/home"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button 
              size="lg" 
              className="bg-[#C65A1E] hover:bg-orange-600 text-white rounded-full px-8 h-14 text-base font-semibold shadow-lg shadow-orange-500/30 gap-2"
            >
              {language === 'fr' 
                ? 'Accéder aux 40 capsules d\'apprentissage'
                : 'Access All 40 Learning Capsules'}
              <ExternalLink className="h-5 w-5" />
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
