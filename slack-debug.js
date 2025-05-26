// Simple Node.js script to test Slack webhook directly
import https from 'https';

// Slack webhook URL and channel ID from your code
const webhookUrl = 'https://hooks.slack.com/services/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';
const channelId = 'C08S18NP5JA';

// Create a simple message payload
const payload = {
  text: "🔎 Direct Debug Test from Node.js Script",
  channel: channelId,
  blocks: [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "🔎 Debug Test Message",
        "emoji": true
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "This is a direct debug test message sent outside the app.\n*Time:* " + new Date().toLocaleString()
      }
    }
  ]
};

// Parse the webhook URL to extract hostname and path
const webhookUrlObj = new URL(webhookUrl);

// Options for the HTTP request
const options = {
  hostname: webhookUrlObj.hostname,
  path: webhookUrlObj.pathname + webhookUrlObj.search,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(JSON.stringify(payload))
  }
};

console.log('Sending test message to Slack...');
console.log('Webhook URL:', webhookUrl);
console.log('Channel ID:', channelId);

// Send the request
const req = https.request(options, (res) => {
  console.log('Status code:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    
    if (res.statusCode === 200) {
      console.log('✅ Message sent successfully to Slack!');
    } else {
      console.log('❌ Failed to send message to Slack.');
    }
  });
});

req.on('error', (error) => {
  console.error('Error sending request:', error);
});

// Write payload to request
req.write(JSON.stringify(payload));
req.end();

console.log('Request sent, awaiting response...'); 