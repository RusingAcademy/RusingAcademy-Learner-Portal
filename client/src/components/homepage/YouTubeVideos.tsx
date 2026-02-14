import { useLanguage } from "@/contexts/LanguageContext";
import { ExternalLink, Play, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";

interface Video {
  id: string;
  titleFr: string;
  titleEn: string;
  thumbnail: string;
  duration?: string;
  views?: string;
  isShort?: boolean;
}

// Real Short-form videos from the Barholex channel
const shortFormVideos: Video[] = [
  {
    id: "7rFq3YBm-E0",
    titleFr: "Réussir les examens : Secrets de l'apprentissage linguistique inconscient",
    titleEn: "Ace Exams: Unconscious Language Learning Secrets Revealed",
    thumbnail: "https://img.youtube.com/vi/7rFq3YBm-E0/maxresdefault.jpg",
    views: "1.2K",
    isShort: true,
  },
  {
    id: "BiyAaX0EXG0",
    titleFr: "Les 4 étapes de l'apprentissage : Exemple de la conduite",
    titleEn: "The 4 Stages of Learning: Driving Example",
    thumbnail: "https://img.youtube.com/vi/BiyAaX0EXG0/maxresdefault.jpg",
    views: "856",
    isShort: true,
  },
  {
    id: "nuq0xFvFxJ4",
    titleFr: "Immigrer et réussir : Le secret d'une carrière au Canada/USA !",
    titleEn: "Immigrate & Succeed: The Secret to a Career in Canada/USA!",
    thumbnail: "https://img.youtube.com/vi/nuq0xFvFxJ4/maxresdefault.jpg",
    views: "2.1K",
    isShort: true,
  },
  {
    id: "zm6mKIjCOBA",
    titleFr: "Apprendre le français : les astuces de Cédric quand on travaille !",
    titleEn: "Learn French: Cédric's Tips When You're Working!",
    thumbnail: "https://img.youtube.com/vi/zm6mKIjCOBA/maxresdefault.jpg",
    views: "1.4K",
    isShort: true,
  },
  {
    id: "BQZVgZP4OVA",
    titleFr: "Reconversion: L'intégration impossible? Le système en question.",
    titleEn: "Career Change: Impossible Integration? The System in Question.",
    thumbnail: "https://img.youtube.com/vi/BQZVgZP4OVA/maxresdefault.jpg",
    views: "978",
    isShort: true,
  },
  {
    id: "qAlMfW2fu_M",
    titleFr: "Immigration : L'intégration professionnelle, parcours du combattant ?!",
    titleEn: "Immigration: Professional Integration, an Uphill Battle?!",
    thumbnail: "https://img.youtube.com/vi/qAlMfW2fu_M/maxresdefault.jpg",
    views: "1.7K",
    isShort: true,
  },
  {
    id: "K5JzlhLFhoQ",
    titleFr: "Racisme: Immigrés face aux préjugés, leur chance compromise!",
    titleEn: "Racism: Immigrants Facing Prejudice, Their Chances Compromised!",
    thumbnail: "https://img.youtube.com/vi/K5JzlhLFhoQ/maxresdefault.jpg",
    views: "2.3K",
    isShort: true,
  },
  {
    id: "l4qEqMn7vJU",
    titleFr: "Cédric : L'invité congolais qui défie les tabous!",
    titleEn: "Cédric: The Congolese Guest Who Defies Taboos!",
    thumbnail: "https://img.youtube.com/vi/l4qEqMn7vJU/maxresdefault.jpg",
    views: "1.1K",
    isShort: true,
  },
  {
    id: "cNfhaQBMeh0",
    titleFr: "Contenu futile vs. pertinent : Comment choisir sur les réseaux ?",
    titleEn: "Trivial vs. Relevant Content: How to Choose on Social Media?",
    thumbnail: "https://img.youtube.com/vi/cNfhaQBMeh0/maxresdefault.jpg",
    views: "654",
    isShort: true,
  },
  {
    id: "B3dq1K9NgIk",
    titleFr: "Construire son réseau: l'erreur fatale à éviter!",
    titleEn: "Building Your Network: The Fatal Mistake to Avoid!",
    thumbnail: "https://img.youtube.com/vi/B3dq1K9NgIk/maxresdefault.jpg",
    views: "1.8K",
    isShort: true,
  },
  {
    id: "fTmJD8jSrR0",
    titleFr: "Avocat raté devient prof : Le destin improbable révélé !",
    titleEn: "Failed Lawyer Becomes Teacher: The Unlikely Destiny Revealed!",
    thumbnail: "https://img.youtube.com/vi/fTmJD8jSrR0/maxresdefault.jpg",
    views: "923",
    isShort: true,
  },
  {
    id: "wobcIfIPW60",
    titleFr: "Mapipo: Le Congolais qui bouleverse le Canada!",
    titleEn: "Mapipo: The Congolese Man Shaking Up Canada!",
    thumbnail: "https://img.youtube.com/vi/wobcIfIPW60/maxresdefault.jpg",
    views: "1.5K",
    isShort: true,
  },
];

// Real Long-form videos from the Barholex channel
const longFormVideos: Video[] = [
  {
    id: "ZytUUUv-A2g",
    titleFr: "Améliorez votre anglais GC avec Preciosa",
    titleEn: "Upgrade Your GC English with Preciosa",
    thumbnail: "https://i.ytimg.com/vi/ZytUUUv-A2g/hqdefault.jpg",
    duration: "1:22",
    views: "13",
  },
  {
    id: "rAdJZ4o_N2Y",
    titleFr: "Coach Erika - Présentation",
    titleEn: "Coach Erika - Introduction",
    thumbnail: "https://i.ytimg.com/vi/rAdJZ4o_N2Y/hqdefault.jpg",
    duration: "0:56",
    views: "31",
  },
  {
    id: "LEc84vX0xe0",
    titleFr: "Coach Steven - Présentation",
    titleEn: "Coach Steven - Introduction",
    thumbnail: "https://i.ytimg.com/vi/LEc84vX0xe0/hqdefault.jpg",
    duration: "2:33",
    views: "53",
  },
  {
    id: "NxAK8U6_5e4",
    titleFr: "Coach Victor - Présentation",
    titleEn: "Coach Victor - Introduction",
    thumbnail: "https://i.ytimg.com/vi/NxAK8U6_5e4/hqdefault.jpg",
    duration: "2:12",
    views: "25",
  },
  {
    id: "UN9-GPwmbaw",
    titleFr: "Coach Soukaina - Présentation",
    titleEn: "Coach Soukaina - Introduction",
    thumbnail: "https://i.ytimg.com/vi/UN9-GPwmbaw/hqdefault.jpg",
    duration: "0:51",
    views: "27",
  },
  {
    id: "SuuhMpF5KoA",
    titleFr: "Coach Sue-Anne Richer",
    titleEn: "Coach Sue-Anne Richer",
    thumbnail: "https://i.ytimg.com/vi/SuuhMpF5KoA/hqdefault.jpg",
    duration: "1:05",
    views: "38",
  },
  {
    id: "OkO00QpxxOU",
    titleFr: "De la promesse au lancement – RusingAcademy",
    titleEn: "From Promise to Launch – RusingAcademy",
    thumbnail: "https://i.ytimg.com/vi/OkO00QpxxOU/hqdefault.jpg",
    duration: "21:40",
    views: "97",
  },
  {
    id: "73VyFGWqMhU",
    titleFr: "Comment la langue et le réseautage peuvent faire ou défaire votre carrière d'immigrant | BBV Podcast Ep. 3",
    titleEn: "How Language & Networking Can Make or Break Your Career as an Immigrant | BBV Podcast Ep. 3",
    thumbnail: "https://i.ytimg.com/vi/73VyFGWqMhU/hqdefault.jpg",
    duration: "76:14",
    views: "171",
  },
  {
    id: "BKCG5bIexpA",
    titleFr: "Examen oral SLE : Préparation, conseils et pièges à éviter",
    titleEn: "SLE Oral Exam: Preparation, Tips and Pitfalls to Avoid",
    thumbnail: "https://i.ytimg.com/vi/BKCG5bIexpA/hqdefault.jpg",
    duration: "62:53",
    views: "201",
  },
  {
    id: "RHy07Q5va_Y",
    titleFr: "Combler les générations : IA, apprentissage des langues et l'avenir bilingue de la fonction publique",
    titleEn: "Bridging Generations: AI, Language Learning, and the Bilingual Future of Public Service",
    thumbnail: "https://i.ytimg.com/vi/RHy07Q5va_Y/hqdefault.jpg",
    duration: "69:40",
    views: "78",
  },
  {
    id: "6Z8MuYTlsoo",
    titleFr: "Tout ce que la fonction publique m'a appris m'a inspiré à créer ce studio pour vous",
    titleEn: "Everything the Public Service Taught Me Inspired Me to Create This Studio for You",
    thumbnail: "https://i.ytimg.com/vi/6Z8MuYTlsoo/hqdefault.jpg",
    duration: "34:19",
    views: "56",
  },
  {
    id: "P5tnFJNygoc",
    titleFr: "Comprendre les hypothèses dans votre examen de langue seconde",
    titleEn: "Understanding Hypotheses in your Second Language Exam",
    thumbnail: "https://i.ytimg.com/vi/P5tnFJNygoc/hqdefault.jpg",
    duration: "5:36",
    views: "463",
  },
];

function ShortVideoCard({ video, language, index }: { video: Video; language: string; index: number }) {
  const handleClick = () => {
    window.open(`https://www.youtube.com/shorts/${video.id}`, '_blank');
  };

  return (
    <div 
      className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-[#C65A1E] via-red-500 to-[#C65A1E] cursor-pointer flex-shrink-0 w-[180px] sm:w-[200px]"
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={handleClick}
    >
      <div className="relative aspect-[9/16] max-h-[320px]">
        {/* Thumbnail */}
        <img 
          src={video.thumbnail}
          alt={language === 'fr' ? video.titleFr : video.titleEn}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"         />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Shorts Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 rounded-full px-2.5 py-1">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.77 10.32l-1.2-.5L18 9.06c1.84-.96 2.53-3.23 1.56-5.06s-3.24-2.53-5.07-1.56L6 6.94c-1.29.68-2.07 2.04-2 3.49.07 1.42.93 2.67 2.22 3.25.03.01 1.2.5 1.2.5L6 14.93c-1.83.97-2.53 3.24-1.56 5.07.97 1.83 3.24 2.53 5.07 1.56l8.5-4.5c1.29-.68 2.06-2.04 1.99-3.49-.07-1.42-.94-2.68-2.23-3.25z"/>
          </svg>
          <span className="text-white text-xs font-bold">Short</span>
        </div>
        
        {/* Views Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
          <Eye className="w-3 h-3 text-white" />
          <span className="text-white text-xs">{video.views}</span>
        </div>
        
        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="h-6 w-6 text-red-600 ml-1" fill="currentColor" />
          </div>
        </div>
        
        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white text-sm font-medium line-clamp-2 leading-tight">
            {language === 'fr' ? video.titleFr : video.titleEn}
          </p>
        </div>
      </div>
    </div>
  );
}

function LongVideoCard({ video, language }: { video: Video; language: string }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-slate-900">
      {!isPlaying ? (
        <>
          {/* Thumbnail */}
          <div className="relative aspect-video">
            <img 
              src={video.thumbnail}
              alt={language === 'fr' ? video.titleFr : video.titleEn}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"             />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
            
            {/* Duration Badge */}
            {video.duration && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/80 rounded px-2 py-1">
                <Clock className="w-3 h-3 text-white" />
                <span className="text-white text-xs font-medium">{video.duration}</span>
              </div>
            )}
            
            {/* Views Badge */}
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
              <Eye className="w-3 h-3 text-white" />
              <span className="text-white text-xs">{video.views} views</span>
            </div>
            
            {/* Play Button */}
            <button 
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 flex items-center justify-center"
              aria-label="Play video"
            >
              <div className="h-16 w-16 rounded-full bg-red-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                <Play className="h-7 w-7 text-white ml-1" fill="white" />
              </div>
            </button>

            {/* Barholex Logo Badge */}
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
              <div className="h-6 w-6 rounded-full bg-[#C65A1E] flex items-center justify-center">
                <span className="text-sm font-bold text-black">B</span>
              </div>
              <span className="text-white text-xs font-medium">Barholex</span>
            </div>
          </div>
          
          {/* Title */}
          <div className="p-4 bg-slate-800">
            <h4 className="text-white font-medium line-clamp-2">
              {language === 'fr' ? video.titleFr : video.titleEn}
            </h4>
          </div>
        </>
      ) : (
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
            title={language === 'fr' ? video.titleFr : video.titleEn}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      )}
    </div>
  );
}

