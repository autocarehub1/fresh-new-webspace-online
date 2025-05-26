import { getSlackConfig } from '@/integrations/slack';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Get Slack configuration to check if properly configured
  const slackConfig = getSlackConfig();
  const isSlackConfigured = slackConfig.enabled && 
    slackConfig.webhookUrl && 
    slackConfig.webhookUrl !== 'YOUR_SLACK_WEBHOOK_URL' &&
    slackConfig.channelId;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        {/* ... existing sidebar code ... */}
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Add Slack status banner if not configured */}
        {!isSlackConfigured && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
            <div className="flex items-center">
              <div className="py-1">
                <svg className="h-6 w-6 text-yellow-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-bold">Slack Integration Warning</p>
                <p className="text-sm">Slack notifications may not be working. Please visit the <a href="/admin/slack-test" className="underline">Slack Test Page</a> to troubleshoot.</p>
              </div>
            </div>
          </div>
        )}
        
        {children}
      </div>
    </div>
  );
} 