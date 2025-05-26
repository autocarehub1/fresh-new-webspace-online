import { useState } from 'react';
import * as Slack from '@/integrations/slack';

export default function SlackTester() {
  const [message, setMessage] = useState('Test message');
  const [status, setStatus] = useState<{
    loading: boolean;
    success?: boolean;
    error?: string;
  }>({ loading: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true });

    try {
      const result = await Slack.testSlackIntegration(message);
      setStatus({ 
        loading: false, 
        success: result
      });
    } catch (error) {
      setStatus({ 
        loading: false, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-lg font-medium mb-4">Slack Integration Tester</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="message" className="block text-sm font-medium">
            Test Message
          </label>
          <input
            id="message"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 block w-full rounded-md border p-2"
          />
        </div>
        
        <button
          type="submit"
          disabled={status.loading}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {status.loading ? 'Sending...' : 'Send Test Message'}
        </button>
      </form>
      
      {status.success === true && (
        <div className="mt-4 p-2 bg-green-100 text-green-800 rounded">
          Message sent successfully!
        </div>
      )}
      
      {status.success === false && (
        <div className="mt-4 p-2 bg-red-100 text-red-800 rounded">
          Error: {status.error || 'Failed to send message'}
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-500">
        <p>This tester uses both mechanisms:</p>
        <ul className="list-disc pl-5">
          <li>Server-side proxy via API route</li>
          <li>Direct message delivery with fallback mechanisms</li>
        </ul>
      </div>
    </div>
  );
} 