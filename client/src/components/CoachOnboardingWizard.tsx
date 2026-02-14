/**
 * Coach Onboarding Wizard
 * Multi-step registration form for new coaches
 * 
 * Steps:
 * 1. Personal Information
 * 2. Professional Profile
 * 3. Media Upload (Photo + Video)
 * 4. Stripe Connect Setup
 * 5. Terms & Conditions
 * 6. Review & Submit
 */

import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { User, Briefcase, Camera, CreditCard, FileText, CheckCircle, ArrowLeft, ArrowRight, Upload, Loader2 } from "lucide-react";

const STEPS = [
  { id: 1, title: "Informations personnelles", icon: User },
  { id: 2, title: "Profil professionnel", icon: Briefcase },
  { id: 3, title: "Photo & Vidéo", icon: Camera },
  { id: 4, title: "Configuration paiement", icon: CreditCard },
  { id: 5, title: "Termes & Conditions", icon: FileText },
  { id: 6, title: "Révision & Soumission", icon: CheckCircle },
];

interface CoachOnboardingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  province: string;
  bio: string;
  specializations: string[];
  languages: string[];
  yearsExperience: number;
  hourlyRate: number;
  profilePhoto: File | null;
  stripeConnected: boolean;
  acceptedTerms: boolean;
  acceptedCommission: boolean;
  acceptedPrivacy: boolean;
}

const initialFormData: CoachOnboardingData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  city: "",
  province: "",
  bio: "",
  specializations: [],
  languages: [],
  yearsExperience: 0,
  hourlyRate: 75,
  profilePhoto: null,
  stripeConnected: false,
  acceptedTerms: false,
  acceptedCommission: false,
  acceptedPrivacy: false,
};

const PROVINCES = ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Nova Scotia", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan"];

export default function CoachOnboardingWizard() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CoachOnboardingData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = (currentStep / STEPS.length) * 100;

  const updateFormData = (field: keyof CoachOnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const newErrors = { ...prev }; delete newErrors[field]; return newErrors; });
    }
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    switch (currentStep) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = "Prénom requis";
        if (!formData.lastName.trim()) newErrors.lastName = "Nom requis";
        if (!formData.email.trim()) newErrors.email = "Email requis";
        break;
      case 5:
        if (!formData.acceptedTerms) newErrors.acceptedTerms = "Vous devez accepter les termes";
        if (!formData.acceptedCommission) newErrors.acceptedCommission = "Vous devez accepter la commission";
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToNextStep = () => { if (validateStep() && currentStep < STEPS.length) setCurrentStep(prev => prev + 1); };
  const goToPreviousStep = () => { if (currentStep > 1) setCurrentStep(prev => prev - 1); };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setIsSubmitting(true);
    try {
      await fetch("/api/coach/onboarding/submit", { method: "POST", body: JSON.stringify(formData) });
      setLocation("/become-coach/success");
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Devenir Coach RusingÂcademy</h1>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-slate-600 mt-2">Étape {currentStep} sur {STEPS.length}</p>
        </div>
        
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {STEPS.map((step) => (
            <div key={step.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${currentStep === step.id ? "bg-amber-100 text-amber-800" : currentStep > step.id ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-500"}`}>
              <step.icon className="h-4 w-4" />
              <span className="text-sm whitespace-nowrap">{step.title}</span>
            </div>
          ))}
        </div>

        <Card className="border-2 border-slate-200">
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Prénom *</Label><Input value={formData.firstName} onChange={(e) => updateFormData("firstName", e.target.value)} /></div>
                <div><Label>Nom *</Label><Input value={formData.lastName} onChange={(e) => updateFormData("lastName", e.target.value)} /></div>
                <div><Label>Email *</Label><Input type="email" value={formData.email} onChange={(e) => updateFormData("email", e.target.value)} /></div>
                <div><Label>Téléphone</Label><Input value={formData.phone} onChange={(e) => updateFormData("phone", e.target.value)} /></div>
              </div>
            )}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div><Label>Bio professionnelle</Label><Textarea value={formData.bio} onChange={(e) => updateFormData("bio", e.target.value)} rows={4} /></div>
                <div><Label>Tarif horaire ($)</Label><Input type="number" value={formData.hourlyRate} onChange={(e) => updateFormData("hourlyRate", parseInt(e.target.value))} /></div>
              </div>
            )}
            {currentStep === 3 && (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <Upload className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600">Glissez votre photo de profil ici</p>
              </div>
            )}
            {currentStep === 4 && (
              <div className="text-center py-8">
                <CreditCard className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Connectez votre compte Stripe</h3>
                <p className="text-slate-600 mb-4">Pour recevoir vos paiements de coaching</p>
                <Button onClick={() => updateFormData("stripeConnected", true)} className="bg-[#E7F2F2] hover:bg-[#E7F2F2]">
                  {formData.stripeConnected ? "✓ Stripe Connecté" : "Connecter Stripe"}
                </Button>
              </div>
            )}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox checked={formData.acceptedTerms} onCheckedChange={(c) => updateFormData("acceptedTerms", c)} />
                  <Label>J'accepte les Termes et Conditions de RusingÂcademy</Label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox checked={formData.acceptedCommission} onCheckedChange={(c) => updateFormData("acceptedCommission", c)} />
                  <Label>J'accepte la commission de 20% sur les sessions de coaching</Label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox checked={formData.acceptedPrivacy} onCheckedChange={(c) => updateFormData("acceptedPrivacy", c)} />
                  <Label>J'accepte la Politique de Confidentialité</Label>
                </div>
              </div>
            )}
            {currentStep === 6 && (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Prêt à soumettre!</h3>
                <p className="text-slate-600">Votre candidature sera examinée sous 48-72 heures.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={goToPreviousStep} disabled={currentStep === 1}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Précédent
          </Button>
          {currentStep < STEPS.length ? (
            <Button onClick={goToNextStep} className="bg-amber-600 hover:bg-amber-700">
              Suivant <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi...</> : "Soumettre ma candidature"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
            }
