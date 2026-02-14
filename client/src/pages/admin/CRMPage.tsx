import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { MessageSquare, Mail, Phone, Inbox } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function CRMPage() {
  const { data: inquiries, isLoading } = (trpc.admin as any).getLeadsWithScores.useQuery({ sortBy: "recent", limit: 50 });
  const allInquiries = (inquiries ?? []) as any[];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">CRM & Contacts</h1>
        <p className="text-sm text-muted-foreground">Manage leads, inquiries, and customer relationships.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><MessageSquare className="h-5 w-5 text-blue-600" /><div><p className="text-xl font-bold">{allInquiries.length}</p><p className="text-xs text-muted-foreground">Total Inquiries</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Mail className="h-5 w-5 text-green-600" /><div><p className="text-xl font-bold">{allInquiries.filter((i: any) => i.status === "replied").length}</p><p className="text-xs text-muted-foreground">Replied</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Phone className="h-5 w-5 text-amber-600" /><div><p className="text-xl font-bold">{allInquiries.filter((i: any) => i.status === "pending" || !i.status).length}</p><p className="text-xs text-muted-foreground">Pending</p></div></CardContent></Card>
      </div>
      <Card><CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : allInquiries.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No inquiries yet"
            description="Customer inquiries, contact form submissions, and lead data will appear here. Share your contact page to start receiving inquiries."
          />
        ) : (
          <div className="divide-y">{allInquiries.slice(0, 20).map((inq: any) => (
            <div key={inq.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{inq.name || inq.email || "Contact"}</p>
                <p className="text-sm text-muted-foreground">{inq.message?.substring(0, 80) || "No message"}...</p>
                <p className="text-xs text-muted-foreground mt-1">{inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : ""}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => toast("Reply feature coming soon")}>Reply</Button>
            </div>
          ))}</div>
        )}
      </CardContent></Card>
    </div>
  );
}
