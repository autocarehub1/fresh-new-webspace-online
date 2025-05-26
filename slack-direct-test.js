import fetch from 'node-fetch';

// Slack webhook URL and channel from your application
const WEBHOOK_URL = 'https://hooks.slack.com/services/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';
const CHANNEL_ID = 'C08S18NP5JA';

// Create a test message
const now = new Date();
const message = {
  text: `🔍 Direct Test at ${now.toLocaleTimeString()}`,
  channel: CHANNEL_ID,
  blocks: [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "🚨 Slack Direct Test",
        emoji: true
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `This is a direct test message sent at *${now.toLocaleString()}*\n\nIf you see this message, your Slack webhook is working correctly!`
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
          text: `*Test ID:* ${Date.now()}`
        }
      ]
    }
  ]
};

console.log('Sending direct message to Slack...');
console.log(`Webhook URL: ${WEBHOOK_URL}`);
console.log(`Channel ID: ${CHANNEL_ID}`);
console.log('Message:', JSON.stringify(message, null, 2).slice(0, 200) + '...');

// Send the message directly to Slack
fetch(WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(message),
})
  .then(response => {
    console.log('Response status:', response.status);
    return response.text();
  })
  .then(text => {
    console.log('Response text:', text);
    if (text === 'ok') {
      console.log('✅ SUCCESS: Message sent to Slack!');
    } else {
      console.log('❌ ERROR: Unexpected response from Slack');
    }
  })
  .catch(error => {
    console.error('❌ ERROR sending to Slack:', error);
  }); 