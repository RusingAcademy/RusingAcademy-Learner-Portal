import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Mail,
  Plus,
  Search,
  Copy,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  FileText,
  Sparkles,
  Clock,
  Users,
  Target,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  category: string;
  language: "en" | "fr" | "both";
  variables: string[];
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
}

const TEMPLATE_CATEGORIES = [
  { id: "welcome", label: "Welcome", labelFr: "Bienvenue", icon: Users },
  { id: "follow_up", label: "Follow-up", labelFr: "Suivi", icon: Clock },
  { id: "proposal", label: "Proposal", labelFr: "Proposition", icon: FileText },
  { id: "nurture", label: "Nurture", labelFr: "Nurturing", icon: Target },
  { id: "conversion", label: "Conversion", labelFr: "Conversion", icon: CheckCircle },
  { id: "custom", label: "Custom", labelFr: "Personnalisé", icon: Sparkles },
];

const AVAILABLE_VARIABLES = [
  { key: "{{firstName}}", description: "Lead's first name", descriptionFr: "Prénom du lead" },
  { key: "{{lastName}}", description: "Lead's last name", descriptionFr: "Nom du lead" },
  { key: "{{company}}", description: "Company name", descriptionFr: "Nom de l'entreprise" },
  { key: "{{email}}", description: "Email address", descriptionFr: "Adresse email" },
  { key: "{{coachName}}", description: "Coach's name", descriptionFr: "Nom du coach" },
  { key: "{{sessionDate}}", description: "Session date", descriptionFr: "Date de la session" },
  { key: "{{sessionTime}}", description: "Session time", descriptionFr: "Heure de la session" },
  { key: "{{meetingLink}}", description: "Meeting link", descriptionFr: "Lien de réunion" },
  { key: "{{unsubscribeLink}}", description: "Unsubscribe link", descriptionFr: "Lien de désabonnement" },
];

// Default templates
const DEFAULT_TEMPLATES: Omit<EmailTemplate, "id" | "createdAt" | "updatedAt" | "usageCount">[] = [
  {
    name: "Welcome Email",
    subject: "Welcome to Lingueefy, {{firstName}}!",
    body: `Hi {{firstName}},

Welcome to Lingueefy! We're excited to have you join our community of French language learners.

Your journey to mastering the SLE exam starts here. Here's what you can do next:

1. Complete your profile to get personalized recommendations
2. Book a free trial session with one of our expert coaches
3. Try Prof Steven AI for 24/7 practice

If you have any questions, don't hesitate to reach out.

Best regards,
The Lingueefy Team

{{unsubscribeLink}}`,
    category: "welcome",
    language: "en",
    variables: ["firstName", "unsubscribeLink"],
  },
  {
    name: "Email de bienvenue",
    subject: "Bienvenue chez Lingueefy, {{firstName}}!",
    body: `Bonjour {{firstName}},

Bienvenue chez Lingueefy! Nous sommes ravis de vous accueillir dans notre communauté d'apprenants.

Votre parcours vers la maîtrise de l'ELS commence ici. Voici ce que vous pouvez faire:

1. Complétez votre profil pour des recommandations personnalisées
2. Réservez une session d'essai gratuite avec l'un de nos coachs experts
3. Essayez Prof Steven AI pour pratiquer 24/7

Si vous avez des questions, n'hésitez pas à nous contacter.

Cordialement,
L'équipe Lingueefy

{{unsubscribeLink}}`,
    category: "welcome",
    language: "fr",
    variables: ["firstName", "unsubscribeLink"],
  },
  {
    name: "Follow-up After Trial",
    subject: "How was your trial session, {{firstName}}?",
    body: `Hi {{firstName}},

Thank you for completing your trial session with {{coachName}}!

We'd love to hear about your experience. Your feedback helps us improve and ensures we match you with the perfect coach for your SLE goals.

Ready to continue your journey? Here are your options:

- Book a single session ($75)
- Get a 5-session package ($350 - Save $25)
- Get a 10-session package ($650 - Save $100)

Click here to book your next session: [Book Now]

Best regards,
The Lingueefy Team

{{unsubscribeLink}}`,
    category: "follow_up",
    language: "en",
    variables: ["firstName", "coachName", "unsubscribeLink"],
  },
  {
    name: "Proposal for Department",
    subject: "Custom Training Proposal for {{company}}",
    body: `Dear {{firstName}},

Thank you for your interest in Lingueefy's corporate training solutions.

Based on our discussion, I've prepared a customized proposal for {{company}}:

**Program Overview:**
- Number of participants: [X]
- Target SLE levels: [BBB/CBC/CCC]
- Duration: [X weeks/months]
- Format: [In-person/Virtual/Hybrid]

**Investment:**
- Per-participant rate: $[X]
- Total program cost: $[X]
- Payment terms: [Net 30/Quarterly]

**Included:**
- Pre-assessment for all participants
- Weekly group sessions
- Unlimited AI practice access
- Progress reports for management
- Dedicated account manager

I'm available to discuss this proposal at your convenience.

Best regards,
[Your Name]
Lingueefy Corporate Solutions

{{unsubscribeLink}}`,
    category: "proposal",
    language: "en",
    variables: ["firstName", "company", "unsubscribeLink"],
  },
  {
    name: "Nurture - SLE Tips",
    subject: "3 Tips to Ace Your SLE Oral Exam",
    body: `Hi {{firstName}},

Preparing for your SLE oral exam? Here are three tips from our expert coaches:

**1. Practice Active Listening**
During the exam, listen carefully to the questions. If you don't understand, it's okay to ask for clarification.

**2. Structure Your Responses**
Use the STAR method (Situation, Task, Action, Result) for behavioral questions.

**3. Speak Naturally**
Don't try to memorize scripts. Examiners can tell when responses are rehearsed.

Want personalized coaching? Book a session with one of our SLE experts.

À bientôt,
The Lingueefy Team

{{unsubscribeLink}}`,
    category: "nurture",
    language: "en",
    variables: ["firstName", "unsubscribeLink"],
  },
];

