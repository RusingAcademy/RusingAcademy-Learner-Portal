import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STEPS = [
  { id: "welcome", title: "Welcome", titleFr: "Bienvenue" },
  { id: "level", title: "Current Level", titleFr: "Niveau actuel" },
  { id: "target", title: "Target Level", titleFr: "Niveau cible" },
  { id: "goal", title: "Learning Goal", titleFr: "Objectif d'apprentissage" },
  { id: "schedule", title: "Study Schedule", titleFr: "Horaire d'étude" },
  { id: "complete", title: "All Set!", titleFr: "Tout est prêt !" },
];

const LEVELS = [
  { value: "A1", label: "A1 — Beginner", desc: "Basic phrases and introductions" },
  { value: "A2", label: "A2 — Elementary", desc: "Simple everyday conversations" },
  { value: "B1", label: "B1 — Intermediate", desc: "Handle most workplace situations" },
  { value: "B2", label: "B2 — Upper Intermediate", desc: "Fluent in professional contexts" },
  { value: "C1", label: "C1 — Advanced", desc: "Complex texts and nuanced expression" },
];

const GOALS = [
  { value: "sle_prep", label: "SLE Exam Preparation", icon: "📝", desc: "Prepare for the Second Language Evaluation" },
  { value: "career", label: "Career Advancement", icon: "📈", desc: "Improve bilingual skills for promotion" },
  { value: "communication", label: "Daily Communication", icon: "💬", desc: "Communicate better with colleagues" },
  { value: "reading", label: "Reading & Comprehension", icon: "📚", desc: "Understand French documents and reports" },
  { value: "writing", label: "Written Expression", icon: "✍️", desc: "Write professional French correspondence" },
];

const SCHEDULES = [
  { hours: 2, time: "morning", label: "Light — 2h/week", desc: "Quick daily sessions", icon: "🌱" },
  { hours: 5, time: "afternoon", label: "Regular — 5h/week", desc: "Steady progress", icon: "📖" },
  { hours: 10, time: "evening", label: "Intensive — 10h/week", desc: "Accelerated learning", icon: "🚀" },
  { hours: 15, time: "flexible", label: "Immersive — 15h/week", desc: "Maximum progress", icon: "⚡" },
];

export default function OnboardingWizard() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [currentLevel, setCurrentLevel] = useState("A2");
  const [targetLevel, setTargetLevel] = useState("B2");
  const [learningGoal, setLearningGoal] = useState("sle_prep");
  const [weeklyHours, setWeeklyHours] = useState(5);
  const [preferredTime, setPreferredTime] = useState("afternoon");

  const saveProfile = trpc.onboarding.save.useMutation({
    onSuccess: () => {
      toast.success("Profile saved! Welcome to RusingAcademy!");
      setStep(STEPS.length - 1);
    },
  });

  const handleComplete = () => {
    saveProfile.mutate({ currentLevel, targetLevel, learningGoal, weeklyHours, preferredTime });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Progress */}
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex-1 flex items-center">
              <div className={`h-2 flex-1 rounded-full transition-all ${i <= step ? "bg-primary" : "bg-muted"}`} />
            </div>
          ))}
        </div>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <Card>
            <CardContent className="py-12 text-center space-y-6">
              <div className="text-6xl">🎓</div>
              <h1 className="text-3xl font-bold">Welcome to RusingAcademy</h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Let's personalize your learning experience. This takes about 1 minute.
              </p>
              <p className="text-sm text-muted-foreground">
                Preparing public servants for bilingual excellence in Canada's federal workplace
              </p>
              <Button size="lg" onClick={() => setStep(1)}>
                Get Started →
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Current Level */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">What's your current French level?</CardTitle>
              <p className="text-muted-foreground">Select the level that best describes your abilities</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {LEVELS.map(level => (
                <button
                  key={level.value}
                  onClick={() => setCurrentLevel(level.value)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    currentLevel === level.value
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{level.label}</h4>
                      <p className="text-sm text-muted-foreground">{level.desc}</p>
                    </div>
                    {currentLevel === level.value && <Badge>Selected</Badge>}
                  </div>
                </button>
              ))}
              <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={() => setStep(0)}>← Back</Button>
                <Button onClick={() => setStep(2)}>Next →</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Target Level */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">What level do you want to achieve?</CardTitle>
              <p className="text-muted-foreground">Set your target for the SLE or personal growth</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {LEVELS.filter(l => l.value > currentLevel).map(level => (
                <button
                  key={level.value}
                  onClick={() => setTargetLevel(level.value)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    targetLevel === level.value
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{level.label}</h4>
                      <p className="text-sm text-muted-foreground">{level.desc}</p>
                    </div>
                    {targetLevel === level.value && <Badge>Target</Badge>}
                  </div>
                </button>
              ))}
              <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={() => setStep(1)}>← Back</Button>
                <Button onClick={() => setStep(3)}>Next →</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Learning Goal */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">What's your primary learning goal?</CardTitle>
              <p className="text-muted-foreground">This helps us recommend the right content for you</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {GOALS.map(goal => (
                <button
                  key={goal.value}
                  onClick={() => setLearningGoal(goal.value)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    learningGoal === goal.value
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{goal.icon}</span>
                    <div>
                      <h4 className="font-medium">{goal.label}</h4>
                      <p className="text-sm text-muted-foreground">{goal.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
              <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={() => setStep(2)}>← Back</Button>
                <Button onClick={() => setStep(4)}>Next →</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Schedule */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">How much time can you dedicate?</CardTitle>
              <p className="text-muted-foreground">We'll create a study plan that fits your schedule</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {SCHEDULES.map(schedule => (
                <button
                  key={schedule.hours}
                  onClick={() => { setWeeklyHours(schedule.hours); setPreferredTime(schedule.time); }}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    weeklyHours === schedule.hours
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{schedule.icon}</span>
                    <div>
                      <h4 className="font-medium">{schedule.label}</h4>
                      <p className="text-sm text-muted-foreground">{schedule.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
              <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={() => setStep(3)}>← Back</Button>
                <Button onClick={handleComplete} disabled={saveProfile.isPending}>
                  {saveProfile.isPending ? "Saving..." : "Complete Setup ✓"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Complete */}
        {step === STEPS.length - 1 && (
          <Card>
            <CardContent className="py-12 text-center space-y-6">
              <div className="text-6xl">🎉</div>
              <h1 className="text-3xl font-bold">You're All Set!</h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Your personalized learning path is ready. Let's start your journey to bilingual excellence!
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary">Current: {currentLevel}</Badge>
                <Badge>Target: {targetLevel}</Badge>
                <Badge variant="outline">{weeklyHours}h/week</Badge>
              </div>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                </Button>
                <Button onClick={() => navigate("/paths")}>
                  Browse Learning Paths →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
