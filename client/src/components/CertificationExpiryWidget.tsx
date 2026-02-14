import React from "react";
import { Award, Calendar, AlertTriangle, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Certification {
  id: string;
  name: string;
  level: string;
  obtainedDate: Date;
  expiryDate: Date;
  type: "reading" | "writing" | "oral";
}

interface CertificationExpiryWidgetProps {
  certifications: Certification[];
  language?: "en" | "fr";
  onRenewClick?: (certId: string) => void;
  className?: string;
}

export function CertificationExpiryWidget({
  certifications,
  language = "en",
  onRenewClick,
  className,
}: CertificationExpiryWidgetProps) {
  const today = new Date();

  const labels = {
    en: {
      title: "Certification Status",
      subtitle: "SLE certification expiry tracking",
      noCertifications: "No certifications yet",
      startJourney: "Start your certification journey",
      expires: "Expires",
      expired: "Expired",
      expiresSoon: "Expires Soon",
      valid: "Valid",
      daysLeft: "days left",
      renew: "Renew",
      reading: "Reading",
      writing: "Writing",
      oral: "Oral",
      obtained: "Obtained",
      validFor: "Valid for 5 years",
    },
    fr: {
      title: "Statut des Certifications",
      subtitle: "Suivi d'expiration des certifications ELS",
      noCertifications: "Aucune certification",
      startJourney: "Commencez votre parcours de certification",
      expires: "Expire le",
      expired: "Expiré",
      expiresSoon: "Expire Bientôt",
      valid: "Valide",
      daysLeft: "jours restants",
      renew: "Renouveler",
      reading: "Compréhension écrite",
      writing: "Expression écrite",
      oral: "Interaction orale",
      obtained: "Obtenu le",
      validFor: "Valide pour 5 ans",
    },
  };

  const l = labels[language];

  const typeLabels = {
    reading: l.reading,
    writing: l.writing,
    oral: l.oral,
  };

  const typeColors = {
    reading: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    writing: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    oral: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  };

  const getExpiryStatus = (expiryDate: Date) => {
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: "expired", color: "text-red-600 bg-red-50 dark:bg-red-900/20", days: daysUntilExpiry };
    } else if (daysUntilExpiry <= 90) {
      return { status: "expiresSoon", color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20", days: daysUntilExpiry };
    } else {
      return { status: "valid", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20", days: daysUntilExpiry };
    }
  };

  // Sort certifications by expiry date (soonest first)
  const sortedCertifications = [...certifications].sort(
    (a, b) => a.expiryDate.getTime() - b.expiryDate.getTime()
  );

  // Count by status
  const statusCounts = certifications.reduce(
    (acc, cert) => {
      const { status } = getExpiryStatus(cert.expiryDate);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className={cn("rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Award className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{l.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{l.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Status Summary */}
      {certifications.length > 0 && (
        <div className="flex gap-3 mb-6">
          {statusCounts.valid && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                {statusCounts.valid} {l.valid}
              </span>
            </div>
          )}
          {statusCounts.expiresSoon && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                {statusCounts.expiresSoon} {l.expiresSoon}
              </span>
            </div>
          )}
          {statusCounts.expired && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-700 dark:text-red-400">
                {statusCounts.expired} {l.expired}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Certifications List */}
      {certifications.length === 0 ? (
        <div className="text-center py-8">
          <Award className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 mb-1">{l.noCertifications}</p>
          <p className="text-sm text-slate-400 dark:text-slate-500">{l.startJourney}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedCertifications.map((cert) => {
            const { status, color, days } = getExpiryStatus(cert.expiryDate);
            
            return (
              <div
                key={cert.id}
                className={cn(
                  "p-4 rounded-lg border transition-all duration-200",
                  status === "expired" 
                    ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                    : status === "expiresSoon"
                    ? "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={cn("px-2 py-1 rounded text-xs font-medium", typeColors[cert.type])}>
                      {typeLabels[cert.type]}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {cert.name} - {cert.level}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {l.obtained}: {cert.obtainedDate.toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={cn("text-sm font-medium", 
                        status === "expired" ? "text-red-600" : 
                        status === "expiresSoon" ? "text-amber-600" : 
                        "text-slate-600 dark:text-slate-400"
                      )}>
                        {status === "expired" ? l.expired : `${l.expires} ${cert.expiryDate.toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA")}`}
                      </p>
                      {status !== "expired" && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {days} {l.daysLeft}
                        </p>
                      )}
                    </div>
                    {(status === "expired" || status === "expiresSoon") && onRenewClick && (
                      <Button
                        size="sm"
                        variant={status === "expired" ? "destructive" : "outline"}
                        onClick={() => onRenewClick(cert.id)}
                        className="flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        {l.renew}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          {l.validFor}
        </p>
      </div>
    </div>
  );
}

export default CertificationExpiryWidget;
