
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BrevoEmailService } from '@/services/brevoEmailService';
import { CheckCircle, XCircle, Mail, AlertTriangle } from 'lucide-react';

const EmailDiagnostics = () => {
  const [testEmail, setTestEmail] = useState('');
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runConnectionTest = async () => {
    setLoading(true);
    try {
      console.log('Running Brevo connection test...');
      const result = await BrevoEmailService.testConnection();
      setTestResults(result);
    } catch (error: any) {
      setTestResults({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) return;
    
    setLoading(true);
    try {
      console.log('Sending test welcome email to:', testEmail);
      const success = await BrevoEmailService.sendDriverSignupWelcomeEmail(
        testEmail,
        'Test Driver',
        'test-user-id'
      );
      
      setTestResults({ 
        success, 
        message: success ? 'Test email sent successfully!' : 'Failed to send test email'
      });
    } catch (error: any) {
      setTestResults({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email System Diagnostics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Test */}
          <div className="space-y-2">
            <Label>Brevo API Connection Test</Label>
            <Button onClick={runConnectionTest} disabled={loading}>
              {loading ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>

          {/* Test Email */}
          <div className="space-y-2">
            <Label htmlFor="testEmail">Send Test Welcome Email</Label>
            <div className="flex gap-2">
              <Input
                id="testEmail"
                type="email"
                placeholder="Enter test email address"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
              <Button onClick={sendTestEmail} disabled={loading || !testEmail}>
                {loading ? 'Sending...' : 'Send Test'}
              </Button>
            </div>
          </div>

          {/* Results */}
          {testResults && (
            <Alert className={testResults.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <div className="flex items-center gap-2">
                {testResults.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  {testResults.success ? (
                    testResults.message || 'Operation completed successfully!'
                  ) : (
                    `Error: ${testResults.error || 'Unknown error occurred'}`
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Environment Check */}
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Environment Check
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Brevo API Key:</span>
                <span className={import.meta.env.VITE_BREVO_API_KEY ? 'text-green-600' : 'text-red-600'}>
                  {import.meta.env.VITE_BREVO_API_KEY ? 'Configured' : 'Missing'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Current Environment:</span>
                <span>{import.meta.env.MODE}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailDiagnostics;
