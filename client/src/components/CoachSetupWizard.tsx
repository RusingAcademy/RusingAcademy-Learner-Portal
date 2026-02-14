import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  BookOpen, 
  DollarSign, 
  Calendar, 
  Video,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface CoachSetupWizardProps {
  onComplete: () => void;
  initialData?: {
    headline?: string;
    bio?: string;
    specializations?: Record<string, boolean>;
    hourlyRate?: number;
    trialRate?: number;
    videoUrl?: string;
  };
}

const STEPS = [
  { id: 1, title: "Basic Info", icon: User, description: "Tell learners about yourself" },
  { id: 2, title: "Specialties", icon: BookOpen, description: "Your SLE expertise areas" },
  { id: 3, title: "Pricing", icon: DollarSign, description: "Set your session rates" },
  { id: 4, title: "Availability", icon: Calendar, description: "When you're available" },
  { id: 5, title: "Video", icon: Video, description: "Add an intro video" },
];

const SPECIALIZATIONS = [
  { id: "oralA", label: "Oral A", description: "Basic oral proficiency" },
  { id: "oralB", label: "Oral B", description: "Intermediate oral proficiency" },
  { id: "oralC", label: "Oral C", description: "Advanced oral proficiency" },
  { id: "writtenA", label: "Written A", description: "Basic written proficiency" },
  { id: "writtenB", label: "Written B", description: "Intermediate written proficiency" },
  { id: "writtenC", label: "Written C", description: "Advanced written proficiency" },
  { id: "readingComprehension", label: "Reading Comprehension", description: "Reading skills" },
  { id: "examPrep", label: "Exam Preparation", description: "SLE exam strategies" },
  { id: "businessFrench", label: "Business French", description: "Professional French" },
  { id: "anxietyCoaching", label: "Anxiety Coaching", description: "Test anxiety management" },
];

const DAYS_OF_WEEK = [
  { id: 0, label: "Sunday", short: "Sun" },
  { id: 1, label: "Monday", short: "Mon" },
  { id: 2, label: "Tuesday", short: "Tue" },
  { id: 3, label: "Wednesday", short: "Wed" },
  { id: 4, label: "Thursday", short: "Thu" },
  { id: 5, label: "Friday", short: "Fri" },
  { id: 6, label: "Saturday", short: "Sat" },
];

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00", 
  "18:00", "19:00", "20:00"
];

