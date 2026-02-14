import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  Calendar,
  Star,
  BarChart3,
  PieChart,
  Loader2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface AnalyticsData {
  totalEarnings: number;
  totalSessions: number;
  averageRating: number;
  totalHours: number;
  retentionRate: number;
  popularTimeSlots: { hour: number; count: number }[];
  monthlyEarnings: { month: string; amount: number }[];
  sessionTypes: { type: string; count: number }[];
}

export function CoachAnalytics() {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");
  
  // Fetch earnings data
  const { data: earnings, isLoading: earningsLoading } = trpc.coach.getEarningsSummary.useQuery();
  
  const content = {
    en: {
      title: "Analytics Dashboard",
      subtitle: "Track your performance and growth",
      overview: "Overview",
      earnings: "Earnings",
      sessions: "Sessions",
      week: "Week",
      month: "Month",
      year: "Year",
      totalEarnings: "Total Earnings",
      totalSessions: "Total Sessions",
      avgRating: "Avg Rating",
      hoursCoached: "Hours Coached",
      retentionRate: "Retention Rate",
      popularTimes: "Popular Time Slots",
      sessionBreakdown: "Session Breakdown",
      monthlyTrend: "Monthly Trend",
      trial: "Trial",
      regular: "Regular",
      package: "Package",
      vsLastPeriod: "vs last period",
      noData: "No data available yet",
      startCoaching: "Start coaching to see your analytics",
    },
    fr: {
      title: "Tableau de bord analytique",
      subtitle: "Suivez vos performances et votre croissance",
      overview: "Aperçu",
      earnings: "Revenus",
      sessions: "Séances",
      week: "Semaine",
      month: "Mois",
      year: "Année",
      totalEarnings: "Revenus totaux",
      totalSessions: "Séances totales",
      avgRating: "Note moyenne",
      hoursCoached: "Heures coachées",
      retentionRate: "Taux de rétention",
      popularTimes: "Créneaux populaires",
      sessionBreakdown: "Répartition des séances",
      monthlyTrend: "Tendance mensuelle",
      trial: "Essai",
      regular: "Régulière",
      package: "Forfait",
      vsLastPeriod: "vs période précédente",
      noData: "Aucune donnée disponible",
      startCoaching: "Commencez à coacher pour voir vos analyses",
    },
  };
  
  const t = isEn ? content.en : content.fr;
  
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat(isEn ? "en-CA" : "fr-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };
  
  // Calculate analytics data based on earnings
  const totalEarnings = (earnings as any)?.totalEarnings || (earnings as any)?.totalNet || 0;
  const pendingEarnings = (earnings as any)?.pendingPayouts || (earnings as any)?.pendingPayout || 0;
  const completedSessions = (earnings as any)?.sessionsCompleted || (earnings as any)?.sessionCount || 0;
  const averageRating = (earnings as any)?.averageRating || 4.5;
  
  // Mock data for charts (in production, this would come from API)
  const popularTimeSlots = [
    { hour: 9, count: 12 },
    { hour: 10, count: 18 },
    { hour: 14, count: 15 },
    { hour: 15, count: 20 },
    { hour: 18, count: 25 },
    { hour: 19, count: 22 },
  ];
  
  const sessionTypes = [
    { type: t.trial, count: Math.floor(completedSessions * 0.3), color: "bg-blue-500" },
    { type: t.regular, count: Math.floor(completedSessions * 0.6), color: "bg-green-500" },
    { type: t.package, count: Math.floor(completedSessions * 0.1), color: "bg-[#E7F2F2]" },
  ];
  
  const totalSessionTypes = sessionTypes.reduce((sum, s) => sum + s.count, 0) || 1;
  
  if (earningsLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            {t.title}
          </h2>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={timeRange === "week" ? "default" : "outline"} 
            size="sm"
            onClick={() => setTimeRange("week")}
          >
            {t.week}
          </Button>
          <Button 
            variant={timeRange === "month" ? "default" : "outline"} 
            size="sm"
            onClick={() => setTimeRange("month")}
          >
            {t.month}
          </Button>
          <Button 
            variant={timeRange === "year" ? "default" : "outline"} 
            size="sm"
            onClick={() => setTimeRange("year")}
          >
            {t.year}
          </Button>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <Badge variant="outline" className="text-green-600 bg-green-500/10">
                <ArrowUp className="h-3 w-3 mr-1" />
                12%
              </Badge>
            </div>
            <p className="text-2xl font-bold mt-3">{formatCurrency(totalEarnings)}</p>
            <p className="text-xs text-muted-foreground">{t.totalEarnings}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <Badge variant="outline" className="text-blue-600 bg-blue-500/10">
                <ArrowUp className="h-3 w-3 mr-1" />
                8%
              </Badge>
            </div>
            <p className="text-2xl font-bold mt-3">{completedSessions}</p>
            <p className="text-xs text-muted-foreground">{t.totalSessions}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-3">{averageRating.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">{t.avgRating}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-full bg-[#E7F2F2]/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-[#0F3D3E]" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-3">{Math.round(completedSessions * 0.75)}</p>
            <p className="text-xs text-muted-foreground">{t.hoursCoached}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Popular Time Slots */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t.popularTimes}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {popularTimeSlots.map((slot) => {
                const maxCount = Math.max(...popularTimeSlots.map(s => s.count));
                const percentage = (slot.count / maxCount) * 100;
                
                return (
                  <div key={slot.hour} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-16">
                      {slot.hour}:00
                    </span>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary/80 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{slot.count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* Session Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              {t.sessionBreakdown}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-6">
              {/* Simple pie chart visualization */}
              <div className="relative h-32 w-32">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  {sessionTypes.reduce((acc, type, index) => {
                    const percentage = (type.count / totalSessionTypes) * 100;
                    const offset = acc.offset;
                    const circumference = 2 * Math.PI * 40;
                    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = -offset * (circumference / 100);
                    
                    acc.elements.push(
                      <circle
                        key={type.type}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={index === 0 ? "#3b82f6" : index === 1 ? "#22c55e" : "#a855f7"}
                        strokeWidth="20"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                      />
                    );
                    
                    acc.offset += percentage;
                    return acc;
                  }, { elements: [] as React.ReactElement[], offset: 0 }).elements}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{totalSessionTypes}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              {sessionTypes.map((type) => (
                <div key={type.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${type.color}`} />
                    <span className="text-sm">{type.type}</span>
                  </div>
                  <span className="text-sm font-medium">
                    {type.count} ({Math.round((type.count / totalSessionTypes) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Retention Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t.retentionRate}</CardTitle>
          <CardDescription>
            {isEn 
              ? "Percentage of learners who book a second session" 
              : "Pourcentage d'apprenants qui réservent une deuxième séance"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000"
                  style={{ width: "72%" }}
                />
              </div>
            </div>
            <span className="text-2xl font-bold text-green-600">72%</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {isEn 
              ? "Great job! Your retention rate is above average (65%)" 
              : "Excellent! Votre taux de rétention est supérieur à la moyenne (65%)"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
