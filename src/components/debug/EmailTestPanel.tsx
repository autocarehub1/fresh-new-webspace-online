
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmailConfirmationHelper } from '@/scripts/emailConfirmationHelper';
import { toast } from 'sonner';
import { Mail, Settings, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const EmailTestPanel: React.FC = () => {
  const [testEmail, setTestEmail] = useState('');
  const [customSubject, setCustomSubject] = useState('Test Email from Catalyst Network');
  const [customMessage, setCustomMessage] = useState('This is a test email to verify the email system is working correctly.');
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosticsResults, setDiagnosticsResults] = useState<any>(null);

  const handleGmailTest = async () => {
    setIsLoading(true);
    try {
      const result = await EmailConfirmationHelper.testGmailSetup();
      if (result.success) {
        toast.success('Gmail setup test completed successfully!');
      } else {
        toast.error(`Gmail test failed: ${result.error}`);
      }
    } catch (error: any) {
      toast.error(`Test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecretsCheck = async () => {
    setIsLoading(true);
    try {
      const result = await EmailConfirmationHelper.checkGmailSecrets();
      if (result.configured) {
        toast.success(result.details);
      } else {
        toast.error(result.details);
      }
    } catch (error: any) {
      toast.error(`Secrets check failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmationTest = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await EmailConfirmationHelper.testConfirmationEmail(testEmail);
      if (result.success) {
        toast.success(`Confirmation email sent to ${testEmail}!`);
      } else {
        toast.error(`Confirmation test failed: ${result.error}`);
      }
    } catch (error: any) {
      toast.error(`Confirmation test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomEmailTest = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await EmailConfirmationHelper.sendCustomTestEmail(
        testEmail,
        customSubject,
        customMessage
      );
      if (result.success) {
        toast.success(`Custom email sent to ${testEmail}!`);
      } else {
        toast.error(`Custom email failed: ${result.error}`);
      }
    } catch (error: any) {
      toast.error(`Custom email failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFullDiagnostics = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address for diagnostics');
      return;
    }
    
    setIsLoading(true);
    try {
      const results = await EmailConfirmationHelper.runDiagnostics(testEmail);
      setDiagnosticsResults(results);
      EmailConfirmationHelper.logDiagnostics(results);
      
      if (results.overall) {
        toast.success('All email systems are functioning correctly!');
      } else {
        toast.warning('Some email system issues detected. Check the results below.');
      }
    } catch (error: any) {
      toast.error(`Diagnostics failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const StatusBadge: React.FC<{ success: boolean; text: string }> = ({ success, text }) => (
    <Badge variant={success ? "default" : "destructive"} className="flex items-center gap-1">
      {success ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {text}
    </Badge>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email System Testing Panel
          </CardTitle>
          <CardDescription>
            Test and diagnose your Gmail email configuration for delivery confirmations
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={handleSecretsCheck}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Check Gmail Secrets
            </Button>

            <Button 
              onClick={handleGmailTest}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Test Gmail Setup
            </Button>

            <Button 
              onClick={handleConfirmationTest}
              disabled={isLoading || !testEmail}
              variant="outline"
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Test Confirmation Email
            </Button>

            <Button 
              onClick={handleFullDiagnostics}
              disabled={isLoading || !testEmail}
              className="flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Run Full Diagnostics
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customSubject">Custom Email Subject</Label>
              <Input
                id="customSubject"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customMessage">Custom Email Message</Label>
              <Textarea
                id="customMessage"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
              />
            </div>

            <Button 
              onClick={handleCustomEmailTest}
              disabled={isLoading || !testEmail}
              variant="secondary"
              className="w-full"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Send Custom Test Email
            </Button>
          </div>
        </CardContent>
      </Card>

      {diagnosticsResults && (
        <Card>
          <CardHeader>
            <CardTitle>Diagnostics Results</CardTitle>
            <CardDescription>
              Comprehensive email system test results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Gmail Setup:</span>
                <StatusBadge success={diagnosticsResults.gmailSetup.success} text={diagnosticsResults.gmailSetup.success ? "PASS" : "FAIL"} />
              </div>
              
              <div className="flex items-center justify-between">
                <span>Secrets Configuration:</span>
                <StatusBadge success={diagnosticsResults.secretsCheck.configured} text={diagnosticsResults.secretsCheck.configured ? "CONFIGURED" : "MISSING"} />
              </div>
              
              <div className="flex items-center justify-between">
                <span>Confirmation Email:</span>
                <StatusBadge success={diagnosticsResults.confirmationTest.success} text={diagnosticsResults.confirmationTest.success ? "SENT" : "FAILED"} />
              </div>
              
              <div className="flex items-center justify-between">
                <span>Custom Email:</span>
                <StatusBadge success={diagnosticsResults.customEmailTest.success} text={diagnosticsResults.customEmailTest.success ? "SENT" : "FAILED"} />
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="font-semibold">Overall Status:</span>
                <StatusBadge success={diagnosticsResults.overall} text={diagnosticsResults.overall ? "ALL SYSTEMS GO" : "ISSUES DETECTED"} />
              </div>

              {!diagnosticsResults.secretsCheck.configured && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Configuration Issue:</strong> {diagnosticsResults.secretsCheck.details}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmailTestPanel;
