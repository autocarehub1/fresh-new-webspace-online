import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5050', 'https://catnetlogistics.com', 'https://www.catnetlogistics.com'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Slack webhook URL and channel ID
const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';
const SLACK_CHANNEL_ID = 'C08S18NP5JA';

// Create a handler function for Slack notifications
const handleSlackNotification = async (req, res) => {
  try {
    console.log('[SERVER] Received Slack notification request');
    const { text, blocks, attachments } = req.body;

    if (!text) {
      console.log('[SERVER] Missing required text field');
      return res.status(400).json({ success: false, error: 'Message text is required' });
    }

    // Prepare payload
    const payload = {
      text,
      channel: SLACK_CHANNEL_ID,
      ...(blocks ? { blocks } : {}),
      ...(attachments ? { attachments } : {})
    };

    console.log('[SERVER] Sending payload to Slack:', JSON.stringify(payload).substring(0, 200) + '...');
    console.log('[SERVER] Using webhook URL:', SLACK_WEBHOOK_URL);

    // Send to Slack with axios
    const response = await axios.post(SLACK_WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('[SERVER] Slack response:', response.status, response.data);

    // Return success
    return res.status(200).json({
      success: true,
      message: 'Message sent to Slack successfully',
      data: response.data
    });
  } catch (error) {
    console.error('[SERVER] Error sending Slack notification:', error);

    return res.status(500).json({
      success: false,
      error: error.message,
      details: error.response ? error.response.data : 'No response details available'
    });
  }
};

// Slack notification endpoints - support both paths for compatibility
app.post('/api/slack/send', handleSlackNotification);
app.post('/slack/send', handleSlackNotification);

// Request endpoint (stub)
app.post('/api/requests', (req, res) => {
  console.log('[SERVER] Received request submission:', req.body.id);
  
  // In a real implementation, this would save to a database
  return res.status(200).json({
    success: true,
    message: 'Request received',
    data: { id: req.body.id }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 