import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Mail, Plus, Search, Edit2, Trash2, Copy, Eye, Save,
  Loader2, FileText, Tag, Send, Code, Palette, Variable,
  ChevronRight, ToggleLeft
} from "lucide-react";

type EditorTab = "templates" | "editor" | "preview";

const VARIABLE_PRESETS = [
  { key: "{{student_name}}", label: "Student Name", example: "Jean Dupont" },
  { key: "{{student_email}}", label: "Student Email", example: "jean@example.com" },
  { key: "{{course_title}}", label: "Course Title", example: "SLE Preparation Intensive" },
  { key: "{{lesson_title}}", label: "Lesson Title", example: "Module 3: Oral Comprehension" },
  { key: "{{coach_name}}", label: "Coach Name", example: "Marie Tremblay" },
  { key: "{{date}}", label: "Current Date", example: new Date().toLocaleDateString() },
  { key: "{{platform_name}}", label: "Platform Name", example: "RusingÂcademy" },
  { key: "{{login_url}}", label: "Login URL", example: "https://app.rusingacademy.com/login" },
  { key: "{{progress_percent}}", label: "Progress %", example: "75%" },
  { key: "{{next_session_date}}", label: "Next Session", example: "Feb 15, 2026" },
  { key: "{{invoice_amount}}", label: "Invoice Amount", example: "$299.00" },
  { key: "{{coupon_code}}", label: "Coupon Code", example: "WELCOME20" },
];

const CATEGORIES = [
  { key: "welcome", label: "Welcome / Onboarding" },
  { key: "course", label: "Course Notifications" },
  { key: "coaching", label: "Coaching Sessions" },
  { key: "payment", label: "Payment & Invoices" },
  { key: "marketing", label: "Marketing & Promotions" },
  { key: "system", label: "System Notifications" },
  { key: "general", label: "General" },
];

