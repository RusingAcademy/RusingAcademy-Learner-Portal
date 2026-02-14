import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, Send, FileText, Users, Settings } from "lucide-react";

export default function EmailPage() {
  const items = [
    { title: "Email Templates", desc: "Create and manage reusable email templates", icon: FileText, action: "Manage Templates" },
    { title: "Broadcast", desc: "Send one-time emails to all users or segments", icon: Send, action: "New Broadcast" },
    { title: "Sequences", desc: "Set up automated email drip campaigns", icon: Mail, action: "Create Sequence" },
    { title: "Subscribers", desc: "View and manage your email subscriber list", icon: Users, action: "View List" },
    { title: "Settings", desc: "Configure sender name, reply-to, and SMTP", icon: Settings, action: "Configure" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold">Email & Communications</h1><p className="text-sm text-muted-foreground">Manage email templates, broadcasts, and sequences.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.title} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => toast(`${item.title} coming soon`)}>
            <CardContent className="p-5">
              <item.icon className="h-8 w-8 text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{item.desc}</p>
              <Button size="sm" variant="outline">{item.action}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
