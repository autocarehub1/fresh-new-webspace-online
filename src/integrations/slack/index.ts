import * as slackClient from './slackClient';
import * as eventsService from '@/services/EventsService';

/**
 * Send notification about a new delivery request to Slack
 * Uses both notification systems for redundancy until one is phased out
 */
export async function notifyNewRequest(request: any) {
  console.log('[SLACK] Sending new request notification via both systems');
  
  // Try both notification systems
  const clientResult = await slackClient.notifyNewRequest(request);
  const eventsResult = await eventsService.newDeliveryRequestEvent(request);
  
  return clientResult || eventsResult;
}

/**
 * Send notification about a status update to Slack
 * Uses both notification systems for redundancy until one is phased out
 */
export async function notifyStatusUpdate(request: any, status: string, note?: string) {
  console.log('[SLACK] Sending status update notification via both systems');
  
  // Try both notification systems
  const clientResult = await slackClient.notifyStatusUpdate(request, status, note);
  const eventsResult = await eventsService.deliveryStatusUpdateEvent(request, status, note);
  
  return clientResult || eventsResult;
}

/**
 * Run a direct test of Slack notifications
 */
export async function testSlackIntegration(testMessage: string) {
  console.log('[SLACK] Running test of Slack integration');
  return eventsService.testSlackDirectly(testMessage);
}

// Re-export configuration functions
export const configureSlack = slackClient.configureSlack;
export const getSlackConfig = slackClient.getSlackConfig;

// Process any queued messages
export const processRetryQueue = () => {
  slackClient.retryQueuedMessages();
  eventsService.processRetryQueue();
};

// Start processing queued messages periodically
if (typeof window !== 'undefined') {
  setInterval(processRetryQueue, 60000); // Process every minute
} 