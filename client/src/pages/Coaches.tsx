import { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Header is provided by EcosystemLayout
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Search,
  Star,
  Clock,
  Users,
  Filter,
  X,
  ChevronRight,
  Play,
  MessageSquare,
  Award,
  Loader2,
  Linkedin,
  Sparkles,
  Calendar,
  CheckCircle,
  Globe,
  Video,
  Heart,
  Zap,
  TrendingUp,
  Shield,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Coaches() {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [specializationFilter, setSpecializationFilter] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const [hoveredCoach, setHoveredCoach] = useState<number | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Fetch coaches from database
  const { data: coaches, isLoading, error } = trpc.coach.list.useQuery({
    language: languageFilter !== "all" ? languageFilter as "french" | "english" | "both" : undefined,
    specializations: specializationFilter.length > 0 ? specializationFilter : undefined,
    minPrice: priceRange === "under40" ? undefined : priceRange === "40to60" ? 4000 : priceRange === "over60" ? 6001 : undefined,
    maxPrice: priceRange === "under40" ? 3999 : priceRange === "40to60" ? 6000 : undefined,
    search: searchQuery || undefined,
    limit: 50,
  });

  // Scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = Number(entry.target.getAttribute('data-coach-id'));
          if (entry.isIntersecting) {
            setVisibleCards(prev => new Set(prev).add(id));
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    cardRefs.current.forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [coaches]);

  const specializationLabels: Record<string, { en: string; fr: string }> = {
    oral_a: { en: "Oral A", fr: "Oral A" },
    oral_b: { en: "Oral B", fr: "Oral B" },
    oral_c: { en: "Oral C", fr: "Oral C" },
    oralA: { en: "Oral A", fr: "Oral A" },
    oralB: { en: "Oral B", fr: "Oral B" },
    oralC: { en: "Oral C", fr: "Oral C" },
    written_a: { en: "Written A", fr: "Écrit A" },
    written_b: { en: "Written B", fr: "Écrit B" },
    written_c: { en: "Written C", fr: "Écrit C" },
    writtenA: { en: "Written A", fr: "Écrit A" },
    writtenB: { en: "Written B", fr: "Écrit B" },
    writtenC: { en: "Written C", fr: "Écrit C" },
    reading: { en: "Reading", fr: "Lecture" },
    readingComprehension: { en: "Reading", fr: "Lecture" },
    anxiety_coaching: { en: "Anxiety Coaching", fr: "Gestion du stress" },
    examPrep: { en: "Exam Prep", fr: "Préparation examen" },
    businessFrench: { en: "Business French", fr: "Français affaires" },
    businessEnglish: { en: "Business English", fr: "Anglais affaires" },
    confidence: { en: "Confidence", fr: "Confiance" },
    mindset: { en: "Mindset", fr: "Mentalité" },
    executive: { en: "Executive", fr: "Exécutif" },
    presentations: { en: "Presentations", fr: "Présentations" },
    professional_english: { en: "Professional English", fr: "Anglais professionnel" },
    cultural: { en: "Cultural", fr: "Culturel" },
    exam_prep: { en: "Exam Prep", fr: "Préparation examen" },
  };

  const getSpecLabel = (key: string) => specializationLabels[key]?.[language] || key;

  const languageLabels: Record<string, { en: string; fr: string }> = {
    french: { en: "French", fr: "Français" },
    english: { en: "English", fr: "Anglais" },
    both: { en: "Bilingual", fr: "Bilingue" },
  };

  const getLangLabel = (key: string) => languageLabels[key]?.[language] || key;

  // Process coach data to extract specializations array
  const processedCoaches = useMemo(() => {
    if (!coaches) return [];
    return coaches.map((coach) => {
      const specs = typeof coach.specializations === 'object' && coach.specializations !== null
        ? Object.entries(coach.specializations as Record<string, boolean>)
            .filter(([_, value]) => value)
            .map(([key]) => key)
        : [];
      return {
        ...coach,
        specializationsArray: specs,
      };
    });
  }, [coaches]);

  const toggleSpecialization = (spec: string) => {
    setSpecializationFilter((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setLanguageFilter("all");
    setSpecializationFilter([]);
    setPriceRange("all");
  };

  const hasActiveFilters =
    searchQuery || languageFilter !== "all" || specializationFilter.length > 0 || priceRange !== "all";

  // Get availability status for coach
  const getAvailability = (coachId: number) => {
    const mod = coachId % 3;
    if (mod === 0) return { status: 'available', label: language === 'fr' ? 'Disponible' : 'Available', color: 'green' };
    if (mod === 1) return { status: 'tomorrow', label: language === 'fr' ? 'Demain' : 'Tomorrow', color: 'amber' };
    return { status: 'monday', label: language === 'fr' ? 'Lundi' : 'Monday', color: 'blue' };
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      

      <main id="main-content" className="flex-1">
        {/* Search Bar Section */}
        <section className="py-6">
          <div className="container mx-auto px-6 md:px-8 lg:px-12">
            <div className="max-w-2xl mx-auto">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity duration-500" />
                <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                  <Search className="w-5 h-5 text-slate-400 ml-4" />
                  <Input
                    type="text"
                    placeholder={language === 'fr' ? 'Rechercher par nom, spécialité...' : 'Search by name, specialty...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 border-0 bg-transparent text-lg py-6 px-4 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-400"
                  />
                  <Button className="m-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-6 py-5 rounded-lg">
                    {language === 'fr' ? 'Rechercher' : 'Search'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-6 md:px-8 lg:px-12 pb-20">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar - Premium */}
            <aside className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="sticky top-24 space-y-6">
                {/* Filter Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold text-lg flex items-center gap-2">
                        <Filter className="w-5 h-5 text-teal-600" />
                        {language === 'fr' ? 'Filtres' : 'Filters'}
                      </h2>
                      {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-teal-600 hover:text-teal-700 hover:bg-teal-50">
                          {language === 'fr' ? 'Effacer' : 'Clear'}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Language Filter */}
                    <div>
                      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-teal-600" />
                        {language === 'fr' ? 'Langue' : 'Language'}
                      </Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {['all', 'french', 'english'].map((lang) => (
                          <button
                            key={lang}
                            onClick={() => setLanguageFilter(lang)}
                            aria-pressed={languageFilter === lang}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              languageFilter === lang
                                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-500/25'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            {lang === 'all' ? (language === 'fr' ? 'Tous' : 'All') : getLangLabel(lang)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Specialization Filter */}
                    <div>
                      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-teal-600" />
                        {language === 'fr' ? 'Spécialisation SLE' : 'SLE Specialization'}
                      </Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['oralA', 'oralB', 'oralC', 'writtenA', 'writtenB', 'writtenC', 'reading', 'anxiety_coaching'].map((spec) => (
                          <button
                            key={spec}
                            onClick={() => toggleSpecialization(spec)}
                            aria-pressed={specializationFilter.includes(spec)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                              specializationFilter.includes(spec)
                                ? 'bg-teal-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-teal-100 hover:text-teal-700'
                            }`}
                          >
                            {getSpecLabel(spec)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-teal-600" />
                        {language === 'fr' ? 'Prix par heure' : 'Price per hour'}
                      </Label>
                      <Select value={priceRange} onValueChange={setPriceRange}>
                        <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" style={{color: '#464646'}}>
                          <SelectValue placeholder={language === 'fr' ? 'Tous les prix' : 'Any Price'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{language === 'fr' ? 'Tous les prix' : 'Any Price'}</SelectItem>
                          <SelectItem value="under40">{language === 'fr' ? 'Moins de 40$' : 'Under $40'}</SelectItem>
                          <SelectItem value="40to60">$40 - $60</SelectItem>
                          <SelectItem value="over60">{language === 'fr' ? 'Plus de 60$' : 'Over $60'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Why Choose Us Card */}
                <div className="bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl p-6 text-white">
                  <h3 className="font-semibold text-lg mb-4">
                    {language === 'fr' ? 'Pourquoi Lingueefy?' : 'Why Lingueefy?'}
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-white/90">
                        {language === 'fr' ? 'Coachs certifiés SLE' : 'SLE-certified coaches'}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-white/90">
                        {language === 'fr' ? 'Garantie de satisfaction' : 'Satisfaction guarantee'}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-white/90">
                        {language === 'fr' ? 'Sessions flexibles 24/7' : 'Flexible 24/7 sessions'}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </aside>

            {/* Coach List */}
            <div className="flex-1">
              {/* Mobile Filter Toggle */}
              <div className="lg:hidden mb-6">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full justify-between bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    {language === 'fr' ? 'Filtres' : 'Filters'}
                    {hasActiveFilters && (
                      <Badge className="ml-2 bg-teal-100 text-teal-700">
                        {language === "fr" ? "Actif" : "Active"}
                      </Badge>
                    )}
                  </span>
                  {showFilters ? <X className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-slate-900 dark:text-slate-100">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                      {language === "fr" ? "Chargement..." : "Loading..."}
                    </span>
                  ) : (
                    <span>
                      <span className="font-semibold text-teal-600">{processedCoaches.length}</span>
                      {' '}{language === 'fr' ? 'coachs trouvés' : 'coaches found'}
                    </span>
                  )}
                </p>
              </div>

              {/* Error State */}
              {error && !isLoading && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-red-200/50 dark:border-red-700/50 p-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/50 dark:to-orange-900/50 flex items-center justify-center mx-auto mb-6">
                    <X className="h-10 w-10 text-red-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    {language === "fr" ? "Erreur de chargement" : "Loading Error"}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                    {language === "fr"
                      ? "Impossible de charger les coachs. Veuillez réessayer."
                      : "Unable to load coaches. Please try again."}
                  </p>
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
                  >
                    {language === 'fr' ? 'Réessayer' : 'Retry'}
                  </Button>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                    <p className="text-slate-900 dark:text-slate-100">
                      {language === "fr" ? "Recherche des meilleurs coachs..." : "Finding the best coaches..."}
                    </p>
                  </div>
                </div>
              )}

              {/* Coach Cards - Premium Grid */}
              {!isLoading && (
                <div className="grid gap-6" role="list">
                  {processedCoaches.map((coach, index) => {
                    const availability = getAvailability(coach.id);
                    const isHovered = hoveredCoach === coach.id;
                    
                    return (
                      <div
                        key={coach.id}
                        ref={(el) => { if (el) cardRefs.current.set(coach.id, el); }}
                        data-coach-id={coach.id}
                        onMouseEnter={() => setHoveredCoach(coach.id)}
                        onMouseLeave={() => setHoveredCoach(null)}
                        className={`group relative bg-white dark:bg-slate-900 rounded-2xl shadow-lg hover:shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden transition-all duration-500 ${
                          visibleCards.has(coach.id) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                        }`}
                        style={{ transitionDelay: `${index * 100}ms` }}
                        role="listitem"
                      >
                        {/* Gradient Border Effect on Hover */}
                        <div className={`absolute inset-0 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 rounded-2xl transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} style={{ padding: '2px' }}>
                          <div className="absolute inset-[2px] bg-white dark:bg-slate-900 rounded-[14px]" />
                        </div>

                        <div className="relative flex flex-col lg:flex-row">
                          {/* Coach Photo Section */}
                          <div className="lg:w-72 relative overflow-hidden">
                            <div className="aspect-[4/3] lg:aspect-auto lg:h-full min-h-[220px] lg:min-h-[280px] relative bg-slate-100 dark:bg-slate-800">
                              {/* Photo */}
                              {imgErrors.has(coach.id) ? (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30">
                                  <div className="text-center">
                                    <Users className="w-12 h-12 text-teal-400 mx-auto mb-2" />
                                    <span className="text-sm text-teal-600 dark:text-teal-400 font-medium">{coach.name}</span>
                                  </div>
                                </div>
                              ) : (
                                <img
                                  loading={index < 3 ? "eager" : "lazy"}
                                  src={coach.photoUrl || coach.avatarUrl || 'https://rusingacademy-cdn.b-cdn.net/images/coaches/coach1.jpg'}
                                  alt={coach.name || 'Coach'}
                                  width={288}
                                  height={280}
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                  onError={() => setImgErrors(prev => new Set(prev).add(coach.id))}
                                />
                              )}
                              
                              {/* Gradient Overlay — reduced opacity to keep photos visible */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/20" />
                              
                              {/* Availability Badge */}
                              <div className="absolute top-4 left-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md ${
                                  availability.color === 'green' 
                                    ? 'bg-green-500/90 text-white' 
                                    : availability.color === 'amber'
                                    ? 'bg-[#C65A1E]/90 text-white'
                                    : 'bg-blue-500/90 text-white'
                                }`}>
                                  {availability.color === 'green' && (
                                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                  )}
                                  {availability.color !== 'green' && <Calendar className="w-3 h-3" />}
                                  {availability.label}
                                </span>
                              </div>

                              {/* Rating Badge */}
                              <div className="absolute top-4 right-4">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-white/90 dark:bg-slate-900/90 backdrop-blur-md" style={{color: '#464646'}}>
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                  {coach.averageRating ? parseFloat(String(coach.averageRating)).toFixed(1) : '5.0'}
                                </span>
                              </div>

                              {/* Coach Name on Mobile */}
                              <div className="absolute bottom-4 left-4 right-4 lg:hidden">
                                <h3 className="text-xl font-bold text-white mb-1">{coach.name}</h3>
                                <p className="text-white/80 text-sm line-clamp-1">{language === 'fr' && (coach as any).headlineFr ? (coach as any).headlineFr : coach.headline}</p>
                              </div>
                            </div>
                          </div>

                          {/* Coach Info Section */}
                          <div className="flex-1 p-6 lg:p-8">
                            {/* Name & Headline - Desktop */}
                            <div className="hidden lg:block mb-4">
                              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-teal-600 transition-colors">
                                {coach.name}
                              </h3>
                              <p className="font-medium coach-headline-dark">
                                {language === 'fr' && (coach as any).headlineFr ? (coach as any).headlineFr : coach.headline}
                              </p>
                            </div>

                            {/* Stats Row */}
                            <div className="flex flex-wrap items-center gap-4 mb-5">
                              <div className="flex items-center gap-1.5 text-sm">
                                <Users className="w-4 h-4 text-teal-600" />
                                <span className="font-medium text-slate-900 dark:text-white">{coach.totalSessions || 324}</span>
                                <span className="text-black dark:text-slate-300">{language === 'fr' ? 'sessions' : 'sessions'}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-sm">
                                <Clock className="w-4 h-4 text-teal-600" />
                                <span className="text-black dark:text-slate-300">\n                                  {language === 'fr' ? 'Répond en' : 'Responds in'} {coach.responseTimeHours || 4}h\n                                </span>                             </div>
                              {coach.successRate && coach.successRate > 0 && (
                                <div className="flex items-center gap-1.5 text-sm">
                                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                                  <span className="font-medium text-emerald-600">{coach.successRate}%</span>
                                  <span className="text-black dark:text-slate-300">{language === 'fr' ? 'réussite' : 'success'}</span>
                                </div>
                              )}
                            </div>

                            {/* Specializations */}
                            <div className="flex flex-wrap gap-2 mb-5">
                              <Badge className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-0 px-3 py-1">
                                {getLangLabel(coach.languages || "french")}
                              </Badge>
                              {coach.specializationsArray.slice(0, 4).map((spec) => (
                                <Badge 
                                  key={spec} 
                                  variant="outline" 
                                  className="border-teal-300 dark:border-teal-700 text-black dark:text-white bg-teal-100 dark:bg-teal-800 px-3 py-1 font-medium"
                                >
                                  {getSpecLabel(spec)}
                                </Badge>
                              ))}
                              {coach.specializationsArray.length > 4 && (
                                <Badge variant="outline" className="border-slate-200 dark:border-slate-700 text-slate-500 px-3 py-1">
                                  +{coach.specializationsArray.length - 4}
                                </Badge>
                              )}
                            </div>

                            {/* Verified Badge */}
                            <div className="flex items-center gap-2 mb-5">
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                                <CheckCircle className="w-3.5 h-3.5" />
                                {language === 'fr' ? 'Certifié SLE' : 'SLE Certified'}
                              </div>
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-medium">
                                <Video className="w-3.5 h-3.5" />
                                {language === 'fr' ? 'Sessions vidéo' : 'Video Sessions'}
                              </div>
                            </div>
                          </div>

                          {/* Pricing & Actions Section */}
                          <div className="lg:w-64 p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-teal-50/30 dark:from-slate-800/50 dark:to-teal-900/20 border-t lg:border-t-0 lg:border-l border-slate-200/50 dark:border-slate-700/50 flex flex-col justify-between">
                            <div>
                              {/* Price */}
                              <div className="text-center lg:text-left mb-6">
                                <div className="flex items-baseline justify-center lg:justify-start gap-1">
                                  <span className="text-3xl font-bold text-slate-900 dark:text-white">
                                    ${((coach.hourlyRate || 5500) / 100).toFixed(0)}
                                  </span>
                                  <span className="text-black dark:text-slate-300 text-sm font-medium">\n                                    /{language === 'fr' ? 'heure' : 'hour'}\n                                  </span>                               </div>
                                <p className="text-sm text-black dark:text-slate-300 mt-1">
                                  {language === 'fr' ? 'Session d\'essai' : 'Trial session'}: 
                                  <span className="font-medium text-teal-600 ml-1">
                                    ${((coach.trialRate || 2500) / 100).toFixed(0)}
                                  </span>
                                </p>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                              <Link href={`/coach/${coach.slug}`}>
                                <Button className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-300">
                                  {language === 'fr' ? 'Voir le profil' : 'View Profile'}
                                  <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                              </Link>
                              {(coach as any)?.linkedinUrl && (
                                <a href={(coach as any)?.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                  <Button 
                                    variant="outline" 
                                    className="w-full border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                  >
                                    <Linkedin className="w-4 h-4 mr-2" />
                                    LinkedIn
                                  </Button>
                                </a>
                              )}
                              <Button 
                                variant="outline" 
                                className="w-full border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-900/20 btn-message-teal"
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                {language === 'fr' ? 'Message' : 'Message'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty State */}
              {!isLoading && processedCoaches.length === 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-teal-100 to-emerald-100 dark:from-teal-900/50 dark:to-emerald-900/50 flex items-center justify-center mx-auto mb-6">
                    <Search className="h-10 w-10 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    {language === "fr" ? "Aucun coach trouvé" : "No coaches found"}
                  </h3>
                  <p className="text-slate-900 dark:text-slate-100 mb-6 max-w-md mx-auto">
                    {language === "fr" 
                      ? "Essayez d'ajuster vos filtres pour voir plus de résultats."
                      : "Try adjusting your filters to see more results."}
                  </p>
                  <Button 
                    onClick={clearFilters} 
                    className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
                  >
                    {language === 'fr' ? 'Effacer les filtres' : 'Clear Filters'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
