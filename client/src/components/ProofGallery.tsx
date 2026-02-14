import { useState } from "react";
import { Play, X, Filter } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

/**
 * ProofGallery - Video Testimonials Gallery Component
 * 
 * Per Guide Maître v3.0 specifications:
 * - Positioned before FAQ section
 * - Filter chips: Tous | Podcast Shorts | Coach Intros | Learning Capsules
 * - Video cards with thumbnails
 * - Modal for video playback
 */

interface VideoItem {
  id: string;
  thumbnail: string;
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  category: "all" | "shorts" | "coaches" | "capsules";
  videoUrl: string;
  duration: string;
  views?: string;
}

const videoItems: VideoItem[] = [
  // YouTube Shorts / Podcast Shorts
  {
    id: "short-1",
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663049070748/gvnmYNphKZgt9jM9K8Vi9K/videos/thumbs/short_barholex_gc_exam_prep_intro_01_thumb.webp",
    title: "SLE Exam: What You Need to Know",
    titleFr: "Examen ELS: Ce que vous devez savoir",
    description: "Quick overview of the SLE evaluation process",
    descriptionFr: "Aperçu rapide du processus d'évaluation ELS",
    category: "shorts",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    duration: "0:58",
    views: "12K",
  },
  {
    id: "short-2",
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663049070748/gvnmYNphKZgt9jM9K8Vi9K/videos/thumbs/short_barholex_gc_exam_prep_intro_02_thumb.webp",
    title: "5 Tips for Oral Exam Success",
    titleFr: "5 conseils pour réussir l'examen oral",
    description: "Expert tips from Coach Steven",
    descriptionFr: "Conseils d'expert du coach Steven",
    category: "shorts",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    duration: "1:12",
    views: "8.5K",
  },
  {
    id: "short-3",
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663049070748/gvnmYNphKZgt9jM9K8Vi9K/videos/thumbs/short_barholex_gc_exam_prep_intro_03_thumb.webp",
    title: "Common SLE Mistakes to Avoid",
    titleFr: "Erreurs ELS courantes à éviter",
    description: "Learn from others' experiences",
    descriptionFr: "Apprenez des expériences des autres",
    category: "shorts",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    duration: "1:05",
    views: "15K",
  },
  // Coach Intros
  {
    id: "coach-1",
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663049070748/gvnmYNphKZgt9jM9K8Vi9K/videos/thumbs/coach_steven_intro_01_thumb.webp",
    title: "Meet Coach Steven Barholere",
    titleFr: "Rencontrez le coach Steven Barholere",
    description: "Founder & Principal Coach - 15+ years experience",
    descriptionFr: "Fondateur et coach principal - 15+ ans d'expérience",
    category: "coaches",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    duration: "3:24",
    views: "5.2K",
  },
  {
    id: "coach-2",
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663049070748/gvnmYNphKZgt9jM9K8Vi9K/videos/thumbs/coach_sueanne_intro_01_thumb.webp",
    title: "Meet Coach Sue Anne",
    titleFr: "Rencontrez la coach Sue Anne",
    description: "Senior Coach - Written Expression Specialist",
    descriptionFr: "Coach senior - Spécialiste de l'expression écrite",
    category: "coaches",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    duration: "2:45",
    views: "3.8K",
  },
  {
    id: "coach-3",
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663049070748/gvnmYNphKZgt9jM9K8Vi9K/videos/thumbs/coach_erica_intro_01_thumb.webp",
    title: "Meet Coach Erica",
    titleFr: "Rencontrez la coach Erica",
    description: "Performance Psychology Expert",
    descriptionFr: "Experte en psychologie de la performance",
    category: "coaches",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    duration: "2:58",
    views: "2.9K",
  },
  // Learning Capsules
  {
    id: "capsule-1",
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663049070748/gvnmYNphKZgt9jM9K8Vi9K/videos/thumbs/capsule_sle_oral_introduction_01_thumb.webp",
    title: "SLE Oral: Introduction to the Format",
    titleFr: "ELS Oral: Introduction au format",
    description: "Understanding the oral exam structure",
    descriptionFr: "Comprendre la structure de l'examen oral",
    category: "capsules",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    duration: "8:15",
    views: "22K",
  },
  {
    id: "capsule-2",
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663049070748/gvnmYNphKZgt9jM9K8Vi9K/videos/thumbs/capsule_sle_oral_introduction_02_thumb.webp",
    title: "Building Fluency: Key Strategies",
    titleFr: "Développer la fluidité: Stratégies clés",
    description: "Techniques to improve your speaking flow",
    descriptionFr: "Techniques pour améliorer votre fluidité",
    category: "capsules",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    duration: "12:30",
    views: "18K",
  },
  {
    id: "capsule-3",
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663049070748/gvnmYNphKZgt9jM9K8Vi9K/videos/thumbs/capsule_sle_written_introduction_01_thumb.webp",
    title: "Written Expression: Grammar Essentials",
    titleFr: "Expression écrite: Grammaire essentielle",
    description: "Master the key grammar points for Level C",
    descriptionFr: "Maîtrisez les points de grammaire clés pour le niveau C",
    category: "capsules",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    duration: "15:45",
    views: "14K",
  },
];

