
import React from 'react';
import { Button } from '@/components/ui/button';
import { Truck, ArrowRight, Camera } from 'lucide-react';

interface DeliveryActionsProps {
  status: string;
  onStatusUpdate: (status: string) => void;
  onCompleteDelivery: () => void;
}

const DeliveryActions: React.FC<DeliveryActionsProps> = ({
  status,
  onStatusUpdate,
  onCompleteDelivery
}) => {
  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {status === 'pending' && (
        <Button 
          onClick={() => onStatusUpdate('in_progress')}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          Start Delivery
        </Button>
      )}
      
      {status === 'in_progress' && (
        <Button 
          onClick={() => onStatusUpdate('in_transit')}
          size="sm"
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Truck className="h-4 w-4 mr-2" />
          Mark In Transit
        </Button>
      )}
      
      {status === 'in_transit' && (
        <Button 
          onClick={onCompleteDelivery}
          size="sm"
          className="bg-green-600 hover:bg-green-700"
        >
          <Camera className="h-4 w-4 mr-2" />
          Complete with Photo
        </Button>
      )}
    </div>
  );
};

export default DeliveryActions;
