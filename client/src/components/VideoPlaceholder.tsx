import { useState } from "react";
import { Play, Bell, Clock, Video, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface VideoPlaceholderProps {
  title: string;
  titleFr?: string;
  description?: string;
  descriptionFr?: string;
  duration?: number; // in minutes
  thumbnailUrl?: string;
  estimatedDate?: string; // e.g., "Q2 2026"
  language?: "en" | "fr";
  onNotifyMe?: () => void;
  lessonId?: number;
}

export function VideoPlaceholder({
  title,
  titleFr,
  description,
  descriptionFr,
  duration = 15,
  thumbnailUrl,
  estimatedDate = "Coming Soon",
  language = "en",
  onNotifyMe,
  lessonId,
}: VideoPlaceholderProps) {
  const [isNotified, setIsNotified] = useState(false);
  
  const displayTitle = language === "fr" && titleFr ? titleFr : title;
  const displayDescription = language === "fr" && descriptionFr ? descriptionFr : description;
  
  const handleNotifyMe = () => {
    setIsNotified(true);
    if (onNotifyMe) {
      onNotifyMe();
    }
    toast.success(
      language === "fr" 
        ? "Vous serez notifié lorsque cette vidéo sera disponible!" 
        : "You'll be notified when this video is available!"
    );
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-4xl mx-auto">
      {/* Video Preview Area */}
      <div className="relative aspect-video bg-gradient-to-br from-[#0F3D3E] via-[#145A5B] to-[#1A6B6C]">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Thumbnail or Placeholder */}
        {thumbnailUrl ? (
          <img 
            loading="lazy" src={thumbnailUrl} 
            alt={displayTitle}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Video className="w-24 h-24 text-white/20" />
          </div>
        )}
        
        {/* Coming Soon Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          {/* Play Button (Disabled) */}
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
              <Play className="w-10 h-10 text-white/50 ml-1" />
            </div>
            {/* Pulsing Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping" />
          </div>
          
          {/* Coming Soon Badge */}
          <div className="bg-white/10 backdrop-blur-md rounded-full px-6 py-2 mb-4 border border-white/20">
            <span className="text-lg font-semibold tracking-wide">
              {language === "fr" ? "Bientôt disponible" : "Coming Soon"}
            </span>
          </div>
          
          {/* Estimated Date */}
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <Calendar className="w-4 h-4" />
            <span>{estimatedDate}</span>
          </div>
        </div>
        
        {/* Duration Badge */}
        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
          <Clock className="w-4 h-4 text-white/70" />
          <span className="text-white text-sm font-medium">{duration} min</span>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">{displayTitle}</h3>
        
        {/* Description */}
        {displayDescription && (
          <p className="text-gray-600 mb-4 line-clamp-2">{displayDescription}</p>
        )}
        
        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#E7F2F2] rounded-xl p-4">
            <div className="flex items-center gap-2 text-[#0F3D3E] mb-1">
              <Video className="w-4 h-4" />
              <span className="text-sm font-medium">
                {language === "fr" ? "Format" : "Format"}
              </span>
            </div>
            <p className="text-gray-700 text-sm">
              {language === "fr" ? "Vidéo HD avec sous-titres" : "HD Video with subtitles"}
            </p>
          </div>
          
          <div className="bg-[#FFF8E7] rounded-xl p-4">
            <div className="flex items-center gap-2 text-[#B8860B] mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                {language === "fr" ? "Durée" : "Duration"}
              </span>
            </div>
            <p className="text-gray-700 text-sm">
              {duration} {language === "fr" ? "minutes" : "minutes"}
            </p>
          </div>
        </div>
        
        {/* What You'll Learn */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">
            {language === "fr" ? "Ce que vous apprendrez" : "What you'll learn"}
          </h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-[#0F3D3E] mt-0.5 flex-shrink-0" />
              <span>
                {language === "fr" 
                  ? "Techniques de prononciation avancées" 
                  : "Advanced pronunciation techniques"}
              </span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-[#0F3D3E] mt-0.5 flex-shrink-0" />
              <span>
                {language === "fr" 
                  ? "Vocabulaire professionnel en contexte" 
                  : "Professional vocabulary in context"}
              </span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-[#0F3D3E] mt-0.5 flex-shrink-0" />
              <span>
                {language === "fr" 
                  ? "Exercices pratiques interactifs" 
                  : "Interactive practice exercises"}
              </span>
            </li>
          </ul>
        </div>
        
        {/* Notify Me Button */}
        <Button
          onClick={handleNotifyMe}
          disabled={isNotified}
          className={`w-full py-6 text-lg font-semibold rounded-xl transition-all ${
            isNotified 
              ? "bg-green-100 text-green-700 cursor-default" 
              : "bg-gradient-to-r from-[#0F3D3E] to-[#145A5B] text-white hover:opacity-90"
          }`}
        >
          {isNotified ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              {language === "fr" ? "Notification activée" : "Notification enabled"}
            </>
          ) : (
            <>
              <Bell className="w-5 h-5 mr-2" />
              {language === "fr" ? "Me notifier quand disponible" : "Notify me when available"}
            </>
          )}
        </Button>
        
        {/* Alternative Content Notice */}
        <p className="text-center text-sm text-gray-500 mt-4">
          {language === "fr" 
            ? "En attendant, explorez nos autres leçons et exercices disponibles." 
            : "In the meantime, explore our other available lessons and exercises."}
        </p>
      </div>
    </div>
  );
}

export default VideoPlaceholder;
