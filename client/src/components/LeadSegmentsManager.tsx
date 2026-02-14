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
  Users,
  Filter,
  Eye,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface FilterCondition {
  field: string;
  operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "in";
  value: string | number | string[];
}

interface Segment {
  id: number;
  name: string;
  description: string | null;
  filters: FilterCondition[];
  filterLogic: "and" | "or";
  color: string | null;
  isActive: boolean;
  leadCount?: number;
}

const FILTER_FIELDS = [
  { id: "status", labelEn: "Status", labelFr: "Statut", type: "select" },
  { id: "source", labelEn: "Source", labelFr: "Source", type: "select" },
  { id: "leadType", labelEn: "Lead Type", labelFr: "Type de lead", type: "select" },
  { id: "leadScore", labelEn: "Lead Score", labelFr: "Score", type: "number" },
  { id: "budget", labelEn: "Budget", labelFr: "Budget", type: "text" },
  { id: "company", labelEn: "Company", labelFr: "Entreprise", type: "text" },
];

const OPERATORS = [
  { id: "equals", labelEn: "Equals", labelFr: "Égal à" },
  { id: "not_equals", labelEn: "Not equals", labelFr: "Différent de" },
  { id: "greater_than", labelEn: "Greater than", labelFr: "Supérieur à" },
  { id: "less_than", labelEn: "Less than", labelFr: "Inférieur à" },
  { id: "contains", labelEn: "Contains", labelFr: "Contient" },
];

const STATUS_OPTIONS = ["new", "contacted", "qualified", "proposal_sent", "negotiating", "won", "lost", "nurturing"];
const SOURCE_OPTIONS = ["lingueefy", "rusingacademy", "barholex", "ecosystem_hub", "external"];
const LEAD_TYPE_OPTIONS = ["individual", "organization", "government", "enterprise"];

const COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e",
];

