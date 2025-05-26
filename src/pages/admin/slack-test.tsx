import { useState } from 'react';
import axios from 'axios';
import * as Slack from '@/integrations/slack';
import { testSlackDirectly } from '@/services/EventsService';

export default function SlackTestPage() {
  const [message, setMessage] = useState('Test message from admin panel');
  const [results, setResults] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});

  // Test using the server-side API endpoint
  const testServerProxy = async () => {
    setLoading({ ...loading, serverProxy: true });
    setResults({ ...results, serverProxy: null });
    
    try {
      const response = await axios.post('/api/slack/send', {
        text: `API Route Test: ${message}`,
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "🧪 API Route Test",
              emoji: true
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `Message: *${message}*\nTime: ${new Date().toLocaleString()}`
            }
          }
        ]
      });
      
      setResults({ 
        ...results, 
        serverProxy: { 
          success: true, 
          data: response.data 
        } 
      });
    } catch (error) {
      setResults({ 
        ...results, 
        serverProxy: { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        } 
      });
    } finally {
      setLoading({ ...loading, serverProxy: false });
    }
  };

  // Test using the Events Service directly
  const testEventsService = async () => {
    setLoading({ ...loading, eventsService: true });
    setResults({ ...results, eventsService: null });
    
    try {
      const result = await testSlackDirectly(`Events Service Test: ${message}`);
      setResults({ 
        ...results, 
        eventsService: { 
          success: result 
        } 
      });
    } catch (error) {
      setResults({ 
        ...results, 
        eventsService: { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        } 
      });
    } finally {
      setLoading({ ...loading, eventsService: false });
    }
  };

  // Test using the Slack integration
  const testSlackIntegration = async () => {
    setLoading({ ...loading, slackIntegration: true });
    setResults({ ...results, slackIntegration: null });
    
    try {
      const result = await Slack.testSlackIntegration(`Slack Integration Test: ${message}`);
      setResults({ 
        ...results, 
        slackIntegration: { 
          success: result 
        } 
      });
    } catch (error) {
      setResults({ 
        ...results, 
        slackIntegration: { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        } 
      });
    } finally {
      setLoading({ ...loading, slackIntegration: false });
    }
  };

  // Direct fetch to Slack (for debugging only)
  const testDirectFetch = async () => {
    setLoading({ ...loading, directFetch: true });
    setResults({ ...results, directFetch: null });
    
    const webhookUrl = 'https://hooks.slack.com/services/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';
    const channelId = 'C08S18NP5JA';
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: `Direct Fetch Test: ${message}`,
          channel: channelId
        }),
        mode: 'no-cors' // This is important
      });
      
      setResults({ 
        ...results, 
        directFetch: { 
          success: true,
          info: "Response cannot be read due to no-cors mode, but request was sent"
        } 
      });
    } catch (error) {
      setResults({ 
        ...results, 
        directFetch: { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        } 
      });
    } finally {
      setLoading({ ...loading, directFetch: false });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Slack Integration Test Page</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Test Message
        </label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="border rounded p-4">
          <h2 className="text-lg font-medium mb-2">Server-side API Route Test</h2>
          <p className="text-sm mb-4">Uses the API route to bypass CORS restrictions</p>
          <button
            onClick={testServerProxy}
            disabled={loading.serverProxy}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading.serverProxy ? 'Testing...' : 'Run Test'}
          </button>
          {results.serverProxy && (
            <div className={`mt-4 p-3 rounded ${results.serverProxy.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <pre className="whitespace-pre-wrap text-xs">
                {JSON.stringify(results.serverProxy, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div className="border rounded p-4">
          <h2 className="text-lg font-medium mb-2">Events Service Test</h2>
          <p className="text-sm mb-4">Tests the Events Service notification system</p>
          <button
            onClick={testEventsService}
            disabled={loading.eventsService}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading.eventsService ? 'Testing...' : 'Run Test'}
          </button>
          {results.eventsService && (
            <div className={`mt-4 p-3 rounded ${results.eventsService.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <pre className="whitespace-pre-wrap text-xs">
                {JSON.stringify(results.eventsService, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div className="border rounded p-4">
          <h2 className="text-lg font-medium mb-2">Slack Integration Test</h2>
          <p className="text-sm mb-4">Tests the unified Slack integration module</p>
          <button
            onClick={testSlackIntegration}
            disabled={loading.slackIntegration}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading.slackIntegration ? 'Testing...' : 'Run Test'}
          </button>
          {results.slackIntegration && (
            <div className={`mt-4 p-3 rounded ${results.slackIntegration.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <pre className="whitespace-pre-wrap text-xs">
                {JSON.stringify(results.slackIntegration, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div className="border rounded p-4">
          <h2 className="text-lg font-medium mb-2">Direct Fetch Test (no-cors)</h2>
          <p className="text-sm mb-4">Attempts direct browser fetch with no-cors mode</p>
          <button
            onClick={testDirectFetch}
            disabled={loading.directFetch}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading.directFetch ? 'Testing...' : 'Run Test'}
          </button>
          {results.directFetch && (
            <div className={`mt-4 p-3 rounded ${results.directFetch.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <pre className="whitespace-pre-wrap text-xs">
                {JSON.stringify(results.directFetch, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 bg-gray-50 rounded border">
        <h2 className="text-lg font-medium mb-2">Troubleshooting Info</h2>
        <p className="mb-2">If you're not receiving messages in Slack, try the following:</p>
        <ol className="list-decimal ml-5 space-y-2">
          <li>Check if the webhook URL is valid (our test script suggests it is)</li>
          <li>Verify the channel ID is correct</li>
          <li>Look for error messages in the browser console</li>
          <li>Try the server-side proxy first as it's most reliable</li>
          <li>Check your Slack workspace settings to ensure webhooks are allowed</li>
        </ol>
      </div>
    </div>
  );
} 