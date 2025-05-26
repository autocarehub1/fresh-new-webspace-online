
// Simple API route for Slack webhook proxy
export default async function handler(req: any, res: any) {
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

  try {
    console.log('[SLACK-API] Received request to send message');
    const { text, blocks, attachments } = req.body;

    if (!text) {
      console.log('[SLACK-API] Missing required text field');
      return res.status(400).json({ success: false, error: 'Message text is required' });
    }

    // Environment variables or hardcoded values
    const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';
    const SLACK_CHANNEL_ID = 'C08S18NP5JA';

    // Prepare payload
    const payload = {
      text,
      channel: SLACK_CHANNEL_ID,
      ...(blocks ? { blocks } : {}),
      ...(attachments ? { attachments } : {})
    };

    console.log('[SLACK-API] Sending payload to Slack');

    // Use fetch for the webhook call
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log('[SLACK-API] Response status:', response.status);

    if (!response.ok) {
      throw new Error(`Slack API responded with status ${response.status}: ${responseText}`);
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Message sent to Slack successfully'
    });
  } catch (error) {
    console.error('[SLACK-API] Error sending Slack message:', error);
    
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}
