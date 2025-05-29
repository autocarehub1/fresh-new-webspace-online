
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface EmailResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailSender {
  email: string;
  name: string;
}

export class EmailService {
  private static readonly DEFAULT_SENDER: EmailSender = {
    email: "catnetlogistics@gmail.com",
    name: "Catalyst Network Logistics"
  };

  // Gmail SMTP via Supabase Edge Function
  private static async sendViaGmail(
    to: EmailRecipient[],
    subject: string,
    htmlContent: string,
    textContent?: string,
    sender?: EmailSender,
    type?: string
  ): Promise<EmailResult> {
    try {
      const { data, error } = await supabase.functions.invoke('send-gmail-email', {
        body: {
          to,
          subject,
          htmlContent,
          textContent,
          sender: sender || this.DEFAULT_SENDER,
          type
        }
      });

      if (error) {
        console.error('Gmail email function error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data?.messageId };
    } catch (error: any) {
      console.error('Gmail email service error:', error);
      return { success: false, error: error.message };
    }
  }

  // Driver-related emails
  static async sendDriverWelcomeEmail(
    email: string,
    driverName: string,
    userId: string
  ): Promise<EmailResult> {
    try {
      console.log('EmailService: Sending driver welcome email to:', email);
      
      const htmlContent = `
        <html>
          <body style="font-family: Arial,sans-serif; background-color: #F9FAFB; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="background: #0A2463; color: white; padding: 30px 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">Welcome to Our Driver Team!</h1>
              </div>
              <div style="padding: 30px 20px;">
                <h2 style="color: #0A2463; margin-top: 0;">Hello ${driverName},</h2>
                <p style="color: #374151; line-height: 1.6; margin: 16px 0;">
                  Thank you for joining Catalyst Network Logistics as a driver! Your account has been successfully created.
                </p>
                <div style="background: #F3F4F6; padding: 20px; border-radius: 6px; margin: 24px 0;">
                  <h3 style="color: #0A2463; margin-top: 0;">Next Steps:</h3>
                  <ol style="color: #374151; line-height: 1.6; margin: 0; padding-left: 20px;">
                    <li>Complete your driver profile setup</li>
                    <li>Upload required documents (license, insurance, registration)</li>
                    <li>Wait for admin approval (1-2 business days)</li>
                    <li>Start receiving delivery assignments</li>
                  </ol>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${window.location.origin}/driver-portal" 
                     style="background: #0A2463; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                    Access Driver Portal
                  </a>
                </div>
                <p style="color: #6B7280; font-size: 14px; margin: 24px 0 0 0;">
                  If you have any questions, please contact us at (432)-202-2150 or reply to this email.
                </p>
              </div>
              <div style="background: #F3F4F6; padding: 20px; text-align: center; font-size: 12px; color: #6B7280;">
                © 2024 Catalyst Network Logistics. All rights reserved.
              </div>
            </div>
          </body>
        </html>
      `;

      const textContent = `
Welcome to Catalyst Network Logistics, ${driverName}!

Thank you for joining our driver team. Your account has been successfully created.

Next Steps:
1. Complete your driver profile setup
2. Upload required documents (license, insurance, registration)  
3. Wait for admin approval (1-2 business days)
4. Start receiving delivery assignments

Access your driver portal at: ${window.location.origin}/driver-portal

If you have any questions, please contact us at (432)-202-2150.

Best regards,
Catalyst Network Logistics Team
      `;

      const result = await this.sendViaGmail(
        [{ email, name: driverName }],
        "Welcome to Catalyst Network Logistics - Driver Portal Access",
        htmlContent,
        textContent,
        undefined,
        'driver-welcome'
      );
      
      if (result.success) {
        toast.success('Welcome email sent successfully!');
        return { success: true };
      } else {
        toast.error('Failed to send welcome email');
        return { success: false, error: result.error };
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
      
      const statusMessages = {
        'picked_up': 'Your package has been picked up',
        'in_transit': 'Your package is on the way',
        'delivered': 'Your package has been delivered',
        'driver_assigned': 'A driver has been assigned to your delivery',
        'delayed': 'Your delivery has been delayed',
        'cancelled': 'Your delivery has been cancelled'
      };

      const statusMessage = statusMessages[status as keyof typeof statusMessages] || `Status updated to: ${status}`;

      const htmlContent = `
        <html>
          <body style="font-family: Arial,sans-serif; background-color: #F9FAFB; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="background: #0A2463; color: white; padding: 20px; text-align: center;">
                <h2 style="margin:0;">Delivery Status Update</h2>
              </div>
              <div style="padding: 32px;">
                <h3 style="color: #0A2463; margin-top: 0;">${statusMessage}</h3>
                <p><strong>Tracking ID:</strong> ${deliveryData.trackingId}</p>
                ${deliveryData.pickup_location ? `<p><strong>From:</strong> ${deliveryData.pickup_location}</p>` : ''}
                ${deliveryData.delivery_location ? `<p><strong>To:</strong> ${deliveryData.delivery_location}</p>` : ''}
                ${deliveryData.assigned_driver ? `<p><strong>Driver:</strong> ${deliveryData.assigned_driver}</p>` : ''}
                ${deliveryData.priority ? `<p><strong>Priority:</strong> ${deliveryData.priority}</p>` : ''}
                <div style="margin: 20px 0; padding: 15px; background: #F3F4F6; border-radius: 6px;">
                  <p style="margin: 0; color: #374151;">
                    For real-time tracking, visit: 
                    <a href="${window.location.origin}/tracking?id=${deliveryData.trackingId}" style="color: #0A2463;">
                      Track Your Delivery
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const textContent = `
${statusMessage}

Tracking ID: ${deliveryData.trackingId}
${deliveryData.pickup_location ? `From: ${deliveryData.pickup_location}` : ''}
${deliveryData.delivery_location ? `To: ${deliveryData.delivery_location}` : ''}
${deliveryData.assigned_driver ? `Driver: ${deliveryData.assigned_driver}` : ''}

Track your delivery at: ${window.location.origin}/tracking?id=${deliveryData.trackingId}

Best regards,
Catalyst Network Logistics Team
      `;

      const result = await this.sendViaGmail(
        [{ email }],
        `Delivery Update - ${deliveryData.trackingId || 'Your Order'}`,
        htmlContent,
        textContent,
        undefined,
        'delivery-status'
      );
      
      if (result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.error };
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
      
      const result = await this.sendViaGmail(
        recipientObjects,
        subject,
        isHtml ? message : `<p>${message}</p>`,
        isHtml ? undefined : message,
        undefined,
        'custom'
      );
      
      if (result.success) {
        toast.success('Email sent successfully!');
        return { success: true };
      } else {
        toast.error('Failed to send email');
        return { success: false, error: result.error };
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
      const result = await this.sendViaGmail(
        [{ email }],
        'Password Reset - Catalyst Network Logistics',
        htmlContent,
        undefined,
        undefined,
        'password-reset'
      );
      
      return result;
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
      const result = await this.sendViaGmail(
        [{ email }],
        'Verify Your Email - Catalyst Network Logistics',
        htmlContent,
        undefined,
        undefined,
        'email-verification'
      );
      
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // System health check
  static async testEmailSystem(): Promise<EmailResult & { details?: any }> {
    try {
      // Test by sending to the configured Gmail account
      const result = await this.sendViaGmail(
        [{ email: 'catnetlogistics@gmail.com', name: 'Test User' }],
        'Email System Test',
        '<p>This is a test email to verify the Gmail SMTP integration is working.</p>',
        'This is a test email to verify the Gmail SMTP integration is working.',
        undefined,
        'system-test'
      );
      
      return {
        success: result.success,
        error: result.error,
        details: {
          service: 'Gmail SMTP',
          endpoint: 'Supabase Edge Function',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
