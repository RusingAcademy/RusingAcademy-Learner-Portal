import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User, Save, ArrowLeft, Camera, Globe, DollarSign, BookOpen,
  Award, Languages, Clock, CheckCircle, AlertCircle, Loader2,
  Video, Link as LinkIcon, Briefcase, GraduationCap, Shield,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import CoachPhotoGallery from "@/components/CoachPhotoGallery";
import { useAppLayout } from "@/contexts/AppLayoutContext";

const SPECIALIZATIONS = [
  { id: "oralA", en: "Oral A — Basic", fr: "Oral A — Débutant" },
  { id: "oralB", en: "Oral B — Intermediate", fr: "Oral B — Intermédiaire" },
  { id: "oralC", en: "Oral C — Advanced", fr: "Oral C — Avancé" },
  { id: "writtenA", en: "Written A — Basic", fr: "Écrit A — Débutant" },
  { id: "writtenB", en: "Written B — Intermediate", fr: "Écrit B — Intermédiaire" },
  { id: "writtenC", en: "Written C — Advanced", fr: "Écrit C — Avancé" },
  { id: "examPrep", en: "SLE Exam Preparation", fr: "Préparation ELS" },
  { id: "pronunciation", en: "Pronunciation Coaching", fr: "Coaching en prononciation" },
  { id: "grammar", en: "Grammar & Writing", fr: "Grammaire et rédaction" },
  { id: "conversation", en: "Conversation Practice", fr: "Pratique conversationnelle" },
  { id: "businessFrench", en: "Business French", fr: "Français des affaires" },
  { id: "publicSpeaking", en: "Public Speaking", fr: "Prise de parole en public" },
];

const LANGUAGES_LIST = [
  { id: "french", en: "French", fr: "Français" },
  { id: "english", en: "English", fr: "Anglais" },
  { id: "spanish", en: "Spanish", fr: "Espagnol" },
  { id: "arabic", en: "Arabic", fr: "Arabe" },
  { id: "mandarin", en: "Mandarin", fr: "Mandarin" },
];

