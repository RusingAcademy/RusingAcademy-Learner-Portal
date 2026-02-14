import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { 
  Play, 
  Pause, 
  Volume2, 
  Filter, 
  Search,
  ChevronDown,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AudioLibraryProps {
  language?: "en" | "fr";
  onSelectPhrase?: (phraseId: string, audioUrl: string) => void;
}

export function AudioLibrary({ language = "en", onSelectPhrase }: AudioLibraryProps) {
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { data: audioData, isLoading } = trpc.audio.getAllPronunciationAudio.useQuery();
  
  const filteredAudio = audioData?.audio.filter((phrase) => {
    // Filter by level
    if (selectedLevel !== "all" && phrase.level !== selectedLevel) return false;
    
    // Filter by category
    if (selectedCategory !== "all" && phrase.category !== selectedCategory) return false;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const textMatch = phrase.text.toLowerCase().includes(query);
      const textFrMatch = phrase.textFr?.toLowerCase().includes(query);
      return textMatch || textFrMatch;
    }
    
    return true;
  }) || [];
  
  const playAudio = (phraseId: string, audioUrl: string) => {
    if (playingId === phraseId) {
      // Pause current audio
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      // Play new audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.play();
      audio.onended = () => setPlayingId(null);
      setPlayingId(phraseId);
    }
  };
  
  const getLevelColor = (level: string) => {
    switch (level) {
      case "A": return "bg-green-100 text-green-700 border-green-200";
      case "B": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "C": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };
  
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, { en: string; fr: string }> = {
      introduction: { en: "Introduction", fr: "Introduction" },
      presentation: { en: "Presentation", fr: "Présentation" },
      meeting: { en: "Meeting", fr: "Réunion" },
      negotiation: { en: "Negotiation", fr: "Négociation" },
      technical: { en: "Technical", fr: "Technique" },
      general: { en: "General", fr: "Général" },
    };
    return labels[category]?.[language] || category;
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F3D3E]" />
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0F3D3E] to-[#145A5B] p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Volume2 className="w-6 h-6" />
          <h2 className="text-xl font-bold">
            {language === "fr" ? "Bibliothèque Audio" : "Audio Library"}
          </h2>
        </div>
        <p className="text-white/80 text-sm">
          {language === "fr" 
            ? `${audioData?.total || 0} phrases de prononciation disponibles`
            : `${audioData?.total || 0} pronunciation phrases available`}
        </p>
      </div>
      
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={language === "fr" ? "Rechercher..." : "Search..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Level Filter */}
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={language === "fr" ? "Niveau" : "Level"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === "fr" ? "Tous les niveaux" : "All Levels"}</SelectItem>
              <SelectItem value="A">Niveau A</SelectItem>
              <SelectItem value="B">Niveau B</SelectItem>
              <SelectItem value="C">Niveau C</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={language === "fr" ? "Catégorie" : "Category"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === "fr" ? "Toutes catégories" : "All Categories"}</SelectItem>
              <SelectItem value="introduction">{getCategoryLabel("introduction")}</SelectItem>
              <SelectItem value="presentation">{getCategoryLabel("presentation")}</SelectItem>
              <SelectItem value="meeting">{getCategoryLabel("meeting")}</SelectItem>
              <SelectItem value="negotiation">{getCategoryLabel("negotiation")}</SelectItem>
              <SelectItem value="technical">{getCategoryLabel("technical")}</SelectItem>
              <SelectItem value="general">{getCategoryLabel("general")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Audio List */}
      <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
        {filteredAudio.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {language === "fr" 
              ? "Aucune phrase trouvée avec ces filtres."
              : "No phrases found with these filters."}
          </div>
        ) : (
          filteredAudio.map((phrase) => (
            <div
              key={phrase.id}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Play Button */}
                <button
                  onClick={() => playAudio(phrase.id, phrase.audioUrl)}
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    playingId === phrase.id
                      ? "bg-[#0F3D3E] text-white"
                      : "bg-[#E7F2F2] text-[#0F3D3E] hover:bg-[#0F3D3E] hover:text-white"
                  }`}
                >
                  {playingId === phrase.id ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </button>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* French Text */}
                  <p className="text-gray-900 font-medium mb-1">
                    {phrase.textFr}
                  </p>
                  
                  {/* English Translation */}
                  <p className="text-gray-500 text-sm mb-2">
                    {phrase.text}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getLevelColor(phrase.level)}`}>
                      {language === "fr" ? "Niveau" : "Level"} {phrase.level}
                    </span>
                    <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                      {getCategoryLabel(phrase.category)}
                    </span>
                    {phrase.duration && (
                      <span className="text-xs text-gray-400">
                        {phrase.duration}s
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Select Button (if callback provided) */}
                {onSelectPhrase && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectPhrase(phrase.id, phrase.audioUrl)}
                    className="flex-shrink-0"
                  >
                    {language === "fr" ? "Sélectionner" : "Select"}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Footer Stats */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {language === "fr" 
              ? `${filteredAudio.length} phrase(s) affichée(s)`
              : `${filteredAudio.length} phrase(s) displayed`}
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              A: {audioData?.audio.filter(p => p.level === "A").length || 0}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              B: {audioData?.audio.filter(p => p.level === "B").length || 0}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              C: {audioData?.audio.filter(p => p.level === "C").length || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AudioLibrary;