export function CoachSetupWizard({ onComplete, initialData }: CoachSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    headline: initialData?.headline || "",
    bio: initialData?.bio || "",
    yearsExperience: "",
    credentials: "",
    
    // Step 2: Specializations
    specializations: initialData?.specializations || {} as Record<string, boolean>,
    languages: "french" as "french" | "english" | "both",
    
    // Step 3: Pricing
    hourlyRate: initialData?.hourlyRate ? String(initialData.hourlyRate / 100) : "75",
    trialRate: initialData?.trialRate ? String(initialData.trialRate / 100) : "35",
    
    // Step 4: Availability
    availability: {} as Record<number, { start: string; end: string }>,
    
    // Step 5: Video
    videoUrl: initialData?.videoUrl || "",
  });

  const updateCoachProfile = trpc.coach.update.useMutation();
  const setAvailability = trpc.coach.setAvailability.useMutation();

  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSpecializationToggle = (id: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: {
        ...prev.specializations,
        [id]: !prev.specializations[id]
      }
    }));
  };

  const handleAvailabilityToggle = (dayId: number) => {
    setFormData(prev => {
      const newAvailability = { ...prev.availability };
      if (newAvailability[dayId]) {
        delete newAvailability[dayId];
      } else {
        newAvailability[dayId] = { start: "09:00", end: "17:00" };
      }
      return { ...prev, availability: newAvailability };
    });
  };

  const handleAvailabilityTimeChange = (dayId: number, field: "start" | "end", value: string) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [dayId]: {
          ...prev.availability[dayId],
          [field]: value
        }
      }
    }));
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // Update coach profile
      await updateCoachProfile.mutateAsync({
        headline: formData.headline,
        bio: formData.bio,
        yearsExperience: parseInt(formData.yearsExperience) || 0,
        credentials: formData.credentials,
        specializations: formData.specializations,
        languages: formData.languages,
        hourlyRate: Math.round(parseFloat(formData.hourlyRate) * 100),
        trialRate: Math.round(parseFloat(formData.trialRate) * 100),
        videoUrl: formData.videoUrl || null,
      });

      // Set availability for all days at once
      const availabilitySlots = Object.entries(formData.availability).map(([dayId, times]) => ({
        dayOfWeek: parseInt(dayId),
        startTime: times.start,
        endTime: times.end,
        timezone: "America/Toronto",
        isActive: true,
      }));
      
      if (availabilitySlots.length > 0) {
        await setAvailability.mutateAsync(availabilitySlots);
      }

      toast.success("Profile setup complete! Your profile is now live.");
      onComplete();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="headline">Professional Headline</Label>
              <Input
                id="headline"
                placeholder="e.g., GC Exam Coach | Oral C Specialist | 10+ Years Experience"
                value={formData.headline}
                onChange={(e) => setFormData(prev => ({ ...prev, headline: e.target.value }))}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                This appears below your name on your profile ({formData.headline.length}/200)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">About You</Label>
              <Textarea
                id="bio"
                placeholder="Tell learners about your background, teaching style, and what makes you unique..."
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Years of Experience</Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  min="0"
                  placeholder="e.g., 5"
                  value={formData.yearsExperience}
                  onChange={(e) => setFormData(prev => ({ ...prev, yearsExperience: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="languages">Teaching Language</Label>
                <Select 
                  value={formData.languages} 
                  onValueChange={(value: "french" | "english" | "both") => 
                    setFormData(prev => ({ ...prev, languages: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="credentials">Credentials & Certifications</Label>
              <Textarea
                id="credentials"
                placeholder="List your relevant qualifications, certifications, or achievements..."
                value={formData.credentials}
                onChange={(e) => setFormData(prev => ({ ...prev, credentials: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Select the SLE levels and areas you specialize in teaching:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SPECIALIZATIONS.map((spec) => (
                <div
                  key={spec.id}
                  className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    formData.specializations[spec.id]
                      ? "bg-primary/5 border-primary"
                      : "bg-muted/30 hover:bg-muted/50"
                  }`}
                  onClick={() => handleSpecializationToggle(spec.id)}
                >
                  <Checkbox
                    checked={formData.specializations[spec.id] || false}
                    onCheckedChange={() => handleSpecializationToggle(spec.id)}
                  />
                  <div className="space-y-1">
                    <p className="font-medium leading-none">{spec.label}</p>
                    <p className="text-sm text-muted-foreground">{spec.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Trial Session</CardTitle>
                  <CardDescription>30-minute introductory session</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="trialRate">Price (CAD)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="trialRate"
                        type="number"
                        min="1"
                        max="100"
                        step="1"
                        className="pl-7"
                        value={formData.trialRate}
                        onChange={(e) => {
                          const value = Math.min(100, Math.max(1, Number(e.target.value) || 1));
                          setFormData(prev => ({ ...prev, trialRate: String(value) }));
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recommended: $25-$45 for trial sessions
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Regular Session</CardTitle>
                  <CardDescription>60-minute coaching session</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Price (CAD)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="hourlyRate"
                        type="number"
                        min="1"
                        max="100"
                        step="1"
                        className="pl-7"
                        value={formData.hourlyRate}
                        onChange={(e) => {
                          const value = Math.min(100, Math.max(1, Number(e.target.value) || 1));
                          setFormData(prev => ({ ...prev, hourlyRate: String(value) }));
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recommended: $60-$100 for regular sessions
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Platform Fee</p>
                    <p className="text-sm text-muted-foreground">
                      Lingueefy charges a 15-26% commission on each session (varies based on volume). 
                      You'll receive payouts directly to your bank account via Stripe.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Select the days and times you're available for coaching sessions:
            </p>
            <div className="space-y-4">
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    formData.availability[day.id]
                      ? "bg-primary/5 border-primary"
                      : "bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={!!formData.availability[day.id]}
                        onCheckedChange={() => handleAvailabilityToggle(day.id)}
                      />
                      <span className="font-medium">{day.label}</span>
                    </div>
                    
                    {formData.availability[day.id] && (
                      <div className="flex items-center gap-2">
                        <Select
                          value={formData.availability[day.id].start}
                          onValueChange={(value) => handleAvailabilityTimeChange(day.id, "start", value)}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_SLOTS.map((time) => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-muted-foreground">to</span>
                        <Select
                          value={formData.availability[day.id].end}
                          onValueChange={(value) => handleAvailabilityTimeChange(day.id, "end", value)}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_SLOTS.map((time) => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="videoUrl">YouTube Video URL</Label>
              <Input
                id="videoUrl"
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.videoUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Add a short (1-3 minute) introduction video to help learners get to know you
              </p>
            </div>

            {formData.videoUrl && formData.videoUrl.includes("youtube.com") && (
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${formData.videoUrl.split("v=")[1]?.split("&")[0]}`}
                  title="Video preview"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-emerald-900">Almost Done!</p>
                    <p className="text-sm text-emerald-700">
                      After completing setup, your profile will be live and learners can start booking sessions with you.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Complete Your Profile</h2>
          <span className="text-sm text-muted-foreground">
            Step {currentStep} of {STEPS.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between mb-8">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          
          return (
            <div
              key={step.id}
              className={`flex flex-col items-center gap-2 ${
                isActive ? "text-primary" : isCompleted ? "text-emerald-600" : "text-muted-foreground"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isCompleted
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-muted"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <span className="text-xs font-medium hidden md:block">{step.title}</span>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
          <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {currentStep < STEPS.length ? (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleComplete} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Complete Setup
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
