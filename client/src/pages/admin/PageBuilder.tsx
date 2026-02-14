import { useState, useCallback, useMemo, useRef } from "react";
import VisualEditor from "./VisualEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus, FileText, GripVertical, Trash2, Eye, EyeOff, Layout,
  Type, Image, List, MessageSquare, Star, Pencil,
  Navigation, Loader2, LayoutGrid, Copy, Monitor, Tablet,
  Smartphone, Globe, Users, History, Save, CreditCard, Video,
  Palette, Settings, ExternalLink, CheckCircle, AlertCircle,
  ChevronLeft, PanelLeftClose, PanelLeft, Mail, Minus, Box,
  Sparkles, BarChart3, UserCircle, Phone
} from "lucide-react";

type PageTab = "pages" | "editor" | "navigation" | "global-styles";
type ViewMode = "desktop" | "tablet" | "mobile";

const SECTION_TYPES = [
  { type: "hero", label: "Hero Banner", icon: Layout, desc: "Full-width hero with title, subtitle, CTA" },
  { type: "text_block", label: "Text Block", icon: Type, desc: "Rich text content section" },
  { type: "features", label: "Features Grid", icon: LayoutGrid, desc: "Feature cards in a grid layout" },
  { type: "testimonials", label: "Testimonials", icon: MessageSquare, desc: "Student/client testimonials" },
  { type: "cta", label: "Call to Action", icon: Star, desc: "Conversion-focused CTA section" },
  { type: "image_gallery", label: "Image Gallery", icon: Image, desc: "Image gallery or media showcase" },
  { type: "video", label: "Video Embed", icon: Video, desc: "YouTube, Vimeo, or Bunny Stream video" },
  { type: "faq", label: "FAQ", icon: List, desc: "Frequently asked questions accordion" },
  { type: "pricing_table", label: "Pricing Table", icon: CreditCard, desc: "Pricing plans comparison" },
  { type: "stats", label: "Stats Counter", icon: BarChart3, desc: "Key metrics and numbers" },
  { type: "team", label: "Team / Coaches", icon: Users, desc: "Team member cards" },
  { type: "contact_form", label: "Contact Form", icon: Phone, desc: "Contact form with fields" },
  { type: "newsletter", label: "Newsletter", icon: Mail, desc: "Email signup section" },
  { type: "custom_html", label: "Custom HTML", icon: Sparkles, desc: "Raw HTML/CSS block" },
  { type: "divider", label: "Divider", icon: Minus, desc: "Horizontal line separator" },
  { type: "spacer", label: "Spacer", icon: Box, desc: "Vertical spacing block" },
];

