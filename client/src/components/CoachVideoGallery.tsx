/**
 * CoachVideoGallery Component
 * Premium video gallery for coach introduction videos
 * Uses Drive assets only - Zero external dependencies
 */

import { useState, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Play, Pause, Volume2, VolumeX, X } from "lucide-react";

// Coach video data from Drive assets
const COACH_VIDEOS = [
  {
    id: "steven",
    name: "Steven Barholere",
    nameFr: "Steven Barholere",
    role: "Founder & Principal Coach",
    roleFr: "Fondateur et coach principal",
    src: "/videos/coaches/coach_steven_intro_01_1920x1080.mp4",
    thumbnail: "/videos/thumbnails/coach_steven_intro_01_1920x1080_thumb.webp",
    bio: "15+ years of experience in bilingual training for Canadian public servants",
    bioFr: "Plus de 15 ans d'expérience en formation bilingue pour les fonctionnaires canadiens",
  },
  {
    id: "sue_anne",
    name: "Sue Anne",
    nameFr: "Sue Anne",
    role: "Senior Coach - Written Expression",
    roleFr: "Coach senior - Expression écrite",
    src: "/videos/coaches/coach_sue_anne_intro_01_848x480.mp4",
    thumbnail: "/videos/thumbnails/coach_sue_anne_intro_01_848x480_thumb.webp",
    bio: "Specialist in written comprehension and expression for SLE exams",
    bioFr: "Spécialiste en compréhension et expression écrite pour les examens ELS",
  },
  {
    id: "erica",
    name: "Erica",
    nameFr: "Erica",
    role: "Performance Psychology Expert",
    roleFr: "Experte en psychologie de la performance",
    src: "/videos/coaches/coach_erica_intro_01_1920x1080.mp4",
    thumbnail: "/videos/thumbnails/coach_erica_intro_01_1920x1080_thumb.webp",
    bio: "Helping learners overcome exam anxiety and build confidence",
    bioFr: "Aide les apprenants à surmonter l'anxiété des examens et à développer leur confiance",
  },
  {
    id: "soukaina",
    name: "Soukaina",
    nameFr: "Soukaina",
    role: "Oral Expression Coach",
    roleFr: "Coach en expression orale",
    src: "/videos/coaches/coach_soukaina_intro_01_1920x1080.mp4",
    thumbnail: "/videos/thumbnails/coach_soukaina_intro_01_1920x1080_thumb.webp",
    bio: "Expert in oral proficiency and conversational fluency",
    bioFr: "Experte en compétence orale et fluidité conversationnelle",
  },
  {
    id: "preciosa",
    name: "Preciosa",
    nameFr: "Preciosa",
    role: "Grammar & Structure Coach",
    roleFr: "Coach en grammaire et structure",
    src: "/videos/coaches/coach_preciosa_intro_01_1280x720.mp4",
    thumbnail: "/videos/thumbnails/coach_preciosa_intro_01_1280x720_thumb.webp",
    bio: "Mastering French grammar for Level C proficiency",
    bioFr: "Maîtrise de la grammaire française pour le niveau C",
  },
  {
    id: "victor",
    name: "Victor",
    nameFr: "Victor",
    role: "Comprehension Coach",
    roleFr: "Coach en compréhension",
    src: "/videos/coaches/coach_victor_intro_01_638x360.mp4",
    thumbnail: "/videos/thumbnails/coach_victor_intro_01_638x360_thumb.webp",
    bio: "Developing listening and reading comprehension skills",
    bioFr: "Développement des compétences en compréhension orale et écrite",
  },
];

interface CoachCardProps {
  coach: typeof COACH_VIDEOS[0];
  language: "en" | "fr";
  onClick: () => void;
}

