/**
 * ResourceLibrary Page
 * Documents, recordings, and learning materials library
 * Sprint 8: Premium Learning Hub
 */

import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  FileText,
  Video,
  Download,
  Search,
  Filter,
  FolderOpen,
  Play,
  Clock,
  Calendar,
  Eye,
  BookOpen,
  Headphones,
  File,
  ChevronRight,
  Star,
  Grid,
  List,
  SlidersHorizontal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import PortalLayout from "@/components/portal/PortalLayout";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: "document" | "video" | "audio" | "slides" | "exercise";
  category: string;
  module: string;
  level: "A" | "B" | "C";
  duration?: string;
  pages?: number;
  size?: string;
  addedDate: string;
  isFavorite: boolean;
  downloadUrl: string;
  previewUrl?: string;
}

interface Category {
  id: string;
  name: string;
  icon: typeof FileText;
  count: number;
  color: string;
}

const categories: Category[] = [
  { id: "all", name: "Tous", icon: FolderOpen, count: 24, color: "text-slate-600" },
  { id: "documents", name: "Documents", icon: FileText, count: 12, color: "text-blue-600" },
  { id: "videos", name: "Vidéos", icon: Video, count: 6, color: "text-[#0F3D3E]" },
  { id: "audio", name: "Audio", icon: Headphones, count: 3, color: "text-emerald-600" },
  { id: "exercises", name: "Exercices", icon: BookOpen, count: 3, color: "text-amber-600" },
];

const resources: Resource[] = [
  {
    id: "r1",
    title: "Guide de rédaction administrative",
    description: "Manuel complet pour la rédaction de documents officiels en français",
    type: "document",
    category: "documents",
    module: "Expression écrite professionnelle",
    level: "B",
    pages: 45,
    size: "2.4 MB",
    addedDate: "18 janvier 2026",
    isFavorite: true,
    downloadUrl: "#",
    previewUrl: "#",
  },
  {
    id: "r2",
    title: "Session de coaching - Expression orale (15 jan)",
    description: "Enregistrement de votre session de coaching avec Marie-Claire",
    type: "video",
    category: "videos",
    module: "Interaction orale",
    level: "B",
    duration: "45 min",
    size: "320 MB",
    addedDate: "15 janvier 2026",
    isFavorite: false,
    downloadUrl: "#",
    previewUrl: "#",
  },
  {
    id: "r3",
    title: "Vocabulaire administratif - 500 termes essentiels",
    description: "Liste exhaustive du vocabulaire professionnel avec exemples",
    type: "document",
    category: "documents",
    module: "Fondamentaux",
    level: "A",
    pages: 28,
    size: "1.2 MB",
    addedDate: "10 janvier 2026",
    isFavorite: true,
    downloadUrl: "#",
    previewUrl: "#",
  },
  {
    id: "r4",
    title: "Exercices de compréhension orale - Niveau B",
    description: "Série d'exercices audio pour améliorer votre compréhension",
    type: "audio",
    category: "audio",
    module: "Compréhension orale",
    level: "B",
    duration: "30 min",
    size: "45 MB",
    addedDate: "12 janvier 2026",
    isFavorite: false,
    downloadUrl: "#",
  },
];

const typeIcons = {
  document: { icon: FileText, color: "text-blue-600", bg: "bg-blue-100" },
  video: { icon: Video, color: "text-[#0F3D3E]", bg: "bg-[#E7F2F2]" },
  audio: { icon: Headphones, color: "text-emerald-600", bg: "bg-emerald-100" },
  slides: { icon: File, color: "text-orange-600", bg: "bg-orange-100" },
  exercise: { icon: BookOpen, color: "text-amber-600", bg: "bg-amber-100" },
};

const levelColors = {
  A: "bg-emerald-100 text-emerald-700",
  B: "bg-amber-100 text-amber-700",
  C: "bg-blue-100 text-blue-700",
};

export default function ResourceLibrary() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || resource.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const favoriteResources = resources.filter(r => r.isFavorite);

  return (
    <PortalLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Bibliothèque de Ressources</h1>
            <p className="text-slate-500 mt-1">Documents, enregistrements et matériel d'apprentissage</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")} className="h-9 w-9">
              <Grid className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" onClick={() => setViewMode("list")} className="h-9 w-9">
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Rechercher dans la bibliothèque..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <Button variant="outline" className="gap-2"><SlidersHorizontal className="h-4 w-4" />Filtres</Button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button key={category.id} onClick={() => setActiveCategory(category.id)} className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap", activeCategory === category.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
              <category.icon className={cn("h-4 w-4", activeCategory === category.id ? "text-white" : category.color)} />
              {category.name}
              <span className={cn("px-1.5 py-0.5 rounded text-xs", activeCategory === category.id ? "bg-blue-500" : "bg-slate-200")}>{category.count}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <p className="text-sm text-slate-500 mb-4">{filteredResources.length} ressource{filteredResources.length > 1 ? "s" : ""} trouvée{filteredResources.length > 1 ? "s" : ""}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResources.map((resource) => {
                const typeInfo = typeIcons[resource.type];
                return (
                  <Card key={resource.id} className="border-slate-200 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", typeInfo.bg)}>
                          <typeInfo.icon className={cn("h-6 w-6", typeInfo.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-slate-900 truncate">{resource.title}</h4>
                            {resource.isFavorite && <Star className="h-4 w-4 text-amber-500 fill-amber-500 flex-shrink-0" />}
                          </div>
                          <p className="text-sm text-slate-500 line-clamp-2 mb-2">{resource.description}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span className={cn("px-2 py-0.5 rounded font-medium", levelColors[resource.level])}>Niveau {resource.level}</span>
                            {resource.duration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{resource.duration}</span>}
                            {resource.pages && <span>{resource.pages} pages</span>}
                            {resource.size && <span>{resource.size}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                        {resource.previewUrl && <Button variant="outline" size="sm" className="gap-1 flex-1"><Eye className="h-3 w-3" />Aperçu</Button>}
                        <Button variant="outline" size="sm" className="gap-1 flex-1"><Download className="h-3 w-3" />Télécharger</Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-lg font-semibold text-slate-900">Favoris</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {favoriteResources.map((resource) => {
                    const typeInfo = typeIcons[resource.type];
                    return (
                      <div key={resource.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white cursor-pointer">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", typeInfo.bg)}>
                          <typeInfo.icon className={cn("h-4 w-4", typeInfo.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{resource.title}</p>
                          <p className="text-xs text-slate-500">{resource.module}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-blue-50 to-[#145A5B]-50">
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-3">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">Besoin d'aide?</h3>
                  <p className="text-sm text-slate-500 mb-4">Consultez notre guide d'utilisation de la bibliothèque</p>
                  <Button variant="outline" className="w-full">Voir le guide</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
