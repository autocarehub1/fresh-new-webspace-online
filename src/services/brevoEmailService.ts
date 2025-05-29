
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

interface EmailRecipient {
  email: string;
  name?: string;
}

interface EmailSender {
  email: string;
  name: string;
}

export class BrevoEmailService {
  private static readonly DEFAULT_SENDER: EmailSender = {
    email: "noreply@catalystnetworklogistics.com",
    name: "Catalyst Network Logistics"
  };

  private static readonly RATE_LIMIT_DELAY = 1000; // 1 second between requests
  private static lastRequestTime = 0;

  private static async getApiKey(): Promise<string> {
    const apiKey = import.meta.env.VITE_BREVO_API_KEY;
    if (!apiKey) {
      console.error('BREVO_API_KEY not found in environment variables');
      throw new Error('Brevo API key not configured');
    }
    return apiKey;
  }

  private static async respectRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
      const delay = this.RATE_LIMIT_DELAY - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  private static async makeBrevoRequest(payload: any, retries = 3): Promise<any> {
    try {
      await this.respectRateLimit();
      
      const apiKey = await this.getApiKey();
      
      console.log('Sending request to Brevo API:', {
        url: BREVO_API_URL,
        recipient: payload.to?.[0]?.email,
        subject: payload.subject,
        attempt: 4 - retries
      });

      const response = await fetch(BREVO_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Brevo API error response:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });
        
        // Handle specific Brevo error cases with retry logic
        if (response.status === 429 && retries > 0) {
          console.log(`Rate limit hit, retrying in 5 seconds... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, 5000));
          return this.makeBrevoRequest(payload, retries - 1);
        } else if (response.status === 500 && retries > 0) {
          console.log(`Server error, retrying... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          return this.makeBrevoRequest(payload, retries - 1);
        } else if (response.status === 400) {
          throw new Error(`Brevo API validation error: ${responseData.message || 'Invalid request'}`);
        } else if (response.status === 401) {
          throw new Error('Brevo API authentication failed - check API key');
        } else if (response.status === 402) {
          throw new Error('Brevo account payment required or quota exceeded');
        } else if (response.status === 429) {
          throw new Error('Brevo rate limit exceeded - please try again later');
        } else {
          throw new Error(`Brevo API error: ${responseData.message || 'Unknown error'}`);
        }
      }

      console.log('Brevo API success response:', responseData);
      return responseData;
    } catch (error) {
      if (retries > 0 && !(error instanceof Error && error.message.includes('authentication'))) {
        console.log(`Request failed, retrying... (${retries} retries left):`, error);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.makeBrevoRequest(payload, retries - 1);
      }
      
      console.error('Brevo request failed after all retries:', error);
      throw error;
    }
  }

  private static generateDriverWelcomeTemplate(driverName: string): EmailTemplate {
    return {
      subject: "Welcome to Catalyst Network Logistics - Driver Portal Access",
      htmlContent: `
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
      `,
      textContent: `
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
      `
    };
  }

  private static generateDeliveryStatusTemplate(status: string, deliveryData: any): EmailTemplate {
    const statusMessages = {
      'picked_up': 'Your package has been picked up',
      'in_transit': 'Your package is on the way',
      'delivered': 'Your package has been delivered',
      'driver_assigned': 'A driver has been assigned to your delivery',
      'delayed': 'Your delivery has been delayed',
      'cancelled': 'Your delivery has been cancelled'
    };

    const statusMessage = statusMessages[status as keyof typeof statusMessages] || `Status updated to: ${status}`;

    return {
      subject: `Delivery Update - ${deliveryData.trackingId || 'Your Order'}`,
      htmlContent: `
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
      `,
      textContent: `
${statusMessage}

Tracking ID: ${deliveryData.trackingId}
${deliveryData.pickup_location ? `From: ${deliveryData.pickup_location}` : ''}
${deliveryData.delivery_location ? `To: ${deliveryData.delivery_location}` : ''}
${deliveryData.assigned_driver ? `Driver: ${deliveryData.assigned_driver}` : ''}

Track your delivery at: ${window.location.origin}/tracking?id=${deliveryData.trackingId}

Best regards,
Catalyst Network Logistics Team
      `
    };
  }

  static async sendDriverSignupWelcomeEmail(
    email: string,
    driverName: string,
    userId: string
  ): Promise<boolean> {
    try {
      console.log('Preparing driver welcome email for:', email);
      
      const template = this.generateDriverWelcomeTemplate(driverName);
      
      const emailPayload = {
        sender: this.DEFAULT_SENDER,
        to: [{ email, name: driverName }],
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent,
        tags: ['driver-signup', 'welcome']
      };

      await this.makeBrevoRequest(emailPayload);
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
      
      const template = this.generateDeliveryStatusTemplate(status, deliveryData);
      
      const emailPayload = {
        sender: this.DEFAULT_SENDER,
        to: [{ email }],
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent,
        tags: ['delivery-status', status]
      };

      await this.makeBrevoRequest(emailPayload);
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

      await this.makeBrevoRequest(emailPayload);
      console.log('Custom email sent successfully via Brevo');
      return true;
    } catch (error) {
      console.error('Failed to send custom email:', error);
      return false;
    }
  }

  // Enhanced test method with detailed diagnostics
  static async testConnection(): Promise<{ success: boolean; error?: string; details?: any }> {
    try {
      console.log('Testing Brevo API connection...');
      
      // First verify API key exists
      const apiKey = await this.getApiKey();
      console.log('Brevo API key found:', apiKey ? 'Yes' : 'No');
      
      // Test with account info endpoint instead of sending email
      const response = await fetch('https://api.brevo.com/v3/account', {
        method: 'GET',
        headers: {
          'api-key': apiKey,
        }
      });

      if (response.ok) {
        const accountData = await response.json();
        console.log('Brevo account info:', accountData);
        return { 
          success: true, 
          details: {
            accountName: accountData.companyName || 'Unknown',
            plan: accountData.plan || 'Unknown',
            emailsRemaining: accountData.plan?.[0]?.creditsRemaining || 'Unknown'
          }
        };
      } else {
        const errorData = await response.json();
        console.error('Brevo connection test failed:', errorData);
        return { success: false, error: errorData.message || 'Connection failed' };
      }
    } catch (error: any) {
      console.error('Brevo connection test failed:', error);
      return { success: false, error: error.message };
    }
  }

  static async getAccountInfo(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const apiKey = await this.getApiKey();
      
      const response = await fetch('https://api.brevo.com/v3/account', {
        method: 'GET',
        headers: {
          'api-key': apiKey,
        }
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
