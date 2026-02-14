import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Breadcrumb } from "@/components/Breadcrumb";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Star,
  Clock,
  Users,
  Award,
  MessageSquare,
  Calendar as CalendarIcon,
  Play,
  CheckCircle2,
  Globe,
  ArrowLeft,
  Share2,
  Loader2,
  CreditCard,
  ExternalLink,
  Shield,
  TrendingUp,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { LearnerOnboardingModal } from "@/components/LearnerOnboardingModal";
import { ReviewModal } from "@/components/ReviewModal";
import CoachPhotoGallery from "@/components/CoachPhotoGallery";
import { CoachBadges } from "@/components/CoachBadges";
import { FavoriteButton } from "@/components/FavoriteButton";

const specializationLabels: Record<string, string> = {
  oral_a: "Oral A",
  oral_b: "Oral B",
  oral_c: "Oral C",
  oralA: "Oral A",
  oralB: "Oral B",
  oralC: "Oral C",
  written_a: "Written A",
  written_b: "Written B",
  written_c: "Written C",
  writtenA: "Written A",
  writtenB: "Written B",
  writtenC: "Written C",
  reading: "Reading",
  readingComprehension: "Reading Comprehension",
  anxiety_coaching: "Anxiety Coaching",
  examPrep: "Exam Preparation",
  businessFrench: "Business French",
  businessEnglish: "Business English",
};

const defaultTimeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM", "6:00 PM"];

