// Direct Slack webhook test using Node.js and axios
import axios from 'axios';

async function testSlackEndpoint() {
  console.log('Testing direct Slack endpoint access...');
  
  try {
    // First, test without the origin in URL
    console.log('\nTesting with relative URL...');
    try {
      const relativeResponse = await axios.post('/api/slack/send', {
        text: '🧪 TEST: Relative URL'
      });
      console.log('Relative URL response:', relativeResponse.data);
    } catch (relativeError) {
      console.error('Relative URL failed:', relativeError.message);
    }
    
    // Now test with explicit origin
    console.log('\nTesting with explicit origin URL...');
    const originUrl = 'http://localhost:8080';
    const fullUrl = `${originUrl}/api/slack/send`;
    
    console.log(`Making request to: ${fullUrl}`);
    
    const response = await axios.post(fullUrl, {
      text: '🧪 TEST: Explicit Origin URL',
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "🧪 Test Message with Origin",
            emoji: true
          }
        }
      ]
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error testing Slack endpoint:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return { success: false, error: error.message };
  }
}

testSlackEndpoint()
  .then(result => {
    console.log('\nTest completed with result:', result.success ? 'SUCCESS' : 'FAILURE');
  })
  .catch(err => {
    console.error('\nTest failed with exception:', err);
  }); 