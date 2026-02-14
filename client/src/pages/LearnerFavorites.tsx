import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { FavoriteButton } from "@/components/FavoriteButton";
import {
  Heart,
  Star,
  DollarSign,
  Loader2,
  Search,
  Calendar,
} from "lucide-react";
import { Link } from "wouter";
import { useAppLayout } from "@/contexts/AppLayoutContext";

export default function LearnerFavorites() {
  const { isInsideAppLayout } = useAppLayout();
  const { language } = useLanguage();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const isEn = language === "en";
  
  // Fetch favorites
  const { data: favorites = [], isLoading, refetch } = trpc.learner.favorites.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  const content = {
    en: {
      title: "My Favorite Coaches",
      subtitle: "Quick access to your saved coaches",
      noFavorites: "No favorites yet",
      noFavoritesDesc: "Browse coaches and click the heart icon to save them here for quick access.",
      browseCoaches: "Browse Coaches",
      viewProfile: "View Profile",
      bookSession: "Book Session",
      perHour: "/hour",
      loginRequired: "Please sign in to view your favorites",
      signIn: "Sign In",
    },
    fr: {
      title: "Mes coachs favoris",
      subtitle: "Accès rapide à vos coachs sauvegardés",
      noFavorites: "Aucun favori",
      noFavoritesDesc: "Parcourez les coachs et cliquez sur l'icône cœur pour les sauvegarder ici pour un accès rapide.",
      browseCoaches: "Parcourir les coachs",
      viewProfile: "Voir le profil",
      bookSession: "Réserver une séance",
      perHour: "/heure",
      loginRequired: "Veuillez vous connecter pour voir vos favoris",
      signIn: "Se connecter",
    },
  };
  
  const t = isEn ? content.en : content.fr;
  
  const formatCurrency = (cents: number | null) => {
    if (!cents) return "$0";
    return new Intl.NumberFormat(isEn ? "en-CA" : "fr-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
    }).format(cents);
  };
  
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {!isInsideAppLayout && <Header />}
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardHeader className="text-center">
              <CardTitle>{t.title}</CardTitle>
              <CardDescription>{t.loginRequired}</CardDescription>
            </CardHeader>
            <CardContent>
              <a href={getLoginUrl()} className="block">
                <Button className="w-full" size="lg">
                  {t.signIn}
                </Button>
              </a>
            </CardContent>
          </Card>
        </main>
        {!isInsideAppLayout && <Footer />}
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {!isInsideAppLayout && <Header />}
      
      <main className="flex-1 py-8">
        <div className="container max-w-5xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-500 fill-red-500" />
              {t.title}
            </h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : favorites.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t.noFavorites}</h3>
                <p className="text-muted-foreground mb-6">{t.noFavoritesDesc}</p>
                <Link href="/coaches">
                  <Button>
                    <Search className="h-4 w-4 mr-2" />
                    {t.browseCoaches}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite: any) => (
                <Card key={favorite.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    {/* Coach Photo */}
                    <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5">
                      <Avatar className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 h-24 w-24 border-4 border-background">
                        <AvatarImage src={favorite.coach?.photoUrl || ""} />
                        <AvatarFallback className="text-2xl bg-primary/10">
                          {favorite.coach?.name?.split(" ").map((n: string) => n[0]).join("") || "C"}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Favorite Button */}
                      <div className="absolute top-3 right-3">
                        <FavoriteButton
                          coachId={favorite.coachId}
                          initialFavorited={true}
                          onToggle={() => refetch()}
                        />
                      </div>
                    </div>
                    
                    {/* Coach Info */}
                    <div className="pt-14 pb-4 px-4 text-center">
                      <h3 className="font-semibold text-lg">{favorite.coach?.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {(!isEn && (favorite.coach as any)?.headlineFr) ? (favorite.coach as any).headlineFr : (favorite.coach?.headline || (isEn ? "SLE Coach" : "Coach ELS"))}
                      </p>
                      
                      {/* Price */}
                      <div className="flex items-center justify-center gap-1 mt-3">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-600">
                          {formatCurrency(favorite.coach?.hourlyRate)}
                        </span>
                        <span className="text-sm text-muted-foreground">{t.perHour}</span>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <Link href={`/coaches/${favorite.coach?.slug}`} className="flex-1">
                          <Button variant="outline" className="w-full" size="sm">
                            {t.viewProfile}
                          </Button>
                        </Link>
                        <Link href={`/coaches/${favorite.coach?.slug}?book=true`} className="flex-1">
                          <Button className="w-full" size="sm">
                            <Calendar className="h-4 w-4 mr-1" />
                            {t.bookSession}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      {!isInsideAppLayout && <Footer />}
    </div>
  );
}