function CoachCard({ coach, language, onClick }: CoachCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-2xl aspect-[4/5]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={language === "fr" ? coach.nameFr : coach.name}
    >
      {/* Glassmorphism background */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm"
        style={{ border: "1px solid rgba(255,255,255,0.1)" }}
      />
      
      {/* Thumbnail */}
      <img
        src={coach.thumbnail}
        alt={language === "fr" ? coach.nameFr : coach.name}
        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${
          isHovered ? "scale-110" : "scale-100"
        }`}
        loading="lazy"       />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      
      {/* Play button */}
      <div 
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-all duration-300 hover:scale-110"
          style={{ 
            backdropFilter: "blur(8px)",
            border: "2px solid rgba(255,255,255,0.3)",
          }}
        >
          <Play className="w-8 h-8 text-white ml-1" fill="white" />
        </div>
      </div>
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-white font-bold text-xl mb-1">
          {language === "fr" ? coach.nameFr : coach.name}
        </h3>
        <p 
          className="text-sm font-medium mb-2"
          style={{ color: "#D4A853" }}
        >
          {language === "fr" ? coach.roleFr : coach.role}
        </p>
        <p className="text-white/70 text-sm line-clamp-2">
          {language === "fr" ? coach.bioFr : coach.bio}
        </p>
      </div>
    </div>
  );
}

interface VideoModalProps {
  coach: typeof COACH_VIDEOS[0] | null;
  language: "en" | "fr";
  onClose: () => void;
}

function VideoModal({ coach, language, onClose }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  
  if (!coach) return null;
  
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.95)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={language === "fr" ? coach.nameFr : coach.name}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
        aria-label={language === "fr" ? "Fermer" : "Close"}
      >
        <X className="w-6 h-6 text-white" />
      </button>
      
      {/* Video container */}
      <div 
        className="relative max-w-4xl w-full aspect-video rounded-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          boxShadow: "0 25px 80px rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <video
          ref={videoRef}
          src={coach.src}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted={isMuted}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        
        {/* Video controls overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              aria-label={isPlaying ? (language === "fr" ? "Pause" : "Pause") : (language === "fr" ? "Lecture" : "Play")}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
              )}
            </button>
            
            <button
              onClick={toggleMute}
              className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              aria-label={isMuted ? (language === "fr" ? "Activer le son" : "Unmute") : (language === "fr" ? "Couper le son" : "Mute")}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
          
          <h3 className="text-white font-bold text-2xl mb-1">
            {language === "fr" ? coach.nameFr : coach.name}
          </h3>
          <p 
            className="text-lg font-medium mb-2"
            style={{ color: "#D4A853" }}
          >
            {language === "fr" ? coach.roleFr : coach.role}
          </p>
          <p className="text-white/80 text-sm">
            {language === "fr" ? coach.bioFr : coach.bio}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CoachVideoGallery() {
  const { language } = useLanguage();
  const [selectedCoach, setSelectedCoach] = useState<typeof COACH_VIDEOS[0] | null>(null);
  
  const content = {
    en: {
      badge: "Meet Our Team",
      title: "Expert Coaches, Proven Results",
      subtitle: "Our certified coaches bring decades of combined experience in SLE preparation and bilingual training",
    },
    fr: {
      badge: "Rencontrez notre équipe",
      title: "Coachs experts, résultats prouvés",
      subtitle: "Nos coachs certifiés apportent des décennies d'expérience combinée en préparation ELS et formation bilingue",
    },
  };
  
  const t = content[language];
  
  return (
    <section 
      className="py-24 relative overflow-hidden"
      style={{ 
        background: "linear-gradient(180deg, #0B1220 0%, #0F3D3E 50%, #0B1220 100%)",
      }}
      aria-labelledby="coach-gallery-title"
    >
      {/* Decorative elements */}
      <div 
        className="absolute top-1/4 left-0 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(23, 226, 198, 0.3) 0%, transparent 70%)" }}
      />
      <div 
        className="absolute bottom-1/4 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(198, 90, 30, 0.4) 0%, transparent 70%)" }}
      />
      
      <div className="container mx-auto px-6 md:px-8 lg:px-12 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span 
            className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-6"
            style={{ 
              background: "linear-gradient(135deg, rgba(23, 226, 198, 0.2) 0%, rgba(15, 157, 142, 0.2) 100%)",
              color: "#17E2C6",
              border: "1px solid rgba(23, 226, 198, 0.3)",
            }}
          >
            {t.badge}
          </span>
          
          <h2 
            id="coach-gallery-title"
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {t.title}
          </h2>
          
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>
        
        {/* Coach Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {COACH_VIDEOS.map((coach) => (
            <CoachCard
              key={coach.id}
              coach={coach}
              language={language}
              onClick={() => setSelectedCoach(coach)}
            />
          ))}
        </div>
      </div>
      
      {/* Video Modal */}
      {selectedCoach && (
        <VideoModal
          coach={selectedCoach}
          language={language}
          onClose={() => setSelectedCoach(null)}
        />
      )}
    </section>
  );
}
