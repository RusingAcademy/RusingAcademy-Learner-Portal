import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import {
  User,
  Settings,
  Bell,
  Target,
  Calendar,
  Loader2,
  Save,
  Camera,
  Building,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { Link } from "wouter";
import { useAppLayout } from "@/contexts/AppLayoutContext";

const sleLevels = ["X", "A", "B", "C"];
const targetLevels = ["A", "B", "C"];

export default function LearnerSettings() {
  const { isInsideAppLayout } = useAppLayout();
  const { language } = useLanguage();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const isEn = language === "en";
  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile state
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [learningGoals, setLearningGoals] = useState("");
  const [primaryFocus, setPrimaryFocus] = useState<"oral" | "written" | "reading" | "all">("oral");
  const [targetLanguage, setTargetLanguage] = useState<"french" | "english">("french");
  
  // SLE Levels
  const [currentOral, setCurrentOral] = useState("");
  const [currentWritten, setCurrentWritten] = useState("");
  const [currentReading, setCurrentReading] = useState("");
  const [targetOral, setTargetOral] = useState("");
  const [targetWritten, setTargetWritten] = useState("");
  const [targetReading, setTargetReading] = useState("");
  
  // Exam date
  const [examDate, setExamDate] = useState("");
  
  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  
  // Fetch learner profile
  const { data: profile, isLoading: profileLoading, refetch } = trpc.learner.myProfile.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  // Update mutation
  const updateMutation = trpc.learner.update.useMutation({
    onSuccess: () => {
      toast.success(isEn ? "Profile updated" : "Profil mis à jour");
      refetch();
    },
    onError: (error: any) => {
      toast.error(isEn ? "Failed to update profile" : "Échec de la mise à jour du profil", {
        description: error.message,
      });
    },
  });
  
  // Report preferences mutation
  const updateReportsMutation = trpc.learner.updateReportPreferences.useMutation({
    onSuccess: () => {
      toast.success(isEn ? "Preferences saved" : "Préférences enregistrées");
    },
    onError: (error: any) => {
      toast.error(isEn ? "Failed to save preferences" : "Échec de l'enregistrement des préférences");
    },
  });
  
  // Load profile data
  useEffect(() => {
    if (profile) {
      setDepartment(profile.department || "");
      setPosition(profile.position || "");
      setLearningGoals(profile.learningGoals || "");
      setPrimaryFocus(profile.primaryFocus || "oral");
      setTargetLanguage(profile.targetLanguage || "french");
      
      const current = profile.currentLevel as any || {};
      setCurrentOral(current.oral || "");
      setCurrentWritten(current.writing || "");
      setCurrentReading(current.reading || "");
      
      const target = profile.targetLevel as any || {};
      setTargetOral(target.oral || "");
      setTargetWritten(target.writing || "");
      setTargetReading(target.reading || "");
      
      if (profile.examDate) {
        setExamDate(new Date(profile.examDate).toISOString().split("T")[0]);
      }
      
      setWeeklyReports(profile.weeklyReportEnabled ?? true);
    }
  }, [profile]);
  
  const handleSaveProfile = () => {
    updateMutation.mutate({
      department: department || undefined,
      position: position || undefined,
      learningGoals: learningGoals || undefined,
      primaryFocus,
      targetLanguage,
      currentLevel: {
        oral: currentOral as any || undefined,
        writing: currentWritten as any || undefined,
        reading: currentReading as any || undefined,
      },
      targetLevel: {
        oral: targetOral as any || undefined,
        writing: targetWritten as any || undefined,
        reading: targetReading as any || undefined,
      },
      examDate: examDate ? new Date(examDate) : undefined,
    });
  };
  
  const handleSaveNotifications = () => {
    updateReportsMutation.mutate({
      weeklyReportEnabled: weeklyReports,
      weeklyReportDay: 1, // Monday
    });
  };
  
  const content = {
    en: {
      title: "Settings",
      subtitle: "Manage your profile and preferences",
      profile: "Profile",
      sleLevel: "SLE Levels",
      notifications: "Notifications",
      department: "Department",
      departmentPlaceholder: "e.g., Immigration, Refugees and Citizenship Canada",
      position: "Position",
      positionPlaceholder: "e.g., Policy Analyst",
      learningGoals: "Learning Goals",
      goalsPlaceholder: "What do you want to achieve with your language training?",
      primaryFocus: "Primary Focus",
      targetLanguage: "Target Language",
      french: "French",
      english: "English",
      oral: "Oral",
      written: "Written",
      reading: "Reading",
      all: "All Skills",
      currentLevel: "Current Level",
      targetLevel: "Target Level",
      examDate: "Exam Date",
      examDateDesc: "When is your next SLE exam scheduled?",
      emailNotifications: "Email Notifications",
      emailNotificationsDesc: "Receive important updates via email",
      sessionReminders: "Session Reminders",
      sessionRemindersDesc: "Get reminded before your sessions",
      weeklyReports: "Weekly Progress Reports",
      weeklyReportsDesc: "Receive a summary of your learning progress",
      marketingEmails: "Marketing Emails",
      marketingEmailsDesc: "Receive tips, promotions, and news",
      save: "Save Changes",
      saving: "Saving...",
      loginRequired: "Please sign in to access settings",
      signIn: "Sign In",
    },
    fr: {
      title: "Paramètres",
      subtitle: "Gérez votre profil et vos préférences",
      profile: "Profil",
      sleLevel: "Niveaux ELS",
      notifications: "Notifications",
      department: "Ministère",
      departmentPlaceholder: "ex., Immigration, Réfugiés et Citoyenneté Canada",
      position: "Poste",
      positionPlaceholder: "ex., Analyste de politiques",
      learningGoals: "Objectifs d'apprentissage",
      goalsPlaceholder: "Que voulez-vous accomplir avec votre formation linguistique?",
      primaryFocus: "Focus principal",
      targetLanguage: "Langue cible",
      french: "Français",
      english: "Anglais",
      oral: "Oral",
      written: "Écrit",
      reading: "Lecture",
      all: "Toutes les compétences",
      currentLevel: "Niveau actuel",
      targetLevel: "Niveau cible",
      examDate: "Date d'examen",
      examDateDesc: "Quand est prévu votre prochain examen ELS?",
      emailNotifications: "Notifications par courriel",
      emailNotificationsDesc: "Recevoir les mises à jour importantes par courriel",
      sessionReminders: "Rappels de séance",
      sessionRemindersDesc: "Être rappelé avant vos séances",
      weeklyReports: "Rapports de progrès hebdomadaires",
      weeklyReportsDesc: "Recevoir un résumé de vos progrès d'apprentissage",
      marketingEmails: "Courriels marketing",
      marketingEmailsDesc: "Recevoir des conseils, promotions et nouvelles",
      save: "Enregistrer les modifications",
      saving: "Enregistrement...",
      loginRequired: "Veuillez vous connecter pour accéder aux paramètres",
      signIn: "Se connecter",
    },
  };
  
  const t = isEn ? content.en : content.fr;
  
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {!isInsideAppLayout && <Header />}
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardHeader className="text-center">
              <CardTitle>{t.title}</CardTitle>
              <CardDescription>{t.loginRequired}</CardDescription>
            </CardHeader>
            <CardContent>
              <a href={getLoginUrl()} className="block">
                <Button className="w-full" size="lg">
                  {t.signIn}
                </Button>
              </a>
            </CardContent>
          </Card>
        </main>
        {!isInsideAppLayout && <Footer />}
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {!isInsideAppLayout && <Header />}
      
      <main className="flex-1 py-8">
        <div className="container max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Settings className="h-8 w-8" />
              {t.title}
            </h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>
          
          {profileLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="profile" className="gap-2">
                  <User className="h-4 w-4" />
                  {t.profile}
                </TabsTrigger>
                <TabsTrigger value="sle" className="gap-2">
                  <Target className="h-4 w-4" />
                  {t.sleLevel}
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="h-4 w-4" />
                  {t.notifications}
                </TabsTrigger>
              </TabsList>
              
              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>{t.profile}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* User Info */}
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={user?.avatarUrl || ""} />
                        <AvatarFallback className="text-lg">
                          {user?.name?.split(" ").map(n => n[0]).join("") || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-lg">{user?.name}</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    
                    {/* Department */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {t.department}
                      </Label>
                      <Input
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder={t.departmentPlaceholder}
                      />
                    </div>
                    
                    {/* Position */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        {t.position}
                      </Label>
                      <Input
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        placeholder={t.positionPlaceholder}
                      />
                    </div>
                    
                    {/* Learning Goals */}
                    <div className="space-y-2">
                      <Label>{t.learningGoals}</Label>
                      <Textarea
                        value={learningGoals}
                        onChange={(e) => setLearningGoals(e.target.value)}
                        placeholder={t.goalsPlaceholder}
                        rows={3}
                      />
                    </div>
                    
                    {/* Primary Focus & Target Language */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t.primaryFocus}</Label>
                        <Select value={primaryFocus} onValueChange={(v: any) => setPrimaryFocus(v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="oral">{t.oral}</SelectItem>
                            <SelectItem value="written">{t.written}</SelectItem>
                            <SelectItem value="reading">{t.reading}</SelectItem>
                            <SelectItem value="all">{t.all}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t.targetLanguage}</Label>
                        <Select value={targetLanguage} onValueChange={(v: any) => setTargetLanguage(v)}>
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
                    
                    <Button onClick={handleSaveProfile} disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t.saving}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {t.save}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* SLE Levels Tab */}
              <TabsContent value="sle">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      {t.sleLevel}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Current Levels */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">{t.currentLevel}</Label>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">{t.oral}</Label>
                          <Select value={currentOral} onValueChange={setCurrentOral}>
                            <SelectTrigger>
                              <SelectValue placeholder="-" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">-</SelectItem>
                              {sleLevels.map((level) => (
                                <SelectItem key={level} value={level}>{level}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">{t.written}</Label>
                          <Select value={currentWritten} onValueChange={setCurrentWritten}>
                            <SelectTrigger>
                              <SelectValue placeholder="-" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">-</SelectItem>
                              {sleLevels.map((level) => (
                                <SelectItem key={level} value={level}>{level}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">{t.reading}</Label>
                          <Select value={currentReading} onValueChange={setCurrentReading}>
                            <SelectTrigger>
                              <SelectValue placeholder="-" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">-</SelectItem>
                              {sleLevels.map((level) => (
                                <SelectItem key={level} value={level}>{level}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    {/* Target Levels */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">{t.targetLevel}</Label>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">{t.oral}</Label>
                          <Select value={targetOral} onValueChange={setTargetOral}>
                            <SelectTrigger>
                              <SelectValue placeholder="-" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">-</SelectItem>
                              {targetLevels.map((level) => (
                                <SelectItem key={level} value={level}>{level}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">{t.written}</Label>
                          <Select value={targetWritten} onValueChange={setTargetWritten}>
                            <SelectTrigger>
                              <SelectValue placeholder="-" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">-</SelectItem>
                              {targetLevels.map((level) => (
                                <SelectItem key={level} value={level}>{level}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">{t.reading}</Label>
                          <Select value={targetReading} onValueChange={setTargetReading}>
                            <SelectTrigger>
                              <SelectValue placeholder="-" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">-</SelectItem>
                              {targetLevels.map((level) => (
                                <SelectItem key={level} value={level}>{level}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    {/* Exam Date */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {t.examDate}
                      </Label>
                      <p className="text-sm text-muted-foreground">{t.examDateDesc}</p>
                      <Input
                        type="date"
                        value={examDate}
                        onChange={(e) => setExamDate(e.target.value)}
                        className="max-w-xs"
                      />
                    </div>
                    
                    <Button onClick={handleSaveProfile} disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t.saving}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {t.save}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Notifications Tab */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      {t.notifications}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="space-y-0.5">
                          <Label>{t.sessionReminders}</Label>
                          <p className="text-sm text-muted-foreground">{t.sessionRemindersDesc}</p>
                        </div>
                        <Switch
                          checked={sessionReminders}
                          onCheckedChange={setSessionReminders}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="space-y-0.5">
                          <Label>{t.weeklyReports}</Label>
                          <p className="text-sm text-muted-foreground">{t.weeklyReportsDesc}</p>
                        </div>
                        <Switch
                          checked={weeklyReports}
                          onCheckedChange={setWeeklyReports}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="space-y-0.5">
                          <Label>{t.marketingEmails}</Label>
                          <p className="text-sm text-muted-foreground">{t.marketingEmailsDesc}</p>
                        </div>
                        <Switch
                          checked={marketingEmails}
                          onCheckedChange={setMarketingEmails}
                        />
                      </div>
                    </div>
                    
                    <Button onClick={handleSaveNotifications} disabled={updateReportsMutation.isPending}>
                      {updateReportsMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t.saving}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {t.save}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      
      {!isInsideAppLayout && <Footer />}
    </div>
  );
}