/* ─── Sortable Section Card ─── */
function SortableSectionCard({ section, idx, totalCount, isEditing, onEdit, onSave, onToggleVisibility, onDelete, editData, setEditData }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 50 : undefined };
  const typeInfo = SECTION_TYPES.find(s => s.type === section.sectionType);
  const Icon = typeInfo?.icon || Layout;

  return (
    <Card ref={setNodeRef} style={style} className={`group transition-all ${section.isVisible === false ? "opacity-50" : ""} ${isEditing ? "ring-2 ring-primary" : ""}`}>
      <CardContent className="p-0">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-muted/30">
          <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none p-1 -m-1 rounded hover:bg-muted">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
          <Icon className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium flex-1 truncate">{section.title || typeInfo?.label || section.sectionType}</span>
          <Badge variant="secondary" className="text-xs">{typeInfo?.label || section.sectionType}</Badge>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onEdit(section)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onToggleVisibility(section)}>
              {section.isVisible !== false ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => onDelete(section)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        {isEditing && (
          <div className="p-4 space-y-4 bg-muted/10">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-xs">Title</Label><Input value={editData.title} onChange={(e) => setEditData((d: any) => ({ ...d, title: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Subtitle</Label><Input value={editData.subtitle} onChange={(e) => setEditData((d: any) => ({ ...d, subtitle: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Content (JSON)</Label>
              <Textarea value={editData.content} onChange={(e) => setEditData((d: any) => ({ ...d, content: e.target.value }))} rows={6} className="font-mono text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Background Color</Label>
                <div className="flex gap-2">
                  <input type="color" value={editData.bgColor || "#ffffff"} onChange={(e) => setEditData((d: any) => ({ ...d, bgColor: e.target.value }))} className="w-8 h-8 rounded border cursor-pointer" />
                  <Input value={editData.bgColor} onChange={(e) => setEditData((d: any) => ({ ...d, bgColor: e.target.value }))} placeholder="#ffffff" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Text Color</Label>
                <div className="flex gap-2">
                  <input type="color" value={editData.textColor || "#000000"} onChange={(e) => setEditData((d: any) => ({ ...d, textColor: e.target.value }))} className="w-8 h-8 rounded border cursor-pointer" />
                  <Input value={editData.textColor} onChange={(e) => setEditData((d: any) => ({ ...d, textColor: e.target.value }))} placeholder="#000000" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Padding Top (px)</Label>
                <Input type="number" value={editData.paddingTop ?? 48} onChange={(e) => setEditData((d: any) => ({ ...d, paddingTop: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Padding Bottom (px)</Label>
                <Input type="number" value={editData.paddingBottom ?? 48} onChange={(e) => setEditData((d: any) => ({ ...d, paddingBottom: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={onSave}><Save className="h-3.5 w-3.5 mr-1" /> Save Section</Button>
              <Button size="sm" variant="outline" onClick={() => onEdit(null)}>Cancel</Button>
            </div>
          </div>
        )}
        {!isEditing && (
          <div className="p-4 min-h-[50px] cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => onEdit(section)}
            style={{ backgroundColor: section.backgroundColor || undefined, color: section.textColor || undefined }}>
            {section.title && <p className="text-sm font-medium">{section.title}</p>}
            {section.subtitle && <p className="text-xs opacity-70">{section.subtitle}</p>}
            <p className="text-xs text-muted-foreground mt-1 italic">Click to edit · Drag to reorder</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Live Preview Renderer ─── */
function LivePreviewSection({ section }: { section: any }) {
  const content = typeof section.content === "string"
    ? (() => { try { return JSON.parse(section.content); } catch { return {}; } })()
    : (section.content || {});
  const sectionStyle: React.CSSProperties = {
    backgroundColor: section.backgroundColor || "#ffffff",
    color: section.textColor || "#1a1a1a",
    paddingTop: `${section.paddingTop ?? 48}px`,
    paddingBottom: `${section.paddingBottom ?? 48}px`,
  };

  switch (section.sectionType) {
    case "hero":
      return (
        <div style={sectionStyle} className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{section.title || "Hero Title"}</h1>
          {section.subtitle && <p className="text-sm opacity-80 mb-4">{section.subtitle}</p>}
          {content.ctaText && <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm">{content.ctaText}</button>}
        </div>
      );
    case "text_block":
    case "text":
      return (
        <div style={sectionStyle} className="max-w-3xl mx-auto px-4">
          {section.title && <h2 className="text-xl font-bold mb-2">{section.title}</h2>}
          <div className="text-sm opacity-80" dangerouslySetInnerHTML={{ __html: content.html || content.text || section.subtitle || "Text content here..." }} />
        </div>
      );
    case "features":
      const features = content.items || content.features || [{ title: "Feature 1" }, { title: "Feature 2" }, { title: "Feature 3" }];
      return (
        <div style={sectionStyle} className="px-4">
          {section.title && <h2 className="text-xl font-bold text-center mb-4">{section.title}</h2>}
          <div className="grid grid-cols-3 gap-3">
            {features.slice(0, 6).map((f: any, i: number) => (
              <div key={i} className="p-3 border rounded text-center text-xs">
                <p className="font-semibold">{f.title || `Feature ${i + 1}`}</p>
                {f.description && <p className="opacity-60 mt-1">{f.description}</p>}
              </div>
            ))}
          </div>
        </div>
      );
    case "testimonials":
      const testimonials = content.items || content.testimonials || [{ name: "Student", quote: "Great experience!" }];
      return (
        <div style={sectionStyle} className="px-4">
          {section.title && <h2 className="text-xl font-bold text-center mb-4">{section.title}</h2>}
          <div className="grid grid-cols-2 gap-3">
            {testimonials.slice(0, 4).map((t: any, i: number) => (
              <div key={i} className="p-3 border rounded text-xs italic">
                <p className="mb-2">"{t.quote || t.text || "Testimonial"}"</p>
                <p className="font-semibold not-italic">— {t.name || "Anonymous"}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case "cta":
      return (
        <div style={sectionStyle} className="text-center px-4">
          {section.title && <h2 className="text-xl font-bold mb-2">{section.title}</h2>}
          {section.subtitle && <p className="text-sm opacity-80 mb-4">{section.subtitle}</p>}
          <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm">{content.primaryText || "Get Started"}</button>
        </div>
      );
    case "pricing_table":
    case "pricing":
      const plans = content.plans || content.items || [{ name: "Basic", price: "$29" }, { name: "Pro", price: "$79" }];
      return (
        <div style={sectionStyle} className="px-4">
          {section.title && <h2 className="text-xl font-bold text-center mb-4">{section.title}</h2>}
          <div className="grid grid-cols-3 gap-3">
            {plans.slice(0, 3).map((p: any, i: number) => (
              <div key={i} className={`p-3 border rounded text-center text-xs ${p.featured ? "border-blue-500 ring-1 ring-blue-200" : ""}`}>
                <p className="font-bold">{p.name}</p>
                <p className="text-lg font-bold my-1">{p.price || "$0"}</p>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs mt-2">Select</button>
              </div>
            ))}
          </div>
        </div>
      );
    case "faq":
      const faqs = content.items || content.faqs || [{ question: "Question?", answer: "Answer." }];
      return (
        <div style={sectionStyle} className="px-4 max-w-2xl mx-auto">
          {section.title && <h2 className="text-xl font-bold text-center mb-4">{section.title}</h2>}
          {faqs.slice(0, 5).map((f: any, i: number) => (
            <div key={i} className="border-b py-2 text-xs">
              <p className="font-semibold">{f.question || f.title || `Q${i + 1}`}</p>
              <p className="opacity-70 mt-1">{f.answer || f.content || ""}</p>
            </div>
          ))}
        </div>
      );
    case "stats":
      const stats = content.items || content.stats || [{ value: "500+", label: "Students" }, { value: "95%", label: "Success Rate" }];
      return (
        <div style={sectionStyle} className="px-4">
          {section.title && <h2 className="text-xl font-bold text-center mb-4">{section.title}</h2>}
          <div className="grid grid-cols-4 gap-3 text-center">
            {stats.slice(0, 4).map((s: any, i: number) => (
              <div key={i}><p className="text-2xl font-bold">{s.value}</p><p className="text-xs opacity-60">{s.label}</p></div>
            ))}
          </div>
        </div>
      );
    case "divider":
      return <div style={sectionStyle}><hr className="opacity-20 mx-4" /></div>;
    case "spacer":
      return <div style={{ height: content.height || "40px" }} />;
    default:
      return (
        <div style={sectionStyle} className="px-4 text-center text-xs opacity-50">
          [{SECTION_TYPES.find(s => s.type === section.sectionType)?.label || section.sectionType}]
          {section.title && <p className="font-medium">{section.title}</p>}
        </div>
      );
  }
}

/* ─── Main PageBuilder Component ─── */
export default function PageBuilder() {
  const [activeTab, setActiveTab] = useState<PageTab>("pages");
  const [editingPageId, setEditingPageId] = useState<number | null>(null);
  const [visualEditorPageId, setVisualEditorPageId] = useState<number | null>(null);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");
  const [newPageType, setNewPageType] = useState<string>("landing");
  const [newPageDesc, setNewPageDesc] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newMenuName, setNewMenuName] = useState("");
  const [newMenuLocation, setNewMenuLocation] = useState("header");
  const [showMenuDialog, setShowMenuDialog] = useState(false);
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null);
  const [newItemLabel, setNewItemLabel] = useState("");
  const [newItemUrl, setNewItemUrl] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [showPreview, setShowPreview] = useState(false);
  const [previewRole, setPreviewRole] = useState<"public" | "learner" | "coach" | "hr" | "admin">("public");
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [sectionEditData, setSectionEditData] = useState<any>({ title: "", subtitle: "", content: "", bgColor: "", textColor: "", paddingTop: 48, paddingBottom: 48 });
  const [showVersions, setShowVersions] = useState(false);
  const [versionNote, setVersionNote] = useState("");
  const [showSaveVersionDialog, setShowSaveVersionDialog] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showLivePreview, setShowLivePreview] = useState(true);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Queries
  const pagesQuery = trpc.cms.listPages.useQuery();
  const pageQuery = trpc.cms.getPage.useQuery({ id: editingPageId! }, { enabled: !!editingPageId });
  const menusQuery = trpc.cms.listMenus.useQuery();
  const menuItemsQuery = trpc.cms.getMenuItems.useQuery({ menuId: selectedMenuId! }, { enabled: !!selectedMenuId });
  const globalStylesQuery = trpc.cms.getGlobalStyles.useQuery();
  const versionsQuery = trpc.cms.listVersions.useQuery({ pageId: editingPageId! }, { enabled: !!editingPageId && showVersions });

  // Mutations
  const createPageMut = trpc.cms.createPage.useMutation({ onSuccess: () => { pagesQuery.refetch(); setShowCreateDialog(false); setNewPageTitle(""); setNewPageSlug(""); setNewPageDesc(""); toast.success("Page created"); } });
  const updatePageMut = trpc.cms.updatePage.useMutation({ onSuccess: () => { pageQuery.refetch(); pagesQuery.refetch(); toast.success("Page updated"); } });
  const deletePageMut = trpc.cms.deletePage.useMutation({ onSuccess: () => { pagesQuery.refetch(); setEditingPageId(null); setActiveTab("pages"); toast.success("Page deleted"); } });
  const addSectionMut = trpc.cms.addSection.useMutation({ onSuccess: () => { pageQuery.refetch(); toast.success("Section added"); } });
  const updateSectionMut = trpc.cms.updateSection.useMutation({ onSuccess: () => { pageQuery.refetch(); toast.success("Section updated"); } });
  const deleteSectionMut = trpc.cms.deleteSection.useMutation({ onSuccess: () => { pageQuery.refetch(); toast.success("Section removed"); } });
  const reorderMut = trpc.cms.reorderSections.useMutation({ onSuccess: () => pageQuery.refetch() });
  const publishPageMut = trpc.cms.publishPage.useMutation({ onSuccess: () => { pageQuery.refetch(); pagesQuery.refetch(); toast.success("Page published!"); } });
  const unpublishPageMut = trpc.cms.unpublishPage.useMutation({ onSuccess: () => { pageQuery.refetch(); pagesQuery.refetch(); toast.success("Page unpublished"); } });
  const createMenuMut = trpc.cms.createMenu.useMutation({ onSuccess: () => { menusQuery.refetch(); setShowMenuDialog(false); toast.success("Menu created"); } });
  const addMenuItemMut = trpc.cms.addMenuItem.useMutation({ onSuccess: () => { menuItemsQuery.refetch(); toast.success("Item added"); } });
  const deleteMenuItemMut = trpc.cms.deleteMenuItem.useMutation({ onSuccess: () => { menuItemsQuery.refetch(); toast.success("Item removed"); } });
  const setGlobalStylesMut = trpc.cms.setGlobalStyles.useMutation({ onSuccess: () => { globalStylesQuery.refetch(); toast.success("Global styles saved"); } });
  const saveVersionMut = trpc.cms.saveVersion.useMutation({
    onSuccess: (data) => { toast.success(`Version ${data.versionNumber} saved`); versionsQuery.refetch(); setShowSaveVersionDialog(false); setVersionNote(""); },
    onError: (e: any) => toast.error(e.message),
  });
  const restoreVersionMut = trpc.cms.restoreVersion.useMutation({
    onSuccess: (data) => { toast.success(`Restored to version ${data.restoredVersion}`); pageQuery.refetch(); pagesQuery.refetch(); setShowVersions(false); },
    onError: (e: any) => toast.error(e.message),
  });

  // Handlers
  const handleCreatePage = () => {
    if (!newPageTitle.trim()) { toast.error("Title is required"); return; }
    const slug = newPageSlug.trim() || newPageTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    createPageMut.mutate({ title: newPageTitle, slug, description: newPageDesc, pageType: newPageType as any });
  };

  const handleDuplicatePage = (page: any) => {
    createPageMut.mutate({ title: `${page.title} (Copy)`, slug: `${page.slug}-copy-${Date.now()}`, description: page.description || "", pageType: page.pageType as any });
  };

  const openEditor = (pageId: number) => { setEditingPageId(pageId); setActiveTab("editor"); };

  const openSectionEditor = (section: any) => {
    if (!section) { setEditingSectionId(null); return; }
    setEditingSectionId(section.id);
    setSectionEditData({
      title: section.title || "",
      subtitle: section.subtitle || "",
      content: typeof section.content === "string" ? section.content : JSON.stringify(section.content || {}, null, 2),
      bgColor: section.backgroundColor || "",
      textColor: section.textColor || "",
      paddingTop: section.paddingTop ?? 48,
      paddingBottom: section.paddingBottom ?? 48,
    });
  };

  const saveSectionEdit = () => {
    if (!editingSectionId) return;
    let parsedContent: any = sectionEditData.content;
    try { parsedContent = JSON.parse(sectionEditData.content); } catch { /* keep as string */ }
    updateSectionMut.mutate({
      id: editingSectionId,
      title: sectionEditData.title,
      subtitle: sectionEditData.subtitle,
      content: parsedContent,
      backgroundColor: sectionEditData.bgColor || undefined,
      textColor: sectionEditData.textColor || undefined,
    });
    setEditingSectionId(null);
  };

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !pageQuery.data) return;
    const sections = [...((pageQuery.data as any).sections || [])];
    const oldIndex = sections.findIndex((s: any) => s.id === active.id);
    const newIndex = sections.findIndex((s: any) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newOrder = arrayMove(sections, oldIndex, newIndex);
    reorderMut.mutate({ pageId: editingPageId!, sectionIds: newOrder.map((s: any) => s.id) });
  }, [pageQuery.data, editingPageId, reorderMut]);

  const previewWidth = viewMode === "desktop" ? "100%" : viewMode === "tablet" ? "768px" : "375px";

  // ─── Pages List ───
  const renderPagesList = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Website Pages</h1>
          <p className="text-sm text-muted-foreground">Create and manage landing pages, sales pages, and custom content pages.</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}><Plus className="h-4 w-4 mr-2" /> New Page</Button>
      </div>

      {pagesQuery.isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center"><Loader2 className="h-5 w-5 animate-spin" /> Loading pages...</div>
      ) : (pagesQuery.data as any[] || []).length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="mb-4">No pages yet. Create your first page to get started.</p>
          <Button onClick={() => setShowCreateDialog(true)}><Plus className="h-4 w-4 mr-2" /> Create Page</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {(pagesQuery.data as any[]).map((page: any) => (
            <Card key={page.id} className="hover:shadow-md transition-shadow group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0 flex-1 cursor-pointer" onClick={() => openEditor(page.id)}>
                    <div className="p-2 rounded-lg bg-primary/10"><FileText className="h-5 w-5 text-primary" /></div>
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{page.title}</h3>
                      <p className="text-xs text-muted-foreground">/p/{page.slug} · {page.pageType}</p>
                    </div>
                    <Badge variant={page.status === "published" ? "default" : page.status === "archived" ? "secondary" : "outline"}>
                      {page.status === "published" ? <><CheckCircle className="h-3 w-3 mr-1" /> Published</> : page.status || "draft"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 px-2 gap-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" title="Open Visual Editor" onClick={(e) => { e.stopPropagation(); setVisualEditorPageId(page.id); }}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Preview" onClick={(e) => { e.stopPropagation(); window.open(`/p/${page.slug}`, "_blank"); }}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Duplicate" onClick={(e) => { e.stopPropagation(); handleDuplicatePage(page); }}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" title="Delete" onClick={(e) => { e.stopPropagation(); if (confirm("Delete this page?")) deletePageMut.mutate({ id: page.id }); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Page Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Page</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Page Title</Label><Input value={newPageTitle} onChange={(e) => { setNewPageTitle(e.target.value); setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")); }} placeholder="e.g. SLE Exam Prep Landing Page" /></div>
            <div className="space-y-1.5"><Label>URL Slug</Label><div className="flex items-center gap-1"><span className="text-sm text-muted-foreground">/p/</span><Input value={newPageSlug} onChange={(e) => setNewPageSlug(e.target.value)} placeholder="auto-generated" /></div></div>
            <div className="space-y-1.5">
              <Label>Page Type</Label>
              <Select value={newPageType} onValueChange={setNewPageType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="landing">Landing Page</SelectItem>
                  <SelectItem value="sales">Sales Page</SelectItem>
                  <SelectItem value="content">Content Page</SelectItem>
                  <SelectItem value="legal">Legal Page</SelectItem>
                  <SelectItem value="custom">Custom Page</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Description (optional)</Label><Textarea value={newPageDesc} onChange={(e) => setNewPageDesc(e.target.value)} placeholder="Brief description..." rows={2} /></div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleCreatePage} disabled={createPageMut.isPending}>
              {createPageMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />} Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  // ─── Editor with DnD + Live Preview ───
  const renderEditor = () => {
    const page = pageQuery.data as any;
    if (!page) return <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center"><Loader2 className="h-5 w-5 animate-spin" /> Loading page...</div>;
    const sections = (page.sections || []) as any[];
    const sectionIds = useMemo(() => sections.map((s: any) => s.id), [sections]);

    return (
      <div className="space-y-4">
        {/* Editor Toolbar */}
        <div className="flex items-center justify-between bg-muted/30 rounded-lg px-4 py-2.5 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => { setEditingPageId(null); setActiveTab("pages"); }}>
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Back
            </Button>
            <div><h2 className="text-base font-bold">{page.title}</h2><p className="text-xs text-muted-foreground">/p/{page.slug}</p></div>
            <Badge variant={page.status === "published" ? "default" : "outline"}>
              {page.status === "published" ? <><CheckCircle className="h-3 w-3 mr-1" /> Published</> : <><AlertCircle className="h-3 w-3 mr-1" /> Draft</>}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {/* Responsive Preview Toggle */}
            <div className="flex items-center border rounded-lg p-0.5 gap-0.5 bg-background">
              <Button variant={viewMode === "desktop" ? "secondary" : "ghost"} size="sm" className="h-7 px-2" onClick={() => setViewMode("desktop")}><Monitor className="h-3.5 w-3.5" /></Button>
              <Button variant={viewMode === "tablet" ? "secondary" : "ghost"} size="sm" className="h-7 px-2" onClick={() => setViewMode("tablet")}><Tablet className="h-3.5 w-3.5" /></Button>
              <Button variant={viewMode === "mobile" ? "secondary" : "ghost"} size="sm" className="h-7 px-2" onClick={() => setViewMode("mobile")}><Smartphone className="h-3.5 w-3.5" /></Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowLivePreview(!showLivePreview)}>
              <Eye className="h-3.5 w-3.5 mr-1" /> {showLivePreview ? "Hide" : "Show"} Preview
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setShowPreview(true); }}>
              <Users className="h-3.5 w-3.5 mr-1" /> Preview As
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowVersions(true)}>
              <History className="h-3.5 w-3.5 mr-1" /> Versions
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open(`/p/${page.slug}`, "_blank")}>
              <ExternalLink className="h-3.5 w-3.5 mr-1" /> View Live
            </Button>
            {page.status === "published" ? (
              <Button variant="outline" size="sm" onClick={() => unpublishPageMut.mutate({ id: page.id })} disabled={unpublishPageMut.isPending}>
                <EyeOff className="h-3.5 w-3.5 mr-1" /> Unpublish
              </Button>
            ) : (
              <Button size="sm" onClick={() => { saveVersionMut.mutate({ pageId: page.id, note: "Auto-save before publish" }); publishPageMut.mutate({ id: page.id }); }} disabled={publishPageMut.isPending}>
                <Globe className="h-3.5 w-3.5 mr-1" /> Publish
              </Button>
            )}
          </div>
        </div>

        <div className={`grid gap-6 ${showLivePreview ? "grid-cols-2" : "grid-cols-1"}`}>
          {/* Left: Section Editor with DnD */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Sections ({sections.length})</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowSidebar(!showSidebar)}>
                {showSidebar ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
              </Button>
            </div>

            {/* Add Section Palette */}
            {showSidebar && (
              <div className="grid grid-cols-2 gap-2 p-3 bg-muted/20 rounded-lg border border-dashed">
                {SECTION_TYPES.map((st) => (
                  <button key={st.type} onClick={() => addSectionMut.mutate({ pageId: page.id, sectionType: st.type, title: st.label, sortOrder: sections.length })}
                    className="flex items-center gap-2 p-2 rounded-md border border-dashed hover:border-primary hover:bg-primary/5 transition-colors text-left text-xs">
                    <st.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="font-medium truncate">{st.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Sortable Sections */}
            {sections.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                <Layout className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>No sections yet. Click a section type above to add one.</p>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {sections.map((section: any, idx: number) => (
                      <SortableSectionCard
                        key={section.id}
                        section={section}
                        idx={idx}
                        totalCount={sections.length}
                        isEditing={editingSectionId === section.id}
                        onEdit={openSectionEditor}
                        onSave={saveSectionEdit}
                        onToggleVisibility={(s: any) => updateSectionMut.mutate({ id: s.id, isVisible: s.isVisible === false ? true : false })}
                        onDelete={(s: any) => { if (confirm("Remove this section?")) deleteSectionMut.mutate({ id: s.id }); }}
                        editData={sectionEditData}
                        setEditData={setSectionEditData}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {/* Page SEO & Settings */}
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Settings className="h-4 w-4" /> Page SEO & Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label className="text-sm">Meta Title</Label><Input defaultValue={page.metaTitle || ""} placeholder="SEO title..." onBlur={(e) => updatePageMut.mutate({ id: page.id, metaTitle: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label className="text-sm">Meta Description</Label><Input defaultValue={page.metaDescription || ""} placeholder="SEO description..." onBlur={(e) => updatePageMut.mutate({ id: page.id, metaDescription: e.target.value })} /></div>
                </div>
                <div className="space-y-1.5"><Label className="text-sm">OG Image URL</Label><Input defaultValue={page.ogImage || ""} placeholder="https://..." onBlur={(e) => updatePageMut.mutate({ id: page.id, ogImage: e.target.value })} /></div>
                <div className="space-y-1.5"><Label className="text-sm">Custom CSS</Label><Textarea defaultValue={page.customCss || ""} placeholder="/* Custom styles */" rows={3} className="font-mono text-xs" onBlur={(e) => updatePageMut.mutate({ id: page.id, customCss: e.target.value })} /></div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2"><Label className="text-sm">Show Header</Label><Switch defaultChecked={page.showHeader !== false} onCheckedChange={(v) => updatePageMut.mutate({ id: page.id, showHeader: v })} /></div>
                  <div className="flex items-center gap-2"><Label className="text-sm">Show Footer</Label><Switch defaultChecked={page.showFooter !== false} onCheckedChange={(v) => updatePageMut.mutate({ id: page.id, showFooter: v })} /></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Live WYSIWYG Preview */}
          {showLivePreview && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Live Preview</h3>
              <div className="border rounded-lg overflow-auto bg-white shadow-inner mx-auto" style={{ maxWidth: previewWidth, maxHeight: "calc(100vh - 200px)" }}>
                {sections.filter((s: any) => s.isVisible !== false).length === 0 ? (
                  <div className="p-16 text-center text-gray-400 text-sm">No visible sections to preview</div>
                ) : (
                  sections.filter((s: any) => s.isVisible !== false).map((section: any) => (
                    <LivePreviewSection key={section.id} section={section} />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── Navigation Builder ───
  const renderNavigation = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Navigation Builder</h1><p className="text-sm text-muted-foreground">Manage header, footer, and sidebar navigation menus.</p></div>
        <Dialog open={showMenuDialog} onOpenChange={setShowMenuDialog}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> New Menu</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Navigation Menu</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5"><Label>Menu Name</Label><Input value={newMenuName} onChange={(e) => setNewMenuName(e.target.value)} placeholder="e.g. Main Navigation" /></div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Select value={newMenuLocation} onValueChange={setNewMenuLocation}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="header">Header</SelectItem>
                    <SelectItem value="footer">Footer</SelectItem>
                    <SelectItem value="sidebar">Sidebar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button onClick={() => { if (newMenuName.trim()) createMenuMut.mutate({ name: newMenuName, location: newMenuLocation }); }}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Menus</h3>
          {(menusQuery.data as any[] || []).map((menu: any) => (
            <button key={menu.id} onClick={() => setSelectedMenuId(menu.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left text-sm transition-colors ${selectedMenuId === menu.id ? "border-primary bg-primary/5" : "hover:bg-muted"}`}>
              <Navigation className="h-4 w-4 text-muted-foreground" />
              <div><p className="font-medium">{menu.name}</p><p className="text-xs text-muted-foreground">{menu.location}</p></div>
            </button>
          ))}
          {(menusQuery.data as any[] || []).length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No menus yet.</p>}
        </div>

        <div className="col-span-2">
          {selectedMenuId ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Menu Items</h3>
              {(menuItemsQuery.data as any[] || []).map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg group">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1"><p className="font-medium text-sm">{item.label}</p><p className="text-xs text-muted-foreground">{item.url}</p></div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100" onClick={() => deleteMenuItemMut.mutate({ id: item.id })}><Trash2 className="h-3 w-3" /></Button>
                </div>
              ))}
              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1"><Label className="text-xs">Label</Label><Input value={newItemLabel} onChange={(e) => setNewItemLabel(e.target.value)} placeholder="Home" className="h-9" /></div>
                <div className="flex-1 space-y-1"><Label className="text-xs">URL</Label><Input value={newItemUrl} onChange={(e) => setNewItemUrl(e.target.value)} placeholder="/" className="h-9" /></div>
                <Button size="sm" onClick={() => { if (newItemLabel && newItemUrl) { addMenuItemMut.mutate({ menuId: selectedMenuId, label: newItemLabel, url: newItemUrl, sortOrder: (menuItemsQuery.data as any[] || []).length }); setNewItemLabel(""); setNewItemUrl(""); } }}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              <Navigation className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>Select a menu to manage its items, or create a new menu.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ─── Global Styles ───
  const [localStyles, setLocalStyles] = useState<any>(null);
  const styles = localStyles || globalStylesQuery.data || {};
  const updateStyle = (key: string, value: string) => setLocalStyles((prev: any) => ({ ...(prev || globalStylesQuery.data || {}), [key]: value }));

  const renderGlobalStyles = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Global Styling</h1><p className="text-sm text-muted-foreground">Control typography, colors, spacing, and layout across all CMS pages.</p></div>
        <Button onClick={() => setGlobalStylesMut.mutate(styles)} disabled={setGlobalStylesMut.isPending}>
          {setGlobalStylesMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save Styles
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Colors</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "primaryColor", label: "Primary Color", default: "#2563eb" },
              { key: "secondaryColor", label: "Secondary Color", default: "#7c3aed" },
              { key: "accentColor", label: "Accent Color", default: "#f59e0b" },
            ].map(({ key, label, default: def }) => (
              <div key={key} className="flex items-center gap-3">
                <input type="color" value={styles[key] || def} onChange={(e) => updateStyle(key, e.target.value)} className="w-10 h-10 rounded border cursor-pointer" />
                <div className="flex-1">
                  <Label className="text-sm">{label}</Label>
                  <Input value={styles[key] || def} onChange={(e) => updateStyle(key, e.target.value)} className="h-8 text-xs" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Typography</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm">Body Font</Label>
              <Select value={styles.fontFamily || "Inter"} onValueChange={(v) => updateStyle("fontFamily", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Poppins">Poppins</SelectItem>
                  <SelectItem value="DM Sans">DM Sans</SelectItem>
                  <SelectItem value="Nunito">Nunito</SelectItem>
                  <SelectItem value="Lato">Lato</SelectItem>
                  <SelectItem value="Open Sans">Open Sans</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Heading Font</Label>
              <Select value={styles.headingFont || "Inter"} onValueChange={(v) => updateStyle("headingFont", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Poppins">Poppins</SelectItem>
                  <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                  <SelectItem value="Montserrat">Montserrat</SelectItem>
                  <SelectItem value="DM Serif Display">DM Serif Display</SelectItem>
                  <SelectItem value="Merriweather">Merriweather</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Base Font Size</Label>
              <Select value={styles.fontSize || "16px"} onValueChange={(v) => updateStyle("fontSize", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="14px">14px (Small)</SelectItem>
                  <SelectItem value="16px">16px (Default)</SelectItem>
                  <SelectItem value="18px">18px (Large)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Layout</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm">Border Radius</Label>
              <Select value={styles.borderRadius || "8px"} onValueChange={(v) => updateStyle("borderRadius", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0px">None (0px)</SelectItem>
                  <SelectItem value="4px">Subtle (4px)</SelectItem>
                  <SelectItem value="8px">Default (8px)</SelectItem>
                  <SelectItem value="12px">Rounded (12px)</SelectItem>
                  <SelectItem value="16px">Pill (16px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Section Spacing</Label>
              <Select value={styles.spacing || "48px"} onValueChange={(v) => updateStyle("spacing", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="24px">Compact (24px)</SelectItem>
                  <SelectItem value="48px">Default (48px)</SelectItem>
                  <SelectItem value="64px">Spacious (64px)</SelectItem>
                  <SelectItem value="96px">Extra (96px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Max Content Width</Label>
              <Select value={styles.maxWidth || "1200px"} onValueChange={(v) => updateStyle("maxWidth", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="960px">Narrow (960px)</SelectItem>
                  <SelectItem value="1200px">Default (1200px)</SelectItem>
                  <SelectItem value="1440px">Wide (1440px)</SelectItem>
                  <SelectItem value="100%">Full Width</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="p-6 border rounded-lg" style={{ fontFamily: styles.fontFamily || "Inter", fontSize: styles.fontSize || "16px", borderRadius: styles.borderRadius || "8px" }}>
              <h2 style={{ fontFamily: styles.headingFont || "Inter", color: styles.primaryColor || "#2563eb" }} className="text-2xl font-bold mb-2">Heading Preview</h2>
              <p className="mb-4 opacity-70">This is how your body text will look with the selected typography and spacing settings.</p>
              <div className="flex gap-2">
                <button style={{ backgroundColor: styles.primaryColor || "#2563eb", borderRadius: styles.borderRadius || "8px" }} className="px-4 py-2 text-white text-sm">Primary Button</button>
                <button style={{ borderColor: styles.secondaryColor || "#7c3aed", color: styles.secondaryColor || "#7c3aed", borderRadius: styles.borderRadius || "8px" }} className="px-4 py-2 border text-sm">Secondary</button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // If visual editor is open, render it as a full-screen overlay
  if (visualEditorPageId) {
    return (
      <VisualEditor
        pageId={visualEditorPageId}
        onBack={() => setVisualEditorPageId(null)}
      />
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 border-b">
        {([
          { key: "pages" as PageTab, label: "Pages", icon: FileText },
          { key: "editor" as PageTab, label: "Editor", icon: Pencil },
          { key: "navigation" as PageTab, label: "Navigation", icon: Navigation },
          { key: "global-styles" as PageTab, label: "Global Styles", icon: Palette },
        ]).map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <tab.icon className="h-4 w-4" /> {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "pages" && renderPagesList()}
      {activeTab === "editor" && (editingPageId ? renderEditor() : <div className="text-center py-12 text-muted-foreground"><p>Select a page to edit, or create a new one.</p><Button variant="outline" className="mt-3" onClick={() => setActiveTab("pages")}>Go to Pages</Button></div>)}
      {activeTab === "navigation" && renderNavigation()}
      {activeTab === "global-styles" && renderGlobalStyles()}

      {/* Preview As Dialog — 5 roles */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              Preview As
              <div className="flex items-center gap-1 border rounded-lg p-0.5 ml-2">
                {(["public", "learner", "coach", "hr", "admin"] as const).map((role) => (
                  <Button key={role} variant={previewRole === role ? "secondary" : "ghost"} size="sm" className="h-7 px-2 text-xs capitalize" onClick={() => setPreviewRole(role)}>
                    {role === "public" ? <Globe className="h-3 w-3 mr-1" /> : role === "learner" ? <UserCircle className="h-3 w-3 mr-1" /> : role === "coach" ? <Users className="h-3 w-3 mr-1" /> : role === "hr" ? <BarChart3 className="h-3 w-3 mr-1" /> : <Settings className="h-3 w-3 mr-1" />}
                    {role}
                  </Button>
                ))}
              </div>
              <div className="flex items-center border rounded-lg p-0.5 gap-0.5 ml-2">
                <Button variant={viewMode === "desktop" ? "secondary" : "ghost"} size="sm" className="h-6 px-1.5" onClick={() => setViewMode("desktop")}><Monitor className="h-3 w-3" /></Button>
                <Button variant={viewMode === "tablet" ? "secondary" : "ghost"} size="sm" className="h-6 px-1.5" onClick={() => setViewMode("tablet")}><Tablet className="h-3 w-3" /></Button>
                <Button variant={viewMode === "mobile" ? "secondary" : "ghost"} size="sm" className="h-6 px-1.5" onClick={() => setViewMode("mobile")}><Smartphone className="h-3 w-3" /></Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg overflow-auto max-h-[70vh] bg-white mx-auto" style={{ maxWidth: previewWidth }}>
            <div className="bg-blue-50 px-4 py-2 border-b text-xs text-blue-700 flex items-center gap-2">
              <Eye className="h-3 w-3" />
              Viewing as: <strong className="capitalize">{previewRole}</strong>
              {previewRole !== "public" && " — Some content may be restricted based on role"}
            </div>
            {((pageQuery.data as any)?.sections || []).filter((s: any) => s.isVisible !== false).map((section: any) => (
              <LivePreviewSection key={section.id} section={section} />
            ))}
            {((pageQuery.data as any)?.sections || []).filter((s: any) => s.isVisible !== false).length === 0 && (
              <div className="p-16 text-center text-gray-400">No visible sections to preview</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Versions Dialog */}
      <Dialog open={showVersions} onOpenChange={setShowVersions}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><History className="h-4 w-4" /> Page Versions</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="p-1.5 bg-primary/10 rounded"><FileText className="h-4 w-4 text-primary" /></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Current Version</p>
                <p className="text-xs text-muted-foreground">Status: {(pageQuery.data as any)?.status || "draft"}</p>
              </div>
              <Badge>Active</Badge>
            </div>
            <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setShowSaveVersionDialog(true)}>
              <Save className="h-3.5 w-3.5" /> Save Current as Version
            </Button>
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {versionsQuery.isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground py-4 justify-center"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>
              ) : (versionsQuery.data as any[] || []).length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No saved versions yet.</p>
              ) : (
                (versionsQuery.data as any[]).map((v: any) => (
                  <div key={v.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="p-1.5 bg-muted rounded"><History className="h-3.5 w-3.5 text-muted-foreground" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">v{v.versionNumber}: {v.title}</p>
                      {v.note && <p className="text-xs text-muted-foreground truncate">{v.note}</p>}
                      <p className="text-xs text-muted-foreground">{v.createdAt ? new Date(v.createdAt).toLocaleString() : "—"}</p>
                    </div>
                    <Button variant="outline" size="sm" className="h-7 text-xs shrink-0"
                      onClick={() => { if (confirm(`Restore to version ${v.versionNumber}?`)) restoreVersionMut.mutate({ versionId: v.id }); }}
                      disabled={restoreVersionMut.isPending}>
                      Restore
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Close</Button></DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Version Dialog */}
      <Dialog open={showSaveVersionDialog} onOpenChange={setShowSaveVersionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Save Version Snapshot</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Create a snapshot of the current page state. You can restore to this version later.</p>
            <div className="space-y-1.5">
              <Label>Version Note (optional)</Label>
              <Input value={versionNote} onChange={(e) => setVersionNote(e.target.value)} placeholder="e.g., Before redesign, Final version..." />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={() => editingPageId && saveVersionMut.mutate({ pageId: editingPageId, note: versionNote || undefined })} disabled={saveVersionMut.isPending}>
              {saveVersionMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
