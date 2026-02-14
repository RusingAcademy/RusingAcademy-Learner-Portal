import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Merge,
  Search,
  User,
  Mail,
  Building2,
  Phone,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  History,
} from "lucide-react";
import { toast } from "sonner";

interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  company: string | null;
  phone: string | null;
  jobTitle: string | null;
  status: string | null;
  leadScore: number | string | null;
  budget: number | string | null;
  source: string | null;
  leadType: string | null;
  notes?: string | null;
  createdAt: Date;
}

export default function LeadMergeManager() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeads, setSelectedLeads] = useState<Lead[]>([]);
  const [primaryLeadId, setPrimaryLeadId] = useState<number | null>(null);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [mergePreview, setMergePreview] = useState<Record<string, any>>({});

  const leadsQuery = trpc.crm.getLeadsWithScores.useQuery({});
  const mergeMutation = trpc.crm.mergeLeads.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Leads fusionnés avec succès" : "Leads merged successfully");
      leadsQuery.refetch();
      resetSelection();
      setShowMergeDialog(false);
    },
    onError: (error: any) => {
      toast.error(language === "fr" ? "Erreur de fusion" : "Merge failed");
      console.error(error);
    },
  });

  const labels = {
    en: {
      title: "Lead Merge",
      subtitle: "Find and merge duplicate leads",
      search: "Search leads by name or email",
      selectLeads: "Select Leads to Merge",
      selectedLeads: "Selected Leads",
      noLeadsSelected: "Select at least 2 leads to merge",
      selectPrimary: "Select Primary Lead",
      primaryLead: "Primary Lead",
      secondaryLead: "Secondary Lead",
      mergePreview: "Merge Preview",
      merge: "Merge Leads",
      cancel: "Cancel",
      clear: "Clear Selection",
      name: "Name",
      email: "Email",
      company: "Company",
      phone: "Phone",
      status: "Status",
      score: "Score",
      source: "Source",
      created: "Created",
      duplicateWarning: "Potential duplicates detected",
      keepValue: "Keep this value",
      mergedValue: "Merged Value",
      historyNote: "All activity history will be preserved",
      selectAtLeast: "Select at least 2 leads",
      selectPrimaryFirst: "Select primary lead first",
    },
    fr: {
      title: "Fusion de Leads",
      subtitle: "Trouvez et fusionnez les leads en double",
      search: "Rechercher par nom ou email",
      selectLeads: "Sélectionner les Leads à Fusionner",
      selectedLeads: "Leads Sélectionnés",
      noLeadsSelected: "Sélectionnez au moins 2 leads à fusionner",
      selectPrimary: "Sélectionner le Lead Principal",
      primaryLead: "Lead Principal",
      secondaryLead: "Lead Secondaire",
      mergePreview: "Aperçu de la Fusion",
      merge: "Fusionner les Leads",
      cancel: "Annuler",
      clear: "Effacer la Sélection",
      name: "Nom",
      email: "Email",
      company: "Entreprise",
      phone: "Téléphone",
      status: "Statut",
      score: "Score",
      source: "Source",
      created: "Créé",
      duplicateWarning: "Doublons potentiels détectés",
      keepValue: "Garder cette valeur",
      mergedValue: "Valeur Fusionnée",
      historyNote: "Tout l'historique d'activité sera conservé",
      selectAtLeast: "Sélectionnez au moins 2 leads",
      selectPrimaryFirst: "Sélectionnez d'abord le lead principal",
    },
  };

  const l = labels[language];

  // Filter leads based on search
  const filteredLeads = useMemo(() => {
    const leads = leadsQuery.data?.leads || [];
    if (!searchQuery) return leads;
    
    const query = searchQuery.toLowerCase();
    return leads.filter(
      (lead) =>
        lead.firstName.toLowerCase().includes(query) ||
        lead.lastName.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        (lead.company && lead.company.toLowerCase().includes(query))
    );
  }, [leadsQuery.data, searchQuery]);

  // Find potential duplicates
  const potentialDuplicates = useMemo(() => {
    const leads = leadsQuery.data?.leads || [];
    const duplicates: Lead[][] = [];
    const processed = new Set<number>();

    leads.forEach((lead) => {
      if (processed.has(lead.id)) return;

      const matches = leads.filter(
        (other) =>
          other.id !== lead.id &&
          !processed.has(other.id) &&
          (other.email.toLowerCase() === lead.email.toLowerCase() ||
            (other.firstName.toLowerCase() === lead.firstName.toLowerCase() &&
              other.lastName.toLowerCase() === lead.lastName.toLowerCase()))
      );

      if (matches.length > 0) {
        duplicates.push([lead as Lead, ...matches as unknown as Lead[]]);
        processed.add(lead.id);
        matches.forEach((m) => processed.add(m.id));
      }
    });

    return duplicates;
  }, [leadsQuery.data]);

  const toggleLeadSelection = (lead: Lead) => {
    setSelectedLeads((prev) => {
      const isSelected = prev.some((l) => l.id === lead.id);
      if (isSelected) {
        const newSelection = prev.filter((l) => l.id !== lead.id);
        if (primaryLeadId === lead.id) {
          setPrimaryLeadId(newSelection.length > 0 ? newSelection[0].id : null);
        }
        return newSelection;
      } else {
        const newSelection = [...prev, lead];
        if (!primaryLeadId) {
          setPrimaryLeadId(lead.id);
        }
        return newSelection;
      }
    });
  };

  const selectDuplicateGroup = (group: Lead[]) => {
    setSelectedLeads(group);
    setPrimaryLeadId(group[0].id);
  };

  const resetSelection = () => {
    setSelectedLeads([]);
    setPrimaryLeadId(null);
    setMergePreview({});
  };

  const prepareMergePreview = () => {
    if (selectedLeads.length < 2 || !primaryLeadId) return;

    const primary = selectedLeads.find((l) => l.id === primaryLeadId);
    if (!primary) return;

    const merged: Record<string, any> = { ...primary };

    // For each field, use primary value if exists, otherwise use first non-null from secondaries
    const fields = ["company", "phone", "jobTitle", "notes", "budget", "source"];
    fields.forEach((field) => {
      if (!merged[field]) {
        const secondary = selectedLeads.find((l) => l.id !== primaryLeadId && (l as any)[field]);
        if (secondary) {
          merged[field] = (secondary as any)[field];
        }
      }
    });

    // Use highest lead score
    merged.leadScore = Math.max(...selectedLeads.map((l) => Number(l.leadScore) || 0));

    setMergePreview(merged);
    setShowMergeDialog(true);
  };

  const handleMerge = () => {
    if (!primaryLeadId || selectedLeads.length < 2) return;

    const secondaryIds = selectedLeads
      .filter((l) => l.id !== primaryLeadId)
      .map((l) => l.id);

    mergeMutation.mutate({
      primaryLeadId,
      secondaryLeadIds: secondaryIds,
      mergedData: mergePreview,
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Merge className="h-6 w-6 text-primary" />
            {l.title}
          </h2>
          <p className="text-muted-foreground">{l.subtitle}</p>
        </div>
        {selectedLeads.length > 0 && (
          <Button variant="outline" onClick={resetSelection}>
            {l.clear}
          </Button>
        )}
      </div>

      {/* Potential Duplicates */}
      {potentialDuplicates.length > 0 && (
        <Card className="border-[#FFE4D6] bg-amber-50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              {l.duplicateWarning}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {potentialDuplicates.slice(0, 5).map((group, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-800"
                >
                  <div className="flex items-center gap-4">
                    {group.map((lead, i) => (
                      <div key={lead.id} className="flex items-center gap-2">
                        {i > 0 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                        <div>
                          <p className="font-medium">
                            {lead.firstName} {lead.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{lead.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button size="sm" onClick={() => selectDuplicateGroup(group)}>
                    {l.merge}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Selection */}
      <Card>
        <CardHeader>
          <CardTitle>{l.selectLeads}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={l.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-64 overflow-y-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>{l.name}</TableHead>
                    <TableHead>{l.email}</TableHead>
                    <TableHead>{l.company}</TableHead>
                    <TableHead>{l.status}</TableHead>
                    <TableHead>{l.score}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.slice(0, 50).map((lead) => {
                    const isSelected = selectedLeads.some((l) => l.id === lead.id);
                    return (
                      <TableRow
                        key={lead.id}
                        className={`cursor-pointer ${isSelected ? "bg-primary/10" : ""}`}
                        onClick={() => toggleLeadSelection(lead as unknown as Lead)}
                      >
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="h-4 w-4"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {lead.firstName} {lead.lastName}
                        </TableCell>
                        <TableCell>{lead.email}</TableCell>
                        <TableCell>{lead.company || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{lead.status}</Badge>
                        </TableCell>
                        <TableCell>{lead.leadScore || 0}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Leads */}
      {selectedLeads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {l.selectedLeads} ({selectedLeads.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">{l.selectPrimary}</Label>
                <RadioGroup
                  value={primaryLeadId?.toString() || ""}
                  onValueChange={(v) => setPrimaryLeadId(parseInt(v))}
                >
                  {selectedLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border ${
                        primaryLeadId === lead.id
                          ? "border-primary bg-primary/5"
                          : "border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <RadioGroupItem value={lead.id.toString()} id={`lead-${lead.id}`} />
                      <label
                        htmlFor={`lead-${lead.id}`}
                        className="flex-1 cursor-pointer grid grid-cols-4 gap-4"
                      >
                        <div>
                          <p className="font-medium">
                            {lead.firstName} {lead.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{lead.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{l.company}</p>
                          <p>{lead.company || "-"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{l.score}</p>
                          <p>{lead.leadScore || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{l.created}</p>
                          <p>{formatDate(lead.createdAt)}</p>
                        </div>
                      </label>
                      {primaryLeadId === lead.id && (
                        <Badge variant="default">{l.primaryLead}</Badge>
                      )}
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <History className="h-4 w-4" />
                {l.historyNote}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetSelection}>
                  {l.cancel}
                </Button>
                <Button
                  onClick={prepareMergePreview}
                  disabled={selectedLeads.length < 2 || !primaryLeadId}
                >
                  <Merge className="h-4 w-4 mr-2" />
                  {l.merge}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedLeads.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">{l.noLeadsSelected}</p>
          </CardContent>
        </Card>
      )}

      {/* Merge Preview Dialog */}
      <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{l.mergePreview}</DialogTitle>
            <DialogDescription>
              {language === "fr"
                ? "Vérifiez les données fusionnées avant de confirmer"
                : "Review the merged data before confirming"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{l.name}</Label>
                <div className="p-2 rounded bg-white dark:bg-slate-800">
                  {mergePreview.firstName} {mergePreview.lastName}
                </div>
              </div>
              <div className="space-y-2">
                <Label>{l.email}</Label>
                <div className="p-2 rounded bg-white dark:bg-slate-800">
                  {mergePreview.email}
                </div>
              </div>
              <div className="space-y-2">
                <Label>{l.company}</Label>
                <div className="p-2 rounded bg-white dark:bg-slate-800">
                  {mergePreview.company || "-"}
                </div>
              </div>
              <div className="space-y-2">
                <Label>{l.phone}</Label>
                <div className="p-2 rounded bg-white dark:bg-slate-800">
                  {mergePreview.phone || "-"}
                </div>
              </div>
              <div className="space-y-2">
                <Label>{l.status}</Label>
                <div className="p-2 rounded bg-white dark:bg-slate-800">
                  <Badge variant="outline">{mergePreview.status}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{l.score}</Label>
                <div className="p-2 rounded bg-white dark:bg-slate-800">
                  {mergePreview.leadScore || 0}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-[#FFE4D6]">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-700 dark:text-amber-400">
                    {language === "fr" ? "Attention" : "Warning"}
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-500">
                    {language === "fr"
                      ? `${selectedLeads.length - 1} lead(s) secondaire(s) seront supprimés. Cette action est irréversible.`
                      : `${selectedLeads.length - 1} secondary lead(s) will be deleted. This action cannot be undone.`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMergeDialog(false)}>
              {l.cancel}
            </Button>
            <Button onClick={handleMerge} disabled={mergeMutation.isPending}>
              <CheckCircle className="h-4 w-4 mr-2" />
              {l.merge}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
