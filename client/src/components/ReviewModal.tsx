import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StarRatingInput } from "@/components/StarRating";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Award, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  coachId: number;
  coachName: string;
  existingReview?: {
    rating: number;
    comment: string | null;
    sleAchievement: string | null;
  } | null;
  onSuccess?: () => void;
}

const SLE_ACHIEVEMENTS = [
  { value: "oral_a", label: "Oral A" },
  { value: "oral_b", label: "Oral B" },
  { value: "oral_c", label: "Oral C" },
  { value: "written_a", label: "Written A" },
  { value: "written_b", label: "Written B" },
  { value: "written_c", label: "Written C" },
  { value: "reading_a", label: "Reading A" },
  { value: "reading_b", label: "Reading B" },
  { value: "reading_c", label: "Reading C" },
  { value: "bbb", label: "BBB Profile" },
  { value: "cbc", label: "CBC Profile" },
  { value: "ccc", label: "CCC Profile" },
];

export function ReviewModal({
  isOpen,
  onClose,
  coachId,
  coachName,
  existingReview,
  onSuccess,
}: ReviewModalProps) {
  const { language } = useLanguage();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [sleAchievement, setSleAchievement] = useState(existingReview?.sleAchievement || "");
  
  const utils = trpc.useUtils();
  
  const submitReview = trpc.coach.submitReview.useMutation({
    onSuccess: () => {
      toast.success(
        language === "fr" 
          ? "Merci pour votre avis !" 
          : "Thank you for your review!"
      );
      utils.coach.reviews.invalidate({ coachId });
      utils.coach.canReview.invalidate({ coachId });
      utils.coach.myReview.invalidate({ coachId });
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const updateReview = trpc.coach.updateReview.useMutation({
    onSuccess: () => {
      toast.success(
        language === "fr" 
          ? "Avis mis à jour !" 
          : "Review updated!"
      );
      utils.coach.reviews.invalidate({ coachId });
      utils.coach.myReview.invalidate({ coachId });
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const handleSubmit = () => {
    if (rating === 0) {
      toast.error(
        language === "fr" 
          ? "Veuillez sélectionner une note" 
          : "Please select a rating"
      );
      return;
    }
    
    const data = {
      coachId,
      rating,
      comment: comment.trim() || undefined,
      sleAchievement: sleAchievement || undefined,
    };
    
    if (existingReview) {
      updateReview.mutate(data);
    } else {
      submitReview.mutate(data);
    }
  };
  
  const isSubmitting = submitReview.isPending || updateReview.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-400" />
            {existingReview 
              ? (language === "fr" ? "Modifier votre avis" : "Edit Your Review")
              : (language === "fr" ? "Évaluer" : "Review")} {coachName}
          </DialogTitle>
          <DialogDescription>
            {language === "fr" 
              ? "Partagez votre expérience pour aider d'autres apprenants"
              : "Share your experience to help other learners"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label className="text-base font-medium">
              {language === "fr" ? "Votre note" : "Your Rating"} *
            </Label>
            <div className="flex justify-center py-2">
              <StarRatingInput 
                value={rating} 
                onChange={setRating}
                size="lg"
              />
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                {rating === 5 && (language === "fr" ? "Excellent !" : "Excellent!")}
                {rating === 4 && (language === "fr" ? "Très bien" : "Very Good")}
                {rating === 3 && (language === "fr" ? "Bien" : "Good")}
                {rating === 2 && (language === "fr" ? "Passable" : "Fair")}
                {rating === 1 && (language === "fr" ? "À améliorer" : "Needs Improvement")}
              </p>
            )}
          </div>
          
          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-base font-medium">
              {language === "fr" ? "Votre commentaire" : "Your Comment"}
            </Label>
            <Textarea
              id="comment"
              placeholder={
                language === "fr" 
                  ? "Décrivez votre expérience avec ce coach..."
                  : "Describe your experience with this coach..."
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {language === "fr" 
                ? "Minimum 10 caractères si vous ajoutez un commentaire"
                : "Minimum 10 characters if adding a comment"}
            </p>
          </div>
          
          {/* SLE Achievement */}
          <div className="space-y-2">
            <Label className="text-base font-medium flex items-center gap-2">
              <Award className="h-4 w-4 text-emerald-500" />
              {language === "fr" ? "Réussite SLE (optionnel)" : "SLE Achievement (optional)"}
            </Label>
            <Select value={sleAchievement} onValueChange={setSleAchievement}>
              <SelectTrigger>
                <SelectValue 
                  placeholder={
                    language === "fr" 
                      ? "Avez-vous atteint un niveau SLE ?"
                      : "Did you achieve an SLE level?"
                  } 
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  {language === "fr" ? "Aucune sélection" : "No selection"}
                </SelectItem>
                {SLE_ACHIEVEMENTS.map((achievement) => (
                  <SelectItem key={achievement.value} value={achievement.value}>
                    {achievement.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {language === "fr" 
                ? "Si vous avez réussi un examen SLE grâce à ce coach, partagez-le !"
                : "If you passed an SLE exam with this coach's help, share it!"}
            </p>
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {language === "fr" ? "Annuler" : "Cancel"}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {existingReview 
              ? (language === "fr" ? "Mettre à jour" : "Update Review")
              : (language === "fr" ? "Soumettre" : "Submit Review")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
