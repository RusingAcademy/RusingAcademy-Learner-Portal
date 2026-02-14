import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tag,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Palette,
  Users,
} from "lucide-react";
import { toast } from "sonner";

interface LeadTag {
  id: number;
  name: string;
  color: string;
  description: string | null;
  createdAt: Date;
}

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#84cc16", // lime
  "#22c55e", // green
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#ec4899", // pink
];

export default function LeadTagsManager() {
  const { language } = useLanguage();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTag, setSelectedTag] = useState<LeadTag | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6366f1");
  const [newTagDescription, setNewTagDescription] = useState("");

  const tagsQuery = trpc.crm.getTags.useQuery();
  
  const createTagMutation = trpc.crm.createTag.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Tag créé" : "Tag created");
      tagsQuery.refetch();
      setShowCreateDialog(false);
      resetForm();
    },
    onError: () => {
      toast.error(language === "fr" ? "Erreur lors de la création" : "Error creating tag");
    },
  });

  const updateTagMutation = trpc.crm.updateTag.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Tag mis à jour" : "Tag updated");
      tagsQuery.refetch();
      setShowEditDialog(false);
      setSelectedTag(null);
    },
    onError: () => {
      toast.error(language === "fr" ? "Erreur lors de la mise à jour" : "Error updating tag");
    },
  });

  const deleteTagMutation = trpc.crm.deleteTag.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Tag supprimé" : "Tag deleted");
      tagsQuery.refetch();
    },
    onError: () => {
      toast.error(language === "fr" ? "Erreur lors de la suppression" : "Error deleting tag");
    },
  });

  const labels = {
    en: {
      title: "Lead Tags",
      subtitle: "Create and manage tags to categorize your leads",
      createTag: "Create Tag",
      editTag: "Edit Tag",
      deleteTag: "Delete Tag",
      tagName: "Tag Name",
      tagColor: "Tag Color",
      description: "Description",
      save: "Save",
      cancel: "Cancel",
      create: "Create",
      noTags: "No tags created yet",
      noTagsDesc: "Create your first tag to start categorizing leads",
      confirmDelete: "Are you sure you want to delete this tag? It will be removed from all leads.",
      presetColors: "Preset Colors",
      customColor: "Custom Color",
    },
    fr: {
      title: "Tags de leads",
      subtitle: "Créez et gérez des tags pour catégoriser vos leads",
      createTag: "Créer un tag",
      editTag: "Modifier le tag",
      deleteTag: "Supprimer le tag",
      tagName: "Nom du tag",
      tagColor: "Couleur du tag",
      description: "Description",
      save: "Enregistrer",
      cancel: "Annuler",
      create: "Créer",
      noTags: "Aucun tag créé",
      noTagsDesc: "Créez votre premier tag pour commencer à catégoriser les leads",
      confirmDelete: "Êtes-vous sûr de vouloir supprimer ce tag? Il sera retiré de tous les leads.",
      presetColors: "Couleurs prédéfinies",
      customColor: "Couleur personnalisée",
    },
  };

  const l = labels[language];

  const resetForm = () => {
    setNewTagName("");
    setNewTagColor("#6366f1");
    setNewTagDescription("");
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    createTagMutation.mutate({
      name: newTagName.trim(),
      color: newTagColor,
      description: newTagDescription.trim() || undefined,
    });
  };

  const handleUpdateTag = () => {
    if (!selectedTag || !newTagName.trim()) return;
    updateTagMutation.mutate({
      id: selectedTag.id,
      name: newTagName.trim(),
      color: newTagColor,
      description: newTagDescription.trim() || undefined,
    });
  };

  const handleDeleteTag = (tag: LeadTag) => {
    if (confirm(l.confirmDelete)) {
      deleteTagMutation.mutate({ id: tag.id });
    }
  };

  const openEditDialog = (tag: LeadTag) => {
    setSelectedTag(tag as any);
    setNewTagName(tag.name);
    setNewTagColor(tag.color);
    setNewTagDescription(tag.description || "");
    setShowEditDialog(true);
  };

  const tags = tagsQuery.data?.tags || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Tag className="h-6 w-6" />
            {l.title}
          </h2>
          <p className="text-muted-foreground">{l.subtitle}</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {l.createTag}
        </Button>
      </div>

      {/* Tags Grid */}
      {tags.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">{l.noTags}</h3>
            <p className="text-muted-foreground text-sm mb-4">{l.noTagsDesc}</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {l.createTag}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags.map((tag) => (
            <Card key={tag.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <CardTitle className="text-lg">{tag.name}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-10 w-10 p-0 min-h-[44px] min-w-[44px]" aria-label="Tag options">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(tag as any)}>
                        <Edit className="h-4 w-4 mr-2" />
                        {l.editTag}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteTag(tag as any)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {l.deleteTag}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {tag.description && (
                  <p className="text-sm text-muted-foreground">{tag.description}</p>
                )}
                <div className="mt-3 flex items-center gap-2">
                  <Badge
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                      borderColor: tag.color,
                    }}
                    variant="outline"
                  >
                    {tag.name}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Tag Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{l.createTag}</DialogTitle>
            <DialogDescription>
              {language === "fr"
                ? "Créez un nouveau tag pour catégoriser vos leads"
                : "Create a new tag to categorize your leads"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{l.tagName}</Label>
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder={language === "fr" ? "Ex: VIP, Prioritaire, À rappeler" : "Ex: VIP, Priority, Follow-up"}
              />
            </div>
            <div className="space-y-2">
              <Label>{l.tagColor}</Label>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{l.presetColors}</p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewTagColor(color)}
                      className={`h-8 w-8 rounded-full border-2 transition-all ${
                        newTagColor === color ? "border-foreground scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">{l.customColor}:</Label>
                  <Input
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="h-8 w-16 p-0 border-0"
                  />
                  <Input
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="w-24"
                    placeholder="#6366f1"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{l.description}</Label>
              <Textarea
                value={newTagDescription}
                onChange={(e) => setNewTagDescription(e.target.value)}
                placeholder={language === "fr" ? "Description optionnelle..." : "Optional description..."}
                rows={2}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {language === "fr" ? "Aperçu:" : "Preview:"}
              </span>
              <Badge
                style={{
                  backgroundColor: `${newTagColor}20`,
                  color: newTagColor,
                  borderColor: newTagColor,
                }}
                variant="outline"
              >
                {newTagName || (language === "fr" ? "Nom du tag" : "Tag name")}
              </Badge>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              resetForm();
            }}>
              {l.cancel}
            </Button>
            <Button onClick={handleCreateTag} disabled={!newTagName.trim() || createTagMutation.isPending}>
              {l.create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tag Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{l.editTag}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{l.tagName}</Label>
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{l.tagColor}</Label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewTagColor(color)}
                      className={`h-8 w-8 rounded-full border-2 transition-all ${
                        newTagColor === color ? "border-foreground scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="h-8 w-16 p-0 border-0"
                  />
                  <Input
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="w-24"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{l.description}</Label>
              <Textarea
                value={newTagDescription}
                onChange={(e) => setNewTagDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              setSelectedTag(null);
            }}>
              {l.cancel}
            </Button>
            <Button onClick={handleUpdateTag} disabled={!newTagName.trim() || updateTagMutation.isPending}>
              {l.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
