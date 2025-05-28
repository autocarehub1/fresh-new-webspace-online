
import { supabase } from '@/lib/supabase';

interface BrevoEmailOptions {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  sender?: { email: string; name: string };
  templateId?: number;
  params?: Record<string, any>;
}

export class BrevoEmailService {
  private static async sendEmail(options: BrevoEmailOptions) {
    try {
      console.log('Sending email via Brevo service:', options);
      
      const { data, error } = await supabase.functions.invoke('send-brevo-email', {
        body: options
      });

      if (error) {
        console.error('Brevo email error:', error);
        throw error;
      }

      console.log('Brevo email sent successfully:', data);
      return data;
    } catch (error) {
      console.error('Brevo email service error:', error);
      throw error;
    }
  }

  // Send driver signup welcome email
  static async sendDriverSignupWelcomeEmail(
    email: string, 
    driverName: string, 
    userId: string
  ): Promise<boolean> {
    try {
      const baseUrl = window.location.origin;
      
      await this.sendEmail({
        to: [{ email, name: driverName }],
        subject: 'Welcome! Please Verify Your Email',
        htmlContent: `
          <html>
            <body style="font-family: Arial,sans-serif; background-color: #F9FAFB;">
              <div style="max-width: 600px; margin: 0 auto;">
                <div style="background: #0A2463; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                  <h2 style="margin:0;">Welcome to Medical Courier Service!</h2>
                </div>
                <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px;">
                  <p style="font-size: 16px; color: #111827;">Hello ${driverName},</p>
                  <p style="font-size: 16px; color: #111827;">Thank you for signing up to become a medical courier driver!</p>
                  <p style="font-size: 16px; color: #111827;">Your account has been created successfully. You can now sign in to access the driver portal and complete your profile setup.</p>
                  <div style="text-align:center;margin-top:32px;">
                    <a href="${baseUrl}/driver-portal" style="background:#3E92CC;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600;">
                      Access Driver Portal
                    </a>
                  </div>
                  <p style="font-size: 14px; color: #6B7280; margin-top: 24px;">Next steps:</p>
                  <ul style="font-size: 14px; color: #6B7280;">
                    <li>Sign in to your driver account</li>
                    <li>Complete your driver profile</li>
                    <li>Upload required documents</li>
                    <li>Wait for account approval</li>
                  </ul>
                  <div style="margin-top: 32px; font-size: 12px; color:#6B7280;">If you have questions, reply to this email.<br/>Medical Courier Service Driver Support</div>
                </div>
              </div>
            </body>
          </html>
        `
      });

      return true;
    } catch (error) {
      console.error('Failed to send driver signup welcome email:', error);
      return false;
    }
  }

  // Send delivery status notification
  static async sendDeliveryStatusNotification(
    email: string,
    status: string,
    deliveryData: any
  ): Promise<boolean> {
    try {
      const statusSubjects: Record<string, string> = {
        'pending': 'Delivery Request Submitted',
        'approved': 'Delivery Request Approved',
        'in_progress': 'Package Picked Up',
        'completed': 'Delivery Completed',
        'declined': 'Delivery Request Declined',
      };

      const subject = statusSubjects[status] || `Delivery Status Update: ${status}`;
      
      await this.sendEmail({
        to: [{ email }],
        subject,
        htmlContent: `
          <html>
            <body style="font-family: Arial,sans-serif; background-color: #F9FAFB;">
              <div style="max-width: 600px; margin: 0 auto;">
                <div style="background: #0A2463; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                  <h2 style="margin:0;">${subject}</h2>
                </div>
                <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px;">
                  <p style="font-size: 16px; color: #111827;">Your delivery status has been updated.</p>
                  <table style="width: 100%; margin: 24px 0;">
                    ${deliveryData.trackingId ? `
                    <tr><td style="color: #6B7280;">Tracking ID:</td><td style="font-weight: 600;">${deliveryData.trackingId}</td></tr>
                    ` : ""}
                    ${deliveryData.pickup_location ? `
                    <tr><td style="color: #6B7280;">Pickup:</td><td>${deliveryData.pickup_location}</td></tr>
                    ` : ""}
                    ${deliveryData.delivery_location ? `
                    <tr><td style="color: #6B7280;">Delivery:</td><td>${deliveryData.delivery_location}</td></tr>
                    ` : ""}
                  </table>
                  <div style="margin-top: 32px; font-size: 12px; color:#6B7280;">If you have questions, reply to this email.<br/>Medical Courier Service</div>
                </div>
              </div>
            </body>
          </html>
        `
      });

      return true;
    } catch (error) {
      console.error('Failed to send delivery status notification:', error);
      return false;
    }
  }

  // Send contact form notification
  static async sendContactFormNotification(
    contactData: {
      name: string;
      email: string;
      phone?: string;
      message: string;
    }
  ): Promise<boolean> {
    try {
      // Send to admin
      await this.sendEmail({
        to: [{ email: 'catalystlogistics2025@gmail.com', name: 'Admin' }],
        subject: `New Contact Form Submission from ${contactData.name}`,
        htmlContent: `
          <html>
            <body style="font-family: Arial,sans-serif; background-color: #F9FAFB;">
              <div style="max-width: 600px; margin: 0 auto;">
                <div style="background: #0A2463; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                  <h2 style="margin:0;">New Contact Form Submission</h2>
                </div>
                <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px;">
                  <table style="width: 100%; margin: 24px 0;">
                    <tr><td style="color: #6B7280;">Name:</td><td style="font-weight: 600;">${contactData.name}</td></tr>
                    <tr><td style="color: #6B7280;">Email:</td><td>${contactData.email}</td></tr>
                    <tr><td style="color: #6B7280;">Phone:</td><td>${contactData.phone || 'Not provided'}</td></tr>
                  </table>
                  <div style="margin-top: 24px;">
                    <h3 style="color: #6B7280; margin-bottom: 12px;">Message:</h3>
                    <p style="background: #F9FAFB; padding: 16px; border-radius: 6px;">${contactData.message}</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `
      });

      // Send confirmation to user
      await this.sendEmail({
        to: [{ email: contactData.email, name: contactData.name }],
        subject: 'Thank you for contacting us',
        htmlContent: `
          <html>
            <body style="font-family: Arial,sans-serif; background-color: #F9FAFB;">
              <div style="max-width: 600px; margin: 0 auto;">
                <div style="background: #0A2463; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                  <h2 style="margin:0;">Thank you for contacting us</h2>
                </div>
                <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px;">
                  <p style="font-size: 16px; color: #111827;">We have received your message and will get back to you shortly.</p>
                  <div style="margin-top: 24px;">
                    <h3 style="color: #6B7280; margin-bottom: 12px;">Your message:</h3>
                    <p style="background: #F9FAFB; padding: 16px; border-radius: 6px;">${contactData.message}</p>
                  </div>
                  <div style="margin-top: 32px; font-size: 12px; color:#6B7280;">
                    If you need immediate assistance, please call us at (432)-202-2150.<br/>
                    Catalyst Network Logistics
                  </div>
                </div>
              </div>
            </body>
          </html>
        `
      });

      return true;
    } catch (error) {
      console.error('Failed to send contact form notifications:', error);
      return false;
    }
  }
}
