import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2, GraduationCap, Target, Calendar, Briefcase } from "lucide-react";

interface LearnerOnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type SLELevel = "X" | "A" | "B" | "C";
type TargetLevel = "A" | "B" | "C";
type PrimaryFocus = "oral" | "written" | "reading" | "all";
type TargetLanguage = "french" | "english";

const labels = {
  en: {
    title: "Complete Your Profile",
    subtitle: "Tell us about your SLE goals so we can match you with the right coach",
    step1: "Current Level",
    step2: "Target Goals",
    step3: "Additional Info",
    currentOral: "Current Oral Level",
    currentWritten: "Current Written Level",
    currentReading: "Current Reading Level",
    targetOral: "Target Oral Level",
    targetWritten: "Target Written Level",
    targetReading: "Target Reading Level",
    noLevel: "No level yet",
    levelA: "Level A",
    levelB: "Level B",
    levelC: "Level C",
    primaryFocus: "Primary Focus",
    focusOral: "Oral Expression",
    focusWritten: "Written Expression",
    focusReading: "Reading Comprehension",
    focusAll: "All Skills",
    targetLanguage: "Target Language",
    french: "French",
    english: "English",
    examDate: "Expected Exam Date",
    examDateHint: "When do you plan to take your SLE?",
    department: "Department (Optional)",
    departmentPlaceholder: "e.g., Treasury Board Secretariat",
    position: "Position (Optional)",
    positionPlaceholder: "e.g., Policy Analyst",
    learningGoals: "Learning Goals",
    learningGoalsPlaceholder: "What do you hope to achieve? Any specific challenges you want to work on?",
    back: "Back",
    next: "Next",
    submit: "Complete Profile",
    submitting: "Creating profile...",
  },
  fr: {
    title: "Complétez votre profil",
    subtitle: "Parlez-nous de vos objectifs ELS pour vous jumeler avec le bon coach",
    step1: "Niveau actuel",
    step2: "Objectifs cibles",
    step3: "Informations supplémentaires",
    currentOral: "Niveau oral actuel",
    currentWritten: "Niveau écrit actuel",
    currentReading: "Niveau lecture actuel",
    targetOral: "Niveau oral cible",
    targetWritten: "Niveau écrit cible",
    targetReading: "Niveau lecture cible",
    noLevel: "Pas encore de niveau",
    levelA: "Niveau A",
    levelB: "Niveau B",
    levelC: "Niveau C",
    primaryFocus: "Priorité principale",
    focusOral: "Expression orale",
    focusWritten: "Expression écrite",
    focusReading: "Compréhension de lecture",
    focusAll: "Toutes les compétences",
    targetLanguage: "Langue cible",
    french: "Français",
    english: "Anglais",
    examDate: "Date d'examen prévue",
    examDateHint: "Quand prévoyez-vous passer votre ELS?",
    department: "Ministère (Optionnel)",
    departmentPlaceholder: "ex., Secrétariat du Conseil du Trésor",
    position: "Poste (Optionnel)",
    positionPlaceholder: "ex., Analyste de politiques",
    learningGoals: "Objectifs d'apprentissage",
    learningGoalsPlaceholder: "Qu'espérez-vous accomplir? Des défis spécifiques à travailler?",
    back: "Retour",
    next: "Suivant",
    submit: "Compléter le profil",
    submitting: "Création du profil...",
  },
};

