
import { EmailRecipient, EmailSender, BrevoApiResponse } from './types';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export class BrevoApiClient {
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

  static async makeBrevoRequest(payload: any, retries = 3): Promise<BrevoApiResponse> {
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

  static async testConnection(): Promise<{ success: boolean; error?: string; details?: any }> {
    try {
      console.log('Testing Brevo API connection...');
      
      const apiKey = await this.getApiKey();
      console.log('Brevo API key found:', apiKey ? 'Yes' : 'No');
      
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
