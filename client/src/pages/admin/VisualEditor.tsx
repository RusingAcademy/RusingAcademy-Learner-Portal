/**
 * VisualEditor — Kajabi-like Visual Website Editor
 * 
 * Full-screen page editor integrated into Preview Mode with:
 * - Click-to-select any section in the live preview
 * - Floating editor panel with context-aware fields
 * - Drag-and-drop section reordering
 * - Section templates library for quick page building
 * - Responsive preview (desktop/tablet/mobile)
 * - Save Draft / Publish / Revert workflow
 * - Bilingual support (EN | FR)
 * - Media library integration
 */
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/RichTextEditor";
import MediaLibraryPicker from "@/components/MediaLibraryPicker";
import CrossPageCopyModal from "@/components/CrossPageCopyModal";
import StylePresetsPanel from "@/components/StylePresetsPanel";
import RevisionHistoryPanel from "@/components/RevisionHistoryPanel";
import SeoEditorPanel from "@/components/SeoEditorPanel";
import TemplateMarketplace, { SaveAsTemplateDialog } from "@/components/TemplateMarketplace";
import AnimationPresetsPanel from "@/components/AnimationPresetsPanel";
import { useUndoRedo, useUndoRedoKeyboard } from "@/hooks/useUndoRedo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  ArrowLeft, Monitor, Tablet, Smartphone, Eye, EyeOff, Save, Upload,
  Plus, Trash2, Copy, GripVertical, ChevronDown, ChevronUp, Settings,
  Layout, Type, Image, Video, Star, MessageSquare, List, CreditCard,
  BarChart3, Users, Phone, Mail, Sparkles, Minus, Box, FileText,
  Loader2, CheckCircle, AlertCircle, History, Undo2, Redo2 as Redo2Icon, Globe, Palette,
  AlignLeft, AlignCenter, AlignRight, Maximize2, X, PanelRightOpen,
  PanelRightClose, LayoutGrid, Layers, Pencil, MousePointer, ImagePlus,
  ArrowRight, RotateCcw, Search,
} from "lucide-react";

// ─── Types ───
type DeviceMode = "desktop" | "tablet" | "mobile";

interface SectionData {
  id: number;
  pageId: number;
  sectionType: string;
  title: string | null;
  subtitle: string | null;
  content: any;
  backgroundColor: string | null;
  textColor: string | null;
  paddingTop: number;
  paddingBottom: number;
  sortOrder: number;
  isVisible: boolean | number;
  animation?: string;
  animationDelay?: number;
  animationDuration?: number;
}

// ─── Section Type Definitions ───
const SECTION_TYPES = [
  { type: "hero", label: "Hero Banner", icon: Layout, desc: "Full-width hero with title, subtitle, CTA", color: "bg-blue-500" },
  { type: "text_block", label: "Text Block", icon: Type, desc: "Rich text content section", color: "bg-gray-500" },
  { type: "features", label: "Features Grid", icon: LayoutGrid, desc: "Feature cards in a grid layout", color: "bg-emerald-500" },
  { type: "testimonials", label: "Testimonials", icon: MessageSquare, desc: "Student/client testimonials", color: "bg-violet-500" },
  { type: "cta", label: "Call to Action", icon: Star, desc: "Conversion-focused CTA section", color: "bg-amber-500" },
  { type: "image_gallery", label: "Image Gallery", icon: Image, desc: "Image gallery or media showcase", color: "bg-pink-500" },
  { type: "video", label: "Video Embed", icon: Video, desc: "YouTube, Vimeo, or Bunny Stream video", color: "bg-red-500" },
  { type: "faq", label: "FAQ", icon: List, desc: "Frequently asked questions accordion", color: "bg-cyan-500" },
  { type: "pricing_table", label: "Pricing Table", icon: CreditCard, desc: "Pricing plans comparison", color: "bg-indigo-500" },
  { type: "stats", label: "Stats Counter", icon: BarChart3, desc: "Key metrics and numbers", color: "bg-teal-500" },
  { type: "team", label: "Team / Coaches", icon: Users, desc: "Team member cards", color: "bg-orange-500" },
  { type: "contact_form", label: "Contact Form", icon: Phone, desc: "Contact form with fields", color: "bg-lime-500" },
  { type: "newsletter", label: "Newsletter", icon: Mail, desc: "Email signup section", color: "bg-rose-500" },
  { type: "custom_html", label: "Custom HTML", icon: Sparkles, desc: "Raw HTML/CSS block", color: "bg-fuchsia-500" },
  { type: "divider", label: "Divider", icon: Minus, desc: "Horizontal line separator", color: "bg-stone-500" },
  { type: "spacer", label: "Spacer", icon: Box, desc: "Vertical spacing block", color: "bg-slate-500" },
];

