import React, { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Globe,
  Share2,
  Code2,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ImagePlus,
  Eye,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Twitter,
  Facebook,
} from "lucide-react";
import { toast } from "sonner";

// ============================================================================
// Types
// ============================================================================
interface SeoEditorPanelProps {
  pageId: number;
  open: boolean;
  onClose: () => void;
  onMediaLibraryOpen?: (callback: (url: string) => void) => void;
}

type SchemaType = "Article" | "Course" | "Organization" | "WebPage" | "FAQPage" | "Service";
type TwitterCard = "summary" | "summary_large_image";

interface SeoData {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  canonicalUrl: string;
  schemaType: string;
  ogTitle: string;
  ogDescription: string;
  twitterCard: string;
  noIndex: boolean;
  structuredData: any;
  pageTitle: string;
  pageSlug: string;
}

// ============================================================================
// Character Limit Indicator
// ============================================================================
function CharCount({ current, max, label }: { current: number; max: number; label: string }) {
  const pct = (current / max) * 100;
  const color = pct > 100 ? "text-red-500" : pct > 85 ? "text-amber-500" : "text-emerald-500";
  return (
    <div className="flex items-center justify-between mt-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-xs font-mono ${color}`}>
        {current}/{max}
      </span>
    </div>
  );
}

// ============================================================================
// Google Snippet Preview
// ============================================================================
function GoogleSnippetPreview({
  title,
  url,
  description,
}: {
  title: string;
  url: string;
  description: string;
}) {
  const displayTitle = title || "Page Title";
  const displayUrl = url || "https://www.rusingacademy.ca/page-slug";
  const displayDesc = description || "Add a meta description to improve your search appearance...";

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-1">
      <div className="text-xs text-gray-500 flex items-center gap-1">
        <Globe className="w-3 h-3" />
        <span className="truncate">{displayUrl}</span>
      </div>
      <h3 className="text-[#1a0dab] text-lg font-normal leading-tight hover:underline cursor-pointer truncate">
        {displayTitle}
      </h3>
      <p className="text-sm text-gray-600 leading-snug line-clamp-2">
        {displayDesc}
      </p>
    </div>
  );
}

