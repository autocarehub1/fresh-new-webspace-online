import { DeliveryRequest } from '@/types/delivery';
import { 
  configureSlack, 
  notifyNewRequest, 
  notifyStatusUpdate, 
  getSlackConfig,
  sendSlackMessage
} from '@/integrations/slack/slackClient';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

export const useSlackNotification = () => {
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  
  // Check if Slack is configured on hook initialization
  useEffect(() => {
    try {
      const config = getSlackConfig();
      setIsConfigured(
        config.enabled && 
        config.webhookUrl !== 'YOUR_SLACK_WEBHOOK_URL' && 
        config.webhookUrl.startsWith('https://hooks.slack.com/services/')
      );
    } catch (error) {
      console.error('Error checking Slack configuration:', error);
      setIsConfigured(false);
    }
  }, []);

  /**
   * Configure Slack integration
   */
  const configureSlackIntegration = (webhookUrl: string, channelId?: string, enabled: boolean = true) => {
    try {
      configureSlack({
        webhookUrl,
        channelId: channelId || '',
        enabled
      });
      
      setIsConfigured(true);
      toast.success('Slack integration configured successfully');
      return true;
    } catch (error) {
      console.error('Failed to configure Slack:', error);
      toast.error('Failed to configure Slack integration');
      return false;
    }
  };

  /**
   * Send new request notification
   */
  const sendNewRequestNotification = async (request: DeliveryRequest) => {
    if (!isConfigured) {
      console.warn('Slack not configured. Skipping notification.');
      return false;
    }
    
    try {
      const result = await notifyNewRequest(request);
      
      if (result) {
        console.log('New request notification sent to Slack');
      } else {
        console.warn('Failed to send notification to Slack');
      }
      
      return result;
    } catch (error) {
      console.error('Error sending request notification to Slack:', error);
      return false;
    }
  };

  /**
   * Send status update notification
   */
  const sendStatusUpdateNotification = async (request: DeliveryRequest, status: string, note?: string) => {
    if (!isConfigured) {
      console.warn('Slack not configured. Skipping notification.');
      return false;
    }
    
    try {
      const result = await notifyStatusUpdate(request, status, note);
      
      if (result) {
        console.log('Status update notification sent to Slack');
      } else {
        console.warn('Failed to send status update to Slack');
      }
      
      return result;
    } catch (error) {
      console.error('Error sending status notification to Slack:', error);
      return false;
    }
  };

  /**
   * Send delivery exception notification
   */
  const sendExceptionNotification = async (request: DeliveryRequest, exceptionType: string, reason: string) => {
    if (!isConfigured) {
      console.warn('Slack not configured. Skipping notification.');
      return false;
    }
    
    try {
      const message = `⚠️ Delivery Exception: ${request.id} - ${exceptionType}`;
      
      const blocks: any[] = [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "⚠️ Delivery Exception",
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
              text: `*Exception Type:*\n${exceptionType}`
            }
          ]
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Reason:*\n${reason}`
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
      
      const result = await sendSlackMessage(message, blocks);
      
      if (result) {
        console.log('Exception notification sent to Slack');
      } else {
        console.warn('Failed to send exception notification to Slack');
      }
      
      return result;
    } catch (error) {
      console.error('Error sending exception notification to Slack:', error);
      return false;
    }
  };

  /**
   * Send delivery delay notification
   */
  const sendDelayNotification = async (request: DeliveryRequest, delay: number, reason: string) => {
    if (!isConfigured) {
      console.warn('Slack not configured. Skipping notification.');
      return false;
    }
    
    try {
      const delayText = delay > 60 ? `${Math.floor(delay / 60)} hours ${delay % 60} minutes` : `${delay} minutes`;
      const message = `⏰ Delivery Delayed: ${request.id} - ${delayText}`;
      
      const blocks: any[] = [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "⏰ Delivery Delayed",
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
              text: `*Delay:*\n${delayText}`
            }
          ]
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Reason:*\n${reason}`
          }
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
      
      const result = await sendSlackMessage(message, blocks);
      
      if (result) {
        console.log('Delay notification sent to Slack');
      } else {
        console.warn('Failed to send delay notification to Slack');
      }
      
      return result;
    } catch (error) {
      console.error('Error sending delay notification to Slack:', error);
      return false;
    }
  };

  /**
   * Send weekly summary notification
   */
  const sendWeeklySummary = async (
    startDate: Date, 
    endDate: Date, 
    metrics: { 
      total: number, 
      completed: number, 
      delayed: number, 
      avgTime: number,
      topPickups: { location: string, count: number }[]
    }
  ) => {
    if (!isConfigured) {
      console.warn('Slack not configured. Skipping notification.');
      return false;
    }
    
    try {
      const dateFormat = new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
      
      const message = `📊 Weekly Delivery Summary: ${dateFormat.format(startDate)} - ${dateFormat.format(endDate)}`;
      
      // Format top pickup locations as bullet points
      const topPickupsText = metrics.topPickups
        .map(pickup => `• ${pickup.location}: ${pickup.count} deliveries`)
        .join('\n');
      
      const blocks: any[] = [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "📊 Weekly Delivery Summary",
            emoji: true
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Period:* ${dateFormat.format(startDate)} - ${dateFormat.format(endDate)}`
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Total Requests:*\n${metrics.total}`
            },
            {
              type: "mrkdwn",
              text: `*Completed:*\n${metrics.completed} (${Math.round(metrics.completed / metrics.total * 100)}%)`
            }
          ]
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Delayed Deliveries:*\n${metrics.delayed} (${Math.round(metrics.delayed / metrics.total * 100)}%)`
            },
            {
              type: "mrkdwn",
              text: `*Avg Delivery Time:*\n${Math.floor(metrics.avgTime / 60)}h ${metrics.avgTime % 60}m`
            }
          ]
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Top Pickup Locations:*\n${topPickupsText}`
          }
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "View Full Report",
                emoji: true
              },
              url: `${typeof window !== 'undefined' ? `${window.location.origin}/admin/reports` : `/admin/reports`}`,
              action_id: "view_report"
            }
          ]
        }
      ];
      
      const result = await sendSlackMessage(message, blocks);
      
      if (result) {
        console.log('Weekly summary sent to Slack');
      } else {
        console.warn('Failed to send weekly summary to Slack');
      }
      
      return result;
    } catch (error) {
      console.error('Error sending weekly summary to Slack:', error);
      return false;
    }
  };
  
  return {
    isConfigured,
    configureSlackIntegration,
    sendNewRequestNotification,
    sendStatusUpdateNotification,
    sendExceptionNotification,
    sendDelayNotification,
    sendWeeklySummary
  };
}; 