export default function EmailTemplateBuilder() {
  const [activeTab, setActiveTab] = useState<EditorTab>("templates");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("general");

  // Form state for editor
  const [editorForm, setEditorForm] = useState({
    name: "",
    subject: "",
    bodyHtml: "",
    bodyText: "",
    category: "general",
    variables: "[]",
    isActive: true,
  });

  const listQuery = trpc.emailTemplates.list.useQuery({
    category: selectedCategory || undefined,
    search: searchQuery || undefined,
  });
  const createMut = trpc.emailTemplates.create.useMutation({ onSuccess: () => { listQuery.refetch(); toast.success("Template created"); } });
  const updateMut = trpc.emailTemplates.update.useMutation({ onSuccess: () => { listQuery.refetch(); toast.success("Template saved"); } });
  const deleteMut = trpc.emailTemplates.delete.useMutation({ onSuccess: () => { listQuery.refetch(); toast.success("Template deleted"); } });
  const duplicateMut = trpc.emailTemplates.duplicate.useMutation({ onSuccess: () => { listQuery.refetch(); toast.success("Template duplicated"); } });

  const templates = (listQuery.data as any[]) || [];

  const handleCreate = () => {
    if (!newName.trim()) { toast.error("Name required"); return; }
    createMut.mutate({ name: newName, category: newCategory });
    setShowCreateDialog(false);
    setNewName("");
  };

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setEditorForm({
      name: template.name || "",
      subject: template.subject || "",
      bodyHtml: template.bodyHtml || "",
      bodyText: template.bodyText || "",
      category: template.category || "general",
      variables: template.variables || "[]",
      isActive: Boolean(template.isActive),
    });
    setActiveTab("editor");
  };

  const handleSave = () => {
    if (!editingTemplate) return;
    updateMut.mutate({ id: editingTemplate.id, ...editorForm });
  };

  const insertVariable = (varKey: string) => {
    setEditorForm(prev => ({
      ...prev,
      bodyHtml: prev.bodyHtml + varKey,
    }));
    toast.info(`Inserted ${varKey}`);
  };

  // Replace variables with example values for preview
  const previewHtml = useMemo(() => {
    let html = editorForm.bodyHtml;
    VARIABLE_PRESETS.forEach(v => {
      html = html.replace(new RegExp(v.key.replace(/[{}]/g, "\\$&"), "g"), `<strong style="color:#0F3D3E">${v.example}</strong>`);
    });
    return html;
  }, [editorForm.bodyHtml]);

  const previewSubject = useMemo(() => {
    let subj = editorForm.subject;
    VARIABLE_PRESETS.forEach(v => {
      subj = subj.replace(new RegExp(v.key.replace(/[{}]/g, "\\$&"), "g"), v.example);
    });
    return subj;
  }, [editorForm.subject]);

  // ─── TEMPLATES LIST ───
  const renderTemplatesList = () => (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search templates..." className="pl-9" />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all-categories">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => setShowCreateDialog(true)} className="ml-auto"><Plus className="h-4 w-4 mr-2" /> New Template</Button>
      </div>

      {/* Templates Grid */}
      {listQuery.isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center"><Loader2 className="h-5 w-5 animate-spin" /> Loading...</div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="font-semibold mb-1">No email templates yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first template to start sending professional emails.</p>
            <Button onClick={() => setShowCreateDialog(true)}><Plus className="h-4 w-4 mr-2" /> Create Template</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl: any) => (
            <Card key={tpl.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <h3 className="font-semibold text-sm">{tpl.name}</h3>
                  </div>
                  <Badge variant={tpl.isActive ? "default" : "outline"} className="text-xs">
                    {tpl.isActive ? "Active" : "Draft"}
                  </Badge>
                </div>
                {tpl.subject && <p className="text-xs text-muted-foreground mb-2 truncate">Subject: {tpl.subject}</p>}
                <Badge variant="secondary" className="text-xs mb-3">{CATEGORIES.find(c => c.key === tpl.category)?.label || tpl.category}</Badge>
                <div className="flex gap-1 mt-3 pt-3 border-t">
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleEdit(tpl)}><Edit2 className="h-3 w-3 mr-1" /> Edit</Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => duplicateMut.mutate({ id: tpl.id })}><Copy className="h-3 w-3 mr-1" /> Duplicate</Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive ml-auto" onClick={() => { if (confirm("Delete this template?")) deleteMut.mutate({ id: tpl.id }); }}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // ─── EDITOR ───
  const renderEditor = () => (
    <div className="space-y-6">
      {!editingTemplate ? (
        <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">Select a template to edit, or create a new one.</p></CardContent></Card>
      ) : (
        <>
          {/* Editor Header */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setActiveTab("templates")}><ChevronRight className="h-4 w-4 rotate-180" /></Button>
              <div>
                <h2 className="font-semibold">{editorForm.name}</h2>
                <p className="text-xs text-muted-foreground">Editing template #{editingTemplate.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 mr-4">
                <Label className="text-xs">Active</Label>
                <Switch checked={editorForm.isActive} onCheckedChange={(v) => setEditorForm(p => ({ ...p, isActive: v }))} />
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}><Eye className="h-4 w-4 mr-1" /> Preview</Button>
              <Button size="sm" onClick={handleSave}><Save className="h-4 w-4 mr-1" /> Save</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Editor */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-sm">Template Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label>Template Name</Label><Input value={editorForm.name} onChange={(e) => setEditorForm(p => ({ ...p, name: e.target.value }))} /></div>
                    <div className="space-y-1.5"><Label>Category</Label>
                      <Select value={editorForm.category} onValueChange={(v) => setEditorForm(p => ({ ...p, category: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5"><Label>Subject Line</Label><Input value={editorForm.subject} onChange={(e) => setEditorForm(p => ({ ...p, subject: e.target.value }))} placeholder="e.g. Welcome to {{platform_name}}, {{student_name}}!" /></div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2"><Code className="h-4 w-4" /> Email Body (HTML)</CardTitle>
                  <CardDescription>Write your email content with HTML. Use variables like {"{{student_name}}"} for personalization.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea value={editorForm.bodyHtml} onChange={(e) => setEditorForm(p => ({ ...p, bodyHtml: e.target.value }))}
                    className="min-h-[300px] font-mono text-sm" placeholder={`<h1>Welcome, {{student_name}}!</h1>\n<p>Thank you for joining {{platform_name}}.</p>\n<p>Your course <strong>{{course_title}}</strong> is ready.</p>\n<a href="{{login_url}}">Start Learning</a>`} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-sm">Plain Text Version</CardTitle></CardHeader>
                <CardContent>
                  <Textarea value={editorForm.bodyText} onChange={(e) => setEditorForm(p => ({ ...p, bodyText: e.target.value }))}
                    className="min-h-[120px] text-sm" placeholder="Plain text fallback for email clients that don't support HTML..." />
                </CardContent>
              </Card>
            </div>

            {/* Variables Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Variable className="h-4 w-4" /> Dynamic Variables</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">Click to insert a variable into the email body.</p>
                  <div className="space-y-1.5">
                    {VARIABLE_PRESETS.map(v => (
                      <button key={v.key} onClick={() => insertVariable(v.key)}
                        className="w-full flex items-center justify-between p-2 rounded-md hover:bg-muted text-left transition-colors">
                        <div>
                          <p className="text-xs font-medium">{v.label}</p>
                          <code className="text-xs text-muted-foreground">{v.key}</code>
                        </div>
                        <Plus className="h-3 w-3 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Palette className="h-4 w-4" /> Quick Snippets</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { label: "CTA Button", code: `<a href="{{login_url}}" style="display:inline-block;padding:12px 24px;background:#0F3D3E;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">Start Learning</a>` },
                    { label: "Divider", code: `<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />` },
                    { label: "Footer", code: `<p style="font-size:12px;color:#6b7280;margin-top:32px;">© {{date}} {{platform_name}}. All rights reserved.</p>` },
                  ].map(snippet => (
                    <Button key={snippet.label} variant="outline" size="sm" className="w-full justify-start text-xs"
                      onClick={() => { setEditorForm(p => ({ ...p, bodyHtml: p.bodyHtml + "\n" + snippet.code })); toast.info(`Inserted ${snippet.label}`); }}>
                      <Code className="h-3 w-3 mr-2" /> {snippet.label}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );

  // ─── PREVIEW ───
  const renderPreviewContent = () => (
    <div className="space-y-6">
      {!editingTemplate ? (
        <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">Select a template to preview.</p></CardContent></Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Email Preview</CardTitle>
            <CardDescription>Preview with sample variable values.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              {/* Email Header */}
              <div className="p-4 bg-muted/50 border-b space-y-2">
                <div className="flex items-center gap-2 text-sm"><span className="text-muted-foreground w-16">From:</span><span className="font-medium">RusingÂcademy &lt;noreply@rusingacademy.com&gt;</span></div>
                <div className="flex items-center gap-2 text-sm"><span className="text-muted-foreground w-16">To:</span><span className="font-medium">Jean Dupont &lt;jean@example.com&gt;</span></div>
                <div className="flex items-center gap-2 text-sm"><span className="text-muted-foreground w-16">Subject:</span><span className="font-semibold">{previewSubject || "(No subject)"}</span></div>
              </div>
              {/* Email Body */}
              <div className="p-6 bg-white min-h-[300px]">
                {previewHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: previewHtml }} className="prose prose-sm max-w-none" style={{ color: "#1f2937" }} />
                ) : (
                  <p className="text-muted-foreground text-center py-8">No content yet. Add HTML in the editor.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const tabItems: { key: EditorTab; label: string; icon: any }[] = [
    { key: "templates", label: "Templates", icon: FileText },
    { key: "editor", label: "Editor", icon: Edit2 },
    { key: "preview", label: "Preview", icon: Eye },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1"><Mail className="h-6 w-6 text-pink-600" /><h1 className="text-2xl font-bold">Email Template Builder</h1></div>
        <p className="text-sm text-muted-foreground">Create and manage email templates with dynamic variables, HTML editor, and live preview.</p>
      </div>
      <div className="flex gap-1 mb-6 border-b">
        {tabItems.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <tab.icon className="h-4 w-4" /> {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "templates" && renderTemplatesList()}
      {activeTab === "editor" && renderEditor()}
      {activeTab === "preview" && renderPreviewContent()}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Email Template</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Template Name</Label><Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Welcome Email" /></div>
            <div className="space-y-1.5"><Label>Category</Label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleCreate}>Create Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Email Preview</DialogTitle></DialogHeader>
          {renderPreviewContent()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
