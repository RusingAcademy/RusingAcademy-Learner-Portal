import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  History,
  UserPlus,
  Edit,
  ArrowRight,
  Star,
  Tag,
  Mail,
  Calendar,
  FileDown,
  Merge,
  Trash2,
  MessageSquare,
  User,
} from "lucide-react";

interface LeadHistoryTimelineProps {
  leadId: number;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  created: <UserPlus className="h-4 w-4" />,
  updated: <Edit className="h-4 w-4" />,
  status_changed: <ArrowRight className="h-4 w-4" />,
  score_changed: <Star className="h-4 w-4" />,
  assigned: <User className="h-4 w-4" />,
  tag_added: <Tag className="h-4 w-4" />,
  tag_removed: <Tag className="h-4 w-4" />,
  note_added: <MessageSquare className="h-4 w-4" />,
  email_sent: <Mail className="h-4 w-4" />,
  meeting_scheduled: <Calendar className="h-4 w-4" />,
  imported: <FileDown className="h-4 w-4" />,
  merged: <Merge className="h-4 w-4" />,
  deleted: <Trash2 className="h-4 w-4" />,
};

const ACTION_COLORS: Record<string, string> = {
  created: "bg-green-100 text-green-700",
  updated: "bg-blue-100 text-blue-700",
  status_changed: "bg-[#E7F2F2] text-[#0F3D3E]",
  score_changed: "bg-yellow-100 text-yellow-700",
  assigned: "bg-indigo-100 text-indigo-700",
  tag_added: "bg-teal-100 text-teal-700",
  tag_removed: "bg-orange-100 text-orange-700",
  note_added: "bg-gray-100 text-gray-700",
  email_sent: "bg-cyan-100 text-cyan-700",
  meeting_scheduled: "bg-[#FFF1E8] text-[#C65A1E]",
  imported: "bg-emerald-100 text-emerald-700",
  merged: "bg-[#E7F2F2] text-[#0F3D3E]",
  deleted: "bg-red-100 text-red-700",
};

export default function LeadHistoryTimeline({ leadId }: LeadHistoryTimelineProps) {
  const { language } = useLanguage();
  const historyQuery = trpc.crm.getLeadHistory.useQuery({ leadId, limit: 100 });

  const labels = {
    en: {
      title: "Activity History",
      noHistory: "No activity recorded yet",
      by: "by",
      actions: {
        created: "Lead created",
        updated: "Lead updated",
        status_changed: "Status changed",
        score_changed: "Score changed",
        assigned: "Lead assigned",
        tag_added: "Tag added",
        tag_removed: "Tag removed",
        note_added: "Note added",
        email_sent: "Email sent",
        meeting_scheduled: "Meeting scheduled",
        imported: "Lead imported",
        merged: "Leads merged",
        deleted: "Lead deleted",
      },
    },
    fr: {
      title: "Historique d'activité",
      noHistory: "Aucune activité enregistrée",
      by: "par",
      actions: {
        created: "Lead créé",
        updated: "Lead mis à jour",
        status_changed: "Statut modifié",
        score_changed: "Score modifié",
        assigned: "Lead assigné",
        tag_added: "Tag ajouté",
        tag_removed: "Tag retiré",
        note_added: "Note ajoutée",
        email_sent: "Email envoyé",
        meeting_scheduled: "Réunion planifiée",
        imported: "Lead importé",
        merged: "Leads fusionnés",
        deleted: "Lead supprimé",
      },
    },
  };

  const l = labels[language];

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return new Intl.DateTimeFormat(language === "fr" ? "fr-CA" : "en-CA", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const getActionLabel = (action: string) => {
    return l.actions[action as keyof typeof l.actions] || action;
  };

  if (historyQuery.isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5 text-indigo-500" />
          {l.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!historyQuery.data?.history.length ? (
          <p className="text-muted-foreground text-center py-4">{l.noHistory}</p>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-4">
                {historyQuery.data.history.map((item) => (
                  <div key={item.id} className="relative flex gap-4 pl-10">
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-2 w-5 h-5 rounded-full flex items-center justify-center ${
                        ACTION_COLORS[item.action] || "bg-gray-100"
                      }`}
                    >
                      {ACTION_ICONS[item.action] || <Edit className="h-3 w-3" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{getActionLabel(item.action)}</span>
                        {item.fieldName && (
                          <Badge variant="outline" className="text-xs">
                            {item.fieldName}
                          </Badge>
                        )}
                      </div>

                      {(item.oldValue || item.newValue) && (
                        <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                          {item.oldValue && (
                            <span className="line-through text-red-500">{item.oldValue}</span>
                          )}
                          {item.oldValue && item.newValue && <ArrowRight className="h-3 w-3" />}
                          {item.newValue && (
                            <span className="text-green-600">{item.newValue}</span>
                          )}
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        <span>{formatDate(item.createdAt)}</span>
                        {item.userName && (
                          <>
                            <span>•</span>
                            <span>
                              {l.by} {item.userName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
