import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import AdminSectionShell from "@/components/AdminSectionShell";
import AdminStatsGrid from "@/components/AdminStatsGrid";
import AdminEmptyState from "@/components/AdminEmptyState";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function AdminContentPipeline() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("pipeline");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [createDialog, setCreateDialog] = useState(false);
  const [newItem, setNewItem] = useState({ title: "", titleFr: "", contentType: "lesson", body: "" });

  const stats = trpc.admin.contentPipelineStats.useQuery();
  const items = trpc.admin.contentPipelineItems.useQuery({ status: statusFilter });
  const calendar = trpc.admin.contentCalendar.useQuery({});
  const quality = trpc.admin.contentQualityScores.useQuery();
  const templates = trpc.admin.contentTemplates.useQuery();
  const utils = trpc.useUtils();

  const updateStatus = trpc.admin.updateContentStatus.useMutation({
    onSuccess: () => {
      utils.admin.contentPipelineItems.invalidate();
      utils.admin.contentPipelineStats.invalidate();
      toast.success("Content status updated");
    },
  });

  const createItemMut = trpc.admin.createContentItem.useMutation({
    onSuccess: () => {
      utils.admin.contentPipelineItems.invalidate();
      utils.admin.contentPipelineStats.invalidate();
      setCreateDialog(false);
      setNewItem({ title: "", titleFr: "", contentType: "lesson", body: "" });
      toast.success("Content item created");
    },
  });

  if (user?.role !== "admin") {
    return <div className="p-8 text-center text-muted-foreground">Access denied</div>;
  }

  const s = stats.data;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <AdminSectionShell
        title="Content Pipeline"
        description="Manage content creation workflow, quality scores, and publishing calendar"
        actions={
          <Button className="bg-[#008090] hover:bg-[#006070]" onClick={() => setCreateDialog(true)}>
            New Content
          </Button>
        }
      >
        {/* Pipeline Stats */}
        {s && (
          <AdminStatsGrid
            stats={[
              { label: "Draft", value: s.draft, color: "text-gray-600" },
              { label: "In Review", value: s.review, color: "text-blue-600" },
              { label: "Approved", value: s.approved, color: "text-emerald-600" },
              { label: "Published", value: s.published, color: "text-green-600" },
              { label: "Archived", value: s.archived, color: "text-amber-600" },
            ]}
            columns={5}
          />
        )}

        {/* Pipeline Visual Bar */}
        {s && s.total > 0 && (
          <Card className="border border-gray-100">
            <CardContent className="p-4">
              <div className="flex h-4 rounded-full overflow-hidden bg-gray-100">
                {[
                  { count: s.draft, color: "#9ca3af", label: "Draft" },
                  { count: s.review, color: "#3b82f6", label: "Review" },
                  { count: s.approved, color: "#10b981", label: "Approved" },
                  { count: s.published, color: "#16a34a", label: "Published" },
                  { count: s.archived, color: "#f59e0b", label: "Archived" },
                ].map((seg, i) =>
                  seg.count > 0 ? (
                    <div
                      key={i}
                      className="h-full transition-all"
                      style={{ width: `${(seg.count / s.total) * 100}%`, backgroundColor: seg.color }}
                      title={`${seg.label}: ${seg.count}`}
                    />
                  ) : null
                )}
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Draft ({s.draft})</span>
                <span>Review ({s.review})</span>
                <span>Approved ({s.approved})</span>
                <span>Published ({s.published})</span>
                <span>Archived ({s.archived})</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          {/* Pipeline Items */}
          <TabsContent value="pipeline" className="space-y-4">
            <div className="flex gap-2 mb-4 flex-wrap">
              {["all", "draft", "review", "approved", "published", "archived"].map((f) => (
                <Button
                  key={f}
                  variant={statusFilter === (f === "all" ? undefined : f) ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(f === "all" ? undefined : f)}
                  className={statusFilter === (f === "all" ? undefined : f) ? "bg-[#008090]" : ""}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Button>
              ))}
            </div>
            {!items.data || items.data.length === 0 ? (
              <AdminEmptyState
                title="No Content Items"
                description="Create your first content item to start the pipeline."
                action={{ label: "Create Content", onClick: () => setCreateDialog(true) }}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.data.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.title}</p>
                          {item.titleFr && <p className="text-xs text-muted-foreground">{item.titleFr}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{item.contentType}</TableCell>
                      <TableCell><StatusBadge variant={item.status} /></TableCell>
                      <TableCell>
                        {item.qualityScore != null ? (
                          <span className={item.qualityScore >= 80 ? "text-green-600 font-medium" : item.qualityScore >= 60 ? "text-amber-600" : "text-red-500"}>
                            {item.qualityScore}/100
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {item.status === "draft" && (
                            <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: item.id, status: "review" })}>
                              Submit
                            </Button>
                          )}
                          {item.status === "review" && (
                            <>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => updateStatus.mutate({ id: item.id, status: "approved" })}>
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: item.id, status: "draft" })}>
                                Return
                              </Button>
                            </>
                          )}
                          {item.status === "approved" && (
                            <Button size="sm" className="bg-[#008090] hover:bg-[#006070] text-white" onClick={() => updateStatus.mutate({ id: item.id, status: "published" })}>
                              Publish
                            </Button>
                          )}
                          {item.status === "published" && (
                            <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: item.id, status: "archived" })}>
                              Archive
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          {/* Calendar */}
          <TabsContent value="calendar" className="space-y-4">
            {!calendar.data || calendar.data.length === 0 ? (
              <AdminEmptyState title="No Calendar Entries" description="No content is scheduled for the upcoming period." />
            ) : (
              <div className="space-y-3">
                {calendar.data.map((entry: any, i: number) => (
                  <Card key={i} className="border border-gray-100">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{entry.title ?? `Calendar Entry #${entry.id}`}</p>
                        <p className="text-xs text-muted-foreground capitalize">{entry.eventType ?? "scheduled"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {entry.scheduledDate ? new Date(entry.scheduledDate).toLocaleDateString() : "—"}
                        </p>
                        <StatusBadge variant={entry.status ?? "draft"} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Quality Scores */}
          <TabsContent value="quality" className="space-y-4">
            {!quality.data || quality.data.length === 0 ? (
              <AdminEmptyState title="No Quality Scores" description="Quality scores will appear once content is reviewed." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quality Score</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quality.data.map((q: any) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">{q.title}</TableCell>
                      <TableCell className="capitalize">{q.contentType}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${q.qualityScore}%`,
                                backgroundColor: q.qualityScore >= 80 ? "#16a34a" : q.qualityScore >= 60 ? "#d97706" : "#dc2626",
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium">{q.qualityScore}/100</span>
                        </div>
                      </TableCell>
                      <TableCell><StatusBadge variant={q.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          {/* Templates */}
          <TabsContent value="templates" className="space-y-4">
            {!templates.data || templates.data.length === 0 ? (
              <AdminEmptyState title="No Templates" description="Content templates will appear once they are created." />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.data.map((t: any) => (
                  <Card key={t.id} className="border border-gray-100">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{t.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {t.description && <p className="text-muted-foreground">{t.description}</p>}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category</span>
                        <span className="capitalize">{t.category ?? "general"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Language</span>
                        <span>{t.language === "fr" ? "French" : t.language === "en" ? "English" : "Bilingual"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Usage</span>
                        <span>{t.usageCount ?? 0} times</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Create Content Dialog */}
        <Dialog open={createDialog} onOpenChange={setCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Content Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="Title (English)"
                value={newItem.title}
                onChange={(e) => setNewItem((p) => ({ ...p, title: e.target.value }))}
              />
              <Input
                placeholder="Titre (Français)"
                value={newItem.titleFr}
                onChange={(e) => setNewItem((p) => ({ ...p, titleFr: e.target.value }))}
              />
              <Select
                value={newItem.contentType}
                onValueChange={(v) => setNewItem((p) => ({ ...p, contentType: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Content Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lesson">Lesson</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="exercise">Exercise</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-[#008090]"
                disabled={!newItem.title.trim()}
                onClick={() =>
                  createItemMut.mutate({
                    title: newItem.title,
                    titleFr: newItem.titleFr || undefined,
                    contentType: newItem.contentType,
                    body: newItem.body || undefined,
                  })
                }
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminSectionShell>
    </div>
  );
}
