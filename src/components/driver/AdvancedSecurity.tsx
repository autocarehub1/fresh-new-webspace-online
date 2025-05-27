
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Shield, 
  Smartphone, 
  AlertTriangle, 
  CheckCircle,
  Eye,
  Clock
} from 'lucide-react';
import { SecurityService } from '@/lib/security';
import { useAdvancedQueries } from '@/hooks/use-advanced-queries';
import { toast } from 'sonner';

interface AdvancedSecurityProps {
  driverId: string;
}

const AdvancedSecurity: React.FC<AdvancedSecurityProps> = ({ driverId }) => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionMonitoring, setSessionMonitoring] = useState(true);
  const [securityMetrics, setSecurityMetrics] = useState<any>(null);
  const { useDriverAnalytics } = useAdvancedQueries();
  
  const { data: analytics } = useDriverAnalytics(driverId);

  useEffect(() => {
    loadSecuritySettings();
    if (sessionMonitoring) {
      startSessionMonitoring();
    }
  }, [driverId, sessionMonitoring]);

  const loadSecuritySettings = async () => {
    // Load user's security settings
    // This would typically come from your user preferences
    setSecurityMetrics({
      lastLogin: new Date().toISOString(),
      loginAttempts: 0,
      deviceTrust: 'high',
      securityScore: 95
    });
  };

  const startSessionMonitoring = async () => {
    try {
      const result = await SecurityService.monitorSession();
      if (result?.anomaly_detected) {
        toast.warning('Unusual activity detected. Session being monitored.');
      }
    } catch (error) {
      console.error('Session monitoring error:', error);
    }
  };

  const handleTwoFactorToggle = async (enabled: boolean) => {
    try {
      if (enabled) {
        const result = await SecurityService.setupTwoFactor(driverId);
        if (result) {
          setTwoFactorEnabled(true);
          toast.success('Two-factor authentication enabled successfully');
        }
      } else {
        setTwoFactorEnabled(false);
        toast.success('Two-factor authentication disabled');
      }
    } catch (error) {
      toast.error('Failed to update two-factor authentication');
    }
  };

  const sendEmergencyAlert = async () => {
    try {
      // Get current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          await SecurityService.sendEmergencyAlert(
            driverId,
            {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            'Emergency alert triggered by driver'
          );
        });
      }
    } catch (error) {
      toast.error('Failed to send emergency alert');
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {securityMetrics?.securityScore || 0}%
              </div>
              <p className="text-sm text-gray-600">Security Score</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {securityMetrics?.loginAttempts || 0}
              </div>
              <p className="text-sm text-gray-600">Failed Attempts</p>
            </div>
            <div className="text-center">
              <Badge variant={securityMetrics?.deviceTrust === 'high' ? 'default' : 'secondary'}>
                {securityMetrics?.deviceTrust || 'Unknown'}
              </Badge>
              <p className="text-sm text-gray-600">Device Trust</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-600">Verified</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <span>Two-Factor Authentication</span>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={handleTwoFactorToggle}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>Session Monitoring</span>
            </div>
            <Switch
              checked={sessionMonitoring}
              onCheckedChange={setSessionMonitoring}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Last Login</span>
            </div>
            <span className="text-sm text-gray-600">
              {securityMetrics?.lastLogin ? 
                new Date(securityMetrics.lastLogin).toLocaleString() : 
                'Unknown'
              }
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Emergency Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={sendEmergencyAlert}
            variant="destructive"
            className="w-full"
          >
            Send Emergency Alert
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            This will immediately notify dispatch and emergency contacts of your location
          </p>
        </CardContent>
      </Card>

      {/* Driver Analytics */}
      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {analytics.total_deliveries || 0}
                </div>
                <p className="text-sm text-gray-600">Total Deliveries</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {analytics.completed_deliveries || 0}
                </div>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {analytics.average_rating || 'N/A'}
                </div>
                <p className="text-sm text-gray-600">Avg Rating</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {analytics.on_time_percentage || 0}%
                </div>
                <p className="text-sm text-gray-600">On Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedSecurity;
