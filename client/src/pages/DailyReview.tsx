import { useState, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DailyReview() {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);

  const dueCards = trpc.dailyReview.getDueCards.useQuery();
  const updateCard = trpc.flashcards.reviewCard.useMutation();

  const cards = dueCards.data || [];
  const currentCard = cards[currentIndex];

  const handleRate = useCallback(async (quality: number) => {
    if (!currentCard) return;
    try {
      await updateCard.mutateAsync({ cardId: currentCard.id, quality });
      setReviewed(prev => prev + 1);
      setShowAnswer(false);
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setSessionComplete(true);
      }
    } catch {
      toast.error("Failed to save review");
    }
  }, [currentCard, currentIndex, cards.length]);

  const ratingButtons = [
    { quality: 0, label: "Again", color: "bg-red-500 hover:bg-red-600 text-white", desc: "Forgot completely" },
    { quality: 2, label: "Hard", color: "bg-orange-500 hover:bg-orange-600 text-white", desc: "Recalled with difficulty" },
    { quality: 3, label: "Good", color: "bg-blue-500 hover:bg-blue-600 text-white", desc: "Recalled correctly" },
    { quality: 5, label: "Easy", color: "bg-green-500 hover:bg-green-600 text-white", desc: "Effortless recall" },
  ];

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Daily Review</h1>
        <p className="text-muted-foreground mt-1">
          Spaced repetition — review flashcards due today to strengthen your memory
        </p>
      </div>

      {dueCards.isLoading ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-muted-foreground mt-4">Loading your review queue...</p>
          </CardContent>
        </Card>
      ) : sessionComplete ? (
        <Card>
          <CardContent className="py-16 text-center space-y-6">
            <div className="text-6xl">🎉</div>
            <h2 className="text-2xl font-bold">Session Complete!</h2>
            <p className="text-lg text-muted-foreground">
              You reviewed {reviewed} card{reviewed !== 1 ? "s" : ""} today. Great work!
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => {
                setCurrentIndex(0);
                setReviewed(0);
                setSessionComplete(false);
                dueCards.refetch();
              }}>
                Review Again
              </Button>
              <Button onClick={() => window.location.href = "/flashcards"}>
                Go to Flashcards
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : !cards.length ? (
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <div className="text-5xl">✅</div>
            <h2 className="text-2xl font-bold">All caught up!</h2>
            <p className="text-muted-foreground">
              No flashcards are due for review right now. Come back later or add new cards.
            </p>
            <Button variant="outline" onClick={() => window.location.href = "/flashcards"}>
              Manage Flashcards
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{reviewed} reviewed</span>
            <span>{cards.length - currentIndex} remaining</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(currentIndex / cards.length) * 100}%` }}
            />
          </div>

          {/* Card */}
          {currentCard && (
            <Card className="min-h-[300px]">
              <CardContent className="pt-8 pb-6 flex flex-col items-center justify-center min-h-[300px]">
                {!showAnswer ? (
                  <div className="text-center space-y-6 w-full">
                    <Badge variant="outline" className="mb-4">Front</Badge>
                    <h2 className="text-2xl font-bold">{currentCard.front}</h2>
                    {currentCard.hint && (
                      <p className="text-sm text-muted-foreground italic">Hint: {currentCard.hint}</p>
                    )}
                    <Button size="lg" className="mt-8" onClick={() => setShowAnswer(true)}>
                      Show Answer
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-6 w-full">
                    <Badge variant="outline" className="mb-2">Front</Badge>
                    <h3 className="text-lg text-muted-foreground">{currentCard.front}</h3>
                    <hr className="my-4" />
                    <Badge className="mb-2">Back</Badge>
                    <h2 className="text-2xl font-bold text-primary">{currentCard.back}</h2>

                    <div className="grid grid-cols-4 gap-2 pt-6">
                      {ratingButtons.map(btn => (
                        <button
                          key={btn.quality}
                          onClick={() => handleRate(btn.quality)}
                          className={`p-3 rounded-lg transition-all ${btn.color}`}
                          disabled={updateCard.isPending}
                        >
                          <div className="font-semibold text-sm">{btn.label}</div>
                          <div className="text-xs opacity-80 mt-0.5">{btn.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Queue indicator */}
          <div className="flex gap-1 flex-wrap justify-center">
            {cards.slice(0, 20).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i < currentIndex ? "bg-primary" : i === currentIndex ? "bg-primary ring-2 ring-primary/30" : "bg-muted"
                }`}
              />
            ))}
            {cards.length > 20 && (
              <span className="text-xs text-muted-foreground ml-1">+{cards.length - 20} more</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
