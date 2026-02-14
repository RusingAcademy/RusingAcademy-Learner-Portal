import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { DollarSign, CreditCard, Link2, Plus, MoreHorizontal, Edit, Trash2, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function PricingCheckout() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data: courses, isLoading } = trpc.admin.getAllCourses.useQuery();
  const allCourses = (Array.isArray(courses) ? courses : ((courses as any)?.courses ?? [])) as any[];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Pricing & Checkout</h1><p className="text-sm text-muted-foreground">Manage pricing plans, checkout flows, and payment links.</p></div>
        <Button size="sm" className="gap-1.5" onClick={() => toast("Create offer coming soon")}><Plus className="h-4 w-4" /> New Offer</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><DollarSign className="h-5 w-5 text-green-600" /><div><p className="text-xl font-bold">{allCourses.filter((c: any) => c.price).length}</p><p className="text-xs text-muted-foreground">Priced Products</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><CreditCard className="h-5 w-5 text-blue-600" /><div><p className="text-xl font-bold">Stripe</p><p className="text-xs text-muted-foreground">Payment Gateway</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Link2 className="h-5 w-5 text-purple-600" /><div><p className="text-xl font-bold">Active</p><p className="text-xs text-muted-foreground">Checkout Links</p></div></CardContent></Card>
      </div>

      <Card><CardContent className="p-0">
        {isLoading ? <div className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div> : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/30">
              <th className="text-left p-3 font-medium">Course</th>
              <th className="text-left p-3 font-medium">Price</th>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {allCourses.map((course: any) => (
                <tr key={course.id} className="border-b hover:bg-muted/20">
                  <td className="p-3 font-medium">{course.title}</td>
                  <td className="p-3">{course.price ? `$${(course.price / 100).toFixed(2)}` : <span className="text-muted-foreground">Free</span>}</td>
                  <td className="p-3"><Badge variant="secondary">{course.pricingType || "One-time"}</Badge></td>
                  <td className="p-3"><Badge variant={course.status === "published" ? "default" : "secondary"}>{course.status}</Badge></td>
                  <td className="p-3 text-right">
                    <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toast("Edit pricing coming soon")}><Edit className="h-4 w-4 mr-2" /> Edit Price</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast("Checkout link copied!")}><ExternalLink className="h-4 w-4 mr-2" /> Copy Checkout Link</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {allCourses.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No courses yet</td></tr>}
            </tbody>
          </table></div>
        )}
      </CardContent></Card>
    </div>
  );
}
