// Advanced Slack testing script with better error handling
import fetch from 'node-fetch';

// Webhook details from the application
const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';
const SLACK_CHANNEL_ID = 'C08S18NP5JA';

// Create test message
const testMessage = {
  text: `🔍 Verification Test at ${new Date().toLocaleTimeString()}`,
  channel: SLACK_CHANNEL_ID,
  blocks: [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "🚨 Slack Webhook Verification",
        emoji: true
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `This is a verification test message sent at *${new Date().toLocaleString()}*\n\nIf you see this message, the webhook is valid.`
      }
    },
    {
      type: "divider"
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `*Verification ID:* ${Date.now()}`
        }
      ]
    }
  ]
};

async function verifyWebhook() {
  console.log('Starting Slack webhook verification...');
  console.log(`Webhook URL: ${SLACK_WEBHOOK_URL}`);
  console.log(`Channel ID: ${SLACK_CHANNEL_ID}`);
  
  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage),
    });
    
    // Log detailed response information
    console.log('Response status:', response.status);
    console.log('Response headers:', JSON.stringify([...response.headers.entries()]));
    
    const text = await response.text();
    console.log('Response text:', text);
    
    if (text === 'ok') {
      console.log('✅ SUCCESS: Webhook is valid and working!');
      return true;
    } else {
      console.log('❌ ERROR: Webhook validation failed - unexpected response.');
      return false;
    }
  } catch (error) {
    console.error('❌ ERROR during webhook validation:', error);
    
    // Try to provide more details about the error
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('Network error: Cannot reach Slack servers. Check your internet connection.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Connection timed out: Slack servers are not responding.');
    } else if (error.message.includes('certificate')) {
      console.error('SSL error: The connection to Slack is failing due to certificate issues.');
    }
    
    return false;
  }
}

// Run the verification
verifyWebhook()
  .then(isValid => {
    if (isValid) {
      console.log('Webhook verification completed successfully.');
    } else {
      console.error('Webhook verification failed. Check the errors above.');
    }
  })
  .catch(err => {
    console.error('Unhandled error during verification:', err);
  }); 