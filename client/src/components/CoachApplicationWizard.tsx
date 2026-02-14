import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  User,
  Briefcase,
  Languages,
  Target,
  Calendar,
  FileText,
  Camera,
  FileCheck,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Upload,
  Play,
  X,
  AlertCircle,
  Loader2,
  Globe,
  Clock,
  DollarSign,
  GraduationCap,
  Award,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  province: string;
  country: string;
  timezone: string;
}

interface ProfessionalBackground {
  highestEducation: string;
  fieldOfStudy: string;
  institution: string;
  certifications: string[];
  yearsTeaching: number;
  currentOccupation: string;
  linkedinUrl: string;
}

interface LanguageQualifications {
  nativeLanguage: string;
  sleOralLevel: string;
  sleWrittenLevel: string;
  sleReadingLevel: string;
  otherLanguages: string[];
  teachingExperience: string;
}

interface Specializations {
  oralA: boolean;
  oralB: boolean;
  oralC: boolean;
  writtenA: boolean;
  writtenB: boolean;
  writtenC: boolean;
  readingComprehension: boolean;
  examPrep: boolean;
  businessFrench: boolean;
  businessEnglish: boolean;
  grammarFocus: boolean;
  vocabularyBuilding: boolean;
  conversationPractice: boolean;
  pronunciationCoaching: boolean;
}

interface AvailabilityPricing {
  weeklyHours: number;
  preferredDays: string[];
  preferredTimes: string[];
  hourlyRate: number;
  trialRate: number;
  packageDiscount: number;
}

interface ProfileContent {
  headline: string;
  headlineFr: string;
  bio: string;
  bioFr: string;
  teachingPhilosophy: string;
  uniqueApproach: string;
  successStory: string;
}

interface MediaUploads {
  photoUrl: string;
  photoFile: File | null;
  videoUrl: string;
  videoFile: File | null;
  videoType: "upload" | "youtube";
}

interface LegalConsents {
  termsOfService: boolean;
  privacyPolicy: boolean;
  backgroundCheck: boolean;
  codeOfConduct: boolean;
  commissionTerms: boolean;
  marketingConsent: boolean;
  digitalSignature: string;
  signatureDate: string;
}

interface ApplicationData {
  personalInfo: PersonalInfo;
  professionalBackground: ProfessionalBackground;
  languageQualifications: LanguageQualifications;
  specializations: Specializations;
  availabilityPricing: AvailabilityPricing;
  profileContent: ProfileContent;
  mediaUploads: MediaUploads;
  legalConsents: LegalConsents;
}

const STEPS = [
  { id: 1, title: "Personal Info", titleFr: "Infos personnelles", icon: User },
  { id: 2, title: "Professional Background", titleFr: "Parcours professionnel", icon: Briefcase },
  { id: 3, title: "Language Qualifications", titleFr: "Qualifications linguistiques", icon: Languages },
  { id: 4, title: "Specializations", titleFr: "Spécialisations", icon: Target },
  { id: 5, title: "Availability & Pricing", titleFr: "Disponibilité et tarifs", icon: Calendar },
  { id: 6, title: "Profile Content", titleFr: "Contenu du profil", icon: FileText },
  { id: 7, title: "Photo & Video", titleFr: "Photo et vidéo", icon: Camera },
  { id: 8, title: "Legal & Consent", titleFr: "Légal et consentement", icon: FileCheck },
];

const PROVINCES = [
  "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador",
  "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island",
  "Quebec", "Saskatchewan", "Yukon"
];

const TIMEZONES = [
  { value: "America/St_Johns", label: "Newfoundland (NST)" },
  { value: "America/Halifax", label: "Atlantic (AST)" },
  { value: "America/Toronto", label: "Eastern (EST)" },
  { value: "America/Winnipeg", label: "Central (CST)" },
  { value: "America/Edmonton", label: "Mountain (MST)" },
  { value: "America/Vancouver", label: "Pacific (PST)" },
];

const EDUCATION_LEVELS = [
  { value: "high_school", label: "High School Diploma", labelFr: "Diplôme d'études secondaires" },
  { value: "college", label: "College Diploma", labelFr: "Diplôme collégial" },
  { value: "bachelors", label: "Bachelor's Degree", labelFr: "Baccalauréat" },
  { value: "masters", label: "Master's Degree", labelFr: "Maîtrise" },
  { value: "doctorate", label: "Doctorate", labelFr: "Doctorat" },
  { value: "professional", label: "Professional Degree", labelFr: "Diplôme professionnel" },
];