// ============================================================================
// Social Card Preview
// ============================================================================
function SocialCardPreview({
  platform,
  title,
  description,
  image,
  url,
}: {
  platform: "facebook" | "twitter";
  title: string;
  description: string;
  image: string;
  url: string;
}) {
  const displayTitle = title || "Page Title";
  const displayDesc = description || "Add a description for social sharing...";
  const displayUrl = url || "rusingacademy.ca";

  if (platform === "twitter") {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-w-[400px]">
        {image ? (
          <div className="h-[200px] bg-gray-100 relative">
            <img src={image} alt="OG" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="h-[200px] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <ImagePlus className="w-8 h-8 text-slate-400" />
          </div>
        )}
        <div className="p-3 space-y-1">
          <h4 className="text-sm font-semibold text-gray-900 truncate">{displayTitle}</h4>
          <p className="text-xs text-gray-500 line-clamp-2">{displayDesc}</p>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Twitter className="w-3 h-3" />
            <span>{displayUrl.replace(/https?:\/\//, "").split("/")[0]}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-w-[400px]">
      {image ? (
        <div className="h-[210px] bg-gray-100 relative">
          <img src={image} alt="OG" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-[210px] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
          <ImagePlus className="w-8 h-8 text-slate-400" />
        </div>
      )}
      <div className="p-3 bg-[#f2f3f5] space-y-0.5">
        <div className="text-xs text-gray-500 uppercase tracking-wide">
          {displayUrl.replace(/https?:\/\//, "").split("/")[0]}
        </div>
        <h4 className="text-sm font-semibold text-gray-900 truncate">{displayTitle}</h4>
        <p className="text-xs text-gray-500 line-clamp-1">{displayDesc}</p>
      </div>
    </div>
  );
}

// ============================================================================
// SEO Score Indicator
// ============================================================================
function SeoScore({ data }: { data: SeoData }) {
  let score = 0;
  const checks: { label: string; pass: boolean }[] = [];

  // Meta title
  const titleLen = data.metaTitle.length;
  const titleOk = titleLen >= 30 && titleLen <= 60;
  checks.push({ label: "Meta title (30-60 chars)", pass: titleOk });
  if (titleOk) score += 20;
  else if (titleLen > 0) score += 10;

  // Meta description
  const descLen = data.metaDescription.length;
  const descOk = descLen >= 120 && descLen <= 160;
  checks.push({ label: "Meta description (120-160 chars)", pass: descOk });
  if (descOk) score += 20;
  else if (descLen > 0) score += 10;

  // OG Image
  const hasOg = !!data.ogImage;
  checks.push({ label: "Open Graph image", pass: hasOg });
  if (hasOg) score += 20;

  // Canonical URL
  const hasCanonical = !!data.canonicalUrl;
  checks.push({ label: "Canonical URL", pass: hasCanonical });
  if (hasCanonical) score += 15;

  // Structured data
  const hasSchema = !!data.structuredData;
  checks.push({ label: "Schema.org structured data", pass: hasSchema });
  if (hasSchema) score += 15;

  // No index check
  if (data.noIndex) {
    checks.push({ label: "Page is set to noindex", pass: false });
    score = Math.max(0, score - 10);
  }

  // Bilingual check (simple heuristic)
  const hasBilingual = data.metaTitle.includes("|") || data.metaDescription.includes("|");
  checks.push({ label: "Bilingual content hint (EN|FR)", pass: hasBilingual });
  if (hasBilingual) score += 10;

  score = Math.min(100, score);

  const color =
    score >= 80 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-red-500";
  const bgColor =
    score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">SEO Score</span>
        <span className={`text-2xl font-bold ${color}`}>{score}/100</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${bgColor} rounded-full transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="space-y-1.5">
        {checks.map((check, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            {check.pass ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            )}
            <span className={check.pass ? "text-muted-foreground" : "text-foreground"}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main SEO Editor Panel
// ============================================================================
export default function SeoEditorPanel({
  pageId,
  open,
  onClose,
  onMediaLibraryOpen,
}: SeoEditorPanelProps) {
  // toast imported from sonner at top level
  const utils = trpc.useUtils();

  // Fetch SEO data
  const { data: seoData, isLoading } = trpc.seo.getSeo.useQuery(
    { pageId },
    { enabled: open && !!pageId }
  );

  // Local state
  const [localData, setLocalData] = useState<SeoData>({
    metaTitle: "",
    metaDescription: "",
    ogImage: "",
    canonicalUrl: "",
    schemaType: "WebPage",
    ogTitle: "",
    ogDescription: "",
    twitterCard: "summary_large_image",
    noIndex: false,
    structuredData: null,
    pageTitle: "",
    pageSlug: "",
  });
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState("search");

  // Sync fetched data to local state
  useEffect(() => {
    if (seoData) {
      setLocalData({
        metaTitle: seoData.metaTitle || "",
        metaDescription: seoData.metaDescription || "",
        ogImage: seoData.ogImage || "",
        canonicalUrl: seoData.canonicalUrl || "",
        schemaType: seoData.schemaType || "WebPage",
        ogTitle: seoData.ogTitle || "",
        ogDescription: seoData.ogDescription || "",
        twitterCard: seoData.twitterCard || "summary_large_image",
        noIndex: seoData.noIndex || false,
        structuredData: seoData.structuredData || null,
        pageTitle: seoData.pageTitle || "",
        pageSlug: seoData.pageSlug || "",
      });
      setIsDirty(false);
    }
  }, [seoData]);

  // Update local field
  const updateField = useCallback((field: keyof SeoData, value: any) => {
    setLocalData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  // Save mutation
  const updateSeoMut = trpc.seo.updateSeo.useMutation({
    onSuccess: () => {
      toast.success("SEO settings updated successfully.");
      setIsDirty(false);
      utils.seo.getSeo.invalidate({ pageId });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // Generate structured data mutation
  const generateSchemaMut = trpc.seo.generateStructuredData.useMutation({
    onSuccess: (result) => {
      setLocalData((prev) => ({ ...prev, structuredData: result.structuredData }));
      setIsDirty(true);
      toast.success("Structured data generated from page content.");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSave = () => {
    updateSeoMut.mutate({
      pageId,
      metaTitle: localData.metaTitle,
      metaDescription: localData.metaDescription,
      ogImage: localData.ogImage,
      canonicalUrl: localData.canonicalUrl,
      schemaType: localData.schemaType as SchemaType,
      ogTitle: localData.ogTitle,
      ogDescription: localData.ogDescription,
      twitterCard: localData.twitterCard as TwitterCard,
      noIndex: localData.noIndex,
      structuredData: localData.structuredData,
    });
  };

  const handleGenerateSchema = () => {
    generateSchemaMut.mutate({
      pageId,
      schemaType: localData.schemaType as SchemaType,
    });
  };

  const baseUrl = "https://www.rusingacademy.ca";
  const pageUrl = localData.canonicalUrl || `${baseUrl}/${localData.pageSlug}`;

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[900px] max-h-[85vh] overflow-hidden flex flex-col z-[200]">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              SEO Editor — {localData.pageTitle || "Page"}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {isDirty && (
                <Badge variant="outline" className="text-amber-600 border-amber-300">
                  Unsaved changes
                </Badge>
              )}
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!isDirty || updateSeoMut.isPending}
              >
                {updateSeoMut.isPending ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-1" />
                )}
                Save SEO
              </Button>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex gap-4">
            {/* Left: Editor */}
            <div className="flex-1 overflow-y-auto pr-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full grid grid-cols-3 mb-4">
                  <TabsTrigger value="search" className="text-xs">
                    <Search className="w-3.5 h-3.5 mr-1" />
                    Search
                  </TabsTrigger>
                  <TabsTrigger value="social" className="text-xs">
                    <Share2 className="w-3.5 h-3.5 mr-1" />
                    Social
                  </TabsTrigger>
                  <TabsTrigger value="schema" className="text-xs">
                    <Code2 className="w-3.5 h-3.5 mr-1" />
                    Schema
                  </TabsTrigger>
                </TabsList>

                {/* SEARCH TAB */}
                <TabsContent value="search" className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Meta Title</Label>
                    <Input
                      value={localData.metaTitle}
                      onChange={(e) => updateField("metaTitle", e.target.value)}
                      placeholder={localData.pageTitle || "Enter meta title..."}
                      maxLength={120}
                    />
                    <CharCount current={localData.metaTitle.length} max={60} label="Recommended: 30-60 characters" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Tip: Include bilingual keywords with "|" separator (e.g., "Training Programs | Programmes de formation")
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Meta Description</Label>
                    <Textarea
                      value={localData.metaDescription}
                      onChange={(e) => updateField("metaDescription", e.target.value)}
                      placeholder="Describe this page for search engines..."
                      rows={3}
                      maxLength={320}
                    />
                    <CharCount current={localData.metaDescription.length} max={160} label="Recommended: 120-160 characters" />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Canonical URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={localData.canonicalUrl}
                        onChange={(e) => updateField("canonicalUrl", e.target.value)}
                        placeholder={`${baseUrl}/${localData.pageSlug}`}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateField("canonicalUrl", `${baseUrl}/${localData.pageSlug}`)}
                        title="Auto-fill from page slug"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Prevents duplicate content issues between EN/FR versions
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">No Index</Label>
                      <p className="text-xs text-muted-foreground">
                        Hide this page from search engines
                      </p>
                    </div>
                    <Switch
                      checked={localData.noIndex}
                      onCheckedChange={(v) => updateField("noIndex", v)}
                    />
                  </div>

                  {/* Google Preview */}
                  <div>
                    <Label className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      Google Snippet Preview
                    </Label>
                    <GoogleSnippetPreview
                      title={localData.metaTitle || localData.pageTitle}
                      url={pageUrl}
                      description={localData.metaDescription}
                    />
                  </div>
                </TabsContent>

                {/* SOCIAL TAB */}
                <TabsContent value="social" className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">OG Title (Facebook/LinkedIn)</Label>
                    <Input
                      value={localData.ogTitle}
                      onChange={(e) => updateField("ogTitle", e.target.value)}
                      placeholder={localData.metaTitle || "Same as meta title if empty"}
                      maxLength={120}
                    />
                    <CharCount current={localData.ogTitle.length} max={60} label="Recommended: 30-60 characters" />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">OG Description</Label>
                    <Textarea
                      value={localData.ogDescription}
                      onChange={(e) => updateField("ogDescription", e.target.value)}
                      placeholder={localData.metaDescription || "Same as meta description if empty"}
                      rows={2}
                      maxLength={320}
                    />
                    <CharCount current={localData.ogDescription.length} max={160} label="Recommended: up to 160 characters" />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">OG Image</Label>
                    <div className="flex gap-2">
                      <Input
                        value={localData.ogImage}
                        onChange={(e) => updateField("ogImage", e.target.value)}
                        placeholder="https://... (1200x630px recommended)"
                        className="flex-1"
                      />
                      {onMediaLibraryOpen && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            onMediaLibraryOpen((url) => updateField("ogImage", url))
                          }
                        >
                          <ImagePlus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: 1200×630px for optimal display on Facebook and LinkedIn
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Twitter Card Type</Label>
                    <Select
                      value={localData.twitterCard}
                      onValueChange={(v) => updateField("twitterCard", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="summary_large_image">Large Image Card</SelectItem>
                        <SelectItem value="summary">Summary Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Social Previews */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Facebook className="w-4 h-4 text-blue-600" />
                      Facebook Preview
                    </Label>
                    <SocialCardPreview
                      platform="facebook"
                      title={localData.ogTitle || localData.metaTitle || localData.pageTitle}
                      description={localData.ogDescription || localData.metaDescription}
                      image={localData.ogImage}
                      url={pageUrl}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Twitter className="w-4 h-4 text-sky-500" />
                      Twitter/X Preview
                    </Label>
                    <SocialCardPreview
                      platform="twitter"
                      title={localData.ogTitle || localData.metaTitle || localData.pageTitle}
                      description={localData.ogDescription || localData.metaDescription}
                      image={localData.ogImage}
                      url={pageUrl}
                    />
                  </div>
                </TabsContent>

                {/* SCHEMA TAB */}
                <TabsContent value="schema" className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Schema.org Type</Label>
                    <Select
                      value={localData.schemaType}
                      onValueChange={(v) => updateField("schemaType", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WebPage">WebPage (default)</SelectItem>
                        <SelectItem value="Course">Course (for training programs)</SelectItem>
                        <SelectItem value="Article">Article (for blog/news)</SelectItem>
                        <SelectItem value="Organization">Organization (for about pages)</SelectItem>
                        <SelectItem value="FAQPage">FAQ Page</SelectItem>
                        <SelectItem value="Service">Service (for service offerings)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Helps Google understand the page type for rich snippets
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleGenerateSchema}
                    disabled={generateSchemaMut.isPending}
                    className="w-full"
                  >
                    {generateSchemaMut.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Auto-Generate Structured Data
                  </Button>

                  {localData.structuredData && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-1">
                        <Code2 className="w-4 h-4" />
                        JSON-LD Preview
                      </Label>
                      <div className="bg-slate-900 rounded-lg p-3 overflow-auto max-h-[300px]">
                        <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap">
                          {JSON.stringify(localData.structuredData, null, 2)}
                        </pre>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              JSON.stringify(localData.structuredData, null, 2)
                            );
                            toast.success("JSON-LD copied to clipboard");
                          }}
                        >
                          Copy JSON-LD
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `https://search.google.com/test/rich-results?url=${encodeURIComponent(pageUrl)}`,
                              "_blank"
                            )
                          }
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1" />
                          Test in Google
                        </Button>
                      </div>
                    </div>
                  )}

                  {!localData.structuredData && (
                    <div className="text-center py-6 text-muted-foreground">
                      <Code2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No structured data yet</p>
                      <p className="text-xs">Click "Auto-Generate" to create schema.org data from your page content</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Right: SEO Score */}
            <div className="w-[220px] flex-shrink-0 border-l pl-4 overflow-y-auto">
              <SeoScore data={localData} />

              <div className="mt-6 pt-4 border-t space-y-3">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  Quick Tips
                </h4>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Bilingual SEO:</strong> Use "|" to separate EN/FR in titles for broader keyword coverage.
                  </p>
                  <p>
                    <strong className="text-foreground">OG Image:</strong> Use 1200×630px images for optimal social sharing across all platforms.
                  </p>
                  <p>
                    <strong className="text-foreground">Canonical URL:</strong> Set this to prevent duplicate content between language versions.
                  </p>
                  <p>
                    <strong className="text-foreground">Course Schema:</strong> Use "Course" type for training pages to get rich snippets in Google.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
