/**
 * BadgesPage — Full-page badge collection view
 * 
 * Premium display of all earned and locked badges with
 * category filtering, progress tracking, and glassmorphism accents.
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import BadgesPanel from "@/components/BadgesPanel";

export default function BadgesPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isEn = language === "en";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b">
        <div className="container flex items-center gap-4 h-14">
          <Link href="/app">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {isEn ? "Dashboard" : "Tableau de bord"}
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-sm font-semibold">
              {isEn ? "My Badge Collection" : "Ma collection de badges"}
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-8 max-w-4xl">
        <BadgesPanel mode="full" language={isEn ? "en" : "fr"} />
      </main>
    </div>
  );
}
