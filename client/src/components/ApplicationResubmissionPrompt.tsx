import React, { useState } from "react";
import { AlertCircle, RefreshCw, CheckCircle } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface ApplicationResubmissionPromptProps {
  applicationId: number;
  rejectionReason: string;
  resubmissionCount: number;
  maxResubmissions?: number;
  onResubmit?: (applicationId: number) => void;
}

export function ApplicationResubmissionPrompt({
  applicationId,
  rejectionReason,
  resubmissionCount,
  maxResubmissions = 3,
  onResubmit,
}: ApplicationResubmissionPromptProps) {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [showDetails, setShowDetails] = useState(false);
  const canResubmit = resubmissionCount < maxResubmissions;

  return (
    <div className="bg-gradient-to-r from-[#FFF8F3] to-[#FFF8F3] border border-[#FFE4D6] rounded-lg p-6 my-6">
      <div className="flex items-start gap-4">
        <AlertCircle className="text-amber-600 flex-shrink-0 mt-1" size={24} />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-amber-900 mb-2">
            {isEn ? "Application Under Review" : "Candidature en cours d'examen"}
          </h3>

          <p className="text-amber-800 mb-4">
            {isEn
              ? "Your application was reviewed and we have some feedback. Please review the comments below and consider resubmitting with improvements."
              : "Votre candidature a été examinée et nous avons des commentaires. Veuillez examiner les commentaires ci-dessous et envisager de soumettre à nouveau avec des améliorations."}
          </p>

          {/* Rejection Reason Box */}
          <div className="bg-white border border-[#FFE4D6] rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="text-amber-600 font-semibold">
                {isEn ? "Feedback:" : "Commentaires :"}
              </div>
              <div className="text-gray-700 flex-1">{rejectionReason}</div>
            </div>
          </div>

          {/* Resubmission Counter */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">
                {isEn ? "Resubmissions:" : "Soumissions :"}
              </span>
              <div className="flex gap-1">
                {Array.from({ length: maxResubmissions }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < resubmissionCount ? "bg-[#C65A1E]" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {resubmissionCount}/{maxResubmissions}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {canResubmit ? (
              <>
                <button
                  onClick={() => onResubmit?.(applicationId)}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  <RefreshCw size={18} />
                  {isEn ? "Resubmit Application" : "Soumettre à nouveau"}
                </button>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="px-4 py-2 bg-white border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors font-medium"
                >
                  {isEn ? "View Details" : "Voir les détails"}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                <AlertCircle size={18} />
                <span>
                  {isEn
                    ? "Maximum resubmissions reached. Please contact support."
                    : "Nombre maximum de soumissions atteint. Veuillez contacter le support."}
                </span>
              </div>
            )}
          </div>

          {/* Tips Section */}
          {showDetails && (
            <div className="mt-4 p-4 bg-white border border-[#FFE4D6] rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">
                {isEn ? "Tips for Improvement:" : "Conseils d'amélioration :"}
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span>
                    {isEn
                      ? "Review the feedback carefully and address each point"
                      : "Examinez attentivement les commentaires et répondez à chaque point"}
                  </span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span>
                    {isEn
                      ? "Update your profile with additional qualifications or experience"
                      : "Mettez à jour votre profil avec des qualifications ou une expérience supplémentaires"}
                  </span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span>
                    {isEn
                      ? "Ensure all required fields are complete and accurate"
                      : "Assurez-vous que tous les champs obligatoires sont complets et exacts"}
                  </span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span>
                    {isEn
                      ? "Add supporting documents or certifications if applicable"
                      : "Ajoutez des documents justificatifs ou des certifications le cas échéant"}
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
