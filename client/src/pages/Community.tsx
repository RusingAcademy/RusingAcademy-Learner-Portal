import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { 
  Users, 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  Video, 
  Award,
  ChevronRight,
  Globe,
  Mic,
  FileText,
  Download,
  ExternalLink,
  Clock,
  MapPin,
  Star,
  Heart,
  Plus,
  X,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Footer from "@/components/Footer";

// Icon mapping for forum categories
const categoryIcons: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  "💬": MessageSquare,
  "🏆": Award,
  "🎤": Mic,
  "⭐": Star,
};

// Resources data (static for now)
const resources = [
  {
    id: 1,
    type: "guide",
    title: { en: "Complete SLE Exam Guide 2026", fr: "Guide complet des examens ELS 2026" },
    description: { en: "Everything you need to know about SLE reading, writing, and oral exams", fr: "Tout ce que vous devez savoir sur les examens ELS de lecture, d'écriture et oraux" },
    format: "PDF",
    size: "2.4 MB",
    downloads: 1234,
    icon: FileText,
    color: "#17E2C6"
  },
  {
    id: 2,
    type: "video",
    title: { en: "Oral Exam Mock Interview Series", fr: "Série d'entrevues simulées pour l'examen oral" },
    description: { en: "Watch real mock interviews with expert feedback and analysis", fr: "Regardez de vraies entrevues simulées avec des commentaires et analyses d'experts" },
    format: "Video Series",
    duration: "3h 45m",
    views: 5678,
    icon: Video,
    color: "#1E9B8A"
  },
  {
    id: 3,
    type: "template",
    title: { en: "French Email Templates for Government", fr: "Modèles de courriels français pour le gouvernement" },
    description: { en: "Professional email templates for common workplace scenarios", fr: "Modèles de courriels professionnels pour les scénarios de travail courants" },
    format: "DOCX",
    size: "156 KB",
    downloads: 892,
    icon: FileText,
    color: "#D4A853"
  },
  {
    id: 4,
    type: "podcast",
    title: { en: "Bilingual Leadership Podcast", fr: "Balado Leadership bilingue" },
    description: { en: "Weekly episodes featuring successful bilingual leaders in the public service", fr: "Épisodes hebdomadaires mettant en vedette des leaders bilingues à succès dans la fonction publique" },
    format: "Podcast",
    episodes: 45,
    subscribers: 2341,
    icon: Mic,
    color: "#8B5CFF"
  }
];

// Community stats
const communityStats = [
  { value: "5,200+", label: { en: "Active Members", fr: "Membres actifs" } },
  { value: "850+", label: { en: "SLE Success Stories", fr: "Réussites ELS" } },
  { value: "120+", label: { en: "Events Hosted", fr: "Événements organisés" } },
  { value: "15,000+", label: { en: "Resources Downloaded", fr: "Ressources téléchargées" } }
];

