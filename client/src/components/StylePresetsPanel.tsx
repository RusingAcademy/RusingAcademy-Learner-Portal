/**
 * StylePresetsPanel — Browse, apply, create, and manage style presets
 * Designed to be embedded inside the SectionEditorPanel's Style tab
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Palette, Plus, Trash2, Save, Loader2, Star, Sparkles } from "lucide-react";

interface StylePreset {
  id: number;
  name: string;
  description: string | null;
  category: string;
  isDefault: number | boolean;
  styles: {
    backgroundColor?: string;
    textColor?: string;
    paddingTop?: number;
    paddingBottom?: number;
  };
}

interface StylePresetsPanelProps {
  sectionId: number;
  onApply: (styles: { backgroundColor?: string; textColor?: string; paddingTop?: number; paddingBottom?: number }) => void;
  currentStyles: {
    backgroundColor: string;
    textColor: string;
    paddingTop: number;
    paddingBottom: number;
  };
}

export default function StylePresetsPanel({ sectionId, onApply, currentStyles }: StylePresetsPanelProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [newPresetDesc, setNewPresetDesc] = useState("");
  const utils = trpc.useUtils();

  const presetsQuery = trpc.stylePresets.list.useQuery();
  const applyMut = trpc.stylePresets.applyToSection.useMutation({
    onSuccess: (data) => {
      onApply(data.appliedStyles);
      toast.success("Style preset applied");
    },
    onError: (err) => toast.error(err.message),
  });
  const saveMut = trpc.stylePresets.saveFromSection.useMutation({
    onSuccess: () => {
      utils.stylePresets.list.invalidate();
      setShowSaveDialog(false);
      setNewPresetName("");
      setNewPresetDesc("");
      toast.success("Style preset saved");
    },
    onError: (err) => toast.error(err.message),
  });
  const deleteMut = trpc.stylePresets.delete.useMutation({
    onSuccess: () => {
      utils.stylePresets.list.invalidate();
      toast.success("Preset deleted");
    },
    onError: (err) => toast.error(err.message),
  });

  const presets: StylePreset[] = (presetsQuery.data || []) as StylePreset[];
  const brandPresets = presets.filter(p => p.category === "brand");
  const minimalPresets = presets.filter(p => p.category === "minimal");
  const accentPresets = presets.filter(p => p.category === "accent");
  const customPresets = presets.filter(p => p.category === "custom");

  const renderPresetGroup = (title: string, items: StylePreset[], icon: React.ReactNode) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {items.map(preset => (
            <button
              key={preset.id}
              onClick={() => applyMut.mutate({ presetId: preset.id, sectionId })}
              disabled={applyMut.isPending}
              className="group relative flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all text-left"
            >
              <div className="flex gap-0.5 shrink-0">
                <div className="w-4 h-4 rounded-sm border border-gray-200" style={{ backgroundColor: preset.styles.backgroundColor || "#fff" }} />
                <div className="w-4 h-4 rounded-sm border border-gray-200" style={{ backgroundColor: preset.styles.textColor || "#000" }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium truncate">{preset.name}</p>
              </div>
              {!preset.isDefault && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Delete this preset?")) deleteMut.mutate({ id: preset.id });
                  }}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 transition-opacity"
                  title="Delete preset"
                >
                  <Trash2 className="h-2.5 w-2.5 text-red-400" />
                </button>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
          <Palette className="h-3 w-3" /> Style Presets
        </Label>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-[10px] px-2 gap-1"
          onClick={() => setShowSaveDialog(true)}
        >
          <Save className="h-3 w-3" /> Save Current
        </Button>
      </div>

      {presetsQuery.isLoading ? (
        <div className="flex items-center gap-2 p-3 text-xs text-gray-400">
          <Loader2 className="h-3 w-3 animate-spin" /> Loading presets...
        </div>
      ) : (
        <div className="space-y-3">
          {renderPresetGroup("Brand", brandPresets, <Star className="h-3 w-3 text-amber-500" />)}
          {renderPresetGroup("Minimal", minimalPresets, <Sparkles className="h-3 w-3 text-gray-400" />)}
          {renderPresetGroup("Accent", accentPresets, <Palette className="h-3 w-3 text-indigo-400" />)}
          {renderPresetGroup("Custom", customPresets, <Plus className="h-3 w-3 text-green-500" />)}
        </div>
      )}

      {/* Current style preview */}
      <div className="p-2.5 rounded-lg border border-dashed border-gray-200 bg-gray-50/50">
        <p className="text-[10px] text-gray-400 mb-1.5">Current Section Style</p>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded border" style={{ backgroundColor: currentStyles.backgroundColor }} />
          <div className="text-[10px] space-y-0.5">
            <p>BG: <code className="bg-gray-100 px-1 rounded">{currentStyles.backgroundColor}</code></p>
            <p>Text: <code className="bg-gray-100 px-1 rounded">{currentStyles.textColor}</code></p>
          </div>
        </div>
      </div>

      {/* Save as preset dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Save className="h-4 w-4 text-indigo-500" /> Save as Style Preset
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Current Style</p>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-6 h-6 rounded border" style={{ backgroundColor: currentStyles.backgroundColor }} />
                  <div className="w-6 h-6 rounded border" style={{ backgroundColor: currentStyles.textColor }} />
                </div>
                <div className="text-[10px] text-gray-500">
                  Padding: {currentStyles.paddingTop}px / {currentStyles.paddingBottom}px
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Preset Name</Label>
              <Input
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="My Custom Style"
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description (optional)</Label>
              <Input
                value={newPresetDesc}
                onChange={(e) => setNewPresetDesc(e.target.value)}
                placeholder="Dark theme with gold accents"
                className="text-sm"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" size="sm">Cancel</Button>
            </DialogClose>
            <Button
              size="sm"
              onClick={() => saveMut.mutate({ sectionId, name: newPresetName, description: newPresetDesc || undefined })}
              disabled={!newPresetName.trim() || saveMut.isPending}
            >
              {saveMut.isPending && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
              Save Preset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
