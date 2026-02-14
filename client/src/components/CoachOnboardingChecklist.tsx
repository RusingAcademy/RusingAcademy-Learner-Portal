import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Circle,
  User,
  Image,
  Calendar,
  CreditCard,
  Video,
  FileText,
  ChevronRight,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

interface ChecklistItem {
  id: string;
  completed: boolean;
  required: boolean;
}

interface CoachOnboardingChecklistProps {
  coachProfile: {
    bio?: string | null;
    headline?: string | null;
    photoUrl?: string | null;
    videoUrl?: string | null;
    hourlyRate?: number | null;
    trialRate?: number | null;
    specializations?: Record<string, boolean> | null;
    stripeOnboarded?: boolean;
  };
  hasAvailability: boolean;
  onEditProfile: () => void;
  onSetAvailability: () => void;
  onConnectStripe: () => void;
}

export function CoachOnboardingChecklist({
  coachProfile,
  hasAvailability,
  onEditProfile,
  onSetAvailability,
  onConnectStripe,
}: CoachOnboardingChecklistProps) {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(true);

  const labels = language === "fr" ? {
    title: "Liste de vérification du profil",
    description: "Complétez ces étapes pour activer votre profil de coach",
    progress: "Progression",
    complete: "Complété",
    incomplete: "Incomplet",
    required: "Requis",
    optional: "Optionnel",
    profileLive: "Votre profil est en ligne !",
    profileLiveDesc: "Les apprenants peuvent maintenant vous trouver et réserver des sessions.",
    almostThere: "Presque terminé !",
    almostThereDesc: "Complétez les étapes restantes pour activer votre profil.",
    items: {
      bio: {
        title: "Ajouter une biographie",
        description: "Présentez-vous aux apprenants potentiels",
      },
      headline: {
        title: "Ajouter un titre accrocheur",
        description: "Un court résumé de votre expertise",
      },
      photo: {
        title: "Télécharger une photo de profil",
        description: "Une photo professionnelle augmente la confiance",
      },
      video: {
        title: "Ajouter une vidéo d'introduction",
        description: "Présentez-vous en vidéo (YouTube)",
      },
      pricing: {
        title: "Définir vos tarifs",
        description: "Tarif horaire et tarif d'essai",
      },
      specializations: {
        title: "Sélectionner vos spécialisations",
        description: "Niveaux SLE et domaines d'expertise",
      },
      availability: {
        title: "Configurer vos disponibilités",
        description: "Définissez vos créneaux horaires",
      },
      stripe: {
        title: "Connecter Stripe",
        description: "Pour recevoir vos paiements",
      },
    },
    actions: {
      editProfile: "Modifier le profil",
      setAvailability: "Définir les disponibilités",
      connectStripe: "Connecter Stripe",
    },
  } : {
    title: "Profile Checklist",
    description: "Complete these steps to activate your coach profile",
    progress: "Progress",
    complete: "Complete",
    incomplete: "Incomplete",
    required: "Required",
    optional: "Optional",
    profileLive: "Your profile is live!",
    profileLiveDesc: "Learners can now find you and book sessions.",
    almostThere: "Almost there!",
    almostThereDesc: "Complete the remaining steps to activate your profile.",
    items: {
      bio: {
        title: "Add a biography",
        description: "Introduce yourself to potential learners",
      },
      headline: {
        title: "Add a catchy headline",
        description: "A short summary of your expertise",
      },
      photo: {
        title: "Upload a profile photo",
        description: "A professional photo builds trust",
      },
      video: {
        title: "Add an intro video",
        description: "Introduce yourself on video (YouTube)",
      },
      pricing: {
        title: "Set your rates",
        description: "Hourly rate and trial session rate",
      },
      specializations: {
        title: "Select your specializations",
        description: "SLE levels and areas of expertise",
      },
      availability: {
        title: "Set your availability",
        description: "Define your available time slots",
      },
      stripe: {
        title: "Connect Stripe",
        description: "To receive your payments",
      },
    },
    actions: {
      editProfile: "Edit Profile",
      setAvailability: "Set Availability",
      connectStripe: "Connect Stripe",
    },
  };

  // Calculate checklist items
  const checklistItems: ChecklistItem[] = [
    {
      id: "bio",
      completed: !!(coachProfile.bio && coachProfile.bio.length > 20),
      required: true,
    },
    {
      id: "headline",
      completed: !!(coachProfile.headline && coachProfile.headline.length > 5),
      required: true,
    },
    {
      id: "photo",
      completed: !!coachProfile.photoUrl,
      required: true,
    },
    {
      id: "video",
      completed: !!coachProfile.videoUrl,
      required: false,
    },
    {
      id: "pricing",
      completed: !!(coachProfile.hourlyRate && coachProfile.trialRate),
      required: true,
    },
    {
      id: "specializations",
      completed: !!(coachProfile.specializations && Object.values(coachProfile.specializations).some(v => v)),
      required: true,
    },
    {
      id: "availability",
      completed: hasAvailability,
      required: true,
    },
    {
      id: "stripe",
      completed: !!coachProfile.stripeOnboarded,
      required: true,
    },
  ];

  const requiredItems = checklistItems.filter(item => item.required);
  const completedRequired = requiredItems.filter(item => item.completed).length;
  const totalRequired = requiredItems.length;
  const progressPercent = Math.round((completedRequired / totalRequired) * 100);
  const isProfileComplete = completedRequired === totalRequired;

  const getItemIcon = (id: string) => {
    switch (id) {
      case "bio":
        return FileText;
      case "headline":
        return Sparkles;
      case "photo":
        return Image;
      case "video":
        return Video;
      case "pricing":
        return CreditCard;
      case "specializations":
        return User;
      case "availability":
        return Calendar;
      case "stripe":
        return CreditCard;
      default:
        return Circle;
    }
  };

  const getItemAction = (id: string) => {
    switch (id) {
      case "bio":
      case "headline":
      case "photo":
      case "video":
      case "pricing":
      case "specializations":
        return onEditProfile;
      case "availability":
        return onSetAvailability;
      case "stripe":
        return onConnectStripe;
      default:
        return () => {};
    }
  };

  const getActionLabel = (id: string) => {
    switch (id) {
      case "availability":
        return labels.actions.setAvailability;
      case "stripe":
        return labels.actions.connectStripe;
      default:
        return labels.actions.editProfile;
    }
  };

  if (isProfileComplete) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">{labels.profileLive}</h3>
              <p className="text-sm text-green-600">{labels.profileLiveDesc}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{labels.title}</CardTitle>
            <CardDescription>{labels.description}</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{labels.progress}</p>
              <p className="text-2xl font-bold text-primary">{progressPercent}%</p>
            </div>
            <ChevronRight className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
          </div>
        </div>
        <Progress value={progressPercent} className="mt-4" />
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {checklistItems.map((item) => {
              const Icon = getItemIcon(item.id);
              const itemLabels = labels.items[item.id as keyof typeof labels.items];
              
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    item.completed
                      ? "bg-green-50 border-green-200"
                      : "bg-muted/50 border-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      item.completed ? "bg-green-100" : "bg-muted"
                    }`}>
                      {item.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${item.completed ? "text-green-800" : ""}`}>
                        {itemLabels.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {itemLabels.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.required ? "default" : "secondary"} className="text-xs">
                      {item.required ? labels.required : labels.optional}
                    </Badge>
                    {!item.completed && (
                      <Button size="sm" variant="outline" onClick={getItemAction(item.id)}>
                        {getActionLabel(item.id)}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-[#FFE4D6]">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">{labels.almostThere}</p>
                <p className="text-sm text-amber-600">{labels.almostThereDesc}</p>
              </div>
            </div>
          </div>

          {/* Profile Hidden Warning */}
          <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-start gap-3">
              <Circle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">
                  {language === "fr" ? "Profil masqué" : "Profile Hidden"}
                </p>
                <p className="text-sm text-red-600">
                  {language === "fr"
                    ? "Votre profil n'apparaît pas dans les résultats de recherche tant que la liste de vérification n'est pas complétée."
                    : "Your profile won't appear in search results until the checklist is complete."}
                </p>
              </div>
            </div>
          </div>

          {/* Coach Guide Link */}
          <Link href="/app/coach-guide">
            <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-primary">
                      {language === "fr" ? "Guide du coach" : "Coach Guide"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {language === "fr"
                        ? "Apprenez à réussir en tant que coach Lingueefy"
                        : "Learn how to succeed as a Lingueefy coach"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-primary" />
              </div>
            </div>
          </Link>
        </CardContent>
      )}
    </Card>
  );
}
