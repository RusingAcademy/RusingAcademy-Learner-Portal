import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";

type EcosystemSource = "lingueefy" | "rusingacademy" | "barholex" | "ecosystem_hub";
type FormType = "contact" | "proposal" | "project" | "inquiry" | "coaching" | "training";

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  message?: string;
  interests?: string[];
  budget?: string;
  timeline?: string;
  preferredLanguage?: "en" | "fr";
}

interface UseUnifiedContactFormOptions {
  source: EcosystemSource;
  formType: FormType;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useUnifiedContactForm(options: UseUnifiedContactFormOptions) {
  const { source, formType, onSuccess, onError } = options;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use TRPC mutation if available, otherwise fallback to fetch
  const submitForm = useCallback(async (data: ContactFormData) => {
    setIsSubmitting(true);
    setError(null);
    setIsSuccess(false);

    try {
      // Get UTM parameters from URL
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get("utm_source") || undefined;
      const utmMedium = urlParams.get("utm_medium") || undefined;
      const utmCampaign = urlParams.get("utm_campaign") || undefined;

      // Determine lead type based on form data
      let leadType: "individual" | "organization" | "government" | "enterprise" = "individual";
      if (data.company) {
        if (data.company.toLowerCase().includes("government") || 
            data.company.toLowerCase().includes("canada") ||
            data.company.toLowerCase().includes("ministry") ||
            data.company.toLowerCase().includes("department")) {
          leadType = "government";
        } else if (data.company.toLowerCase().includes("inc") || 
                   data.company.toLowerCase().includes("ltd") ||
                   data.company.toLowerCase().includes("corp")) {
          leadType = "enterprise";
        } else {
          leadType = "organization";
        }
      }

      // Submit to CRM API
      const response = await fetch("/api/crm/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          source,
          formType,
          leadType,
          utmSource,
          utmMedium,
          utmCampaign,
          referrer: document.referrer || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      setIsSuccess(true);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  }, [source, formType, onSuccess, onError]);

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setIsSuccess(false);
    setError(null);
  }, []);

  return {
    submitForm,
    isSubmitting,
    isSuccess,
    error,
    reset,
  };
}

// Pre-configured hooks for each platform
export function useLingueefyContactForm(formType: FormType = "contact") {
  return useUnifiedContactForm({ source: "lingueefy", formType });
}

export function useRusingAcademyContactForm(formType: FormType = "proposal") {
  return useUnifiedContactForm({ source: "rusingacademy", formType });
}

export function useBarholexContactForm(formType: FormType = "project") {
  return useUnifiedContactForm({ source: "barholex", formType });
}

export function useEcosystemHubContactForm(formType: FormType = "inquiry") {
  return useUnifiedContactForm({ source: "ecosystem_hub", formType });
}
