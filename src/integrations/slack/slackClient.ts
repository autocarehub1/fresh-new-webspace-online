import { DeliveryRequest, TrackingUpdate } from '@/types/delivery';
import { deliveryStatusUpdateEvent } from '@/services/EventsService';

// Configuration object for Slack integration
interface SlackConfig {
  webhookUrl: string;
  channelId: string;
  enabled: boolean;
  retryCount: number;
}

// Load configuration from localStorage if available
const loadConfigFromStorage = (): SlackConfig => {
  if (typeof window === 'undefined') return { ...defaultConfig };
  
  try {
    const storedConfig = localStorage.getItem('slack_config');
    if (storedConfig) {
      const parsedConfig = JSON.parse(storedConfig);
      return { ...defaultConfig, ...parsedConfig };
    }
  } catch (error) {
    console.error('[SLACK] Error loading config from storage:', error);
  }
  
  return { ...defaultConfig };
};

// Default config with placeholder values
const defaultConfig: SlackConfig = {
  webhookUrl: 'https://hooks.slack.com/services/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',
  channelId: 'C08S18NP5JA',
  enabled: true,
  retryCount: 3 // default retry count
};

// Store the current configuration
let slackConfig: SlackConfig = loadConfigFromStorage();

// Queue for failed messages to retry later
interface QueuedMessage {
  message: string;
  blocks?: any[];
  attachments?: any[];
  timestamp: number;
  attempts: number;
}

// In-memory queue of failed messages to retry
const messageQueue: QueuedMessage[] = [];

// Save configuration to localStorage
const saveConfigToStorage = (config: SlackConfig) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('slack_config', JSON.stringify(config));
  } catch (error) {
    console.error('[SLACK] Error saving config to storage:', error);
  }
};

/**
 * Configure the Slack integration
 */
export const configureSlack = (config: Partial<SlackConfig>) => {
  slackConfig = { ...slackConfig, ...config };
  saveConfigToStorage(slackConfig);
  return slackConfig;
};

/**
 * Store a message in the retry queue
 */
const queueMessageForRetry = (message: string, blocks?: any[], attachments?: any[]): void => {
  messageQueue.push({
    message,
    blocks,
    attachments,
    timestamp: Date.now(),
    attempts: 1
  });
  
  // Store the queue in localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('slack_message_queue', JSON.stringify(messageQueue));
    } catch (error) {
      console.error('[SLACK] Error saving message queue to storage:', error);
    }
  }
  
  console.log(`[SLACK] Message queued for retry. Queue size: ${messageQueue.length}`);
};

/**
 * Attempt to send queued messages
 */
export const retryQueuedMessages = async (): Promise<void> => {
  if (messageQueue.length === 0) {
    return;
  }
  
  console.log(`[SLACK] Attempting to retry ${messageQueue.length} queued messages`);
  
  // Create a copy to avoid issues while iterating
  const currentQueue = [...messageQueue];
  
  for (let i = 0; i < currentQueue.length; i++) {
    const queuedMessage = currentQueue[i];
    
    // Skip if too many attempts
    if (queuedMessage.attempts > slackConfig.retryCount) {
      console.log(`[SLACK] Dropping message after ${queuedMessage.attempts} failed attempts`);
      messageQueue.splice(messageQueue.indexOf(queuedMessage), 1);
      continue;
    }
    
    try {
      const result = await sendSlackMessageDirect(
        queuedMessage.message,
        queuedMessage.blocks,
        queuedMessage.attachments
      );
      
      if (result) {
        // Success, remove from queue
        messageQueue.splice(messageQueue.indexOf(queuedMessage), 1);
        console.log('[SLACK] Successfully sent queued message');
      } else {
        // Failed again, increment attempts
        queuedMessage.attempts++;
      }
    } catch (error) {
      // Error occurred, increment attempts
      queuedMessage.attempts++;
      console.error('[SLACK] Error retrying queued message:', error);
    }
  }
  
  // Update storage
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('slack_message_queue', JSON.stringify(messageQueue));
    } catch (error) {
      console.error('[SLACK] Error updating message queue in storage:', error);
    }
  }
  
  console.log(`[SLACK] Retry complete. ${messageQueue.length} messages still in queue`);
};

/**
 * Direct message sending function without queuing logic
 */
