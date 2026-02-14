import { useState } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  GraduationCap,
  Target,
  Award,
  ArrowRight,
  Clock,
  Users,
  Star,
  Search,
  Filter,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { EcosystemFooter } from "@/components/EcosystemFooter";
import EcosystemHeaderGold from "@/components/EcosystemHeaderGold";
import { PATH_SERIES_PRICES } from "@shared/pricing";

// CEFR Level descriptions
const cefrDescriptions: Record<string, { en: string; fr: string }> = {
  A1: { en: "Beginner", fr: "Débutant" },
  A2: { en: "Elementary", fr: "Élémentaire" },
  B1: { en: "Intermediate", fr: "Intermédiaire" },
  B2: { en: "Upper Intermediate", fr: "Intermédiaire Supérieur" },
  C1: { en: "Advanced", fr: "Avancé" },
  C2: { en: "Mastery", fr: "Maîtrise" },
  exam_prep: { en: "Exam Preparation", fr: "Préparation aux Examens" },
};

// Fallback data from pricing constants (used when DB is empty)
const fallbackPaths = Object.values(PATH_SERIES_PRICES).map((price, index) => ({
  id: index + 1,
  slug: price.id,
  title: price.name,
  titleFr: price.nameFr,
  cefrLevel: price.level === "SLE Prep" ? "exam_prep" : price.level,
  price: price.priceInCents,
  originalPrice: price.originalPriceInCents,
  status: "published" as const,
  totalEnrollments: 0,
  averageRating: null,
  totalReviews: 0,
  icon: ["🌱", "💬", "📊", "🎯", "👑", "🏆"][index],
  colorGradient: [
    "from-emerald-500 to-teal-600",
    "from-blue-500 to-indigo-600",
    "from-amber-500 to-orange-600",
    "from-[#0F3D3E] to-[#145A5B]",
    "from-purple-500 to-violet-600",
    "from-rose-500 to-red-600",
  ][index],
  bgColor: [
    "bg-emerald-50",
    "bg-blue-50",
    "bg-amber-50",
    "bg-[#E7F2F2]",
    "bg-purple-50",
    "bg-rose-50",
  ][index],
  levelBadge: ["Beginner", "Elementary", "Intermediate", "Upper Intermediate", "Advanced", "SLE Ready"][index],
  sleBadge: [null, null, "BBB", "CBC", "CCC", "BBB/CBC/CCC"][index],
  durationWeeks: 4,
  structuredHours: 30,
}));