export default function LeadSegmentsManager() {
  const { language } = useLanguage();
  const [showDialog, setShowDialog] = useState(false);
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    filters: [{ field: "status", operator: "equals" as const, value: "" }] as FilterCondition[],
    filterLogic: "and" as "and" | "or",
    color: "#3b82f6",
  });
  const [previewLeads, setPreviewLeads] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const segmentsQuery = trpc.crm.getSegments.useQuery();
  const leadsQuery = trpc.crm.getLeadsWithScores.useQuery({ limit: 1000 });

  const createMutation = trpc.crm.createSegment.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Segment créé" : "Segment created");
      segmentsQuery.refetch();
      setShowDialog(false);
      resetForm();
    },
    onError: () => {
      toast.error(language === "fr" ? "Erreur de création" : "Creation failed");
    },
  });

  const updateMutation = trpc.crm.updateSegment.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Segment mis à jour" : "Segment updated");
      segmentsQuery.refetch();
      setShowDialog(false);
      resetForm();
    },
    onError: () => {
      toast.error(language === "fr" ? "Erreur de mise à jour" : "Update failed");
    },
  });

  const deleteMutation = trpc.crm.deleteSegment.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Segment supprimé" : "Segment deleted");
      segmentsQuery.refetch();
    },
    onError: () => {
      toast.error(language === "fr" ? "Erreur de suppression" : "Deletion failed");
    },
  });

  const labels = {
    en: {
      title: "Lead Segments",
      subtitle: "Create dynamic segments to group leads based on criteria",
      addSegment: "Add Segment",
      editSegment: "Edit Segment",
      noSegments: "No segments configured",
      noSegmentsDesc: "Create segments to organize your leads into groups",
      name: "Segment Name",
      description: "Description",
      filters: "Filter Conditions",
      addFilter: "Add Filter",
      filterLogic: "Filter Logic",
      and: "AND (all conditions)",
      or: "OR (any condition)",
      color: "Color",
      active: "Active",
      actions: "Actions",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      preview: "Preview",
      leads: "leads",
      field: "Field",
      operator: "Operator",
      value: "Value",
      selectField: "Select field",
      selectOperator: "Select operator",
      enterValue: "Enter value",
      matchingLeads: "Matching Leads",
    },
    fr: {
      title: "Segments de leads",
      subtitle: "Créez des segments dynamiques pour regrouper les leads selon des critères",
      addSegment: "Ajouter un segment",
      editSegment: "Modifier le segment",
      noSegments: "Aucun segment configuré",
      noSegmentsDesc: "Créez des segments pour organiser vos leads en groupes",
      name: "Nom du segment",
      description: "Description",
      filters: "Conditions de filtrage",
      addFilter: "Ajouter un filtre",
      filterLogic: "Logique de filtrage",
      and: "ET (toutes les conditions)",
      or: "OU (au moins une condition)",
      color: "Couleur",
      active: "Actif",
      actions: "Actions",
      save: "Enregistrer",
      cancel: "Annuler",
      delete: "Supprimer",
      preview: "Aperçu",
      leads: "leads",
      field: "Champ",
      operator: "Opérateur",
      value: "Valeur",
      selectField: "Sélectionner un champ",
      selectOperator: "Sélectionner un opérateur",
      enterValue: "Entrer une valeur",
      matchingLeads: "Leads correspondants",
    },
  };

  const l = labels[language];

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      filters: [{ field: "status", operator: "equals", value: "" }],
      filterLogic: "and",
      color: "#3b82f6",
    });
    setEditingSegment(null);
    setPreviewLeads([]);
    setShowPreview(false);
  };

  const handleEdit = (segment: Segment) => {
    setEditingSegment(segment);
    setFormData({
      name: segment.name,
      description: segment.description || "",
      filters: segment.filters,
      filterLogic: segment.filterLogic,
      color: segment.color || "#3b82f6",
    });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!formData.name || formData.filters.length === 0) {
      toast.error(language === "fr" ? "Veuillez remplir tous les champs" : "Please fill all fields");
      return;
    }

    // Validate filters have values
    const validFilters = formData.filters.filter(f => f.field && f.operator && f.value);
    if (validFilters.length === 0) {
      toast.error(language === "fr" ? "Ajoutez au moins un filtre valide" : "Add at least one valid filter");
      return;
    }

    if (editingSegment) {
      updateMutation.mutate({
        id: editingSegment.id,
        ...formData,
        filters: validFilters,
      });
    } else {
      createMutation.mutate({
        ...formData,
        filters: validFilters,
      });
    }
  };

  const addFilter = () => {
    setFormData({
      ...formData,
      filters: [...formData.filters, { field: "status", operator: "equals", value: "" }],
    });
  };

  const removeFilter = (index: number) => {
    setFormData({
      ...formData,
      filters: formData.filters.filter((_, i) => i !== index),
    });
  };

  const updateFilter = (index: number, updates: Partial<FilterCondition>) => {
    setFormData({
      ...formData,
      filters: formData.filters.map((f, i) => (i === index ? { ...f, ...updates } : f)),
    });
  };

  const getFieldOptions = (fieldId: string) => {
    switch (fieldId) {
      case "status":
        return STATUS_OPTIONS;
      case "source":
        return SOURCE_OPTIONS;
      case "leadType":
        return LEAD_TYPE_OPTIONS;
      default:
        return [];
    }
  };

  const matchesFilter = (lead: any, filter: FilterCondition): boolean => {
    const leadValue = lead[filter.field];
    const filterValue = filter.value;

    switch (filter.operator) {
      case "equals":
        return String(leadValue).toLowerCase() === String(filterValue).toLowerCase();
      case "not_equals":
        return String(leadValue).toLowerCase() !== String(filterValue).toLowerCase();
      case "greater_than":
        return Number(leadValue) > Number(filterValue);
      case "less_than":
        return Number(leadValue) < Number(filterValue);
      case "contains":
        return String(leadValue).toLowerCase().includes(String(filterValue).toLowerCase());
      default:
        return false;
    }
  };

  const getMatchingLeads = (filters: FilterCondition[], logic: "and" | "or") => {
    if (!leadsQuery.data?.leads) return [];

    return leadsQuery.data.leads.filter((lead) => {
      const validFilters = filters.filter(f => f.field && f.operator && f.value);
      if (validFilters.length === 0) return false;

      if (logic === "and") {
        return validFilters.every((filter) => matchesFilter(lead, filter));
      } else {
        return validFilters.some((filter) => matchesFilter(lead, filter));
      }
    });
  };

  const handlePreview = () => {
    const matching = getMatchingLeads(formData.filters, formData.filterLogic);
    setPreviewLeads(matching);
    setShowPreview(true);
  };

  const getSegmentLeadCount = (segment: Segment): number => {
    return getMatchingLeads(segment.filters, segment.filterLogic).length;
  };

  const getFieldLabel = (fieldId: string) => {
    const field = FILTER_FIELDS.find((f) => f.id === fieldId);
    return language === "fr" ? field?.labelFr : field?.labelEn;
  };

  const getOperatorLabel = (operatorId: string) => {
    const operator = OPERATORS.find((o) => o.id === operatorId);
    return language === "fr" ? operator?.labelFr : operator?.labelEn;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-500" />
            {l.title}
          </h2>
          <p className="text-muted-foreground">{l.subtitle}</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {l.addSegment}
        </Button>
      </div>

      {/* Segments List */}
      {segmentsQuery.data?.segments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Filter className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{l.noSegments}</h3>
            <p className="text-muted-foreground text-center mb-4">{l.noSegmentsDesc}</p>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {l.addSegment}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {segmentsQuery.data?.segments.map((segment: Segment) => (
            <Card key={segment.id} className="relative overflow-hidden">
              <div
                className="absolute top-0 left-0 w-full h-1"
                style={{ backgroundColor: segment.color || "#3b82f6" }}
              />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{segment.name}</CardTitle>
                  <Badge variant={segment.isActive ? "default" : "secondary"}>
                    {getSegmentLeadCount(segment)} {l.leads}
                  </Badge>
                </div>
                {segment.description && (
                  <CardDescription>{segment.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {segment.filters.slice(0, 3).map((filter: FilterCondition, index: number) => (
                    <div key={index} className="text-sm text-muted-foreground flex items-center gap-1">
                      <span className="font-medium">{getFieldLabel(filter.field)}</span>
                      <span>{getOperatorLabel(filter.operator)}</span>
                      <span className="font-medium">{String(filter.value)}</span>
                      {index < segment.filters.length - 1 && index < 2 && (
                        <Badge variant="outline" className="ml-1 text-xs">
                          {segment.filterLogic.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  ))}
                  {segment.filters.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{segment.filters.length - 3} {language === "fr" ? "autres filtres" : "more filters"}
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(segment)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => deleteMutation.mutate({ id: segment.id })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSegment ? l.editSegment : l.addSegment}</DialogTitle>
            <DialogDescription>
              {language === "fr"
                ? "Définissez les critères pour regrouper automatiquement les leads"
                : "Define criteria to automatically group leads"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{l.name}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={language === "fr" ? "Ex: Leads VIP" : "e.g., VIP Leads"}
                />
              </div>
              <div className="space-y-2">
                <Label>{l.color}</Label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      className={`h-6 w-6 rounded-full border-2 ${
                        formData.color === color ? "border-foreground" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>
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
              <Label>{l.filterLogic}</Label>
              <Select
                value={formData.filterLogic}
                onValueChange={(value: "and" | "or") => setFormData({ ...formData, filterLogic: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="and">{l.and}</SelectItem>
                  <SelectItem value="or">{l.or}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{l.filters}</Label>
                <Button variant="outline" size="sm" onClick={addFilter}>
                  <Plus className="h-4 w-4 mr-1" />
                  {l.addFilter}
                </Button>
              </div>

              <div className="space-y-3">
                {formData.filters.map((filter, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Select
                      value={filter.field}
                      onValueChange={(value) => updateFilter(index, { field: value, value: "" })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder={l.selectField} />
                      </SelectTrigger>
                      <SelectContent>
                        {FILTER_FIELDS.map((field) => (
                          <SelectItem key={field.id} value={field.id}>
                            {language === "fr" ? field.labelFr : field.labelEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={filter.operator}
                      onValueChange={(value: FilterCondition["operator"]) =>
                        updateFilter(index, { operator: value })
                      }
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder={l.selectOperator} />
                      </SelectTrigger>
                      <SelectContent>
                        {OPERATORS.map((op) => (
                          <SelectItem key={op.id} value={op.id}>
                            {language === "fr" ? op.labelFr : op.labelEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {getFieldOptions(filter.field).length > 0 ? (
                      <Select
                        value={String(filter.value)}
                        onValueChange={(value) => updateFilter(index, { value })}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder={l.enterValue} />
                        </SelectTrigger>
                        <SelectContent>
                          {getFieldOptions(filter.field).map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        className="flex-1"
                        value={String(filter.value)}
                        onChange={(e) => updateFilter(index, { value: e.target.value })}
                        placeholder={l.enterValue}
                        type={FILTER_FIELDS.find((f) => f.id === filter.field)?.type === "number" ? "number" : "text"}
                      />
                    )}

                    {formData.filters.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFilter(index)}
                        className="text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="pt-4 border-t">
              <Button variant="outline" onClick={handlePreview} className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                {l.preview} ({getMatchingLeads(formData.filters, formData.filterLogic).length} {l.leads})
              </Button>

              {showPreview && previewLeads.length > 0 && (
                <div className="mt-4 max-h-48 overflow-y-auto">
                  <p className="text-sm font-medium mb-2">{l.matchingLeads}:</p>
                  <div className="space-y-1">
                    {previewLeads.slice(0, 10).map((lead) => (
                      <div key={lead.id} className="text-sm p-2 bg-muted rounded flex justify-between">
                        <span>{lead.firstName} {lead.lastName}</span>
                        <span className="text-muted-foreground">{lead.email}</span>
                      </div>
                    ))}
                    {previewLeads.length > 10 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{previewLeads.length - 10} {language === "fr" ? "autres" : "more"}
                      </p>
                    )}
                  </div>
                </div>
              )}
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
