// Simple script to test Slack webhook
async function testSlack() {
  const webhookUrl = 'https://hooks.slack.com/services/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';
  const channelId = 'C08S18NP5JA';
  
  console.log('Testing Slack webhook...');
  
  const testMessage = {
    text: "🧪 Test message from Express Medical Dispatch",
    blocks: [
      {
        "type": "header",
        "text": {
          "type": "plain_text",
          "text": "🧪 Test Notification",
          "emoji": true
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "This is a test message from the *Catalyst Network Logistics* system. If you're seeing this, your Slack integration is working correctly!"
        }
      },
      {
        "type": "context",
        "elements": [
          {
            "type": "mrkdwn",
            "text": "Sent from Catalyst Network Logistics Test Script"
          }
        ]
      }
    ]
  };
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testMessage)
    });
    
    const text = await response.text();
    
    if (response.ok) {
      console.log('✅ Success! Message sent to Slack.');
      console.log('Response:', text);
    } else {
      console.error('❌ Error sending message to Slack:', text);
    }
  } catch (error) {
    console.error('❌ Error sending message to Slack:', error);
  }
}

// Run the test when script is loaded
testSlack(); 