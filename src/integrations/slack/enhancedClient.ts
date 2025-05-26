/**
 * Enhanced Slack Client
 * Works consistently across all environments (local, production, any domain)
 */

import { DeliveryRequest } from '@/types/delivery';

// Configuration
const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';
const SLACK_CHANNEL_ID = 'C08S18NP5JA';

// Environment detection
const isDomainProduction = typeof window !== 'undefined' && 
  (window.location.hostname.includes('catnetlogistics.com') || 
   window.location.hostname.includes('netlify') ||
   window.location.hostname.includes('vercel'));

/**
 * Helper to create consistent logging
 */
const log = (message: string, data?: any) => {
  const prefix = '[SLACK-ENHANCED]';
  if (data) {
    console.log(`${prefix} ${message}`, data);
  } else {
    console.log(`${prefix} ${message}`);
  }
};

/**
 * Core function to send Slack messages
 * This uses a tiered approach that works in all environments
 */
export async function sendSlackMessage(
  text: string,
  blocks?: any[],
  attachments?: any[]
): Promise<boolean> {
  log(`Sending message: ${text}`);
  
  // Create the payload
  const payload = {
    text,
    channel: SLACK_CHANNEL_ID,
    ...(blocks ? { blocks } : {}),
    ...(attachments ? { attachments } : {})
  };
  
  // Log environment information
  log(`Environment: ${isDomainProduction ? 'Production' : 'Development'}`);
  log(`Current hostname: ${typeof window !== 'undefined' ? window.location.hostname : 'server'}`);
  
  // Start with the most reliable approach for the current environment
  try {
    // 1. For production domains, use direct webhook with no-cors mode
    if (isDomainProduction) {
      log('Using production approach: direct webhook with no-cors');
      
      try {
        await fetch(SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
          mode: 'no-cors' // This is crucial for avoiding CORS issues on production
        });
        
        log('Message sent via direct webhook (no-cors mode)');
        return true;
      } catch (error) {
        log('Direct webhook error, will try fallback approaches', error);
        // Continue to fallbacks
      }
    }
    
    // 2. Try the API route approach
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      const apiUrl = `${baseUrl}/api/slack/send`;
      
      log(`Trying API route: ${apiUrl}`);
      
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        
        if (response.ok) {
          log('Message sent via API route');
          return true;
        } else {
          log(`API route error: ${response.status}`);
          // Continue to next approach
        }
      } catch (error) {
        log('API route error, will try alternative route', error);
        // Continue to next approach
      }
      
      // 3. Try the alternative route
      const altApiUrl = `${baseUrl}/slack/send`;
      log(`Trying alternative route: ${altApiUrl}`);
      
      try {
        const response = await fetch(altApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        
        if (response.ok) {
          log('Message sent via alternative route');
          return true;
        } else {
          log(`Alternative route error: ${response.status}`);
          // Continue to final approach
        }
      } catch (error) {
        log('Alternative route error, will try direct webhook', error);
        // Continue to final approach
      }
    }
    
    // 4. Last resort: Direct webhook call (standard mode for development, no-cors for others)
    log('Trying direct webhook as last resort');
    
    if (isDomainProduction || typeof window === 'undefined') {
      // Use no-cors mode for production or server environments
      await fetch(SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        mode: 'no-cors'
      });
      
      log('Message sent via direct webhook (no-cors mode) as fallback');
      return true;
    } else {
      // Standard mode for development (to see error messages)
      const response = await fetch(SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        log('Message sent via direct webhook as fallback');
        return true;
      } else {
        log(`Direct webhook error: ${response.status}`);
        return false;
      }
    }
  } catch (error) {
    log('All approaches failed', error);
    return false;
  }
}

/**
 * Notify about a new delivery request
 */
export async function notifyNewRequest(request: DeliveryRequest): Promise<boolean> {
  const message = `🆕 New Delivery Request: ${request.id}`;
  
  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "🚚 New Delivery Request",
        emoji: true
      }
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Request ID:*\n${request.id}`
        },
        {
          type: "mrkdwn",
          text: `*Priority:*\n${request.priority || 'normal'}`
        }
      ]
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Pickup:*\n${request.pickup_location}`
        },
        {
          type: "mrkdwn",
          text: `*Delivery:*\n${request.delivery_location}`
        }
      ]
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Package Type:*\n${request.packageType || 'Standard'}`
        },
        {
          type: "mrkdwn",
          text: `*Domain:*\n${typeof window !== 'undefined' ? window.location.hostname : 'server'}`
        }
      ]
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Contact:*\n${request.email || 'No email provided'}`
      }
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "View Details",
            emoji: true
          },
          url: createTrackingUrl(request.id || request.trackingId),
          action_id: "view_details"
        }
      ]
    }
  ];

  return sendSlackMessage(message, blocks);
}

/**
 * Test the Slack integration
 */
export async function testSlackIntegration(testMessage: string = 'Test message'): Promise<boolean> {
  const message = `🧪 Slack Integration Test: ${testMessage}`;
  
  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "🧪 Slack Integration Test",
        emoji: true
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${testMessage}\n\nFrom domain: *${typeof window !== 'undefined' ? window.location.hostname : 'server'}*\nTime: ${new Date().toLocaleString()}`
      }
    }
  ];

  return sendSlackMessage(message, blocks);
}

// Export a ready-to-use client
export default {
  sendMessage: sendSlackMessage,
  notifyNewRequest,
  testIntegration: testSlackIntegration,
  isDomainProduction
}; 