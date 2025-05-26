
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { DeliveryRequest } from '@/types/delivery';

interface OrdersTableProps {
  requests: DeliveryRequest[];
  onRequestSelect?: (request: DeliveryRequest) => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({ requests, onRequestSelect }) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': 
        return 'outline' as const;
      case 'in_progress': 
        return 'default' as const;
      case 'completed': 
        return 'secondary' as const;
      case 'declined':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pickup Location
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Delivery Location
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created At
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.map((request) => (
            <tr key={request.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {request.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={getStatusBadgeVariant(request.status)}>
                  {request.status.replace('_', ' ')}
                </Badge>
                {request.status === 'pending' && 
                 request.tracking_updates?.some(update => 
                   update.status === 'Request Approved'
                 ) && (
                  <Badge variant="outline" className="ml-1 bg-amber-50 text-amber-700 border-amber-200">
                    Awaiting Driver
                  </Badge>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {request.pickup_location}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {request.delivery_location}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(request.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {onRequestSelect && (
                  <button
                    onClick={() => onRequestSelect(request)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View Details
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
