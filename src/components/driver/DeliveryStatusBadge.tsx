
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
      case 'picked_up': return 'outline';
      case 'in_transit': return 'default';
      case 'completed': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'in_progress': return 'text-blue-600';
      case 'picked_up': return 'text-orange-600';
      case 'in_transit': return 'text-purple-600';
      case 'completed': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Badge variant={getStatusBadgeVariant(status)} className={getStatusColor(status)}>
      {status.replace('_', ' ').toUpperCase()}
    </Badge>
  );
};

export default DeliveryStatusBadge;
