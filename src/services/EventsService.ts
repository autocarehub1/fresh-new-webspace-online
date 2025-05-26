/**
 * Events Service
 * 
 * This service acts as a reliable way to capture important application events
 * and guarantee they are delivered to integrations like Slack
 */

import { DeliveryRequest } from '@/types/delivery';

// Slack webhook URL and channel
const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';
const SLACK_CHANNEL_ID = 'C08S18NP5JA';

// Queue to store failed events for retry
let eventQueue: any[] = [];

/**
 * Send notification to Slack with auto-retry
 */
async function notifySlack(message: string, blocks?: any[]) {
  console.log('[EVENTS] Sending to Slack:', message);
  
  const payload = {
    text: message,
    channel: SLACK_CHANNEL_ID,
    ...(blocks ? { blocks } : {})
  };
  
  try {
    // Use the server proxy if in browser environment
    if (typeof window !== 'undefined') {
      // Check if we're on production domain
      const isDomainProduction = window.location.hostname.includes('catnetlogistics.com');
      
      if (isDomainProduction) {
        console.log('[EVENTS] On production domain, using direct webhook approach');
        
        try {
          // Direct webhook call with no-cors mode - best approach for production
          console.log('[EVENTS] Sending direct webhook with no-cors mode');
          await fetch(SLACK_WEBHOOK_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            mode: 'no-cors' // Important: prevents CORS issues on production
          });
          
          console.log('[EVENTS] Direct webhook request sent (no-cors mode)');
          return true;
        } catch (directError) {
          console.error('[EVENTS] Direct webhook error:', directError);
          
          // Fallback to server proxy approaches
          console.log('[EVENTS] Falling back to proxy approaches');
        }
      }
      
      // Standard approach for local development or as fallback
      // Get the base URL from the current window location
      const baseUrl = window.location.origin;
      const apiUrl = `${baseUrl}/api/slack/send`;
      
      console.log('[EVENTS] Using browser-based API endpoint:', apiUrl);
      
      // Use our server-side proxy endpoint
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      // If the first attempt fails, try an alternative path format
      if (!response.ok && response.status === 404) {
        console.log('[EVENTS] First API path attempt failed, trying alternative path...');
        const altApiUrl = `${baseUrl}/slack/send`;
        
        const altResponse = await fetch(altApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        
        if (altResponse.ok) {
          console.log('[EVENTS] Slack notification sent via alternative path');
          return true;
        } else {
          console.error(`[EVENTS] Alternative path also failed: ${altResponse.status}`);
          throw new Error(`Server proxy error at alternative path: ${altResponse.status}`);
        }
      }
      
      const responseText = await response.text();
      console.log('[EVENTS] Server proxy response status:', response.status);
      console.log('[EVENTS] Server proxy response text:', responseText);
      
      if (!response.ok) {
        console.error('[EVENTS] Server proxy error:', responseText);
        throw new Error(`Server proxy error: ${response.status}`);
      }
      
      console.log('[EVENTS] Slack notification sent via server proxy');
      return true;
    } else {
      // Direct approach for server-side execution
      console.log('[EVENTS] Using direct webhook approach (server-side)');
      const response = await fetch(SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const responseText = await response.text();
      console.log('[EVENTS] Direct webhook response status:', response.status);
      console.log('[EVENTS] Direct webhook response text:', responseText);
      
      if (!response.ok) {
        console.error('[EVENTS] Direct webhook error:', responseText);
        throw new Error(`Direct webhook error: ${response.status}`);
      }
      
      console.log('[EVENTS] Slack notification sent directly');
      return true;
    }
  } catch (error) {
    console.error('[EVENTS] Error sending Slack notification:', error);
    queueForRetry({ type: 'slack', payload });
    return false;
  }
}

/**
 * Queue an event for retry later
 */
function queueForRetry(event: any) {
  eventQueue.push({
    ...event,
    attempts: 0,
    timestamp: Date.now()
  });
  
  console.log(`[EVENTS] Event queued for retry. Queue size: ${eventQueue.length}`);
  
  // Store in localStorage for persistence
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('events_retry_queue', JSON.stringify(eventQueue));
    } catch (error) {
      console.error('[EVENTS] Error saving queue to localStorage:', error);
    }
  }
}

/**
 * Process the retry queue
 */
