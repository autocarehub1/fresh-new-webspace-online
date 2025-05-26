// Script to test the API route for sending Slack notifications
import axios from 'axios';

// Base URL for local development server
const API_BASE_URL = 'http://localhost:5050';

// Message data to send
const messageData = {
  text: `API Route Test at ${new Date().toLocaleTimeString()}`,
  blocks: [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "🔧 API Route Test",
        emoji: true
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `This test message was sent through the API route at *${new Date().toLocaleString()}*`
      }
    }
  ]
};

async function testApiRoute() {
  console.log('Testing Slack API route...');
  console.log(`API Endpoint: ${API_BASE_URL}/api/slack/send`);
  console.log('Message data:', JSON.stringify(messageData, null, 2));
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/slack/send`, messageData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API route response:', response.status, response.statusText);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Error calling API route:');
    
    if (error.response) {
      // The server responded with an error status
      console.error('Server response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response received
      console.error('No response received. The server might be down or the port incorrect.');
      console.error('Request details:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message);
    }
    
    return false;
  }
}

// Run the test
testApiRoute()
  .then(success => {
    if (success) {
      console.log('API route test completed successfully.');
    } else {
      console.error('API route test failed. Check the errors above.');
    }
  })
  .catch(err => {
    console.error('Unhandled error during test:', err);
  }); 