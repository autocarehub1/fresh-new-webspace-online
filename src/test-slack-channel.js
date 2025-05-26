// Script to test Slack webhook with explicit channel
async function testSlackWithChannel() {
  const webhookUrl = 'https://hooks.slack.com/services/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';
  const channelId = 'C08S18NP5JA';
  
  console.log('Testing Slack webhook with explicit channel ID...');
  
  const testMessage = {
    text: "🧪 Test message with explicit channel parameter",
    channel: channelId,
    blocks: [
      {
        "type": "header",
        "text": {
          "type": "plain_text",
          "text": "🧪 Test with Channel ID",
          "emoji": true
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "This message tests using an explicit channel parameter to ensure notifications go to the right place."
        }
      },
      {
        "type": "context",
        "elements": [
          {
            "type": "mrkdwn",
            "text": "Sent: " + new Date().toLocaleString()
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
      console.log('✅ Success! Message sent to Slack with channel ID:', channelId);
      console.log('Response:', text);
    } else {
      console.error('❌ Error sending message to Slack:', text);
    }
  } catch (error) {
    console.error('❌ Error sending message to Slack:', error);
  }
}

// Run the test when script is loaded
testSlackWithChannel(); 