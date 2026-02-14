import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Trophy, Plus, Search, Edit2, Trash2, Calendar, Users,
  Loader2, Target, Zap, Award, Clock, BarChart3,
  CheckCircle, XCircle, Star, Flame, BookOpen, Mic,
  PenTool, Brain, MessageSquare,
} from "lucide-react";

type ViewMode = "list" | "calendar";

interface ChallengeForm {
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  challengeType: string;
  targetCount: number;
  targetUnit: string;
  xpReward: number;
  badgeReward: string;
  weekStart: string;
  weekEnd: string;
  isActive: boolean;
}

const defaultForm: ChallengeForm = {
  title: "",
  titleFr: "",
  description: "",
  descriptionFr: "",
  challengeType: "oral_challenge",
  targetCount: 5,
  targetUnit: "exercises",
  xpReward: 100,
  badgeReward: "",
  weekStart: new Date().toISOString().split("T")[0],
  weekEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  isActive: true,
};

const challengeTypes = [
  { value: "oral_challenge", label: "Oral Challenge", icon: Mic, color: "bg-blue-100 text-blue-700" },
  { value: "writing_prompt", label: "Writing Prompt", icon: PenTool, color: "bg-purple-100 text-purple-700" },
  { value: "reading_challenge", label: "Reading Challenge", icon: BookOpen, color: "bg-emerald-100 text-emerald-700" },
  { value: "vocabulary_sprint", label: "Vocabulary Sprint", icon: Brain, color: "bg-amber-100 text-amber-700" },
  { value: "grammar_gauntlet", label: "Grammar Gauntlet", icon: Target, color: "bg-red-100 text-red-700" },
  { value: "conversation_practice", label: "Conversation Practice", icon: MessageSquare, color: "bg-teal-100 text-teal-700" },
];

// Mock data for admin display
const mockChallenges = [
  {
    id: 1,
    title: "Speak Like a Pro",
    titleFr: "Parlez Comme un Pro",
    description: "Complete 5 oral practice sessions this week",
    descriptionFr: "Complétez 5 sessions de pratique orale cette semaine",
    challengeType: "oral_challenge",
    targetCount: 5,
    targetUnit: "sessions",
    xpReward: 150,
    badgeReward: "oral_champion",
    weekStart: new Date().toISOString(),
    weekEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    participants: 47,
    completions: 12,
  },
  {
    id: 2,
    title: "Vocabulary Blitz",
    titleFr: "Blitz de Vocabulaire",
    description: "Learn 50 new vocabulary words",
    descriptionFr: "Apprenez 50 nouveaux mots de vocabulaire",
    challengeType: "vocabulary_sprint",
    targetCount: 50,
    targetUnit: "words",
    xpReward: 200,
    badgeReward: "vocab_master",
    weekStart: new Date().toISOString(),
    weekEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    participants: 83,
    completions: 29,
  },
  {
    id: 3,
    title: "Grammar Gauntlet",
    titleFr: "Défi de Grammaire",
    description: "Score 80%+ on 10 grammar exercises",
    descriptionFr: "Obtenez 80%+ sur 10 exercices de grammaire",
    challengeType: "grammar_gauntlet",
    targetCount: 10,
    targetUnit: "exercises",
    xpReward: 175,
    badgeReward: "grammar_guru",
    weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    weekEnd: new Date().toISOString(),
    isActive: false,
    participants: 65,
    completions: 41,
  },
];

