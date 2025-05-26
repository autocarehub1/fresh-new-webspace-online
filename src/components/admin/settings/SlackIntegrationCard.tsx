import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useSlackNotification } from '@/hooks/use-slack-notification';
import { getSlackConfig } from '@/integrations/slack/slackClient';
import { toast } from 'sonner';
import { CheckCircle, AlertCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Connection status component
const ConnectionStatus = ({ status }: { status: 'connected' | 'not_configured' | 'error' }) => {
  if (status === 'connected') {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 font-medium mt-2">
        <CheckCircle className="h-4 w-4" />
        <span>Connected and ready to send notifications</span>
      </div>
    );
  } else if (status === 'not_configured') {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-600 font-medium mt-2">
        <AlertTriangle className="h-4 w-4" />
        <span>Not configured. Add a webhook URL to enable.</span>
      </div>
    );
  } else {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600 font-medium mt-2">
        <AlertCircle className="h-4 w-4" />
        <span>Connection error. Please check your webhook URL.</span>
      </div>
    );
  }
};

// Slack message preview component
const SlackPreview = () => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Notification Preview</Label>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2" 
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      {expanded && (
        <div className="border rounded-md p-4 bg-slate-50">
          <Tabs defaultValue="new_request">
            <TabsList className="mb-4">
              <TabsTrigger value="new_request">New Request</TabsTrigger>
              <TabsTrigger value="status_update">Status Update</TabsTrigger>
            </TabsList>
            
            <TabsContent value="new_request">
              <div className="space-y-3 text-sm">
                <div className="font-semibold text-base">🚚 New Delivery Request</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="font-semibold">Request ID:</div>
                    <div>REQ-ABC123</div>
                  </div>
                  <div>
                    <div className="font-semibold">Priority:</div>
                    <div>urgent</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="font-semibold">Pickup:</div>
                    <div>Memorial Hospital Lab</div>
                  </div>
                  <div>
                    <div className="font-semibold">Delivery:</div>
                    <div>Central Medical Center</div>
                  </div>
                </div>
                <div className="p-2 border rounded bg-white text-blue-600 font-medium text-center">
                  View Details
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="status_update">
              <div className="space-y-3 text-sm">
                <div className="font-semibold text-base">🚚 Delivery Status Update</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="font-semibold">Request ID:</div>
                    <div>REQ-ABC123</div>
                  </div>
                  <div>
                    <div className="font-semibold">Status:</div>
                    <div>Out for delivery</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="font-semibold">Tracking ID:</div>
                    <div>TRK-XYZ789</div>
                  </div>
                  <div>
                    <div className="font-semibold">Time:</div>
                    <div>2:45 PM</div>
                  </div>
                </div>
                <div className="p-2 border rounded bg-white text-blue-600 font-medium text-center">
                  View Details
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

const SlackIntegrationCard = () => {
  const { configureSlackIntegration, isConfigured, sendNewRequestNotification, sendStatusUpdateNotification } = useSlackNotification();
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [channelId, setChannelId] = useState<string>('');
  const [enabled, setEnabled] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'not_configured' | 'error'>('not_configured');

  // Add a state for expanded testing panel
  const [showTestPanel, setShowTestPanel] = useState<boolean>(false);

  // Load existing configuration on component mount
  useEffect(() => {
    const config = getSlackConfig();
    if (config.webhookUrl && config.webhookUrl !== 'YOUR_SLACK_WEBHOOK_URL') {
      setWebhookUrl(config.webhookUrl);
      setConnectionStatus(isConfigured ? 'connected' : 'not_configured');
    }
    if (config.channelId) {
      setChannelId(config.channelId);
    }
    setEnabled(config.enabled);
  }, [isConfigured]);

  const handleSave = () => {
    if (!webhookUrl) {
      toast.error('Please enter a webhook URL');
      return;
    }

    if (!webhookUrl.startsWith('https://hooks.slack.com/services/')) {
      toast.error('Invalid webhook URL format. It should start with "https://hooks.slack.com/services/"');
      setConnectionStatus('error');
      return;
    }

    setIsSaving(true);
    try {
      configureSlackIntegration(webhookUrl, channelId, enabled);
      setConnectionStatus('connected');
      setIsSaving(false);
    } catch (error) {
      console.error('Error saving Slack configuration:', error);
      toast.error('Failed to save Slack configuration');
      setConnectionStatus('error');
      setIsSaving(false);
    }
  };

  const testSlackIntegration = async () => {
    if (!isConfigured && (!webhookUrl || webhookUrl === 'YOUR_SLACK_WEBHOOK_URL')) {
      toast.error('Please configure and save Slack settings first');
      return;
    }

    setIsTesting(true);
    try {
      // Create a temporary configuration if not saved yet
      if (!isConfigured) {
        configureSlackIntegration(webhookUrl, channelId, enabled);
      }

      const testMessage = {
        text: "🧪 This is a test message from the Express Medical Dispatch system",
        blocks: [
          {
            "type": "header",
            "text": {
              "type": "plain_text",
              "text": "🧪 Test Notification",
              "emoji": true
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "This is a test message from the *Express Medical Dispatch* system. If you're seeing this, your Slack integration is working correctly!"
            }
          },
          {
            "type": "context",
            "elements": [
              {
                "type": "mrkdwn",
                "text": "Sent from Express Medical Dispatch Admin Dashboard"
              }
            ]
          }
        ]
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testMessage)
      });

      if (!response.ok) {
        const errorText = await response.text();
        setConnectionStatus('error');
        throw new Error(`Slack responded with: ${errorText}`);
      }

      setConnectionStatus('connected');
      toast.success('Test message sent successfully to Slack');
    } catch (error) {
      console.error('Error testing Slack integration:', error);
      setConnectionStatus('error');
      toast.error(`Failed to send test message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTesting(false);
    }
  };

  // Add this new function to test different notification types
  const testNotificationType = async (type: string) => {
    setIsTesting(true);
    try {
      // Create a sample delivery request for testing
      const sampleRequest = {
        id: `TEST-${Math.floor(Math.random() * 10000)}`,
        pickup_location: 'Memorial Hospital',
        delivery_location: 'Central Medical Center',
        status: 'pending',
        priority: 'high',
        packageType: 'Medical Samples',
        distance: 5.2,
        trackingId: `TRK-${Math.floor(Math.random() * 10000)}`,
      };
      
      let success = false;
      
      switch(type) {
        case 'new_request':
          success = await sendNewRequestNotification(sampleRequest);
          break;
        case 'status_update':
          success = await sendStatusUpdateNotification(sampleRequest, 'in_progress', 'Driver on the way');
          break;
        default:
          // Just test the basic integration
          success = await testSlackIntegration();
          break;
      }
      
      if (success) {
        toast.success(`Test ${type} notification sent successfully`);
      } else {
        toast.error(`Failed to send ${type} notification`);
      }
    } catch (error) {
      console.error('Error testing notification:', error);
      toast.error('Error during test: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Slack Integration</CardTitle>
        <CardDescription>
          Receive real-time notifications in Slack for new requests and status updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ConnectionStatus status={connectionStatus} />
        
        <div className="space-y-2">
          <Label htmlFor="webhook-url">Webhook URL</Label>
          <Input
            id="webhook-url"
            placeholder="https://hooks.slack.com/services/TXXXXXX/BXXXXXX/XXXXXXXX"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Create a webhook URL in your Slack workspace settings under the "Incoming Webhooks" section.
            The URL must start with "https://hooks.slack.com/services/".
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="channel-id">Channel ID (Optional)</Label>
          <Input
            id="channel-id"
            placeholder="C12345678"
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            The channel ID where notifications will be sent (if different from webhook default)
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications-enabled">Enable Notifications</Label>
            <p className="text-xs text-muted-foreground">
              Turn Slack notifications on or off
            </p>
          </div>
          <Switch
            id="notifications-enabled"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>
        
        <SlackPreview />

        {isConfigured && (
          <div className="space-y-2 mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <Label>Test Notifications</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2" 
                onClick={() => setShowTestPanel(!showTestPanel)}
              >
                {showTestPanel ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
            
            {showTestPanel && (
              <div className="space-y-4 mt-2">
                <p className="text-sm text-muted-foreground">
                  Send test notifications to verify different notification types.
                </p>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotificationType('new_request')}
                    disabled={isTesting}
                  >
                    Test New Request
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotificationType('status_update')}
                    disabled={isTesting}
                  >
                    Test Status Update
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={testSlackIntegration}
          disabled={isTesting || isSaving || (!isConfigured && !webhookUrl)}
        >
          {isTesting ? 'Sending...' : 'Test Integration'}
        </Button>
        <Button onClick={handleSave} disabled={isSaving || !webhookUrl}>
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SlackIntegrationCard; 