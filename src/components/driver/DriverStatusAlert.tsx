
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';

interface DriverStatusAlertProps {
  status: string;
}

const DriverStatusAlert: React.FC<DriverStatusAlertProps> = ({ status }) => {
  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your driver application is pending admin approval.';
      case 'inactive':
        return 'Your driver account is currently inactive. Please contact admin.';
      case 'suspended':
        return 'Your driver account has been suspended. Please contact admin.';
      default:
        return 'Please contact admin for account status information.';
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700">
          <Bell className="h-5 w-5" />
          Driver Status: {status}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-orange-600">
            {getStatusMessage(status)}
          </p>
          <Badge variant="outline" className="border-orange-300 text-orange-700">
            Status: {status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default DriverStatusAlert;
