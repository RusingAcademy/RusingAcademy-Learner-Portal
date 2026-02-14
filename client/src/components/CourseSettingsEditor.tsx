/**
 * CourseSettingsEditor — Comprehensive course settings panel
 * 
 * Provides a tabbed interface for editing all course metadata:
 * - General: title, slug, description, short description, category, level, language
 * - Pricing: price, original price, access type, duration
 * - Media: thumbnail, preview video (Bunny Stream)
 * - SEO: meta title, meta description
 * - Features: certificate, quizzes, downloads
 * - Drip: drip content settings
 */
import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Save, Loader2, Settings2, DollarSign, Image as ImageIcon, Search,
  Award, Droplets, Eye, Globe, BookOpen, Clock, Users, Star,
  Video, Tag, FileText, Sparkles, ArrowLeft
} from "lucide-react";

interface CourseSettingsEditorProps {
  courseId: number;
  onBack: () => void;
}

const categoryLabels: Record<string, string> = {
  sle_oral: "SLE — Oral (B/C)",
  sle_written: "SLE — Written Expression (B/C)",
  sle_reading: "SLE — Reading Comprehension (B/C)",
  sle_complete: "SLE — Complete Preparation",
  business_french: "Business French",
  business_english: "Business English",
  exam_prep: "Exam Preparation",
  conversation: "Conversation Practice",
  grammar: "Grammar",
  vocabulary: "Vocabulary",
};

const levelLabels: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  all_levels: "All Levels",
};