export default function EmailTemplatesLibrary() {
  const { language } = useLanguage();
  const [localTemplates, setLocalTemplates] = useState<EmailTemplate[]>(
    DEFAULT_TEMPLATES.map((t, i) => ({
      ...t,
      id: -(i + 1), // Negative IDs for default templates
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: Math.floor(Math.random() * 50),
      isDefault: true,
    }))
  );

  // Database queries
  const templatesQuery = trpc.crm.getEmailTemplates.useQuery({});
  const createMutation = trpc.crm.createEmailTemplate.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Modèle créé" : "Template created");
      templatesQuery.refetch();
    },
    onError: () => {
      toast.error(language === "fr" ? "Erreur de création" : "Creation failed");
    },
  });
  const updateMutation = trpc.crm.updateEmailTemplate.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Modèle mis à jour" : "Template updated");
      templatesQuery.refetch();
    },
    onError: () => {
      toast.error(language === "fr" ? "Erreur de mise à jour" : "Update failed");
    },
  });
  const deleteMutation = trpc.crm.deleteEmailTemplate.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Modèle supprimé" : "Template deleted");
      templatesQuery.refetch();
    },
    onError: () => {
      toast.error(language === "fr" ? "Erreur de suppression" : "Deletion failed");
    },
  });

  // Combine database templates with local defaults
  const templates = [
    ...localTemplates,
    ...(templatesQuery.data?.templates || []).map(t => ({
      ...t,
      variables: (t.variables as string[]) || [],
      isDefault: t.isDefault,
    })),
  ] as EmailTemplate[];
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body: "",
    category: "custom",
    language: "en" as "en" | "fr" | "both",
  });

  const labels = {
    en: {
      title: "Email Templates",
      subtitle: "Create and manage reusable email templates for sequences",
      search: "Search templates...",
      category: "Category",
      language: "Language",
      all: "All",
      createTemplate: "Create Template",
      editTemplate: "Edit Template",
      preview: "Preview",
      duplicate: "Duplicate",
      delete: "Delete",
      name: "Template Name",
      subject: "Subject Line",
      body: "Email Body",
      variables: "Available Variables",
      insertVariable: "Click to insert",
      save: "Save Template",
      cancel: "Cancel",
      usageCount: "Used",
      times: "times",
      noTemplates: "No templates found",
      english: "English",
      french: "French",
      both: "Both",
      previewTitle: "Template Preview",
      sampleData: "Sample Data Preview",
    },
    fr: {
      title: "Modèles d'emails",
      subtitle: "Créez et gérez des modèles d'emails réutilisables pour les séquences",
      search: "Rechercher des modèles...",
      category: "Catégorie",
      language: "Langue",
      all: "Tous",
      createTemplate: "Créer un modèle",
      editTemplate: "Modifier le modèle",
      preview: "Aperçu",
      duplicate: "Dupliquer",
      delete: "Supprimer",
      name: "Nom du modèle",
      subject: "Objet",
      body: "Corps de l'email",
      variables: "Variables disponibles",
      insertVariable: "Cliquez pour insérer",
      save: "Enregistrer",
      cancel: "Annuler",
      usageCount: "Utilisé",
      times: "fois",
      noTemplates: "Aucun modèle trouvé",
      english: "Anglais",
      french: "Français",
      both: "Les deux",
      previewTitle: "Aperçu du modèle",
      sampleData: "Aperçu avec données d'exemple",
    },
  };

  const l = labels[language];

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || template.category === categoryFilter;
    const matchesLanguage =
      languageFilter === "all" ||
      template.language === languageFilter ||
      template.language === "both";
    return matchesSearch && matchesCategory && matchesLanguage;
  });

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setFormData({
      name: "",
      subject: "",
      body: "",
      category: "custom",
      language: "en",
    });
    setShowEditor(true);
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      category: template.category,
      language: template.language,
    });
    setShowEditor(true);
  };

  const handleDuplicate = (template: EmailTemplate) => {
    // Create a copy in the database
    createMutation.mutate({
      name: `${template.name} (Copy)`,
      subject: template.subject,
      body: template.body,
      category: template.category as "welcome" | "follow_up" | "proposal" | "nurture" | "conversion" | "custom",
      language: template.language,
    });
  };

  const handleDelete = (templateId: number) => {
    if (templateId < 0) {
      // Local default template - just remove from local state
      setLocalTemplates(localTemplates.filter((t) => t.id !== templateId));
      toast.success(language === "fr" ? "Modèle supprimé" : "Template deleted");
    } else {
      // Database template
      deleteMutation.mutate({ id: templateId });
    }
  };

  const handleSave = () => {
    if (editingTemplate && editingTemplate.id > 0) {
      // Update existing database template
      updateMutation.mutate({
        id: editingTemplate.id,
        name: formData.name,
        subject: formData.subject,
        body: formData.body,
        category: formData.category as "welcome" | "follow_up" | "proposal" | "nurture" | "conversion" | "custom",
        language: formData.language,
      });
    } else {
      // Create new template in database
      createMutation.mutate({
        name: formData.name,
        subject: formData.subject,
        body: formData.body,
        category: formData.category as "welcome" | "follow_up" | "proposal" | "nurture" | "conversion" | "custom",
        language: formData.language,
      });
    }

    setShowEditor(false);
  };

  const handlePreview = (template: EmailTemplate) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const insertVariable = (variable: string) => {
    setFormData((prev) => ({
      ...prev,
      body: prev.body + variable,
    }));
  };

  const renderPreviewContent = (content: string) => {
    // Replace variables with sample data
    return content
      .replace(/\{\{firstName\}\}/g, "Marie")
      .replace(/\{\{lastName\}\}/g, "Tremblay")
      .replace(/\{\{company\}\}/g, "Treasury Board")
      .replace(/\{\{email\}\}/g, "marie.tremblay@example.com")
      .replace(/\{\{coachName\}\}/g, "Steven Barholere")
      .replace(/\{\{sessionDate\}\}/g, "January 15, 2026")
      .replace(/\{\{sessionTime\}\}/g, "2:00 PM EST")
      .replace(/\{\{meetingLink\}\}/g, "https://meet.lingueefy.com/abc123")
      .replace(/\{\{unsubscribeLink\}\}/g, "[Unsubscribe]");
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = TEMPLATE_CATEGORIES.find((c) => c.id === categoryId);
    return category?.icon || FileText;
  };

  const getCategoryLabel = (categoryId: string) => {
    const category = TEMPLATE_CATEGORIES.find((c) => c.id === categoryId);
    return language === "fr" ? category?.labelFr : category?.label;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{l.title}</h2>
          <p className="text-muted-foreground text-sm">{l.subtitle}</p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          {l.createTemplate}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={l.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={l.category} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{l.all}</SelectItem>
            {TEMPLATE_CATEGORIES.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {language === "fr" ? cat.labelFr : cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={languageFilter} onValueChange={setLanguageFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={l.language} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{l.all}</SelectItem>
            <SelectItem value="en">{l.english}</SelectItem>
            <SelectItem value="fr">{l.french}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{l.noTemplates}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => {
            const CategoryIcon = getCategoryIcon(template.category);
            return (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <CategoryIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {getCategoryLabel(template.category)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {template.language === "en"
                              ? "EN"
                              : template.language === "fr"
                              ? "FR"
                              : "EN/FR"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 min-h-[44px] min-w-[44px]" aria-label="Template options">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePreview(template)}>
                          <Eye className="h-4 w-4 mr-2" />
                          {l.preview}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(template)}>
                          <Edit className="h-4 w-4 mr-2" />
                          {l.editTemplate}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                          <Copy className="h-4 w-4 mr-2" />
                          {l.duplicate}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(template.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {l.delete}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium mb-2 truncate">{template.subject}</p>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {template.body.substring(0, 150)}...
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <span className="text-xs text-muted-foreground">
                      {l.usageCount}: {template.usageCount} {l.times}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(template)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      {l.preview}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? l.editTemplate : l.createTemplate}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{l.name}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Welcome Email"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>{l.category}</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) =>
                      setFormData((prev) => ({ ...prev, category: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {language === "fr" ? cat.labelFr : cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{l.language}</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(v: "en" | "fr" | "both") =>
                      setFormData((prev) => ({ ...prev, language: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">{l.english}</SelectItem>
                      <SelectItem value="fr">{l.french}</SelectItem>
                      <SelectItem value="both">{l.both}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{l.subject}</Label>
              <Input
                value={formData.subject}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subject: e.target.value }))
                }
                placeholder="Welcome to Lingueefy, {{firstName}}!"
              />
            </div>

            <div className="space-y-2">
              <Label>{l.body}</Label>
              <Textarea
                value={formData.body}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, body: e.target.value }))
                }
                placeholder="Hi {{firstName}},\n\nWelcome to..."
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>{l.variables}</Label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_VARIABLES.map((variable) => (
                  <Button
                    key={variable.key}
                    variant="outline"
                    size="sm"
                    onClick={() => insertVariable(variable.key)}
                    title={language === "fr" ? variable.descriptionFr : variable.description}
                  >
                    {variable.key}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{l.insertVariable}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditor(false)}>
              {l.cancel}
            </Button>
            <Button onClick={handleSave}>{l.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{l.previewTitle}</DialogTitle>
            <DialogDescription>{l.sampleData}</DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div className="p-4 bg-white dark:bg-slate-900 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Subject:</p>
                <p className="font-medium">
                  {renderPreviewContent(previewTemplate.subject)}
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-950 border rounded-lg">
                <pre className="whitespace-pre-wrap font-sans text-sm">
                  {renderPreviewContent(previewTemplate.body)}
                </pre>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              {l.cancel}
            </Button>
            {previewTemplate && (
              <Button onClick={() => handleEdit(previewTemplate)}>
                <Edit className="h-4 w-4 mr-2" />
                {l.editTemplate}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
