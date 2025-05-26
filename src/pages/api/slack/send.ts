import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

type ResponseData = {
  success: boolean;
  message?: string;
  error?: string;
  debug?: any;
}

// Environment variables or hardcoded values (less secure)
const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';
const SLACK_CHANNEL_ID = 'C08S18NP5JA';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Add CORS headers for cross-domain access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Log request headers for debugging
  console.log('[SLACK-API] Request headers:', JSON.stringify({
    ...req.headers,
    // Don't log cookies or auth headers for security
    cookie: req.headers.cookie ? '[REDACTED]' : undefined,
    authorization: req.headers.authorization ? '[REDACTED]' : undefined
  }));

  try {
    console.log('[SLACK-API] Received request to send message');
    const { text, blocks, attachments } = req.body;

    if (!text) {
      console.log('[SLACK-API] Missing required text field');
      return res.status(400).json({ success: false, error: 'Message text is required' });
    }

    // Log the origin for debugging
    console.log('[SLACK-API] Request origin:', req.headers.origin || 'Unknown');

    // Prepare payload
    const payload = {
      text,
      channel: SLACK_CHANNEL_ID,
      ...(blocks ? { blocks } : {}),
      ...(attachments ? { attachments } : {})
    };

    console.log('[SLACK-API] Sending payload to Slack:', JSON.stringify(payload).substring(0, 200) + '...');
    console.log('[SLACK-API] Using webhook URL:', SLACK_WEBHOOK_URL);

    // First try using axios for better error handling
    try {
      const axiosResponse = await axios.post(SLACK_WEBHOOK_URL, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('[SLACK-API] Axios response status:', axiosResponse.status);
      console.log('[SLACK-API] Axios response data:', axiosResponse.data);
      
      // Return success to client
      return res.status(200).json({ 
        success: true, 
        message: 'Message sent to Slack successfully via axios',
        debug: {
          status: axiosResponse.status,
          data: axiosResponse.data
        }
      });
    } catch (axiosError) {
      console.error('[SLACK-API] Axios attempt failed, trying fetch as fallback:', axiosError);
      
      // Fallback to fetch approach
      const response = await fetch(SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      console.log('[SLACK-API] Fetch response status:', response.status);
      console.log('[SLACK-API] Fetch response text:', responseText);

      if (!response.ok) {
        throw new Error(`Slack API responded with status ${response.status}: ${responseText}`);
      }

      // Return success to client
      return res.status(200).json({ 
        success: true, 
        message: 'Message sent to Slack successfully via fetch',
        debug: {
          status: response.status,
          data: responseText
        }
      });
    }
  } catch (error) {
    console.error('[SLACK-API] Error sending Slack message:', error);
    
    // Return error to client with more details
    const errorResponse: ResponseData = { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };

    // Add axios error details if available
    if (axios.isAxiosError(error) && error.response) {
      errorResponse.debug = {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      };
      console.error('[SLACK-API] Axios error details:', errorResponse.debug);
    }

    return res.status(500).json(errorResponse);
  }
} 