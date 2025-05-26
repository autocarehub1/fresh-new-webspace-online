import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { sendSlackNotification, testSlackConnection, getSlackConnectionStatus, disconnectSlack } from '@/services/slackService';
import { DeliveryRequest } from '@/types/delivery';

const SlackIntegrationCard: React.FC = () => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [slackWebhookUrl, setSlackWebhookUrl] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Fetch connection status
  const { data: isConnected, isLoading: isStatusLoading } = useQuery({
    queryKey: ['slackConnectionStatus'],
    queryFn: getSlackConnectionStatus,
    retry: false,
  });
  
  // Mutation for testing the connection
  const testConnectionMutation = useMutation({
    mutationFn: testSlackConnection,
    onSuccess: () => {
      toast.success('Slack connection test successful!');
    },
    onError: (error: any) => {
      toast.error(`Slack connection test failed: ${error.message || 'Unknown error'}`);
    },
    onSettled: () => {
      setIsTesting(false);
    },
  });
  
  // Mutation for disconnecting Slack
  const disconnectMutation = useMutation({
    mutationFn: disconnectSlack,
    onSuccess: () => {
      toast.success('Slack disconnected successfully!');
      setIsConfigured(false);
      setSlackWebhookUrl('');
    },
    onError: (error: any) => {
      toast.error(`Failed to disconnect Slack: ${error.message || 'Unknown error'}`);
    },
    onSettled: () => {
      setIsDisconnecting(false);
    },
  });
  
  useEffect(() => {
    if (isConnected !== undefined) {
      setIsConfigured(isConnected);
    }
  }, [isConnected]);
  
  const handleWebhookChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlackWebhookUrl(e.target.value);
  };
  
  const handleConnect = async () => {
    if (!slackWebhookUrl) {
      setErrorMessage('Please enter a Slack Webhook URL');
      return;
    }
    
    setIsConnecting(true);
    setErrorMessage('');
    
    try {
      const result = await testSlackConnection(slackWebhookUrl);
      
      if (result) {
        toast.success('Slack connection successful!');
        setIsConfigured(true);
      } else {
        setErrorMessage('Failed to connect to Slack. Please check your Webhook URL.');
        toast.error('Failed to connect to Slack. Please check your Webhook URL.');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to connect to Slack');
      toast.error('Failed to connect to Slack');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTestMessage = async () => {
    if (!isConnected) {
      toast.error('Please connect to Slack first');
      return;
    }
    
    try {
      setIsTesting(true);
      
      const testDelivery: DeliveryRequest = {
        id: 'test-123',
        pickup_location: '123 Medical Center Dr, Boston, MA',
        delivery_location: '456 Hospital Ave, Cambridge, MA',
        status: 'in_progress' as const,
        priority: 'urgent' as const,
        packageType: 'Lab Samples',
        distance: 2.5,
        trackingId: 'TRK-TEST-001',
        created_at: new Date().toISOString() // Add required field
      };
      
      const result = await sendSlackNotification(testDelivery, 'new_delivery');
      
      if (result) {
        const urgentTestDelivery: DeliveryRequest = {
          ...testDelivery,
          id: 'test-urgent-123',
          status: 'completed' as const,
          created_at: new Date().toISOString() // Add required field
        };
        
        await sendSlackNotification(urgentTestDelivery, 'delivery_completed');
        
        toast.success('Test notifications sent successfully!');
      } else {
        toast.error('Failed to send test notification');
      }
    } catch (error) {
      console.error('Test notification error:', error);
      toast.error('Failed to send test notification');
    } finally {
      setIsTesting(false);
    }
  };
  
  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await disconnectMutation.mutateAsync();
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Failed to disconnect Slack');
    } finally {
      setIsDisconnecting(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-slack mr-2 h-5 w-5 text-medical-blue"><path d="M3 8h3v8.3c0 .4.3.7.7.7H3"/><path d="M6 8h3v8.3c0 .4.3.7.7.7H6"/><path d="M15 8h3v8.3c0 .4.3.7.7.7h-3"/><path d="M12 8h3v8.3c0 .4.3.7.7.7h-3"/><path d="M8 3h8v3c0 .6-.4 1-1 1H9c-.6 0-1-.4-1-1V3"/><path d="M8 6h8v3c0 .6-.4 1-1 1H9c-.6 0-1-.4-1-1V6"/><path d="M8 15h8v3c0 .6-.4 1-1 1H9c-.6 0-1-.4-1-1v-3"/><path d="M8 12h8v3c0 .6-.4 1-1 1H9c-.6 0-1-.4-1-1v-3"/></svg>
          Slack Integration
        </CardTitle>
        <CardDescription>
          Receive real-time delivery updates directly in your Slack channels.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isStatusLoading ? (
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : isConfigured ? (
          <div className="space-y-4">
            <div className="flex items-center text-green-600">
              <CheckCircle2 className="mr-2 h-5 w-5" />
              <span className="font-medium">Slack integration is active</span>
            </div>
            <p className="text-sm text-gray-500">
              Delivery updates will be sent to your Slack channel in real-time.
            </p>
            <Button
              variant="destructive"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
            >
              {isDisconnecting ? 'Disconnecting...' : 'Disconnect Slack'}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
              <Input
                id="slack-webhook"
                placeholder="Enter your Slack Webhook URL"
                type="url"
                value={slackWebhookUrl}
                onChange={handleWebhookChange}
                disabled={isConnecting}
              />
              {errorMessage && (
                <div className="text-red-500 text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errorMessage}
                </div>
              )}
            </div>
            <Button onClick={handleConnect} disabled={isConnecting}>
              {isConnecting ? 'Connecting...' : 'Connect to Slack'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleTestMessage}
              disabled={isTesting}
            >
              {isTesting ? 'Testing...' : 'Send Test Message'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SlackIntegrationCard;