interface CoachApplicationWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function CoachApplicationWizard({ onComplete, onCancel }: CoachApplicationWizardProps) {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Form data state
  const [data, setData] = useState<ApplicationData>({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      city: "",
      province: "",
      country: "Canada",
      timezone: "America/Toronto",
    },
    professionalBackground: {
      highestEducation: "",
      fieldOfStudy: "",
      institution: "",
      certifications: [],
      yearsTeaching: 0,
      currentOccupation: "",
      linkedinUrl: "",
    },
    languageQualifications: {
      nativeLanguage: "",
      sleOralLevel: "",
      sleWrittenLevel: "",
      sleReadingLevel: "",
      otherLanguages: [],
      teachingExperience: "",
    },
    specializations: {
      oralA: false,
      oralB: false,
      oralC: false,
      writtenA: false,
      writtenB: false,
      writtenC: false,
      readingComprehension: false,
      examPrep: false,
      businessFrench: false,
      businessEnglish: false,
      grammarFocus: false,
      vocabularyBuilding: false,
      conversationPractice: false,
      pronunciationCoaching: false,
    },
    availabilityPricing: {
      weeklyHours: 10,
      preferredDays: [],
      preferredTimes: [],
      hourlyRate: 50,
      trialRate: 25,
      packageDiscount: 10,
    },
    profileContent: {
      headline: "",
      headlineFr: "",
      bio: "",
      bioFr: "",
      teachingPhilosophy: "",
      uniqueApproach: "",
      successStory: "",
    },
    mediaUploads: {
      photoUrl: "",
      photoFile: null,
      videoUrl: "",
      videoFile: null,
      videoType: "youtube",
    },
    legalConsents: {
      termsOfService: false,
      privacyPolicy: false,
      backgroundCheck: false,
      codeOfConduct: false,
      commissionTerms: false,
      marketingConsent: false,
      digitalSignature: "",
      signatureDate: "",
    },
  });

  const [certificationInput, setCertificationInput] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const submitMutation = trpc.coach.submitApplication.useMutation();

  const progress = (currentStep / STEPS.length) * 100;

  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    setData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const updateProfessionalBackground = (field: keyof ProfessionalBackground, value: any) => {
    setData(prev => ({
      ...prev,
      professionalBackground: { ...prev.professionalBackground, [field]: value },
    }));
  };

  const updateLanguageQualifications = (field: keyof LanguageQualifications, value: any) => {
    setData(prev => ({
      ...prev,
      languageQualifications: { ...prev.languageQualifications, [field]: value },
    }));
  };

  const updateSpecializations = (field: keyof Specializations, value: boolean) => {
    setData(prev => ({
      ...prev,
      specializations: { ...prev.specializations, [field]: value },
    }));
  };

  const updateAvailabilityPricing = (field: keyof AvailabilityPricing, value: any) => {
    setData(prev => ({
      ...prev,
      availabilityPricing: { ...prev.availabilityPricing, [field]: value },
    }));
  };

  const updateProfileContent = (field: keyof ProfileContent, value: string) => {
    setData(prev => ({
      ...prev,
      profileContent: { ...prev.profileContent, [field]: value },
    }));
  };

  const updateMediaUploads = (field: keyof MediaUploads, value: any) => {
    setData(prev => ({
      ...prev,
      mediaUploads: { ...prev.mediaUploads, [field]: value },
    }));
  };

  const updateLegalConsents = (field: keyof LegalConsents, value: any) => {
    setData(prev => ({
      ...prev,
      legalConsents: { ...prev.legalConsents, [field]: value },
    }));
  };

  const addCertification = () => {
    if (certificationInput.trim()) {
      updateProfessionalBackground("certifications", [
        ...data.professionalBackground.certifications,
        certificationInput.trim(),
      ]);
      setCertificationInput("");
    }
  };

  const removeCertification = (index: number) => {
    updateProfessionalBackground(
      "certifications",
      data.professionalBackground.certifications.filter((_, i) => i !== index)
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(isEn ? "Photo must be less than 5MB" : "La photo doit faire moins de 5 Mo");
        return;
      }
      updateMediaUploads("photoFile", file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast.error(isEn ? "Video must be less than 100MB" : "La vidéo doit faire moins de 100 Mo");
        return;
      }
      updateMediaUploads("videoFile", file);
      updateMediaUploads("videoType", "upload");
    }
  };

  const toggleDay = (day: string) => {
    const days = data.availabilityPricing.preferredDays;
    if (days.includes(day)) {
      updateAvailabilityPricing("preferredDays", days.filter(d => d !== day));
    } else {
      updateAvailabilityPricing("preferredDays", [...days, day]);
    }
  };

  const toggleTime = (time: string) => {
    const times = data.availabilityPricing.preferredTimes;
    if (times.includes(time)) {
      updateAvailabilityPricing("preferredTimes", times.filter(t => t !== time));
    } else {
      updateAvailabilityPricing("preferredTimes", [...times, time]);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          data.personalInfo.firstName &&
          data.personalInfo.lastName &&
          data.personalInfo.email &&
          data.personalInfo.phone &&
          data.personalInfo.city &&
          data.personalInfo.province
        );
      case 2:
        return !!(
          data.professionalBackground.highestEducation &&
          data.professionalBackground.yearsTeaching >= 0
        );
      case 3:
        return !!(
          data.languageQualifications.nativeLanguage &&
          data.languageQualifications.sleOralLevel
        );
      case 4:
        return Object.values(data.specializations).some(v => v);
      case 5:
        return !!(
          data.availabilityPricing.weeklyHours > 0 &&
          data.availabilityPricing.hourlyRate > 0 &&
          data.availabilityPricing.preferredDays.length > 0
        );
      case 6:
        return !!(
          data.profileContent.headline &&
          data.profileContent.bio &&
          data.profileContent.bio.length >= 100
        );
      case 7:
        return !!(photoPreview || data.mediaUploads.photoUrl);
      case 8:
        return !!(
          data.legalConsents.termsOfService &&
          data.legalConsents.privacyPolicy &&
          data.legalConsents.backgroundCheck &&
          data.legalConsents.codeOfConduct &&
          data.legalConsents.commissionTerms &&
          data.legalConsents.digitalSignature
        );
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      toast.error(isEn ? "Please complete all required fields" : "Veuillez remplir tous les champs obligatoires");
      return;
    }
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(8)) {
      toast.error(isEn ? "Please complete all required consents" : "Veuillez compléter tous les consentements requis");
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit all application data to the backend
      await submitMutation.mutateAsync({
        // Personal Info
        firstName: data.personalInfo.firstName,
        lastName: data.personalInfo.lastName,
        phone: data.personalInfo.phone,
        city: data.personalInfo.city,
        province: data.personalInfo.province,
        // Professional Background
        education: data.professionalBackground.education,
        certifications: data.professionalBackground.certifications.join(", "),
        yearsTeaching: data.professionalBackground.yearsTeaching,
        // Language Qualifications
        nativeLanguage: data.languageQualifications.nativeLanguage,
        teachingLanguage: data.languageQualifications.teachingLanguage,
        sleOralLevel: data.languageQualifications.oralProficiency,
        sleWrittenLevel: data.languageQualifications.writtenExpression,
        sleReadingLevel: data.languageQualifications.readingComprehension,
        // Profile Content
        headline: data.profileContent.headline,
        headlineFr: data.profileContent.headlineFr || undefined,
        bio: data.profileContent.bio,
        bioFr: data.profileContent.bioFr || undefined,
        teachingPhilosophy: data.profileContent.teachingPhilosophy,
        uniqueValue: data.profileContent.uniqueApproach,
        // Pricing & Availability
        languages: data.languageQualifications.nativeLanguage === "french" ? "french" : 
                   data.languageQualifications.nativeLanguage === "english" ? "english" : "both",
        specializations: data.specializations as unknown as Record<string, boolean>,
        yearsExperience: data.professionalBackground.yearsTeaching,
        credentials: data.professionalBackground.certifications.join(", "),
        hourlyRate: data.availabilityPricing.hourlyRate * 100, // Convert to cents
        trialRate: data.availabilityPricing.trialRate * 100,
        weeklyHours: data.availabilityPricing.weeklyHours,
        availableDays: data.availabilityPricing.availableDays,
        availableTimeSlots: data.availabilityPricing.availableTimeSlots,
        // Media
        photoUrl: data.mediaUploads.photoUrl || undefined,
        videoUrl: data.mediaUploads.videoUrl || undefined,
        // Legal Consents
        termsAccepted: data.legalConsents.termsOfService,
        privacyAccepted: data.legalConsents.privacyPolicy,
        backgroundCheckConsent: data.legalConsents.backgroundCheck,
        codeOfConductAccepted: data.legalConsents.codeOfConduct,
        commissionAccepted: data.legalConsents.commissionTerms,
        digitalSignature: data.legalConsents.digitalSignature,
      });

      toast.success(isEn ? "Application submitted successfully! Check your email for confirmation." : "Candidature soumise avec succès! Vérifiez votre courriel pour la confirmation.");
      onComplete();
    } catch (error: any) {
      toast.error(error.message || (isEn ? "Failed to submit application" : "Échec de la soumission"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInfoStep();
      case 2:
        return renderProfessionalBackgroundStep();
      case 3:
        return renderLanguageQualificationsStep();
      case 4:
        return renderSpecializationsStep();
      case 5:
        return renderAvailabilityPricingStep();
      case 6:
        return renderProfileContentStep();
      case 7:
        return renderMediaUploadsStep();
      case 8:
        return renderLegalConsentsStep();
      default:
        return null;
    }
  };

  // Step 1: Personal Information
  const renderPersonalInfoStep = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            {isEn ? "First Name" : "Prénom"} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="firstName"
            value={data.personalInfo.firstName}
            onChange={(e) => updatePersonalInfo("firstName", e.target.value)}
            placeholder={isEn ? "John" : "Jean"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">
            {isEn ? "Last Name" : "Nom"} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="lastName"
            value={data.personalInfo.lastName}
            onChange={(e) => updatePersonalInfo("lastName", e.target.value)}
            placeholder={isEn ? "Doe" : "Dupont"}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">
            {isEn ? "Email Address" : "Adresse courriel"} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={data.personalInfo.email}
            onChange={(e) => updatePersonalInfo("email", e.target.value)}
            placeholder="john.doe@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">
            {isEn ? "Phone Number" : "Numéro de téléphone"} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={data.personalInfo.phone}
            onChange={(e) => updatePersonalInfo("phone", e.target.value)}
            placeholder="+1 (613) 555-0123"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">
            {isEn ? "City" : "Ville"} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="city"
            value={data.personalInfo.city}
            onChange={(e) => updatePersonalInfo("city", e.target.value)}
            placeholder={isEn ? "Ottawa" : "Ottawa"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="province">
            {isEn ? "Province/Territory" : "Province/Territoire"} <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.personalInfo.province}
            onValueChange={(value) => updatePersonalInfo("province", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={isEn ? "Select province" : "Sélectionner la province"} />
            </SelectTrigger>
            <SelectContent>
              {PROVINCES.map((province) => (
                <SelectItem key={province} value={province}>
                  {province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone">
          {isEn ? "Timezone" : "Fuseau horaire"} <span className="text-red-500">*</span>
        </Label>
        <Select
          value={data.personalInfo.timezone}
          onValueChange={(value) => updatePersonalInfo("timezone", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  // Step 2: Professional Background
  const renderProfessionalBackgroundStep = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="education">
            {isEn ? "Highest Education Level" : "Plus haut niveau d'éducation"} <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.professionalBackground.highestEducation}
            onValueChange={(value) => updateProfessionalBackground("highestEducation", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={isEn ? "Select education level" : "Sélectionner le niveau"} />
            </SelectTrigger>
            <SelectContent>
              {EDUCATION_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {isEn ? level.label : level.labelFr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="fieldOfStudy">
            {isEn ? "Field of Study" : "Domaine d'études"}
          </Label>
          <Input
            id="fieldOfStudy"
            value={data.professionalBackground.fieldOfStudy}
            onChange={(e) => updateProfessionalBackground("fieldOfStudy", e.target.value)}
            placeholder={isEn ? "e.g., French Literature, Education" : "ex., Littérature française, Éducation"}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="institution">
          {isEn ? "Institution" : "Établissement"}
        </Label>
        <Input
          id="institution"
          value={data.professionalBackground.institution}
          onChange={(e) => updateProfessionalBackground("institution", e.target.value)}
          placeholder={isEn ? "e.g., University of Ottawa" : "ex., Université d'Ottawa"}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="yearsTeaching">
          {isEn ? "Years of Teaching Experience" : "Années d'expérience en enseignement"} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="yearsTeaching"
          type="number"
          min="0"
          value={data.professionalBackground.yearsTeaching}
          onChange={(e) => updateProfessionalBackground("yearsTeaching", parseInt(e.target.value) || 0)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="currentOccupation">
          {isEn ? "Current Occupation" : "Occupation actuelle"}
        </Label>
        <Input
          id="currentOccupation"
          value={data.professionalBackground.currentOccupation}
          onChange={(e) => updateProfessionalBackground("currentOccupation", e.target.value)}
          placeholder={isEn ? "e.g., French Teacher, Language Consultant" : "ex., Professeur de français, Consultant linguistique"}
        />
      </div>

      <div className="space-y-2">
        <Label>
          {isEn ? "Certifications & Credentials" : "Certifications et diplômes"}
        </Label>
        <div className="flex gap-2">
          <Input
            value={certificationInput}
            onChange={(e) => setCertificationInput(e.target.value)}
            placeholder={isEn ? "Add a certification..." : "Ajouter une certification..."}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCertification())}
          />
          <Button type="button" onClick={addCertification} variant="outline">
            {isEn ? "Add" : "Ajouter"}
          </Button>
        </div>
        {data.professionalBackground.certifications.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {data.professionalBackground.certifications.map((cert, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {cert}
                <button onClick={() => removeCertification(index)} className="ml-1 hover:text-red-500">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="linkedin">
          {isEn ? "LinkedIn Profile (optional)" : "Profil LinkedIn (optionnel)"}
        </Label>
        <Input
          id="linkedin"
          value={data.professionalBackground.linkedinUrl}
          onChange={(e) => updateProfessionalBackground("linkedinUrl", e.target.value)}
          placeholder="https://linkedin.com/in/yourprofile"
        />
      </div>
    </div>
  );

  // Step 3: Language Qualifications
  const renderLanguageQualificationsStep = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>
          {isEn ? "Native Language" : "Langue maternelle"} <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={data.languageQualifications.nativeLanguage}
          onValueChange={(value) => updateLanguageQualifications("nativeLanguage", value)}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="french" id="french" />
            <Label htmlFor="french">{isEn ? "French" : "Français"}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="english" id="english" />
            <Label htmlFor="english">{isEn ? "English" : "Anglais"}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="bilingual" id="bilingual" />
            <Label htmlFor="bilingual">{isEn ? "Bilingual (Both)" : "Bilingue (Les deux)"}</Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Award className="h-4 w-4 text-teal-600" />
          {isEn ? "SLE Levels (if applicable)" : "Niveaux ELS (si applicable)"}
        </h4>
        <p className="text-sm text-muted-foreground">
          {isEn 
            ? "If you have taken the Second Language Evaluation (SLE), please indicate your levels."
            : "Si vous avez passé l'Évaluation de langue seconde (ELS), veuillez indiquer vos niveaux."}
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sleOral">
              {isEn ? "Oral Proficiency" : "Compétence orale"} <span className="text-red-500">*</span>
            </Label>
            <Select
              value={data.languageQualifications.sleOralLevel}
              onValueChange={(value) => updateLanguageQualifications("sleOralLevel", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={isEn ? "Select level" : "Sélectionner"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{isEn ? "Not tested" : "Non testé"}</SelectItem>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="E">E ({isEn ? "Exempt" : "Exempté"})</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sleWritten">
              {isEn ? "Written Expression" : "Expression écrite"}
            </Label>
            <Select
              value={data.languageQualifications.sleWrittenLevel}
              onValueChange={(value) => updateLanguageQualifications("sleWrittenLevel", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={isEn ? "Select level" : "Sélectionner"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{isEn ? "Not tested" : "Non testé"}</SelectItem>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="E">E ({isEn ? "Exempt" : "Exempté"})</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sleReading">
              {isEn ? "Reading Comprehension" : "Compréhension écrite"}
            </Label>
            <Select
              value={data.languageQualifications.sleReadingLevel}
              onValueChange={(value) => updateLanguageQualifications("sleReadingLevel", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={isEn ? "Select level" : "Sélectionner"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{isEn ? "Not tested" : "Non testé"}</SelectItem>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="E">E ({isEn ? "Exempt" : "Exempté"})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="teachingExp">
          {isEn ? "Language Teaching Experience" : "Expérience en enseignement des langues"}
        </Label>
        <Textarea
          id="teachingExp"
          value={data.languageQualifications.teachingExperience}
          onChange={(e) => updateLanguageQualifications("teachingExperience", e.target.value)}
          placeholder={isEn 
            ? "Describe your experience teaching French or English to adults, especially for SLE preparation..."
            : "Décrivez votre expérience en enseignement du français ou de l'anglais aux adultes, surtout pour la préparation à l'ELS..."}
          rows={4}
        />
      </div>
    </div>
  );

  // Step 4: Specializations
  const renderSpecializationsStep = () => {
    const specializationGroups = [
      {
        title: isEn ? "SLE Oral Levels" : "Niveaux oraux ELS",
        items: [
          { key: "oralA", label: isEn ? "Oral Level A" : "Oral niveau A" },
          { key: "oralB", label: isEn ? "Oral Level B" : "Oral niveau B" },
          { key: "oralC", label: isEn ? "Oral Level C" : "Oral niveau C" },
        ],
      },
      {
        title: isEn ? "SLE Written Levels" : "Niveaux écrits ELS",
        items: [
          { key: "writtenA", label: isEn ? "Written Level A" : "Écrit niveau A" },
          { key: "writtenB", label: isEn ? "Written Level B" : "Écrit niveau B" },
          { key: "writtenC", label: isEn ? "Written Level C" : "Écrit niveau C" },
        ],
      },
      {
        title: isEn ? "Other Specializations" : "Autres spécialisations",
        items: [
          { key: "readingComprehension", label: isEn ? "Reading Comprehension" : "Compréhension écrite" },
          { key: "examPrep", label: isEn ? "Exam Preparation" : "Préparation aux examens" },
          { key: "businessFrench", label: isEn ? "Business French" : "Français des affaires" },
          { key: "businessEnglish", label: isEn ? "Business English" : "Anglais des affaires" },
          { key: "grammarFocus", label: isEn ? "Grammar Focus" : "Focus grammaire" },
          { key: "vocabularyBuilding", label: isEn ? "Vocabulary Building" : "Enrichissement du vocabulaire" },
          { key: "conversationPractice", label: isEn ? "Conversation Practice" : "Pratique de conversation" },
          { key: "pronunciationCoaching", label: isEn ? "Pronunciation Coaching" : "Coaching en prononciation" },
        ],
      },
    ];

    return (
      <div className="space-y-6">
        <p className="text-muted-foreground">
          {isEn 
            ? "Select all areas where you can provide coaching. Choose at least one specialization."
            : "Sélectionnez tous les domaines où vous pouvez offrir du coaching. Choisissez au moins une spécialisation."}
        </p>

        {specializationGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              {group.title}
            </h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.items.map((item) => (
                <div
                  key={item.key}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    data.specializations[item.key as keyof Specializations]
                      ? "border-teal-500 bg-teal-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => updateSpecializations(
                    item.key as keyof Specializations,
                    !data.specializations[item.key as keyof Specializations]
                  )}
                >
                  <Checkbox
                    checked={data.specializations[item.key as keyof Specializations]}
                    onCheckedChange={(checked) => updateSpecializations(
                      item.key as keyof Specializations,
                      checked as boolean
                    )}
                  />
                  <Label className="cursor-pointer">{item.label}</Label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Step 5: Availability & Pricing
  const renderAvailabilityPricingStep = () => {
    const days = [
      { key: "monday", label: isEn ? "Monday" : "Lundi" },
      { key: "tuesday", label: isEn ? "Tuesday" : "Mardi" },
      { key: "wednesday", label: isEn ? "Wednesday" : "Mercredi" },
      { key: "thursday", label: isEn ? "Thursday" : "Jeudi" },
      { key: "friday", label: isEn ? "Friday" : "Vendredi" },
      { key: "saturday", label: isEn ? "Saturday" : "Samedi" },
      { key: "sunday", label: isEn ? "Sunday" : "Dimanche" },
    ];

    const timeSlots = [
      { key: "morning", label: isEn ? "Morning (6am-12pm)" : "Matin (6h-12h)" },
      { key: "afternoon", label: isEn ? "Afternoon (12pm-5pm)" : "Après-midi (12h-17h)" },
      { key: "evening", label: isEn ? "Evening (5pm-10pm)" : "Soir (17h-22h)" },
    ];

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="weeklyHours">
            {isEn ? "Weekly Hours Available" : "Heures disponibles par semaine"} <span className="text-red-500">*</span>
          </Label>
          <div className="flex items-center gap-4">
            <Input
              id="weeklyHours"
              type="number"
              min="1"
              max="40"
              value={data.availabilityPricing.weeklyHours}
              onChange={(e) => updateAvailabilityPricing("weeklyHours", parseInt(e.target.value) || 0)}
              className="w-24"
            />
            <span className="text-muted-foreground">{isEn ? "hours/week" : "heures/semaine"}</span>
          </div>
        </div>

        <div className="space-y-3">
          <Label>
            {isEn ? "Preferred Days" : "Jours préférés"} <span className="text-red-500">*</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {days.map((day) => (
              <Button
                key={day.key}
                type="button"
                variant={data.availabilityPricing.preferredDays.includes(day.key) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleDay(day.key)}
              >
                {day.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>
            {isEn ? "Preferred Time Slots" : "Créneaux horaires préférés"}
          </Label>
          <div className="flex flex-wrap gap-2">
            {timeSlots.map((slot) => (
              <Button
                key={slot.key}
                type="button"
                variant={data.availabilityPricing.preferredTimes.includes(slot.key) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleTime(slot.key)}
              >
                {slot.label}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="hourlyRate">
              {isEn ? "Hourly Rate (CAD)" : "Tarif horaire (CAD)"} <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">$</span>
              <Input
                id="hourlyRate"
                type="number"
                min="20"
                max="200"
                value={data.availabilityPricing.hourlyRate}
                onChange={(e) => updateAvailabilityPricing("hourlyRate", parseInt(e.target.value) || 0)}
                className="w-24"
              />
              <span className="text-muted-foreground">/hr</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {isEn ? "Recommended: $50-$100/hr" : "Recommandé: 50-100$/h"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trialRate">
              {isEn ? "Trial Session Rate (CAD)" : "Tarif session d'essai (CAD)"} <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">$</span>
              <Input
                id="trialRate"
                type="number"
                min="0"
                max="100"
                value={data.availabilityPricing.trialRate}
                onChange={(e) => updateAvailabilityPricing("trialRate", parseInt(e.target.value) || 0)}
                className="w-24"
              />
              <span className="text-muted-foreground">/30min</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {isEn ? "Set to $0 for free trial sessions" : "Mettez 0$ pour des sessions d'essai gratuites"}
            </p>
          </div>
        </div>

        <div className="p-4 bg-amber-50 border border-[#FFE4D6] rounded-lg">
          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">
                {isEn ? "Commission Structure" : "Structure de commission"}
              </p>
              <p className="text-sm text-amber-700 mt-1">
                {isEn 
                  ? "Lingueefy charges a 15-26% commission on sessions. Higher volume = lower commission. You'll see your net earnings in your dashboard."
                  : "Lingueefy prélève une commission de 15-26% sur les sessions. Plus de volume = moins de commission. Vous verrez vos gains nets dans votre tableau de bord."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Step 6: Profile Content
  const renderProfileContentStep = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="headline">
          {isEn ? "Professional Headline" : "Titre professionnel"} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="headline"
          value={data.profileContent.headline}
          onChange={(e) => updateProfileContent("headline", e.target.value)}
          placeholder={isEn 
            ? "e.g., Certified French Coach | 10+ Years SLE Experience | CBC Specialist"
            : "ex., Coach français certifié | 10+ ans d'expérience ELS | Spécialiste CBC"}
          maxLength={100}
        />
        <p className="text-xs text-muted-foreground text-right">
          {data.profileContent.headline.length}/100
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="headlineFr">
          {isEn ? "Professional Headline (French)" : "Titre professionnel (français)"}
          <span className="ml-1 text-xs text-muted-foreground font-normal">{isEn ? "Optional" : "Facultatif"}</span>
        </Label>
        <Input
          id="headlineFr"
          value={data.profileContent.headlineFr}
          onChange={(e) => updateProfileContent("headlineFr", e.target.value)}
          placeholder={isEn 
            ? "e.g., Coach français certifié | 10+ ans d'expérience ELS | Spécialiste CBC"
            : "ex., Coach français certifié | 10+ ans d'expérience ELS | Spécialiste CBC"}
          maxLength={200}
        />
        <p className="text-xs text-muted-foreground text-right">
          {data.profileContent.headlineFr.length}/200
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">
          {isEn ? "About You (Bio)" : "À propos de vous (Bio)"} <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="bio"
          value={data.profileContent.bio}
          onChange={(e) => updateProfileContent("bio", e.target.value)}
          placeholder={isEn 
            ? "Tell learners about your background, experience, and what makes you a great coach. Include your teaching approach and any success stories..."
            : "Parlez aux apprenants de votre parcours, expérience et ce qui fait de vous un excellent coach. Incluez votre approche pédagogique et des histoires de réussite..."}
          rows={6}
          minLength={100}
        />
        <p className={cn(
          "text-xs text-right",
          data.profileContent.bio.length < 100 ? "text-red-500" : "text-muted-foreground"
        )}>
          {data.profileContent.bio.length}/100 {isEn ? "minimum" : "minimum"}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bioFr">
          {isEn ? "About You — French (Bio en français)" : "À propos de vous — Français (Bio en français)"}
          <span className="ml-1 text-xs text-muted-foreground font-normal">{isEn ? "Optional" : "Facultatif"}</span>
        </Label>
        <Textarea
          id="bioFr"
          value={data.profileContent.bioFr}
          onChange={(e) => updateProfileContent("bioFr", e.target.value)}
          placeholder={isEn 
            ? "Write your bio in French for francophone learners..."
            : "Rédigez votre bio en français pour les apprenants francophones..."}
          rows={6}
        />
        <p className="text-xs text-muted-foreground text-right">
          {data.profileContent.bioFr.length}/2000
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="philosophy">
          {isEn ? "Teaching Philosophy" : "Philosophie d'enseignement"}
        </Label>
        <Textarea
          id="philosophy"
          value={data.profileContent.teachingPhilosophy}
          onChange={(e) => updateProfileContent("teachingPhilosophy", e.target.value)}
          placeholder={isEn 
            ? "What is your approach to language learning? How do you help students succeed?"
            : "Quelle est votre approche de l'apprentissage des langues? Comment aidez-vous les étudiants à réussir?"}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="uniqueApproach">
          {isEn ? "What Makes You Unique?" : "Qu'est-ce qui vous rend unique?"}
        </Label>
        <Textarea
          id="uniqueApproach"
          value={data.profileContent.uniqueApproach}
          onChange={(e) => updateProfileContent("uniqueApproach", e.target.value)}
          placeholder={isEn 
            ? "What sets you apart from other coaches? Any special techniques or methods?"
            : "Qu'est-ce qui vous distingue des autres coachs? Des techniques ou méthodes spéciales?"}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="successStory">
          {isEn ? "Success Story (optional)" : "Histoire de réussite (optionnel)"}
        </Label>
        <Textarea
          id="successStory"
          value={data.profileContent.successStory}
          onChange={(e) => updateProfileContent("successStory", e.target.value)}
          placeholder={isEn 
            ? "Share a memorable success story of a student you helped achieve their SLE goals..."
            : "Partagez une histoire de réussite mémorable d'un étudiant que vous avez aidé à atteindre ses objectifs ELS..."}
          rows={3}
        />
      </div>
    </div>
  );

  // Step 7: Media Uploads
  const renderMediaUploadsStep = () => (
    <div className="space-y-6">
      {/* Photo Upload */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">
            {isEn ? "Professional Photo" : "Photo professionnelle"} <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            {isEn 
              ? "Upload a clear, professional headshot. This will be displayed on your profile."
              : "Téléchargez une photo de tête claire et professionnelle. Elle sera affichée sur votre profil."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
              photoPreview ? "border-teal-500 bg-teal-50" : "border-gray-300 hover:border-gray-400"
            )}
            onClick={() => photoInputRef.current?.click()}
          >
            {photoPreview ? (
              <div className="space-y-3">
                <img
                  loading="lazy" src={photoPreview}
                  alt="Preview"
                  className="w-32 h-32 rounded-full object-cover mx-auto"
                />
                <p className="text-sm text-teal-600">
                  {isEn ? "Click to change photo" : "Cliquez pour changer la photo"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-600">
                  {isEn ? "Click to upload photo" : "Cliquez pour télécharger une photo"}
                </p>
                <p className="text-xs text-gray-400">
                  JPG, PNG (max 5MB)
                </p>
              </div>
            )}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Camera className="h-4 w-4" />
              {isEn ? "Photo Guidelines" : "Directives pour la photo"}
            </h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>✓ {isEn ? "Clear, well-lit headshot" : "Photo de tête claire et bien éclairée"}</li>
              <li>✓ {isEn ? "Professional attire" : "Tenue professionnelle"}</li>
              <li>✓ {isEn ? "Neutral or simple background" : "Arrière-plan neutre ou simple"}</li>
              <li>✓ {isEn ? "Friendly, approachable expression" : "Expression amicale et accessible"}</li>
              <li>✗ {isEn ? "No sunglasses or hats" : "Pas de lunettes de soleil ou chapeaux"}</li>
              <li>✗ {isEn ? "No group photos" : "Pas de photos de groupe"}</li>
            </ul>
          </div>
        </div>
      </div>

      <Separator />

      {/* Video Upload */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">
            {isEn ? "Introduction Video" : "Vidéo d'introduction"}
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            {isEn 
              ? "A short video (1-3 minutes) introducing yourself helps learners connect with you."
              : "Une courte vidéo (1-3 minutes) vous présentant aide les apprenants à se connecter avec vous."}
          </p>
        </div>

        <div className="space-y-4">
          <RadioGroup
            value={data.mediaUploads.videoType}
            onValueChange={(value: "upload" | "youtube") => updateMediaUploads("videoType", value)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="youtube" id="youtube" />
              <Label htmlFor="youtube">{isEn ? "YouTube Link" : "Lien YouTube"}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="upload" id="upload" />
              <Label htmlFor="upload">{isEn ? "Upload Video" : "Télécharger une vidéo"}</Label>
            </div>
          </RadioGroup>

          {data.mediaUploads.videoType === "youtube" ? (
            <div className="space-y-2">
              <Input
                value={data.mediaUploads.videoUrl}
                onChange={(e) => updateMediaUploads("videoUrl", e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          ) : (
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
              onClick={() => videoInputRef.current?.click()}
            >
              {data.mediaUploads.videoFile ? (
                <div className="space-y-2">
                  <Play className="h-12 w-12 text-teal-500 mx-auto" />
                  <p className="text-sm text-teal-600">{data.mediaUploads.videoFile.name}</p>
                  <p className="text-xs text-gray-400">
                    {(data.mediaUploads.videoFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-600">
                    {isEn ? "Click to upload video" : "Cliquez pour télécharger une vidéo"}
                  </p>
                  <p className="text-xs text-gray-400">
                    MP4, MOV (max 100MB)
                  </p>
                </div>
              )}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/quicktime"
                onChange={handleVideoUpload}
                className="hidden"
              />
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Play className="h-4 w-4" />
            {isEn ? "Video Tips" : "Conseils pour la vidéo"}
          </h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>✓ {isEn ? "Introduce yourself and your background" : "Présentez-vous et votre parcours"}</li>
            <li>✓ {isEn ? "Explain your teaching style" : "Expliquez votre style d'enseignement"}</li>
            <li>✓ {isEn ? "Share why you love coaching" : "Partagez pourquoi vous aimez le coaching"}</li>
            <li>✓ {isEn ? "Speak in the language you'll teach" : "Parlez dans la langue que vous enseignerez"}</li>
            <li>✓ {isEn ? "Keep it 1-3 minutes" : "Gardez-la entre 1-3 minutes"}</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Step 8: Legal Consents
  const renderLegalConsentsStep = () => (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800">
              {isEn ? "Important Legal Agreements" : "Accords juridiques importants"}
            </p>
            <p className="text-sm text-blue-700 mt-1">
              {isEn 
                ? "Please review and accept all agreements below to complete your application."
                : "Veuillez examiner et accepter tous les accords ci-dessous pour compléter votre candidature."}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Terms of Service */}
        <div className={cn(
          "p-4 border rounded-lg",
          data.legalConsents.termsOfService ? "border-teal-500 bg-teal-50" : "border-gray-200"
        )}>
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={data.legalConsents.termsOfService}
              onCheckedChange={(checked) => updateLegalConsents("termsOfService", checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="terms" className="cursor-pointer font-medium">
                {isEn ? "Terms of Service" : "Conditions d'utilisation"} <span className="text-red-500">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                {isEn 
                  ? "I have read and agree to the Lingueefy Coach Terms of Service, including session policies, cancellation rules, and platform guidelines."
                  : "J'ai lu et j'accepte les Conditions d'utilisation des coachs Lingueefy, y compris les politiques de session, les règles d'annulation et les directives de la plateforme."}
              </p>
              <a href="/terms" target="_blank" className="text-sm text-teal-600 hover:underline">
                {isEn ? "Read full terms →" : "Lire les conditions complètes →"}
              </a>
            </div>
          </div>
        </div>

        {/* Privacy Policy */}
        <div className={cn(
          "p-4 border rounded-lg",
          data.legalConsents.privacyPolicy ? "border-teal-500 bg-teal-50" : "border-gray-200"
        )}>
          <div className="flex items-start space-x-3">
            <Checkbox
              id="privacy"
              checked={data.legalConsents.privacyPolicy}
              onCheckedChange={(checked) => updateLegalConsents("privacyPolicy", checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="privacy" className="cursor-pointer font-medium">
                {isEn ? "Privacy Policy" : "Politique de confidentialité"} <span className="text-red-500">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                {isEn 
                  ? "I consent to the collection, use, and storage of my personal information as described in the Privacy Policy."
                  : "Je consens à la collecte, l'utilisation et le stockage de mes informations personnelles tel que décrit dans la Politique de confidentialité."}
              </p>
              <a href="/privacy" target="_blank" className="text-sm text-teal-600 hover:underline">
                {isEn ? "Read privacy policy →" : "Lire la politique de confidentialité →"}
              </a>
            </div>
          </div>
        </div>

        {/* Background Check */}
        <div className={cn(
          "p-4 border rounded-lg",
          data.legalConsents.backgroundCheck ? "border-teal-500 bg-teal-50" : "border-gray-200"
        )}>
          <div className="flex items-start space-x-3">
            <Checkbox
              id="background"
              checked={data.legalConsents.backgroundCheck}
              onCheckedChange={(checked) => updateLegalConsents("backgroundCheck", checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="background" className="cursor-pointer font-medium">
                {isEn ? "Background Check Authorization" : "Autorisation de vérification des antécédents"} <span className="text-red-500">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                {isEn 
                  ? "I authorize Lingueefy to conduct a background check if required for government client engagements. I understand this may be required for certain coaching opportunities."
                  : "J'autorise Lingueefy à effectuer une vérification des antécédents si nécessaire pour les engagements avec des clients gouvernementaux. Je comprends que cela peut être requis pour certaines opportunités de coaching."}
              </p>
            </div>
          </div>
        </div>

        {/* Code of Conduct */}
        <div className={cn(
          "p-4 border rounded-lg",
          data.legalConsents.codeOfConduct ? "border-teal-500 bg-teal-50" : "border-gray-200"
        )}>
          <div className="flex items-start space-x-3">
            <Checkbox
              id="conduct"
              checked={data.legalConsents.codeOfConduct}
              onCheckedChange={(checked) => updateLegalConsents("codeOfConduct", checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="conduct" className="cursor-pointer font-medium">
                {isEn ? "Code of Conduct" : "Code de conduite"} <span className="text-red-500">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                {isEn 
                  ? "I agree to maintain professional conduct, respect learner confidentiality, provide quality instruction, and uphold Lingueefy's community standards."
                  : "Je m'engage à maintenir une conduite professionnelle, respecter la confidentialité des apprenants, fournir un enseignement de qualité et respecter les normes communautaires de Lingueefy."}
              </p>
            </div>
          </div>
        </div>

        {/* Commission Terms */}
        <div className={cn(
          "p-4 border rounded-lg",
          data.legalConsents.commissionTerms ? "border-teal-500 bg-teal-50" : "border-gray-200"
        )}>
          <div className="flex items-start space-x-3">
            <Checkbox
              id="commission"
              checked={data.legalConsents.commissionTerms}
              onCheckedChange={(checked) => updateLegalConsents("commissionTerms", checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="commission" className="cursor-pointer font-medium">
                {isEn ? "Commission & Payment Terms" : "Conditions de commission et paiement"} <span className="text-red-500">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                {isEn 
                  ? "I understand and accept Lingueefy's commission structure (15-26% based on volume) and payment terms. Payouts are processed weekly via Stripe Connect."
                  : "Je comprends et j'accepte la structure de commission de Lingueefy (15-26% selon le volume) et les conditions de paiement. Les paiements sont traités chaque semaine via Stripe Connect."}
              </p>
            </div>
          </div>
        </div>

        {/* Marketing Consent (Optional) */}
        <div className={cn(
          "p-4 border rounded-lg",
          data.legalConsents.marketingConsent ? "border-teal-500 bg-teal-50" : "border-gray-200"
        )}>
          <div className="flex items-start space-x-3">
            <Checkbox
              id="marketing"
              checked={data.legalConsents.marketingConsent}
              onCheckedChange={(checked) => updateLegalConsents("marketingConsent", checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="marketing" className="cursor-pointer font-medium">
                {isEn ? "Marketing Communications (Optional)" : "Communications marketing (Optionnel)"}
              </Label>
              <p className="text-sm text-muted-foreground">
                {isEn 
                  ? "I agree to receive promotional emails, newsletters, and updates about Lingueefy features and opportunities."
                  : "J'accepte de recevoir des courriels promotionnels, des bulletins d'information et des mises à jour sur les fonctionnalités et opportunités de Lingueefy."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Digital Signature */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">
            {isEn ? "Digital Signature" : "Signature numérique"} <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            {isEn 
              ? "Type your full legal name below to sign this application electronically."
              : "Tapez votre nom légal complet ci-dessous pour signer cette candidature électroniquement."}
          </p>
        </div>

        <Input
          value={data.legalConsents.digitalSignature}
          onChange={(e) => {
            updateLegalConsents("digitalSignature", e.target.value);
            updateLegalConsents("signatureDate", new Date().toISOString());
          }}
          placeholder={isEn ? "Type your full name" : "Tapez votre nom complet"}
          className="text-lg"
        />

        {data.legalConsents.digitalSignature && (
          <p className="text-sm text-muted-foreground">
            {isEn ? "Signed on: " : "Signé le: "}
            {new Date().toLocaleDateString(isEn ? "en-CA" : "fr-CA", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            {isEn ? "Coach Application" : "Candidature coach"}
          </h2>
          <Badge variant="outline">
            {isEn ? `Step ${currentStep} of ${STEPS.length}` : `Étape ${currentStep} sur ${STEPS.length}`}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />

        {/* Step Indicators */}
        <div className="flex justify-between mt-4 overflow-x-auto pb-2">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <div
                key={step.id}
                className={cn(
                  "flex flex-col items-center min-w-[80px]",
                  isActive && "text-teal-600",
                  isCompleted && "text-green-600",
                  !isActive && !isCompleted && "text-gray-400"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mb-1",
                  isActive && "bg-teal-100",
                  isCompleted && "bg-green-100",
                  !isActive && !isCompleted && "bg-gray-100"
                )}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span className="text-xs text-center hidden md:block">
                  {isEn ? step.title : step.titleFr}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {(() => {
              const Icon = STEPS[currentStep - 1].icon;
              return <Icon className="h-5 w-5 text-teal-600" />;
            })()}
            {isEn ? STEPS[currentStep - 1].title : STEPS[currentStep - 1].titleFr}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onCancel : handleBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentStep === 1 ? (isEn ? "Cancel" : "Annuler") : (isEn ? "Back" : "Retour")}
        </Button>

        {currentStep < STEPS.length ? (
          <Button onClick={handleNext}>
            {isEn ? "Next" : "Suivant"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEn ? "Submitting..." : "Soumission..."}
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {isEn ? "Submit Application" : "Soumettre la candidature"}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
