import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Webhook,
  Plus,
  Trash2,
  Edit,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  Slack,
  MessageSquare,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  type: "slack" | "discord" | "custom";
  events: string[];
  enabled: boolean;
  lastTriggered?: Date;
  lastStatus?: "success" | "failed";
}

const CRM_EVENTS = [
  { id: "lead.created", label: "Lead Created", labelFr: "Lead créé" },
  { id: "lead.converted", label: "Lead Converted", labelFr: "Lead converti" },
  { id: "lead.lost", label: "Lead Lost", labelFr: "Lead perdu" },
  { id: "lead.stage_changed", label: "Stage Changed", labelFr: "Étape changée" },
  { id: "lead.score_high", label: "High Score Alert", labelFr: "Alerte score élevé" },
  { id: "meeting.scheduled", label: "Meeting Scheduled", labelFr: "Réunion planifiée" },
  { id: "meeting.completed", label: "Meeting Completed", labelFr: "Réunion complétée" },
  { id: "deal.won", label: "Deal Won", labelFr: "Deal gagné" },
  { id: "deal.lost", label: "Deal Lost", labelFr: "Deal perdu" },
];

export default function CRMWebhooksManager() {
  const { language } = useLanguage();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
    // Demo data - in production this would come from the database
    {
      id: "1",
      name: "Sales Team Slack",
      url: "https://hooks.slack.com/services/...",
      type: "slack",
      events: ["lead.created", "deal.won", "deal.lost"],
      enabled: true,
      lastTriggered: new Date(Date.now() - 3600000),
      lastStatus: "success",
    },
  ]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookConfig | null>(null);
  const [newWebhook, setNewWebhook] = useState({
    name: "",
    url: "",
    type: "slack" as "slack" | "discord" | "custom",
    events: [] as string[],
  });
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);

  const labels = {
    en: {
      title: "CRM Webhooks",
      subtitle: "Send notifications to external services when CRM events occur",
      addWebhook: "Add Webhook",
      editWebhook: "Edit Webhook",
      deleteWebhook: "Delete Webhook",
      testWebhook: "Test Webhook",
      webhookName: "Webhook Name",
      webhookUrl: "Webhook URL",
      webhookType: "Webhook Type",
      events: "Events",
      selectEvents: "Select events to trigger this webhook",
      enabled: "Enabled",
      lastTriggered: "Last Triggered",
      status: "Status",
      success: "Success",
      failed: "Failed",
      never: "Never",
      save: "Save",
      cancel: "Cancel",
      create: "Create",
      noWebhooks: "No webhooks configured",
      noWebhooksDesc: "Add a webhook to start receiving CRM notifications",
      slack: "Slack",
      discord: "Discord",
      custom: "Custom HTTP",
      allEvents: "All Events",
      selectAll: "Select All",
      deselectAll: "Deselect All",
      testing: "Testing...",
      testSuccess: "Webhook test successful!",
      testFailed: "Webhook test failed",
      envNote: "You can also configure webhooks via environment variables:",
      envVars: "CRM_SLACK_WEBHOOK_URL, CRM_DISCORD_WEBHOOK_URL, CRM_CUSTOM_WEBHOOK_URL",
    },
    fr: {
      title: "Webhooks CRM",
      subtitle: "Envoyez des notifications aux services externes lors d'événements CRM",
      addWebhook: "Ajouter un webhook",
      editWebhook: "Modifier le webhook",
      deleteWebhook: "Supprimer le webhook",
      testWebhook: "Tester le webhook",
      webhookName: "Nom du webhook",
      webhookUrl: "URL du webhook",
      webhookType: "Type de webhook",
      events: "Événements",
      selectEvents: "Sélectionnez les événements qui déclenchent ce webhook",
      enabled: "Activé",
      lastTriggered: "Dernier déclenchement",
      status: "Statut",
      success: "Succès",
      failed: "Échoué",
      never: "Jamais",
      save: "Enregistrer",
      cancel: "Annuler",
      create: "Créer",
      noWebhooks: "Aucun webhook configuré",
      noWebhooksDesc: "Ajoutez un webhook pour commencer à recevoir des notifications CRM",
      slack: "Slack",
      discord: "Discord",
      custom: "HTTP personnalisé",
      allEvents: "Tous les événements",
      selectAll: "Tout sélectionner",
      deselectAll: "Tout désélectionner",
      testing: "Test en cours...",
      testSuccess: "Test du webhook réussi!",
      testFailed: "Test du webhook échoué",
      envNote: "Vous pouvez aussi configurer les webhooks via des variables d'environnement:",
      envVars: "CRM_SLACK_WEBHOOK_URL, CRM_DISCORD_WEBHOOK_URL, CRM_CUSTOM_WEBHOOK_URL",
    },
  };

  const l = labels[language];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "slack":
        return <Slack className="h-5 w-5" />;
      case "discord":
        return <MessageSquare className="h-5 w-5" />;
      default:
        return <Globe className="h-5 w-5" />;
    }
  };

  const handleCreateWebhook = () => {
    if (!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0) {
      toast.error(language === "fr" ? "Veuillez remplir tous les champs" : "Please fill all fields");
      return;
    }

    const webhook: WebhookConfig = {
      id: Date.now().toString(),
      ...newWebhook,
      enabled: true,
    };

    setWebhooks([...webhooks, webhook]);
    setShowCreateDialog(false);
    setNewWebhook({ name: "", url: "", type: "slack", events: [] });
    toast.success(language === "fr" ? "Webhook créé" : "Webhook created");
  };

  const handleUpdateWebhook = () => {
    if (!selectedWebhook) return;

    setWebhooks(webhooks.map((w) => 
      w.id === selectedWebhook.id ? selectedWebhook : w
    ));
    setShowEditDialog(false);
    setSelectedWebhook(null);
    toast.success(language === "fr" ? "Webhook mis à jour" : "Webhook updated");
  };

  const handleDeleteWebhook = (id: string) => {
    if (confirm(language === "fr" ? "Êtes-vous sûr de vouloir supprimer ce webhook?" : "Are you sure you want to delete this webhook?")) {
      setWebhooks(webhooks.filter((w) => w.id !== id));
      toast.success(language === "fr" ? "Webhook supprimé" : "Webhook deleted");
    }
  };

  const handleToggleWebhook = (id: string) => {
    setWebhooks(webhooks.map((w) => 
      w.id === id ? { ...w, enabled: !w.enabled } : w
    ));
  };

  const handleTestWebhook = async (webhook: WebhookConfig) => {
    setTestingWebhook(webhook.id);
    
    // Simulate test
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Update status
    setWebhooks(webhooks.map((w) => 
      w.id === webhook.id 
        ? { ...w, lastTriggered: new Date(), lastStatus: "success" as const }
        : w
    ));
    
    setTestingWebhook(null);
    toast.success(l.testSuccess);
  };

  const toggleEvent = (eventId: string, isNew: boolean = false) => {
    if (isNew) {
      setNewWebhook((prev) => ({
        ...prev,
        events: prev.events.includes(eventId)
          ? prev.events.filter((e) => e !== eventId)
          : [...prev.events, eventId],
      }));
    } else if (selectedWebhook) {
      setSelectedWebhook({
        ...selectedWebhook,
        events: selectedWebhook.events.includes(eventId)
          ? selectedWebhook.events.filter((e) => e !== eventId)
          : [...selectedWebhook.events, eventId],
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Webhook className="h-6 w-6" />
            {l.title}
          </h2>
          <p className="text-muted-foreground">{l.subtitle}</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {l.addWebhook}
        </Button>
      </div>

      {/* Environment Variables Note */}
      <Card className="bg-muted/50">
        <CardContent className="py-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm">
              <p className="text-muted-foreground">{l.envNote}</p>
              <code className="text-xs bg-background px-2 py-1 rounded mt-1 inline-block">
                {l.envVars}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks List */}
      {webhooks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Webhook className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">{l.noWebhooks}</h3>
            <p className="text-muted-foreground text-sm mb-4">{l.noWebhooksDesc}</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {l.addWebhook}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <Card key={webhook.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      webhook.type === "slack" ? "bg-[#E7F2F2] text-[#0F3D3E]" :
                      webhook.type === "discord" ? "bg-indigo-100 text-indigo-600" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {getTypeIcon(webhook.type)}
                    </div>
                    <div>
                      <h3 className="font-medium flex items-center gap-2">
                        {webhook.name}
                        {!webhook.enabled && (
                          <Badge variant="secondary">
                            {language === "fr" ? "Désactivé" : "Disabled"}
                          </Badge>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate max-w-md">
                        {webhook.url}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {webhook.events.slice(0, 3).map((eventId) => {
                          const event = CRM_EVENTS.find((e) => e.id === eventId);
                          return (
                            <Badge key={eventId} variant="outline" className="text-xs">
                              {language === "fr" ? event?.labelFr : event?.label}
                            </Badge>
                          );
                        })}
                        {webhook.events.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{webhook.events.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {webhook.lastTriggered && (
                      <div className="text-right text-sm">
                        <p className="text-muted-foreground">{l.lastTriggered}</p>
                        <div className="flex items-center gap-1">
                          {webhook.lastStatus === "success" ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span>
                            {new Date(webhook.lastTriggered).toLocaleString(
                              language === "fr" ? "fr-CA" : "en-CA",
                              { dateStyle: "short", timeStyle: "short" }
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={webhook.enabled}
                        onCheckedChange={() => handleToggleWebhook(webhook.id)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestWebhook(webhook)}
                        disabled={testingWebhook === webhook.id || !webhook.enabled}
                      >
                        {testingWebhook === webhook.id ? (
                          <span className="animate-pulse">{l.testing}</span>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-1" />
                            {l.testWebhook}
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedWebhook(webhook);
                          setShowEditDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteWebhook(webhook.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Webhook Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{l.addWebhook}</DialogTitle>
            <DialogDescription>
              {language === "fr"
                ? "Configurez un nouveau webhook pour recevoir des notifications CRM"
                : "Configure a new webhook to receive CRM notifications"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{l.webhookName}</Label>
              <Input
                value={newWebhook.name}
                onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                placeholder={language === "fr" ? "Ex: Équipe ventes Slack" : "Ex: Sales Team Slack"}
              />
            </div>
            <div className="space-y-2">
              <Label>{l.webhookType}</Label>
              <Select
                value={newWebhook.type}
                onValueChange={(v) => setNewWebhook({ ...newWebhook, type: v as "slack" | "discord" | "custom" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slack">{l.slack}</SelectItem>
                  <SelectItem value="discord">{l.discord}</SelectItem>
                  <SelectItem value="custom">{l.custom}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{l.webhookUrl}</Label>
              <Input
                value={newWebhook.url}
                onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                placeholder="https://hooks.slack.com/services/..."
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{l.events}</Label>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNewWebhook({ ...newWebhook, events: CRM_EVENTS.map((e) => e.id) })}
                  >
                    {l.selectAll}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNewWebhook({ ...newWebhook, events: [] })}
                  >
                    {l.deselectAll}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{l.selectEvents}</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {CRM_EVENTS.map((event) => (
                  <label
                    key={event.id}
                    className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                      newWebhook.events.includes(event.id)
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={newWebhook.events.includes(event.id)}
                      onChange={() => toggleEvent(event.id, true)}
                      className="sr-only"
                    />
                    <div className={`h-4 w-4 rounded border flex items-center justify-center ${
                      newWebhook.events.includes(event.id)
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-input"
                    }`}>
                      {newWebhook.events.includes(event.id) && (
                        <CheckCircle className="h-3 w-3" />
                      )}
                    </div>
                    <span className="text-sm">
                      {language === "fr" ? event.labelFr : event.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setNewWebhook({ name: "", url: "", type: "slack", events: [] });
            }}>
              {l.cancel}
            </Button>
            <Button onClick={handleCreateWebhook}>
              {l.create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Webhook Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{l.editWebhook}</DialogTitle>
          </DialogHeader>
          {selectedWebhook && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{l.webhookName}</Label>
                <Input
                  value={selectedWebhook.name}
                  onChange={(e) => setSelectedWebhook({ ...selectedWebhook, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{l.webhookType}</Label>
                <Select
                  value={selectedWebhook.type}
                  onValueChange={(v) => setSelectedWebhook({ ...selectedWebhook, type: v as "slack" | "discord" | "custom" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slack">{l.slack}</SelectItem>
                    <SelectItem value="discord">{l.discord}</SelectItem>
                    <SelectItem value="custom">{l.custom}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{l.webhookUrl}</Label>
                <Input
                  value={selectedWebhook.url}
                  onChange={(e) => setSelectedWebhook({ ...selectedWebhook, url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{l.events}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {CRM_EVENTS.map((event) => (
                    <label
                      key={event.id}
                      className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                        selectedWebhook.events.includes(event.id)
                          ? "bg-primary/10 border-primary"
                          : "hover:bg-muted"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedWebhook.events.includes(event.id)}
                        onChange={() => toggleEvent(event.id)}
                        className="sr-only"
                      />
                      <div className={`h-4 w-4 rounded border flex items-center justify-center ${
                        selectedWebhook.events.includes(event.id)
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-input"
                      }`}>
                        {selectedWebhook.events.includes(event.id) && (
                          <CheckCircle className="h-3 w-3" />
                        )}
                      </div>
                      <span className="text-sm">
                        {language === "fr" ? event.labelFr : event.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              setSelectedWebhook(null);
            }}>
              {l.cancel}
            </Button>
            <Button onClick={handleUpdateWebhook}>
              {l.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
