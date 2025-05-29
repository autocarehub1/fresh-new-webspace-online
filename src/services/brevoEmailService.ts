
import { EmailRecipient, EmailSender, ConnectionTestResult, AccountInfo } from './brevo/types';
import { BrevoEmailSender } from './brevo/emailSender';
import { BrevoApiClient } from './brevo/apiClient';

export class BrevoEmailService {
  // Driver-related emails
  static async sendDriverSignupWelcomeEmail(
    email: string,
    driverName: string,
    userId: string
  ): Promise<boolean> {
    return BrevoEmailSender.sendDriverSignupWelcomeEmail(email, driverName, userId);
  }

  // Delivery-related emails
  static async sendDeliveryStatusNotification(
    email: string,
    status: string,
    deliveryData: any
  ): Promise<boolean> {
    return BrevoEmailSender.sendDeliveryStatusNotification(email, status, deliveryData);
  }

  // Custom emails
  static async sendCustomEmail(
    to: EmailRecipient[],
    subject: string,
    htmlContent: string,
    textContent?: string,
    sender?: EmailSender,
    tags?: string[]
  ): Promise<boolean> {
    return BrevoEmailSender.sendCustomEmail(to, subject, htmlContent, textContent, sender, tags);
  }

  // Connection and account management
  static async testConnection(): Promise<ConnectionTestResult> {
    return BrevoApiClient.testConnection();
  }

  static async getAccountInfo(): Promise<AccountInfo> {
    return BrevoApiClient.getAccountInfo();
  }
}

// Export types for backward compatibility
export type { EmailRecipient, EmailSender } from './brevo/types';
