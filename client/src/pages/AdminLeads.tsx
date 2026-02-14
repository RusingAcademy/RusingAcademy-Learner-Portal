import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Calendar, 
  User, 
  Building2, 
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";

type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";

const statusConfig: Record<LeadStatus, { label: string; color: string; icon: React.ReactNode }> = {
  new: { label: "New", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300", icon: <Clock className="w-3 h-3" /> },
  contacted: { label: "Contacted", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300", icon: <Mail className="w-3 h-3" /> },
  qualified: { label: "Qualified", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300", icon: <CheckCircle2 className="w-3 h-3" /> },
  converted: { label: "Converted", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300", icon: <CheckCircle2 className="w-3 h-3" /> },
  lost: { label: "Lost", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300", icon: <XCircle className="w-3 h-3" /> },
};

const brandLabels: Record<string, string> = {
  rusingacademy: "RusingÂcademy",
  lingueefy: "Lingueefy",
  barholex: "Barholex Media",
  external: "External",
};

export default function AdminLeads() {
  const { user, loading: authLoading } = useAuth({ redirectOnUnauthenticated: true });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Fetch leads
  const { data: leadsData, isLoading, refetch } = trpc.contact.getLeads.useQuery({
    page,
    pageSize,
    status: statusFilter !== "all" ? statusFilter as LeadStatus : undefined,
    source: sourceFilter !== "all" ? sourceFilter : undefined,
    search: searchQuery || undefined,
  });

  // Update lead status mutation
  const updateStatus = trpc.contact.updateLeadStatus.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedLead(null);
    },
  });

  const leads = leadsData?.leads || [];
  const totalLeads = leadsData?.total || 0;
  const totalPages = Math.ceil(totalLeads / pageSize);

  // Stats
  const stats = leadsData?.stats || {
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    converted: 0,
    lost: 0,
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <XCircle className="w-16 h-16 text-red-500" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Access Denied</h2>
          <p className="text-slate-600 dark:text-slate-400">This page is only accessible to administrators.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Lead Management</h1>
            <p className="text-slate-600 dark:text-slate-400">Manage contact form submissions and leads</p>
          </div>
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Leads</CardDescription>
              <CardTitle className="text-2xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-blue-600">New</CardDescription>
              <CardTitle className="text-2xl text-blue-600">{stats.new}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-yellow-200 dark:border-yellow-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-yellow-600">Contacted</CardDescription>
              <CardTitle className="text-2xl text-yellow-600">{stats.contacted}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-purple-600">Qualified</CardDescription>
              <CardTitle className="text-2xl text-purple-600">{stats.qualified}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-green-600">Converted</CardDescription>
              <CardTitle className="text-2xl text-green-600">{stats.converted}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-red-600">Lost</CardDescription>
              <CardTitle className="text-2xl text-red-600">{stats.lost}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by name, email, or message..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Building2 className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="rusingacademy">RusingÂcademy</SelectItem>
                  <SelectItem value="lingueefy">Lingueefy</SelectItem>
                  <SelectItem value="barholex">Barholex Media</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
              </div>
            ) : leads.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <MessageSquare className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                <p className="text-slate-600 dark:text-slate-400">No leads found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead: any) => (
                      <TableRow key={lead.id} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setSelectedLead(lead)}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900 dark:text-white">
                              {lead.firstName} {lead.lastName}
                            </span>
                            <span className="text-sm text-slate-500">{lead.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {brandLabels[lead.sourcePlatform] || lead.sourcePlatform}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                            {lead.message?.substring(0, 50)}...
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusConfig[lead.status as LeadStatus]?.color || statusConfig.new.color} gap-1`}>
                            {statusConfig[lead.status as LeadStatus]?.icon}
                            {statusConfig[lead.status as LeadStatus]?.label || lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-500">
                            {lead.createdAt ? format(new Date(lead.createdAt), "MMM d, yyyy") : "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalLeads)} of {totalLeads} leads
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Lead Detail Dialog */}
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {selectedLead?.firstName} {selectedLead?.lastName}
              </DialogTitle>
              <DialogDescription>
                Lead details and management
              </DialogDescription>
            </DialogHeader>
            
            {selectedLead && (
              <div className="space-y-6">
                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <a href={`mailto:${selectedLead.email}`} className="text-teal-600 hover:underline">
                      {selectedLead.email}
                    </a>
                  </div>
                  {selectedLead.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <a href={`tel:${selectedLead.phone}`} className="text-teal-600 hover:underline">
                        {selectedLead.phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>{brandLabels[selectedLead.sourcePlatform] || selectedLead.sourcePlatform}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{selectedLead.createdAt ? format(new Date(selectedLead.createdAt), "PPP 'at' p") : "N/A"}</span>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Message</h4>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                      {selectedLead.message}
                    </p>
                  </div>
                </div>

                {/* Status Update */}
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Update Status</h4>
                  <div className="flex gap-2 flex-wrap">
                    {(Object.keys(statusConfig) as LeadStatus[]).map((status) => (
                      <Button
                        key={status}
                        variant={selectedLead.status === status ? "default" : "outline"}
                        size="sm"
                        className={selectedLead.status === status ? "bg-teal-600 hover:bg-teal-700" : ""}
                        // @ts-expect-error - TS2322: auto-suppressed during TS cleanup
                        onClick={() => updateStatus.mutate({ id: selectedLead.id, status })}
                        disabled={updateStatus.isPending}
                      >
                        {statusConfig[status].icon}
                        <span className="ml-1">{statusConfig[status].label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => window.open(`mailto:${selectedLead.email}?subject=Re: Your inquiry to RusingÂcademy`, '_blank')}
                  >
                    <Mail className="w-4 h-4" />
                    Send Email
                  </Button>
                  {selectedLead.phone && (
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => window.open(`tel:${selectedLead.phone}`, '_blank')}
                    >
                      <Phone className="w-4 h-4" />
                      Call
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
