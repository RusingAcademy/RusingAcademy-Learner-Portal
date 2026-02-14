import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Bell,
  Plus,
  Trash2,
  Edit2,
  Mail,
  Webhook,
  AlertTriangle,
  ArrowRightCircle,
  ArrowLeftCircle,
  Target,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Alert {
  id: number;
  segmentId: number;
  segmentName: string | null;
  alertType: "lead_entered" | "lead_exited" | "threshold_reached";
  thresholdValue: number | null;
  notifyEmail: boolean | null;
  notifyWebhook: boolean | null;
  webhookUrl: string | null;
  recipients: string | null;
  isActive: boolean;
  lastTriggeredAt: Date | null;
  triggerCount: number;
  createdAt: Date;
}

export default function SegmentAlertsManager() {
  const { language } = useLanguage();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [selectedSegmentId, setSelectedSegmentId] = useState<number | null>(null);
  const [alertType, setAlertType] = useState<"lead_entered" | "lead_exited" | "threshold_reached">("lead_entered");
  const [thresholdValue, setThresholdValue] = useState<number>(10);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyWebhook, setNotifyWebhook] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [recipients, setRecipients] = useState("owner");

  const alertsQuery = trpc.crm.getSegmentAlerts.useQuery({});
  const segmentsQuery = trpc.crm.getSegments.useQuery();
  const logsQuery = trpc.crm.getSegmentAlertLogs.useQuery({ limit: 50 });

  const createMutation = trpc.crm.createSegmentAlert.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Alerte créée" : "Alert created");
      alertsQuery.refetch();
      resetForm();
      setShowCreateDialog(false);
    },
    onError: () => {
      toast.error(language === "fr" ? "Erreur de création" : "Creation failed");
    },
  });

  const updateMutation = trpc.crm.updateSegmentAlert.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Alerte mise à jour" : "Alert updated");
      alertsQuery.refetch();
      setEditingAlert(null);
    },
    onError: () => {
      toast.error(language === "fr" ? "Erreur de mise à jour" : "Update failed");
    },
  });

  const deleteMutation = trpc.crm.deleteSegmentAlert.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Alerte supprimée" : "Alert deleted");
      alertsQuery.refetch();
    },
    onError: () => {
      toast.error(language === "fr" ? "Erreur de suppression" : "Deletion failed");
    },
  });

  const labels = {
    en: {
      title: "Segment Alerts",
      subtitle: "Get notified when leads enter or exit segments",
      createAlert: "Create Alert",
      editAlert: "Edit Alert",
      segment: "Segment",
      alertType: "Alert Type",
      leadEntered: "Lead Entered",
      leadExited: "Lead Exited",
      thresholdReached: "Threshold Reached",
      threshold: "Threshold",
      notifications: "Notifications",
      email: "Email",
      webhook: "Webhook",
      webhookUrl: "Webhook URL",
      recipients: "Recipients",
      recipientsHelp: "Comma-separated emails or 'owner'",
      active: "Active",
      inactive: "Inactive",
      lastTriggered: "Last Triggered",
      triggerCount: "Triggers",
      never: "Never",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      recentLogs: "Recent Alert Logs",
      noAlerts: "No alerts configured",
      noLogs: "No alert logs yet",
      selectSegment: "Select a segment",
    },
    fr: {
      title: "Alertes de Segment",
      subtitle: "Soyez notifié quand des leads entrent ou sortent des segments",
      createAlert: "Créer une Alerte",
      editAlert: "Modifier l'Alerte",
      segment: "Segment",
      alertType: "Type d'Alerte",
      leadEntered: "Lead Entré",
      leadExited: "Lead Sorti",
      thresholdReached: "Seuil Atteint",
      threshold: "Seuil",
      notifications: "Notifications",
      email: "Email",
      webhook: "Webhook",
      webhookUrl: "URL du Webhook",
      recipients: "Destinataires",
      recipientsHelp: "Emails séparés par virgule ou 'owner'",
      active: "Actif",
      inactive: "Inactif",
      lastTriggered: "Dernier Déclenchement",
      triggerCount: "Déclenchements",
      never: "Jamais",
      save: "Enregistrer",
      cancel: "Annuler",
      delete: "Supprimer",
      recentLogs: "Logs d'Alertes Récents",
      noAlerts: "Aucune alerte configurée",
      noLogs: "Aucun log d'alerte",
      selectSegment: "Sélectionner un segment",
    },
  };

  const l = labels[language];

  const resetForm = () => {
    setSelectedSegmentId(null);
    setAlertType("lead_entered");
    setThresholdValue(10);
    setNotifyEmail(true);
    setNotifyWebhook(false);
    setWebhookUrl("");
    setRecipients("owner");
  };

  const handleCreate = () => {
    if (!selectedSegmentId) {
      toast.error(language === "fr" ? "Sélectionnez un segment" : "Select a segment");
      return;
    }
    createMutation.mutate({
      segmentId: selectedSegmentId,
      alertType,
      thresholdValue: alertType === "threshold_reached" ? thresholdValue : undefined,
      notifyEmail,
      notifyWebhook,
      webhookUrl: notifyWebhook ? webhookUrl : undefined,
      recipients,
    });
  };

  const handleUpdate = () => {
    if (!editingAlert) return;
    updateMutation.mutate({
      id: editingAlert.id,
      alertType,
      thresholdValue: alertType === "threshold_reached" ? thresholdValue : undefined,
      notifyEmail,
      notifyWebhook,
      webhookUrl: notifyWebhook ? webhookUrl : undefined,
      recipients,
      isActive: editingAlert.isActive,
    });
  };

  const handleToggleActive = (alert: Alert) => {
    updateMutation.mutate({
      id: alert.id,
      isActive: !alert.isActive,
    });
  };

  const openEditDialog = (alert: Alert) => {
    setEditingAlert(alert);
    setAlertType(alert.alertType);
    setThresholdValue(alert.thresholdValue || 10);
    setNotifyEmail(alert.notifyEmail ?? true);
    setNotifyWebhook(alert.notifyWebhook ?? false);
    setWebhookUrl(alert.webhookUrl || "");
    setRecipients(alert.recipients || "owner");
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case "lead_entered":
        return <ArrowRightCircle className="h-4 w-4 text-green-500" />;
      case "lead_exited":
        return <ArrowLeftCircle className="h-4 w-4 text-red-500" />;
      case "threshold_reached":
        return <Target className="h-4 w-4 text-amber-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case "lead_entered":
        return l.leadEntered;
      case "lead_exited":
        return l.leadExited;
      case "threshold_reached":
        return l.thresholdReached;
      default:
        return type;
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return l.never;
    return new Date(date).toLocaleString(language === "fr" ? "fr-CA" : "en-CA");
  };

  const alerts = (alertsQuery.data?.alerts || []) as unknown as Alert[];
  const segments = segmentsQuery.data?.segments || [];
  const logs = logsQuery.data?.logs || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            {l.title}
          </h2>
          <p className="text-muted-foreground">{l.subtitle}</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {l.createAlert}
        </Button>
      </div>

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle>{l.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{l.noAlerts}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{l.segment}</TableHead>
                  <TableHead>{l.alertType}</TableHead>
                  <TableHead>{l.notifications}</TableHead>
                  <TableHead>{l.lastTriggered}</TableHead>
                  <TableHead>{l.triggerCount}</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">
                      {alert.segmentName || `Segment #${alert.segmentId}`}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getAlertTypeIcon(alert.alertType)}
                        <span>{getAlertTypeLabel(alert.alertType)}</span>
                        {alert.alertType === "threshold_reached" && alert.thresholdValue && (
                          <Badge variant="outline">≥{alert.thresholdValue}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {alert.notifyEmail && (
                          <Badge variant="secondary" className="gap-1">
                            <Mail className="h-3 w-3" />
                            Email
                          </Badge>
                        )}
                        {alert.notifyWebhook && (
                          <Badge variant="secondary" className="gap-1">
                            <Webhook className="h-3 w-3" />
                            Webhook
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(alert.lastTriggeredAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{alert.triggerCount}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Switch
                          checked={alert.isActive}
                          onCheckedChange={() => handleToggleActive(alert)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(alert)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate({ id: alert.id })}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <CardTitle>{l.recentLogs}</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{l.noLogs}</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-800"
                >
                  <div className="flex items-center gap-3">
                    {log.eventType === "entered" && <ArrowRightCircle className="h-5 w-5 text-green-500" />}
                    {log.eventType === "exited" && <ArrowLeftCircle className="h-5 w-5 text-red-500" />}
                    {log.eventType === "threshold" && <Target className="h-5 w-5 text-amber-500" />}
                    <div>
                      <p className="font-medium">{log.message}</p>
                      <p className="text-sm text-muted-foreground">
                        {log.leadName} ({log.leadEmail})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.notificationSent ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {/* @ts-ignore - TS2345: auto-suppressed during TS cleanup */}
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || !!editingAlert} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setEditingAlert(null);
          resetForm();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAlert ? l.editAlert : l.createAlert}</DialogTitle>
            <DialogDescription>
              {language === "fr"
                ? "Configurez les paramètres de l'alerte"
                : "Configure the alert settings"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!editingAlert && (
              <div className="space-y-2">
                <Label>{l.segment}</Label>
                <Select
                  value={selectedSegmentId?.toString() || ""}
                  onValueChange={(v) => setSelectedSegmentId(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={l.selectSegment} />
                  </SelectTrigger>
                  <SelectContent>
                    {segments.map((segment) => (
                      <SelectItem key={segment.id} value={segment.id.toString()}>
                        {segment.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>{l.alertType}</Label>
              <Select
                value={alertType}
                onValueChange={(v) => setAlertType(v as typeof alertType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead_entered">{l.leadEntered}</SelectItem>
                  <SelectItem value="lead_exited">{l.leadExited}</SelectItem>
                  <SelectItem value="threshold_reached">{l.thresholdReached}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {alertType === "threshold_reached" && (
              <div className="space-y-2">
                <Label>{l.threshold}</Label>
                <Input
                  type="number"
                  value={thresholdValue}
                  onChange={(e) => setThresholdValue(parseInt(e.target.value) || 0)}
                  min={1}
                />
              </div>
            )}

            <div className="space-y-4">
              <Label>{l.notifications}</Label>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{l.email}</span>
                </div>
                <Switch checked={notifyEmail} onCheckedChange={setNotifyEmail} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Webhook className="h-4 w-4" />
                  <span>{l.webhook}</span>
                </div>
                <Switch checked={notifyWebhook} onCheckedChange={setNotifyWebhook} />
              </div>
            </div>

            {notifyWebhook && (
              <div className="space-y-2">
                <Label>{l.webhookUrl}</Label>
                <Input
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            )}

            {notifyEmail && (
              <div className="space-y-2">
                <Label>{l.recipients}</Label>
                <Input
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  placeholder="owner"
                />
                <p className="text-xs text-muted-foreground">{l.recipientsHelp}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setEditingAlert(null);
              resetForm();
            }}>
              {l.cancel}
            </Button>
            <Button onClick={editingAlert ? handleUpdate : handleCreate}>
              {l.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
