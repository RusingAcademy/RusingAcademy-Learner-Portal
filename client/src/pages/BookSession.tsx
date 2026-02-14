/**
 * BookSession Page
 * 
 * Dedicated booking flow for learners to book coaching sessions
 * using their purchased coaching plan credits.
 */

import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Loader2,
  Video,
  User,
  Search,
  Filter,
  Star,
  Globe,
  Award,
  ArrowLeft,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import EcosystemHeaderGold from "@/components/EcosystemHeaderGold";
import Footer from "@/components/Footer";


// Bilingual labels
const labels = {
  en: {
    title: "Book a Coaching Session",
    subtitle: "Select a coach and time slot to book your session",
    backToDashboard: "Back to Dashboard",
    step1: "Select Coach",
    step2: "Choose Date & Time",
    step3: "Confirm Booking",
    yourPlan: "Your Coaching Plan",
    sessionsRemaining: "sessions remaining",
    validUntil: "Valid until",
    noPlan: "No Active Coaching Plan",
    noPlanDesc: "You need an active coaching plan to book sessions. Purchase a plan to get started.",
    viewPlans: "View Coaching Plans",
    searchCoaches: "Search coaches...",
    allCoaches: "All Coaches",
    french: "French",
    english: "English",
    oralA: "Oral A",
    oralB: "Oral B",
    oralC: "Oral C",
    selectCoach: "Select",
    selected: "Selected",
    rating: "Rating",
    sessions: "Sessions",
    specialties: "Specialties",
    selectDate: "Select a date",
    availableSlots: "Available time slots",
    noSlots: "No available slots for this date",
    selectSlot: "Select a time slot",
    confirmBooking: "Confirm Booking",
    bookingDetails: "Booking Details",
    coach: "Coach",
    date: "Date",
    time: "Time",
    duration: "Duration",
    minutes: "minutes",
    planCredits: "Plan Credits",
    afterBooking: "After this booking",
    confirmAndBook: "Confirm & Book Session",
    booking: "Booking...",
    bookingSuccess: "Session booked successfully!",
    bookingError: "Failed to book session",
    loading: "Loading...",
  },
  fr: {
    title: "Réserver une séance de coaching",
    subtitle: "Sélectionnez un coach et un créneau horaire pour réserver votre séance",
    backToDashboard: "Retour au tableau de bord",
    step1: "Choisir un coach",
    step2: "Choisir date et heure",
    step3: "Confirmer la réservation",
    yourPlan: "Votre plan de coaching",
    sessionsRemaining: "séances restantes",
    validUntil: "Valide jusqu'au",
    noPlan: "Aucun plan de coaching actif",
    noPlanDesc: "Vous avez besoin d'un plan de coaching actif pour réserver des séances. Achetez un plan pour commencer.",
    viewPlans: "Voir les plans de coaching",
    searchCoaches: "Rechercher des coachs...",
    allCoaches: "Tous les coachs",
    french: "Français",
    english: "Anglais",
    oralA: "Oral A",
    oralB: "Oral B",
    oralC: "Oral C",
    selectCoach: "Sélectionner",
    selected: "Sélectionné",
    rating: "Note",
    sessions: "Séances",
    specialties: "Spécialités",
    selectDate: "Sélectionnez une date",
    availableSlots: "Créneaux disponibles",
    noSlots: "Aucun créneau disponible pour cette date",
    selectSlot: "Sélectionnez un créneau",
    confirmBooking: "Confirmer la réservation",
    bookingDetails: "Détails de la réservation",
    coach: "Coach",
    date: "Date",
    time: "Heure",
    duration: "Durée",
    minutes: "minutes",
    planCredits: "Crédits du plan",
    afterBooking: "Après cette réservation",
    confirmAndBook: "Confirmer et réserver",
    booking: "Réservation en cours...",
    bookingSuccess: "Séance réservée avec succès!",
    bookingError: "Échec de la réservation",
    loading: "Chargement...",
  },
};

const DAYS_OF_WEEK = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  fr: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
};

