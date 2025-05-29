
import { EmailRecipient, EmailSender } from './types';
import { BrevoApiClient } from './apiClient';
import { BrevoEmailTemplates } from './templates';

export class BrevoEmailSender {
  private static readonly DEFAULT_SENDER: EmailSender = {
    email: "noreply@catalystnetworklogistics.com",
    name: "Catalyst Network Logistics"
  };

  static async sendDriverSignupWelcomeEmail(
    email: string,
    driverName: string,
    userId: string
  ): Promise<boolean> {
    try {
      console.log('Preparing driver welcome email for:', email);
      
      const template = BrevoEmailTemplates.generateDriverWelcomeTemplate(driverName);
      
      const emailPayload = {
        sender: this.DEFAULT_SENDER,
        to: [{ email, name: driverName }],
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent,
        tags: ['driver-signup', 'welcome']
      };

      await BrevoApiClient.makeBrevoRequest(emailPayload);
      console.log('Driver welcome email sent successfully via Brevo');
      return true;
    } catch (error) {
      console.error('Failed to send driver welcome email:', error);
      return false;
    }
  }

  static async sendDeliveryStatusNotification(
    email: string,
    status: string,
    deliveryData: any
  ): Promise<boolean> {
    try {
      console.log('Preparing delivery status notification for:', email);
      
      const template = BrevoEmailTemplates.generateDeliveryStatusTemplate(status, deliveryData);
      
      const emailPayload = {
        sender: this.DEFAULT_SENDER,
        to: [{ email }],
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent,
        tags: ['delivery-status', status]
      };

      await BrevoApiClient.makeBrevoRequest(emailPayload);
      console.log('Delivery status notification sent successfully via Brevo');
      return true;
    } catch (error) {
      console.error('Failed to send delivery status notification:', error);
      return false;
    }
  }

  static async sendCustomEmail(
    to: EmailRecipient[],
    subject: string,
    htmlContent: string,
    textContent?: string,
    sender?: EmailSender,
    tags?: string[]
  ): Promise<boolean> {
    try {
      console.log('Sending custom email to:', to.map(r => r.email).join(', '));
      
      const emailPayload = {
        sender: sender || this.DEFAULT_SENDER,
        to,
        subject,
        htmlContent,
        textContent: textContent || htmlContent.replace(/<[^>]*>/g, ''),
        tags: tags || ['custom']
      };

      await BrevoApiClient.makeBrevoRequest(emailPayload);
      console.log('Custom email sent successfully via Brevo');
      return true;
    } catch (error) {
      console.error('Failed to send custom email:', error);
      return false;
    }
  }
}
