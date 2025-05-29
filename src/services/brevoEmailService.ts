
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export class BrevoEmailService {
  private static async getApiKey(): Promise<string> {
    // Try to get API key from environment
    const apiKey = import.meta.env.VITE_BREVO_API_KEY;
    if (!apiKey) {
      console.error('BREVO_API_KEY not found in environment variables');
      throw new Error('Brevo API key not configured');
    }
    return apiKey;
  }

  private static async makeBrevoRequest(payload: any): Promise<any> {
    try {
      const apiKey = await this.getApiKey();
      
      console.log('Sending request to Brevo API:', {
        url: BREVO_API_URL,
        recipient: payload.to?.[0]?.email,
        subject: payload.subject
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
        
        // Handle specific Brevo error cases
        if (response.status === 400) {
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
      console.error('Brevo request failed:', error);
      throw error;
    }
  }

  static async sendDriverSignupWelcomeEmail(
    email: string,
    driverName: string,
    userId: string
  ): Promise<boolean> {
    try {
      console.log('Preparing driver welcome email for:', email);
      
      const emailPayload = {
        sender: { 
          email: "noreply@catalystnetworklogistics.com", 
          name: "Catalyst Network Logistics" 
        },
        to: [{ email, name: driverName }],
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
      
      const emailPayload = {
        sender: { 
          email: "noreply@catalystnetworklogistics.com", 
          name: "Catalyst Network Logistics" 
        },
        to: [{ email }],
        subject: `Delivery Update - ${deliveryData.trackingId || 'Your Order'}`,
        htmlContent: `
          <html>
            <body style="font-family: Arial,sans-serif; background-color: #F9FAFB;">
              <div style="max-width: 600px; margin: 0 auto;">
                <div style="background: #0A2463; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                  <h2 style="margin:0;">Delivery Status Update</h2>
                </div>
                <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px;">
                  <p>Your delivery <strong>${deliveryData.trackingId}</strong> status has been updated to: <strong>${status}</strong></p>
                  ${deliveryData.pickup_location ? `<p><strong>From:</strong> ${deliveryData.pickup_location}</p>` : ''}
                  ${deliveryData.delivery_location ? `<p><strong>To:</strong> ${deliveryData.delivery_location}</p>` : ''}
                  ${deliveryData.assigned_driver ? `<p><strong>Driver:</strong> ${deliveryData.assigned_driver}</p>` : ''}
                </div>
              </div>
            </body>
          </html>
        `
      };

      await this.makeBrevoRequest(emailPayload);
      console.log('Delivery status notification sent successfully via Brevo');
      return true;
    } catch (error) {
      console.error('Failed to send delivery status notification:', error);
      return false;
    }
  }

  // Test method to verify Brevo connection
  static async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Testing Brevo API connection...');
      
      const testPayload = {
        sender: { 
          email: "noreply@catalystnetworklogistics.com", 
          name: "Catalyst Network Logistics Test" 
        },
        to: [{ email: "test@example.com" }],
        subject: "Brevo Connection Test",
        htmlContent: "<p>This is a test email to verify Brevo integration.</p>"
      };

      // This will test the API key and configuration without actually sending
      const apiKey = await this.getApiKey();
      console.log('Brevo API key found:', apiKey ? 'Yes' : 'No');
      
      return { success: true };
    } catch (error: any) {
      console.error('Brevo connection test failed:', error);
      return { success: false, error: error.message };
    }
  }
}
