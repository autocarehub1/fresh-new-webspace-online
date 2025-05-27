
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface DeliveryStatusBadgeProps {
  status: string;
}

const DeliveryStatusBadge: React.FC<DeliveryStatusBadgeProps> = ({ status }) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'in_progress': return 'default';
      case 'in_transit': return 'default';
      case 'completed': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'in_progress': return 'text-orange-600';
      case 'in_transit': return 'text-purple-600';
      case 'completed': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'in_progress': return 'PICKED UP';
      case 'in_transit': return 'IN TRANSIT';
      case 'completed': return 'COMPLETED';
      case 'pending': return 'PENDING';
      default: return status.replace('_', ' ').toUpperCase();
    }
  };

  return (
    <Badge variant={getStatusBadgeVariant(status)} className={getStatusColor(status)}>
      {getStatusDisplay(status)}
    </Badge>
  );
};

export default DeliveryStatusBadge;
