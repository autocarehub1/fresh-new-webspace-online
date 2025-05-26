import axios from 'axios';

// Create a sample delivery request
const testRequest = {
  pickup_location: "Test Hospital",
  delivery_location: "Test Pharmacy",
  packageType: "Medication",
  priority: "urgent",
  email: "test@example.com",
  phone: "555-123-4567",
  notes: "This is a test request created via script",
  id: `TEST-${Date.now()}`,
  status: "new",
  created_at: new Date().toISOString()
};

async function createTestRequest() {
  console.log("Creating test delivery request...");
  console.log(testRequest);
  
  try {
    // First test the Slack notification directly
    console.log("\nTesting Slack notification directly...");
    const slackResponse = await axios.post('http://localhost:8080/api/slack/send', {
      text: `🧪 TEST REQUEST: ${testRequest.id}`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "🧪 Test Delivery Request",
            emoji: true
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Request ID:*\n${testRequest.id}`
            },
            {
              type: "mrkdwn",
              text: `*Priority:*\n${testRequest.priority}`
            }
          ]
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Pickup:*\n${testRequest.pickup_location}`
            },
            {
              type: "mrkdwn",
              text: `*Delivery:*\n${testRequest.delivery_location}`
            }
          ]
        }
      ]
    });
    
    console.log("Slack notification result:", slackResponse.data);
    
    // Now create the actual request via the API
    // Note: Adjust the URL if your API endpoint is different
    console.log("\nSubmitting request to API...");
    const response = await axios.post('http://localhost:8080/api/requests', testRequest);
    
    console.log("Request created successfully!");
    console.log(response.data);
    
    return true;
  } catch (error) {
    console.error("Error creating test request:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
    return false;
  }
}

// Run the test
createTestRequest()
  .then(result => {
    console.log("\nTest completed:", result ? "SUCCESS" : "FAILED");
  })
  .catch(err => {
    console.error("Unhandled error:", err);
  }); 