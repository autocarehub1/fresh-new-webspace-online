
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { EmailService } from '@/services/emailService';
import { CheckCircle, XCircle, Mail, AlertTriangle, Info, Send } from 'lucide-react';

const EmailDiagnostics = () => {
  const [testEmail, setTestEmail] = useState('');
  const [customSubject, setCustomSubject] = useState('Test Email from Catalyst Network');
  const [customMessage, setCustomMessage] = useState('This is a test email to verify our Gmail SMTP system is working correctly.');
  const [emailType, setEmailType] = useState('welcome');
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runConnectionTest = async () => {
    setLoading(true);
    try {
      console.log('Running Gmail SMTP connection test...');
      const result = await EmailService.testEmailSystem();
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
      console.log('Sending test email to:', testEmail, 'Type:', emailType);
      
      let result;
      
      if (emailType === 'welcome') {
        result = await EmailService.sendDriverWelcomeEmail(
          testEmail,
          'Test Driver',
          'test-user-id'
        );
      } else if (emailType === 'delivery') {
        result = await EmailService.sendDeliveryNotification(
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
        result = await EmailService.sendCustomEmail(
          [testEmail],
          customSubject,
          customMessage,
          false
        );
      }
      
      setTestResults({ 
        success: result?.success || false, 
        message: result?.success ? `${emailType} email sent successfully via Gmail!` : `Failed to send ${emailType} email`,
        type: emailType,
        error: result?.error
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
            Gmail SMTP Email System Diagnostics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Test */}
          <div className="space-y-2">
            <Label>Gmail SMTP Connection Test</Label>
            <Button onClick={runConnectionTest} disabled={loading}>
              {loading ? 'Testing...' : 'Test Gmail Connection'}
            </Button>
          </div>

          {/* Email Testing Section */}
          <div className="space-y-4 border-t pt-4">
            <Label className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Send Test Email via Gmail
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
                          <div>Service: {testResults.details.service}</div>
                          <div>Endpoint: {testResults.details.endpoint}</div>
                          <div>Timestamp: {testResults.details.timestamp}</div>
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
              Gmail Configuration Status
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Gmail Email:</span>
                <span className="text-green-600">catnetlogistics@gmail.com</span>
              </div>
              <div className="flex justify-between">
                <span>Email Service:</span>
                <span className="text-green-600">Gmail SMTP via Supabase</span>
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