export async function processRetryQueue() {
  if (eventQueue.length === 0) return;
  
  console.log(`[EVENTS] Processing retry queue. ${eventQueue.length} events`);
  
  const currentQueue = [...eventQueue];
  
  for (const event of currentQueue) {
    // Skip if too many attempts
    if (event.attempts >= 5) {
      console.log(`[EVENTS] Dropping event after ${event.attempts} failed attempts`);
      eventQueue = eventQueue.filter(e => e !== event);
      continue;
    }
    
    // Increment attempts
    event.attempts++;
    
    if (event.type === 'slack') {
      try {
        const response = await fetch(SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(event.payload)
        });
        
        if (response.ok) {
          console.log('[EVENTS] Queued event sent successfully');
          eventQueue = eventQueue.filter(e => e !== event);
        }
      } catch (error) {
        console.error('[EVENTS] Error retrying event:', error);
      }
    }
  }
  
  // Update localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('events_retry_queue', JSON.stringify(eventQueue));
    } catch (error) {
      console.error('[EVENTS] Error updating queue in localStorage:', error);
    }
  }
}

/**
 * Event: New delivery request created
 */
export async function newDeliveryRequestEvent(request: DeliveryRequest) {
  console.log('[EVENTS] New delivery request event:', request.id);
  
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
          text: `*Time:*\n${new Date().toLocaleString()}`
        }
      ]
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
          url: `${typeof window !== 'undefined' ? `${window.location.origin}/tracking?id=${request.id}` : `/tracking?id=${request.id}`}`,
          action_id: "view_details"
        }
      ]
    }
  ];
  
  return notifySlack(message, blocks);
}

/**
 * Event: Delivery status update
 */
export async function deliveryStatusUpdateEvent(request: DeliveryRequest, status: string, note?: string) {
  console.log('[EVENTS] Delivery status update event:', request.id, status);
  
  // Determine emoji based on status
  let emoji = '🔄';
  
  switch(status.toLowerCase()) {
    case 'in_progress':
    case 'driver assigned':
      emoji = '🚶';
      break;
    case 'picked up':
      emoji = '📦';
      break;
    case 'out for delivery':
      emoji = '🚚';
      break;
    case 'completed':
      emoji = '✅';
      break;
    case 'declined':
    case 'cancelled':
      emoji = '❌';
      break;
    default:
      emoji = '🔄';
  }
  
  const message = `${emoji} Delivery Update: ${request.id} - ${status}`;
  
  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `${emoji} Delivery Status Update`,
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
          text: `*Status:*\n${status}`
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
          text: `*Time:*\n${new Date().toLocaleString()}`
        }
      ]
    }
  ];
  
  // Add note if provided
  if (note) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Note:*\n${note}`
      }
    });
  }
  
  // Add driver info if assigned
  if (request.assigned_driver) {
    blocks.push({
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Assigned Driver:*\n${request.assigned_driver}`
        },
        {
          type: "mrkdwn",
          text: ""
        }
      ]
    });
  }
  
  // Add action button
  blocks.push({
    type: "actions",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "View Details",
          emoji: true
        },
        url: `${typeof window !== 'undefined' ? `${window.location.origin}/tracking?id=${request.id}` : `/tracking?id=${request.id}`}`,
        action_id: "view_details"
      }
    ]
  });
  
  return notifySlack(message, blocks);
}

/**
 * Direct test function for debugging
 */
export async function testSlackDirectly(testMessage: string): Promise<boolean> {
  console.log('[EVENTS] Running direct test message to Slack');
  
  try {
    // Use the fetch API
    const payload = {
      text: `🧪 TEST: ${testMessage}`,
      channel: SLACK_CHANNEL_ID,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "🧪 Slack Test",
            emoji: true
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Test message: *${testMessage}*\nSent at: ${new Date().toLocaleString()}`
          }
        }
      ]
    };
    
    console.log('[EVENTS] Sending test with payload:', JSON.stringify(payload).substring(0, 100) + '...');
    
    // Using a full no-cors approach with regular fetch
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      mode: 'no-cors' // Add this to bypass CORS restrictions
    });
    
    console.log('[EVENTS] No-cors test sent to Slack - cannot read response but request was sent');
    
    return true;
  } catch (error) {
    console.error('[EVENTS] Error in direct test:', error);
    return false;
  }
}

// Initialize retry processing
if (typeof window !== 'undefined') {
  // Load queued events from localStorage
  try {
    const queueString = localStorage.getItem('events_retry_queue');
    if (queueString) {
      eventQueue = JSON.parse(queueString);
      console.log(`[EVENTS] Loaded ${eventQueue.length} events from queue`);
    }
  } catch (error) {
    console.error('[EVENTS] Error loading queue from localStorage:', error);
  }
  
  // Set up retry interval
  setInterval(() => {
    if (eventQueue.length > 0) {
      processRetryQueue();
    }
  }, 60000); // Retry every minute
}

export default {
  newDeliveryRequestEvent,
  deliveryStatusUpdateEvent,
  processRetryQueue,
  testSlackDirectly
}; 