const sendSlackMessageDirect = async (
  message: string,
  blocks?: any[],
  attachments?: any[]
): Promise<boolean> => {
  console.log('[SLACK] Attempting to send message:', message);

  if (!slackConfig.enabled) {
    console.log('[SLACK] Integration is disabled');
    return false;
  }
  
  if (!slackConfig.webhookUrl) {
    console.log('[SLACK] Webhook URL is not set');
    return false;
  }
  
  if (slackConfig.webhookUrl === 'YOUR_SLACK_WEBHOOK_URL') {
    console.log('[SLACK] Using default placeholder webhook URL');
    return false;
  }
  
  // We're relaxing this check since the curl command works directly
  // with our test webhook URL which doesn't match this pattern
  if (!slackConfig.webhookUrl.includes('hooks.slack.com')) {
    console.log('[SLACK] Warning: Webhook URL may not be valid:', slackConfig.webhookUrl);
    // Still proceeding to attempt the request
  }

  try {
    const payload = {
      text: message,
      channel: slackConfig.channelId,
      ...(blocks ? { blocks } : {}),
      ...(attachments ? { attachments } : {})
    };

    // Always log the payload for debugging
    console.log('[SLACK] Full payload being sent:', JSON.stringify(payload));
    console.log('[SLACK] To webhook URL:', slackConfig.webhookUrl);

    // Use the server proxy if in browser environment
    if (typeof window !== 'undefined') {
      // Check if we're on production domain 
      const isDomainProduction = window.location.hostname.includes('catnetlogistics.com');
      
      if (isDomainProduction) {
        // When on production domain, use direct webhook approach
        console.log('[SLACK] On production domain, using direct webhook approach');
        
        try {
          // Try direct webhook call first - this bypasses API routes completely
          const directResponse = await fetch(slackConfig.webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            mode: 'no-cors' // Important: Use no-cors mode to avoid CORS issues on production
          });
          
          console.log('[SLACK] Direct webhook response sent in no-cors mode');
          console.log('[SLACK] Response cannot be read due to no-cors, but request was sent');
          return true;
        } catch (directError) {
          console.error('[SLACK] Direct webhook error:', directError);
          
          // Fallback to server proxy if direct call fails
          console.log('[SLACK] Falling back to proxy approach');
        }
      }
      
      // Standard approach for non-production or as fallback
      // Get the base URL from the current window location
      const baseUrl = window.location.origin;
      const apiUrl = `${baseUrl}/api/slack/send`;
      
      console.log('[SLACK] Using browser API endpoint:', apiUrl);
      
      // Use our server-side proxy endpoint
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      // If the API call fails, try the alternative path
      if (!response.ok) {
        console.log('[SLACK] API endpoint failed, trying alternative approaches');
        
        // Try alternative API path
        const altApiUrl = `${baseUrl}/slack/send`;
        console.log('[SLACK] Trying alternative API path:', altApiUrl);
        
        try {
          const altResponse = await fetch(altApiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
          
          if (altResponse.ok) {
            console.log('[SLACK] Alternative API path succeeded');
            return true;
          }
        } catch (altError) {
          console.error('[SLACK] Alternative API error:', altError);
        }
        
        // Last resort - direct webhook call with no-cors
        console.log('[SLACK] All API paths failed, trying direct webhook as last resort');
        
        try {
          await fetch(slackConfig.webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            mode: 'no-cors'
          });
          
          console.log('[SLACK] Direct webhook call sent (no-cors mode)');
          return true;
        } catch (directError) {
          console.error('[SLACK] Direct webhook error:', directError);
          return false;
        }
      }
      
      const responseText = await response.text();
      console.log('[SLACK] API response status:', response.status);
      console.log('[SLACK] API response text:', responseText);
      
      if (!response.ok) {
        console.error('[SLACK] Server proxy error:', responseText);
        return false;
      }
      
      console.log('[SLACK] Message sent successfully via server proxy');
      return true;
    } else {
      // Direct approach for server-side execution
      console.log('[SLACK] Using direct webhook approach (server-side)');
      
      const response = await fetch(slackConfig.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      console.log('[SLACK] Direct webhook response status:', response.status);
      console.log('[SLACK] Direct webhook response text:', responseText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[SLACK] Error sending message:', errorText);
        return false;
      }

      console.log('[SLACK] Message sent successfully');
      return true;
    }
  } catch (error) {
    console.error('[SLACK] Error sending message:', error);
    return false;
  }
};

/**
 * Send a message to Slack with retry logic
 */
export const sendSlackMessage = async (
  message: string,
  blocks?: any[],
  attachments?: any[]
): Promise<boolean> => {
  try {
    const result = await sendSlackMessageDirect(message, blocks, attachments);
    
    if (!result) {
      // If sending failed, queue for retry
      queueMessageForRetry(message, blocks, attachments);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[SLACK] Error in sendSlackMessage:', error);
    // Queue the message for retry
    queueMessageForRetry(message, blocks, attachments);
    return false;
  }
};

// Load queued messages from localStorage on startup
if (typeof window !== 'undefined') {
  try {
    const queuedMessages = localStorage.getItem('slack_message_queue');
    if (queuedMessages) {
      const parsedQueue = JSON.parse(queuedMessages);
      if (Array.isArray(parsedQueue)) {
        parsedQueue.forEach(item => messageQueue.push(item));
        console.log(`[SLACK] Loaded ${messageQueue.length} queued messages from storage`);
        
        // Try to send them
        setTimeout(() => {
          retryQueuedMessages();
        }, 5000); // Wait 5 seconds before attempting to retry
      }
    }
  } catch (error) {
    console.error('[SLACK] Error loading message queue from storage:', error);
  }
}

/**
 * Notify about a new delivery request
 * TODO: Properly type the Slack blocks in a future update
 */
export const notifyNewRequest = async (request: DeliveryRequest): Promise<boolean> => {
  const message = `🆕 New Delivery Request: ${request.id} - ${new Date().toLocaleString()}`;
  
  // Using any[] to avoid TypeScript errors with Slack block structure
  const blocks: any[] = [
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
          url: `${typeof window !== 'undefined' ? `${window.location.origin}/tracking?id=${request.id}` : `/tracking?id=${request.id}`}`,
          action_id: "view_details"
        }
      ]
    }
  ];

  return sendSlackMessage(message, blocks);
};

/**
 * Notify about a delivery status update
 * TODO: Properly type the Slack blocks in a future update
 */
export const notifyStatusUpdate = async (
  request: DeliveryRequest,
  status: string,
  note?: string
): Promise<boolean> => {
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
  
  // Using any[] to avoid TypeScript errors with Slack block structure
  const blocks: any[] = [
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
    }
  ];
  
  // Add tracking ID if available
  if (request.trackingId) {
    blocks.push({
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Tracking ID:*\n${request.trackingId}`
        },
        {
          type: "mrkdwn",
          text: `*Time:*\n${new Date().toLocaleTimeString()}`
        }
      ]
    });
  }
  
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

  return sendSlackMessage(message, blocks);
};

/**
 * Get the current Slack configuration
 */
export const getSlackConfig = (): SlackConfig => {
  return { ...slackConfig };
};

// Export the EventsService function to maintain compatibility
export { deliveryStatusUpdateEvent }; 