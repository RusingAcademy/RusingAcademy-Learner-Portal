/**
 * AnimationPresetsPanel — Section Animation Presets for the Visual Editor
 *
 * Provides sober, institutional-grade animation presets for CMS sections.
 * Designed for Canadian public service context — no flashy effects.
 *
 * Features:
 * - Preset library: fade-in, slide-up, slide-left, slide-right, scale-in, blur-in
 * - Per-section animation settings (type, delay, duration)
 * - Live preview of animations
 * - Accessibility: respects prefers-reduced-motion
 * - Performance-first: uses Intersection Observer + CSS transforms
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Eye, Sparkles, ArrowUp, ArrowLeft, ArrowRight, Maximize2,
  Minus, Loader2, X,
} from "lucide-react";

// ─── Animation Preset Definitions ───
export const ANIMATION_PRESETS = [
  {
    id: "none",
    label: "None",
    labelFr: "Aucune",
    description: "No animation",
    descriptionFr: "Pas d'animation",
    icon: Minus,
    category: "basic",
  },
  {
    id: "fade-in",
    label: "Fade In",
    labelFr: "Fondu entrant",
    description: "Gentle opacity transition",
    descriptionFr: "Transition d'opacité douce",
    icon: Eye,
    category: "basic",
    css: { from: "opacity: 0", to: "opacity: 1" },
  },
  {
    id: "slide-up",
    label: "Slide Up",
    labelFr: "Glissement vers le haut",
    description: "Subtle upward movement with fade",
    descriptionFr: "Mouvement subtil vers le haut avec fondu",
    icon: ArrowUp,
    category: "directional",
    css: { from: "opacity: 0; transform: translateY(30px)", to: "opacity: 1; transform: translateY(0)" },
  },
  {
    id: "slide-left",
    label: "Slide from Left",
    labelFr: "Glissement depuis la gauche",
    description: "Enter from the left side",
    descriptionFr: "Entrée depuis la gauche",
    icon: ArrowLeft,
    category: "directional",
    css: { from: "opacity: 0; transform: translateX(-30px)", to: "opacity: 1; transform: translateX(0)" },
  },
  {
    id: "slide-right",
    label: "Slide from Right",
    labelFr: "Glissement depuis la droite",
    description: "Enter from the right side",
    descriptionFr: "Entrée depuis la droite",
    icon: ArrowRight,
    category: "directional",
    css: { from: "opacity: 0; transform: translateX(30px)", to: "opacity: 1; transform: translateX(0)" },
  },
  {
    id: "scale-in",
    label: "Scale In",
    labelFr: "Zoom entrant",
    description: "Subtle scale with fade",
    descriptionFr: "Zoom subtil avec fondu",
    icon: Maximize2,
    category: "emphasis",
    css: { from: "opacity: 0; transform: scale(0.95)", to: "opacity: 1; transform: scale(1)" },
  },
  {
    id: "blur-in",
    label: "Blur In",
    labelFr: "Flou entrant",
    description: "Blur-to-clear transition",
    descriptionFr: "Transition de flou à net",
    icon: Sparkles,
    category: "emphasis",
    css: { from: "opacity: 0; filter: blur(4px)", to: "opacity: 1; filter: blur(0)" },
  },
] as const;

export type AnimationPresetId = typeof ANIMATION_PRESETS[number]["id"];

// ─── Animation Preview Box ───
function AnimationPreviewBox({ presetId, duration }: { presetId: string; duration: number }) {
  const [playing, setPlaying] = useState(false);
  const preset = ANIMATION_PRESETS.find(p => p.id === presetId);

  const handlePlay = () => {
    setPlaying(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setPlaying(true));
    });
  };

  if (!preset || presetId === "none") {
    return (
      <div className="w-full h-24 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-xs">
        No animation selected
      </div>
    );
  }

  const animationStyle: React.CSSProperties = playing
    ? { transition: `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`, opacity: 1, transform: "none", filter: "none" }
    : presetId === "fade-in"
      ? { opacity: 0 }
      : presetId === "slide-up"
        ? { opacity: 0, transform: "translateY(30px)" }
        : presetId === "slide-left"
          ? { opacity: 0, transform: "translateX(-30px)" }
          : presetId === "slide-right"
            ? { opacity: 0, transform: "translateX(30px)" }
            : presetId === "scale-in"
              ? { opacity: 0, transform: "scale(0.95)" }
              : presetId === "blur-in"
                ? { opacity: 0, filter: "blur(4px)" }
                : {};

  return (
    <div className="space-y-2">
      <div className="w-full h-24 rounded-lg border border-gray-200 bg-gradient-to-br from-indigo-50 to-white overflow-hidden flex items-center justify-center relative">
        <div
          style={animationStyle}
          className="w-3/4 h-16 rounded-md bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium shadow-sm"
        >
          {preset.label}
        </div>
      </div>
      <Button variant="outline" size="sm" className="w-full text-xs" onClick={handlePlay}>
        <Eye className="h-3 w-3 mr-1" /> Preview Animation
      </Button>
    </div>
  );
}

// ─── Main Panel Component ───
interface AnimationPresetsPanelProps {
  open: boolean;
  onClose: () => void;
  sectionId: number;
  sectionTitle: string;
  currentAnimation?: string;
  currentDelay?: number;
  currentDuration?: number;
  onAnimationChange: (animation: string, delay: number, duration: number) => void;
}

export default function AnimationPresetsPanel({
  open,
  onClose,
  sectionId,
  sectionTitle,
  currentAnimation = "none",
  currentDelay = 0,
  currentDuration = 600,
  onAnimationChange,
}: AnimationPresetsPanelProps) {
  const [selectedPreset, setSelectedPreset] = useState(currentAnimation);
  const [delay, setDelay] = useState(currentDelay);
  const [duration, setDuration] = useState(currentDuration);
  const [saving, setSaving] = useState(false);

  const updateSectionMut = trpc.cms.updateSection.useMutation();

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSectionMut.mutateAsync({
        id: sectionId,
        animation: selectedPreset,
        animationDelay: delay,
        animationDuration: duration,
      });
      onAnimationChange(selectedPreset, delay, duration);
      toast.success("Animation preset applied");
      onClose();
    } catch {
      toast.error("Failed to save animation");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setSaving(true);
    try {
      await updateSectionMut.mutateAsync({
        id: sectionId,
        animation: "none",
        animationDelay: 0,
        animationDuration: 600,
      });
      setSelectedPreset("none");
      setDelay(0);
      setDuration(600);
      onAnimationChange("none", 0, 600);
      toast.success("Animation removed");
      onClose();
    } catch {
      toast.error("Failed to remove animation");
    } finally {
      setSaving(false);
    }
  };

  const basicPresets = ANIMATION_PRESETS.filter(p => p.category === "basic");
  const directionalPresets = ANIMATION_PRESETS.filter(p => p.category === "directional");
  const emphasisPresets = ANIMATION_PRESETS.filter(p => p.category === "emphasis");

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg z-[200]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            Animation Preset
          </DialogTitle>
          <p className="text-xs text-gray-500 mt-1">
            Section: <span className="font-medium">{sectionTitle}</span>
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-5 pr-2">
            {/* Accessibility Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
              <strong>Accessibility:</strong> Animations automatically respect the user's{" "}
              <code className="bg-blue-100 px-1 rounded text-[10px]">prefers-reduced-motion</code>{" "}
              setting. Users who prefer reduced motion will see no animation.
            </div>

            {/* Preview */}
            <div>
              <Label className="text-xs font-medium text-gray-600 mb-2 block">Preview</Label>
              <AnimationPreviewBox presetId={selectedPreset} duration={duration} />
            </div>

            {/* Basic */}
            <div>
              <Label className="text-xs font-medium text-gray-600 mb-2 block">Basic</Label>
              <div className="grid grid-cols-2 gap-2">
                {basicPresets.map(preset => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                        selectedPreset === preset.id
                          ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-200"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-4 w-4 text-gray-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium">{preset.label}</p>
                        <p className="text-[10px] text-gray-400">{preset.labelFr}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Directional */}
            <div>
              <Label className="text-xs font-medium text-gray-600 mb-2 block">Directional</Label>
              <div className="grid grid-cols-2 gap-2">
                {directionalPresets.map(preset => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                        selectedPreset === preset.id
                          ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-200"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-4 w-4 text-gray-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium">{preset.label}</p>
                        <p className="text-[10px] text-gray-400">{preset.labelFr}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Emphasis */}
            <div>
              <Label className="text-xs font-medium text-gray-600 mb-2 block">Emphasis</Label>
              <div className="grid grid-cols-2 gap-2">
                {emphasisPresets.map(preset => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                        selectedPreset === preset.id
                          ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-200"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-4 w-4 text-gray-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium">{preset.label}</p>
                        <p className="text-[10px] text-gray-400">{preset.labelFr}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration & Delay Sliders */}
            {selectedPreset !== "none" && (
              <div className="space-y-4 pt-2 border-t border-gray-100">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs font-medium text-gray-600">Duration</Label>
                    <Badge variant="outline" className="text-[10px]">{duration}ms</Badge>
                  </div>
                  <Slider
                    value={[duration]}
                    onValueChange={([v]) => setDuration(v)}
                    min={200}
                    max={1500}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>Fast (200ms)</span>
                    <span>Slow (1500ms)</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs font-medium text-gray-600">Delay</Label>
                    <Badge variant="outline" className="text-[10px]">{delay}ms</Badge>
                  </div>
                  <Slider
                    value={[delay]}
                    onValueChange={([v]) => setDelay(v)}
                    min={0}
                    max={1000}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>Immediate (0ms)</span>
                    <span>Delayed (1000ms)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex gap-2 pt-3 border-t">
          {currentAnimation !== "none" && (
            <Button variant="outline" size="sm" onClick={handleRemove} disabled={saving} className="text-red-500 hover:text-red-600 hover:bg-red-50">
              <X className="h-3 w-3 mr-1" /> Remove
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
            {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
