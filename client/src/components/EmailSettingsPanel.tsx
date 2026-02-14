/**
 * Email Settings Panel
 * 
 * Admin component for testing and managing email configuration
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Mail, 
  CheckCircle, 
  XCircle, 
  Send, 
  RefreshCw, 
  Server,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function EmailSettingsPanel() {
  const [testEmail, setTestEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  // Get email service status
  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = 
    trpc.emailSettings.getStatus.useQuery();

  // Get configuration guide
  const { data: guide } = trpc.emailSettings.getConfigurationGuide.useQuery();

  // Test connection mutation
  const testConnectionMutation = trpc.emailSettings.testConnection.useMutation({
    onSuccess: (result) => {
      if (result.connected) {
        toast.success("SMTP connection successful!");
      } else {
        toast.error(`Connection failed: ${result.error}`);
      }
      refetchStatus();
    },
    onError: (error) => {
      toast.error(`Connection test failed: ${error.message}`);
    },
  });

  // Send test email mutation
  const sendTestEmailMutation = trpc.emailSettings.sendTestEmail.useMutation({
    onSuccess: (result) => {
      toast.success(`Test email sent successfully! Message ID: ${result.messageId}`);
      setTestEmail("");
    },
    onError: (error) => {
      toast.error(`Failed to send test email: ${error.message}`);
    },
  });

  const handleTestConnection = async () => {
    await testConnectionMutation.mutateAsync();
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast.error("Please enter an email address");
      return;
    }
    setIsSending(true);
    try {
      await sendTestEmailMutation.mutateAsync({ to: testEmail });
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = (text: string, varName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVar(varName);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  if (statusLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading email settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Service Status
              </CardTitle>
              <CardDescription>
                Current SMTP configuration and connection status
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetchStatus()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {status?.configured ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Configured
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Not Configured
                </Badge>
              )}
            </div>
            {status?.configured && (
              <Badge variant="outline">
                <Server className="h-3 w-3 mr-1" />
                {status.provider}
              </Badge>
            )}
          </div>

          {/* Configuration Details */}
          {status?.configured && (status as any).config && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Host</p>
                <p className="font-mono text-sm">{(status as any).config.host}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Port</p>
                <p className="font-mono text-sm">{(status as any).config.port}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">From Address</p>
                <p className="font-mono text-sm">{(status as any).config.from}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">From Name</p>
                <p className="font-mono text-sm">{(status as any).config.fromName}</p>
              </div>
            </div>
          )}

          {/* Not Configured Warning */}
          {!status?.configured && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Email Not Configured</AlertTitle>
              <AlertDescription>
                SMTP environment variables are not set. Email features (verification, password reset, booking confirmations) will not work.
              </AlertDescription>
            </Alert>
          )}

          {/* Test Connection Button */}
          {status?.configured && (
            <Button 
              onClick={handleTestConnection}
              disabled={testConnectionMutation.isPending}
            >
              {testConnectionMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Server className="h-4 w-4 mr-2" />
              )}
              Test SMTP Connection
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Send Test Email Card */}
      {status?.configured && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Test Email
            </CardTitle>
            <CardDescription>
              Send a test email to verify your SMTP configuration is working correctly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                type="email"
                placeholder="Enter email address..."
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleSendTestEmail}
                disabled={isSending || !testEmail}
              >
                {isSending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Test
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Guide Card */}
      <Card>
        <CardHeader>
          <CardTitle>SMTP Configuration Guide</CardTitle>
          <CardDescription>
            Required environment variables for email functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Required Variables */}
          <div>
            <h4 className="font-semibold mb-3">Required Environment Variables</h4>
            <div className="space-y-2">
              {guide?.requiredVariables?.map((variable) => (
                <div 
                  key={variable.name}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <code className="text-sm font-mono text-teal-600">{variable.name}</code>
                    <p className="text-sm text-muted-foreground">{variable.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(variable.name, variable.name)}
                  >
                    {copiedVar === variable.name ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Provider Examples */}
          <div>
            <h4 className="font-semibold mb-3">Popular SMTP Providers</h4>
            <div className="grid gap-4 md:grid-cols-2">
              {guide?.providers?.map((provider) => (
                <div 
                  key={provider.name}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{provider.name}</h5>
                    <a 
                      href={provider.docs} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:text-teal-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Host:</span> <code>{provider.host}</code></p>
                    <p><span className="text-muted-foreground">Port:</span> <code>{provider.port}</code></p>
                    <p className="text-xs text-muted-foreground mt-2">{provider.userNote}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
