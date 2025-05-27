
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock, Package, Navigation } from 'lucide-react';
import { DeliveryRequest } from '@/types/delivery';
import DeliveryStatusBadge from './DeliveryStatusBadge';
import DeliveryActions from './DeliveryActions';

interface DeliveryCardProps {
  delivery: DeliveryRequest;
  onStatusUpdate: (deliveryId: string, status: string) => void;
  onCompleteDelivery: (deliveryId: string) => void;
}

const DeliveryCard: React.FC<DeliveryCardProps> = ({
  delivery,
  onStatusUpdate,
  onCompleteDelivery
}) => {
  return (
    <Card key={delivery.id} className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            Delivery #{delivery.tracking_id || delivery.id.slice(0, 8)}
          </CardTitle>
          <DeliveryStatusBadge status={delivery.status} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-1 text-green-600" />
            <div>
              <p className="font-medium text-sm">Pickup</p>
              <p className="text-sm text-gray-600">{delivery.pickup_location}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Navigation className="h-4 w-4 mt-1 text-red-600" />
            <div>
              <p className="font-medium text-sm">Delivery</p>
              <p className="text-sm text-gray-600">{delivery.delivery_location}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-600" />
            <span className="text-sm">{delivery.package_type || 'Medical Supplies'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <span className="text-sm">
              Created: {new Date(delivery.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <DeliveryActions
          status={delivery.status}
          onStatusUpdate={(status) => onStatusUpdate(delivery.id, status)}
          onCompleteDelivery={() => onCompleteDelivery(delivery.id)}
        />
      </CardContent>
    </Card>
  );
};

export default DeliveryCard;