export default function YouTubeVideos() {
  const { language } = useLanguage();
  const [currentShortIndex, setCurrentShortIndex] = useState(0);
  const shortsContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll shorts every 4 seconds
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentShortIndex((prev) => (prev + 1) % shortFormVideos.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Scroll to current short
  useEffect(() => {
    if (shortsContainerRef.current) {
      const container = shortsContainerRef.current;
      const cardWidth = 220; // width + gap
      container.scrollTo({
        left: currentShortIndex * cardWidth,
        behavior: 'smooth'
      });
    }
  }, [currentShortIndex]);

  return (
    <>
      {/* Short-Form Videos Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#C65A1E]/10 rounded-full blur-3xl" />
        
        <div className="container relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/30 rounded-full px-4 py-2 mb-4">
              <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.77 10.32l-1.2-.5L18 9.06c1.84-.96 2.53-3.23 1.56-5.06s-3.24-2.53-5.07-1.56L6 6.94c-1.29.68-2.07 2.04-2 3.49.07 1.42.93 2.67 2.22 3.25.03.01 1.2.5 1.2.5L6 14.93c-1.83.97-2.53 3.24-1.56 5.07.97 1.83 3.24 2.53 5.07 1.56l8.5-4.5c1.29-.68 2.06-2.04 1.99-3.49-.07-1.42-.94-2.68-2.23-3.25z"/>
              </svg>
              <span className="text-red-400 font-semibold text-sm">YouTube Shorts</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {language === 'fr' 
                ? 'Conseils rapides pour la préparation aux examens'
                : 'Quick Tips for Exam Preparation'}
            </h2>
            <p className="text-slate-400 max-w-3xl mx-auto leading-relaxed">
              {language === 'fr'
                ? 'Des conseils de 60 secondes de nos experts pour vous aider à réussir vos examens SLE/ELS.'
                : '60-second tips from our experts to help you ace your SLE exams.'}
            </p>
          </div>

          {/* Shorts Carousel */}
          <div 
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 mb-6">
              {shortFormVideos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentShortIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === currentShortIndex 
                      ? 'w-8 bg-red-500' 
                      : 'bg-slate-600 hover:bg-white0'
                  }`}
                  aria-label={`Go to short ${idx + 1}`}
                />
              ))}
            </div>

            {/* Scrollable Container */}
            <div 
              ref={shortsContainerRef}
              className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {shortFormVideos.map((video, index) => (
                <div key={video.id} className="snap-start">
                  <ShortVideoCard video={video} language={language} index={index} />
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-10">
            <Button
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-full px-6"
              onClick={() => window.open('https://www.youtube.com/@Barholex/shorts', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {language === 'fr' ? 'Voir tous les Shorts' : 'View All Shorts'}
            </Button>
          </div>
        </div>
      </section>

      {/* Long-Form Videos Section */}
      <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-[#C65A1E]/5 rounded-full blur-3xl" />
        
        <div className="container relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-600/20 border border-amber-500/30 rounded-full px-4 py-2 mb-4">
              <Play className="w-4 h-4 text-amber-500" fill="currentColor" />
              <span className="text-amber-400 font-semibold text-sm">Barholex Media</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {language === 'fr' 
                ? 'Vidéos pour la préparation aux examens GC'
                : 'Illustrative YouTube Videos for GC Exam Preparation'}
            </h2>
            <p className="text-slate-400 max-w-3xl mx-auto leading-relaxed">
              {language === 'fr'
                ? 'Explorez nos vidéos approfondies, podcasts et présentations de coachs pour une préparation complète.'
                : 'Explore our in-depth videos, podcasts, and coach introductions for comprehensive exam preparation.'}
            </p>
          </div>

          {/* Videos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {longFormVideos.slice(0, 8).map((video) => (
              <LongVideoCard key={video.id} video={video} language={language} />
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Button
              className="bg-gradient-to-r from-[#C65A1E] to-[#C65A1E] hover:from-[#A84A15] hover:to-[#A84A15] text-white rounded-full px-8 py-6 text-lg font-semibold shadow-lg shadow-amber-500/25"
              onClick={() => window.open('https://www.youtube.com/@Barholex', '_blank')}
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              {language === 'fr' ? 'Visiter la chaîne YouTube' : 'Visit YouTube Channel'}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