export default function CoachProfileEditor() {
  const { isInsideAppLayout } = useAppLayout();
  const { language } = useLanguage();
  const isEn = language === "en";
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [isSaving, setIsSaving] = useState(false);

  // Fetch coach profile
  const { data: coachProfile, isLoading: profileLoading, refetch } = trpc.coach.myProfile.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Form state
  const [form, setForm] = useState({
    headline: "",
    headlineFr: "",
    bio: "",
    bioFr: "",
    hourlyRate: 0,
    trialRate: 0,
    specializations: {} as Record<string, boolean>,
    languages: {} as Record<string, boolean>,
    videoUrl: "",
    linkedinUrl: "",
    websiteUrl: "",
    yearsExperience: 0,
    certifications: "",
    teachingApproach: "",
    targetAudience: "",
  });

  // Populate form from profile data
  useEffect(() => {
    if (coachProfile) {
      setForm({
        headline: coachProfile.headline || "",
        headlineFr: (coachProfile as any).headlineFr || "",
        bio: coachProfile.bio || "",
        bioFr: (coachProfile as any).bioFr || "",
        hourlyRate: coachProfile.hourlyRate || 0,
        trialRate: coachProfile.trialRate || 0,
        specializations: (coachProfile.specializations as Record<string, boolean>) || {},
        languages: (coachProfile as any).languages || {},
        videoUrl: coachProfile.videoUrl || "",
        linkedinUrl: (coachProfile as any).linkedinUrl || "",
        websiteUrl: (coachProfile as any).websiteUrl || "",
        yearsExperience: (coachProfile as any).yearsExperience || 0,
        certifications: (coachProfile as any).certifications || "",
        teachingApproach: (coachProfile as any).teachingApproach || "",
        targetAudience: (coachProfile as any).targetAudience || "",
      });
    }
  }, [coachProfile]);

  // Update profile mutation
  const updateProfileMutation = trpc.coach.update.useMutation({
    onSuccess: () => {
      toast.success(isEn ? "Profile updated successfully" : "Profil mis à jour avec succès");
      refetch();
      setIsSaving(false);
    },
    onError: (error) => {
      toast.error(error.message || (isEn ? "Failed to update profile" : "Échec de la mise à jour du profil"));
      setIsSaving(false);
    },
  });

  const handleSave = () => {
    setIsSaving(true);
    updateProfileMutation.mutate({
      headline: form.headline,
      headlineFr: form.headlineFr || undefined,
      bio: form.bio,
      bioFr: form.bioFr || undefined,
      hourlyRate: form.hourlyRate,
      trialRate: form.trialRate,
      specializations: form.specializations,
      videoUrl: form.videoUrl || undefined,
    });
  };

  const toggleSpecialization = (id: string) => {
    setForm(prev => ({
      ...prev,
      specializations: {
        ...prev.specializations,
        [id]: !prev.specializations[id],
      },
    }));
  };

  const toggleLanguage = (id: string) => {
    setForm(prev => ({
      ...prev,
      languages: {
        ...prev.languages,
        [id]: !prev.languages[id],
      },
    }));
  };

  // Auth guard
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {!isInsideAppLayout && <Header />}
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        {!isInsideAppLayout && <Footer />}
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (!coachProfile) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {!isInsideAppLayout && <Header />}
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4 text-center">
            <CardContent className="pt-8 pb-8">
              <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">
                {isEn ? "No Coach Profile Found" : "Aucun profil coach trouvé"}
              </h2>
              <p className="text-muted-foreground mb-4">
                {isEn ? "Please apply to become a coach first." : "Veuillez d'abord postuler pour devenir coach."}
              </p>
              <Link href="/become-a-coach">
                <Button>{isEn ? "Become a Coach" : "Devenir coach"}</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        {!isInsideAppLayout && <Footer />}
      </div>
    );
  }

  const activeSpecCount = Object.values(form.specializations).filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {!isInsideAppLayout && <Header />}
      <main className="flex-1">
        <div className="px-4 sm:px-6 lg:px-8 xl:px-12 py-8 max-w-[1200px] mx-auto">
          {/* Back Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/coach/dashboard">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                {isEn ? "Back to Dashboard" : "Retour au tableau de bord"}
              </Button>
            </Link>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isEn ? "Save Changes" : "Enregistrer"}
            </Button>
          </div>

          <h1 className="text-3xl font-bold mb-8">
            {isEn ? "Edit Your Coach Profile" : "Modifier votre profil coach"}
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    {isEn ? "Basic Information" : "Informations de base"}
                  </CardTitle>
                  <CardDescription>
                    {isEn ? "This is what learners see first on your profile." : "C'est ce que les apprenants voient en premier sur votre profil."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="headline">{isEn ? "Professional Headline" : "Titre professionnel"}</Label>
                    <Input
                      id="headline"
                      value={form.headline}
                      onChange={(e) => setForm(prev => ({ ...prev, headline: e.target.value }))}
                      placeholder={isEn ? "e.g., Certified SLE Coach | 10+ Years Experience" : "ex., Coach ELS certifié | 10+ ans d'expérience"}
                      maxLength={120}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{form.headline.length}/120</p>
                  </div>
                  <div>
                    <Label htmlFor="headlineFr">
                      {isEn ? "Professional Headline (French)" : "Titre professionnel (français)"}
                      <span className="ml-1 text-xs text-muted-foreground font-normal">{isEn ? "Optional" : "Facultatif"}</span>
                    </Label>
                    <Input
                      id="headlineFr"
                      value={form.headlineFr}
                      onChange={(e) => setForm(prev => ({ ...prev, headlineFr: e.target.value }))}
                      placeholder={isEn ? "e.g., Coach français certifié | 10+ ans d'expérience ELS" : "ex., Coach français certifié | 10+ ans d'expérience ELS"}
                      maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{form.headlineFr.length}/200</p>
                  </div>
                  <div>
                    <Label htmlFor="bio">{isEn ? "Biography" : "Biographie"}</Label>
                    <Textarea
                      id="bio"
                      value={form.bio}
                      onChange={(e) => setForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder={isEn 
                        ? "Tell learners about your background, teaching style, and what makes you unique..." 
                        : "Parlez de votre parcours, votre style d'enseignement et ce qui vous rend unique..."}
                      rows={6}
                      maxLength={2000}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{form.bio.length}/2000</p>
                  </div>
                  <div>
                    <Label htmlFor="bioFr">
                      {isEn ? "Biography (French)" : "Biographie (français)"}
                      <span className="ml-1 text-xs text-muted-foreground font-normal">{isEn ? "Optional" : "Facultatif"}</span>
                    </Label>
                    <Textarea
                      id="bioFr"
                      value={form.bioFr}
                      onChange={(e) => setForm(prev => ({ ...prev, bioFr: e.target.value }))}
                      placeholder={isEn 
                        ? "Write your biography in French for francophone learners..." 
                        : "Rédigez votre biographie en français pour les apprenants francophones..."}
                      rows={6}
                      maxLength={2000}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{form.bioFr.length}/2000</p>
                  </div>
                  <div>
                    <Label htmlFor="teachingApproach">{isEn ? "Teaching Approach" : "Approche pédagogique"}</Label>
                    <Textarea
                      id="teachingApproach"
                      value={form.teachingApproach}
                      onChange={(e) => setForm(prev => ({ ...prev, teachingApproach: e.target.value }))}
                      placeholder={isEn 
                        ? "Describe your methodology and how you help learners succeed..." 
                        : "Décrivez votre méthodologie et comment vous aidez les apprenants à réussir..."}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetAudience">{isEn ? "Target Audience" : "Public cible"}</Label>
                    <Input
                      id="targetAudience"
                      value={form.targetAudience}
                      onChange={(e) => setForm(prev => ({ ...prev, targetAudience: e.target.value }))}
                      placeholder={isEn ? "e.g., Federal public servants preparing for SLE" : "ex., Fonctionnaires fédéraux préparant l'ELS"}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Specializations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    {isEn ? "Specializations" : "Spécialisations"}
                  </CardTitle>
                  <CardDescription>
                    {isEn 
                      ? `Select your areas of expertise (${activeSpecCount} selected)` 
                      : `Sélectionnez vos domaines d'expertise (${activeSpecCount} sélectionnés)`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SPECIALIZATIONS.map((spec) => (
                      <button
                        key={spec.id}
                        onClick={() => toggleSpecialization(spec.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                          form.specializations[spec.id]
                            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                            : "border-border hover:border-primary/30 hover:bg-muted/50"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          form.specializations[spec.id] ? "border-primary bg-primary" : "border-muted-foreground/30"
                        }`}>
                          {form.specializations[spec.id] && <CheckCircle className="h-3 w-3 text-white" />}
                        </div>
                        <span className="font-medium text-sm">{isEn ? spec.en : spec.fr}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    {isEn ? "Session Pricing" : "Tarification des sessions"}
                  </CardTitle>
                  <CardDescription>
                    {isEn 
                      ? "Set your rates in Canadian dollars. Prices are in cents (e.g., 7500 = $75.00)." 
                      : "Définissez vos tarifs en dollars canadiens. Les prix sont en cents (ex., 7500 = 75,00$)."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hourlyRate">{isEn ? "Hourly Rate (cents)" : "Tarif horaire (cents)"}</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="hourlyRate"
                          type="number"
                          value={form.hourlyRate}
                          onChange={(e) => setForm(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) || 0 }))}
                          className="pl-9"
                          min={0}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        = ${(form.hourlyRate / 100).toFixed(2)} CAD / {isEn ? "hour" : "heure"}
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="trialRate">{isEn ? "Trial Session Rate (cents)" : "Tarif session d'essai (cents)"}</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="trialRate"
                          type="number"
                          value={form.trialRate}
                          onChange={(e) => setForm(prev => ({ ...prev, trialRate: parseInt(e.target.value) || 0 }))}
                          className="pl-9"
                          min={0}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        = ${(form.trialRate / 100).toFixed(2)} CAD / 30 min
                      </p>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-sm">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">{isEn ? "Commission Structure" : "Structure de commission"}</p>
                        <p className="text-muted-foreground mt-1">
                          {isEn 
                            ? "Platform commission starts at 26% and decreases to 15% as you complete more hours. You receive the remainder directly to your Stripe account." 
                            : "La commission de la plateforme commence à 26% et diminue jusqu'à 15% au fur et à mesure que vous complétez plus d'heures. Vous recevez le reste directement sur votre compte Stripe."}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Video & Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    {isEn ? "Video & Links" : "Vidéo et liens"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="videoUrl">{isEn ? "Introduction Video URL" : "URL de la vidéo d'introduction"}</Label>
                    <Input
                      id="videoUrl"
                      value={form.videoUrl}
                      onChange={(e) => setForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {isEn ? "YouTube or Vimeo link recommended" : "Lien YouTube ou Vimeo recommandé"}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="linkedinUrl">{isEn ? "LinkedIn Profile" : "Profil LinkedIn"}</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="linkedinUrl"
                        value={form.linkedinUrl}
                        onChange={(e) => setForm(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                        placeholder="https://linkedin.com/in/..."
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="websiteUrl">{isEn ? "Personal Website" : "Site web personnel"}</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="websiteUrl"
                        value={form.websiteUrl}
                        onChange={(e) => setForm(prev => ({ ...prev, websiteUrl: e.target.value }))}
                        placeholder="https://..."
                        className="pl-9"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Experience & Certifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    {isEn ? "Experience & Certifications" : "Expérience et certifications"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="yearsExperience">{isEn ? "Years of Teaching Experience" : "Années d'expérience en enseignement"}</Label>
                    <Input
                      id="yearsExperience"
                      type="number"
                      value={form.yearsExperience}
                      onChange={(e) => setForm(prev => ({ ...prev, yearsExperience: parseInt(e.target.value) || 0 }))}
                      min={0}
                      max={50}
                    />
                  </div>
                  <div>
                    <Label htmlFor="certifications">{isEn ? "Certifications & Qualifications" : "Certifications et qualifications"}</Label>
                    <Textarea
                      id="certifications"
                      value={form.certifications}
                      onChange={(e) => setForm(prev => ({ ...prev, certifications: e.target.value }))}
                      placeholder={isEn 
                        ? "List your relevant certifications, degrees, and qualifications..." 
                        : "Listez vos certifications, diplômes et qualifications pertinents..."}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{isEn ? "Profile Preview" : "Aperçu du profil"}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  {coachProfile.photoUrl ? (
                    <img
                      loading="lazy"
                      src={coachProfile.photoUrl}
                      alt={user?.name || "Coach"}
                      className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-primary/20"
                    />
                  ) : (
                    <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary/20">
                      <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                        {user?.name?.split(" ").map(n => n[0]).join("") || "C"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <h3 className="font-bold text-lg">{user?.name}</h3>
                  <p className="text-primary text-sm font-medium mt-1">{(isEn ? form.headline : (form.headlineFr || form.headline)) || (isEn ? "Add a headline..." : "Ajoutez un titre...")}</p>
                  <div className="flex flex-wrap gap-1 justify-center mt-3">
                    {Object.entries(form.specializations)
                      .filter(([_, active]) => active)
                      .slice(0, 3)
                      .map(([key]) => (
                        <Badge key={key} variant="secondary" className="text-xs">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </Badge>
                      ))}
                    {activeSpecCount > 3 && (
                      <Badge variant="outline" className="text-xs">+{activeSpecCount - 3}</Badge>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                    <p>${(form.hourlyRate / 100).toFixed(0)} CAD / {isEn ? "hour" : "heure"}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Photo Gallery */}
              {coachProfile && (
                <CoachPhotoGallery coachId={coachProfile.id} isEditable={true} />
              )}

              {/* Languages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Languages className="h-5 w-5 text-primary" />
                    {isEn ? "Languages Spoken" : "Langues parlées"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {LANGUAGES_LIST.map((lang) => (
                      <div key={lang.id} className="flex items-center justify-between">
                        <Label htmlFor={`lang-${lang.id}`} className="cursor-pointer">
                          {isEn ? lang.en : lang.fr}
                        </Label>
                        <Switch
                          id={`lang-${lang.id}`}
                          checked={form.languages[lang.id] || false}
                          onCheckedChange={() => toggleLanguage(lang.id)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{isEn ? "Quick Links" : "Liens rapides"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/coach/dashboard">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      {isEn ? "Dashboard" : "Tableau de bord"}
                    </Button>
                  </Link>
                  <Link href="/coach/availability">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Clock className="h-4 w-4" />
                      {isEn ? "Manage Availability" : "Gérer les disponibilités"}
                    </Button>
                  </Link>
                  <Link href="/app/earnings">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <DollarSign className="h-4 w-4" />
                      {isEn ? "Payment Settings" : "Paramètres de paiement"}
                    </Button>
                  </Link>
                  <Link href={`/coaches/${(coachProfile as any).slug || coachProfile.id}`}>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Globe className="h-4 w-4" />
                      {isEn ? "View Public Profile" : "Voir le profil public"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom Save Button */}
          <div className="mt-8 flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} size="lg" className="gap-2">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isEn ? "Save All Changes" : "Enregistrer toutes les modifications"}
            </Button>
          </div>
        </div>
      </main>
      {!isInsideAppLayout && <Footer />}
    </div>
  );
}
