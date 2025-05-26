import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SlackIntegrationCard from './SlackIntegrationCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
// @ts-ignore - React component without TypeScript definition
import SlackDebugger from '../../SlackDebugger';

export interface SettingsTabProps {
  // Additional props if needed
}

const SettingsTab = () => {
  // Direct test function that bypasses all the hooks and components
  const testSlackDirectly = async () => {
    try {
      toast.info("Sending direct test message to Slack...");
      
      const webhookUrl = 'https://hooks.slack.com/services/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';
      const channelId = 'C08S18NP5JA';
      
      const testMessage = {
        text: "🔍 Direct Test Message from Settings Page",
        channel: channelId,
        blocks: [
          {
            "type": "header",
            "text": {
              "type": "plain_text",
              "text": "🔍 Manual Test Message",
              "emoji": true
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "This is a direct test from the Settings page, bypassing the normal notification system."
            }
          },
          {
            "type": "context",
            "elements": [
              {
                "type": "mrkdwn",
                "text": "Sent: " + new Date().toLocaleString()
              }
            ]
          }
        ]
      };
      
      console.log("Sending direct message to Slack webhook:", webhookUrl.slice(0, 30) + "...");
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testMessage)
      });
      
      const text = await response.text();
      
      if (response.ok) {
        console.log("Direct Slack test response:", text);
        toast.success("Direct test successful! Check Slack channel");
      } else {
        console.error("Direct Slack test failed:", text);
        toast.error("Direct test failed: " + text);
      }
    } catch (error) {
      console.error("Error in direct Slack test:", error);
      toast.error("Error in direct test: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-medical-blue">System Settings</h2>
      
      <Tabs defaultValue="integrations" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="debug">Debugging</TabsTrigger>
        </TabsList>
        
        <TabsContent value="integrations" className="space-y-6">
          <div className="flex justify-end mb-4">
            <Button 
              variant="outline" 
              onClick={testSlackDirectly}
            >
              Direct Slack Test
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SlackIntegrationCard />
            
            <Card>
              <CardHeader>
                <CardTitle>Email Integration</CardTitle>
                <CardDescription>
                  Configure email settings for notifications and invoices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Email settings are already configured in the Billing & Invoicing tab.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>System Preferences</CardTitle>
              <CardDescription>
                Configure system-wide preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">System preferences settings will be added in a future update.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security and access control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Security settings will be added in a future update.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="debug">
          <Card>
            <CardHeader>
              <CardTitle>Debugging Tools</CardTitle>
              <CardDescription>
                Tools for testing and debugging system integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SlackDebugger />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsTab; 