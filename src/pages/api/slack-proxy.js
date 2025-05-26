// Server-side Slack message proxy endpoint
import axios from 'axios';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, blocks } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const webhookUrl = 'https://hooks.slack.com/services/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';
    const channelId = 'C08S18NP5JA';
    
    // Prepare the payload
    const payload = {
      text: message,
      channel: channelId,
      ...(blocks ? { blocks } : {})
    };
    
    // Send to Slack
    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Return success
    return res.status(200).json({
      success: true,
      status: response.status,
      data: response.data
    });
  } catch (error) {
    console.error('Error proxying message to Slack:', error);
    
    // Return error response
    return res.status(500).json({
      success: false,
      error: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : null
    });
  }
} 