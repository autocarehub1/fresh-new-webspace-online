
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface HealthCheckItem {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
}

const AppHealthCheck: React.FC = () => {
  const [checks, setChecks] = useState<HealthCheckItem[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show health check in development or if there's an error
    const isDev = import.meta.env.DEV;
    if (isDev) {
      setIsVisible(true);
      performHealthChecks();
    }
  }, []);

  const performHealthChecks = async () => {
    const healthChecks: HealthCheckItem[] = [];

    // Check Supabase connection
    try {
      const { data, error } = await supabase.from('drivers').select('count').limit(1);
      if (error) {
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          healthChecks.push({
            name: 'Database Schema',
            status: 'error',
            message: 'Missing columns in drivers table. Run the migration script.'
          });
        } else {
          healthChecks.push({
            name: 'Supabase Connection',
            status: 'error',
            message: `Database error: ${error.message}`
          });
        }
      } else {
        healthChecks.push({
          name: 'Supabase Connection',
          status: 'success',
          message: 'Connected successfully'
        });
      }
    } catch (err) {
      healthChecks.push({
        name: 'Supabase Connection',
        status: 'error',
        message: `Connection failed: ${err}`
      });
    }

    // Check environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      healthChecks.push({
        name: 'Environment Variables',
        status: 'success',
        message: 'Supabase credentials configured'
      });
    } else {
      healthChecks.push({
        name: 'Environment Variables',
        status: 'warning',
        message: 'Missing Supabase environment variables'
      });
    }

    // Check local storage
    try {
      localStorage.setItem('health-check', 'test');
      localStorage.removeItem('health-check');
      healthChecks.push({
        name: 'Local Storage',
        status: 'success',
        message: 'Working correctly'
      });
    } catch (err) {
      healthChecks.push({
        name: 'Local Storage',
        status: 'error',
        message: 'Not available'
      });
    }

    setChecks(healthChecks);
  };

  const getIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  if (!isVisible || checks.length === 0) {
    return null;
  }

  const hasErrors = checks.some(check => check.status === 'error');
  const hasWarnings = checks.some(check => check.status === 'warning');

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 max-h-96 overflow-y-auto">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            App Health Check
            {hasErrors && <XCircle className="h-4 w-4 text-red-500" />}
            {!hasErrors && hasWarnings && <AlertCircle className="h-4 w-4 text-yellow-500" />}
            {!hasErrors && !hasWarnings && <CheckCircle className="h-4 w-4 text-green-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {checks.map((check, index) => (
            <div key={index} className="flex items-start gap-2 text-xs">
              {getIcon(check.status)}
              <div>
                <div className="font-medium">{check.name}</div>
                <div className="text-gray-600">{check.message}</div>
              </div>
            </div>
          ))}
          <button
            onClick={() => setIsVisible(false)}
            className="text-xs text-gray-500 hover:text-gray-700 mt-2"
          >
            Hide
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppHealthCheck;
