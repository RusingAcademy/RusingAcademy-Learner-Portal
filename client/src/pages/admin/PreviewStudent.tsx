import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, BookOpen, GraduationCap, ArrowLeft, Play } from "lucide-react";
import { useLocation } from "wouter";

export default function PreviewStudent() {
  const [, navigate] = useLocation();
  const { data: courses, isLoading } = trpc.admin.getAllCourses.useQuery();
  const courseList = Array.isArray(courses) ? courses : ((courses as any)?.courses ?? []);
  const published = (courseList as any[]).filter((c: any) => c.status === "published");
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}><ArrowLeft className="h-4 w-4" /></Button>
        <div><div className="flex items-center gap-2"><h1 className="text-2xl font-bold">Preview as Student</h1><Badge variant="secondary" className="gap-1"><Eye className="h-3 w-3" /> Student View</Badge></div><p className="text-sm text-muted-foreground">See what students see.</p></div>
      </div>
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800"><CardContent className="p-4 flex items-center gap-3"><Eye className="h-5 w-5 text-amber-600" /><p className="text-sm text-amber-800 dark:text-amber-200">Viewing as student. No admin controls visible.</p></CardContent></Card>
      <h2 className="text-lg font-semibold">Available Courses</h2>
      {isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-48" />)}</div> : published.length === 0 ? (
        <Card><CardContent className="p-8 text-center"><BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" /><p>No published courses</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{published.map((c: any) => (
          <Card key={c.id} className="hover:shadow-md transition-shadow"><CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3"><GraduationCap className="h-5 w-5" style={{ color: "var(--brand-foundation)" }} /><Badge variant="secondary">{c.category || "General"}</Badge></div>
            <h3 className="font-semibold mb-2">{c.title}</h3><p className="text-sm text-muted-foreground line-clamp-3 mb-4">{c.description || "No description"}</p>
            <div className="flex items-center justify-between"><span className="text-sm font-medium">{c.price ? `$${(c.price/100).toFixed(2)}` : "Free"}</span><Button size="sm" className="gap-1"><Play className="h-3.5 w-3.5" /> Enroll</Button></div>
          </CardContent></Card>
        ))}</div>
      )}
    </div>
  );
}
