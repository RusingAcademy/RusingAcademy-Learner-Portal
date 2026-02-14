import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  coachId: number;
  initialFavorited?: boolean;
  variant?: "icon" | "button";
  className?: string;
  onToggle?: (isFavorited: boolean) => void;
}

export function FavoriteButton({
  coachId,
  initialFavorited = false,
  variant = "icon",
  className,
  onToggle,
}: FavoriteButtonProps) {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const isEn = language === "en";
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);
  
  const utils = trpc.useUtils();
  
  const addFavoriteMutation = trpc.learner.addFavorite.useMutation({
    onSuccess: () => {
      setIsFavorited(true);
      setIsLoading(false);
      toast.success(isEn ? "Added to favorites" : "Ajouté aux favoris");
      utils.learner.favorites.invalidate();
      onToggle?.(true);
    },
    onError: (error: any) => {
      setIsLoading(false);
      toast.error(isEn ? "Failed to add to favorites" : "Échec de l'ajout aux favoris");
    },
  });
  
  const removeFavoriteMutation = trpc.learner.removeFavorite.useMutation({
    onSuccess: () => {
      setIsFavorited(false);
      setIsLoading(false);
      toast.success(isEn ? "Removed from favorites" : "Retiré des favoris");
      utils.learner.favorites.invalidate();
      onToggle?.(false);
    },
    onError: (error: any) => {
      setIsLoading(false);
      toast.error(isEn ? "Failed to remove from favorites" : "Échec du retrait des favoris");
    },
  });
  
  const handleToggle = () => {
    if (!isAuthenticated) {
      toast.error(isEn ? "Please sign in to save favorites" : "Veuillez vous connecter pour enregistrer des favoris");
      return;
    }
    
    setIsLoading(true);
    
    if (isFavorited) {
      removeFavoriteMutation.mutate({ coachId });
    } else {
      addFavoriteMutation.mutate({ coachId });
    }
  };
  
  if (variant === "icon") {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={cn(
          "p-2 rounded-full transition-all duration-200",
          isFavorited 
            ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" 
            : "bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white",
          isLoading && "opacity-50 cursor-not-allowed",
          className
        )}
        aria-label={isFavorited 
          ? (isEn ? "Remove from favorites" : "Retirer des favoris")
          : (isEn ? "Add to favorites" : "Ajouter aux favoris")
        }
      >
        <Heart 
          className={cn(
            "h-5 w-5 transition-all",
            isFavorited && "fill-current"
          )} 
        />
      </button>
    );
  }
  
  return (
    <Button
      variant={isFavorited ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        isFavorited && "bg-red-500 hover:bg-red-600",
        className
      )}
    >
      <Heart className={cn("h-4 w-4 mr-2", isFavorited && "fill-current")} />
      {isFavorited 
        ? (isEn ? "Favorited" : "Favori") 
        : (isEn ? "Add to Favorites" : "Ajouter aux favoris")}
    </Button>
  );
}
