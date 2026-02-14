import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoyaltyDashboard from "@/components/LoyaltyDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Loader2 } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useAppLayout } from "@/contexts/AppLayoutContext";

export default function LearnerLoyalty() {
  const { isInsideAppLayout } = useAppLayout();
  const { user, isAuthenticated, loading } = useAuth();
  const { language } = useLanguage();
  const isEn = language === "en";

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {!isInsideAppLayout && <Header />}
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        {!isInsideAppLayout && <Footer />}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {!isInsideAppLayout && <Header />}
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <Gift className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-2">
                {isEn ? "Sign in to view rewards" : "Connectez-vous pour voir les récompenses"}
              </h2>
              <p className="text-muted-foreground mb-4">
                {isEn 
                  ? "Access your loyalty points and exclusive rewards."
                  : "Accédez à vos points de fidélité et récompenses exclusives."}
              </p>
              <Button asChild>
                <a href={getLoginUrl()}>{isEn ? "Sign In" : "Se connecter"}</a>
              </Button>
            </CardContent>
          </Card>
        </main>
        {!isInsideAppLayout && <Footer />}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!isInsideAppLayout && <Header />}
      
      <main className="flex-1">
        <div className="container py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {isEn ? "Loyalty Rewards" : "Récompenses de fidélité"}
            </h1>
            <p className="text-muted-foreground">
              {isEn 
                ? "Earn points with every session and redeem exclusive rewards"
                : "Gagnez des points à chaque session et échangez des récompenses exclusives"}
            </p>
          </div>

          {/* Loyalty Dashboard Component */}
          <LoyaltyDashboard />
        </div>
      </main>

      {!isInsideAppLayout && <Footer />}
    </div>
  );
}
