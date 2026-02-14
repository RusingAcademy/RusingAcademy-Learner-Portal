import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Clock, Lock, Unlock, Calendar, Zap, Settings } from "lucide-react";

export default function DripContent() {
  const [selectedCourse] = useState(1);
  const [cadence, setCadence] = useState<string>("weekly");

  const scheduleQuery = trpc.dripContent.getSchedule.useQuery({ courseId: selectedCourse });
  const setBulkMutation = trpc.dripContent.setBulkSchedule.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Updated ${data.lessonsUpdated} lessons with ${cadence} cadence.`);
      scheduleQuery.refetch();
    },
  });
  const setScheduleMutation = trpc.dripContent.setSchedule.useMutation({
    onSuccess: () => {
      toast.success("Lesson schedule updated.");
      scheduleQuery.refetch();
    },
  });

  const lessons = useMemo(() => scheduleQuery.data || [], [scheduleQuery.data]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Drip Content Scheduler</h2>
          <p className="text-muted-foreground">Control when learners access each lesson. Progressive unlocking keeps engagement high.</p>
        </div>
        <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> {lessons.length} lessons</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-amber-500" /> Quick Schedule</CardTitle>
          <CardDescription>Apply a cadence to all lessons in this course at once.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Select value={cadence} onValueChange={setCadence}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="every_3_days">Every 3 Days</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="biweekly">Biweekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => setBulkMutation.mutate({ courseId: selectedCourse, cadence: cadence as any })}
            disabled={setBulkMutation.isPending}
          >
            {setBulkMutation.isPending ? "Applying..." : "Apply to All Lessons"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Lesson Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {scheduleQuery.isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading schedule...</div>
          ) : lessons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No lessons found for this course. Add lessons in the Course Builder first.</div>
          ) : (
            <div className="space-y-2">
              {(lessons as any[]).map((lesson: any, idx: number) => (
                <div key={lesson.id || idx} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {lesson.isLocked ? (
                      <Lock className="h-4 w-4 text-amber-500" />
                    ) : (
                      <Unlock className="h-4 w-4 text-green-500" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{lesson.title || `Lesson ${idx + 1}`}</p>
                      <p className="text-xs text-muted-foreground">{lesson.moduleName || "Module"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {lesson.unlockType === "days_after_enrollment" && (
                      <Badge variant="secondary" className="gap-1">
                        <Calendar className="h-3 w-3" /> Day {lesson.unlockAfterDays}
                      </Badge>
                    )}
                    {lesson.unlockType === "date" && (
                      <Badge variant="secondary" className="gap-1">
                        <Calendar className="h-3 w-3" /> {new Date(lesson.unlockDate).toLocaleDateString()}
                      </Badge>
                    )}
                    {(!lesson.unlockType || lesson.unlockType === "immediate") && (
                      <Badge variant="outline">Immediate</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setScheduleMutation.mutate({
                        lessonId: lesson.id,
                        unlockType: lesson.isLocked ? "immediate" : "days_after_enrollment",
                        unlockAfterDays: lesson.isLocked ? 0 : (idx + 1) * 7,
                      })}
                    >
                      {lesson.isLocked ? "Unlock" : "Lock"}
                    </Button>
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