type FilterCategory = "all" | "shorts" | "coaches" | "capsules";

const filterOptions: { value: FilterCategory; labelEn: string; labelFr: string }[] = [
  { value: "all", labelEn: "All", labelFr: "Tous" },
  { value: "shorts", labelEn: "Podcast Shorts", labelFr: "Capsules Podcast" },
  { value: "coaches", labelEn: "Coach Intros", labelFr: "Présentations Coachs" },
  { value: "capsules", labelEn: "Learning Capsules", labelFr: "Capsules d'apprentissage" },
];

export default function ProofGallery() {
  const { language } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  const filteredVideos = activeFilter === "all" 
    ? videoItems 
    : videoItems.filter(item => item.category === activeFilter);

  const handleVideoClick = (video: VideoItem) => {
    setSelectedVideo(video);
  };

  const handleCloseModal = () => {
    setSelectedVideo(null);
  };

  return (
    <section 
      className="py-20 bg-gradient-to-b from-white to-slate-50"
      aria-labelledby="proof-gallery-title"
    >
      <div className="container mx-auto px-6 md:px-8 lg:px-12 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Play className="h-4 w-4" aria-hidden="true" />
            {language === "fr" ? "Voyez les résultats réels" : "See Real Results"}
          </span>
          <h2 
            id="proof-gallery-title" 
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            {language === "fr" 
              ? "Témoignages et Capsules d'Apprentissage" 
              : "Testimonials & Learning Capsules"}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            {language === "fr"
              ? "Découvrez les témoignages de fonctionnaires qui ont atteint leurs objectifs linguistiques et explorez nos capsules d'apprentissage."
              : "Watch testimonials from public servants who achieved their language goals and explore our learning capsules."}
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setActiveFilter(option.value)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeFilter === option.value
                  ? "bg-teal-600 text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-teal-300 hover:bg-teal-50"
              }`}
              aria-pressed={activeFilter === option.value}
            >
              {language === "fr" ? option.labelFr : option.labelEn}
            </button>
          ))}
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <button
              key={video.id}
              onClick={() => handleVideoClick(video)}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:border-teal-200 transition-all duration-300 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={language === 'en' ? video.title : video.titleFr}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"                 />
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="h-6 w-6 text-teal-600 fill-teal-600 ml-1" />
                  </div>
                </div>
                {/* Duration badge */}
                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </span>
                {/* Category badge */}
                <span className="absolute top-2 left-2 bg-teal-600/90 text-white text-xs px-2 py-1 rounded-full capitalize">
                  {video.category === "shorts" && (language === "fr" ? "Podcast" : "Short")}
                  {video.category === "coaches" && (language === "fr" ? "Coach" : "Coach")}
                  {video.category === "capsules" && (language === "fr" ? "Capsule" : "Capsule")}
                </span>
              </div>
              
              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-teal-600 transition-colors">
                  {language === "fr" ? video.titleFr : video.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {language === "fr" ? video.descriptionFr : video.description}
                </p>
                {video.views && (
                  <p className="text-xs text-gray-400 mt-2">
                    {video.views} {language === "fr" ? "vues" : "views"}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-10">
          <Button
            variant="outline"
            className="rounded-full px-8 py-6 text-base font-medium border-2 hover:bg-teal-50 hover:border-teal-300"
          >
            {language === "fr" ? "Voir tous les témoignages" : "View All Testimonials"}
          </Button>
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-[2000]"
          style={{ backgroundColor: "rgba(11,18,32,0.55)" }}
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
          aria-label={language === "fr" ? selectedVideo.titleFr : selectedVideo.title}
        >
          <div
            className="relative bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {language === "fr" ? selectedVideo.titleFr : selectedVideo.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {language === "fr" ? selectedVideo.descriptionFr : selectedVideo.description}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                aria-label={language === "fr" ? "Fermer" : "Close"}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Video Player */}
            <div className="aspect-video bg-black">
              <iframe
                src={selectedVideo.videoUrl}
                title={language === "fr" ? selectedVideo.titleFr : selectedVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
