
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BrevoEmailService } from '@/services/brevoEmailService';
import { CheckCircle, XCircle, Mail, AlertTriangle, Info, Send } from 'lucide-react';

const EmailDiagnostics = () => {
  const [testEmail, setTestEmail] = useState('');
  const [customSubject, setCustomSubject] = useState('Test Email from Catalyst Network');
  const [customMessage, setCustomMessage] = useState('This is a test email to verify our email system is working correctly.');
  const [emailType, setEmailType] = useState('welcome');
  const [testResults, setTestResults] = useState<any>(null);
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runConnectionTest = async () => {
    setLoading(true);
    try {
      console.log('Running enhanced Brevo connection test...');
      const result = await BrevoEmailService.testConnection();
      setTestResults(result);
      
      if (result.success) {
        // Also get account info
        const accountResult = await BrevoEmailService.getAccountInfo();
        if (accountResult.success) {
          setAccountInfo(accountResult.data);
        }
      }
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
      console.log('Sending test email to:', testEmail, 'Type:', emailType);
      
      let success = false;
      
      if (emailType === 'welcome') {
        success = await BrevoEmailService.sendDriverSignupWelcomeEmail(
          testEmail,
          'Test Driver',
          'test-user-id'
        );
      } else if (emailType === 'delivery') {
        success = await BrevoEmailService.sendDeliveryStatusNotification(
          testEmail,
          'in_transit',
          {
            trackingId: 'TEST-' + Date.now(),
            pickup_location: '123 Test Street, Test City',
            delivery_location: '456 Demo Avenue, Demo City',
            assigned_driver: 'John Doe'
          }
        );
      } else if (emailType === 'custom') {
        success = await BrevoEmailService.sendCustomEmail(
          [{ email: testEmail, name: 'Test User' }],
          customSubject,
          `<p>${customMessage}</p>`,
          customMessage,
          undefined,
          ['test', 'custom']
        );
      }
      
      setTestResults({ 
        success, 
        message: success ? `${emailType} email sent successfully!` : `Failed to send ${emailType} email`,
        type: emailType
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
            Enhanced Email System Diagnostics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Test */}
          <div className="space-y-2">
            <Label>Brevo API Connection Test</Label>
            <Button onClick={runConnectionTest} disabled={loading}>
              {loading ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>

          {/* Account Information */}
          {accountInfo && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Account Information
              </Label>
              <div className="bg-blue-50 p-3 rounded-md text-sm">
                <div><strong>Company:</strong> {accountInfo.companyName || 'Not set'}</div>
                {accountInfo.plan && accountInfo.plan[0] && (
                  <>
                    <div><strong>Plan:</strong> {accountInfo.plan[0].type}</div>
                    <div><strong>Credits Remaining:</strong> {accountInfo.plan[0].creditsRemaining || 'Unlimited'}</div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Email Testing Section */}
          <div className="space-y-4 border-t pt-4">
            <Label className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Send Test Email
            </Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="testEmail">Recipient Email</Label>
                <Input
                  id="testEmail"
                  type="email"
                  placeholder="Enter test email address"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailType">Email Type</Label>
                <Select value={emailType} onValueChange={setEmailType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select email type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Driver Welcome Email</SelectItem>
                    <SelectItem value="delivery">Delivery Status Update</SelectItem>
                    <SelectItem value="custom">Custom Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {emailType === 'custom' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customSubject">Subject</Label>
                  <Input
                    id="customSubject"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Enter email subject"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customMessage">Message</Label>
                  <Textarea
                    id="customMessage"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Enter email message"
                    rows={4}
                  />
                </div>
              </div>
            )}

            <Button 
              onClick={sendTestEmail} 
              disabled={loading || !testEmail}
              className="w-full md:w-auto"
            >
              {loading ? 'Sending...' : `Send ${emailType === 'welcome' ? 'Welcome' : emailType === 'delivery' ? 'Delivery Status' : 'Custom'} Email`}
            </Button>
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
                    <div>
                      <div>{testResults.message || 'Operation completed successfully!'}</div>
                      {testResults.details && (
                        <div className="mt-2 text-xs">
                          <div>Account: {testResults.details.accountName}</div>
                          <div>Plan: {testResults.details.plan}</div>
                          <div>Credits: {testResults.details.emailsRemaining}</div>
                        </div>
                      )}
                    </div>
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
              <div className="flex justify-between">
                <span>API Key Length:</span>
                <span>{import.meta.env.VITE_BREVO_API_KEY?.length || 0} characters</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailDiagnostics;