// ─── Section Templates ───
const SECTION_TEMPLATES: Record<string, any> = {
  hero: {
    title: "Welcome to RusingÂcademy | Bienvenue chez RusingÂcademy",
    subtitle: "Master bilingual excellence for the Canadian public service | Maîtrisez l'excellence bilingue pour la fonction publique canadienne",
    content: { ctaText: "Start Learning | Commencer", ctaUrl: "/courses", backgroundImage: "", alignment: "center" },
    backgroundColor: "#1e1b4b",
    textColor: "#ffffff",
    paddingTop: 80,
    paddingBottom: 80,
  },
  text_block: {
    title: "About Our Programs | À propos de nos programmes",
    subtitle: "",
    content: { html: "<p>Discover our comprehensive bilingual training programs designed for Canadian professionals.</p><p>Découvrez nos programmes de formation bilingue complets conçus pour les professionnels canadiens.</p>", alignment: "left" },
    backgroundColor: "#ffffff",
    textColor: "#1a1a2e",
    paddingTop: 48,
    paddingBottom: 48,
  },
  features: {
    title: "Why Choose Us | Pourquoi nous choisir",
    subtitle: "Comprehensive bilingual training ecosystem | Écosystème de formation bilingue complet",
    content: {
      items: [
        { title: "SLE Exam Prep | Préparation aux ELS", description: "Targeted preparation for all three SLE components | Préparation ciblée pour les trois composantes des ELS", icon: "🎯" },
        { title: "AI-Powered Coaching | Coaching par IA", description: "Personalized feedback and practice sessions | Rétroaction personnalisée et séances de pratique", icon: "🤖" },
        { title: "Expert Coaches | Coachs experts", description: "Certified bilingual language professionals | Professionnels linguistiques bilingues certifiés", icon: "👩‍🏫" },
        { title: "Flexible Learning | Apprentissage flexible", description: "Learn at your own pace, anytime | Apprenez à votre rythme, en tout temps", icon: "⏰" },
        { title: "Progress Tracking | Suivi des progrès", description: "Detailed analytics and performance reports | Analyses détaillées et rapports de performance", icon: "📊" },
        { title: "Community | Communauté", description: "Connect with fellow learners and coaches | Connectez-vous avec d'autres apprenants et coachs", icon: "🤝" },
      ],
    },
    backgroundColor: "#f8fafc",
    textColor: "#1a1a2e",
    paddingTop: 64,
    paddingBottom: 64,
  },
  testimonials: {
    title: "What Our Learners Say | Ce que disent nos apprenants",
    subtitle: "",
    content: {
      items: [
        { name: "Marie D.", role: "Policy Analyst | Analyste de politiques", quote: "RusingÂcademy helped me pass my SLE with confidence. | RusingÂcademy m'a aidée à réussir mes ELS avec confiance.", rating: 5 },
        { name: "James T.", role: "Program Manager | Gestionnaire de programme", quote: "The coaching sessions were incredibly effective. | Les séances de coaching étaient incroyablement efficaces.", rating: 5 },
        { name: "Sophie L.", role: "HR Advisor | Conseillère RH", quote: "Best investment for my career development. | Meilleur investissement pour mon développement de carrière.", rating: 5 },
      ],
    },
    backgroundColor: "#ffffff",
    textColor: "#1a1a2e",
    paddingTop: 64,
    paddingBottom: 64,
  },
  cta: {
    title: "Ready to Start? | Prêt à commencer?",
    subtitle: "Join thousands of professionals who have achieved bilingual excellence | Rejoignez des milliers de professionnels qui ont atteint l'excellence bilingue",
    content: { ctaText: "Enroll Now | S'inscrire maintenant", ctaUrl: "/pricing", secondaryCtaText: "Learn More | En savoir plus", secondaryCtaUrl: "/about" },
    backgroundColor: "#4f46e5",
    textColor: "#ffffff",
    paddingTop: 64,
    paddingBottom: 64,
  },
  faq: {
    title: "Frequently Asked Questions | Questions fréquemment posées",
    subtitle: "",
    content: {
      items: [
        { question: "What is the SLE? | Qu'est-ce que les ELS?", answer: "The Second Language Evaluation (SLE) is a standardized test used by the Government of Canada. | L'évaluation de langue seconde (ELS) est un test standardisé utilisé par le gouvernement du Canada." },
        { question: "How long does preparation take? | Combien de temps dure la préparation?", answer: "Typically 4-12 weeks depending on your current level. | Généralement 4 à 12 semaines selon votre niveau actuel." },
        { question: "Do you offer group rates? | Offrez-vous des tarifs de groupe?", answer: "Yes, we offer special rates for departments and organizations. | Oui, nous offrons des tarifs spéciaux pour les ministères et organisations." },
      ],
    },
    backgroundColor: "#f8fafc",
    textColor: "#1a1a2e",
    paddingTop: 64,
    paddingBottom: 64,
  },
  pricing_table: {
    title: "Pricing Plans | Plans tarifaires",
    subtitle: "Choose the plan that fits your needs | Choisissez le plan qui correspond à vos besoins",
    content: {
      plans: [
        { name: "Starter | Débutant", price: "$49/mo", features: ["Self-paced courses | Cours à votre rythme", "AI practice | Pratique IA", "Community access | Accès communauté"], highlighted: false },
        { name: "Professional | Professionnel", price: "$99/mo", features: ["Everything in Starter | Tout du Débutant", "1-on-1 coaching | Coaching individuel", "SLE mock exams | Examens simulés ELS", "Priority support | Support prioritaire"], highlighted: true },
        { name: "Enterprise | Entreprise", price: "Custom | Sur mesure", features: ["Everything in Pro | Tout du Pro", "Team dashboard | Tableau de bord équipe", "Custom reporting | Rapports personnalisés", "Dedicated manager | Gestionnaire dédié"], highlighted: false },
      ],
    },
    backgroundColor: "#ffffff",
    textColor: "#1a1a2e",
    paddingTop: 64,
    paddingBottom: 64,
  },
  stats: {
    title: "Our Impact | Notre impact",
    subtitle: "",
    content: {
      items: [
        { label: "Learners Trained | Apprenants formés", value: "5,000+", icon: "🎓" },
        { label: "SLE Pass Rate | Taux de réussite ELS", value: "94%", icon: "✅" },
        { label: "Expert Coaches | Coachs experts", value: "50+", icon: "👨‍🏫" },
        { label: "Departments Served | Ministères servis", value: "30+", icon: "🏛️" },
      ],
    },
    backgroundColor: "#1e1b4b",
    textColor: "#ffffff",
    paddingTop: 64,
    paddingBottom: 64,
  },
  team: {
    title: "Meet Our Team | Rencontrez notre équipe",
    subtitle: "Expert bilingual coaches and educators | Coachs et éducateurs bilingues experts",
    content: {
      members: [
        { name: "Coach Name", role: "Senior Language Coach | Coach linguistique senior", photo: "", bio: "" },
        { name: "Coach Name", role: "SLE Specialist | Spécialiste ELS", photo: "", bio: "" },
        { name: "Coach Name", role: "Curriculum Designer | Concepteur de programme", photo: "", bio: "" },
      ],
    },
    backgroundColor: "#ffffff",
    textColor: "#1a1a2e",
    paddingTop: 64,
    paddingBottom: 64,
  },
  contact_form: {
    title: "Contact Us | Contactez-nous",
    subtitle: "We'd love to hear from you | Nous aimerions avoir de vos nouvelles",
    content: { email: "contact@rusingacademy.ca", phone: "", address: "" },
    backgroundColor: "#f8fafc",
    textColor: "#1a1a2e",
    paddingTop: 64,
    paddingBottom: 64,
  },
  newsletter: {
    title: "Stay Updated | Restez informé",
    subtitle: "Get the latest bilingual training tips and resources | Recevez les derniers conseils et ressources de formation bilingue",
    content: { buttonText: "Subscribe | S'abonner", placeholder: "Enter your email | Entrez votre courriel" },
    backgroundColor: "#4f46e5",
    textColor: "#ffffff",
    paddingTop: 48,
    paddingBottom: 48,
  },
  image_gallery: {
    title: "Gallery | Galerie",
    subtitle: "",
    content: { images: [], layout: "grid", columns: 3 },
    backgroundColor: "#ffffff",
    textColor: "#1a1a2e",
    paddingTop: 48,
    paddingBottom: 48,
  },
  video: {
    title: "Watch & Learn | Regardez et apprenez",
    subtitle: "",
    content: { videoUrl: "", embedType: "youtube", autoplay: false },
    backgroundColor: "#1a1a2e",
    textColor: "#ffffff",
    paddingTop: 48,
    paddingBottom: 48,
  },
  custom_html: {
    title: "",
    subtitle: "",
    content: { html: "<div style='padding: 2rem; text-align: center;'><p>Custom HTML content here</p></div>" },
    backgroundColor: "#ffffff",
    textColor: "#1a1a2e",
    paddingTop: 0,
    paddingBottom: 0,
  },
  divider: {
    title: "",
    subtitle: "",
    content: { style: "solid", width: "80%", color: "#e2e8f0" },
    backgroundColor: "transparent",
    textColor: "#e2e8f0",
    paddingTop: 16,
    paddingBottom: 16,
  },
  spacer: {
    title: "",
    subtitle: "",
    content: { height: 48 },
    backgroundColor: "transparent",
    textColor: "transparent",
    paddingTop: 24,
    paddingBottom: 24,
  },
};

const DEVICE_WIDTHS: Record<DeviceMode, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

// ─── Sortable Section Item (sidebar) ───
function SortableSidebarItem({ section, isSelected, onSelect, onToggleVisibility, onDuplicate, onDelete, onCopyToPage, onShowHistory, onSaveAsTemplate }: {
  section: SectionData;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onCopyToPage: () => void;
  onShowHistory: () => void;
  onSaveAsTemplate: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const typeInfo = SECTION_TYPES.find(s => s.type === section.sectionType);
  const Icon = typeInfo?.icon || Layout;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? "border-indigo-500 bg-indigo-50 shadow-sm ring-1 ring-indigo-200"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      } ${isDragging ? "shadow-lg z-50" : ""}`}
      onClick={onSelect}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-0.5 -ml-1 text-gray-400 hover:text-gray-600">
        <GripVertical className="h-3.5 w-3.5" />
      </div>
      <div className={`w-6 h-6 rounded flex items-center justify-center text-white shrink-0 ${typeInfo?.color || "bg-gray-500"}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{section.title || typeInfo?.label || section.sectionType}</p>
        <p className="text-[10px] text-gray-400">{typeInfo?.label}</p>
      </div>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }} className="p-1 rounded hover:bg-gray-200" title={section.isVisible === false || section.isVisible === 0 ? "Show" : "Hide"}>
          {section.isVisible === false || section.isVisible === 0 ? <EyeOff className="h-3 w-3 text-gray-400" /> : <Eye className="h-3 w-3 text-gray-500" />}
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="p-1 rounded hover:bg-gray-200" title="Duplicate">
          <Copy className="h-3 w-3 text-gray-500" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onCopyToPage(); }} className="p-1 rounded hover:bg-indigo-100" title="Copy/Move to Page">
          <ArrowRight className="h-3 w-3 text-indigo-500" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onShowHistory(); }} className="p-1 rounded hover:bg-amber-100" title="Revision History">
          <RotateCcw className="h-3 w-3 text-amber-500" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onSaveAsTemplate(); }} className="p-1 rounded hover:bg-emerald-100" title="Save as Template">
          <Save className="h-3 w-3 text-emerald-500" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 rounded hover:bg-red-100" title="Delete">
          <Trash2 className="h-3 w-3 text-red-400" />
        </button>
      </div>
    </div>
  );
}

