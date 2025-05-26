import { DeliveryRequest } from '@/types/delivery';
import { createTrackingUrl } from '@/utils/tracking';

const SLACK_WEBHOOK_URL = import.meta.env.VITE_SLACK_WEBHOOK_URL;
const SLACK_CHANNEL_ID = import.meta.env.VITE_SLACK_CHANNEL_ID;

interface SlackConfig {
  webhookUrl: string;
  channelId: string;
  enabled: boolean;
}

let slackConfig: SlackConfig = {
  webhookUrl: 'YOUR_SLACK_WEBHOOK_URL',
  channelId: 'YOUR_SLACK_CHANNEL_ID',
  enabled: false,
};

export const configureSlack = (config: Partial<SlackConfig>) => {
  slackConfig = { ...slackConfig, ...config };
};

export const getSlackConfig = (): SlackConfig => {
  return slackConfig;
};

const sendSlackNotification = async (message: string): Promise<boolean> => {
  if (!slackConfig.enabled || slackConfig.webhookUrl === 'YOUR_SLACK_WEBHOOK_URL') {
    console.warn('Slack integration is not configured. Skipping notification.');
    return false;
  }

  try {
    const response = await fetch(slackConfig.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: message,
        channel: slackConfig.channelId,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send Slack notification:', response.status, response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    return false;
  }
};

export const notifyNewRequest = async (delivery: DeliveryRequest): Promise<boolean> => {
  const message = `New delivery request: ${delivery.pickup_location} to ${delivery.delivery_location}`;
  return sendSlackNotification(message);
};

export const notifyStatusUpdate = async (delivery: DeliveryRequest, status: string, note?: string): Promise<boolean> => {
  let message = `Delivery ${delivery.id} status updated to ${status}`;
  if (note) {
    message += ` with note: ${note}`;
  }
  return sendSlackNotification(message);
};

export const sendSlackMessage = async (
  message: string, 
  blocks?: any[], 
  attachments?: any[]
): Promise<boolean> => {
  try {
    console.log('Sending Slack message via enhanced client');
    
    const payload = {
      text: message,
      ...(blocks ? { blocks } : {}),
      ...(attachments ? { attachments } : {})
    };

    const response = await fetch('/api/slack/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error sending Slack message via enhanced client:', error);
    return false;
  }
};
