
import { supabase } from '@/lib/supabase';
import { EmailService } from '@/services/emailService';

interface EmailTestResult {
  success: boolean;
  error?: string;
  messageId?: string;
  timestamp: string;
}

export class EmailConfirmationHelper {
  
  // Test Gmail configuration and connectivity
  static async testGmailSetup(): Promise<EmailTestResult> {
    console.log('🔧 Testing Gmail SMTP setup...');
    
    try {
      const result = await EmailService.testEmailSystem();
      
      return {
        success: result.success,
        error: result.error,
        messageId: result.details?.timestamp,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Gmail setup test failed:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Test sending a confirmation email with sample data
  static async testConfirmationEmail(testEmail: string): Promise<EmailTestResult> {
    console.log('📧 Testing confirmation email sending...');
    
    try {
      const sampleRequestData = {
        requestId: `TEST-${Date.now()}`,
        trackingId: `TRK-TEST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        customerName: 'Test Customer',
        customerEmail: testEmail,
        pickupLocation: '123 Test Pickup St, Test City, TC 12345',
        deliveryLocation: '456 Test Delivery Ave, Test Town, TT 67890',
        serviceType: 'Test Delivery Service',
        priority: 'normal',
        specialInstructions: 'This is a test email - please ignore',
        estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleString()
      };

      const result = await EmailService.sendRequestConfirmationEmail(sampleRequestData);
      
      return {
        success: result.success,
        error: result.error,
        messageId: 'test-confirmation',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Confirmation email test failed:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Check Supabase secrets configuration
  static async checkGmailSecrets(): Promise<{ configured: boolean; details: string }> {
    console.log('🔍 Checking Gmail secrets configuration...');
    
    try {
      // Test if the Gmail function is accessible
      const { data, error } = await supabase.functions.invoke('send-gmail-email', {
        body: {
          to: [{ email: 'test@example.com' }],
          subject: 'Configuration Test',
          htmlContent: '<p>Test</p>',
          type: 'config-test'
        }
      });

      if (error) {
        if (error.message.includes('Gmail credentials not configured')) {
          return {
            configured: false,
            details: 'Gmail password not found in Supabase secrets. Please add GMAIL_PASSWORD to your Supabase project secrets.'
          };
        }
        return {
          configured: false,
          details: `Configuration error: ${error.message}`
        };
      }

      return {
        configured: true,
        details: 'Gmail secrets appear to be configured correctly'
      };
    } catch (error: any) {
      return {
        configured: false,
        details: `Error checking configuration: ${error.message}`
      };
    }
  }

  // Send a custom test email
  static async sendCustomTestEmail(
    recipient: string,
    subject: string,
    message: string
  ): Promise<EmailTestResult> {
    console.log('📤 Sending custom test email...');
    
    try {
      const result = await EmailService.sendCustomEmail(
        [recipient],
        subject,
        message,
        false
      );
      
      return {
        success: result.success,
        error: result.error,
        messageId: result.messageId,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Custom test email failed:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Run comprehensive email system diagnostics
  static async runDiagnostics(testEmail: string): Promise<{
    gmailSetup: EmailTestResult;
    secretsCheck: { configured: boolean; details: string };
    confirmationTest: EmailTestResult;
    customEmailTest: EmailTestResult;
    overall: boolean;
  }> {
    console.log('🚀 Running comprehensive email diagnostics...');
    
    const gmailSetup = await this.testGmailSetup();
    const secretsCheck = await this.checkGmailSecrets();
    const confirmationTest = await this.testConfirmationEmail(testEmail);
    const customEmailTest = await this.sendCustomTestEmail(
      testEmail,
      'Email System Diagnostic Test',
      'This is a diagnostic test email from your Catalyst Network Logistics system. If you receive this, your email configuration is working correctly.'
    );

    const overall = gmailSetup.success && secretsCheck.configured && confirmationTest.success && customEmailTest.success;

    return {
      gmailSetup,
      secretsCheck,
      confirmationTest,
      customEmailTest,
      overall
    };
  }

  // Helper to log results in a readable format
  static logDiagnostics(results: any) {
    console.log('\n📊 EMAIL DIAGNOSTICS RESULTS:');
    console.log('================================');
    
    console.log(`\n🔧 Gmail Setup: ${results.gmailSetup.success ? '✅ PASS' : '❌ FAIL'}`);
    if (!results.gmailSetup.success) {
      console.log(`   Error: ${results.gmailSetup.error}`);
    }
    
    console.log(`\n🔐 Secrets Configuration: ${results.secretsCheck.configured ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Details: ${results.secretsCheck.details}`);
    
    console.log(`\n📧 Confirmation Email Test: ${results.confirmationTest.success ? '✅ PASS' : '❌ FAIL'}`);
    if (!results.confirmationTest.success) {
      console.log(`   Error: ${results.confirmationTest.error}`);
    }
    
    console.log(`\n📤 Custom Email Test: ${results.customEmailTest.success ? '✅ PASS' : '❌ FAIL'}`);
    if (!results.customEmailTest.success) {
      console.log(`   Error: ${results.customEmailTest.error}`);
    }
    
    console.log(`\n🎯 Overall Status: ${results.overall ? '✅ ALL SYSTEMS GO' : '❌ ISSUES DETECTED'}`);
    console.log('================================\n');
  }
}

// Export utility functions for easy console usage
export const emailHelpers = {
  test: EmailConfirmationHelper.testGmailSetup,
  checkSecrets: EmailConfirmationHelper.checkGmailSecrets,
  testConfirmation: EmailConfirmationHelper.testConfirmationEmail,
  sendTest: EmailConfirmationHelper.sendCustomTestEmail,
  diagnose: EmailConfirmationHelper.runDiagnostics,
  log: EmailConfirmationHelper.logDiagnostics
};

// Console usage examples:
// await emailHelpers.test()
// await emailHelpers.checkSecrets()
// await emailHelpers.testConfirmation('your-email@example.com')
// await emailHelpers.sendTest('your-email@example.com', 'Test Subject', 'Test message')
// const results = await emailHelpers.diagnose('your-email@example.com'); emailHelpers.log(results)
