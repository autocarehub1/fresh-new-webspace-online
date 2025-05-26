import React, { useState } from 'react';

const SlackDebugger = () => {
  const [isSending, setIsSending] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  
  const webhookUrl = 'https://hooks.slack.com/services/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';
  const channelId = 'C08S18NP5JA';
  
  const sendDirectMessage = async () => {
    setIsSending(true);
    setResponse(null);
    setError(null);
    
    const requestId = `REQ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const trackingId = `TRK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    try {
      const testMessage = {
        text: `🔧 Debug Test: ${requestId}`,
        channel: channelId,
        blocks: [
          {
            "type": "header",
            "text": {
              "type": "plain_text", 
              "text": "🔧 Debug Test Message",
              "emoji": true
            }
          },
          {
            "type": "section",
            "fields": [
              {
                "type": "mrkdwn",
                "text": `*Request ID:*\n${requestId}`
              },
              {
                "type": "mrkdwn",
                "text": `*Tracking ID:*\n${trackingId}`
              }
            ]
          },
          {
            "type": "section",
            "fields": [
              {
                "type": "mrkdwn",
                "text": `*Pickup:*\nDebug Test Hospital`
              },
              {
                "type": "mrkdwn",
                "text": `*Delivery:*\nDebug Test Clinic`
              }
            ]
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "This is a direct debug test from the SlackDebugger component."
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
      
      console.log('Sending direct debug message to Slack');
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testMessage)
      });
      
      const text = await response.text();
      
      if (response.ok) {
        setResponse(`Success! Response: ${text}`);
        console.log('Debug message sent successfully');
      } else {
        setError(`Error: ${response.status} - ${text}`);
        console.error('Error sending debug message:', text);
      }
    } catch (err) {
      setError(`Exception: ${err.message}`);
      console.error('Exception sending debug message:', err);
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="p-4 border rounded-md">
      <h3 className="text-lg font-bold mb-4">Slack Debugger</h3>
      
      <button 
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        onClick={sendDirectMessage}
        disabled={isSending}
      >
        {isSending ? 'Sending...' : 'Send Test Message'}
      </button>
      
      {response && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
          {response}
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default SlackDebugger; 