export default function CoachProfile() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const isEn = language === "en";
  
  // Booking state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<"trial" | "single">("trial");
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState<{ type: string; value: number; couponId: number } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Check if user has learner profile
  const { data: learnerProfile, refetch: refetchLearnerProfile } = trpc.learner.myProfile.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Fetch coach data from database
  const { data: coach, isLoading, error } = trpc.coach.bySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  // Fetch coach reviews
  const { data: reviews, refetch: refetchReviews } = trpc.coach.reviews.useQuery(
    { coachId: coach?.id || 0, limit: 10 },
    { enabled: !!coach?.id }
  );

  // Check if user can review this coach
  const { data: canReviewData } = trpc.coach.canReview.useQuery(
    { coachId: coach?.id || 0 },
    { enabled: !!coach?.id && isAuthenticated }
  );

  // Get user's existing review for this coach
  const { data: myReview } = trpc.coach.myReview.useQuery(
    { coachId: coach?.id || 0 },
    { enabled: !!coach?.id && isAuthenticated }
  );

  // Fetch available time slots for selected date
  const { data: availableSlots, isLoading: slotsLoading } = trpc.coach.availableSlots.useQuery(
    { coachId: coach?.id || 0, date: selectedDate?.toISOString() || "" },
    { enabled: !!coach?.id && !!selectedDate }
  );

  // Use fetched slots or default if none configured
  const availableTimeSlots = availableSlots && availableSlots.length > 0 ? availableSlots : defaultTimeSlots;

  // Stripe checkout mutation
  const checkoutMutation = trpc.stripe.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create checkout session");
      setIsBooking(false);
    },
  });

  // Coupon validation mutation
  const validateCouponMutation = trpc.stripe.validateCoupon.useMutation();

  const handleBookSession = async () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast.error("Please select a date and time");
      return;
    }

    if (!coach) {
      toast.error("Coach information not available");
      return;
    }

    // Check if user has learner profile - if not, show onboarding
    if (!learnerProfile) {
      setPendingBooking(true);
      setShowOnboarding(true);
      return;
    }

    setIsBooking(true);
    
    try {
      await checkoutMutation.mutateAsync({
        coachId: coach.userId, // Use userId for the checkout
        sessionType,
        sessionDate: selectedDate?.toISOString(),
        sessionTime: selectedTime || undefined,
        couponId: couponDiscount?.couponId,
      });
    } catch (error) {
      // Error handled in onError callback
    }
  };

  // Handle successful onboarding - proceed with booking
  const handleOnboardingSuccess = async () => {
    await refetchLearnerProfile();
    if (pendingBooking) {
      setPendingBooking(false);
      // Small delay to ensure profile is available
      setTimeout(() => {
        setIsBooking(true);
        checkoutMutation.mutate({
          coachId: coach?.userId || 0,
          sessionType,
          sessionDate: selectedDate?.toISOString(),
          sessionTime: selectedTime || undefined,
          couponId: couponDiscount?.couponId,
        });
      }, 500);
    }
  };

  const resetBookingDialog = () => {
    setSelectedDate(undefined);
    setSelectedTime(null);
    setSessionType("trial");
    setIsBooking(false);
    setCouponCode("");
    setCouponDiscount(null);
    setCouponError(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-teal-600 mx-auto mb-4" />
            <p className="text-slate-900 dark:text-slate-100">{isEn ? "Loading coach profile..." : "Chargement du profil..."}</p>
          </div>
      </main>
      <Footer />
      </div>
    );
  }

  // Error state
  if (error || !coach) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4 text-center border-0 shadow-xl">
            <CardContent className="pt-8 pb-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{isEn ? "Coach Not Found" : "Coach introuvable"}</h2>
              <p className="text-slate-900 dark:text-slate-100 mb-6">
                {isEn 
                  ? "The coach profile you're looking for doesn't exist or has been removed."
                  : "Le profil du coach que vous recherchez n'existe pas ou a été supprimé."}
              </p>
              <Link href="/coaches">
                <Button className="bg-teal-600 hover:bg-teal-700">
                  {isEn ? "Browse All Coaches" : "Voir tous les coachs"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Parse specializations from JSON if needed
  const specializations = typeof coach.specializations === 'object' && coach.specializations !== null
    ? Object.entries(coach.specializations as Record<string, boolean>)
        .filter(([_, value]) => value)
        .map(([key]) => key)
    : [];

  const languageLabel = coach.languages === "french" ? "French" : 
                        coach.languages === "english" ? "English" : "French & English";

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
      <main className="flex-1">
        {/* Premium Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-teal-900 to-slate-800 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          {/* Gradient Orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
          
          <div className="container relative z-10 py-12">
            {/* Breadcrumb */}
            <div className="mb-6">
              <Link href="/coaches" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4" />
                {isEn ? "Back to coaches" : "Retour aux coachs"}
              </Link>
            </div>
            
            {/* Profile Header Card with Glassmorphism */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Avatar Section */}
                <div className="shrink-0 flex flex-col items-center lg:items-start">
                  <div className="relative">
                    <Avatar className="h-40 w-40 ring-4 ring-white/30 shadow-2xl">
                      <AvatarImage src={coach.photoUrl || coach.avatarUrl || undefined} className="object-cover" />
                      <AvatarFallback className="text-4xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white">
                        {(coach.name || "C").split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online Indicator */}
                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white shadow-lg" />
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex gap-2 mt-4">
                    {coach.id && (
                      <FavoriteButton
                        coachId={coach.id}
                        initialFavorited={isFavorite}
                        onToggle={(favorited) => setIsFavorite(favorited)}
                        className="bg-white/10 hover:bg-white/20 border-white/20"
                      />
                    )}
                    <Button variant="outline" size="icon" className="bg-white/10 hover:bg-white/20 border-white/20 text-white">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">{coach.name}</h1>
                      <p className="text-lg text-white/95 font-medium drop-shadow-md">{!isEn && coach.headlineFr ? coach.headlineFr : coach.headline}</p>
                    </div>
                  </div>

                  {/* Stats Row - Glassmorphism Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="backdrop-blur-md bg-white/10 rounded-xl p-4 text-center border border-white/10">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                        <span className="text-2xl font-bold text-white">{coach.averageRating || "New"}</span>
                      </div>
                      <p className="text-sm text-white/90">
                        {reviews && reviews.length > 0 ? `${reviews.length} reviews` : "Rating"}
                      </p>
                    </div>
                    <div className="backdrop-blur-md bg-white/10 rounded-xl p-4 text-center border border-white/10">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users className="h-5 w-5 text-cyan-400" />
                        <span className="text-2xl font-bold text-white">{coach.totalStudents || 0}</span>
                      </div>
                      <p className="text-sm text-white/90">{isEn ? "Students" : "Étudiants"}</p>
                    </div>
                    <div className="backdrop-blur-md bg-white/10 rounded-xl p-4 text-center border border-white/10">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <CalendarIcon className="h-5 w-5 text-teal-400" />
                        <span className="text-2xl font-bold text-white">{coach.totalSessions || 0}</span>
                      </div>
                      <p className="text-sm text-white/90">{isEn ? "Sessions" : "Séances"}</p>
                    </div>
                    {coach.successRate && coach.successRate > 0 ? (
                      <div className="backdrop-blur-md bg-emerald-500/20 rounded-xl p-4 text-center border border-emerald-400/30">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingUp className="h-5 w-5 text-emerald-400" />
                          <span className="text-2xl font-bold text-white">{coach.successRate}%</span>
                        </div>
                        <p className="text-sm text-emerald-200 font-medium">{isEn ? "Success Rate" : "Taux de réussite"}</p>
                      </div>
                    ) : (
                      <div className="backdrop-blur-md bg-white/10 rounded-xl p-4 text-center border border-white/10">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Clock className="h-5 w-5 text-[#0F3D3E]" />
                          <span className="text-2xl font-bold text-white">{coach.responseTimeHours || 24}h</span>
                        </div>
                        <p className="text-sm text-white/90">{isEn ? "Response" : "Réponse"}</p>
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="mb-4">
                    <CoachBadges
                      isElsVerified={(coach as any).isElsVerified || false}
                      totalSessions={Number(coach.totalSessions) || 0}
                      averageRating={Number(coach.averageRating) || 0}
                      className="justify-center lg:justify-start"
                    />
                  </div>

                  {/* Specializations */}
                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                    <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                      <Globe className="h-3 w-3 mr-1" />
                      {languageLabel}
                    </Badge>
                    {specializations.map((spec) => (
                      <Badge key={spec} className="bg-teal-500/30 text-teal-100 border-teal-400/30 hover:bg-teal-500/40">
                        {specializationLabels[spec] || spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Video Introduction */}
              {coach.videoUrl && (
                <Card className="border-0 shadow-lg overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30">
                    <CardTitle className="flex items-center gap-2 text-teal-800 dark:text-teal-200">
                      <Play className="h-5 w-5" />
                      {isEn ? "Video Introduction" : "Vidéo de présentation"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {(() => {
                      const url = coach.videoUrl || "";
                      // Parse YouTube URLs (both youtube.com/watch and youtu.be short links)
                      const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
                      if (ytMatch) {
                        return (
                          <div className="aspect-video">
                            <iframe
                              className="w-full h-full rounded-b-lg"
                              src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                              title="Coach Introduction Video"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              loading="lazy"
                            />
                          </div>
                        );
                      }
                      // Native video files (mp4, webm, etc.)
                      if (url.match(/\.(mp4|webm|ogg)($|\?)/i)) {
                        return (
                          <div className="aspect-video">
                            <video
                              className="w-full h-full rounded-b-lg object-cover"
                              controls
                              preload="metadata"
                              playsInline
                            >
                              <source src={url} />
                              {isEn ? "Your browser does not support video playback." : "Votre navigateur ne supporte pas la lecture vidéo."}
                            </video>
                          </div>
                        );
                      }
                      // Fallback: external link
                      return (
                        <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center rounded-b-lg">
                          <a href={url} target="_blank" rel="noopener noreferrer">
                            <Button size="lg" className="gap-2 bg-teal-600 hover:bg-teal-700">
                              <Play className="h-5 w-5" />
                              {isEn ? "Watch Introduction" : "Voir la présentation"}
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Tabs - Custom Implementation */}
              <div className="w-full">
                <div className="bg-white dark:bg-slate-800 inline-flex h-12 items-center justify-start rounded-xl p-1 shadow-lg border border-slate-200 dark:border-slate-700 mb-6">
                  <button
                    onClick={() => setActiveTab("about")}
                    aria-pressed={activeTab === "about"}
                    className={`inline-flex h-10 items-center justify-center rounded-lg px-6 text-sm font-medium transition-all ${
                      activeTab === "about"
                        ? "bg-teal-600 text-white shadow-md"
                        : "text-slate-600 dark:text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/30"
                    }`}
                  >
                    {isEn ? "About" : "À propos"}
                  </button>
                  <button
                    onClick={() => setActiveTab("reviews")}
                    aria-pressed={activeTab === "reviews"}
                    className={`inline-flex h-10 items-center justify-center rounded-lg px-6 text-sm font-medium transition-all ${
                      activeTab === "reviews"
                        ? "bg-teal-600 text-white shadow-md"
                        : "text-slate-600 dark:text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/30"
                    }`}
                  >
                    {isEn ? "Reviews" : "Avis"} {reviews && reviews.length > 0 ? `(${reviews.length})` : ""}
                  </button>
                  <button
                    onClick={() => setActiveTab("gallery")}
                    aria-pressed={activeTab === "gallery"}
                    className={`inline-flex h-10 items-center justify-center rounded-lg px-6 text-sm font-medium transition-all ${
                      activeTab === "gallery"
                        ? "bg-teal-600 text-white shadow-md"
                        : "text-slate-600 dark:text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/30"
                    }`}
                  >
                    {isEn ? "Gallery" : "Galerie"}
                  </button>
                </div>

                {activeTab === "about" && (
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-teal-600" />
                        {isEn ? "About Me" : "À propos de moi"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-slate dark:prose-invert max-w-none">
                        {((!isEn && coach.bioFr) ? coach.bioFr : coach.bio)?.split("\n\n").map((paragraph, i) => (
                          <p key={i} className="text-slate-900 dark:text-slate-100 mb-4 leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>

                      <div className="border-t pt-6 mt-6">
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <Award className="h-5 w-5 text-teal-600" />
                          {isEn ? "Credentials & Experience" : "Qualifications et expérience"}
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30">
                            <CheckCircle2 className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-slate-900 dark:text-slate-100">{isEn ? "Experience" : "Expérience"}</p>
                              <p className="text-sm text-slate-900 dark:text-slate-100">
                                {coach.yearsExperience} {isEn ? "years teaching SLE preparation" : "ans d'enseignement SLE"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30">
                            <CheckCircle2 className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-slate-900 dark:text-slate-100">{isEn ? "Credentials" : "Diplômes"}</p>
                              <p className="text-sm text-slate-900 dark:text-slate-100">
                                {coach.credentials}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30">
                            <Clock className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-slate-900 dark:text-slate-100">{isEn ? "Response Time" : "Temps de réponse"}</p>
                              <p className="text-sm text-slate-900 dark:text-slate-100">
                                {isEn ? `Usually responds within ${coach.responseTimeHours || 24} hours` : `Répond généralement en ${coach.responseTimeHours || 24} heures`}
                              </p>
                            </div>
                          </div>
                          {coach.successRate && coach.successRate > 0 && (
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
                              <TrendingUp className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium text-slate-900 dark:text-slate-100">{isEn ? "Success Rate" : "Taux de réussite"}</p>
                                <p className="text-sm text-slate-900 dark:text-slate-100">
                                  {coach.successRate}% {isEn ? "of students achieved their SLE goal" : "des étudiants ont atteint leur objectif SLE"}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === "reviews" && (
                <div className="space-y-4">
                  {/* Write Review Button */}
                  {isAuthenticated && (canReviewData?.canReview || myReview) && (
                    <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border-teal-200 dark:border-teal-800 shadow-lg">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-teal-800 dark:text-teal-200">
                              {myReview ? (isEn ? "You've reviewed this coach" : "Vous avez évalué ce coach") : (isEn ? "Share your experience" : "Partagez votre expérience")}
                            </p>
                            <p className="text-sm text-teal-600 dark:text-teal-400">
                              {myReview 
                                ? (isEn ? "Update your review anytime" : "Modifiez votre avis à tout moment")
                                : (isEn ? "Help other learners by leaving a review" : "Aidez les autres apprenants en laissant un avis")}
                            </p>
                          </div>
                          <Button 
                            onClick={() => setShowReviewModal(true)}
                            className="bg-teal-600 hover:bg-teal-700"
                          >
                            <Star className="h-4 w-4 mr-2" />
                            {myReview ? (isEn ? "Edit Review" : "Modifier l'avis") : (isEn ? "Write Review" : "Écrire un avis")}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {reviews && reviews.length > 0 ? (
                    reviews.map((review: any) => (
                      <Card key={review.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-12 w-12 ring-2 ring-teal-100">
                                <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white">
                                  {review.learnerName?.charAt(0) || "L"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{review.learnerName || "Anonymous"}</p>
                                <p className="text-sm text-slate-900 dark:text-slate-100">
                                  {new Date(review.createdAt).toLocaleDateString(isEn ? "en-CA" : "fr-CA", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-3 py-1 rounded-full">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-slate-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">{review.comment}</p>
                          {review.sleAchievement && (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300">
                              <Award className="h-3 w-3 mr-1" />
                              {isEn ? "Achieved" : "Obtenu"}: {review.sleAchievement}
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="border-0 shadow-lg">
                      <CardContent className="pt-8 pb-8 text-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                          <MessageSquare className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-slate-900 dark:text-slate-100">
                          {isEn ? "No reviews yet. Be the first to leave a review!" : "Aucun avis pour le moment. Soyez le premier à laisser un avis!"}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
                )}

                {activeTab === "gallery" && (
                  <CoachPhotoGallery coachId={coach.id} isEditable={false} />
                )}
              </div>
            </div>

            {/* Sidebar - Booking */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6" id="booking-sidebar">
                {/* Premium Pricing Card */}
                <Card className="border-0 shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      {isEn ? "Book a Session" : "Réserver une séance"}
                    </h3>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-3">
                      <div 
                        className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          sessionType === "trial" 
                            ? "bg-teal-50 border-teal-500 dark:bg-teal-950/30" 
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-teal-300"
                        }`}
                        onClick={() => setSessionType("trial")}
                      >
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{isEn ? "Trial Session" : "Séance d'essai"}</p>
                          <p className="text-sm text-slate-900 dark:text-slate-100">{isEn ? "30 minutes" : "30 minutes"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-teal-600">
                            ${((coach.trialRate || 2500) / 100).toFixed(0)}
                          </p>
                          <p className="text-xs text-slate-900 dark:text-slate-100">CAD</p>
                        </div>
                      </div>
                      <div 
                        className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          sessionType === "single" 
                            ? "bg-teal-50 border-teal-500 dark:bg-teal-950/30" 
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-teal-300"
                        }`}
                        onClick={() => setSessionType("single")}
                      >
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{isEn ? "Regular Session" : "Séance régulière"}</p>
                          <p className="text-sm text-slate-900 dark:text-slate-100">{isEn ? "60 minutes" : "60 minutes"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-teal-600">
                            ${((coach.hourlyRate || 5500) / 100).toFixed(0)}
                          </p>
                          <p className="text-xs text-slate-900 dark:text-slate-100">CAD</p>
                        </div>
                      </div>
                    </div>

                    {/* Calendly or Internal Booking */}
                    {coach.calendarType === "calendly" && coach.calendlyUrl ? (
                      <Button 
                        className="w-full bg-teal-600 hover:bg-teal-700" 
                        size="lg"
                        onClick={() => window.open(coach.calendlyUrl || '', '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {isEn ? "Book via Calendly" : "Réserver via Calendly"}
                      </Button>
                    ) : (
                    <Dialog 
                      open={bookingDialogOpen} 
                      onOpenChange={(open) => {
                        setBookingDialogOpen(open);
                        if (!open) resetBookingDialog();
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button className="w-full bg-teal-600 hover:bg-teal-700" size="lg">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {isEn ? `Book ${sessionType === "trial" ? "Trial" : "Regular"} Session` : `Réserver ${sessionType === "trial" ? "essai" : "séance"}`}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <div className="max-h-[70vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{isEn ? "Select Date & Time" : "Choisir date et heure"}</DialogTitle>
                          <DialogDescription>
                            {isEn 
                              ? `Choose a date and time for your ${sessionType === "trial" ? "trial" : "regular"} session with ${coach.name}`
                              : `Choisissez une date et une heure pour votre ${sessionType === "trial" ? "essai" : "séance"} avec ${coach.name}`}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="flex justify-center py-4">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                              setSelectedDate(date);
                              setSelectedTime(null);
                            }}
                            disabled={(date) => date < new Date() || date.getDay() === 0}
                            className="rounded-md border"
                          />
                        </div>
                        
                        {selectedDate && (
                          <div className="space-y-3">
                            <p className="text-sm font-medium">{isEn ? "Available times:" : "Heures disponibles:"}</p>
                            <div className="grid grid-cols-3 gap-2">
                              {availableTimeSlots.map((time) => (
                                <Button
                                  key={time}
                                  variant={selectedTime === time ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setSelectedTime(time)}
                                  className={selectedTime === time ? "bg-teal-600 hover:bg-teal-700 ring-2 ring-teal-600 ring-offset-2" : ""}
                                >
                                  {time}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedDate && selectedTime && (
                          <div className="mt-4 space-y-4">
                            {/* Coupon Code Input */}
                            <div className="p-4 border rounded-lg bg-background">
                              <label className="text-sm font-medium mb-2 block">
                                {isEn ? "Have a promo code?" : "Avez-vous un code promo?"}
                              </label>
                              <div className="flex gap-2">
                                <Input
                                  placeholder={isEn ? "Enter code" : "Entrez le code"}
                                  value={couponCode}
                                  onChange={(e) => {
                                    setCouponCode(e.target.value.toUpperCase());
                                    setCouponError(null);
                                  }}
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  disabled={!couponCode || isValidatingCoupon}
                                  onClick={async () => {
                                    setIsValidatingCoupon(true);
                                    setCouponError(null);
                                    try {
                                      const result = await validateCouponMutation.mutateAsync({ code: couponCode });
                                      setCouponDiscount({
                                        type: result.discountType,
                                        value: result.discountValue,
                                        couponId: result.couponId,
                                      });
                                      toast.success(isEn ? "Coupon applied!" : "Coupon appliqué!");
                                    } catch (err: any) {
                                      setCouponError(err.message || "Invalid coupon");
                                      setCouponDiscount(null);
                                    } finally {
                                      setIsValidatingCoupon(false);
                                    }
                                  }}
                                >
                                  {isValidatingCoupon ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    isEn ? "Apply" : "Appliquer"
                                  )}
                                </Button>
                              </div>
                              {couponError && (
                                <p className="text-sm text-destructive mt-1">{couponError}</p>
                              )}
                              {couponDiscount && (
                                <p className="text-sm text-emerald-600 mt-1 flex items-center gap-1">
                                  <CheckCircle2 className="h-4 w-4" />
                                  {couponDiscount.type === "percentage" 
                                    ? `${couponDiscount.value}% ${isEn ? "discount applied" : "de réduction appliqué"}`
                                    : couponDiscount.type === "fixed_amount"
                                    ? `$${(couponDiscount.value / 100).toFixed(2)} ${isEn ? "discount applied" : "de réduction appliqué"}`
                                    : isEn ? "Free trial applied!" : "Essai gratuit appliqué!"}
                                </p>
                              )}
                            </div>
                            
                            {/* Booking Summary */}
                            <div className="p-4 bg-teal-50 dark:bg-teal-950/30 rounded-lg border border-teal-200 dark:border-teal-800">
                              <h4 className="font-medium mb-2">{isEn ? "Booking Summary" : "Résumé de la réservation"}</h4>
                              <div className="text-sm space-y-1 text-slate-900 dark:text-slate-100">
                                <p><strong>{isEn ? "Coach" : "Coach"}:</strong> {coach.name}</p>
                                <p><strong>{isEn ? "Date" : "Date"}:</strong> {selectedDate.toLocaleDateString(isEn ? "en-CA" : "fr-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                                <p><strong>{isEn ? "Time" : "Heure"}:</strong> {selectedTime}</p>
                                <p><strong>{isEn ? "Session" : "Séance"}:</strong> {sessionType === "trial" ? (isEn ? "Trial (30 min)" : "Essai (30 min)") : (isEn ? "Regular (60 min)" : "Régulière (60 min)")}</p>
                                
                                {(() => {
                                  const basePrice = sessionType === "trial" ? (coach.trialRate || 2500) : (coach.hourlyRate || 5500);
                                  let finalPrice = basePrice;
                                  let discountAmount = 0;
                                  
                                  if (couponDiscount) {
                                    if (couponDiscount.type === "percentage") {
                                      discountAmount = Math.round(basePrice * couponDiscount.value / 100);
                                    } else if (couponDiscount.type === "fixed_amount") {
                                      discountAmount = couponDiscount.value;
                                    } else if (couponDiscount.type === "free_trial" && sessionType === "trial") {
                                      discountAmount = basePrice;
                                    }
                                    finalPrice = Math.max(0, basePrice - discountAmount);
                                  }
                                  
                                  return (
                                    <div className="mt-2 pt-2 border-t border-teal-200 dark:border-teal-700">
                                      <div className="flex justify-between">
                                        <span>{isEn ? "Subtotal" : "Sous-total"}:</span>
                                        <span>${(basePrice / 100).toFixed(2)}</span>
                                      </div>
                                      {discountAmount > 0 && (
                                        <div className="flex justify-between text-emerald-600">
                                          <span>{isEn ? "Discount" : "Réduction"}:</span>
                                          <span>-${(discountAmount / 100).toFixed(2)}</span>
                                        </div>
                                      )}
                                      <div className="flex justify-between text-lg font-bold text-teal-700 dark:text-teal-300 mt-1">
                                        <span>Total:</span>
                                        <span>${(finalPrice / 100).toFixed(2)} CAD</span>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        )}
                        </div>

                        <DialogFooter className="mt-4 pt-4 border-t">
                          <Button
                            variant="outline"
                            onClick={() => setBookingDialogOpen(false)}
                          >
                            {isEn ? "Cancel" : "Annuler"}
                          </Button>
                          <Button
                            onClick={handleBookSession}
                            disabled={!selectedDate || !selectedTime || isBooking}
                            className="gap-2 bg-teal-600 hover:bg-teal-700"
                          >
                            {isBooking ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {isEn ? "Processing..." : "Traitement..."}
                              </>
                            ) : (
                              <>
                                <CreditCard className="h-4 w-4" />
                                {isEn ? "Proceed to Payment" : "Procéder au paiement"}
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    )}

                    <Button variant="outline" className="w-full border-teal-200 hover:bg-teal-50 dark:border-teal-800 dark:hover:bg-teal-950/30" size="lg">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {isEn ? "Send Message" : "Envoyer un message"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Trust Signals Card */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                        <Shield className="h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{isEn ? "Satisfaction Guaranteed" : "Satisfaction garantie"}</p>
                          <p className="text-xs text-slate-900 dark:text-slate-100">{isEn ? "Money-back if not satisfied" : "Remboursement si non satisfait"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-teal-50 dark:bg-teal-950/30">
                        <Sparkles className="h-5 w-5 text-teal-600" />
                        <div>
                          <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{isEn ? "Verified Coach" : "Coach vérifié"}</p>
                          <p className="text-xs text-slate-900 dark:text-slate-100">{isEn ? "Background checked" : "Vérification effectuée"}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats Card */}
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-teal-600" />
                      {isEn ? "Quick Stats" : "Statistiques"}
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-900 dark:text-slate-100">{isEn ? "Response time" : "Temps de réponse"}</span>
                        <span className="font-medium flex items-center gap-1">
                          <Clock className="h-4 w-4 text-teal-600" />
                          {coach.responseTimeHours || 24}h
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-900 dark:text-slate-100">{isEn ? "Total sessions" : "Séances totales"}</span>
                        <span className="font-medium">{coach.totalSessions || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-900 dark:text-slate-100">{isEn ? "Students helped" : "Étudiants aidés"}</span>
                        <span className="font-medium">{coach.totalStudents || 0}</span>
                      </div>
                      {coach.successRate && coach.successRate > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-900 dark:text-slate-100">{isEn ? "SLE success rate" : "Taux de réussite SLE"}</span>
                          <span className="font-medium text-emerald-600">
                            {coach.successRate}%
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-2xl p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{coach.name}</p>
            <p className="text-xs text-muted-foreground">
              {isEn ? "From" : "Dès"} ${((coach.trialRate || 2500) / 100).toFixed(0)} CAD
            </p>
          </div>
          {coach.calendarType === "calendly" && coach.calendlyUrl ? (
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white shrink-0"
              onClick={() => window.open(coach.calendlyUrl || '', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              {isEn ? "Book via Calendly" : "Réserver"}
            </Button>
          ) : (
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white shrink-0"
              onClick={() => {
                document.getElementById('booking-sidebar')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <CalendarIcon className="h-4 w-4 mr-1" />
              {isEn ? "Book Session" : "Réserver"}
            </Button>
          )}
        </div>
      </div>

      <Footer />

      {/* Learner Onboarding Modal */}
      <LearnerOnboardingModal
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
        onSuccess={handleOnboardingSuccess}
      />

      {/* Review Modal */}
      {coach && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          coachId={coach.id}
          coachName={coach.name || "Coach"}
          // @ts-expect-error - TS2322: auto-suppressed during TS cleanup
          existingReview={myReview}
          onSuccess={() => refetchReviews()}
        />
      )}
    </div>
  );
}