export default function CourseSettingsEditor({ courseId, onBack }: CourseSettingsEditorProps) {
  const { data: course, isLoading, refetch } = trpc.admin.getCourseForEdit.useQuery({ courseId });

  // Local state for all editable fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [category, setCategory] = useState("sle_oral");
  const [level, setLevel] = useState("all_levels");
  const [targetLanguage, setTargetLanguage] = useState("french");
  const [price, setPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
  const [accessType, setAccessType] = useState("one_time");
  const [accessDurationDays, setAccessDurationDays] = useState<number | undefined>(undefined);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [previewVideoUrl, setPreviewVideoUrl] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [hasCertificate, setHasCertificate] = useState(true);
  const [hasQuizzes, setHasQuizzes] = useState(true);
  const [hasDownloads, setHasDownloads] = useState(true);
  const [dripEnabled, setDripEnabled] = useState(false);
  const [dripInterval, setDripInterval] = useState(7);
  const [dripUnit, setDripUnit] = useState("days");
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Populate from fetched data
  useEffect(() => {
    if (course) {
      setTitle(course.title || "");
      setDescription(course.description || "");
      setShortDescription(course.shortDescription || "");
      setCategory(course.category || "sle_oral");
      setLevel(course.level || "all_levels");
      setTargetLanguage(course.targetLanguage || "french");
      setPrice(course.price || 0);
      setOriginalPrice(course.originalPrice || undefined);
      setAccessType(course.accessType || "one_time");
      setAccessDurationDays(course.accessDurationDays || undefined);
      setThumbnailUrl(course.thumbnailUrl || "");
      setPreviewVideoUrl(course.previewVideoUrl || "");
      setMetaTitle(course.metaTitle || "");
      setMetaDescription(course.metaDescription || "");
      setHasCertificate(course.hasCertificate ?? true);
      setHasQuizzes(course.hasQuizzes ?? true);
      setHasDownloads(course.hasDownloads ?? true);
      setDripEnabled(course.dripEnabled ?? false);
      setDripInterval(course.dripInterval || 7);
      setDripUnit(course.dripUnit || "days");
      setIsDirty(false);
    }
  }, [course]);

  const markDirty = useCallback(() => setIsDirty(true), []);

  const updateCourse = trpc.admin.updateCourse.useMutation({
    onSuccess: () => {
      toast.success("Course settings saved");
      setIsDirty(false);
      refetch();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleSave = () => {
    updateCourse.mutate({
      courseId,
      title,
      description,
      shortDescription,
      category: category as any,
      level: level as any,
      targetLanguage: targetLanguage as any,
      price,
      originalPrice: originalPrice || undefined,
      accessType: accessType as any,
      accessDurationDays: accessDurationDays || undefined,
      thumbnailUrl: thumbnailUrl || undefined,
      previewVideoUrl: previewVideoUrl || undefined,
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
      hasCertificate,
      hasQuizzes,
      hasDownloads,
      dripEnabled,
      dripInterval,
      dripUnit: dripUnit as any,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading course settings...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>Course not found</p>
        <Button variant="outline" className="mt-4" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>
    );
  }

  const priceInDollars = price / 100;
  const originalPriceInDollars = originalPrice ? originalPrice / 100 : undefined;
  const discount = originalPrice && price < originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">Course Settings</h2>
            <p className="text-sm text-muted-foreground">{course.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-900/20">
              Unsaved changes
            </Badge>
          )}
          <Button onClick={handleSave} disabled={!isDirty || updateCourse.isPending}>
            {updateCourse.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Settings
          </Button>
        </div>
      </div>

      {/* Course Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <BookOpen className="h-3 w-3" /> Modules
          </div>
          <p className="text-lg font-semibold">{course.totalModules || 0}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <FileText className="h-3 w-3" /> Lessons
          </div>
          <p className="text-lg font-semibold">{course.totalLessons || 0}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Clock className="h-3 w-3" /> Duration
          </div>
          <p className="text-lg font-semibold">{course.totalDurationMinutes || 0}m</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Users className="h-3 w-3" /> Enrolled
          </div>
          <p className="text-lg font-semibold">{course.totalEnrollments || 0}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Star className="h-3 w-3" /> Rating
          </div>
          <p className="text-lg font-semibold">{course.averageRating ? Number(course.averageRating).toFixed(1) : "—"}</p>
        </Card>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="general" className="text-xs"><Settings2 className="h-3 w-3 mr-1" /> General</TabsTrigger>
          <TabsTrigger value="pricing" className="text-xs"><DollarSign className="h-3 w-3 mr-1" /> Pricing</TabsTrigger>
          <TabsTrigger value="media" className="text-xs"><ImageIcon className="h-3 w-3 mr-1" /> Media</TabsTrigger>
          <TabsTrigger value="seo" className="text-xs"><Search className="h-3 w-3 mr-1" /> SEO</TabsTrigger>
          <TabsTrigger value="features" className="text-xs"><Award className="h-3 w-3 mr-1" /> Features</TabsTrigger>
          <TabsTrigger value="drip" className="text-xs"><Droplets className="h-3 w-3 mr-1" /> Drip</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-4 mt-4">
          <div>
            <Label>Course Title</Label>
            <Input value={title} onChange={(e) => { setTitle(e.target.value); markDirty(); }} placeholder="e.g., SLE Oral Exam Preparation — Level B" />
            <p className="text-xs text-muted-foreground mt-1">{title.length}/200 characters</p>
          </div>
          <div>
            <Label>Short Description</Label>
            <Textarea value={shortDescription} onChange={(e) => { setShortDescription(e.target.value); markDirty(); }} placeholder="Brief summary for course cards..." rows={2} />
            <p className="text-xs text-muted-foreground mt-1">{shortDescription.length}/500 characters</p>
          </div>
          <div>
            <Label>Full Description</Label>
            <Textarea value={description} onChange={(e) => { setDescription(e.target.value); markDirty(); }} placeholder="Detailed course description..." rows={6} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => { setCategory(v); markDirty(); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Level</Label>
              <Select value={level} onValueChange={(v) => { setLevel(v); markDirty(); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(levelLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Target Language</Label>
              <Select value={targetLanguage} onValueChange={(v) => { setTargetLanguage(v); markDirty(); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="both">Bilingual (FR/EN)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/courses/</span>
              <Input value={course.slug} disabled className="bg-muted" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Slug is set at creation and cannot be changed.</p>
          </div>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Access Type</CardTitle>
              <CardDescription>How learners access this course</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={accessType} onValueChange={(v) => { setAccessType(v); markDirty(); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="one_time">One-time Purchase</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                </SelectContent>
              </Select>
              {accessType !== "free" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Price (CAD)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={priceInDollars}
                        onChange={(e) => { setPrice(Math.round(Number(e.target.value) * 100)); markDirty(); }}
                        className="pl-8"
                        min={0}
                        step={0.01}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Original Price (CAD) <span className="text-muted-foreground text-xs">— for strikethrough</span></Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={originalPriceInDollars || ""}
                        onChange={(e) => { setOriginalPrice(e.target.value ? Math.round(Number(e.target.value) * 100) : undefined); markDirty(); }}
                        className="pl-8"
                        min={0}
                        step={0.01}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>
              )}
              {discount && (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {discount}% discount displayed
                </Badge>
              )}
              {accessType !== "free" && (
                <div>
                  <Label>Access Duration (days)</Label>
                  <Input
                    type="number"
                    value={accessDurationDays || ""}
                    onChange={(e) => { setAccessDurationDays(e.target.value ? Number(e.target.value) : undefined); markDirty(); }}
                    placeholder="Leave empty for lifetime access"
                    min={1}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {accessDurationDays ? `Learners will have ${accessDurationDays} days of access after purchase.` : "Learners will have lifetime access."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Course Thumbnail</CardTitle>
              <CardDescription>Recommended: 1280x720px (16:9 ratio)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input value={thumbnailUrl} onChange={(e) => { setThumbnailUrl(e.target.value); markDirty(); }} placeholder="https://..." />
              {thumbnailUrl && (
                <div className="relative aspect-video w-full max-w-sm rounded-lg overflow-hidden border bg-muted">
                  <img src={thumbnailUrl} alt="Course thumbnail" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preview Video</CardTitle>
              <CardDescription>Free preview video shown on the course landing page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input value={previewVideoUrl} onChange={(e) => { setPreviewVideoUrl(e.target.value); markDirty(); }} placeholder="https://..." />
              {previewVideoUrl && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Video className="h-4 w-4" />
                  <span>Preview video configured</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Search Engine Optimization</CardTitle>
              <CardDescription>Optimize how this course appears in search results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Meta Title</Label>
                <Input value={metaTitle} onChange={(e) => { setMetaTitle(e.target.value); markDirty(); }} placeholder={title || "Course title..."} />
                <p className="text-xs text-muted-foreground mt-1">{metaTitle.length}/60 characters {metaTitle.length > 60 && "⚠️ Too long"}</p>
              </div>
              <div>
                <Label>Meta Description</Label>
                <Textarea value={metaDescription} onChange={(e) => { setMetaDescription(e.target.value); markDirty(); }} placeholder={shortDescription || "Brief description for search results..."} rows={3} />
                <p className="text-xs text-muted-foreground mt-1">{metaDescription.length}/160 characters {metaDescription.length > 160 && "⚠️ Too long"}</p>
              </div>
              {/* Google Snippet Preview */}
              <div className="border rounded-lg p-4 bg-white dark:bg-zinc-900">
                <p className="text-xs text-muted-foreground mb-2">Google Snippet Preview</p>
                <div className="space-y-0.5">
                  <p className="text-blue-600 dark:text-blue-400 text-base hover:underline cursor-pointer truncate">
                    {metaTitle || title || "Course Title"}
                  </p>
                  <p className="text-green-700 dark:text-green-500 text-xs truncate">
                    rusingacademy.ca/courses/{course.slug}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {metaDescription || shortDescription || "Course description will appear here..."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Course Features</CardTitle>
              <CardDescription>Toggle features displayed on the course page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium">Certificate of Completion</p>
                    <p className="text-xs text-muted-foreground">Award a certificate when learners complete the course</p>
                  </div>
                </div>
                <Switch checked={hasCertificate} onCheckedChange={(v) => { setHasCertificate(v); markDirty(); }} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Quizzes & Assessments</p>
                    <p className="text-xs text-muted-foreground">Include quiz activities for knowledge testing</p>
                  </div>
                </div>
                <Switch checked={hasQuizzes} onCheckedChange={(v) => { setHasQuizzes(v); markDirty(); }} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Downloadable Resources</p>
                    <p className="text-xs text-muted-foreground">Allow learners to download course materials</p>
                  </div>
                </div>
                <Switch checked={hasDownloads} onCheckedChange={(v) => { setHasDownloads(v); markDirty(); }} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drip Tab */}
        <TabsContent value="drip" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Drip Content</CardTitle>
              <CardDescription>Release modules progressively over time instead of all at once</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Enable Drip Content</p>
                  <p className="text-xs text-muted-foreground">Modules will unlock sequentially based on the schedule below</p>
                </div>
                <Switch checked={dripEnabled} onCheckedChange={(v) => { setDripEnabled(v); markDirty(); }} />
              </div>
              {dripEnabled && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Interval</Label>
                      <Input type="number" value={dripInterval} onChange={(e) => { setDripInterval(Number(e.target.value)); markDirty(); }} min={1} />
                    </div>
                    <div>
                      <Label>Unit</Label>
                      <Select value={dripUnit} onValueChange={(v) => { setDripUnit(v); markDirty(); }}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="weeks">Weeks</SelectItem>
                          <SelectItem value="months">Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      <Droplets className="h-3 w-3 inline mr-1" />
                      Each module will unlock every <strong>{dripInterval} {dripUnit}</strong> after the learner enrolls.
                      {course.totalModules > 0 && (
                        <> Total course duration: <strong>{dripInterval * (course.totalModules || 1)} {dripUnit}</strong>.</>
                      )}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Floating Save Bar */}
      {isDirty && (
        <div className="sticky bottom-4 flex justify-end">
          <Button onClick={handleSave} disabled={updateCourse.isPending} size="lg" className="shadow-lg">
            {updateCourse.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save All Settings
          </Button>
        </div>
      )}
    </div>
  );
}
