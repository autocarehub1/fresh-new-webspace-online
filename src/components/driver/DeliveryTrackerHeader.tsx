
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface DeliveryTrackerHeaderProps {
  driverStatus: string;
}

const DeliveryTrackerHeader: React.FC<DeliveryTrackerHeaderProps> = ({ driverStatus }) => {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold">Active Deliveries</h3>
      <Badge variant="default" className="bg-green-600">
        Status: Active
      </Badge>
    </div>
  );
};

export default DeliveryTrackerHeader;
