import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Trash2,
  Edit,
  Zap,
  Play,
  Settings,
  Tag,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface AutomationRule {
  id: number;
  name: string;
  description: string | null;
  tagId: number;
  tagName: string | null;
  tagColor: string | null;
  conditionType: string;
  conditionValue: string;
  isActive: boolean;
  priority: number;
}

const CONDITION_TYPES = [
  { value: "budget_above", labelEn: "Budget above", labelFr: "Budget supérieur à" },
  { value: "budget_below", labelEn: "Budget below", labelFr: "Budget inférieur à" },
  { value: "score_above", labelEn: "Score above", labelFr: "Score supérieur à" },
  { value: "score_below", labelEn: "Score below", labelFr: "Score inférieur à" },
  { value: "source_equals", labelEn: "Source equals", labelFr: "Source égale à" },
  { value: "lead_type_equals", labelEn: "Lead type equals", labelFr: "Type de lead égal à" },
  { value: "status_equals", labelEn: "Status equals", labelFr: "Statut égal à" },
];

const SOURCE_OPTIONS = ["lingueefy", "rusingacademy", "barholex", "ecosystem_hub", "external"];
const LEAD_TYPE_OPTIONS = ["individual", "corporate", "government", "educational"];
const STATUS_OPTIONS = ["new", "contacted", "qualified", "proposal", "converted", "lost"];