const MONTHS = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  fr: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
};

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export default function BookSession() {
  const { language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const l = labels[language as keyof typeof labels] || labels.en;

  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCoach, setSelectedCoach] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [isBooking, setIsBooking] = useState(false);

  // Fetch coaching plans
  const { data: plans, isLoading: plansLoading } = (trpc as any).learner.getMyCoachingPlans.useQuery();

  // Fetch coaches
  const { data: coaches, isLoading: coachesLoading } = (trpc as any).coaches.getAll.useQuery();

  // Fetch available slots for selected coach and date
  const { data: availableSlots, isLoading: slotsLoading } = (trpc as any).booking?.getAvailableSlots?.useQuery(
    { coachId: selectedCoach?.id, date: selectedDate?.toISOString().split('T')[0] || '' },
    { enabled: !!selectedCoach && !!selectedDate }
  ) || { data: [], isLoading: false };

  // Book session mutation
  const bookSessionMutation = (trpc as any).booking?.bookSessionWithPlan?.useMutation({
    onSuccess: () => {
      toast.success(l.bookingSuccess);
      setLocation("/app/my-courses");
    },
    onError: (error: any) => {
      toast.error(error.message || l.bookingError);
      setIsBooking(false);
    },
  }) || { mutateAsync: async () => {}, isLoading: false };

  // Get active plan
  const activePlan = useMemo(() => {
    if (!plans?.length) return null;
    return plans.find((p: any) => 
      p.status === "active" && 
      new Date(p.expiresAt) >= new Date() &&
      p.remainingSessions > 0
    );
  }, [plans]);

  // Filter coaches
  const filteredCoaches = useMemo(() => {
    if (!coaches) return [];
    return coaches.filter((coach: any) => {
      const matchesSearch = !searchQuery || 
        coach.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coach.headline?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLanguage = languageFilter === "all" || 
        coach.languages === languageFilter || 
        coach.languages === "both";
      return matchesSearch && matchesLanguage;
    });
  }, [coaches, searchQuery, languageFilter]);

  // Calendar logic
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    return days;
  }, [currentDate]);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  const handleDateSelect = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return;
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleBookSession = async () => {
    if (!selectedCoach || !selectedDate || !selectedSlot || !activePlan) return;
    setIsBooking(true);
    
    try {
      await bookSessionMutation.mutateAsync({
        coachId: selectedCoach.id,
        planId: activePlan.id,
        date: selectedDate.toISOString().split('T')[0],
        slotId: selectedSlot.id,
        startTime: selectedSlot.startTime,
        duration: 60,
      });
    } catch (error) {
      setIsBooking(false);
    }
  };

  const isDateSelected = (date: Date | null) => date && selectedDate && date.toDateString() === selectedDate.toDateString();
  const isDatePast = (date: Date | null) => { if (!date) return false; const today = new Date(); today.setHours(0,0,0,0); return date < today; };
  const isToday = (date: Date | null) => date && date.toDateString() === new Date().toDateString();

  // Loading state
  if (authLoading || plansLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <EcosystemHeaderGold />
        <main className="container py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // No active plan
  if (!activePlan) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <EcosystemHeaderGold />
        <main className="container py-8">
          <Link href="/app/my-courses">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {l.backToDashboard}
            </Button>
          </Link>

          <Card className="max-w-lg mx-auto text-center p-8">
            <CreditCard className="h-16 w-16 mx-auto text-slate-400 mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{l.noPlan}</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">{l.noPlanDesc}</p>
            <Link href="/ecosystem">
              <Button className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700">
                {l.viewPlans}
              </Button>
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <EcosystemHeaderGold />
      
      <main className="container py-8">
        {/* Back Button */}
        <Link href="/app/my-courses">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {l.backToDashboard}
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{l.title}</h1>
          <p className="text-slate-600 dark:text-slate-400">{l.subtitle}</p>
        </div>

        {/* Plan Info Card */}
        <Card className="mb-8 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{activePlan.planName}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {l.validUntil} {new Date(activePlan.expiresAt).toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA")}
                </p>
              </div>
            </div>
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 text-lg px-4 py-2">
              {activePlan.remainingSessions} {l.sessionsRemaining}
            </Badge>
          </div>
        </Card>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all",
                currentStep >= step 
                  ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white" 
                  : "bg-slate-200 dark:bg-slate-700 text-slate-500"
              )}>
                {currentStep > step ? <Check className="h-5 w-5" /> : step}
              </div>
              {step < 3 && (
                <div className={cn(
                  "w-16 h-1 mx-2 rounded-full transition-all",
                  currentStep > step ? "bg-purple-500" : "bg-slate-200 dark:bg-slate-700"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Coach */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{l.step1}</h2>
            
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder={l.searchCoaches}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["all", "french", "english"].map((lang) => (
                  <Button
                    key={lang}
                    variant={languageFilter === lang ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLanguageFilter(lang)}
                    className={languageFilter === lang ? "bg-purple-600 hover:bg-purple-700" : ""}
                  >
                    {lang === "all" ? l.allCoaches : lang === "french" ? l.french : l.english}
                  </Button>
                ))}
              </div>
            </div>

            {/* Coach Grid */}
            {coachesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCoaches.map((coach: any) => (
                  <CoachCard
                    key={coach.id}
                    coach={coach}
                    isSelected={selectedCoach?.id === coach.id}
                    onSelect={() => setSelectedCoach(coach)}
                    labels={l}
                    language={language}
                  />
                ))}
              </div>
            )}

            {/* Next Button */}
            {selectedCoach && (
              <div className="flex justify-end">
                <Button 
                  onClick={() => setCurrentStep(2)}
                  className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700"
                >
                  {l.step2}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setCurrentStep(1)}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                {l.step1}
              </Button>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{l.step2}</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calendar */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {MONTHS[language as keyof typeof MONTHS]?.[currentDate.getMonth()] || MONTHS.en[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => navigateMonth("next")}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {(DAYS_OF_WEEK[language as keyof typeof DAYS_OF_WEEK] || DAYS_OF_WEEK.en).map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((date, i) => (
                    <button
                      key={i}
                      disabled={!date || isDatePast(date)}
                      onClick={() => date && handleDateSelect(date)}
                      className={cn(
                        "aspect-square rounded-lg text-sm font-medium transition-all",
                        !date && "invisible",
                        date && isDatePast(date) && "text-slate-300 dark:text-slate-600 cursor-not-allowed",
                        date && !isDatePast(date) && "hover:bg-purple-100 dark:hover:bg-purple-900/30",
                        isDateSelected(date) && "bg-purple-600 text-white hover:bg-purple-700",
                        isToday(date) && !isDateSelected(date) && "ring-2 ring-purple-500"
                      )}
                    >
                      {date?.getDate()}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Time Slots */}
              <Card className="p-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                  {selectedDate ? l.availableSlots : l.selectDate}
                </h3>

                {!selectedDate ? (
                  <div className="text-center py-8 text-slate-500">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>{l.selectDate}</p>
                  </div>
                ) : slotsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-12 rounded-lg" />
                    ))}
                  </div>
                ) : !availableSlots?.length ? (
                  <div className="text-center py-8 text-slate-500">
                    <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>{l.noSlots}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map((slot: TimeSlot) => (
                      <button
                        key={slot.id}
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot)}
                        className={cn(
                          "p-3 rounded-lg border text-sm font-medium transition-all",
                          !slot.available && "opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800",
                          slot.available && "hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20",
                          selectedSlot?.id === slot.id && "border-purple-500 bg-purple-100 dark:bg-purple-900/30"
                        )}
                      >
                        <Clock className="h-4 w-4 inline mr-2" />
                        {slot.startTime} - {slot.endTime}
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Next Button */}
            {selectedDate && selectedSlot && (
              <div className="flex justify-end">
                <Button 
                  onClick={() => setCurrentStep(3)}
                  className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700"
                >
                  {l.step3}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Confirm Booking */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setCurrentStep(2)}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                {l.step2}
              </Button>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{l.step3}</h2>
            </div>

            <Card className="max-w-lg mx-auto p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-6">{l.bookingDetails}</h3>
              
              <div className="space-y-4">
                {/* Coach */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <img
                    src={selectedCoach?.photoUrl || `https://ui-avatars.com/api/?name=${selectedCoach?.name}&background=random`}
                    alt={selectedCoach?.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm text-slate-500">{l.coach}</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{selectedCoach?.name}</p>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-sm text-slate-500">{l.date}</p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {selectedDate?.toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA", { 
                        weekday: "long", 
                        year: "numeric", 
                        month: "long", 
                        day: "numeric" 
                      })}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-sm text-slate-500">{l.time}</p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {selectedSlot?.startTime} - {selectedSlot?.endTime}
                    </p>
                  </div>
                </div>

                {/* Duration */}
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-sm text-slate-500">{l.duration}</p>
                  <p className="font-semibold text-slate-900 dark:text-white">60 {l.minutes}</p>
                </div>

                {/* Plan Credits */}
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-purple-600 dark:text-purple-400">{l.planCredits}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-slate-600 dark:text-slate-400">{l.afterBooking}</span>
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                      {activePlan.remainingSessions - 1} {l.sessionsRemaining}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Confirm Button */}
              <Button 
                onClick={handleBookSession}
                disabled={isBooking}
                className="w-full mt-6 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700"
              >
                {isBooking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {l.booking}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {l.confirmAndBook}
                  </>
                )}
              </Button>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

// Coach Card Component
function CoachCard({ coach, isSelected, onSelect, labels, language }: {
  coach: any;
  isSelected: boolean;
  onSelect: () => void;
  labels: any;
  language: string;
}) {
  return (
    <div 
      onClick={onSelect}
      className={cn(
        "p-4 rounded-xl border-2 cursor-pointer transition-all",
        isSelected 
          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" 
          : "border-slate-200 dark:border-slate-700 hover:border-purple-300 bg-white dark:bg-slate-800"
      )}
    >
      <div className="flex items-start gap-4">
        <img
          src={coach.photoUrl || `https://ui-avatars.com/api/?name=${coach.name}&background=random`}
          alt={coach.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-white truncate">{coach.name}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{coach.headline}</p>
          
          <div className="flex items-center gap-3 mt-2">
            {coach.rating && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="text-slate-600 dark:text-slate-400">{coach.rating}</span>
              </div>
            )}
            <Badge variant="outline" className="text-xs">
              <Globe className="h-3 w-3 mr-1" />
              {coach.languages === "both" ? "EN/FR" : coach.languages === "french" ? "FR" : "EN"}
            </Badge>
          </div>
        </div>
      </div>

      <Button 
        variant={isSelected ? "default" : "outline"}
        size="sm"
        className={cn(
          "w-full mt-4",
          isSelected && "bg-purple-600 hover:bg-purple-700"
        )}
      >
        {isSelected ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            {labels.selected}
          </>
        ) : (
          labels.selectCoach
        )}
      </Button>
    </div>
  );
}
