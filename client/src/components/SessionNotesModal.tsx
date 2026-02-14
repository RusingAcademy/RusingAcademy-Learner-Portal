import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, FileText, BookOpen, Target, GraduationCap } from "lucide-react";

interface SessionNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: number;
  learnerName: string;
  existingNotes?: {
    id: number;
    notes: string;
    topicsCovered: string[] | null;
    areasForImprovement: string[] | null;
    homework: string | null;
    oralLevel: string | null;
    writtenLevel: string | null;
    readingLevel: string | null;
    sharedWithLearner: boolean | null;
  };
  onSuccess?: () => void;
}

const sleeLevels = ["X", "A", "B", "C"];

export default function SessionNotesModal({
  isOpen,
  onClose,
  sessionId,
  learnerName,
  existingNotes,
  onSuccess,
}: SessionNotesModalProps) {
  const { language } = useLanguage();
  const isEn = language === "en";
  
  const [notes, setNotes] = useState(existingNotes?.notes || "");
  const [topicsCovered, setTopicsCovered] = useState(
    existingNotes?.topicsCovered?.join(", ") || ""
  );
  const [areasForImprovement, setAreasForImprovement] = useState(
    existingNotes?.areasForImprovement?.join(", ") || ""
  );
  const [homework, setHomework] = useState(existingNotes?.homework || "");
  const [oralLevel, setOralLevel] = useState(existingNotes?.oralLevel || "");
  const [writtenLevel, setWrittenLevel] = useState(existingNotes?.writtenLevel || "");
  const [readingLevel, setReadingLevel] = useState(existingNotes?.readingLevel || "");
  const [sharedWithLearner, setSharedWithLearner] = useState(
    existingNotes?.sharedWithLearner ?? false
  );
  
  const saveMutation = trpc.coach.saveSessionNotes.useMutation({
    onSuccess: () => {
      toast.success(isEn ? "Notes saved" : "Notes enregistrées", {
        description: isEn 
          ? "Session notes have been saved successfully." 
          : "Les notes de séance ont été enregistrées avec succès.",
      });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(isEn ? "Failed to save notes" : "Échec de l'enregistrement des notes", {
        description: error.message,
      });
    },
  });
  
  const handleSave = () => {
    saveMutation.mutate({
      sessionId,
      notes,
      topicsCovered: topicsCovered.split(",").map(t => t.trim()).filter(Boolean),
      areasForImprovement: areasForImprovement.split(",").map(t => t.trim()).filter(Boolean),
      homework: homework || null,
      oralLevel: oralLevel as "X" | "A" | "B" | "C" | null || null,
      writtenLevel: writtenLevel as "X" | "A" | "B" | "C" | null || null,
      readingLevel: readingLevel as "X" | "A" | "B" | "C" | null || null,
      sharedWithLearner,
    });
  };
  
  const content = {
    en: {
      title: "Session Notes",
      subtitle: "Add notes for your session with",
      notes: "Session Notes",
      notesPlaceholder: "Write your observations about the session, learner progress, areas covered...",
      topicsCovered: "Topics Covered",
      topicsPlaceholder: "Grammar, Vocabulary, Oral comprehension (comma-separated)",
      areasForImprovement: "Areas for Improvement",
      areasPlaceholder: "Pronunciation, Writing structure (comma-separated)",
      homework: "Homework / Next Steps",
      homeworkPlaceholder: "Practice exercises, reading assignments...",
      sleAssessment: "SLE Level Assessment",
      oral: "Oral",
      written: "Written",
      reading: "Reading",
      selectLevel: "Select level",
      shareWithLearner: "Share with Learner",
      shareDescription: "Allow the learner to view these notes",
      save: "Save Notes",
      cancel: "Cancel",
    },
    fr: {
      title: "Notes de séance",
      subtitle: "Ajouter des notes pour votre séance avec",
      notes: "Notes de séance",
      notesPlaceholder: "Écrivez vos observations sur la séance, les progrès de l'apprenant, les sujets abordés...",
      topicsCovered: "Sujets abordés",
      topicsPlaceholder: "Grammaire, Vocabulaire, Compréhension orale (séparés par des virgules)",
      areasForImprovement: "Points à améliorer",
      areasPlaceholder: "Prononciation, Structure d'écriture (séparés par des virgules)",
      homework: "Devoirs / Prochaines étapes",
      homeworkPlaceholder: "Exercices pratiques, lectures assignées...",
      sleAssessment: "Évaluation du niveau ELS",
      oral: "Oral",
      written: "Écrit",
      reading: "Lecture",
      selectLevel: "Sélectionner le niveau",
      shareWithLearner: "Partager avec l'apprenant",
      shareDescription: "Permettre à l'apprenant de voir ces notes",
      save: "Enregistrer les notes",
      cancel: "Annuler",
    },
  };
  
  const t = isEn ? content.en : content.fr;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t.title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {t.subtitle} <span className="font-medium">{learnerName}</span>
          </p>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Main Notes */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {t.notes}
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.notesPlaceholder}
              rows={5}
            />
          </div>
          
          {/* Topics Covered */}
          <div className="space-y-2">
            <Label>{t.topicsCovered}</Label>
            <Input
              value={topicsCovered}
              onChange={(e) => setTopicsCovered(e.target.value)}
              placeholder={t.topicsPlaceholder}
            />
          </div>
          
          {/* Areas for Improvement */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              {t.areasForImprovement}
            </Label>
            <Input
              value={areasForImprovement}
              onChange={(e) => setAreasForImprovement(e.target.value)}
              placeholder={t.areasPlaceholder}
            />
          </div>
          
          {/* Homework */}
          <div className="space-y-2">
            <Label>{t.homework}</Label>
            <Textarea
              value={homework}
              onChange={(e) => setHomework(e.target.value)}
              placeholder={t.homeworkPlaceholder}
              rows={2}
            />
          </div>
          
          {/* SLE Assessment */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              {t.sleAssessment}
            </Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">{t.oral}</Label>
                <Select value={oralLevel} onValueChange={setOralLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectLevel} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">-</SelectItem>
                    {sleeLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">{t.written}</Label>
                <Select value={writtenLevel} onValueChange={setWrittenLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectLevel} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">-</SelectItem>
                    {sleeLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">{t.reading}</Label>
                <Select value={readingLevel} onValueChange={setReadingLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectLevel} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">-</SelectItem>
                    {sleeLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Share with Learner */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div className="space-y-0.5">
              <Label>{t.shareWithLearner}</Label>
              <p className="text-sm text-muted-foreground">{t.shareDescription}</p>
            </div>
            <Switch
              checked={sharedWithLearner}
              onCheckedChange={setSharedWithLearner}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t.cancel}
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending || !notes.trim()}>
            {saveMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEn ? "Saving..." : "Enregistrement..."}
              </>
            ) : (
              t.save
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
