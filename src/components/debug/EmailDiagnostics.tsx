
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const EmailDiagnostics: React.FC = () => {
  const [testEmail, setTestEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const testGmailFunction = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Testing Gmail function...');
      
      const { data, error } = await supabase.functions.invoke('send-gmail-email', {
        body: {
          to: [{ email: testEmail, name: 'Test User' }],
          subject: 'Test Email from Catalyst Network Logistics',
          htmlContent: '<h1>Test Email</h1><p>This is a test email to verify your Gmail configuration is working.</p>',
          textContent: 'Test Email - This is a test email to verify your Gmail configuration is working.',
          type: 'test'
        }
      });

      if (error) {
        console.error('Gmail function error:', error);
        setTestResults({ success: false, error: error.message, function: 'send-gmail-email' });
        toast.error(`Gmail test failed: ${error.message}`);
      } else {
        console.log('Gmail function success:', data);
        setTestResults({ success: true, data, function: 'send-gmail-email' });
        toast.success('Gmail test email sent successfully!');
      }
    } catch (error: any) {
      console.error('Gmail function test error:', error);
      setTestResults({ success: false, error: error.message, function: 'send-gmail-email' });
      toast.error(`Test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testConfirmationFunction = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Testing confirmation email function...');
      
      const { data, error } = await supabase.functions.invoke('send-delivery-emails', {
        body: {
          type: 'confirmation',
          requestData: {
            requestId: `TEST-${Date.now()}`,
            trackingId: `TRK-TEST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            customerName: 'Test Customer',
            customerEmail: testEmail,
            pickupLocation: '123 Test Pickup St, Test City, TC 12345',
            deliveryLocation: '456 Test Delivery Ave, Test Town, TT 67890',
            serviceType: 'Medical Delivery Test',
            priority: 'normal',
            specialInstructions: 'This is a test email - please ignore',
            estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleString()
          }
        }
      });

      if (error) {
        console.error('Confirmation function error:', error);
        setTestResults({ success: false, error: error.message, function: 'send-delivery-emails' });
        toast.error(`Confirmation test failed: ${error.message}`);
      } else {
        console.log('Confirmation function success:', data);
        setTestResults({ success: true, data, function: 'send-delivery-emails' });
        toast.success('Confirmation test email sent successfully!');
      }
    } catch (error: any) {
      console.error('Confirmation function test error:', error);
      setTestResults({ success: false, error: error.message, function: 'send-delivery-emails' });
      toast.error(`Test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testCompletionFunction = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Testing completion email function...');
      
      const { data, error } = await supabase.functions.invoke('send-delivery-emails', {
        body: {
          type: 'completion',
          completionData: {
            requestId: `TEST-${Date.now()}`,
            trackingId: `TRK-TEST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            customerName: 'Test Customer',
            customerEmail: testEmail,
            pickupLocation: '123 Test Pickup St, Test City, TC 12345',
            deliveryLocation: '456 Test Delivery Ave, Test Town, TT 67890',
            completedAt: new Date().toISOString(),
            driverName: 'Test Driver',
            deliveryPhotoUrl: 'https://via.placeholder.com/400x300.png?text=Test+Delivery+Photo'
          }
        }
      });

      if (error) {
        console.error('Completion function error:', error);
        setTestResults({ success: false, error: error.message, function: 'send-delivery-emails' });
        toast.error(`Completion test failed: ${error.message}`);
      } else {
        console.log('Completion function success:', data);
        setTestResults({ success: true, data, function: 'send-delivery-emails' });
        toast.success('Completion test email sent successfully!');
      }
    } catch (error: any) {
      console.error('Completion function test error:', error);
      setTestResults({ success: false, error: error.message, function: 'send-delivery-emails' });
      toast.error(`Test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Functions Test Panel
          </CardTitle>
          <CardDescription>
            Test your deployed Supabase Edge Functions for email delivery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="testEmail">Test Email Address</Label>
            <Input
              id="testEmail"
              type="email"
              placeholder="your-email@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={testGmailFunction}
              disabled={isLoading || !testEmail}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Test Gmail Function
            </Button>

            <Button 
              onClick={testConfirmationFunction}
              disabled={isLoading || !testEmail}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Test Confirmation Email
            </Button>

            <Button 
              onClick={testCompletionFunction}
              disabled={isLoading || !testEmail}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Test Completion Email
            </Button>
          </div>
        </CardContent>
      </Card>

      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Function: {testResults.function}</span>
                <Badge variant={testResults.success ? "default" : "destructive"} className="flex items-center gap-1">
                  {testResults.success ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  {testResults.success ? "SUCCESS" : "FAILED"}
                </Badge>
              </div>
              
              {testResults.error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Error:</strong> {testResults.error}
                  </AlertDescription>
                </Alert>
              )}
              
              {testResults.success && testResults.data && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Email sent successfully! Message ID: {testResults.data.messageId || 'Generated'}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Common Issues & Solutions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Gmail credentials not configured:</strong> Make sure you've set <code>GMAIL_EMAIL</code> and <code>GMAIL_PASSWORD</code> in your Supabase Edge Function secrets.
            </div>
            <div>
              <strong>Gmail password issues:</strong> Use an App Password, not your regular Gmail password. Enable 2FA first, then generate an App Password.
            </div>
            <div>
              <strong>Function not found:</strong> Ensure the functions are deployed: <code>supabase functions deploy send-gmail-email</code> and <code>supabase functions deploy send-delivery-emails</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailDiagnostics;
