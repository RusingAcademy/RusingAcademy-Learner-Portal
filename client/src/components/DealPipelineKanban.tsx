import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DollarSign,
  User,
  Building2,
  Calendar,
  MoreVertical,
  Plus,
  ArrowRight,
  Phone,
  Mail,
  Clock,
  TrendingUp,
  Target,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  X,
  Search,
  Tag,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import LeadHistoryTimeline from "@/components/LeadHistoryTimeline";

interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  company: string | null;
  jobTitle: string | null;
  status: string | null;
  leadScore: number | null;
  dealValue?: number | null;
  expectedCloseDate?: string | null;
  lastContactedAt: Date | null;
  createdAt: Date;
  tags?: { id: number; name: string; color: string }[];
}

interface LeadTag {
  id: number;
  name: string;
  color: string;
  description: string | null;
}

interface PipelineStage {
  id: string;
  title: string;
  titleFr: string;
  color: string;
  bgColor: string;
  leads: Lead[];
}

const PIPELINE_STAGES: Omit<PipelineStage, "leads">[] = [
  { id: "new", title: "New", titleFr: "Nouveau", color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-950/30" },
  { id: "contacted", title: "Contacted", titleFr: "Contacté", color: "text-[#0F3D3E]", bgColor: "bg-[#E7F2F2] dark:bg-[#E7F2F2]-950/30" },
  { id: "qualified", title: "Qualified", titleFr: "Qualifié", color: "text-amber-600", bgColor: "bg-amber-50 dark:bg-amber-950/30" },
  { id: "proposal", title: "Proposal", titleFr: "Proposition", color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-950/30" },
  { id: "converted", title: "Won", titleFr: "Gagné", color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-950/30" },
  { id: "lost", title: "Lost", titleFr: "Perdu", color: "text-red-600", bgColor: "bg-red-50 dark:bg-red-950/30" },
];

export default function DealPipelineKanban() {
  const { language } = useLanguage();
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showLeadDialog, setShowLeadDialog] = useState(false);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [valueFilter, setValueFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [scoreFilter, setScoreFilter] = useState<string>("all");
  
  // Tag state
  const [showTagPopover, setShowTagPopover] = useState<number | null>(null);
  const [leadTags, setLeadTags] = useState<Record<number, { id: number; name: string; color: string }[]>>({});

  const leadsQuery = trpc.crm.getLeadsWithScores.useQuery({
    limit: 100,
  });
  
  const tagsQuery = trpc.crm.getTags.useQuery();
  
  const assignTagMutation = trpc.crm.assignTagToLead.useMutation({
    onSuccess: (_, variables: { leadId: number; tagId: number }) => {
      toast.success(language === "fr" ? "Tag assigné" : "Tag assigned");
      // Update local state
      const tag = tagsQuery.data?.tags.find(t => t.id === variables.tagId);
      if (tag) {
        setLeadTags(prev => ({
          ...prev,
          [variables.leadId]: [...(prev[variables.leadId] || []), { id: tag.id, name: tag.name, color: tag.color }]
        }));
      }
    },
    onError: () => {
      toast.error(language === "fr" ? "Erreur d'assignation" : "Assignment failed");
    },
  });
  
  const removeTagMutation = trpc.crm.removeTagFromLead.useMutation({
    onSuccess: (_, variables: { leadId: number; tagId: number }) => {
      toast.success(language === "fr" ? "Tag retiré" : "Tag removed");
      setLeadTags(prev => ({
        ...prev,
        [variables.leadId]: (prev[variables.leadId] || []).filter(t => t.id !== variables.tagId)
      }));
    },
    onError: () => {
      toast.error(language === "fr" ? "Erreur de suppression" : "Removal failed");
    },
  });

  const updateLeadMutation = trpc.crm.updateLeadStatus.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Lead mis à jour" : "Lead updated");
      leadsQuery.refetch();
    },
    onError: () => {
      toast.error(language === "fr" ? "Erreur de mise à jour" : "Update failed");
    },
  });

  const addHistoryMutation = trpc.crm.addLeadHistory.useMutation();

  const labels = {
    en: {
      title: "Deal Pipeline",
      subtitle: "Drag leads between stages to update their status",
      totalValue: "Total Value",
      avgDealSize: "Avg Deal Size",
      conversionRate: "Conversion Rate",
      newLeads: "New Leads",
      noLeads: "No leads in this stage",
      leadDetails: "Lead Details",
      moveToStage: "Move to Stage",
      score: "Score",
      dealValue: "Deal Value",
      expectedClose: "Expected Close",
      lastContact: "Last Contact",
      created: "Created",
      contact: "Contact",
      notes: "Notes",
      save: "Save",
      cancel: "Cancel",
      refresh: "Refresh",
      addDeal: "Add Deal",
      filters: "Filters",
      search: "Search leads...",
      source: "Source",
      value: "Deal Value",
      dateCreated: "Date Created",
      leadScore: "Lead Score",
      all: "All",
      clearFilters: "Clear Filters",
      activeFilters: "Active Filters",
      lingueefy: "Lingueefy",
      rusingacademy: "RusingAcademy",
      barholex: "Barholex",
      ecosystem_hub: "Ecosystem Hub",
      external: "External",
      under5k: "Under $5K",
      from5kTo25k: "$5K - $25K",
      from25kTo100k: "$25K - $100K",
      over100k: "Over $100K",
      last7days: "Last 7 days",
      last30days: "Last 30 days",
      last90days: "Last 90 days",
      older: "Older",
      hot: "Hot (80+)",
      warm: "Warm (50-79)",
      cold: "Cold (0-49)",
      tags: "Tags",
      addTag: "Add Tag",
      removeTag: "Remove Tag",
      noTags: "No tags",
      manageTags: "Manage Tags",
    },
    fr: {
      title: "Pipeline de ventes",
      subtitle: "Glissez les leads entre les étapes pour mettre à jour leur statut",
      totalValue: "Valeur totale",
      avgDealSize: "Taille moyenne",
      conversionRate: "Taux de conversion",
      newLeads: "Nouveaux leads",
      noLeads: "Aucun lead à cette étape",
      leadDetails: "Détails du lead",
      moveToStage: "Déplacer vers",
      score: "Score",
      dealValue: "Valeur du deal",
      expectedClose: "Clôture prévue",
      lastContact: "Dernier contact",
      created: "Créé",
      contact: "Contact",
      notes: "Notes",
      save: "Enregistrer",
      cancel: "Annuler",
      refresh: "Actualiser",
      addDeal: "Ajouter un deal",
      filters: "Filtres",
      search: "Rechercher des leads...",
      source: "Source",
      value: "Valeur du deal",
      dateCreated: "Date de création",
      leadScore: "Score du lead",
      all: "Tous",
      clearFilters: "Effacer les filtres",
      activeFilters: "Filtres actifs",
      lingueefy: "Lingueefy",
      rusingacademy: "RusingAcademy",
      barholex: "Barholex",
      ecosystem_hub: "Ecosystem Hub",
      external: "Externe",
      under5k: "Moins de 5K$",
      from5kTo25k: "5K$ - 25K$",
      from25kTo100k: "25K$ - 100K$",
      over100k: "Plus de 100K$",
      last7days: "7 derniers jours",
      last30days: "30 derniers jours",
      last90days: "90 derniers jours",
      older: "Plus ancien",
      hot: "Chaud (80+)",
      warm: "Tiède (50-79)",
      cold: "Froid (0-49)",
      tags: "Tags",
      addTag: "Ajouter un tag",
      removeTag: "Retirer le tag",
      noTags: "Aucun tag",
      manageTags: "Gérer les tags",
    },
  };

  const l = labels[language];

  // Filter function
  const applyFilters = (lead: Lead): boolean => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        lead.firstName.toLowerCase().includes(query) ||
        lead.lastName.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        (lead.company?.toLowerCase().includes(query) || false);
      if (!matchesSearch) return false;
    }
    
    // Source filter - we need to check if lead has source property
    // For now we'll skip this as source isn't in the Lead interface
    
    // Value filter
    if (valueFilter !== "all") {
      const value = lead.dealValue || 0;
      switch (valueFilter) {
        case "under5k":
          if (value >= 5000) return false;
          break;
        case "5k-25k":
          if (value < 5000 || value >= 25000) return false;
          break;
        case "25k-100k":
          if (value < 25000 || value >= 100000) return false;
          break;
        case "over100k":
          if (value < 100000) return false;
          break;
      }
    }
    
    // Date filter
    if (dateFilter !== "all") {
      const createdAt = new Date(lead.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      switch (dateFilter) {
        case "7days":
          if (daysDiff > 7) return false;
          break;
        case "30days":
          if (daysDiff > 30) return false;
          break;
        case "90days":
          if (daysDiff > 90) return false;
          break;
        case "older":
          if (daysDiff <= 90) return false;
          break;
      }
    }
    
    // Score filter
    if (scoreFilter !== "all") {
      const score = lead.leadScore || 0;
      switch (scoreFilter) {
        case "hot":
          if (score < 80) return false;
          break;
        case "warm":
          if (score < 50 || score >= 80) return false;
          break;
        case "cold":
          if (score >= 50) return false;
          break;
      }
    }
    
    return true;
  };

  // Organize leads into stages with filters
  useEffect(() => {
    if (leadsQuery.data?.leads) {
      const organizedStages = PIPELINE_STAGES.map((stage) => ({
        ...stage,
        leads: leadsQuery.data.leads.filter((lead: Lead) => {
          const status = lead.status?.toLowerCase() || "new";
          return status === stage.id && applyFilters(lead);
        }),
      }));
      setStages(organizedStages);
    }
  }, [leadsQuery.data, searchQuery, sourceFilter, valueFilter, dateFilter, scoreFilter]);

  // Calculate pipeline metrics
  const metrics = {
    totalValue: stages.reduce(
      (sum, stage) =>
        sum + stage.leads.reduce((s, lead) => s + (lead.dealValue || 0), 0),
      0
    ),
    avgDealSize:
      stages.reduce((sum, stage) => sum + stage.leads.length, 0) > 0
        ? stages.reduce(
            (sum, stage) =>
              sum + stage.leads.reduce((s, lead) => s + (lead.dealValue || 0), 0),
            0
          ) / stages.reduce((sum, stage) => sum + stage.leads.length, 0)
        : 0,
    conversionRate:
      stages.find((s) => s.id === "converted")?.leads.length || 0,
    newLeads: stages.find((s) => s.id === "new")?.leads.length || 0,
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStage(null);

    if (draggedLead && draggedLead.status !== stageId) {
      const oldStatus = draggedLead.status;
      updateLeadMutation.mutate({
        leadId: draggedLead.id,
        status: stageId,
      });
      // Record history
      addHistoryMutation.mutate({
        leadId: draggedLead.id,
        action: "status_changed",
        fieldName: "status",
        oldValue: oldStatus || undefined,
        newValue: stageId,
      });
    }

    setDraggedLead(null);
  };

  const handleMoveToStage = (lead: Lead, stageId: string) => {
    const oldStatus = lead.status;
    updateLeadMutation.mutate({
      leadId: lead.id,
      status: stageId,
    });
    // Record history
    addHistoryMutation.mutate({
      leadId: lead.id,
      action: "status_changed",
      fieldName: "status",
      oldValue: oldStatus || undefined,
      newValue: stageId,
    });
    setShowLeadDialog(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === "fr" ? "fr-CA" : "en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateInput: string | Date | null | undefined) => {
    if (!dateInput) return "-";
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString(
      language === "fr" ? "fr-CA" : "en-CA",
      { month: "short", day: "numeric" }
    );
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "bg-gray-100 text-gray-600";
    if (score >= 70) return "bg-green-100 text-green-700";
    if (score >= 40) return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{l.title}</h2>
            <p className="text-muted-foreground text-sm">{l.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button
                  variant={sourceFilter !== "all" || valueFilter !== "all" || dateFilter !== "all" || scoreFilter !== "all" ? "default" : "outline"}
                  size="sm"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {l.filters}
                  {(sourceFilter !== "all" || valueFilter !== "all" || dateFilter !== "all" || scoreFilter !== "all") && (
                    <Badge variant="secondary" className="ml-2">
                      {[sourceFilter, valueFilter, dateFilter, scoreFilter].filter(f => f !== "all").length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{l.filters}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSourceFilter("all");
                        setValueFilter("all");
                        setDateFilter("all");
                        setScoreFilter("all");
                      }}
                    >
                      {l.clearFilters}
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{l.value}</Label>
                    <Select value={valueFilter} onValueChange={setValueFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{l.all}</SelectItem>
                        <SelectItem value="under5k">{l.under5k}</SelectItem>
                        <SelectItem value="5k-25k">{l.from5kTo25k}</SelectItem>
                        <SelectItem value="25k-100k">{l.from25kTo100k}</SelectItem>
                        <SelectItem value="over100k">{l.over100k}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{l.dateCreated}</Label>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{l.all}</SelectItem>
                        <SelectItem value="7days">{l.last7days}</SelectItem>
                        <SelectItem value="30days">{l.last30days}</SelectItem>
                        <SelectItem value="90days">{l.last90days}</SelectItem>
                        <SelectItem value="older">{l.older}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{l.leadScore}</Label>
                    <Select value={scoreFilter} onValueChange={setScoreFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{l.all}</SelectItem>
                        <SelectItem value="hot">{l.hot}</SelectItem>
                        <SelectItem value="warm">{l.warm}</SelectItem>
                        <SelectItem value="cold">{l.cold}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              size="sm"
              onClick={() => leadsQuery.refetch()}
              disabled={leadsQuery.isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${leadsQuery.isLoading ? "animate-spin" : ""}`} />
              {l.refresh}
            </Button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={l.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Active Filters Display */}
        {(sourceFilter !== "all" || valueFilter !== "all" || dateFilter !== "all" || scoreFilter !== "all") && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">{l.activeFilters}:</span>
            {valueFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {l.value}: {valueFilter === "under5k" ? l.under5k : valueFilter === "5k-25k" ? l.from5kTo25k : valueFilter === "25k-100k" ? l.from25kTo100k : l.over100k}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setValueFilter("all")} />
              </Badge>
            )}
            {dateFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {l.dateCreated}: {dateFilter === "7days" ? l.last7days : dateFilter === "30days" ? l.last30days : dateFilter === "90days" ? l.last90days : l.older}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setDateFilter("all")} />
              </Badge>
            )}
            {scoreFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {l.leadScore}: {scoreFilter === "hot" ? l.hot : scoreFilter === "warm" ? l.warm : l.cold}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setScoreFilter("all")} />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{l.totalValue}</p>
                <p className="text-xl font-bold">{formatCurrency(metrics.totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{l.avgDealSize}</p>
                <p className="text-xl font-bold">{formatCurrency(metrics.avgDealSize)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#E7F2F2] flex items-center justify-center">
                <Target className="h-5 w-5 text-[#0F3D3E]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{l.conversionRate}</p>
                <p className="text-xl font-bold">{metrics.conversionRate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <User className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{l.newLeads}</p>
                <p className="text-xl font-bold">{metrics.newLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className={`flex-shrink-0 w-72 rounded-lg border ${
              dragOverStage === stage.id ? "ring-2 ring-primary" : ""
            } ${stage.bgColor}`}
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            {/* Stage Header */}
            <div className="p-3 border-b bg-white/50 dark:bg-black/20 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${stage.color}`}>
                    {language === "fr" ? stage.titleFr : stage.title}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {stage.leads.length}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatCurrency(
                    stage.leads.reduce((sum, lead) => sum + (lead.dealValue || 0), 0)
                  )}
                </span>
              </div>
            </div>

            {/* Stage Cards */}
            <div className="p-2 space-y-2 min-h-[400px]">
              {stage.leads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {l.noLeads}
                </div>
              ) : (
                stage.leads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead)}
                    onClick={() => {
                      setSelectedLead(lead);
                      setShowLeadDialog(true);
                    }}
                    className={`bg-white dark:bg-slate-900 rounded-lg border p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
                      draggedLead?.id === lead.id ? "opacity-50" : ""
                    }`}
                  >
                    {/* Lead Card Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {lead.firstName[0]}
                            {lead.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {lead.firstName} {lead.lastName}
                          </p>
                          {lead.company && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {lead.company}
                            </p>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-10 w-10 p-0 min-h-[44px] min-w-[44px]" aria-label="More options">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {PIPELINE_STAGES.filter((s) => s.id !== stage.id).map(
                            (targetStage) => (
                              <DropdownMenuItem
                                key={targetStage.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveToStage(lead, targetStage.id);
                                }}
                              >
                                <ArrowRight className="h-4 w-4 mr-2" />
                                {language === "fr"
                                  ? targetStage.titleFr
                                  : targetStage.title}
                              </DropdownMenuItem>
                            )
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Lead Card Body */}
                    <div className="space-y-2">
                      {lead.dealValue && (
                        <div className="flex items-center gap-1 text-sm">
                          <DollarSign className="h-3 w-3 text-green-600" />
                          <span className="font-semibold text-green-600">
                            {formatCurrency(lead.dealValue)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getScoreColor(lead.leadScore)}`}
                        >
                          {l.score}: {lead.leadScore || 0}
                        </Badge>
                        {lead.expectedCloseDate && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(lead.expectedCloseDate)}
                          </span>
                        )}
                      </div>
                      
                      {/* Tags Section */}
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        {(leadTags[lead.id] || []).map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className="text-xs px-1.5 py-0 h-5 gap-1"
                            style={{
                              backgroundColor: `${tag.color}20`,
                              color: tag.color,
                              borderColor: tag.color,
                            }}
                          >
                            {tag.name}
                            <X
                              className="h-3 w-3 cursor-pointer hover:opacity-70"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeTagMutation.mutate({ leadId: lead.id, tagId: tag.id });
                              }}
                            />
                          </Badge>
                        ))}
                        <Popover
                          open={showTagPopover === lead.id}
                          onOpenChange={(open) => setShowTagPopover(open ? lead.id : null)}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 rounded-full"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Tag className="h-3 w-3" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48 p-2" align="start" onClick={(e) => e.stopPropagation()}>
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-muted-foreground mb-2">{l.addTag}</p>
                              {tagsQuery.data?.tags.length === 0 ? (
                                <p className="text-xs text-muted-foreground">{l.noTags}</p>
                              ) : (
                                tagsQuery.data?.tags
                                  .filter((tag) => !(leadTags[lead.id] || []).some((t) => t.id === tag.id))
                                  .map((tag) => (
                                    <button
                                      key={tag.id}
                                      className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-muted text-left text-sm"
                                      onClick={() => {
                                        assignTagMutation.mutate({ leadId: lead.id, tagId: tag.id });
                                        setShowTagPopover(null);
                                      }}
                                    >
                                      <div
                                        className="h-3 w-3 rounded-full"
                                        style={{ backgroundColor: tag.color }}
                                      />
                                      {tag.name}
                                    </button>
                                  ))
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lead Details Dialog */}
      <Dialog open={showLeadDialog} onOpenChange={setShowLeadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{l.leadDetails}</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              {/* Lead Info */}
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {selectedLead.firstName[0]}
                    {selectedLead.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">
                    {selectedLead.firstName} {selectedLead.lastName}
                  </p>
                  {selectedLead.company && (
                    <p className="text-sm text-muted-foreground">
                      {selectedLead.jobTitle} @ {selectedLead.company}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{selectedLead.email}</span>
                </div>
                {selectedLead.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedLead.phone}</span>
                  </div>
                )}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-white dark:bg-slate-800">
                  <p className="text-xs text-muted-foreground">{l.score}</p>
                  <p className="text-lg font-bold">{selectedLead.leadScore || 0}</p>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-slate-800">
                  <p className="text-xs text-muted-foreground">{l.dealValue}</p>
                  <p className="text-lg font-bold">
                    {selectedLead.dealValue
                      ? formatCurrency(selectedLead.dealValue)
                      : "-"}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">{l.lastContact}</p>
                  <p>{formatDate(selectedLead.lastContactedAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{l.expectedClose}</p>
                  <p>{formatDate(selectedLead.expectedCloseDate)}</p>
                </div>
              </div>

              {/* Move to Stage */}
              <div>
                <p className="text-sm font-medium mb-2">{l.moveToStage}</p>
                <div className="flex flex-wrap gap-2">
                  {PIPELINE_STAGES.map((stage) => (
                    <Button
                      key={stage.id}
                      variant={selectedLead.status === stage.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleMoveToStage(selectedLead, stage.id)}
                      disabled={selectedLead.status === stage.id}
                    >
                      {language === "fr" ? stage.titleFr : stage.title}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Activity History */}
              <LeadHistoryTimeline leadId={selectedLead.id} />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLeadDialog(false)}>
              {l.cancel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
