import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ArrowLeft, Construction } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminReviews() {
  const [, navigate] = useLocation();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Star className="h-8 w-8 text-amber-500" />
        <div>
          <h1 className="text-2xl font-bold">Reviews & Ratings</h1>
          <p className="text-muted-foreground">Manage course and coach reviews from learners</p>
        </div>
      </div>

      <Card>
        <CardContent className="py-16 text-center space-y-4">
          <Construction className="h-16 w-16 mx-auto text-amber-500 opacity-60" />
          <h2 className="text-xl font-semibold">Under Construction</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            The Reviews & Ratings management panel is currently being built. 
            You will be able to moderate course reviews, respond to feedback, 
            and manage ratings from this page.
          </p>
          <div className="flex justify-center gap-3 pt-4">
            <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
