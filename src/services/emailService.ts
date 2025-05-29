
import { BrevoEmailService } from './brevoEmailService';
import { toast } from 'sonner';

export interface EmailResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

export class EmailService {
  // Driver-related emails
  static async sendDriverWelcomeEmail(
    email: string,
    driverName: string,
    userId: string
  ): Promise<EmailResult> {
    try {
      console.log('EmailService: Sending driver welcome email to:', email);
      
      const success = await BrevoEmailService.sendDriverSignupWelcomeEmail(
        email,
        driverName,
        userId
      );
      
      if (success) {
        toast.success('Welcome email sent successfully!');
        return { success: true };
      } else {
        toast.error('Failed to send welcome email');
        return { success: false, error: 'Email service returned false' };
      }
    } catch (error: any) {
      console.error('EmailService: Welcome email failed:', error);
      toast.error('Failed to send welcome email');
      return { success: false, error: error.message };
    }
  }

  // Delivery-related emails
  static async sendDeliveryNotification(
    email: string,
    status: string,
    deliveryData: any
  ): Promise<EmailResult> {
    try {
      console.log('EmailService: Sending delivery notification to:', email, 'Status:', status);
      
      const success = await BrevoEmailService.sendDeliveryStatusNotification(
        email,
        status,
        deliveryData
      );
      
      if (success) {
        return { success: true };
      } else {
        return { success: false, error: 'Email service returned false' };
      }
    } catch (error: any) {
      console.error('EmailService: Delivery notification failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Generic email sending
  static async sendCustomEmail(
    recipients: string[],
    subject: string,
    message: string,
    isHtml: boolean = false
  ): Promise<EmailResult> {
    try {
      console.log('EmailService: Sending custom email to:', recipients);
      
      const recipientObjects = recipients.map(email => ({ email }));
      
      const success = await BrevoEmailService.sendCustomEmail(
        recipientObjects,
        subject,
        isHtml ? message : `<p>${message}</p>`,
        isHtml ? undefined : message,
        undefined,
        ['custom']
      );
      
      if (success) {
        toast.success('Email sent successfully!');
        return { success: true };
      } else {
        toast.error('Failed to send email');
        return { success: false, error: 'Email service returned false' };
      }
    } catch (error: any) {
      console.error('EmailService: Custom email failed:', error);
      toast.error('Failed to send email');
      return { success: false, error: error.message };
    }
  }

  // Email templates
  static async sendPasswordResetEmail(
    email: string,
    resetToken: string
  ): Promise<EmailResult> {
    const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;
    
    const htmlContent = `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset for your Catalyst Network Logistics account.</p>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}" style="background: #0A2463; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't request this reset, please ignore this email.</p>
    `;
    
    try {
      const success = await BrevoEmailService.sendCustomEmail(
        [{ email }],
        'Password Reset - Catalyst Network Logistics',
        htmlContent,
        undefined,
        undefined,
        ['password-reset']
      );
      
      return { success };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async sendAccountVerificationEmail(
    email: string,
    verificationToken: string
  ): Promise<EmailResult> {
    const verificationUrl = `${window.location.origin}/verify-email?token=${verificationToken}`;
    
    const htmlContent = `
      <h2>Verify Your Email Address</h2>
      <p>Thank you for signing up with Catalyst Network Logistics!</p>
      <p>Please click the link below to verify your email address:</p>
      <p><a href="${verificationUrl}" style="background: #0A2463; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
      <p>If you didn't create this account, please ignore this email.</p>
    `;
    
    try {
      const success = await BrevoEmailService.sendCustomEmail(
        [{ email }],
        'Verify Your Email - Catalyst Network Logistics',
        htmlContent,
        undefined,
        undefined,
        ['email-verification']
      );
      
      return { success };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // System health check
  static async testEmailSystem(): Promise<EmailResult & { details?: any }> {
    try {
      const result = await BrevoEmailService.testConnection();
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