// ─── Live Preview Section Renderer ───
function PreviewSection({ section, isSelected, onClick }: { section: SectionData; isSelected: boolean; onClick: () => void }) {
  const content = typeof section.content === "string"
    ? (() => { try { return JSON.parse(section.content); } catch { return {}; } })()
    : (section.content || {});
  const sectionStyle: React.CSSProperties = {
    backgroundColor: section.backgroundColor || "#ffffff",
    color: section.textColor || "#1a1a1a",
    paddingTop: `${section.paddingTop ?? 48}px`,
    paddingBottom: `${section.paddingBottom ?? 48}px`,
    cursor: "pointer",
    position: "relative",
    outline: isSelected ? "2px solid #4f46e5" : "2px solid transparent",
    outlineOffset: "-2px",
    transition: "outline-color 0.15s ease",
  };

  const renderContent = () => {
    switch (section.sectionType) {
      case "hero":
        return (
          <div className="text-center max-w-4xl mx-auto px-6">
            {content.backgroundImage && (
              <div className="absolute inset-0 z-0">
                <img src={content.backgroundImage} alt="" className="w-full h-full object-cover opacity-30" />
              </div>
            )}
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">{section.title || "Hero Title"}</h1>
              {section.subtitle && <p className="text-base md:text-lg opacity-80 max-w-2xl mx-auto mb-6">{section.subtitle}</p>}
              {content.ctaText && (
                <button className="px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-lg font-medium hover:bg-white/30 transition-colors">
                  {content.ctaText}
                </button>
              )}
            </div>
          </div>
        );
      case "text_block":
      case "text":
        return (
          <div className="max-w-4xl mx-auto px-6">
            {section.title && <h2 className="text-2xl font-bold mb-3">{section.title}</h2>}
            {section.subtitle && <p className="text-base opacity-70 mb-4">{section.subtitle}</p>}
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content.html || content.text || "" }} />
          </div>
        );
      case "features": {
        const features = content.items || content.features || [];
        return (
          <div className="max-w-6xl mx-auto px-6">
            {section.title && <h2 className="text-2xl font-bold text-center mb-3">{section.title}</h2>}
            {section.subtitle && <p className="text-base opacity-70 text-center mb-8 max-w-2xl mx-auto">{section.subtitle}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f: any, i: number) => (
                <div key={i} className="p-5 rounded-xl border bg-white/5 backdrop-blur-sm">
                  {f.icon && <div className="text-2xl mb-2">{f.icon}</div>}
                  <h3 className="text-base font-semibold mb-1">{f.title || `Feature ${i + 1}`}</h3>
                  <p className="text-sm opacity-70">{f.description || ""}</p>
                </div>
              ))}
            </div>
          </div>
        );
      }
      case "testimonials": {
        const testimonials = content.items || content.testimonials || [];
        return (
          <div className="max-w-6xl mx-auto px-6">
            {section.title && <h2 className="text-2xl font-bold text-center mb-8">{section.title}</h2>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t: any, i: number) => (
                <div key={i} className="p-5 border rounded-xl bg-white/5 backdrop-blur-sm">
                  <div className="flex gap-0.5 mb-3">{Array.from({ length: t.rating || 5 }).map((_, j) => <span key={j} className="text-yellow-400">★</span>)}</div>
                  <p className="text-sm italic mb-3">"{t.quote || t.text || "Testimonial"}"</p>
                  <div><p className="font-semibold text-sm">{t.name || "Anonymous"}</p>{t.role && <p className="text-xs opacity-60">{t.role}</p>}</div>
                </div>
              ))}
            </div>
          </div>
        );
      }
      case "cta":
        return (
          <div className="text-center max-w-3xl mx-auto px-6">
            {section.title && <h2 className="text-2xl md:text-3xl font-bold mb-3">{section.title}</h2>}
            {section.subtitle && <p className="text-base opacity-80 mb-6">{section.subtitle}</p>}
            <div className="flex flex-wrap gap-3 justify-center">
              {content.ctaText && <button className="px-6 py-3 bg-white text-indigo-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors">{content.ctaText}</button>}
              {content.secondaryCtaText && <button className="px-6 py-3 border border-white/30 text-white rounded-lg font-medium hover:bg-white/10 transition-colors">{content.secondaryCtaText}</button>}
            </div>
          </div>
        );
      case "faq": {
        const faqs = content.items || [];
        return (
          <div className="max-w-3xl mx-auto px-6">
            {section.title && <h2 className="text-2xl font-bold text-center mb-8">{section.title}</h2>}
            <div className="space-y-3">
              {faqs.map((f: any, i: number) => (
                <div key={i} className="border rounded-lg p-4">
                  <h4 className="font-semibold text-sm">{f.question || `Question ${i + 1}`}</h4>
                  <p className="text-sm opacity-70 mt-2">{f.answer || ""}</p>
                </div>
              ))}
            </div>
          </div>
        );
      }
      case "pricing_table": {
        const plans = content.plans || [];
        return (
          <div className="max-w-5xl mx-auto px-6">
            {section.title && <h2 className="text-2xl font-bold text-center mb-3">{section.title}</h2>}
            {section.subtitle && <p className="text-base opacity-70 text-center mb-8">{section.subtitle}</p>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((p: any, i: number) => (
                <div key={i} className={`p-6 rounded-xl border ${p.highlighted ? "border-indigo-500 ring-2 ring-indigo-200 shadow-lg" : "border-gray-200"}`}>
                  <h3 className="text-lg font-bold mb-1">{p.name}</h3>
                  <p className="text-2xl font-bold mb-4">{p.price}</p>
                  <ul className="space-y-2">
                    {(p.features || []).map((f: string, j: number) => <li key={j} className="text-sm flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />{f}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
      }
      case "stats": {
        const stats = content.items || [];
        return (
          <div className="max-w-5xl mx-auto px-6">
            {section.title && <h2 className="text-2xl font-bold text-center mb-8">{section.title}</h2>}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((s: any, i: number) => (
                <div key={i} className="text-center">
                  {s.icon && <div className="text-3xl mb-2">{s.icon}</div>}
                  <div className="text-3xl font-bold">{s.value || "0"}</div>
                  <div className="text-sm opacity-70 mt-1">{s.label || `Stat ${i + 1}`}</div>
                </div>
              ))}
            </div>
          </div>
        );
      }
      case "team": {
        const members = content.members || [];
        return (
          <div className="max-w-5xl mx-auto px-6">
            {section.title && <h2 className="text-2xl font-bold text-center mb-3">{section.title}</h2>}
            {section.subtitle && <p className="text-base opacity-70 text-center mb-8">{section.subtitle}</p>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {members.map((m: any, i: number) => (
                <div key={i} className="text-center p-5 rounded-xl border">
                  <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-3 overflow-hidden">
                    {m.photo ? <img src={m.photo} alt={m.name} className="w-full h-full object-cover" /> : <Users className="w-8 h-8 text-gray-400 mt-6 mx-auto" />}
                  </div>
                  <h3 className="font-semibold">{m.name || "Team Member"}</h3>
                  {m.role && <p className="text-sm opacity-60">{m.role}</p>}
                </div>
              ))}
            </div>
          </div>
        );
      }
      case "contact_form":
        return (
          <div className="max-w-2xl mx-auto px-6">
            {section.title && <h2 className="text-2xl font-bold text-center mb-3">{section.title}</h2>}
            {section.subtitle && <p className="text-base opacity-70 text-center mb-6">{section.subtitle}</p>}
            <div className="space-y-4 p-6 border rounded-xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-gray-100 rounded border" />
                <div className="h-10 bg-gray-100 rounded border" />
              </div>
              <div className="h-10 bg-gray-100 rounded border" />
              <div className="h-24 bg-gray-100 rounded border" />
              <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">Send | Envoyer</button>
            </div>
          </div>
        );
      case "newsletter":
        return (
          <div className="text-center max-w-xl mx-auto px-6">
            {section.title && <h2 className="text-2xl font-bold mb-3">{section.title}</h2>}
            {section.subtitle && <p className="text-sm opacity-80 mb-6">{section.subtitle}</p>}
            <div className="flex gap-2">
              <div className="flex-1 h-10 bg-white/20 rounded-lg border border-white/30" />
              <button className="px-5 py-2 bg-white text-indigo-700 rounded-lg text-sm font-semibold">{content.buttonText || "Subscribe"}</button>
            </div>
          </div>
        );
      case "divider":
        return (
          <div className="px-6 flex justify-center">
            <hr style={{ width: content.width || "80%", borderColor: content.color || "#e2e8f0", borderStyle: content.style || "solid" }} />
          </div>
        );
      case "spacer":
        return <div style={{ height: `${content.height || 48}px` }} />;
      case "custom_html":
        return (
          <div className="max-w-4xl mx-auto px-6">
            <div dangerouslySetInnerHTML={{ __html: content.html || "" }} />
          </div>
        );
      default:
        return (
          <div className="max-w-4xl mx-auto px-6 text-center py-8">
            <p className="text-sm opacity-50">Unknown section type: {section.sectionType}</p>
          </div>
        );
    }
  };

  return (
    <div
      style={sectionStyle}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="group relative"
    >
      {/* Hover overlay with section type label */}
      <div className={`absolute inset-0 z-20 pointer-events-none transition-all ${isSelected ? "ring-2 ring-inset ring-indigo-500" : "group-hover:ring-2 group-hover:ring-inset group-hover:ring-indigo-300"}`}>
        <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-medium text-white transition-opacity ${isSelected ? "opacity-100 bg-indigo-600" : "opacity-0 group-hover:opacity-100 bg-indigo-500/80"}`}>
          {SECTION_TYPES.find(s => s.type === section.sectionType)?.label || section.sectionType}
        </div>
      </div>
      {/* Hidden sections overlay */}
      {(section.isVisible === false || section.isVisible === 0) && (
        <div className="absolute inset-0 z-10 bg-gray-900/50 flex items-center justify-center">
          <Badge variant="outline" className="bg-white text-gray-700"><EyeOff className="h-3 w-3 mr-1" /> Hidden</Badge>
        </div>
      )}
      {renderContent()}
    </div>
  );
}

// ─── Section Editor Panel ───
function SectionEditorPanel({ section, onUpdate, onClose, onMediaLibraryOpen, onConfigureAnimation }: {
  section: SectionData;
  onUpdate: (updates: Partial<SectionData>) => void;
  onClose: () => void;
  onMediaLibraryOpen?: (callback: (url: string) => void) => void;
  onConfigureAnimation?: (sectionId: number, sectionTitle: string) => void;
}) {
  const [localData, setLocalData] = useState<any>({
    title: section.title || "",
    subtitle: section.subtitle || "",
    content: typeof section.content === "string" ? (() => { try { return JSON.parse(section.content); } catch { return {}; } })() : (section.content || {}),
    backgroundColor: section.backgroundColor || "#ffffff",
    textColor: section.textColor || "#1a1a2e",
    paddingTop: section.paddingTop ?? 48,
    paddingBottom: section.paddingBottom ?? 48,
  });

  // Reset local data when section changes
  useEffect(() => {
    setLocalData({
      title: section.title || "",
      subtitle: section.subtitle || "",
      content: typeof section.content === "string" ? (() => { try { return JSON.parse(section.content); } catch { return {}; } })() : (section.content || {}),
      backgroundColor: section.backgroundColor || "#ffffff",
      textColor: section.textColor || "#1a1a2e",
      paddingTop: section.paddingTop ?? 48,
      paddingBottom: section.paddingBottom ?? 48,
    });
  }, [section.id]);

  const handleSave = () => {
    onUpdate({
      title: localData.title || null,
      subtitle: localData.subtitle || null,
      content: localData.content,
      backgroundColor: localData.backgroundColor,
      textColor: localData.textColor,
      paddingTop: localData.paddingTop,
      paddingBottom: localData.paddingBottom,
    });
    toast.success("Section updated");
  };

  const updateContent = (key: string, value: any) => {
    setLocalData((d: any) => ({ ...d, content: { ...d.content, [key]: value } }));
  };

  const updateContentItem = (arrayKey: string, index: number, field: string, value: any) => {
    setLocalData((d: any) => {
      const items = [...(d.content[arrayKey] || [])];
      items[index] = { ...items[index], [field]: value };
      return { ...d, content: { ...d.content, [arrayKey]: items } };
    });
  };

  const addContentItem = (arrayKey: string, template: any) => {
    setLocalData((d: any) => {
      const items = [...(d.content[arrayKey] || []), template];
      return { ...d, content: { ...d.content, [arrayKey]: items } };
    });
  };

  const removeContentItem = (arrayKey: string, index: number) => {
    setLocalData((d: any) => {
      const items = [...(d.content[arrayKey] || [])];
      items.splice(index, 1);
      return { ...d, content: { ...d.content, [arrayKey]: items } };
    });
  };

  const typeInfo = SECTION_TYPES.find(s => s.type === section.sectionType);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded flex items-center justify-center text-white ${typeInfo?.color || "bg-gray-500"}`}>
            {typeInfo?.icon && <typeInfo.icon className="h-3.5 w-3.5" />}
          </div>
          <span className="text-sm font-semibold">{typeInfo?.label || section.sectionType}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleSave} className="h-7 text-xs gap-1">
            <Save className="h-3 w-3" /> Save
          </Button>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-200"><X className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-5">
          {/* Content Tab */}
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="w-full grid grid-cols-3 h-8">
              <TabsTrigger value="content" className="text-xs h-7"><Pencil className="h-3 w-3 mr-1" /> Content</TabsTrigger>
              <TabsTrigger value="style" className="text-xs h-7"><Palette className="h-3 w-3 mr-1" /> Style</TabsTrigger>
              <TabsTrigger value="advanced" className="text-xs h-7"><Settings className="h-3 w-3 mr-1" /> Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4 mt-3">
              {/* Title (bilingual hint) */}
              {section.sectionType !== "divider" && section.sectionType !== "spacer" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Title <span className="text-gray-400">(EN | FR)</span></Label>
                    <Input value={localData.title} onChange={(e) => setLocalData((d: any) => ({ ...d, title: e.target.value }))} placeholder="English Title | Titre en français" className="text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Subtitle <span className="text-gray-400">(EN | FR)</span></Label>
                    <Textarea value={localData.subtitle} onChange={(e) => setLocalData((d: any) => ({ ...d, subtitle: e.target.value }))} placeholder="English subtitle | Sous-titre en français" rows={2} className="text-sm" />
                  </div>
                </>
              )}

              {/* Section-specific content fields */}
              {(section.sectionType === "hero" || section.sectionType === "cta") && (
                <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">CTA Button</Label>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Button Text</Label>
                    <Input value={localData.content.ctaText || ""} onChange={(e) => updateContent("ctaText", e.target.value)} placeholder="Start Now | Commencer" className="text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Button URL</Label>
                    <Input value={localData.content.ctaUrl || ""} onChange={(e) => updateContent("ctaUrl", e.target.value)} placeholder="/courses" className="text-sm" />
                  </div>
                  {section.sectionType === "cta" && (
                    <>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Secondary Button Text</Label>
                        <Input value={localData.content.secondaryCtaText || ""} onChange={(e) => updateContent("secondaryCtaText", e.target.value)} placeholder="Learn More" className="text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Secondary Button URL</Label>
                        <Input value={localData.content.secondaryCtaUrl || ""} onChange={(e) => updateContent("secondaryCtaUrl", e.target.value)} placeholder="/about" className="text-sm" />
                      </div>
                    </>
                  )}
                  {section.sectionType === "hero" && (
                    <div className="space-y-1.5">
                      <Label className="text-xs">Background Image</Label>
                      <div className="flex gap-2">
                        <Input value={localData.content.backgroundImage || ""} onChange={(e) => updateContent("backgroundImage", e.target.value)} placeholder="https://..." className="text-sm flex-1" />
                        <Button size="sm" variant="outline" className="h-9 px-2 shrink-0" onClick={() => onMediaLibraryOpen && onMediaLibraryOpen((url: string) => updateContent("backgroundImage", url))} title="Browse Media Library">
                          <ImagePlus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      {localData.content.backgroundImage && (
                        <div className="mt-1 rounded-md overflow-hidden border h-20">
                          <img src={localData.content.backgroundImage} alt="Background preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {section.sectionType === "text_block" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Content <span className="text-gray-400">(Rich Text)</span></Label>
                  <RichTextEditor
                    content={localData.content.html || ""}
                    onChange={(html) => updateContent("html", html)}
                    placeholder="Start writing your content..."
                    minHeight="200px"
                    compact
                  />
                </div>
              )}

              {section.sectionType === "features" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Feature Items</Label>
                    <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => addContentItem("items", { title: "New Feature | Nouvelle fonctionnalité", description: "Description here | Description ici", icon: "✨" })}>
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  {(localData.content.items || []).map((item: any, i: number) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2 relative">
                      <button onClick={() => removeContentItem("items", i)} className="absolute top-2 right-2 p-1 rounded hover:bg-red-100"><Trash2 className="h-3 w-3 text-red-400" /></button>
                      <Input value={item.icon || ""} onChange={(e) => updateContentItem("items", i, "icon", e.target.value)} placeholder="Icon (emoji)" className="text-sm w-16" />
                      <Input value={item.title || ""} onChange={(e) => updateContentItem("items", i, "title", e.target.value)} placeholder="Feature title" className="text-sm" />
                      <Input value={item.description || ""} onChange={(e) => updateContentItem("items", i, "description", e.target.value)} placeholder="Description" className="text-sm" />
                    </div>
                  ))}
                </div>
              )}

              {section.sectionType === "testimonials" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Testimonials</Label>
                    <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => addContentItem("items", { name: "Name", role: "Role", quote: "Testimonial text", rating: 5 })}>
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  {(localData.content.items || []).map((item: any, i: number) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2 relative">
                      <button onClick={() => removeContentItem("items", i)} className="absolute top-2 right-2 p-1 rounded hover:bg-red-100"><Trash2 className="h-3 w-3 text-red-400" /></button>
                      <Input value={item.name || ""} onChange={(e) => updateContentItem("items", i, "name", e.target.value)} placeholder="Name" className="text-sm" />
                      <Input value={item.role || ""} onChange={(e) => updateContentItem("items", i, "role", e.target.value)} placeholder="Role / Title" className="text-sm" />
                      <Textarea value={item.quote || ""} onChange={(e) => updateContentItem("items", i, "quote", e.target.value)} placeholder="Testimonial text" rows={2} className="text-sm" />
                    </div>
                  ))}
                </div>
              )}

              {section.sectionType === "faq" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">FAQ Items</Label>
                    <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => addContentItem("items", { question: "New Question | Nouvelle question", answer: "Answer here | Réponse ici" })}>
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  {(localData.content.items || []).map((item: any, i: number) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2 relative">
                      <button onClick={() => removeContentItem("items", i)} className="absolute top-2 right-2 p-1 rounded hover:bg-red-100"><Trash2 className="h-3 w-3 text-red-400" /></button>
                      <Input value={item.question || ""} onChange={(e) => updateContentItem("items", i, "question", e.target.value)} placeholder="Question" className="text-sm" />
                      <Textarea value={item.answer || ""} onChange={(e) => updateContentItem("items", i, "answer", e.target.value)} placeholder="Answer" rows={2} className="text-sm" />
                    </div>
                  ))}
                </div>
              )}

              {section.sectionType === "stats" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Stats</Label>
                    <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => addContentItem("items", { label: "New Stat | Nouvelle stat", value: "0", icon: "📊" })}>
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  {(localData.content.items || []).map((item: any, i: number) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2 relative">
                      <button onClick={() => removeContentItem("items", i)} className="absolute top-2 right-2 p-1 rounded hover:bg-red-100"><Trash2 className="h-3 w-3 text-red-400" /></button>
                      <div className="grid grid-cols-3 gap-2">
                        <Input value={item.icon || ""} onChange={(e) => updateContentItem("items", i, "icon", e.target.value)} placeholder="Icon" className="text-sm" />
                        <Input value={item.value || ""} onChange={(e) => updateContentItem("items", i, "value", e.target.value)} placeholder="Value" className="text-sm" />
                        <Input value={item.label || ""} onChange={(e) => updateContentItem("items", i, "label", e.target.value)} placeholder="Label" className="text-sm" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {section.sectionType === "video" && (
                <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Video Settings</Label>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Video URL</Label>
                    <Input value={localData.content.videoUrl || ""} onChange={(e) => updateContent("videoUrl", e.target.value)} placeholder="https://youtube.com/watch?v=..." className="text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Embed Type</Label>
                    <Select value={localData.content.embedType || "youtube"} onValueChange={(v) => updateContent("embedType", v)}>
                      <SelectTrigger className="text-sm h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="vimeo">Vimeo</SelectItem>
                        <SelectItem value="bunny">Bunny Stream</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {section.sectionType === "newsletter" && (
                <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Button Text</Label>
                    <Input value={localData.content.buttonText || ""} onChange={(e) => updateContent("buttonText", e.target.value)} placeholder="Subscribe" className="text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Placeholder Text</Label>
                    <Input value={localData.content.placeholder || ""} onChange={(e) => updateContent("placeholder", e.target.value)} placeholder="Enter your email" className="text-sm" />
                  </div>
                </div>
              )}

              {section.sectionType === "custom_html" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Custom HTML</Label>
                  <Textarea value={localData.content.html || ""} onChange={(e) => updateContent("html", e.target.value)} rows={12} className="text-xs font-mono" placeholder="<div>...</div>" />
                </div>
              )}

              {section.sectionType === "pricing_table" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Pricing Plans</Label>
                    <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => {
                      setLocalData((d: any) => ({
                        ...d,
                        content: { ...d.content, plans: [...(d.content.plans || []), { name: "New Plan", price: "$0/mo", features: ["Feature 1"], highlighted: false }] }
                      }));
                    }}>
                      <Plus className="h-3 w-3 mr-1" /> Add Plan
                    </Button>
                  </div>
                  {(localData.content.plans || []).map((plan: any, i: number) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2 relative">
                      <button onClick={() => {
                        setLocalData((d: any) => {
                          const plans = [...(d.content.plans || [])];
                          plans.splice(i, 1);
                          return { ...d, content: { ...d.content, plans } };
                        });
                      }} className="absolute top-2 right-2 p-1 rounded hover:bg-red-100"><Trash2 className="h-3 w-3 text-red-400" /></button>
                      <Input value={plan.name || ""} onChange={(e) => {
                        setLocalData((d: any) => {
                          const plans = [...(d.content.plans || [])];
                          plans[i] = { ...plans[i], name: e.target.value };
                          return { ...d, content: { ...d.content, plans } };
                        });
                      }} placeholder="Plan name" className="text-sm" />
                      <Input value={plan.price || ""} onChange={(e) => {
                        setLocalData((d: any) => {
                          const plans = [...(d.content.plans || [])];
                          plans[i] = { ...plans[i], price: e.target.value };
                          return { ...d, content: { ...d.content, plans } };
                        });
                      }} placeholder="$99/mo" className="text-sm" />
                      <div className="flex items-center gap-2">
                        <Switch checked={plan.highlighted || false} onCheckedChange={(v) => {
                          setLocalData((d: any) => {
                            const plans = [...(d.content.plans || [])];
                            plans[i] = { ...plans[i], highlighted: v };
                            return { ...d, content: { ...d.content, plans } };
                          });
                        }} />
                        <Label className="text-xs">Highlighted</Label>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {section.sectionType === "team" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Team Members</Label>
                    <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => {
                      setLocalData((d: any) => ({
                        ...d,
                        content: { ...d.content, members: [...(d.content.members || []), { name: "New Member", role: "Role", photo: "", bio: "" }] }
                      }));
                    }}>
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  {(localData.content.members || []).map((member: any, i: number) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2 relative">
                      <button onClick={() => {
                        setLocalData((d: any) => {
                          const members = [...(d.content.members || [])];
                          members.splice(i, 1);
                          return { ...d, content: { ...d.content, members } };
                        });
                      }} className="absolute top-2 right-2 p-1 rounded hover:bg-red-100"><Trash2 className="h-3 w-3 text-red-400" /></button>
                      <Input value={member.name || ""} onChange={(e) => {
                        setLocalData((d: any) => {
                          const members = [...(d.content.members || [])];
                          members[i] = { ...members[i], name: e.target.value };
                          return { ...d, content: { ...d.content, members } };
                        });
                      }} placeholder="Name" className="text-sm" />
                      <Input value={member.role || ""} onChange={(e) => {
                        setLocalData((d: any) => {
                          const members = [...(d.content.members || [])];
                          members[i] = { ...members[i], role: e.target.value };
                          return { ...d, content: { ...d.content, members } };
                        });
                      }} placeholder="Role" className="text-sm" />
                      <div className="flex gap-1.5">
                        <Input value={member.photo || ""} onChange={(e) => {
                          setLocalData((d: any) => {
                            const members = [...(d.content.members || [])];
                            members[i] = { ...members[i], photo: e.target.value };
                            return { ...d, content: { ...d.content, members } };
                          });
                        }} placeholder="Photo URL" className="text-sm flex-1" />
                        <Button size="sm" variant="outline" className="h-9 px-2 shrink-0" onClick={() => onMediaLibraryOpen && onMediaLibraryOpen((url: string) => {
                          setLocalData((d: any) => {
                            const members = [...(d.content.members || [])];
                            members[i] = { ...members[i], photo: url };
                            return { ...d, content: { ...d.content, members } };
                          });
                        })} title="Browse Media"><ImagePlus className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="style" className="space-y-4 mt-3">
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Colors</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Background</Label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={localData.backgroundColor || "#ffffff"} onChange={(e) => setLocalData((d: any) => ({ ...d, backgroundColor: e.target.value }))} className="w-8 h-8 rounded border cursor-pointer" />
                      <Input value={localData.backgroundColor || ""} onChange={(e) => setLocalData((d: any) => ({ ...d, backgroundColor: e.target.value }))} className="text-xs flex-1" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Text</Label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={localData.textColor || "#1a1a2e"} onChange={(e) => setLocalData((d: any) => ({ ...d, textColor: e.target.value }))} className="w-8 h-8 rounded border cursor-pointer" />
                      <Input value={localData.textColor || ""} onChange={(e) => setLocalData((d: any) => ({ ...d, textColor: e.target.value }))} className="text-xs flex-1" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Spacing</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Padding Top (px)</Label>
                    <Input type="number" value={localData.paddingTop} onChange={(e) => setLocalData((d: any) => ({ ...d, paddingTop: parseInt(e.target.value) || 0 }))} className="text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Padding Bottom (px)</Label>
                    <Input type="number" value={localData.paddingBottom} onChange={(e) => setLocalData((d: any) => ({ ...d, paddingBottom: parseInt(e.target.value) || 0 }))} className="text-sm" />
                  </div>
                </div>
              </div>
              {/* Animation Preset */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Animation</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {section.animation && section.animation !== "none" ? section.animation : "None"}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs ml-auto"
                    onClick={() => {
                      onConfigureAnimation?.(section.id, section.title || section.sectionType);
                    }}
                  >
                    <Sparkles className="h-3 w-3 mr-1" /> Configure
                  </Button>
                </div>
              </div>
              {/* Dynamic Style Presets */}
              <StylePresetsPanel
                sectionId={section.id}
                onApply={(styles) => {
                  setLocalData((d: any) => ({
                    ...d,
                    backgroundColor: styles.backgroundColor || d.backgroundColor,
                    textColor: styles.textColor || d.textColor,
                    paddingTop: styles.paddingTop ?? d.paddingTop,
                    paddingBottom: styles.paddingBottom ?? d.paddingBottom,
                  }));
                }}
                currentStyles={{
                  backgroundColor: localData.backgroundColor || "#ffffff",
                  textColor: localData.textColor || "#1a1a2e",
                  paddingTop: localData.paddingTop || 0,
                  paddingBottom: localData.paddingBottom || 0,
                }}
              />
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 mt-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Section Type</Label>
                <Input value={section.sectionType} disabled className="text-sm bg-gray-50" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Section ID</Label>
                <Input value={section.id} disabled className="text-sm bg-gray-50" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Sort Order</Label>
                <Input value={section.sortOrder} disabled className="text-sm bg-gray-50" />
              </div>
              <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
                <p className="font-medium mb-1">Bilingual Content Tips</p>
                <p>Use the pipe separator <code className="bg-amber-100 px-1 rounded">|</code> to separate English and French content in titles and text fields.</p>
                <p className="mt-1">Example: <code className="bg-amber-100 px-1 rounded">Welcome | Bienvenue</code></p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Main Visual Editor Component ───
export default function VisualEditor({ pageId, onBack }: { pageId: number; onBack: () => void }) {
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [showSidebar, setShowSidebar] = useState(true);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [versionNote, setVersionNote] = useState("");
  const [sidebarTab, setSidebarTab] = useState<"sections" | "templates">("sections");
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerCallback, setMediaPickerCallback] = useState<((url: string) => void) | null>(null);
  // Cross-page copy/move state
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyModalSectionId, setCopyModalSectionId] = useState<number | null>(null);
  const [copyModalSectionTitle, setCopyModalSectionTitle] = useState("");
  // Revision history state
  const [showRevisionHistory, setShowRevisionHistory] = useState(false);
  const [revisionSectionId, setRevisionSectionId] = useState<number | null>(null);
  const [revisionSectionTitle, setRevisionSectionTitle] = useState("");
  const utils = trpc.useUtils();

  // SEO Editor state
  const [showSeo, setShowSeo] = useState(false);

  // Save As Template state
  const [showSaveAsTemplate, setShowSaveAsTemplate] = useState(false);

  // Animation Presets state
  const [showAnimationPanel, setShowAnimationPanel] = useState(false);
  const [animationSectionId, setAnimationSectionId] = useState<number | null>(null);
  const [animationSectionTitle, setAnimationSectionTitle] = useState("");
  const [saveAsTemplateSectionId, setSaveAsTemplateSectionId] = useState<number | null>(null);
  const [saveAsTemplateSectionTitle, setSaveAsTemplateSectionTitle] = useState("");
  const [saveAsTemplateSectionType, setSaveAsTemplateSectionType] = useState("");

  // Undo/Redo system — tracks section edit history
  type UndoEntry = { sectionId: number; before: Partial<SectionData>; after: Partial<SectionData> };
  const [, undoRedoActions] = useUndoRedo<UndoEntry | null>(null, 30);
  const undoRedoRef = useRef(undoRedoActions);
  undoRedoRef.current = undoRedoActions;

  // Data queries
  const pageQuery = trpc.cms.getPage.useQuery({ id: pageId });
  const versionsQuery = trpc.cms.listVersions.useQuery({ pageId }, { enabled: showVersions });

  // Mutations
  const addSectionMut = trpc.cms.addSection.useMutation({
    onSuccess: () => { utils.cms.getPage.invalidate({ id: pageId }); toast.success("Section added"); },
  });
  const updateSectionMut = trpc.cms.updateSection.useMutation({
    onSuccess: () => { utils.cms.getPage.invalidate({ id: pageId }); },
  });
  const deleteSectionMut = trpc.cms.deleteSection.useMutation({
    onSuccess: () => { utils.cms.getPage.invalidate({ id: pageId }); setSelectedSectionId(null); toast.success("Section deleted"); },
  });
  const duplicateSectionMut = trpc.cms.duplicateSection.useMutation({
    onSuccess: () => { utils.cms.getPage.invalidate({ id: pageId }); toast.success("Section duplicated"); },
  });
  const reorderMut = trpc.cms.reorderSections.useMutation({
    onSuccess: () => { utils.cms.getPage.invalidate({ id: pageId }); },
  });
  const publishPageMut = trpc.cms.publishPage.useMutation({
    onSuccess: () => { utils.cms.getPage.invalidate({ id: pageId }); toast.success("Page published!"); },
  });
  const unpublishPageMut = trpc.cms.unpublishPage.useMutation({
    onSuccess: () => { utils.cms.getPage.invalidate({ id: pageId }); toast.success("Page unpublished"); },
  });
  const saveVersionMut = trpc.cms.saveVersion.useMutation({
    onSuccess: () => { versionsQuery.refetch(); setShowVersions(false); setVersionNote(""); toast.success("Version saved"); },
  });
  const restoreVersionMut = trpc.cms.restoreVersion.useMutation({
    onSuccess: () => { utils.cms.getPage.invalidate({ id: pageId }); setShowVersions(false); toast.success("Version restored"); },
  });

  // DnD
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const page = pageQuery.data as any;
  const sections: SectionData[] = useMemo(() => (page?.sections || []).map((s: any) => ({
    ...s,
    content: typeof s.content === "string" ? (() => { try { return JSON.parse(s.content); } catch { return {}; } })() : (s.content || {}),
  })), [page?.sections]);
  const sectionIds = useMemo(() => sections.map(s => s.id), [sections]);
  const selectedSection = sections.find(s => s.id === selectedSectionId) || null;

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sectionIds.indexOf(active.id as number);
    const newIndex = sectionIds.indexOf(over.id as number);
    if (oldIndex === -1 || newIndex === -1) return;
    const newOrder = arrayMove(sectionIds, oldIndex, newIndex);
    reorderMut.mutate({ pageId, sectionIds: newOrder });
  }, [sectionIds, pageId]);

  const handleAddSection = (type: string) => {
    const template = SECTION_TEMPLATES[type] || {};
    addSectionMut.mutate({
      pageId,
      sectionType: type,
      title: template.title || SECTION_TYPES.find(s => s.type === type)?.label || type,
      subtitle: template.subtitle || undefined,
      content: template.content || undefined,
      backgroundColor: template.backgroundColor || undefined,
      textColor: template.textColor || undefined,
      sortOrder: sections.length,
    });
    setShowAddSection(false);
  };

  const handleUpdateSection = (updates: Partial<SectionData>) => {
    if (!selectedSectionId) return;
    // Push to undo history before saving
    const currentSection = sections.find(s => s.id === selectedSectionId);
    if (currentSection) {
      undoRedoActions.push({
        sectionId: selectedSectionId,
        before: {
          title: currentSection.title,
          subtitle: currentSection.subtitle,
          content: currentSection.content,
          backgroundColor: currentSection.backgroundColor,
          textColor: currentSection.textColor,
          paddingTop: currentSection.paddingTop,
          paddingBottom: currentSection.paddingBottom,
        },
        after: updates,
      });
    }
    updateSectionMut.mutate({ id: selectedSectionId, ...updates });
  };

  // Keyboard undo/redo handlers
  const handleKeyUndo = useCallback(() => {
    const entry = undoRedoRef.current.undo();
    if (entry) {
      updateSectionMut.mutate({ id: entry.sectionId, ...entry.before });
      toast.info("Undo applied");
    }
  }, []);
  const handleKeyRedo = useCallback(() => {
    const entry = undoRedoRef.current.redo();
    if (entry) {
      updateSectionMut.mutate({ id: entry.sectionId, ...entry.after });
      toast.info("Redo applied");
    }
  }, []);
  useUndoRedoKeyboard(handleKeyUndo, handleKeyRedo);


  // Media library open handler
  const handleMediaLibraryOpen = useCallback((callback: (url: string) => void) => {
    setMediaPickerCallback(() => callback);
    setShowMediaPicker(true);
  }, []);

  const handleMediaSelect = useCallback((url: string) => {
    if (mediaPickerCallback) {
      mediaPickerCallback(url);
    }
    setShowMediaPicker(false);
    setMediaPickerCallback(null);
  }, [mediaPickerCallback]);

  const previewWidth = DEVICE_WIDTHS[deviceMode];

  // Ensure document.body is available (handles HMR edge cases)
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

   if (pageQuery.isLoading) {
    return createPortal(
      <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>,
      document.body
    );
  }
  if (!page) {
    return createPortal(
      <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-lg font-medium">Page not found</p>
          <Button variant="outline" className="mt-4" onClick={onBack}>Go Back</Button>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-white flex flex-col">
      {/* ─── Top Toolbar ─── */}
      <div className="h-14 border-b bg-white flex items-center justify-between px-4 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="h-6 w-px bg-gray-200" />
          <div>
            <h1 className="text-sm font-semibold leading-tight">{page.title}</h1>
            <p className="text-[10px] text-gray-400">/p/{page.slug}</p>
          </div>
          <Badge variant={page.status === "published" ? "default" : "outline"} className="text-[10px]">
            {page.status === "published" ? <><CheckCircle className="h-2.5 w-2.5 mr-0.5" /> Published</> : <><AlertCircle className="h-2.5 w-2.5 mr-0.5" /> Draft</>}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Device toggles */}
          <div className="flex items-center border rounded-lg p-0.5 gap-0.5 bg-gray-50">
            <Button variant={deviceMode === "desktop" ? "secondary" : "ghost"} size="sm" className="h-7 px-2" onClick={() => setDeviceMode("desktop")}><Monitor className="h-3.5 w-3.5" /></Button>
            <Button variant={deviceMode === "tablet" ? "secondary" : "ghost"} size="sm" className="h-7 px-2" onClick={() => setDeviceMode("tablet")}><Tablet className="h-3.5 w-3.5" /></Button>
            <Button variant={deviceMode === "mobile" ? "secondary" : "ghost"} size="sm" className="h-7 px-2" onClick={() => setDeviceMode("mobile")}><Smartphone className="h-3.5 w-3.5" /></Button>
          </div>
          <div className="h-6 w-px bg-gray-200" />
          {/* Undo/Redo */}
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => {
              const entry = undoRedoActions.undo();
              if (entry) { updateSectionMut.mutate({ id: entry.sectionId, ...entry.before }); toast.info("Undo applied"); }
            }} disabled={!undoRedoActions.canUndo} title="Undo (Ctrl+Z)">
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => {
              const entry = undoRedoActions.redo();
              if (entry) { updateSectionMut.mutate({ id: entry.sectionId, ...entry.after }); toast.info("Redo applied"); }
            }} disabled={!undoRedoActions.canRedo} title="Redo (Ctrl+Y)">
              <Redo2Icon className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-6 w-px bg-gray-200" />
          {/* Sidebar toggle */}
          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setShowSidebar(!showSidebar)}>
            {showSidebar ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
          </Button>
          <div className="h-6 w-px bg-gray-200" />
          {/* SEO / Version / Publish */}
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => setShowSeo(true)}>
            <Search className="h-3.5 w-3.5" /> SEO
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => setShowVersions(true)}>
            <History className="h-3.5 w-3.5" /> Versions
          </Button>
          {page.status === "published" ? (
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => unpublishPageMut.mutate({ id: pageId })} disabled={unpublishPageMut.isPending}>
              <EyeOff className="h-3.5 w-3.5" /> Unpublish
            </Button>
          ) : (
            <Button size="sm" className="h-8 text-xs gap-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => publishPageMut.mutate({ id: pageId })} disabled={publishPageMut.isPending}>
              <Globe className="h-3.5 w-3.5" /> Publish
            </Button>
          )}
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Section List + Add */}
        {showSidebar && (
          <div className="w-64 border-r bg-gray-50 flex flex-col shrink-0">
            {/* Sidebar tabs */}
            <div className="flex border-b">
              <button
                onClick={() => setSidebarTab("sections")}
                className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${sidebarTab === "sections" ? "text-indigo-700 border-b-2 border-indigo-600 bg-white" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Layers className="h-3.5 w-3.5 inline mr-1" /> Sections ({sections.length})
              </button>
              <button
                onClick={() => setSidebarTab("templates")}
                className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${sidebarTab === "templates" ? "text-indigo-700 border-b-2 border-indigo-600 bg-white" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Layout className="h-3.5 w-3.5 inline mr-1" /> Templates
              </button>
            </div>

            <ScrollArea className="flex-1">
              {sidebarTab === "sections" ? (
                <div className="p-3 space-y-1.5">
                  {sections.length === 0 ? (
                    <div className="text-center py-8">
                      <Layout className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-xs text-gray-400">No sections yet</p>
                      <Button size="sm" variant="outline" className="mt-3 text-xs" onClick={() => setSidebarTab("templates")}>
                        <Plus className="h-3 w-3 mr-1" /> Add First Section
                      </Button>
                    </div>
                  ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
                        {sections.map(section => (
                          <SortableSidebarItem
                            key={section.id}
                            section={section}
                            isSelected={selectedSectionId === section.id}
                            onSelect={() => setSelectedSectionId(selectedSectionId === section.id ? null : section.id)}
                            onToggleVisibility={() => updateSectionMut.mutate({ id: section.id, isVisible: section.isVisible === false || section.isVisible === 0 ? true : false })}
                            onDuplicate={() => duplicateSectionMut.mutate({ id: section.id })}
                            onCopyToPage={() => {
                              setCopyModalSectionId(section.id);
                              setCopyModalSectionTitle(section.title || section.sectionType);
                              setShowCopyModal(true);
                            }}
                            onShowHistory={() => {
                              setRevisionSectionId(section.id);
                              setRevisionSectionTitle(section.title || section.sectionType);
                              setShowRevisionHistory(true);
                            }}
                            onSaveAsTemplate={() => {
                              setSaveAsTemplateSectionId(section.id);
                              setSaveAsTemplateSectionTitle(section.title || section.sectionType);
                              setSaveAsTemplateSectionType(section.sectionType);
                              setShowSaveAsTemplate(true);
                            }}
                            onDelete={() => { if (confirm("Delete this section?")) deleteSectionMut.mutate({ id: section.id }); }}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  )}
                </div>
              ) : (
                <TemplateMarketplace
                  pageId={pageId}
                  sectionCount={sections.length}
                  onTemplateUsed={() => utils.cms.getPage.invalidate({ id: pageId })}
                  onAddBlankSection={handleAddSection}
                />
              )}
            </ScrollArea>
          </div>
        )}

        {/* Center: Live Preview */}
        <div className="flex-1 bg-gray-100 overflow-auto flex justify-center" onClick={() => setSelectedSectionId(null)}>
          <div
            className="bg-white shadow-lg my-4 overflow-auto transition-all duration-300"
            style={{
              width: previewWidth,
              maxWidth: previewWidth === "100%" ? undefined : previewWidth,
              minHeight: "calc(100vh - 120px)",
            }}
          >
            {sections.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-gray-400">
                <Layout className="h-16 w-16 mb-4 opacity-30" />
                <p className="text-lg font-medium mb-2">Empty Page</p>
                <p className="text-sm mb-4">Start building by adding sections from the sidebar</p>
                <Button variant="outline" onClick={() => { setShowSidebar(true); setSidebarTab("templates"); }}>
                  <Plus className="h-4 w-4 mr-2" /> Add First Section
                </Button>
              </div>
            ) : (
              sections.map(section => (
                <PreviewSection
                  key={section.id}
                  section={section}
                  isSelected={selectedSectionId === section.id}
                  onClick={() => setSelectedSectionId(section.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Section Editor */}
        {selectedSection && (
          <div className="w-80 border-l bg-white shrink-0 overflow-hidden">
            <SectionEditorPanel
              section={selectedSection}
              onUpdate={handleUpdateSection}
              onClose={() => setSelectedSectionId(null)}
              onMediaLibraryOpen={handleMediaLibraryOpen}
              onConfigureAnimation={(sectionId, sectionTitle) => {
                setAnimationSectionId(sectionId);
                setAnimationSectionTitle(sectionTitle);
                setShowAnimationPanel(true);
              }}
            />
          </div>
        )}
      </div>

      {/* ─── Versions Dialog ─── (portal end is at bottom) */}
      <Dialog open={showVersions} onOpenChange={setShowVersions}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><History className="h-4 w-4" /> Page Versions</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <FileText className="h-5 w-5 text-indigo-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Current Version</p>
                <p className="text-xs text-gray-500">Status: {page?.status || "draft"}</p>
              </div>
              <Badge>Active</Badge>
            </div>
            <div className="flex gap-2">
              <Input value={versionNote} onChange={(e) => setVersionNote(e.target.value)} placeholder="Version note (optional)..." className="text-sm" />
              <Button size="sm" onClick={() => saveVersionMut.mutate({ pageId, note: versionNote || undefined })} disabled={saveVersionMut.isPending} className="shrink-0">
                {saveVersionMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Save
              </Button>
            </div>
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-2">
                {versionsQuery.isLoading ? (
                  <div className="flex items-center gap-2 text-gray-400 py-4 justify-center"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>
                ) : (versionsQuery.data as any[] || []).length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No saved versions yet.</p>
                ) : (
                  (versionsQuery.data as any[]).map((v: any) => (
                    <div key={v.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <History className="h-4 w-4 text-gray-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">v{v.versionNumber}</p>
                        {v.note && <p className="text-xs text-gray-500 truncate">{v.note}</p>}
                        <p className="text-xs text-gray-400">{v.createdAt ? new Date(v.createdAt).toLocaleString() : "—"}</p>
                      </div>
                      <Button variant="outline" size="sm" className="h-7 text-xs shrink-0"
                        onClick={() => { if (confirm(`Restore to version ${v.versionNumber}?`)) restoreVersionMut.mutate({ versionId: v.id }); }}
                        disabled={restoreVersionMut.isPending}>
                        <Undo2 className="h-3 w-3 mr-1" /> Restore
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Close</Button></DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Media Library Picker ─── */}
      <MediaLibraryPicker
        open={showMediaPicker}
        onClose={() => {
          setShowMediaPicker(false);
          setMediaPickerCallback(null);
        }}
        onSelect={(url) => {
          handleMediaSelect(url);
        }}
        mimeFilter="image/"
        title="Select Image"
      />
      {/* ─── Cross-Page Copy/Move Modal ─── */}
      {showCopyModal && copyModalSectionId && (
        <CrossPageCopyModal
          open={showCopyModal}
          onClose={() => {
            setShowCopyModal(false);
            setCopyModalSectionId(null);
            setCopyModalSectionTitle("");
          }}
          sectionId={copyModalSectionId}
          sectionTitle={copyModalSectionTitle}
          currentPageId={pageId}
          onSuccess={() => {
            utils.cms.getPage.invalidate({ id: pageId });
          }}
        />
      )}
      {/* ─── Revision History Panel ─── */}
      <RevisionHistoryPanel
        open={showRevisionHistory}
        onClose={() => {
          setShowRevisionHistory(false);
          setRevisionSectionId(null);
          setRevisionSectionTitle("");
        }}
        sectionId={revisionSectionId}
        pageId={pageId}
        sectionTitle={revisionSectionTitle}
        onRestore={() => {
          utils.cms.getPage.invalidate({ id: pageId });
        }}
      />
      {/* ─── SEO Editor Panel ─── */}
      <SeoEditorPanel
        open={showSeo}
        onClose={() => setShowSeo(false)}
        pageId={pageId}
        onMediaLibraryOpen={(callback) => {
          setMediaPickerCallback(() => callback);
          setShowMediaPicker(true);
        }}
      />

      {/* Save As Template Dialog */}
      {showSaveAsTemplate && saveAsTemplateSectionId && (
        <SaveAsTemplateDialog
          open={showSaveAsTemplate}
          onClose={() => setShowSaveAsTemplate(false)}
          sectionId={saveAsTemplateSectionId}
          sectionTitle={saveAsTemplateSectionTitle}
          sectionType={saveAsTemplateSectionType}
        />
      )}

      {/* Animation Presets Panel */}
      {showAnimationPanel && animationSectionId && (
        <AnimationPresetsPanel
          open={showAnimationPanel}
          onClose={() => setShowAnimationPanel(false)}
          sectionId={animationSectionId}
          sectionTitle={animationSectionTitle}
          currentAnimation={sections.find(s => s.id === animationSectionId)?.animation}
          currentDelay={sections.find(s => s.id === animationSectionId)?.animationDelay}
          currentDuration={sections.find(s => s.id === animationSectionId)?.animationDuration}
          onAnimationChange={() => utils.cms.getPage.invalidate({ id: pageId })}
        />
      )}
    </div>,
    document.body
  );
}
