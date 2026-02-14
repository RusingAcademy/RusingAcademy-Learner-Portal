/**
 * TemplateMarketplace — Section Template Marketplace for the Visual Editor
 * 
 * Replaces the simple "Add Block" list with a categorized, searchable marketplace.
 * Supports: bilingual FR/EN, brand-specific templates (RusingÂcademy, Lingueefy, Barholex),
 * saving existing sections as templates, and filtering by category/brand/language.
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Layout, Type, LayoutGrid, MessageSquare, Star, Image, Video, List,
  CreditCard, BarChart3, Users, Phone, Mail, Sparkles, Minus, Box,
  Search, Plus, BookOpen, Building2, Landmark, Package, Filter,
  Save, Trash2, Globe, Tag, Loader2,
} from "lucide-react";

// ─── Category Definitions ───
const CATEGORIES = [
  { value: "all", label: "All Templates", icon: LayoutGrid },
  { value: "hero", label: "Hero", icon: Layout },
  { value: "cta", label: "Call to Action", icon: Star },
  { value: "testimonials", label: "Testimonials", icon: MessageSquare },
  { value: "features", label: "Features", icon: LayoutGrid },
  { value: "course_promo", label: "Course Promo", icon: BookOpen },
  { value: "government_training", label: "Gov. Training", icon: Landmark },
  { value: "team", label: "Team", icon: Users },
  { value: "pricing", label: "Pricing", icon: CreditCard },
  { value: "faq", label: "FAQ", icon: List },
  { value: "newsletter", label: "Newsletter", icon: Mail },
  { value: "contact", label: "Contact", icon: Phone },
  { value: "content", label: "Content", icon: Type },
  { value: "gallery", label: "Gallery", icon: Image },
  { value: "stats", label: "Stats", icon: BarChart3 },
  { value: "divider", label: "Divider", icon: Minus },
  { value: "custom", label: "Custom", icon: Sparkles },
] as const;

const SECTION_TYPE_ICONS: Record<string, typeof Layout> = {
  hero: Layout,
  text_block: Type,
  features: LayoutGrid,
  testimonials: MessageSquare,
  cta: Star,
  image_gallery: Image,
  video: Video,
  faq: List,
  pricing_table: CreditCard,
  stats: BarChart3,
  team: Users,
  contact_form: Phone,
  newsletter: Mail,
  custom_html: Sparkles,
  divider: Minus,
  spacer: Box,
};

const SECTION_TYPE_COLORS: Record<string, string> = {
  hero: "bg-blue-500",
  text_block: "bg-gray-500",
  features: "bg-emerald-500",
  testimonials: "bg-violet-500",
  cta: "bg-amber-500",
  image_gallery: "bg-pink-500",
  video: "bg-red-500",
  faq: "bg-cyan-500",
  pricing_table: "bg-indigo-500",
  stats: "bg-teal-500",
  team: "bg-orange-500",
  contact_form: "bg-lime-500",
  newsletter: "bg-rose-500",
  custom_html: "bg-fuchsia-500",
  divider: "bg-stone-500",
  spacer: "bg-slate-500",
};

const BRAND_COLORS: Record<string, string> = {
  rusingacademy: "bg-blue-100 text-blue-700",
  lingueefy: "bg-teal-100 text-teal-700",
  barholex: "bg-amber-100 text-amber-700",
  universal: "bg-gray-100 text-gray-600",
};

const BRAND_LABELS: Record<string, string> = {
  rusingacademy: "RusingÂcademy",
  lingueefy: "Lingueefy",
  barholex: "Barholex",
  universal: "Universal",
};

const LANGUAGE_LABELS: Record<string, string> = {
  en: "EN",
  fr: "FR",
  bilingual: "EN|FR",
};

interface TemplateMarketplaceProps {
  pageId: number;
  sectionCount: number;
  onTemplateUsed: () => void;
  onAddBlankSection: (type: string) => void;
}

// ─── Quick Add Section Types (for blank sections) ───
const QUICK_ADD_TYPES = [
  { type: "hero", label: "Hero Banner", icon: Layout, color: "bg-blue-500" },
  { type: "text_block", label: "Text Block", icon: Type, color: "bg-gray-500" },
  { type: "features", label: "Features Grid", icon: LayoutGrid, color: "bg-emerald-500" },
  { type: "testimonials", label: "Testimonials", icon: MessageSquare, color: "bg-violet-500" },
  { type: "cta", label: "Call to Action", icon: Star, color: "bg-amber-500" },
  { type: "image_gallery", label: "Image Gallery", icon: Image, color: "bg-pink-500" },
  { type: "video", label: "Video Embed", icon: Video, color: "bg-red-500" },
  { type: "faq", label: "FAQ", icon: List, color: "bg-cyan-500" },
  { type: "pricing_table", label: "Pricing Table", icon: CreditCard, color: "bg-indigo-500" },
  { type: "stats", label: "Stats Counter", icon: BarChart3, color: "bg-teal-500" },
  { type: "team", label: "Team / Coaches", icon: Users, color: "bg-orange-500" },
  { type: "contact_form", label: "Contact Form", icon: Phone, color: "bg-lime-500" },
  { type: "newsletter", label: "Newsletter", icon: Mail, color: "bg-rose-500" },
  { type: "custom_html", label: "Custom HTML", icon: Sparkles, color: "bg-fuchsia-500" },
  { type: "divider", label: "Divider", icon: Minus, color: "bg-stone-500" },
  { type: "spacer", label: "Spacer", icon: Box, color: "bg-slate-500" },
];

export default function TemplateMarketplace({ pageId, sectionCount, onTemplateUsed, onAddBlankSection }: TemplateMarketplaceProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<"templates" | "blank">("templates");

  // Fetch templates
  const templatesQuery = trpc.templateMarketplace.list.useQuery(
    activeCategory === "all" ? undefined : { category: activeCategory as any },
    { staleTime: 30000 }
  );

  const useTemplateMut = trpc.templateMarketplace.useTemplate.useMutation({
    onSuccess: () => {
      toast.success("Template added to page");
      onTemplateUsed();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteTemplateMut = trpc.templateMarketplace.delete.useMutation({
    onSuccess: () => {
      toast.success("Template deleted");
      templatesQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  // Filter templates
  const filteredTemplates = useMemo(() => {
    if (!templatesQuery.data) return [];
    let filtered = templatesQuery.data;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q) ||
        (t.tags || "").toLowerCase().includes(q)
      );
    }

    if (brandFilter !== "all") {
      filtered = filtered.filter(t => t.brand === brandFilter || t.brand === "universal");
    }

    return filtered;
  }, [templatesQuery.data, searchQuery, brandFilter]);

  const handleUseTemplate = (templateId: number) => {
    useTemplateMut.mutate({
      templateId,
      pageId,
      sortOrder: sectionCount,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab Switcher */}
      <div className="flex border-b border-gray-200 bg-gray-50/50">
        <button
          onClick={() => setActiveTab("templates")}
          className={`flex-1 px-3 py-2 text-[11px] font-medium transition-colors ${
            activeTab === "templates"
              ? "text-indigo-700 border-b-2 border-indigo-600 bg-white"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Package className="h-3 w-3 inline mr-1" /> Templates
        </button>
        <button
          onClick={() => setActiveTab("blank")}
          className={`flex-1 px-3 py-2 text-[11px] font-medium transition-colors ${
            activeTab === "blank"
              ? "text-indigo-700 border-b-2 border-indigo-600 bg-white"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Plus className="h-3 w-3 inline mr-1" /> Blank Block
        </button>
      </div>

      {activeTab === "blank" ? (
        /* ─── Blank Section List (original Add Block) ─── */
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-1.5">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium px-1 mb-2">
              Click to add an empty section block
            </p>
            {QUICK_ADD_TYPES.map(st => (
              <button
                key={st.type}
                onClick={() => onAddBlankSection(st.type)}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-lg border border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-left"
              >
                <div className={`w-7 h-7 rounded flex items-center justify-center text-white shrink-0 ${st.color}`}>
                  <st.icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium">{st.label}</p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      ) : (
        /* ─── Template Marketplace ─── */
        <>
          {/* Search & Filters */}
          <div className="p-2 space-y-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 h-8 text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                  showFilters ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Filter className="h-3 w-3" /> Filters
              </button>
              {brandFilter !== "all" && (
                <Badge variant="secondary" className="text-[10px] py-0 h-5">
                  {BRAND_LABELS[brandFilter]}
                  <button onClick={() => setBrandFilter("all")} className="ml-1 hover:text-red-500">×</button>
                </Badge>
              )}
            </div>
            {showFilters && (
              <div className="space-y-1.5 pt-1">
                <Label className="text-[10px] text-gray-500">Brand</Label>
                <div className="flex flex-wrap gap-1">
                  {[
                    { value: "all", label: "All" },
                    { value: "rusingacademy", label: "RusingÂcademy" },
                    { value: "lingueefy", label: "Lingueefy" },
                    { value: "barholex", label: "Barholex" },
                  ].map(b => (
                    <button
                      key={b.value}
                      onClick={() => setBrandFilter(b.value)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                        brandFilter === b.value
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Category Pills */}
          <div className="px-2 py-1.5 border-b border-gray-100">
            <div className="flex flex-wrap gap-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                    activeCategory === cat.value
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Template Grid */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1.5">
              {templatesQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-xs text-gray-400 mb-1">No templates found</p>
                  <p className="text-[10px] text-gray-300">
                    {searchQuery ? "Try a different search" : "Templates will appear here once created"}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 text-[10px]"
                    onClick={() => setActiveTab("blank")}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Blank Block Instead
                  </Button>
                </div>
              ) : (
                filteredTemplates.map(template => {
                  const Icon = SECTION_TYPE_ICONS[template.sectionType] || Box;
                  const color = SECTION_TYPE_COLORS[template.sectionType] || "bg-gray-500";
                  return (
                    <div
                      key={template.id}
                      className="group relative rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all overflow-hidden"
                    >
                      {/* Template Card */}
                      <button
                        onClick={() => handleUseTemplate(template.id)}
                        disabled={useTemplateMut.isPending}
                        className="w-full text-left p-2.5"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`w-8 h-8 rounded flex items-center justify-center text-white shrink-0 ${color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium leading-tight truncate">{template.name}</p>
                            {template.description && (
                              <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{template.description}</p>
                            )}
                            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                              <Badge variant="outline" className="text-[9px] py-0 h-4 border-gray-200">
                                {template.sectionType.replace(/_/g, " ")}
                              </Badge>
                              {template.brand !== "universal" && (
                                <Badge className={`text-[9px] py-0 h-4 ${BRAND_COLORS[template.brand] || ""}`}>
                                  {BRAND_LABELS[template.brand]}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-[9px] py-0 h-4 border-gray-200">
                                <Globe className="h-2.5 w-2.5 mr-0.5" />
                                {LANGUAGE_LABELS[template.language] || template.language}
                              </Badge>
                              {template.isDefault && (
                                <Badge className="text-[9px] py-0 h-4 bg-amber-100 text-amber-700">Default</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Delete button (only for non-default) */}
                      {!template.isDefault && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete template "${template.name}"?`)) {
                              deleteTemplateMut.mutate({ id: template.id });
                            }
                          }}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
}

// ─── Save As Template Dialog ───
interface SaveAsTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  sectionId: number;
  sectionTitle: string;
  sectionType: string;
}

export function SaveAsTemplateDialog({ open, onClose, sectionId, sectionTitle, sectionType }: SaveAsTemplateDialogProps) {
  const [name, setName] = useState(sectionTitle || "");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("content");
  const [language, setLanguage] = useState<string>("bilingual");
  const [brand, setBrand] = useState<string>("universal");
  const [tags, setTags] = useState("");

  const saveMut = trpc.templateMarketplace.saveFromSection.useMutation({
    onSuccess: () => {
      toast.success("Section saved as template");
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Template name is required");
      return;
    }
    saveMut.mutate({
      sectionId,
      name: name.trim(),
      description: description.trim() || undefined,
      category: category as any,
      language: language as any,
      brand: brand as any,
      tags: tags.trim() || undefined,
    });
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md z-[200]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5 text-indigo-600" />
            Save as Template
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs">Template Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., RusingÂcademy Hero with CTA"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this template..."
              className="mt-1"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[300]">
                  {CATEGORIES.filter(c => c.value !== "all").map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[300]">
                  <SelectItem value="bilingual">Bilingual (EN|FR)</SelectItem>
                  <SelectItem value="en">English Only</SelectItem>
                  <SelectItem value="fr">French Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs">Brand</Label>
            <Select value={brand} onValueChange={setBrand}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[300]">
                <SelectItem value="universal">Universal (All Brands)</SelectItem>
                <SelectItem value="rusingacademy">RusingÂcademy</SelectItem>
                <SelectItem value="lingueefy">Lingueefy</SelectItem>
                <SelectItem value="barholex">Barholex Media</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Tags (comma-separated)</Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., hero, bilingual, SLE, government"
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saveMut.isPending}>
            {saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
