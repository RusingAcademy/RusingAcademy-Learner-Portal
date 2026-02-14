import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CoachDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("students");

  const students = trpc.coach.getStudents.useQuery();
  const myCoach = trpc.coach.getMyCoach.useQuery();
  const updateAssignment = trpc.coach.updateAssignment.useMutation({
    onSuccess: () => { students.refetch(); toast.success("Assignment updated"); },
  });

  const isCoach = user?.role === "admin";

  return (
    <div className="container max-w-5xl py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {isCoach ? "Coach Dashboard" : "My Coach"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isCoach ? "Manage your students and track their progress" : "View your coach assignment and progress feedback"}
        </p>
      </div>

      {isCoach ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="students">My Students ({students.data?.length || 0})</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="feedback">Feedback Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-4">
            {!students.data?.length ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="text-4xl mb-3">👨‍🏫</div>
                  <h3 className="font-semibold">No students assigned yet</h3>
                  <p className="text-muted-foreground text-sm mt-1">Students will appear here when assigned to you</p>
                </CardContent>
              </Card>
            ) : (
              students.data.map((assignment) => (
                <Card key={assignment.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {assignment.studentId}
                        </div>
                        <div>
                          <h4 className="font-medium">Student #{assignment.studentId}</h4>
                          <p className="text-sm text-muted-foreground">
                            Assigned {new Date(assignment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={assignment.status === "active" ? "default" : "secondary"}>
                          {assignment.status}
                        </Badge>
                        {assignment.status === "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAssignment.mutate({ id: assignment.id, status: "paused" })}
                          >
                            Pause
                          </Button>
                        )}
                        {assignment.status === "paused" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAssignment.mutate({ id: assignment.id, status: "active" })}
                          >
                            Resume
                          </Button>
                        )}
                      </div>
                    </div>
                    {assignment.notes && (
                      <p className="mt-2 text-sm text-muted-foreground bg-muted p-2 rounded">{assignment.notes}</p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-primary">{students.data?.length || 0}</div>
                  <p className="text-sm text-muted-foreground mt-1">Active Students</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-amber-500">
                    {students.data?.filter(s => s.status === "active").length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Currently Active</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-green-500">
                    {students.data?.filter(s => s.status === "completed").length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Completed</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Feedback Tools</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Use these tools to provide personalized feedback to your students.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => toast.info("Navigate to Writing Portfolio to review submissions")}>
                    <CardContent className="pt-6 text-center space-y-2">
                      <div className="text-3xl">✍️</div>
                      <h4 className="font-medium">Review Writing</h4>
                      <p className="text-sm text-muted-foreground">Review and score student writing submissions</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => toast.info("Navigate to Mock SLE Exams to review results")}>
                    <CardContent className="pt-6 text-center space-y-2">
                      <div className="text-3xl">📝</div>
                      <h4 className="font-medium">Review Exams</h4>
                      <p className="text-sm text-muted-foreground">Review mock SLE exam results and provide guidance</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-4">
          {myCoach.data ? (
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                    👨‍🏫
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Coach #{myCoach.data.coachId}</h3>
                    <p className="text-sm text-muted-foreground">
                      Assigned since {new Date(myCoach.data.createdAt).toLocaleDateString()}
                    </p>
                    <Badge variant={myCoach.data.status === "active" ? "default" : "secondary"} className="mt-1">
                      {myCoach.data.status}
                    </Badge>
                  </div>
                </div>
                {myCoach.data.notes && (
                  <div className="mt-4 bg-muted p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">Coach Notes:</p>
                    <p className="text-sm text-muted-foreground">{myCoach.data.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-4xl mb-3">🎓</div>
                <h3 className="font-semibold">No coach assigned yet</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  A coach will be assigned to guide your learning journey
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
