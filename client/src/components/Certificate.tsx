import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share2, Award } from "lucide-react";

interface CertificateProps {
  recipientName: string;
  courseTitle: string;
  certificateNumber: string;
  issuedAt: Date | string;
  language?: "en" | "fr";
  pdfUrl?: string | null;
  badgeImageUrl?: string | null;
  pathTitle?: string | null;
  totalLessons?: number | null;
  onDownload?: () => void;
  onShare?: () => void;
}

export default function Certificate({
  recipientName,
  courseTitle,
  certificateNumber,
  issuedAt,
  language = "en",
  pdfUrl,
  badgeImageUrl,
  pathTitle,
  totalLessons,
  onDownload,
  onShare,
}: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const isEn = language === "en";

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString(isEn ? "en-US" : "fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDownload = () => {
    if (pdfUrl) {
      // Download the real PDF from CDN
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `RusingAcademy-Certificate-${certificateNumber}.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (onDownload) {
      onDownload();
    } else {
      // Fallback: print dialog
      window.print();
    }
  };

  const content = {
    title: isEn ? "Certificate of Completion" : "Certificat de réussite",
    subtitle: isEn ? "This is to certify that" : "Ceci certifie que",
    hasCompleted: isEn
      ? "has successfully completed the course"
      : "a complété avec succès le cours",
    issuedOn: isEn ? "Issued on" : "Délivré le",
    certificateId: isEn ? "Certificate ID" : "Numéro de certificat",
    verifyAt: isEn ? "Verify at" : "Vérifier sur",
    signedBy: isEn ? "Signed by" : "Signé par",
    instructorTitle: isEn
      ? "Founder & Lead Instructor"
      : "Fondateur et instructeur principal",
    organizationTagline: isEn
      ? "Excellence in Bilingual Education"
      : "Excellence en éducation bilingue",
  };

  return (
    <div className="space-y-4">
      {/* Certificate Display */}
      <div
        ref={certificateRef}
        className="relative bg-white rounded-lg shadow-2xl overflow-hidden"
        style={{
          aspectRatio: "1.414/1", // A4 landscape ratio
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {/* Decorative Border */}
        <div className="absolute inset-4 border-4 border-teal-600 rounded-lg pointer-events-none" />
        <div className="absolute inset-6 border-2 border-teal-400 rounded-lg pointer-events-none" />

        {/* Corner Decorations */}
        <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-orange-500 rounded-tl-lg" />
        <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-orange-500 rounded-tr-lg" />
        <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-orange-500 rounded-bl-lg" />
        <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-orange-500 rounded-br-lg" />

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center px-12 py-8 text-center">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2 mb-3">
            <Award className="h-10 w-10 text-teal-600" />
            <div className="text-left">
              <h2 className="text-2xl font-bold text-teal-700">RusingAcademy</h2>
              <p className="text-xs text-gray-500">{content.organizationTagline}</p>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-serif font-bold text-gray-800 mb-4 tracking-wide">
            {content.title}
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-gray-600 mb-3">{content.subtitle}</p>

          {/* Recipient Name */}
          <p className="text-3xl font-bold text-teal-700 mb-3 font-serif">
            {recipientName}
          </p>

          {/* Completion Text */}
          <p className="text-lg text-gray-600 mb-2">{content.hasCompleted}</p>

          {/* Course Title */}
          <p className="text-2xl font-semibold text-gray-800 mb-2 max-w-lg">
            {courseTitle}
          </p>

          {/* Path info */}
          {pathTitle && (
            <p className="text-sm text-gray-500 italic mb-1">
              {isEn
                ? `Part of the ${pathTitle} learning path`
                : `Fait partie du parcours ${pathTitle}`}
            </p>
          )}

          {/* Lessons count */}
          {totalLessons && (
            <p className="text-xs text-gray-400 mb-4">
              {isEn
                ? `${totalLessons} lessons completed`
                : `${totalLessons} leçons complétées`}
            </p>
          )}

          {/* Badge */}
          {badgeImageUrl && (
            <div className="mb-4">
              <img
                src={badgeImageUrl}
                alt="Path Badge"
                className="w-16 h-16 object-contain mx-auto"
              />
            </div>
          )}

          {/* Date and Signature Row */}
          <div className="flex items-end justify-between w-full max-w-2xl mt-auto">
            {/* Date */}
            <div className="text-left">
              <p className="text-sm text-gray-500">{content.issuedOn}</p>
              <p className="text-lg font-medium text-gray-700">
                {formatDate(issuedAt)}
              </p>
            </div>

            {/* Signature */}
            <div className="text-center">
              <div className="w-48 border-b-2 border-gray-400 mb-2">
                <p className="text-2xl font-script text-gray-700 italic">
                  Prof. Steven Rusinga
                </p>
              </div>
              <p className="text-sm text-gray-500">{content.signedBy}</p>
              <p className="text-xs text-gray-400">{content.instructorTitle}</p>
            </div>
          </div>

          {/* Certificate ID */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center">
            <p className="text-xs text-gray-400">
              {content.certificateId}: {certificateNumber}
            </p>
            <p className="text-xs text-gray-400">
              {content.verifyAt}: rusingacademy.com/verify/{certificateNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button onClick={handleDownload} className="gap-2">
          <Download className="h-4 w-4" />
          {isEn ? "Download PDF" : "Télécharger PDF"}
        </Button>
        <Button variant="outline" onClick={onShare} className="gap-2">
          <Share2 className="h-4 w-4" />
          {isEn ? "Share" : "Partager"}
        </Button>
      </div>
    </div>
  );
}
