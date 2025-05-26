import axios from 'axios';

// Test both the direct Slack webhook and the API proxy
async function testApiEndpoints() {
  console.log('Testing API endpoints...');

  // 1. Test health endpoint
  try {
    console.log('\nTesting health endpoint...');
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('Health endpoint response:', healthResponse.data);
  } catch (healthError) {
    console.error('Health endpoint error:', healthError.message);
  }

  // 2. Test direct Slack webhook
  try {
    console.log('\nTesting direct Slack webhook...');
    const webhookResponse = await axios.post(
      'https://hooks.slack.com/services/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',
      {
        text: '🧪 API Test: Direct Webhook',
        channel: 'C08S18NP5JA'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Direct webhook status:', webhookResponse.status);
    console.log('Direct webhook response:', webhookResponse.data);
  } catch (webhookError) {
    console.error('Direct webhook error:', webhookError.message);
  }

  // 3. Test API proxy endpoint
  try {
    console.log('\nTesting API proxy endpoint...');
    const apiProxyResponse = await axios.post(
      'http://localhost:3001/api/slack/send',
      {
        text: '🧪 API Test: Server API Endpoint',
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "🧪 Test via API Server",
              emoji: true
            }
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('API proxy status:', apiProxyResponse.status);
    console.log('API proxy response:', apiProxyResponse.data);
    return apiProxyResponse.data;
  } catch (apiProxyError) {
    console.error('API proxy error:', apiProxyError.message);
    if (apiProxyError.response) {
      console.error('Response status:', apiProxyError.response.status);
      console.error('Response data:', apiProxyError.response.data);
    }
  }
}

testApiEndpoints()
  .then(() => console.log('\nAPI testing completed'))
  .catch(error => console.error('\nUnhandled error during API testing:', error)); 