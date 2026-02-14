import { useParams } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import Footer from "@/components/Footer";
import Certificate from "@/components/Certificate";
import { trpc } from "@/lib/trpc";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function CertificateViewer() {
  const params = useParams<{ certificateNumber: string }>();
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const isEn = language === "en";

  const { data, isLoading, error } = trpc.certificates.getCertificate.useQuery(
    { certificateNumber: params.certificateNumber },
    { enabled: !!params.certificateNumber && isAuthenticated }
  );

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: data?.certificate.courseTitle || "Certificate",
          text: isEn 
            ? `Check out my certificate from RusingAcademy!`
            : `Découvrez mon certificat de RusingAcademy !`,
          url,
        });
      } catch (err) {
        // User cancelled or error
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url);
      alert(isEn ? "Link copied to clipboard!" : "Lien copié dans le presse-papiers !");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                {isEn ? "Certificate Not Found" : "Certificat non trouvé"}
              </h2>
              <p className="text-muted-foreground mb-6">
                {isEn 
                  ? "The certificate you're looking for doesn't exist or you don't have permission to view it."
                  : "Le certificat que vous recherchez n'existe pas ou vous n'avez pas la permission de le voir."}
              </p>
              <Button asChild>
                <Link href="/app/my-courses">
                  {isEn ? "Back to My Learning" : "Retour à Mon apprentissage"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      
      
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isEn ? "Your Certificate" : "Votre certificat"}
          </h1>
          <p className="text-muted-foreground">
            {isEn 
              ? "Congratulations on completing your course!"
              : "Félicitations pour avoir terminé votre cours !"}
          </p>
        </div>

        <Certificate
          recipientName={data.certificate.recipientName}
          courseTitle={data.certificate.courseTitle}
          certificateNumber={data.certificate.certificateNumber}
          issuedAt={data.certificate.issuedAt}
          language={language as "en" | "fr"}
          pdfUrl={data.certificate.pdfUrl}
          totalLessons={data.course?.totalLessons}
          onShare={handleShare}
        />

        {/* Course Info */}
        {data.course && (
          <Card className="mt-8 max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">
                {isEn ? "Course Details" : "Détails du cours"}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">{isEn ? "Course" : "Cours"}</p>
                  <p className="font-medium">{data.course.title}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{isEn ? "Category" : "Catégorie"}</p>
                  <p className="font-medium capitalize">{data.course.category?.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{isEn ? "Level" : "Niveau"}</p>
                  <p className="font-medium capitalize">{data.course.level}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{isEn ? "Lessons" : "Leçons"}</p>
                  <p className="font-medium">{data.course.totalLessons}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />

      {/* Print Styles */}
      <style>{`
        @media print {
          header, footer, button, .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
          main {
            padding: 0 !important;
            max-width: none !important;
          }
        }
      `}</style>
    </div>
  );
}
