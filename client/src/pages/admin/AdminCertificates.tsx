import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, ArrowLeft, Construction } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminCertificates() {
  const [, navigate] = useLocation();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Award className="h-8 w-8 text-teal-600" />
        <div>
          <h1 className="text-2xl font-bold">Certificates</h1>
          <p className="text-muted-foreground">Manage and track learner certificates</p>
        </div>
      </div>

      <Card>
        <CardContent className="py-16 text-center space-y-4">
          <Construction className="h-16 w-16 mx-auto text-amber-500 opacity-60" />
          <h2 className="text-xl font-semibold">Under Construction</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            The Certificate management panel is currently being built. 
            You will be able to view issued certificates, customize templates, 
            and manage verification settings from this page.
          </p>
          <p className="text-sm text-muted-foreground">
            Learners can already generate certificates from their dashboard upon course completion.
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