export default function TagAutomationManager() {
  const { language } = useLanguage();
  const [showDialog, setShowDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tagId: 0,
    conditionType: "",
    conditionValue: "",
    priority: 0,
  });

  const rulesQuery = trpc.crm.getAutomationRules.useQuery();
  const tagsQuery = trpc.crm.getTags.useQuery();

  const createMutation = trpc.crm.createAutomationRule.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Règle créée" : "Rule created");
      rulesQuery.refetch();
      setShowDialog(false);
      resetForm();
    },
    onError: () => {
      toast.error(language === "fr" ? "Erreur de création" : "Creation failed");
    },
  });

  const updateMutation = trpc.crm.updateAutomationRule.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Règle mise à jour" : "Rule updated");
      rulesQuery.refetch();
      setShowDialog(false);
      resetForm();
    },
    onError: () => {
      toast.error(language === "fr" ? "Erreur de mise à jour" : "Update failed");
    },
  });

  const deleteMutation = trpc.crm.deleteAutomationRule.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Règle supprimée" : "Rule deleted");
      rulesQuery.refetch();
    },
    onError: () => {
      toast.error(language === "fr" ? "Erreur de suppression" : "Deletion failed");
    },
  });

  const runMutation = trpc.crm.runAutomationRules.useMutation({
    onSuccess: (data) => {
      toast.success(
        language === "fr"
          ? `${data.tagsApplied} tags appliqués à ${data.leadsProcessed} leads`
          : `${data.tagsApplied} tags applied to ${data.leadsProcessed} leads`
      );
    },
    onError: () => {
      toast.error(language === "fr" ? "Erreur d'exécution" : "Execution failed");
    },
  });

  const labels = {
    en: {
      title: "Tag Automation Rules",
      subtitle: "Automatically assign tags to leads based on conditions",
      addRule: "Add Rule",
      editRule: "Edit Rule",
      runAll: "Run All Rules",
      running: "Running...",
      noRules: "No automation rules configured",
      noRulesDesc: "Create rules to automatically tag leads based on their attributes",
      name: "Rule Name",
      description: "Description",
      tag: "Tag to Apply",
      condition: "Condition",
      value: "Value",
      priority: "Priority",
      active: "Active",
      actions: "Actions",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      selectTag: "Select a tag",
      selectCondition: "Select condition",
      enterValue: "Enter value",
      budgetHint: "Enter amount (e.g., 50000)",
      scoreHint: "Enter score (0-100)",
      sourceHint: "Select source",
      leadTypeHint: "Select lead type",
      statusHint: "Select status",
    },
    fr: {
      title: "Règles d'automatisation des tags",
      subtitle: "Assigner automatiquement des tags aux leads selon des conditions",
      addRule: "Ajouter une règle",
      editRule: "Modifier la règle",
      runAll: "Exécuter toutes les règles",
      running: "Exécution...",
      noRules: "Aucune règle d'automatisation configurée",
      noRulesDesc: "Créez des règles pour taguer automatiquement les leads selon leurs attributs",
      name: "Nom de la règle",
      description: "Description",
      tag: "Tag à appliquer",
      condition: "Condition",
      value: "Valeur",
      priority: "Priorité",
      active: "Actif",
      actions: "Actions",
      save: "Enregistrer",
      cancel: "Annuler",
      delete: "Supprimer",
      selectTag: "Sélectionner un tag",
      selectCondition: "Sélectionner une condition",
      enterValue: "Entrer une valeur",
      budgetHint: "Entrer un montant (ex: 50000)",
      scoreHint: "Entrer un score (0-100)",
      sourceHint: "Sélectionner une source",
      leadTypeHint: "Sélectionner un type de lead",
      statusHint: "Sélectionner un statut",
    },
  };

  const l = labels[language];

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      tagId: 0,
      conditionType: "",
      conditionValue: "",
      priority: 0,
    });
    setEditingRule(null);
  };

  const handleEdit = (rule: AutomationRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || "",
      tagId: rule.tagId,
      conditionType: rule.conditionType,
      conditionValue: rule.conditionValue,
      priority: rule.priority,
    });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.tagId || !formData.conditionType || !formData.conditionValue) {
      toast.error(language === "fr" ? "Veuillez remplir tous les champs" : "Please fill all fields");
      return;
    }

    if (editingRule) {
      updateMutation.mutate({
        id: editingRule.id,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleToggleActive = (rule: AutomationRule) => {
    updateMutation.mutate({
      id: rule.id,
      isActive: !rule.isActive,
    });
  };

  const getConditionLabel = (type: string) => {
    const condition = CONDITION_TYPES.find((c) => c.value === type);
    return language === "fr" ? condition?.labelFr : condition?.labelEn;
  };

  const getValueInput = () => {
    const type = formData.conditionType;

    if (type === "source_equals") {
      return (
        <Select
          value={formData.conditionValue}
          onValueChange={(value) => setFormData({ ...formData, conditionValue: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder={l.sourceHint} />
          </SelectTrigger>
          <SelectContent>
            {SOURCE_OPTIONS.map((source) => (
              <SelectItem key={source} value={source}>
                {source}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (type === "lead_type_equals") {
      return (
        <Select
          value={formData.conditionValue}
          onValueChange={(value) => setFormData({ ...formData, conditionValue: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder={l.leadTypeHint} />
          </SelectTrigger>
          <SelectContent>
            {LEAD_TYPE_OPTIONS.map((leadType) => (
              <SelectItem key={leadType} value={leadType}>
                {leadType}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (type === "status_equals") {
      return (
        <Select
          value={formData.conditionValue}
          onValueChange={(value) => setFormData({ ...formData, conditionValue: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder={l.statusHint} />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    const hint = type.includes("budget") ? l.budgetHint : l.scoreHint;

    return (
      <Input
        type="number"
        placeholder={hint}
        value={formData.conditionValue}
        onChange={(e) => setFormData({ ...formData, conditionValue: e.target.value })}
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-amber-500" />
            {l.title}
          </h2>
          <p className="text-muted-foreground">{l.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => runMutation.mutate()}
            disabled={runMutation.isPending}
          >
            <Play className="h-4 w-4 mr-2" />
            {runMutation.isPending ? l.running : l.runAll}
          </Button>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {l.addRule}
          </Button>
        </div>
      </div>

      {/* Rules List */}
      {rulesQuery.data?.rules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{l.noRules}</h3>
            <p className="text-muted-foreground text-center mb-4">{l.noRulesDesc}</p>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {l.addRule}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{l.name}</TableHead>
                <TableHead>{l.tag}</TableHead>
                <TableHead>{l.condition}</TableHead>
                <TableHead>{l.value}</TableHead>
                <TableHead>{l.priority}</TableHead>
                <TableHead>{l.active}</TableHead>
                <TableHead className="text-right">{l.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rulesQuery.data?.rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{rule.name}</p>
                      {rule.description && (
                        <p className="text-xs text-muted-foreground">{rule.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      style={{
                        backgroundColor: `${rule.tagColor}20`,
                        color: rule.tagColor || undefined,
                        borderColor: rule.tagColor || undefined,
                      }}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {rule.tagName}
                    </Badge>
                  </TableCell>
                  <TableCell>{getConditionLabel(rule.conditionType)}</TableCell>
                  <TableCell>
                    <code className="px-2 py-1 bg-muted rounded text-sm">
                      {rule.conditionValue}
                    </code>
                  </TableCell>
                  <TableCell>{rule.priority}</TableCell>
                  <TableCell>
                    <Switch
                      checked={rule.isActive}
                      onCheckedChange={() => handleToggleActive(rule)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(rule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => deleteMutation.mutate({ id: rule.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRule ? l.editRule : l.addRule}</DialogTitle>
            <DialogDescription>
              {language === "fr"
                ? "Configurez les conditions pour appliquer automatiquement un tag"
                : "Configure conditions to automatically apply a tag"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{l.name}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={language === "fr" ? "Ex: VIP Client" : "e.g., VIP Client"}
              />
            </div>

            <div className="space-y-2">
              <Label>{l.description}</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={language === "fr" ? "Description optionnelle" : "Optional description"}
              />
            </div>

            <div className="space-y-2">
              <Label>{l.tag}</Label>
              <Select
                value={formData.tagId ? String(formData.tagId) : ""}
                onValueChange={(value) => setFormData({ ...formData, tagId: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={l.selectTag} />
                </SelectTrigger>
                <SelectContent>
                  {tagsQuery.data?.tags.map((tag) => (
                    <SelectItem key={tag.id} value={String(tag.id)}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{l.condition}</Label>
              <Select
                value={formData.conditionType}
                onValueChange={(value) =>
                  setFormData({ ...formData, conditionType: value, conditionValue: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={l.selectCondition} />
                </SelectTrigger>
                <SelectContent>
                  {CONDITION_TYPES.map((condition) => (
                    <SelectItem key={condition.value} value={condition.value}>
                      {language === "fr" ? condition.labelFr : condition.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.conditionType && (
              <div className="space-y-2">
                <Label>{l.value}</Label>
                {getValueInput()}
              </div>
            )}

            <div className="space-y-2">
              <Label>{l.priority}</Label>
              <Input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                {language === "fr"
                  ? "Les règles avec une priorité plus basse sont exécutées en premier"
                  : "Rules with lower priority are executed first"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              {l.cancel}
            </Button>
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {l.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
