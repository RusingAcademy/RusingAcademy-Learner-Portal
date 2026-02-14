import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Download, ExternalLink, Calendar, BookOpen } from "lucide-react";
import { Link } from "wouter";

export default function MyCertificates() {
  const { user } = useAuth();
  const { data: certificates, isLoading } = trpc.certificates.getMyCertificates.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Certificates</h1>
          <p className="text-muted-foreground mt-1">Your earned certificates of completion</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const certs = certificates || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Certificates</h1>
        <p className="text-muted-foreground mt-1">
          {certs.length > 0
            ? `You have earned ${certs.length} certificate${certs.length > 1 ? "s" : ""}`
            : "Complete courses to earn certificates of completion"}
        </p>
      </div>

      {certs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Award className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Certificates Yet</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Complete all lessons in a course to automatically earn a certificate of completion.
              Your certificates will appear here.
            </p>
            <Link href="/paths">
              <Button>
                <BookOpen className="w-4 h-4 mr-2" />
                Browse Courses
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certs.map((cert) => (
            <Card key={cert.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{cert.courseName}</CardTitle>
                      {cert.course?.category && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {cert.course.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Issued{" "}
                    {cert.completionDate
                      ? new Date(cert.completionDate).toLocaleDateString("en-CA", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  ID: {cert.certificateNumber}
                </div>
                <div className="flex gap-2 pt-2">
                  <Link href={`/certificates/${cert.certificateNumber}`}>
                    <Button size="sm" variant="outline" className="flex-1">
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                      View
                    </Button>
                  </Link>
                  {cert.pdfUrl && (
                    <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="flex-1">
                        <Download className="w-3.5 h-3.5 mr-1.5" />
                        Download PDF
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