export function LearnerOnboardingModal({ open, onOpenChange, onSuccess }: LearnerOnboardingModalProps) {
  const { language } = useLanguage();
  const t = labels[language];
  const [step, setStep] = useState(1);
  
  // Form state
  const [currentLevel, setCurrentLevel] = useState<{ oral?: SLELevel; written?: SLELevel; reading?: SLELevel }>({});
  const [targetLevel, setTargetLevel] = useState<{ oral?: TargetLevel; written?: TargetLevel; reading?: TargetLevel }>({});
  const [primaryFocus, setPrimaryFocus] = useState<PrimaryFocus>("oral");
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>("french");
  const [examDate, setExamDate] = useState<string>("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [learningGoals, setLearningGoals] = useState("");

  const createProfile = trpc.learner.create.useMutation({
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
    },
  });

  const handleSubmit = () => {
    createProfile.mutate({
      currentLevel: Object.keys(currentLevel).length > 0 ? currentLevel : undefined,
      targetLevel: Object.keys(targetLevel).length > 0 ? targetLevel : undefined,
      primaryFocus,
      targetLanguage,
      examDate: examDate ? new Date(examDate) : undefined,
      department: department || undefined,
      position: position || undefined,
      learningGoals: learningGoals || undefined,
    });
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary mb-4">
        <GraduationCap className="h-5 w-5" />
        <span className="font-medium">{t.step1}</span>
      </div>
      
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>{t.currentOral}</Label>
          <Select value={currentLevel.oral || ""} onValueChange={(v) => setCurrentLevel({ ...currentLevel, oral: v as SLELevel })}>
            <SelectTrigger>
              <SelectValue placeholder={t.noLevel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="X">{t.noLevel}</SelectItem>
              <SelectItem value="A">{t.levelA}</SelectItem>
              <SelectItem value="B">{t.levelB}</SelectItem>
              <SelectItem value="C">{t.levelC}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t.currentWritten}</Label>
          <Select value={currentLevel.written || ""} onValueChange={(v) => setCurrentLevel({ ...currentLevel, written: v as SLELevel })}>
            <SelectTrigger>
              <SelectValue placeholder={t.noLevel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="X">{t.noLevel}</SelectItem>
              <SelectItem value="A">{t.levelA}</SelectItem>
              <SelectItem value="B">{t.levelB}</SelectItem>
              <SelectItem value="C">{t.levelC}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t.currentReading}</Label>
          <Select value={currentLevel.reading || ""} onValueChange={(v) => setCurrentLevel({ ...currentLevel, reading: v as SLELevel })}>
            <SelectTrigger>
              <SelectValue placeholder={t.noLevel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="X">{t.noLevel}</SelectItem>
              <SelectItem value="A">{t.levelA}</SelectItem>
              <SelectItem value="B">{t.levelB}</SelectItem>
              <SelectItem value="C">{t.levelC}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary mb-4">
        <Target className="h-5 w-5" />
        <span className="font-medium">{t.step2}</span>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>{t.targetOral}</Label>
          <Select value={targetLevel.oral || ""} onValueChange={(v) => setTargetLevel({ ...targetLevel, oral: v as TargetLevel })}>
            <SelectTrigger>
              <SelectValue placeholder={t.levelB} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">{t.levelA}</SelectItem>
              <SelectItem value="B">{t.levelB}</SelectItem>
              <SelectItem value="C">{t.levelC}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t.targetWritten}</Label>
          <Select value={targetLevel.written || ""} onValueChange={(v) => setTargetLevel({ ...targetLevel, written: v as TargetLevel })}>
            <SelectTrigger>
              <SelectValue placeholder={t.levelB} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">{t.levelA}</SelectItem>
              <SelectItem value="B">{t.levelB}</SelectItem>
              <SelectItem value="C">{t.levelC}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t.targetReading}</Label>
          <Select value={targetLevel.reading || ""} onValueChange={(v) => setTargetLevel({ ...targetLevel, reading: v as TargetLevel })}>
            <SelectTrigger>
              <SelectValue placeholder={t.levelB} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">{t.levelA}</SelectItem>
              <SelectItem value="B">{t.levelB}</SelectItem>
              <SelectItem value="C">{t.levelC}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t.primaryFocus}</Label>
          <Select value={primaryFocus} onValueChange={(v) => setPrimaryFocus(v as PrimaryFocus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oral">{t.focusOral}</SelectItem>
              <SelectItem value="written">{t.focusWritten}</SelectItem>
              <SelectItem value="reading">{t.focusReading}</SelectItem>
              <SelectItem value="all">{t.focusAll}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t.targetLanguage}</Label>
          <Select value={targetLanguage} onValueChange={(v) => setTargetLanguage(v as TargetLanguage)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="french">{t.french}</SelectItem>
              <SelectItem value="english">{t.english}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary mb-4">
        <Briefcase className="h-5 w-5" />
        <span className="font-medium">{t.step3}</span>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>{t.examDate}</Label>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <p className="text-xs text-muted-foreground">{t.examDateHint}</p>
        </div>

        <div className="space-y-2">
          <Label>{t.department}</Label>
          <Input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder={t.departmentPlaceholder}
          />
        </div>

        <div className="space-y-2">
          <Label>{t.position}</Label>
          <Input
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder={t.positionPlaceholder}
          />
        </div>

        <div className="space-y-2">
          <Label>{t.learningGoals}</Label>
          <Textarea
            value={learningGoals}
            onChange={(e) => setLearningGoals(e.target.value)}
            placeholder={t.learningGoalsPlaceholder}
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.subtitle}</DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="py-4">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        <DialogFooter className="flex gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              {t.back}
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} className="flex-1">
              {t.next}
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={createProfile.isPending}
              className="flex-1"
            >
              {createProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.submitting}
                </>
              ) : (
                t.submit
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