export default function Paths() {
  const { language } = useLanguage();
  const t = language === "fr";
  
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  
  // Fetch paths from API
  const { data: paths, isLoading, error } = trpc.paths.list.useQuery({
    status: "published",
    level: levelFilter !== "all" ? levelFilter as any : undefined,
    search: searchQuery || undefined,
  });

  // Use fallback data if no paths in DB
  const displayPaths = paths && paths.length > 0 ? paths : fallbackPaths;
  
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat(language === "fr" ? "fr-CA" : "en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <EcosystemHeaderGold />
      
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-200 rounded-full blur-3xl" />
        </div>
        
        <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-4 bg-amber-100 text-amber-800 border-amber-200">
              <Sparkles className="w-3 h-3 mr-1" />
              {t ? "Parcours d'Apprentissage Structurés" : "Structured Learning Paths"}
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Path Series™
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              {t
                ? "Progressez du niveau débutant à la maîtrise professionnelle avec nos parcours d'apprentissage structurés, conçus spécifiquement pour les fonctionnaires canadiens."
                : "Progress from beginner to professional mastery with our structured learning paths, designed specifically for Canadian public servants."}
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 text-slate-600">
                <GraduationCap className="w-5 h-5 text-amber-600" />
                <span>{t ? "6 Parcours Complets" : "6 Complete Paths"}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Target className="w-5 h-5 text-amber-600" />
                <span>{t ? "Aligné sur l'ELS" : "SLE-Aligned"}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Award className="w-5 h-5 text-amber-600" />
                <span>{t ? "Certification Incluse" : "Certification Included"}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 border-b border-slate-200 bg-white sticky top-0 z-20">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder={t ? "Rechercher un parcours..." : "Search paths..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder={t ? "Niveau" : "Level"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t ? "Tous les niveaux" : "All Levels"}</SelectItem>
                  <SelectItem value="A1">A1 - {t ? "Débutant" : "Beginner"}</SelectItem>
                  <SelectItem value="A2">A2 - {t ? "Élémentaire" : "Elementary"}</SelectItem>
                  <SelectItem value="B1">B1 - {t ? "Intermédiaire" : "Intermediate"}</SelectItem>
                  <SelectItem value="B2">B2 - {t ? "Intermédiaire Sup." : "Upper Intermediate"}</SelectItem>
                  <SelectItem value="C1">C1 - {t ? "Avancé" : "Advanced"}</SelectItem>
                  <SelectItem value="exam_prep">{t ? "Préparation ELS" : "SLE Prep"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <p className="text-sm text-slate-500">
              {displayPaths.length} {t ? "parcours disponibles" : "paths available"}
            </p>
          </div>
        </div>
      </section>

      {/* Paths Grid */}
      <section className="py-12 md:py-16">
        <div className="container px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="h-32 bg-slate-100" />
                  <CardContent className="space-y-4 p-6">
                    <div className="h-6 bg-slate-100 rounded w-3/4" />
                    <div className="h-4 bg-slate-100 rounded w-full" />
                    <div className="h-4 bg-slate-100 rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayPaths.map((path, index) => (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link href={`/paths/${path.slug}`}>
                    <Card className="group h-full cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-slate-200 hover:border-amber-300">
                      {/* Cover Image or Gradient Header */}
                      {path.thumbnailUrl ? (
                        <div className="relative h-40 overflow-hidden">
                          <img
                            src={path.thumbnailUrl}
                            alt={t && path.titleFr ? path.titleFr : path.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                          <div className="absolute top-3 left-3 flex items-center gap-2">
                            <Badge className="bg-white/90 text-slate-800 border-0 text-xs font-semibold shadow-sm">
                              {path.cefrLevel === "exam_prep" 
                                ? (t ? "Préparation ELS" : "SLE Prep")
                                : `CEFR ${path.cefrLevel}`}
                            </Badge>
                            {path.sleBadge && (
                              <Badge className="bg-amber-600 text-white text-xs border-0 shadow-sm">
                                {path.sleBadge}
                              </Badge>
                            )}
                          </div>
                          <ChevronRight className="absolute top-3 right-3 w-5 h-5 text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                      ) : (
                        <div className={`h-3 bg-gradient-to-r ${path.colorGradient || "from-amber-500 to-orange-600"}`} />
                      )}
                      
                      <CardHeader className={`${!path.thumbnailUrl ? (path.bgColor || 'bg-amber-50') : ''} pb-4`}>
                        {!path.thumbnailUrl && (
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{path.icon || "📚"}</span>
                              <div>
                                <Badge variant="outline" className="mb-1 text-xs">
                                  {path.cefrLevel === "exam_prep" 
                                    ? (t ? "Préparation ELS" : "SLE Prep")
                                    : `CEFR ${path.cefrLevel}`}
                                </Badge>
                                {path.sleBadge && (
                                  <Badge className="ml-2 bg-amber-600 text-white text-xs">
                                    {path.sleBadge}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                          </div>
                        )}
                        
                        <CardTitle className={`text-xl ${path.thumbnailUrl ? 'mt-1' : 'mt-3'} text-slate-900 group-hover:text-amber-700 transition-colors`}>
                          {t && path.titleFr ? path.titleFr : path.title}
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="pt-4 space-y-4">
                        {/* Stats Row */}
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{path.durationWeeks || 4} {t ? "sem." : "wks"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{path.structuredHours || 30}h</span>
                          </div>
                          {path.totalEnrollments > 0 && (
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{path.totalEnrollments}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Rating */}
                        {path.averageRating && path.totalReviews > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= Math.round(Number(path.averageRating))
                                      ? "text-amber-400 fill-amber-400"
                                      : "text-slate-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-slate-600">
                              ({path.totalReviews} {t ? "avis" : "reviews"})
                            </span>
                          </div>
                        )}
                        
                        {/* Price */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <div>
                            {path.originalPrice && path.originalPrice > path.price && (
                              <span className="text-sm text-slate-400 line-through mr-2">
                                {formatPrice(path.originalPrice)}
                              </span>
                            )}
                            <span className="text-2xl font-bold text-slate-900">
                              {formatPrice(path.price)}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                          >
                            {t ? "Voir" : "View"}
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
          
          {/* Empty State */}
          {!isLoading && displayPaths.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                {t ? "Aucun parcours trouvé" : "No paths found"}
              </h3>
              <p className="text-slate-500 mb-6">
                {t
                  ? "Essayez de modifier vos filtres de recherche."
                  : "Try adjusting your search filters."}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setLevelFilter("all");
                }}
              >
                {t ? "Réinitialiser les filtres" : "Reset Filters"}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-amber-600 to-orange-600">
        <div className="container px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t ? "Prêt à Commencer Votre Parcours?" : "Ready to Start Your Journey?"}
          </h2>
          <p className="text-lg text-amber-100 mb-8 max-w-2xl mx-auto">
            {t
              ? "Choisissez le parcours qui correspond à votre niveau actuel et commencez votre transformation vers l'excellence bilingue."
              : "Choose the path that matches your current level and begin your transformation toward bilingual excellence."}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/sle-diagnostic">
              <Button size="lg" variant="secondary" className="bg-white text-amber-700 hover:bg-amber-50">
                <Target className="w-5 h-5 mr-2" />
                {t ? "Évaluation Diagnostique" : "Diagnostic Assessment"}
              </Button>
            </Link>
            <Link href="/coaches">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Users className="w-5 h-5 mr-2" />
                {t ? "Parler à un Coach" : "Talk to a Coach"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <EcosystemFooter lang={language === "fr" ? "fr" : "en"} theme="light" activeBrand="rusingacademy" />
    </div>
  );
}