export default function Community() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"events" | "forum" | "resources">("events");
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadContent, setNewThreadContent] = useState("");
  const [registrationStatus, setRegistrationStatus] = useState<Record<number, "idle" | "loading" | "success" | "error">>({});

  // Fetch real data from API
  const { data: user } = trpc.auth.me.useQuery();
  const { data: forumCategories, isLoading: categoriesLoading } = trpc.forum.categories.useQuery();
  const { data: events, isLoading: eventsLoading } = trpc.events.list.useQuery();
  
  // Mutations
  const createThreadMutation = trpc.forum.createThread.useMutation();
  const registerEventMutation = trpc.events.register.useMutation();
  const utils = trpc.useUtils();

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "workshop": return "#17E2C6";
      case "networking": return "#D4A853";
      case "practice": return "#1E9B8A";
      case "info_session": return "#8B5CFF";
      case "webinar": return "#FF6B6B";
      default: return "#17E2C6";
    }
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, { en: string; fr: string }> = {
      workshop: { en: "Workshop", fr: "Atelier" },
      networking: { en: "Networking", fr: "Réseautage" },
      practice: { en: "Practice", fr: "Pratique" },
      info_session: { en: "Info Session", fr: "Session d'info" },
      webinar: { en: "Webinar", fr: "Webinaire" },
      other: { en: "Event", fr: "Événement" }
    };
    return labels[type]?.[language] || type;
  };

  const handleCreateThread = async () => {
    if (!selectedCategoryId || !newThreadTitle.trim() || !newThreadContent.trim()) return;
    
    try {
      await createThreadMutation.mutateAsync({
        categoryId: selectedCategoryId,
        title: newThreadTitle,
        content: newThreadContent,
      });
      
      // Reset form and close modal
      setNewThreadTitle("");
      setNewThreadContent("");
      setSelectedCategoryId(null);
      setShowNewThreadModal(false);
      
      // Refresh categories to update counts
      utils.forum.categories.invalidate();
    } catch (error) {
      console.error("Failed to create thread:", error);
    }
  };

  const handleRegisterEvent = async (eventId: number) => {
    if (!user) {
      // Redirect to login or show login modal
      window.location.href = "/login";
      return;
    }
    
    setRegistrationStatus(prev => ({ ...prev, [eventId]: "loading" }));
    
    try {
      await registerEventMutation.mutateAsync({ eventId });
      setRegistrationStatus(prev => ({ ...prev, [eventId]: "success" }));
      
      // Refresh events to update registration counts
      utils.events.list.invalidate();
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setRegistrationStatus(prev => ({ ...prev, [eventId]: "idle" }));
      }, 3000);
    } catch (error: any) {
      setRegistrationStatus(prev => ({ ...prev, [eventId]: "error" }));
      console.error("Failed to register:", error);
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setRegistrationStatus(prev => ({ ...prev, [eventId]: "idle" }));
      }, 3000);
    }
  };

  const formatEventTime = (startAt: Date, endAt: Date) => {
    const start = new Date(startAt as any);
    const end = new Date(endAt as any);
    const timeFormat = new Intl.DateTimeFormat(language === "en" ? "en-CA" : "fr-CA", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${timeFormat.format(start)} - ${timeFormat.format(end)} EST`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#080a14] via-[#0d1020] to-[#080a14] text-white">
      
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#17E2C6]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-[#1E9B8A]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <Users className="w-4 h-4 text-[#17E2C6]" />
              <span className="text-sm font-medium text-white/80">
                {language === "en" ? "Join 5,200+ members" : "Rejoignez 5 200+ membres"}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black mb-6">
              {language === "en" ? (
                <>
                  Your <span className="text-[#17E2C6]">Bilingual</span> Community
                </>
              ) : (
                <>
                  Votre communauté <span className="text-[#17E2C6]">bilingue</span>
                </>
              )}
            </h1>

            <p className="text-lg text-white/70 mb-8 leading-relaxed">
              {language === "en"
                ? "Connect with fellow public servants, share experiences, attend events, and access exclusive resources on your journey to bilingual excellence."
                : "Connectez-vous avec d'autres fonctionnaires, partagez vos expériences, participez à des événements et accédez à des ressources exclusives dans votre parcours vers l'excellence bilingue."}
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#17E2C6] to-[#0d9488] text-white border-0 px-8 py-6 text-base font-bold rounded-xl shadow-lg hover:-translate-y-1 transition-transform"
                style={{ boxShadow: "0 10px 25px -5px rgba(23, 226, 198, 0.5)" }}
              >
                {language === "en" ? "Join the Community" : "Rejoindre la communauté"}
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/5 text-white border-white/20 px-8 py-6 text-base font-bold rounded-xl hover:bg-white/10 transition-all"
              >
                {language === "en" ? "Learn More" : "En savoir plus"}
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mt-10 sm:mt-16"
          >
            {communityStats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="text-3xl md:text-4xl font-black text-[#17E2C6] mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-white/60">
                  {stat.label[language]}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="relative z-10 max-w-[1280px] mx-auto px-6 pb-8">
        <div className="flex justify-center">
          <div className="inline-flex bg-white/5 rounded-2xl p-2 border border-white/10">
            {[
              { id: "events", icon: Calendar, label: { en: "Events", fr: "Événements" } },
              { id: "forum", icon: MessageSquare, label: { en: "Forum", fr: "Forum" } },
              { id: "resources", icon: BookOpen, label: { en: "Resources", fr: "Ressources" } }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                aria-pressed={activeTab === tab.id}
                className={`flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  activeTab === tab.id
                    ? "bg-[#17E2C6] text-black"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <tab.icon className="w-4 h-4" aria-hidden="true" />
                {tab.label[language]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      {activeTab === "events" && (
        <section className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 pb-12 sm:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-black">
                {language === "en" ? "Upcoming Events" : "Événements à venir"}
              </h2>
              <Button variant="ghost" className="text-[#17E2C6] hover:text-[#17E2C6]/80">
                {language === "en" ? "View All Events" : "Voir tous les événements"}
                <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </div>

            {eventsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#17E2C6]" />
              </div>
            ) : events && events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {events.map((event) => {
                  const spotsLeft = (event.maxCapacity || 0) - (event.currentRegistrations || 0);
                  const status = registrationStatus[event.id] || "idle";
                  
                  return (
                    <motion.div
                      key={event.id}
                      whileHover={{ y: -5 }}
                      className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#17E2C6]/30 transition-all"
                    >
                      {/* Event type badge */}
                      <div 
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4"
                        style={{ backgroundColor: `${getEventTypeColor(event.eventType || "other")}20`, color: getEventTypeColor(event.eventType || "other") }}
                      >
                        {getEventTypeLabel(event.eventType || "other")}
                      </div>

                      <h3 className="text-xl font-bold mb-2 group-hover:text-[#17E2C6] transition-colors">
                        {language === "en" ? event.title : event.titleFr}
                      </h3>

                      <p className="text-white/60 text-sm mb-4 line-clamp-2">
                        {language === "en" ? event.description : event.descriptionFr}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-white/80 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {new Date(event.startAt).toLocaleDateString(language === "en" ? "en-CA" : "fr-CA", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {/* @ts-ignore - TS2345: auto-suppressed during TS cleanup */}
                          {formatEventTime(event.startAt, event.endAt)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          {event.locationDetails || (event.locationType === "virtual" ? (language === "en" ? "Virtual" : "Virtuel") : event.locationType)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-[#17E2C6] font-bold">{spotsLeft > 0 ? spotsLeft : 0}</span>
                          <span className="text-white/80"> / {event.maxCapacity || "∞"} {language === "en" ? "spots left" : "places restantes"}</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleRegisterEvent(event.id)}
                          disabled={status === "loading" || status === "success" || spotsLeft <= 0}
                          className={`font-bold transition-all ${
                            status === "success" 
                              ? "bg-green-500 text-white hover:bg-green-500" 
                              : status === "error"
                              ? "bg-red-500 text-white hover:bg-red-500"
                              : "bg-[#17E2C6] text-black hover:bg-[#17E2C6]/90"
                          }`}
                        >
                          {status === "loading" ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : status === "success" ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              {language === "en" ? "Registered!" : "Inscrit!"}
                            </>
                          ) : status === "error" ? (
                            <>
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {language === "en" ? "Error" : "Erreur"}
                            </>
                          ) : spotsLeft <= 0 ? (
                            language === "en" ? "Full" : "Complet"
                          ) : (
                            language === "en" ? "Register" : "S'inscrire"
                          )}
                        </Button>
                      </div>

                      {/* Progress bar for spots */}
                      {event.maxCapacity && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 rounded-b-2xl overflow-hidden">
                          <div 
                            className="h-full bg-[#17E2C6]/50 transition-all"
                            style={{ width: `${((event.currentRegistrations || 0) / event.maxCapacity) * 100}%` }}
                          />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 text-white/80">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{language === "en" ? "No upcoming events at the moment." : "Aucun événement à venir pour le moment."}</p>
              </div>
            )}
          </motion.div>
        </section>
      )}

      {/* Forum Section */}
      {activeTab === "forum" && (
        <section className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 pb-12 sm:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-black">
                {language === "en" ? "Community Forum" : "Forum communautaire"}
              </h2>
              <Button 
                onClick={() => {
                  if (!user) {
                    window.location.href = "/login";
                    return;
                  }
                  setShowNewThreadModal(true);
                }}
                className="bg-[#17E2C6] text-black hover:bg-[#17E2C6]/90 font-bold"
              >
                <Plus className="w-4 h-4 mr-2" />
                {language === "en" ? "New Discussion" : "Nouvelle discussion"}
              </Button>
            </div>

            {categoriesLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#17E2C6]" />
              </div>
            ) : forumCategories && forumCategories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {forumCategories.map((category) => {
                  const IconComponent = categoryIcons[category.icon || "💬"] || MessageSquare;
                  const categoryColor = category.color || "#17E2C6";
                  
                  return (
                    <motion.div
                      key={category.id}
                      whileHover={{ y: -5 }}
                      className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div 
                          className="p-3 rounded-xl"
                          style={{ backgroundColor: `${categoryColor}20` }}
                        >
                          <IconComponent className="w-6 h-6" style={{ color: categoryColor }} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold mb-1 group-hover:text-[#17E2C6] transition-colors">
                            {language === "en" ? category.name : category.nameFr}
                          </h3>
                          <p className="text-white/60 text-sm mb-3">
                            {language === "en" ? category.description : category.descriptionFr}
                          </p>
                          <div className="flex gap-4 text-xs text-white/75">
                            <span>{category.threadCount || 0} {language === "en" ? "threads" : "fils"}</span>
                            <span>{category.postCount || 0} {language === "en" ? "posts" : "messages"}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/75 group-hover:text-[#17E2C6] transition-colors" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 text-white/80">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{language === "en" ? "No forum categories available." : "Aucune catégorie de forum disponible."}</p>
              </div>
            )}

            {/* Quick tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-[#17E2C6]/10 to-[#1E9B8A]/10 border border-[#17E2C6]/20"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#17E2C6]" />
                {language === "en" ? "Community Guidelines" : "Lignes directrices de la communauté"}
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-[#17E2C6]">•</span>
                  {language === "en" ? "Be respectful and supportive of fellow learners" : "Soyez respectueux et soutenez les autres apprenants"}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#17E2C6]">•</span>
                  {language === "en" ? "Share your experiences and tips freely" : "Partagez librement vos expériences et conseils"}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#17E2C6]">•</span>
                  {language === "en" ? "Practice both official languages when possible" : "Pratiquez les deux langues officielles quand possible"}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#17E2C6]">•</span>
                  {language === "en" ? "Keep discussions professional and on-topic" : "Gardez les discussions professionnelles et pertinentes"}
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </section>
      )}

      {/* Resources Section */}
      {activeTab === "resources" && (
        <section className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 pb-12 sm:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-black">
                {language === "en" ? "Learning Resources" : "Ressources d'apprentissage"}
              </h2>
              <Button variant="ghost" className="text-[#17E2C6] hover:text-[#17E2C6]/80">
                {language === "en" ? "Browse All" : "Parcourir tout"}
                <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {resources.map((resource) => (
                <motion.div
                  key={resource.id}
                  whileHover={{ y: -5 }}
                  className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: `${resource.color}20` }}
                    >
                      <resource.icon className="w-6 h-6" style={{ color: resource.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span 
                          className="text-xs font-bold px-2 py-0.5 rounded"
                          style={{ backgroundColor: `${resource.color}20`, color: resource.color }}
                        >
                          {resource.format}
                        </span>
                        {resource.size && <span className="text-xs text-white/75">{resource.size}</span>}
                        {resource.duration && <span className="text-xs text-white/75">{resource.duration}</span>}
                        {resource.episodes && <span className="text-xs text-white/75">{resource.episodes} {language === "en" ? "episodes" : "épisodes"}</span>}
                      </div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-[#17E2C6] transition-colors">
                        {resource.title[language]}
                      </h3>
                      <p className="text-white/60 text-sm mb-4">
                        {resource.description[language]}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-white/75">
                          {resource.downloads && `${resource.downloads.toLocaleString()} ${language === "en" ? "downloads" : "téléchargements"}`}
                          {resource.views && `${resource.views.toLocaleString()} ${language === "en" ? "views" : "vues"}`}
                          {resource.subscribers && `${resource.subscribers.toLocaleString()} ${language === "en" ? "subscribers" : "abonnés"}`}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-[#17E2C6] hover:text-[#17E2C6]/80 hover:bg-[#17E2C6]/10"
                        >
                          {resource.type === "guide" || resource.type === "template" ? (
                            <>
                              <Download className="w-4 h-4 mr-1" />
                              {language === "en" ? "Download" : "Télécharger"}
                            </>
                          ) : (
                            <>
                              <ExternalLink className="w-4 h-4 mr-1" />
                              {language === "en" ? "Access" : "Accéder"}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Featured resource banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-[#17E2C6]/20 to-[#1E9B8A]/20 border border-[#17E2C6]/30"
            >
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17E2C6]/20 text-[#17E2C6] text-xs font-bold mb-3">
                    <Star className="w-3 h-3" />
                    {language === "en" ? "Featured Resource" : "Ressource vedette"}
                  </div>
                  <h3 className="text-2xl font-black mb-2">
                    {language === "en" ? "SLE Success Toolkit" : "Trousse de réussite ELS"}
                  </h3>
                  <p className="text-white/70 mb-4">
                    {language === "en"
                      ? "Our comprehensive toolkit includes study guides, practice tests, vocabulary lists, and exam strategies - everything you need to succeed."
                      : "Notre trousse complète comprend des guides d'étude, des tests pratiques, des listes de vocabulaire et des stratégies d'examen - tout ce dont vous avez besoin pour réussir."}
                  </p>
                  <Button className="bg-[#17E2C6] text-black hover:bg-[#17E2C6]/90 font-bold">
                    {language === "en" ? "Get Free Access" : "Obtenir un accès gratuit"}
                    <ChevronRight className="ml-1 w-4 h-4" />
                  </Button>
                </div>
                <div className="w-32 h-32 rounded-2xl bg-[#17E2C6]/20 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-[#17E2C6]" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 pb-12 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center p-12 rounded-3xl bg-gradient-to-r from-white/5 to-white/10 border border-white/10"
        >
          <Heart className="w-12 h-12 text-[#17E2C6] mx-auto mb-4" />
          <h2 className="text-3xl font-black mb-4">
            {language === "en" ? "Ready to Join Our Community?" : "Prêt à rejoindre notre communauté?"}
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-8">
            {language === "en"
              ? "Connect with thousands of public servants on their bilingual journey. Get support, share experiences, and accelerate your language learning."
              : "Connectez-vous avec des milliers de fonctionnaires dans leur parcours bilingue. Obtenez du soutien, partagez vos expériences et accélérez votre apprentissage des langues."}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#17E2C6] to-[#0d9488] text-white border-0 px-8 py-6 text-base font-bold rounded-xl shadow-lg hover:-translate-y-1 transition-transform"
              style={{ boxShadow: "0 10px 25px -5px rgba(23, 226, 198, 0.5)" }}
            >
              {language === "en" ? "Create Free Account" : "Créer un compte gratuit"}
            </Button>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/5 text-white border-white/20 px-8 py-6 text-base font-bold rounded-xl hover:bg-white/10 transition-all"
              >
                {language === "en" ? "Contact Us" : "Nous contacter"}
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* New Thread Modal */}
      <AnimatePresence>
        {showNewThreadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowNewThreadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-[#0d1020] rounded-2xl border border-white/10 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">
                  {language === "en" ? "Start a New Discussion" : "Démarrer une nouvelle discussion"}
                </h3>
                <button
                  onClick={() => setShowNewThreadModal(false)}
                  aria-label="Close dialog"
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    {language === "en" ? "Category" : "Catégorie"}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {forumCategories?.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategoryId(category.id)}
                        aria-pressed={selectedCategoryId === category.id}
                        className={`p-3 rounded-xl text-left text-sm transition-all ${
                          selectedCategoryId === category.id
                            ? "bg-[#17E2C6]/20 border-[#17E2C6] border"
                            : "bg-white/5 border border-white/10 hover:border-white/20"
                        }`}
                      >
                        <span className="font-medium">
                          {language === "en" ? category.name : category.nameFr}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    {language === "en" ? "Title" : "Titre"}
                  </label>
                  <input
                    type="text"
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    placeholder={language === "en" ? "What's your question or topic?" : "Quelle est votre question ou sujet?"}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#17E2C6] focus:outline-none text-white placeholder-white/40"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    {language === "en" ? "Content" : "Contenu"}
                  </label>
                  <textarea
                    value={newThreadContent}
                    onChange={(e) => setNewThreadContent(e.target.value)}
                    placeholder={language === "en" ? "Share more details..." : "Partagez plus de détails..."}
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#17E2C6] focus:outline-none text-white placeholder-white/40 resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowNewThreadModal(false)}
                    className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
                  >
                    {language === "en" ? "Cancel" : "Annuler"}
                  </Button>
                  <Button
                    onClick={handleCreateThread}
                    disabled={!selectedCategoryId || !newThreadTitle.trim() || !newThreadContent.trim() || createThreadMutation.isPending}
                    className="flex-1 bg-[#17E2C6] text-black hover:bg-[#17E2C6]/90 font-bold disabled:opacity-50"
                  >
                    {createThreadMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      language === "en" ? "Post Discussion" : "Publier la discussion"
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
