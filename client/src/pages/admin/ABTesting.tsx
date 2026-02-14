import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { FlaskConical, Play, Pause, BarChart3, Plus, TrendingUp } from "lucide-react";

export default function ABTesting() {
  const [showCreate, setShowCreate] = useState(false);
  const [newTest, setNewTest] = useState({ name: "", lessonIdA: "", lessonIdB: "", metric: "completion_rate", trafficSplit: 50 });

  const statsQuery = trpc.abTesting.getStats.useQuery();
  const listQuery = trpc.abTesting.list.useQuery();
  const createMutation = trpc.abTesting.create.useMutation({
    onSuccess: () => {
      toast.success("A/B test created successfully.");
      setShowCreate(false);
      listQuery.refetch();
      statsQuery.refetch();
    },
  });
  const updateStatusMutation = trpc.abTesting.updateStatus.useMutation({
    onSuccess: () => {
      listQuery.refetch();
      statsQuery.refetch();
    },
  });

  const stats = (statsQuery.data || { total: 0, active: 0, completed: 0 }) as any;
  const tests = (listQuery.data || []) as any[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">A/B Content Testing</h2>
          <p className="text-muted-foreground">Compare lesson variants to optimize learner outcomes.</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Test</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create A/B Test</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <Input placeholder="Test name" value={newTest.name} onChange={(e) => setNewTest({ ...newTest, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <Input type="number" placeholder="Lesson A ID" value={newTest.lessonIdA} onChange={(e) => setNewTest({ ...newTest, lessonIdA: e.target.value })} />
                <Input type="number" placeholder="Lesson B ID" value={newTest.lessonIdB} onChange={(e) => setNewTest({ ...newTest, lessonIdB: e.target.value })} />
              </div>
              <Select value={newTest.metric} onValueChange={(v) => setNewTest({ ...newTest, metric: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="completion_rate">Completion Rate</SelectItem>
                  <SelectItem value="engagement_time">Engagement Time</SelectItem>
                  <SelectItem value="quiz_score">Quiz Score</SelectItem>
                  <SelectItem value="satisfaction">Satisfaction</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Traffic Split:</span>
                <Input type="number" min={10} max={90} className="w-20" value={newTest.trafficSplit} onChange={(e) => setNewTest({ ...newTest, trafficSplit: Number(e.target.value) })} />
                <span className="text-sm text-muted-foreground">% to Variant A</span>
              </div>
              <Button className="w-full" onClick={() => createMutation.mutate({
                name: newTest.name,
                lessonIdA: Number(newTest.lessonIdA),
                lessonIdB: Number(newTest.lessonIdB),
                metric: newTest.metric as any,
                trafficSplit: newTest.trafficSplit,
              })} disabled={createMutation.isPending || !newTest.name}>
                {createMutation.isPending ? "Creating..." : "Create Test"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6 text-center">
          <FlaskConical className="h-8 w-8 mx-auto mb-2 text-blue-500" />
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-sm text-muted-foreground">Total Tests</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <Play className="h-8 w-8 mx-auto mb-2 text-green-500" />
          <div className="text-2xl font-bold">{stats.active}</div>
          <p className="text-sm text-muted-foreground">Running</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-500" />
          <div className="text-2xl font-bold">{stats.completed}</div>
          <p className="text-sm text-muted-foreground">Completed</p>
        </CardContent></Card>
      </div>

      {/* Tests List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Tests</CardTitle>
          <CardDescription>Manage your content experiments</CardDescription>
        </CardHeader>
        <CardContent>
          {tests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No A/B tests yet. Create one to start optimizing your content.</div>
          ) : (
            <div className="space-y-3">
              {tests.map((test: any) => (
                <div key={test.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{test.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Lesson {test.lessonIdA} vs {test.lessonIdB} | {test.metric?.replace("_", " ")} | {test.trafficSplit}% split
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={test.status === "running" ? "default" : test.status === "completed" ? "secondary" : "outline"}>
                      {test.status}
                    </Badge>
                    {test.status === "draft" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ testId: test.id, status: "running" })}>
                        <Play className="h-3 w-3 mr-1" /> Start
                      </Button>
                    )}
                    {test.status === "running" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ testId: test.id, status: "paused" })}>
                        <Pause className="h-3 w-3 mr-1" /> Pause
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
