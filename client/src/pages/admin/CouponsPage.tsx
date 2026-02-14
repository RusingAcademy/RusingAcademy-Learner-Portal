import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Tag, Plus, MoreHorizontal, Trash2, Copy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function CouponsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const { data: coupons, isLoading, refetch } = trpc.admin.getCoupons.useQuery();
  const createCoupon = trpc.admin.createCoupon.useMutation({
    onSuccess: () => { toast("Coupon created"); setCreateOpen(false); setCode(""); setDiscount(""); refetch(); },
    onError: (e: any) => toast.error(e.message),
  });
  const deleteCoupon = trpc.admin.deleteCoupon.useMutation({
    onSuccess: () => { toast("Coupon deleted"); refetch(); },
  });

  const allCoupons = (coupons ?? []) as any[];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Coupons & Discounts</h1><p className="text-sm text-muted-foreground">Create and manage promotional codes.</p></div>
        <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> New Coupon</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><Tag className="h-5 w-5 text-purple-600" /><div><p className="text-xl font-bold">{allCoupons.length}</p><p className="text-xs text-muted-foreground">Total Coupons</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Tag className="h-5 w-5 text-green-600" /><div><p className="text-xl font-bold">{allCoupons.filter((c: any) => c.isActive !== false).length}</p><p className="text-xs text-muted-foreground">Active</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Tag className="h-5 w-5 text-gray-400" /><div><p className="text-xl font-bold">{allCoupons.filter((c: any) => c.isActive === false).length}</p><p className="text-xs text-muted-foreground">Expired</p></div></CardContent></Card>
      </div>

      <Card><CardContent className="p-0">
        {isLoading ? <div className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div> : allCoupons.length === 0 ? (
          <div className="p-8 text-center"><Tag className="h-10 w-10 text-muted-foreground mx-auto mb-3" /><p className="font-medium">No coupons yet</p><Button className="mt-3" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-1" /> Create Coupon</Button></div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/30"><th className="text-left p-3 font-medium">Code</th><th className="text-left p-3 font-medium">Discount</th><th className="text-left p-3 font-medium">Status</th><th className="text-left p-3 font-medium">Uses</th><th className="text-right p-3 font-medium">Actions</th></tr></thead>
            <tbody>{allCoupons.map((c: any) => (
              <tr key={c.id} className="border-b hover:bg-muted/20">
                <td className="p-3 font-mono font-medium">{c.code}</td>
                <td className="p-3">{c.discountType === "percentage" ? `${c.discountValue}%` : c.discountType === "fixed_amount" ? `$${c.discountValue}` : "Free Trial"}</td>
                <td className="p-3"><Badge variant={c.isActive !== false ? "default" : "secondary"}>{c.isActive !== false ? "Active" : "Inactive"}</Badge></td>
                <td className="p-3 text-muted-foreground">{c.usageCount ?? 0} / {c.maxUses ?? "∞"}</td>
                <td className="p-3 text-right">
                  <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(c.code); toast("Code copied!"); }}><Copy className="h-4 w-4 mr-2" /> Copy Code</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => deleteCoupon.mutate({ id: c.id })}><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </CardContent></Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}><DialogContent>
        <DialogHeader><DialogTitle>Create Coupon</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Code</Label><Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g., WELCOME20" /></div>
          <div><Label>Discount (%)</Label><Input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="e.g., 20" /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button><Button onClick={() => { if (!code || !discount) { toast.error("Fill all fields"); return; } createCoupon.mutate({ code, name: code, description: null, descriptionFr: null, discountType: "percentage", discountValue: Number(discount), maxUses: null, maxUsesPerUser: 1, minPurchaseAmount: null, validUntil: null, applicableTo: "all", newUsersOnly: false }); }} disabled={createCoupon.isPending}>{createCoupon.isPending ? "Creating..." : "Create"}</Button></DialogFooter>
      </DialogContent></Dialog>
    </div>
  );
}