export default function WeeklyChallenges() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [form, setForm] = useState<ChallengeForm>(defaultForm);
  const [challenges] = useState(mockChallenges);

  const filteredChallenges = useMemo(() => {
    return challenges.filter(
      (c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.titleFr.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [challenges, searchQuery]);

  const activeChallenges = filteredChallenges.filter((c) => c.isActive);
  const pastChallenges = filteredChallenges.filter((c) => !c.isActive);

  const handleCreate = () => {
    toast.success("Challenge created successfully!");
    setShowCreateDialog(false);
    setForm(defaultForm);
  };

  const handleEdit = (challenge: any) => {
    setSelectedChallenge(challenge);
    setForm({
      title: challenge.title,
      titleFr: challenge.titleFr,
      description: challenge.description,
      descriptionFr: challenge.descriptionFr,
      challengeType: challenge.challengeType,
      targetCount: challenge.targetCount,
      targetUnit: challenge.targetUnit,
      xpReward: challenge.xpReward,
      badgeReward: challenge.badgeReward || "",
      weekStart: new Date(challenge.weekStart).toISOString().split("T")[0],
      weekEnd: new Date(challenge.weekEnd).toISOString().split("T")[0],
      isActive: challenge.isActive,
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    toast.success("Challenge updated successfully!");
    setShowEditDialog(false);
  };

  const handleDelete = (id: number) => {
    toast.success("Challenge deleted");
  };

  const totalParticipants = challenges.reduce((sum, c) => sum + c.participants, 0);
  const totalCompletions = challenges.reduce((sum, c) => sum + c.completions, 0);

  const ChallengeFormFields = () => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Title (EN)</Label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Challenge title" />
        </div>
        <div>
          <Label>Titre (FR)</Label>
          <Input value={form.titleFr} onChange={(e) => setForm({ ...form, titleFr: e.target.value })} placeholder="Titre du défi" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Description (EN)</Label>
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
        </div>
        <div>
          <Label>Description (FR)</Label>
          <Textarea value={form.descriptionFr} onChange={(e) => setForm({ ...form, descriptionFr: e.target.value })} rows={2} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Challenge Type</Label>
          <Select value={form.challengeType} onValueChange={(v) => setForm({ ...form, challengeType: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {challengeTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>XP Reward</Label>
          <Input type="number" value={form.xpReward} onChange={(e) => setForm({ ...form, xpReward: Number(e.target.value) })} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Target Count</Label>
          <Input type="number" value={form.targetCount} onChange={(e) => setForm({ ...form, targetCount: Number(e.target.value) })} />
        </div>
        <div>
          <Label>Target Unit</Label>
          <Input value={form.targetUnit} onChange={(e) => setForm({ ...form, targetUnit: e.target.value })} placeholder="exercises, words, sessions" />
        </div>
        <div>
          <Label>Badge Reward</Label>
          <Input value={form.badgeReward} onChange={(e) => setForm({ ...form, badgeReward: e.target.value })} placeholder="badge_key" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Week Start</Label>
          <Input type="date" value={form.weekStart} onChange={(e) => setForm({ ...form, weekStart: e.target.value })} />
        </div>
        <div>
          <Label>Week End</Label>
          <Input type="date" value={form.weekEnd} onChange={(e) => setForm({ ...form, weekEnd: e.target.value })} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
        <Label>Active</Label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            Weekly Challenges
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage weekly challenges to boost learner engagement
          </p>
        </div>
        <Button className="bg-[#C65A1E] hover:bg-[#A84A15] text-white" onClick={() => { setForm(defaultForm); setShowCreateDialog(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          New Challenge
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <Trophy className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeChallenges.length}</p>
              <p className="text-xs text-muted-foreground">Active Challenges</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalParticipants}</p>
              <p className="text-xs text-muted-foreground">Total Participants</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalCompletions}</p>
              <p className="text-xs text-muted-foreground">Completions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {totalParticipants > 0 ? Math.round((totalCompletions / totalParticipants) * 100) : 0}%
              </p>
              <p className="text-xs text-muted-foreground">Completion Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search challenges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Active Challenges
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {activeChallenges.map((challenge) => {
              const typeInfo = challengeTypes.find((t) => t.value === challenge.challengeType);
              const TypeIcon = typeInfo?.icon || Target;
              const completionRate = challenge.participants > 0 ? Math.round((challenge.completions / challenge.participants) * 100) : 0;
              return (
                <Card key={challenge.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${typeInfo?.color || "bg-gray-100"}`}>
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{challenge.title}</h3>
                          <p className="text-xs text-muted-foreground">{challenge.titleFr}</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {challenge.targetCount} {challenge.targetUnit}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {challenge.xpReward} XP
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(challenge.weekEnd).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {challenge.participants} participants
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {completionRate}% completed
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(challenge)}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(challenge.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Past Challenges */}
      {pastChallenges.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-400" />
            Past Challenges
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {pastChallenges.map((challenge) => {
              const typeInfo = challengeTypes.find((t) => t.value === challenge.challengeType);
              const TypeIcon = typeInfo?.icon || Target;
              const completionRate = challenge.participants > 0 ? Math.round((challenge.completions / challenge.participants) * 100) : 0;
              return (
                <Card key={challenge.id} className="opacity-75 hover:opacity-100 transition-opacity">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${typeInfo?.color || "bg-gray-100"}`}>
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{challenge.title}</h3>
                          <p className="text-xs text-muted-foreground">{challenge.titleFr}</p>
                        </div>
                      </div>
                      <Badge variant="outline">Ended</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{challenge.participants} participants</span>
                      <span>{completionRate}% completed</span>
                      <span>{challenge.xpReward} XP</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Challenge</DialogTitle>
          </DialogHeader>
          <ChallengeFormFields />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button className="bg-[#C65A1E] hover:bg-[#A84A15] text-white" onClick={handleCreate}>
              Create Challenge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Challenge</DialogTitle>
          </DialogHeader>
          <ChallengeFormFields />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button className="bg-[#C65A1E] hover:bg-[#A84A15] text-white" onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
